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
  // If we have a matched database/initial book reference, check it
  const target = matchedBook || item;
  if (!target) return true; // Default fallback to admin

  const sid = (target.sellerId || item?.sellerId || '').trim();
  if (sid && (ADMIN_UIDS.has(sid) || ADMIN_UIDS.has(sid.toUpperCase()) || ADMIN_UIDS.has(sid.toLowerCase()))) {
    return true;
  }
  if (!sid || sid.toLowerCase() === 'admin' || sid.toLowerCase() === 'ebookbazar') {
    return true;
  }

  const semail = (target.sellerEmail || item?.sellerEmail || '').trim().toLowerCase();
  if (semail && ADMIN_EMAILS.has(semail)) {
    return true;
  }

  const sname = (target.sellerName || item?.sellerName || '').trim().toLowerCase();
  if (sname.includes('admin') || sname.includes('ebookbazar পাবলিকেশন')) {
    return true;
  }

  const author = (target.author || item?.author || '').trim().toLowerCase();
  if (
    author === 'admin' ||
    author === 'admon' ||
    author === 'ebookbazar' ||
    author === 'master admin' ||
    author.includes('ebookbazar পাবলিকেশন')
  ) {
    return true;
  }

  const bookId = (target.id || item?.bookId || item?.id || '').trim();
  if (bookId.startsWith('admin-eb-') || bookId.startsWith('bk-')) {
    return true;
  }

  // If book was explicitly marked as a seller book by Seller Dashboard, and its seller is NOT an admin
  if (target.isSeller === true) {
    return false;
  }
  if (item?.isSeller === true && !matchedBook) {
    // If no matched book found to verify, but order had isSeller
    if (!sid || ADMIN_UIDS.has(sid) || (semail && ADMIN_EMAILS.has(semail))) {
      return true;
    }
    return false;
  }

  // If isSeller is false or not set, it is admin-owned
  return true;
}

export function isEbookSellerOwned(
  item?: EbookOrOrderLike | null,
  matchedBook?: EbookOrOrderLike | null
): boolean {
  return !isEbookAdminOwned(item, matchedBook);
}
