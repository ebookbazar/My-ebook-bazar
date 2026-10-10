import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Phone, 
  CheckCheck, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  HelpCircle,
  Clock,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, ref, push, onValue, set } from '../firebase';
import { LiveChatMessage } from '../types';

interface LiveChatWidgetProps {
  sellerOnlineCount?: number;
}

const WHATSAPP_NUMBER = '+8801911633056';
const WHATSAPP_CLEAN = '8801911633056';

// Sound effect generator using Web Audio API (zero network lag, 100% reliable)
const playAlertSound = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Audio autoplay or permissions handled gracefully
  }
};

// Safe sessionStorage access for Private/Incognito modes
function safeGetSessionItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage.getItem(key);
    }
  } catch {
    // Incognito or restricted storage
  }
  return null;
}

function safeSetSessionItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(key, value);
    }
  } catch {
    // Incognito or restricted storage
  }
}

export const LiveChatWidget: React.FC<LiveChatWidgetProps> = ({ sellerOnlineCount = 7 }) => {
  const { currentUser, userProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewAlert, setHasNewAlert] = useState(true);

  // Chat session key
  const [chatSessionId] = useState<string>(() => {
    const existing = safeGetSessionItem('ebookbazar_chat_session');
    if (existing) return existing;
    const newId = 'chat_' + Math.random().toString(36).substring(2, 9);
    safeSetSessionItem('ebookbazar_chat_session', newId);
    return newId;
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial greeting
  useEffect(() => {
    const initialWelcome: LiveChatMessage = {
      id: 'welcome-1',
      senderId: 'support-agent',
      senderName: 'সাপোর্ট কনসিয়ার্জ',
      senderRole: 'admin',
      text: 'আসসালামু আলাইকুম! eBookBazar লাইভ সাপোর্টে আপনাকে স্বাগতম। আপনার কি কোনো eBook ডাউনলোড, বিকাশ/নগদ পেমেন্ট বা সেলার অ্যাকাউন্ট সংক্রান্ত সহায়তা প্রয়োজন?',
      timestamp: Date.now()
    };
    setMessages([initialWelcome]);

    // Show "Can I help you?" alert popup after 3 seconds on first load
    const timer = setTimeout(() => {
      const dismissed = safeGetSessionItem('live_chat_alert_dismissed');
      if (!dismissed) {
        setShowAlert(true);
        if (soundEnabled) {
          playAlertSound();
        }
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Listen to remote chat thread if available
  useEffect(() => {
    if (!chatSessionId) return;
    try {
      const chatRef = ref(db, `liveChats/${chatSessionId}`);
      const unsub = onValue(chatRef, (snap) => {
        if (snap.exists()) {
          const data = snap.val();
          if (data && data.messages) {
            const list: LiveChatMessage[] = Object.values(data.messages);
            list.sort((a, b) => a.timestamp - b.timestamp);
            if (list.length > 0) {
              setMessages(list);
            }
          }
        }
      });
      return () => unsub();
    } catch {
      // Offline fallback works seamlessly with local state
    }
  }, [chatSessionId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const handleDismissAlert = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowAlert(false);
    safeSetSessionItem('live_chat_alert_dismissed', 'true');
  };

  const handleOpenChat = () => {
    setIsOpen(true);
    setShowAlert(false);
    setHasNewAlert(false);
    safeSetSessionItem('live_chat_alert_dismissed', 'true');
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userRole = (userProfile as any)?.sellerName ? 'seller' : currentUser ? 'user' : 'visitor';
    const senderName = userProfile?.fullName || (userProfile as any)?.sellerName || (currentUser ? 'গ্রাহক' : 'ভিজিটর');

    const newMsg: LiveChatMessage = {
      id: 'msg_' + Date.now(),
      senderId: currentUser?.uid || chatSessionId,
      senderName,
      senderRole: userRole,
      text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    if (soundEnabled) {
      playAlertSound();
    }

    // Try sync to Firebase RTDB
    try {
      push(ref(db, `liveChats/${chatSessionId}/messages`), newMsg);
      set(ref(db, `liveChats/${chatSessionId}/metadata`), {
        sessionId: chatSessionId,
        userName: senderName,
        userRole,
        lastMessage: text,
        lastUpdated: Date.now(),
        status: 'open'
      });
    } catch {
      // Handled via local messages state
    }

    // Smart Concierge Auto-reply
    setIsTyping(true);
    setTimeout(() => {
      let replyText = 'ধন্যবাদ আপনার মেসেজের জন্য! আমাদের কাস্টমার কেয়ার টিম ও সেলার প্রতিনিধি দ্রুত আপনার সাথে যোগাযোগ করছেন।';
      
      const lower = text.toLowerCase();
      if (lower.includes('payment') || lower.includes('পেমেন্ট') || lower.includes('bkash') || lower.includes('বিকাশ') || lower.includes('নগদ') || lower.includes('টাকা')) {
        replyText = '💳 পেমেন্ট সংক্রান্ত তথ্য: বিকাশ বা নগদ Personal নম্বরে সেন্ড মানি করে TrxID ও মোবাইল নম্বর অর্ডার ফর্মে সাবমিট করলেই ৫-১০ মিনিটে অ্যাডমিন ভেরিফিকেশন সম্পন্ন হবে। যেকোনো জরুরি প্রয়োজনে সরাসরি WhatsApp-এ যোগাযোগ করুন।';
      } else if (lower.includes('download') || lower.includes('ডাউনলোড') || lower.includes('pdf') || lower.includes('বই পাচ্ছি না') || lower.includes('লাইব্রেরি')) {
        replyText = '📥 eBook ডাউনলোড: পেমেন্ট অনুমোদিত হওয়ার পর "আমার লাইব্রেরি" মেন্যু থেকে যেকোনো সময় সরাসরি অনলাইনে পড়তে ও ডাউনলোড করতে পারবেন। কোনো টেকনিক্যাল সমস্যা হলে সরাসরি আমাদের WhatsApp-এ জানান।';
      } else if (lower.includes('seller') || lower.includes('সেলার') || lower.includes('বিক্রি') || lower.includes('upload') || lower.includes('আপলোড')) {
        replyText = '🏪 সেলার সহায়তা: সেলার একাউন্ট থেকে সহজেই আপনার মৌলিক ই-বুক আপলোড করতে পারেন। প্রতিটি বিক্রয়ে সরাসরি কমিশন পান এবং বিকাশ/নগদে উত্তোলন করতে পারেন।';
      }

      const botReply: LiveChatMessage = {
        id: 'bot_' + Date.now(),
        senderId: 'support-agent',
        senderName: 'সাপোর্ট কনসিয়ার্জ',
        senderRole: 'admin',
        text: replyText,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, botReply]);
      setIsTyping(false);
      if (soundEnabled) {
        playAlertSound();
      }
    }, 1200);
  };

  const quickPrompts = [
    { label: '📥 eBook ডাউনলোড সমস্যা', text: 'আমি একটি eBook কিনেছি কিন্তু ডাউনলোড করতে পারছি না, সাহায্য করবেন?' },
    { label: '💳 পেমেন্ট ভেরিফিকেশন', text: 'আমি বিকাশ/নগদ-এ পেমেন্ট করেছি, ভেরিফিকেশন স্ট্যাটাস জানতে চাই।' },
    { label: '🏪 সেলার বই বিক্রি সংক্রান্ত', text: 'আমি সেলার হিসেবে বই আপলোড ও বিক্রি করতে চাই, নিয়ম কী?' },
    { label: '📱 WhatsApp সাপোর্ট', text: 'আমি সরাসরি WhatsApp সাপোর্টে কথা বলতে চাই।' }
  ];

  return (
    <>
      {/* Floating Action Trigger & Alert Bubble Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2.5">
        
        {/* "Can I help you?" Alert Speech Bubble */}
        {showAlert && !isOpen && (
          <div 
            onClick={handleOpenChat}
            className="w-72 sm:w-80 bg-white rounded-2xl p-3.5 shadow-2xl border-2 border-emerald-500/80 cursor-pointer transform hover:scale-[1.02] transition-all animate-bounce duration-500 relative group"
            style={{ animationIterationCount: '3' }}
          >
            <button 
              onClick={handleDismissAlert}
              aria-label="বার্তা বন্ধ করুন"
              className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full p-1 hover:bg-rose-600 transition shadow"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-start gap-3">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-black shadow-md">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="font-black text-slate-900 text-xs">eBookBazar Support</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    Online 🟢
                  </span>
                </div>
                <p className="text-slate-800 text-xs font-semibold leading-relaxed">
                  "হ্যালো! Can I help you? কোনো সমস্যা হলে সরাসরি জানান।" 👋
                </p>
                <div className="mt-2 flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100 text-emerald-700 font-bold">
                  <span>চ্যাট শুরু করতে ক্লিক করুন</span>
                  <span className="text-slate-400">এখনই</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Main Live Chat Button */}
        <button
          type="button"
          onClick={() => {
            if (isOpen) {
              setIsOpen(false);
            } else {
              handleOpenChat();
            }
          }}
          aria-label="লাইভ চ্যাট সহায়তা"
          className="relative bg-gradient-to-r from-emerald-700 via-emerald-800 to-green-900 text-white p-3.5 sm:px-4 sm:py-3.5 rounded-full shadow-2xl hover:shadow-emerald-950/40 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2.5 border-2 border-emerald-400/50 group"
        >
          {/* Pulsing Green Online Indicator on button */}
          <span className="relative flex h-3.5 w-3.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border border-white" />
          </span>

          <MessageCircle className="w-5 h-5 text-white group-hover:rotate-12 transition-transform duration-200" />
          
          <div className="hidden sm:flex flex-col text-left leading-tight pr-1">
            <span className="text-xs font-black tracking-wide">
              Live Chat
            </span>
            <span className="text-[10px] text-emerald-200 font-medium">
              সাপোর্ট ও সেলার অনলাইন 🟢
            </span>
          </div>

          {/* Unread / Alert Badge */}
          {hasNewAlert && !isOpen && (
            <span className="absolute -top-1.5 -left-1.5 bg-rose-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-pulse">
              1
            </span>
          )}
        </button>
      </div>

      {/* Professional Live Chat Window Drawer */}
      {isOpen && (
        <div 
          className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-h-[82vh] h-[550px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#14532d] to-[#15803d] text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-white text-emerald-800 flex items-center justify-center font-black shadow">
                  <MessageCircle className="w-6 h-6 text-[#15803d]" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#14532d] rounded-full" />
              </div>
              <div>
                <h3 className="font-black text-sm text-white flex items-center gap-1.5">
                  <span>eBookBazar লাইভ চ্যাট</span>
                </h3>
                <p className="text-[11px] text-emerald-200 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>সাপোর্ট ও সেলার অনলাইনে আছেন</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? 'সাউন্ড বন্ধ করুন' : 'সাউন্ড চালু করুন'}
                className="p-1.5 text-emerald-200 hover:text-white rounded-xl hover:bg-white/10 transition"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-emerald-200 hover:text-white rounded-xl hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Direct WhatsApp Callout Banner */}
          <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100 flex items-center justify-between text-xs">
            <span className="text-emerald-950 font-bold flex items-center gap-1.5 text-[11px]">
              <Phone className="w-3.5 h-3.5 text-emerald-700" />
              <span>জরুরি WhatsApp হেল্পলাইন:</span>
            </span>
            <a
              href={`https://wa.me/${WHATSAPP_CLEAN}?text=${encodeURIComponent('হ্যালো, আমি eBookBazar কাস্টমার সাপোর্ট সংক্রান্ত সহায়তা চাই।')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 px-2.5 py-1 rounded-lg font-black text-[11px] shadow-sm flex items-center gap-1 active:scale-95 transition"
            >
              <span>{WHATSAPP_NUMBER}</span>
            </a>
          </div>

          {/* Quick Support Topics */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q.text)}
                className="whitespace-nowrap text-[11px] font-bold px-2.5 py-1 bg-white hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 rounded-full border border-slate-200 transition shadow-sm"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
            {messages.map((m) => {
              const isMe = m.senderRole === 'user' || m.senderRole === 'visitor' || (m.senderRole === 'seller' && m.senderId === currentUser?.uid);
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1 mb-1 text-[10px] text-slate-500 font-bold px-1">
                    <span>{m.senderName}</span>
                    <span>•</span>
                    <span>{new Date(m.timestamp).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                      isMe
                        ? 'bg-emerald-700 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-500 p-2 bg-white rounded-2xl w-fit border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse delay-100" />
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse delay-200" />
                <span className="text-[11px] font-medium text-slate-500 ml-1">সাপোর্ট কনসিয়ার্জ উত্তর প্রস্তুত করছে...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Box */}
          <div className="p-3 bg-white border-t border-slate-200 space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="আপনার প্রশ্ন বা সমস্যা এখানে লিখুন..."
                className="flex-1 bg-slate-100 focus:bg-white border border-slate-300 focus:border-emerald-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none transition"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white p-2.5 rounded-xl shadow transition active:scale-95 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>তাৎক্ষণিক লাইভ কাস্টমার সাপোর্ট</span>
              </span>
              <a
                href={`https://wa.me/${WHATSAPP_CLEAN}?text=${encodeURIComponent('হ্যালো eBookBazar সাপোর্ট')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 hover:underline font-bold"
              >
                WhatsApp এ কথা বলুন &rarr;
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
