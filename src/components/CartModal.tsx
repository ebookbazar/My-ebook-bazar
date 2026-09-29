import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onProceedCheckout?: () => void;
  onProceedToCheckout?: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({ 
  isOpen, 
  onClose, 
  onProceedCheckout, 
  onProceedToCheckout 
}) => {
  const { cart, removeFromCart, updateQuantity, clearCart, totalAmount, isCartOpen, setIsCartOpen } = useCart();

  const handleClose = () => {
    if (onClose) onClose();
    else setIsCartOpen(false);
  };

  const handleCheckout = () => {
    if (onProceedToCheckout) onProceedToCheckout();
    else if (onProceedCheckout) onProceedCheckout();
  };

  const shouldShow = isOpen !== undefined ? isOpen : isCartOpen;
  if (!shouldShow) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto flex items-center justify-center animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-[#15803d] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-300" />
            <h3 className="font-black text-base">আপনার শপিং কার্ট</h3>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="text-white/80 hover:text-white w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 stroke-[1.5]" />
              <p className="font-black text-slate-700 text-sm">আপনার কার্ট খালি রয়েছে</p>
              <p className="text-xs text-slate-500">মার্কেটপ্লেস থেকে পছন্দের ই-বুক কার্টে যোগ করুন।</p>
            </div>
          ) : (
            <>
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200"
                  >
                    <img 
                      src={item.coverUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200&auto=format&fit=crop'} 
                      alt={item.title} 
                      className="w-12 h-16 object-cover rounded-lg bg-slate-200 shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-slate-900 text-xs md:text-sm truncate">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500">
                        ৳{item.price} × {item.qty} = <span className="font-bold text-emerald-700">৳{item.price * item.qty}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button 
                        onClick={() => updateQuantity(item.id, item.qty - 1)}
                        className="w-7 h-7 rounded-lg bg-slate-200 hover:bg-slate-300 font-black text-xs flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="font-black text-xs text-slate-900 px-1">{item.qty}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.qty + 1)}
                        className="w-7 h-7 rounded-lg bg-slate-200 hover:bg-slate-300 font-black text-xs flex items-center justify-center"
                      >
                        +
                      </button>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-rose-500 hover:text-rose-700 ml-1 p-1"
                        title="রিমুভ করুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Summary */}
              <div className="pt-3 border-t border-slate-200 flex justify-between items-center font-black">
                <span className="text-sm text-slate-700">সর্বমোট প্রদেয়:</span>
                <span className="text-2xl text-emerald-700">৳{totalAmount}</span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={clearCart}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition"
                >
                  কার্ট খালি করুন
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    handleCheckout();
                  }}
                  className="bg-[#15803d] hover:bg-emerald-800 text-white font-black text-xs py-3 rounded-xl transition shadow flex items-center justify-center gap-1.5"
                >
                  <span>চেকআউট করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
