export interface UserProfile {
  uid: string;
  username?: string;
  fullName: string;
  email: string;
  phone?: string;
  country?: string;
  address?: string;
  role: 'user' | 'seller' | 'admin';
  paymentMethod?: 'bKash' | 'Nagad';
  paymentMobile?: string;
  referralCode: string;
  referredBy?: string;
  affiliateBalance: number;
  pendingWithdrawal?: number;
  totalWithdrawn?: number;
  totalEarnings: number;
  status: 'active' | 'suspended';
  createdAt: number;
}

export interface SellerProfile extends UserProfile {
  paymentMethod: 'bKash' | 'Nagad';
  paymentMobile: string;
  membershipPlan: 'free' | 'standard' | 'premium';
  uploadLimit: number;
  balance: number;
  salesCount: number;
  withdrawnAmount: number;
}

export interface Ebook {
  id: string;
  title: string;
  author: string;
  description: string;
  shortDesc?: string;
  category: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  price: number;
  regularPrice?: number;
  discountPrice?: number;
  coverUrl: string;
  pdfUrl: string;
  sellerId: string;
  sellerName?: string;
  sellerEmail?: string;
  sellerReferralCode?: string;
  isSeller?: boolean;
  status: 'pending' | 'published' | 'rejected';
  createdAt: number;
}

export interface CartItem {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  price: number;
  qty: number;
  sellerId?: string;
  sellerName?: string;
  sellerEmail?: string;
  sellerReferralCode?: string;
  isSeller?: boolean;
}

export interface Order {
  id: string;
  orderId: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerCountry?: string;
  bookId: string;
  bookTitle: string;
  amount: number;
  sellerId?: string;
  sellerName?: string;
  sellerEmail?: string;
  sellerReferralCode?: string;
  isSeller?: boolean;
  paymentMethod: 'bKash' | 'Nagad' | 'Wallet Balance';
  paymentMobile: string;
  trxId: string;
  referralCode?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectReason?: string;
  approvedAt?: number;
  rejectedAt?: number;
  commissionProcessed?: boolean;
  commissionAwarded?: boolean;
  commissionAmount?: number;
  commissionText?: string;
  commissionNote?: string;
  createdAt: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug?: string;
  author: string;
  authorRole?: string;
  date: string;
  publishedAt?: string;
  readTime?: string;
  category: string;
  labels?: string[];
  coverImage: string;
  excerpt: string;
  content: string[];
  htmlContent?: string;
  url?: string;
  isDemo?: boolean;
  type?: 'POST' | 'PAGE';
  status?: 'LIVE' | 'DRAFT' | 'SOFT_TRASHED';
}

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  uploadLimit: number;
  status: 'active' | 'inactive';
}

export interface MembershipRequest {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  currentMembership: string;
  newMembership: string;
  currentUploadLimit: number;
  newUploadLimit: number;
  amount: number;
  paymentMethod: 'bKash' | 'Nagad';
  paymentMobile: string;
  trxId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  approvedAt?: number;
  rejectedAt?: number;
}

export interface WithdrawalRequest {
  id: string;
  reqId?: string;
  requestId?: string;
  transactionId?: string;
  uid?: string;
  userId?: string;
  userName: string;
  userEmail?: string;
  email?: string;
  amount: number;
  charge?: number;
  netAmount?: number;
  payoutAmount?: number;
  previousBalance?: number;
  remainingBalance?: number;
  method?: 'bKash' | 'Nagad' | 'Bank' | 'Other';
  paymentMethod?: 'bKash' | 'Nagad' | 'Bank' | 'Other';
  account?: string;
  paymentAccount?: string;
  note?: string;
  adminNote?: string;
  trxId?: string;
  type?: 'affiliate' | 'seller';
  status: 'pending' | 'approved' | 'rejected' | 'paid' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
  createdAt: number;
  updatedAt?: number;
  processedAt?: number | null;
}

export interface AffiliateTransaction {
  id?: string;
  transactionId: string;
  referrerUserId: string;
  referrerName: string;
  referralCode: string;
  buyerUserId: string;
  buyerName: string;
  orderId: string;
  ebookId: string;
  ebookTitle: string;
  commissionAmount: number; // 50 BDT
  commissionType: 'EBOOK_REFERRAL';
  status: 'APPROVED' | 'REJECTED_SELF_REFERRAL';
  createdAt: number;
  approvedAt: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  active: boolean;
  scope?: 'global' | 'user';
  createdAt: number;
  read?: boolean;
}

export interface PaymentSettings {
  bkashNumber: string;
  nagadNumber: string;
  generalPaymentOn: boolean;
  ebookPaymentOn: boolean;
  membershipPaymentOn: boolean;
  affiliateCommission: number;
  withdrawCharge: number;
  minWithdraw: number;
}

export interface HeaderNavCard {
  id: string;
  title: string;
  icon: string;
  subtitle: string;
  url: string;
  targetSection: string;
}

export interface Review {
  id: string;
  productId: string;
  bookTitle: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved';
  createdAt: number;
}

export interface AdsterraConfig {
  enabled: boolean;
  homepageEnabled: boolean;
  blogListingEnabled: boolean;
  blogArticleEnabled: boolean;
  ebookListingEnabled: boolean;
  ebookDetailsEnabled: boolean;
  mobileEnabled: boolean;
  desktopEnabled: boolean;
  mobileAdCode: string;
  desktopAdCode: string;
  homepageAdCode: string;
  blogListingAdCode: string;
  blogArticleAdCode: string;
  ebookListingAdCode: string;
  ebookDetailsAdCode: string;
  updatedAt?: number;
}

export const DEFAULT_ADSTERRA_CONFIG: AdsterraConfig = {
  enabled: true,
  homepageEnabled: true,
  blogListingEnabled: true,
  blogArticleEnabled: true,
  ebookListingEnabled: true,
  ebookDetailsEnabled: true,
  mobileEnabled: true,
  desktopEnabled: true,
  mobileAdCode: '',
  desktopAdCode: '',
  homepageAdCode: '',
  blogListingAdCode: '',
  blogArticleAdCode: '',
  ebookListingAdCode: '',
  ebookDetailsAdCode: '',
  updatedAt: 0
};

export interface LiveChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'seller' | 'admin' | 'bot' | 'visitor';
  text: string;
  timestamp: number;
}

export interface LiveChatSession {
  id: string;
  userId?: string;
  userName: string;
  userRole?: 'user' | 'seller' | 'visitor';
  status: 'active' | 'closed';
  lastMessage: string;
  lastMessageTime: number;
  unreadCount?: number;
}

export type TicketCategory = 
  | 'পেমেন্ট ও রিফান্ড'
  | 'বই ডাউনলোড সমস্যা'
  | 'অ্যাফিলিয়েট ও রেফারেল কমিশন'
  | 'সেলার ও বই প্রকাশ'
  | 'মেম্বারশিপ আপগ্রেড'
  | 'উইথড্র সমস্যা'
  | 'অ্যাকাউন্ট ও নিরাপত্তা'
  | 'অন্যান্য জিজ্ঞাসা';

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'rejected';

export interface SupportTicket {
  id: string;
  userId: string;
  userRole: 'user' | 'seller';
  userName: string;
  userEmail: string;
  userPhone?: string;
  subject: string;
  category: TicketCategory | string;
  message: string;
  status: TicketStatus;
  adminReply?: string;
  adminName?: string;
  createdAt: number;
  repliedAt?: number | null;
  updatedAt: number;
  unreadByUser?: boolean;
  unreadByAdmin?: boolean;
}

