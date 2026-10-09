/**
 * Utility to accurately determine whether an eBook or an Order is Admin-owned (Admin eBook)
 * or Seller-owned (Seller eBook).
 * 
 * FINAL BUSINESS RULE:
 * 1. Admin eBook:
 *    - Valid Referral Code used + Successful Purchase => Referral owner gets +৳50 BDT.
 * 2. Seller eBook:
 *    - Referral owner gets +৳0 BDT (Referral Commission strictly disabled for Seller eBooks).
 *    - Seller receives full ebook sale earning into seller wallet as per existing logic.
 */

// Known Admin UIDs across current and historical setups
export const ADMIN_UIDS = new Set([
  'ADMIN',
  'admin',
  'Admin',
  'eBookBazar',
  'aRR6IvlWlzMjBMq5oHq2G0j6mVs1', // Master Admin (redx0187@gmail.com)
  'YH9YIRNIQpVEmQgkZTwBiDam7tS2', // Admin (suma47083@gmail.com)
  'kOPlXBMvFOYqhQBw7pA7fbmY64B2', // Admin (admin@ebookbazar.com)
]);

// Known Admin emails
export const ADMIN_EMAILS = new Set([
  'suma47083@gmail.com',
  'admin@ebookbazar.com',
  'redx0187@gmail.com',
]);

// Initial catalog Admin eBook IDs
export const KNOWN_ADMIN_EBOOK_IDS = new Set([
  'bk-fullstack-dev-01',
  'bk-freelancing-mastery-02',
  'bk-digital-marketing-03',
  'bk-bcs-preparation-04',
  'bk-python-ml-05',
]);

// Initial catalog Seller eBook IDs
export const KNOWN_SELLER_EBOOK_IDS = new Set([
  'bk-business-startup-06',
  'bk-mobile-flutter-07',
]);

export interface EbookOrOrderLike {
  id?: string | null;
  bookId?: string | null;
  sellerId?: string | null;
  sellerEmail?: string | null;
  sellerName?: string | null;
  author?: string | null;
  isSeller?: boolean | null;
  title?: string | null;
  bookTitle?: string | null;
}

export function isEbookAdminOwned(
  item?: EbookOrOrderLike | null,
  matchedBook?: EbookOrOrderLike | null
): boolean {
  // If we have a matched database/initial book reference, evaluate both
  const target = matchedBook || item;
  if (!target && !item) return true; // Default fallback to admin

  const bookId = (target?.id || item?.bookId || item?.id || '').trim();

  // 1. Check known Seller eBook IDs first
  if (bookId && KNOWN_SELLER_EBOOK_IDS.has(bookId)) {
    return false;
  }

  // 2. Check known Admin eBook IDs and admin prefixes
  if (bookId && (KNOWN_ADMIN_EBOOK_IDS.has(bookId) || bookId.toLowerCase().startsWith('admin-eb-'))) {
    return true;
  }

  // 3. Check sellerId
  const sid = (target?.sellerId || item?.sellerId || '').trim();
  const isAdminSid = Boolean(
    sid && (
      ADMIN_UIDS.has(sid) ||
      ADMIN_UIDS.has(sid.toUpperCase()) ||
      ADMIN_UIDS.has(sid.toLowerCase()) ||
      sid.toLowerCase() === 'admin' ||
      sid.toLowerCase() === 'ebookbazar'
    )
  );

  const semail = (target?.sellerEmail || item?.sellerEmail || '').trim().toLowerCase();
  const isAdminEmail = Boolean(semail && ADMIN_EMAILS.has(semail));

  // If explicitly admin UID or admin email
  if (isAdminSid || isAdminEmail) {
    return true;
  }

  // 4. Check isSeller flag
  // If marked as seller book (uploaded by seller or from seller catalog) and not admin credentials
  if (target?.isSeller === true || item?.isSeller === true) {
    return false;
  }

  // 5. If sellerId belongs to a non-admin seller (e.g. SELLER_... or seller UID)
  if (sid && !isAdminSid) {
    return false;
  }

  // 6. If sellerEmail belongs to a non-admin seller
  if (semail && !isAdminEmail && semail.includes('@')) {
    return false;
  }

  // 7. Check sellerName
  const sname = (target?.sellerName || item?.sellerName || '').trim().toLowerCase();
  if (sname.includes('admin') || sname.includes('ebookbazar পাবলিকেশন')) {
    return true;
  }
  if (sname.includes('সেলার') || sname.includes('seller')) {
    return false;
  }

  // 8. Check author
  const author = (target?.author || item?.author || '').trim().toLowerCase();
  if (
    author === 'admin' ||
    author === 'admon' ||
    author === 'ebookbazar' ||
    author === 'master admin' ||
    author.includes('ebookbazar পাবলিকেশন')
  ) {
    return true;
  }
  if (author.includes('সেলার') || author.includes('seller')) {
    return false;
  }

  // 9. If isSeller is explicitly false, it is Admin-owned
  if (target?.isSeller === false || item?.isSeller === false) {
    return true;
  }

  // 10. Default fallback: Admin-owned
  return true;
}

export function isEbookSellerOwned(
  item?: EbookOrOrderLike | null,
  matchedBook?: EbookOrOrderLike | null
): boolean {
  return !isEbookAdminOwned(item, matchedBook);
}
