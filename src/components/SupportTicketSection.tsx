import React, { useState, useEffect } from 'react';
import { 
  LifeBuoy, 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Send, 
  MessageSquare, 
  ChevronRight, 
  ShieldCheck, 
  RefreshCw, 
  Search,
  Filter,
  ArrowLeft,
  Sparkles,
  X
} from 'lucide-react';
import { db, ref, onValue, push, set, update } from '../firebase';
import { SupportTicket, TicketCategory, TicketStatus } from '../types';

interface SupportTicketSectionProps {
  userId: string;
  userRole: 'user' | 'seller';
  userName: string;
  userEmail: string;
  userPhone?: string;
}

const TICKET_CATEGORIES: TicketCategory[] = [
  'পেমেন্ট ও রিফান্ড',
  'বই ডাউনলোড সমস্যা',
  'অ্যাফিলিয়েট ও রেফারেল কমিশন',
  'সেলার ও বই প্রকাশ',
  'মেম্বারশিপ আপগ্রেড',
  'উইথড্র সমস্যা',
  'অ্যাকাউন্ট ও নিরাপত্তা',
  'অন্যান্য জিজ্ঞাসা'
];

export const SupportTicketSection: React.FC<SupportTicketSectionProps> = ({
  userId,
  userRole,
  userName,
  userEmail,
  userPhone
}) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TicketStatus>('all');
  
  // New ticket modal
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<TicketCategory>(
    userRole === 'seller' ? 'সেলার ও বই প্রকাশ' : 'পেমেন্ট ও রিফান্ড'
  );
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Selected ticket for detailed view
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // Listen to Support Tickets from Firebase Realtime Database
  useEffect(() => {
    if (!userId) return;

    const ticketsRef = ref(db, 'supportTickets');
    const unsubscribe = onValue(ticketsRef, (snapshot) => {
      setLoading(false);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const userTickets: SupportTicket[] = [];

        Object.entries(data).forEach(([key, val]: [string, any]) => {
          if (val && val.userId === userId) {
            userTickets.push({
              ...val,
              id: key
            });
          }
        });

        // Sort latest first
        userTickets.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setTickets(userTickets);

        // If a ticket is currently selected, keep its live version updated
        if (selectedTicket) {
          const updatedSelected = userTickets.find(t => t.id === selectedTicket.id);
          if (updatedSelected) {
            setSelectedTicket(updatedSelected);
          }
        }
      } else {
        setTickets([]);
      }
    }, (error) => {
      console.error('Error fetching support tickets:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId, selectedTicket?.id]);

  // Mark ticket as read by user when opened
  const handleOpenTicket = async (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    if (ticket.unreadByUser) {
      try {
        await update(ref(db, `supportTickets/${ticket.id}`), {
          unreadByUser: false
        });
      } catch (err) {
        console.error('Failed to mark ticket as read', err);
      }
    }
  };

  // Submit new ticket to Firebase Realtime Database
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setSubmitError('অনুগ্রহ করে টিকিট বিষয় ও বিস্তারিত বার্তা লিখুন।');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const ticketsRef = ref(db, 'supportTickets');
      const newTicketRef = push(ticketsRef);
      const ticketId = newTicketRef.key || `TKT-${Date.now()}`;

      const newTicketData: Omit<SupportTicket, 'id'> = {
        userId,
        userRole,
        userName: userName || userEmail || 'eBookBazar Member',
        userEmail: userEmail || '',
        userPhone: userPhone || '',
        subject: subject.trim(),
        category,
        message: message.trim(),
        status: 'open',
        adminReply: '',
        createdAt: Date.now(),
        repliedAt: null,
        updatedAt: Date.now(),
        unreadByUser: false,
        unreadByAdmin: true
      };

      await set(newTicketRef, newTicketData);

      setSubmitSuccess('আপনার টিকিট সফলভাবে জমা দেওয়া হয়েছে! অ্যাডমিন টিম শীঘ্রই উত্তর প্রদান করবে।');
      setSubject('');
      setMessage('');
      setTimeout(() => {
        setIsNewTicketModalOpen(false);
        setSubmitSuccess('');
      }, 1500);
    } catch (err: any) {
      console.error('Error submitting support ticket:', err);
      setSubmitError('টিকিট জমা দিতে সমস্যা হয়েছে: ' + (err.message || 'পুনরায় চেষ্টা করুন।'));
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered tickets
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Status badges helper
  const renderStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-black px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-amber-700" />
            <span>অপেক্ষমান (Open)</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-900 border border-blue-300 text-[11px] font-black px-2.5 py-0.5 rounded-full">
            <RefreshCw className="w-3 h-3 text-blue-700 animate-spin" />
            <span>প্রক্রিয়াধীন (In Progress)</span>
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-black px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
            <span>সমাধান হয়েছে (Resolved)</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-900 border border-rose-300 text-[11px] font-black px-2.5 py-0.5 rounded-full">
            <XCircle className="w-3 h-3 text-rose-700" />
            <span>বাতিল (Rejected)</span>
          </span>
        );
      default:
        return null;
    }
  };

  const totalCount = tickets.length;
  const openCount = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved').length;
  const unreadRepliesCount = tickets.filter(t => t.unreadByUser).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="bg-gradient-to-br from-[#064e3b] via-[#042f1a] to-[#021f11] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-600/40">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-emerald-900/80 border border-emerald-500/50 text-emerald-200 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              <LifeBuoy className="w-3.5 h-3.5 text-amber-400" />
              <span>২৪/৭ হেল্প ডেস্ক ও সাপোর্ট টিকিট</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              সাপোর্ট টিকিট <span className="text-amber-400">ম্যানেজমেন্ট</span>
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl leading-relaxed">
              পেমেন্ট, বই ডাউনলোড, রেফারেল কমিশন বা সেলার সংক্রান্ত যেকোনো সমস্যা থাকলে নতুন টিকিট তৈরি করুন। অ্যাডমিন টিম দ্রুত রিয়েল-টাইম সমাধান প্রদান করবে।
            </p>
          </div>

          <button
            onClick={() => setIsNewTicketModalOpen(true)}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2 transition active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>নতুন টিকিট তৈরি করুন</span>
          </button>
        </div>

        {/* 3 Metric Cards */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-6 pt-6 border-t border-emerald-800/80">
          <div className="bg-emerald-950/60 backdrop-blur-md rounded-2xl p-3.5 border border-emerald-700/50">
            <span className="text-[11px] font-bold text-emerald-300">মোট টিকিট</span>
            <div className="text-xl sm:text-2xl font-black text-white mt-0.5">{totalCount}</div>
          </div>
          <div className="bg-emerald-950/60 backdrop-blur-md rounded-2xl p-3.5 border border-emerald-700/50">
            <span className="text-[11px] font-bold text-amber-300">অপেক্ষমান</span>
            <div className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5">{openCount}</div>
          </div>
          <div className="bg-emerald-950/60 backdrop-blur-md rounded-2xl p-3.5 border border-emerald-700/50 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold text-emerald-300">সমাধান হয়েছে</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-0.5">{resolvedCount}</div>
          </div>
        </div>
      </div>

      {/* Unread Reply Alert Banner if any */}
      {unreadRepliesCount > 0 && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl flex items-center justify-between gap-3 text-emerald-950 shadow-sm animate-pulse">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-emerald-700 shrink-0" />
            <span className="text-xs sm:text-sm font-black">
              আপনার {unreadRepliesCount}টি টিকিটে অ্যাডমিন নতুন উত্তর দিয়েছেন! নিচে ক্লিক করে দেখুন।
            </span>
          </div>
        </div>
      )}

      {/* Main Content Area: List & Detail View */}
      {selectedTicket ? (
        /* Detailed Ticket View */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-fadeIn">
          {/* Back button & status */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <button
              onClick={() => setSelectedTicket(null)}
              className="flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-xl border border-emerald-300 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← সকল টিকিটে ফিরে যান</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-500">#{selectedTicket.id.slice(-8).toUpperCase()}</span>
              {renderStatusBadge(selectedTicket.status)}
            </div>
          </div>

          {/* Ticket Header */}
          <div className="space-y-2">
            <div className="inline-block bg-slate-100 text-slate-700 text-[11px] font-bold px-2.5 py-0.5 rounded-lg">
              ক্যাটাগরি: {selectedTicket.category}
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              {selectedTicket.subject}
            </h3>
            <p className="text-xs text-slate-500">
              তৈরি করা হয়েছে: {new Date(selectedTicket.createdAt).toLocaleString('bn-BD')}
            </p>
          </div>

          {/* User Message Card */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-slate-700">
              <MessageSquare className="w-4 h-4 text-emerald-700" />
              <span>আপনার বার্তা:</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {selectedTicket.message}
            </p>
          </div>

          {/* Admin Reply Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-sm font-black text-slate-900">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <span>অ্যাডমিন দলের উত্তর ও সমাধান:</span>
            </div>

            {selectedTicket.adminReply ? (
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-2xl p-5 sm:p-6 space-y-3 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-emerald-200/80">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                    <span className="font-black text-emerald-950 text-xs sm:text-sm">
                      {selectedTicket.adminName || 'eBookBazar Support Team'}
                    </span>
                  </div>
                  {selectedTicket.repliedAt && (
                    <span className="text-[11px] font-medium text-emerald-800">
                      {new Date(selectedTicket.repliedAt).toLocaleString('bn-BD')}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-900 leading-relaxed font-medium whitespace-pre-wrap">
                  {selectedTicket.adminReply}
                </p>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center space-y-2">
                <Clock className="w-8 h-8 text-amber-600 mx-auto animate-pulse" />
                <h4 className="font-black text-amber-950 text-sm">রিভিউ চলছে</h4>
                <p className="text-xs text-amber-800 max-w-md mx-auto leading-relaxed">
                  আমাদের সাপোর্ট টিম আপনার টিকিটটি পর্যালোচনা করছে। সাধারণত ২৪ ঘণ্টার মধ্যে এখানে উত্তর দেওয়া হয়।
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Ticket List View */
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-5">
          {/* Controls: Search & Status Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="বিষয় বা টিকিট আইডি খুঁজুন..."
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-black whitespace-nowrap transition ${
                  statusFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                সকল ({tickets.length})
              </button>
              <button
                onClick={() => setStatusFilter('open')}
                className={`px-3 py-1.5 rounded-xl font-black whitespace-nowrap transition ${
                  statusFilter === 'open'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                খোলা ({tickets.filter(t => t.status === 'open').length})
              </button>
              <button
                onClick={() => setStatusFilter('resolved')}
                className={`px-3 py-1.5 rounded-xl font-black whitespace-nowrap transition ${
                  statusFilter === 'resolved'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                সমাধান ({tickets.filter(t => t.status === 'resolved').length})
              </button>
            </div>
          </div>

          {/* Tickets List */}
          {loading ? (
            <div className="py-12 text-center text-slate-500 text-xs font-bold flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-700" />
              <span>রিয়েল-টাইম টিকিট লোড হচ্ছে...</span>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="py-12 text-center space-y-3 bg-slate-50 rounded-2xl border border-slate-100 p-6">
              <LifeBuoy className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="font-black text-slate-900 text-sm">কোনো টিকিট পাওয়া যায়নি</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                আপনার কোনো অভিযোগ, পেমেন্ট সংক্রান্ত তথ্য বা প্রশ্ন থাকলে এখনই নতুন টিকিট তৈরি করুন।
              </p>
              <button
                onClick={() => setIsNewTicketModalOpen(true)}
                className="bg-[#15803d] hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>নতুন টিকিট খুলুন</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => handleOpenTicket(ticket)}
                  className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md ${
                    ticket.unreadByUser 
                      ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-400/50' 
                      : 'bg-white hover:bg-slate-50/80 border-slate-200'
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-slate-500">
                        #{ticket.id.slice(-8).toUpperCase()}
                      </span>
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">
                        {ticket.category}
                      </span>
                      {renderStatusBadge(ticket.status)}
                      {ticket.unreadByUser && (
                        <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider animate-pulse">
                          নতুন উত্তর
                        </span>
                      )}
                    </div>

                    <h4 className="font-black text-slate-900 text-sm sm:text-base leading-snug truncate">
                      {ticket.subject}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-1">
                      {ticket.message}
                    </p>

                    <div className="text-[11px] text-slate-500 pt-0.5">
                      তৈরি: {new Date(ticket.createdAt).toLocaleDateString('bn-BD')}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    {ticket.adminReply ? (
                      <span className="text-xs font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-xl flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>উত্তর দেখুন</span>
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
                        অপেক্ষমান
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CREATE NEW TICKET                                   */}
      {/* ========================================================= */}
      {isNewTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsNewTicketModalOpen(false)}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center absolute right-5 top-5 transition"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
                <LifeBuoy className="w-3.5 h-3.5 text-emerald-700" />
                <span>নতুন সাপোর্ট অনুরোধ</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                সাপোর্ট টিকিট ফর্ম
              </h3>
              <p className="text-xs text-slate-500">
                আপনার সমস্যা বা প্রশ্নের সঠিক তথ্য প্রদান করুন, যাতে আমরা দ্রুত সহায়তা করতে পারি।
              </p>
            </div>

            {/* Success Message */}
            {submitSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-bold rounded-2xl flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{submitSuccess}</span>
              </div>
            )}

            {/* Error Message */}
            {submitError && (
              <div className="p-4 bg-rose-50 border border-rose-300 text-rose-900 text-xs sm:text-sm font-bold rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleCreateTicket} className="space-y-4">
              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">
                  টিকিট ক্যাটাগরি *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TicketCategory)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 font-bold text-slate-900"
                >
                  {TICKET_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">
                  বিষয় (Subject) *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="সংক্ষেপে সমস্যার মূল বিষয়টি লিখুন..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 font-medium text-slate-900"
                />
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">
                  বিস্তারিত বার্তা (Message) *
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="আপনার সমস্যার বিস্তারিত বিবরণ, ট্রানজেকশন আইডি (প্রযোজ্য ক্ষেত্রে) ইত্যাদি স্পষ্ট করে লিখুন..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 font-medium text-slate-900 resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewTicketModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-black text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#15803d] hover:bg-emerald-800 disabled:opacity-50 text-white font-black text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md transition flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>জমা দেওয়া হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>টিকিট জমা দিন</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
