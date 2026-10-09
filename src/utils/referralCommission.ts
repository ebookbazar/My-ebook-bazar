import { ref, get, set, update, runTransaction, push } from 'firebase/database';
import { isEbookAdminOwned } from './ebookOwnership';

export interface AwardReferralResult {
  success: boolean;
  reason?: string;
  amount: number;
  referrerUid?: string;
  duplicate?: boolean;
}

/**
 * Universal Referral Commission Processor
 * 
 * FINAL BUSINESS RULE:
 * 1. Admin eBook:
 *    - Valid Referral Code used + Successful Purchase => Referral Owner gets +৳50 BDT.
 * 2. Seller eBook:
 *    - Referral Owner gets +৳0 (Referral Commission strictly disabled for Seller eBooks).
 *    - No referral transaction is created. Seller gets ebook sale earning.
 * 3. Duplicate Protection:
 *    - Strict duplicate protection using transaction key `${orderKey}_EBOOK_REFERRAL`.
 *    - Awarded only ONCE per order.
 */
export async function awardReferralCommission({
  orderKey,
  orderData,
  db,
  matchedBook
}: {
  orderKey: string;
  orderData: any;
  db: any;
  matchedBook?: any;
}): Promise<AwardReferralResult> {
  if (!orderKey || !orderData || !db) {
    return { success: false, reason: 'MISSING_PARAMS', amount: 0 };
  }

  // 1. Verify eBook Ownership: Must be Admin eBook
  const isAdminBook = isEbookAdminOwned(orderData, matchedBook);
  const isSellerBook = !isAdminBook;

  const rawRefCode = (orderData.referralCode || '').trim();
  const hasRefCode = Boolean(rawRefCode);
  const cleanRefCode = rawRefCode.toUpperCase();

  // Rule 2: Seller eBook -> Strictly 0 BDT referral commission
  if (isSellerBook) {
    try {
      await update(ref(db, `orders/${orderKey}`), {
        commissionAwarded: false,
        commissionAmount: 0,
        commissionText: hasRefCode 
          ? 'সেলার ই-বুক (রেফারেল কমিশন প্রযোজ্য নয়: ৳০)' 
          : 'রেফারেল কোড ছাড়া ক্রয়',
        commissionNote: hasRefCode 
          ? `সেলার ই-বুকে কোনো রেফারেল কমিশন নেই (৳০)। সেলার ওয়ালেটে বিক্রয় আয় জমা হয়েছে।` 
          : 'সেলার ই-বুক: সেলার ওয়ালেটে বিক্রয় আয় জমা হয়েছে।',
        commissionProcessed: true
      });
    } catch (_) {}
    return { success: false, reason: 'SELLER_EBOOK_NO_COMMISSION', amount: 0 };
  }

  // Rule 1: Admin eBook without referral code -> 0 BDT
  if (!hasRefCode) {
    try {
      await update(ref(db, `orders/${orderKey}`), {
        commissionAwarded: false,
        commissionAmount: 0,
        commissionText: 'রেফারেল কোড ছাড়া ক্রয়',
        commissionNote: 'অ্যাডমিন ই-বুক: কোনো রেফারেল কোড ব্যবহার করা হয়নি',
        commissionProcessed: true
      });
    } catch (_) {}
    return { success: false, reason: 'NO_REFERRAL_CODE', amount: 0 };
  }

  // Self-referral protection: Buyer cannot earn commission using their own referral code
  const buyerId = orderData.buyerId || orderData.uid || orderData.userId;

  // Rule 3: Duplicate Protection
  // Keys for transaction deduplication
  const primaryTxKey = `${orderData.orderId || orderKey}_EBOOK_REFERRAL`;
  const altTxKey = `${orderKey}_EBOOK_REFERRAL`;

  try {
    const txSnap1 = await get(ref(db, `affiliateTransactions/${primaryTxKey}`)).catch(() => null);
    const txSnap2 = primaryTxKey !== altTxKey 
      ? await get(ref(db, `affiliateTransactions/${altTxKey}`)).catch(() => null) 
      : null;

    if ((txSnap1 && txSnap1.exists()) || (txSnap2 && txSnap2.exists())) {
      // Already awarded - prevent duplicate
      try {
        await update(ref(db, `orders/${orderKey}`), {
          commissionAwarded: true,
          commissionAmount: 50,
          commissionProcessed: true
        });
      } catch (_) {}
      return { success: false, reason: 'ALREADY_PROCESSED', amount: 50, duplicate: true };
    }
  } catch (dupErr) {
    console.warn('Duplicate check notice:', dupErr);
  }

  // Find Referral Code Owner across indexes and nodes
  let referrerUid: string | null = null;
  let referrerProfile: any = null;

  // 1. Direct index lookup in referralCodes/${cleanRefCode}
  try {
    const rcSnap = await get(ref(db, `referralCodes/${cleanRefCode}`));
    if (rcSnap.exists()) {
      const rcData = rcSnap.val();
      if (rcData?.uid) {
        referrerUid = rcData.uid;
        referrerProfile = rcData;
      }
    }
  } catch (_) {}

  // 2. Lookup in users node
  if (!referrerUid) {
    try {
      const uSnap = await get(ref(db, 'users'));
      if (uSnap.exists()) {
        const allU = uSnap.val();
        const matched = Object.entries(allU).find(
          ([_, u]: [string, any]) => (u.referralCode || '').trim().toUpperCase() === cleanRefCode
        );
        if (matched) {
          referrerUid = matched[0];
          referrerProfile = matched[1];
        }
      }
    } catch (_) {}
  }

  // 3. Lookup in sellers node
  if (!referrerUid) {
    try {
      const sSnap = await get(ref(db, 'sellers'));
      if (sSnap.exists()) {
        const allS = sSnap.val();
        const matchedS = Object.entries(allS).find(
          ([_, s]: [string, any]) => (s.referralCode || '').trim().toUpperCase() === cleanRefCode
        );
        if (matchedS) {
          referrerUid = matchedS[0];
          referrerProfile = matchedS[1];
        }
      }
    } catch (_) {}
  }

  // If referral code is not found in database -> Invalid Referral Code
  if (!referrerUid) {
    try {
      await update(ref(db, `orders/${orderKey}`), {
        commissionAwarded: false,
        commissionAmount: 0,
        commissionText: 'অবৈধ রেফারেল কোড (কমিশন: ৳০)',
        commissionNote: `রেফারেল কোড (${cleanRefCode}) সিস্টেমে পাওয়া যায়নি`,
        commissionProcessed: true
      });
    } catch (_) {}
    return { success: false, reason: 'INVALID_REFERRAL_CODE', amount: 0 };
  }

  // Check self-referral
  if (buyerId && referrerUid === buyerId) {
    try {
      await update(ref(db, `orders/${orderKey}`), {
        commissionAwarded: false,
        commissionAmount: 0,
        commissionText: 'সেলফ-রেফারেল নিষিদ্ধ (কমিশন: ৳০)',
        commissionNote: 'নিজস্ব রেফারেল কোড ব্যবহার করায় কমিশন প্রযোজ্য নয়',
        commissionProcessed: true
      });
    } catch (_) {}
    return { success: false, reason: 'SELF_REFERRAL_NOT_ALLOWED', amount: 0 };
  }

  // Valid Referral Code on Admin eBook -> Award +৳50 BDT
  const commAmt = 50;
  const txKey = primaryTxKey;

  try {
    // A. Update affiliateBalances atomically
    await runTransaction(ref(db, `affiliateBalances/${referrerUid}/balance`), (curr: any) => {
      return (Number(curr) || 0) + commAmt;
    }).catch(() => {});

    // B. Update users node (both affiliateBalance and balance)
    try {
      const userRef = ref(db, `users/${referrerUid}`);
      const freshSnap = await get(userRef);
      if (freshSnap.exists()) {
        const uData = freshSnap.val();
        const currentBal = Number(uData?.affiliateBalance) || 0;
        const currentMainBal = Number(uData?.balance) || 0;
        const currentTotal = Number(uData?.totalEarnings) || 0;
        await update(userRef, {
          affiliateBalance: currentBal + commAmt,
          balance: currentMainBal + commAmt,
          totalEarnings: currentTotal + commAmt
        });
      } else {
        await set(userRef, {
          uid: referrerUid,
          fullName: referrerProfile?.fullName || 'User',
          email: referrerProfile?.email || '',
          referralCode: cleanRefCode,
          affiliateBalance: commAmt,
          balance: commAmt,
          totalEarnings: commAmt,
          role: 'user',
          status: 'active',
          createdAt: Date.now()
        });
      }
    } catch (uErr) {
      console.warn('User node balance update notice:', uErr);
    }

    // C. Update sellers node if referrer is also a seller
    try {
      const sellerRef = ref(db, `sellers/${referrerUid}`);
      const sSnap = await get(sellerRef);
      if (sSnap.exists()) {
        const sData = sSnap.val();
        const currentBal = Number(sData?.balance) || 0;
        const currentAffBal = Number(sData?.affiliateBalance) || 0;
        const currentTotal = Number(sData?.totalEarnings) || 0;
        await update(sellerRef, {
          balance: currentBal + commAmt,
          affiliateBalance: currentAffBal + commAmt,
          totalEarnings: currentTotal + commAmt
        });
      }
    } catch (sErr) {
      console.warn('Seller node balance update notice:', sErr);
    }

    // D. Write to affiliateTransactions/${txKey}
    const txRecord = {
      transactionId: txKey,
      referrerUserId: referrerUid,
      referrerName: referrerProfile?.fullName || 'রেফারার',
      referralCode: cleanRefCode,
      buyerUserId: buyerId || 'buyer',
      buyerName: orderData.buyerName || 'ক্রেতা',
      orderId: orderData.orderId || orderKey,
      ebookId: orderData.bookId || 'admin-ebook',
      ebookTitle: orderData.bookTitle || matchedBook?.title || 'অ্যাডমিন ই-বুক',
      commissionAmount: commAmt,
      commissionType: 'EBOOK_REFERRAL',
      status: 'APPROVED',
      createdAt: orderData.createdAt || Date.now(),
      approvedAt: Date.now()
    };
    await set(ref(db, `affiliateTransactions/${txKey}`), txRecord);

    // E. Notification to Referrer
    try {
      const notifRef = push(ref(db, `notifications/${referrerUid}`));
      if (notifRef.key) {
        await set(notifRef, {
          id: notifRef.key,
          title: '🎉 ৳৫০ রেফারেল কমিশন জমা হয়েছে!',
          message: `আপনার রেফারেল কোড (${cleanRefCode}) দিয়ে অ্যাডমিন ই-বুক "${orderData.bookTitle || 'ই-বুক'}" সফলভাবে ক্রয় করা হয়েছে। ৳৫০ আপনার অ্যাকাউন্টে জমা হয়েছে।`,
          createdAt: Date.now(),
          read: false
        });
      }
    } catch (_) {}

    // F. Update order record
    await update(ref(db, `orders/${orderKey}`), {
      commissionAwarded: true,
      commissionAmount: commAmt,
      commissionText: 'অ্যাডমিন ই-বুক অ্যাফিলিয়েট কমিশন: ৳৫০',
      commissionNote: 'অ্যাডমিন ই-বুক: রেফারার পেয়েছে ৳৫০ রেফারেল কমিশন | ক্রেতা ৳০ কমিশন',
      commissionProcessed: true
    });

    return { success: true, amount: commAmt, referrerUid };
  } catch (err: any) {
    console.error('Error awarding referral commission:', err);
    return { success: false, reason: err?.message || 'ERROR', amount: 0 };
  }
}
