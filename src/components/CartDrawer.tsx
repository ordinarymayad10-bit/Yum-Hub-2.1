import React from 'react';
import { X, Trash2, ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';
import { CartItem, Language } from '../types';
import { translations } from '../translations';

interface CartDrawerProps {
  isOpen: boolean;
  lang: Language;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: number, sizeLabel: string, qty: number) => void;
  onRemoveItem: (id: number, sizeLabel: string) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  lang,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) => {
  if (!isOpen) return null;

  const t = translations[lang];

  const subtotal = items.reduce(
    (acc, item) => acc + item.selectedSize.price * item.quantity,
    0
  );

  const freeDeliveryThreshold = 2500;
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#1a0d07] border-l border-[#3a1d10] shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-[#31180c] flex items-center justify-between bg-[#221008]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#31180d] text-[#e5c158]">
                <ShoppingBag className="w-5 h-5 text-[#c59b27]" />
              </div>
              <div>
                <h2 className="text-base font-serif font-bold text-[#f7f2eb]">
                  {t.cart} ({items.reduce((sum, i) => sum + i.quantity, 0)})
                </h2>
                <span className="text-[11px] text-[#a99485]">YUM HUB Bakery Store</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#c4b5a8] hover:text-white hover:bg-[#31180d] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Delivery Tracker */}
          <div className="bg-[#241209] px-5 py-2.5 border-b border-[#31180c] text-xs">
            {remainingForFreeDelivery > 0 ? (
              <div className="text-[#c4b5a8]">
                {lang === 'en' ? (
                  <>Add <strong className="text-[#e5c158]">৳{remainingForFreeDelivery.toLocaleString()}</strong> more for <strong>Free Delivery</strong> in Sylhet!</>
                ) : (
                  <>আর মাত্র <strong className="text-[#e5c158]">৳{remainingForFreeDelivery.toLocaleString()}</strong> টাকার অর্ডারে <strong>ফ্রি ডেলিভারি</strong>!</>
                )}
              </div>
            ) : (
              <div className="text-emerald-400 font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? '🎉 You qualify for Free Delivery!' : '🎉 আপনি ফ্রি ডেলিভারি পাচ্ছেন!'}</span>
              </div>
            )}
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#251209] border border-[#3e2013] flex items-center justify-center text-[#8e7666]">
                  <ShoppingBag className="w-8 h-8 stroke-1" />
                </div>
                <h3 className="text-base font-serif font-semibold text-[#f7f2eb]">
                  {t.cartEmpty}
                </h3>
                <p className="text-xs text-[#a99485] leading-relaxed max-w-xs">
                  {t.cartEmptySub}
                </p>
                <button
                  onClick={onClose}
                  className="mt-3 px-5 py-2.5 rounded-lg bg-[#2e170c] hover:bg-[#3d1f10] border border-[#4a2614] text-xs text-[#e5c158] font-semibold cursor-pointer"
                >
                  {t.continueShopping}
                </button>
              </div>
            ) : (
              items.map((item, index) => {
                const itemTotal = item.selectedSize.price * item.quantity;
                return (
                  <div
                    key={`${item.id}-${item.selectedSize.size}-${index}`}
                    className="p-3.5 rounded-xl bg-[#221008] border border-[#381c0f] flex gap-3.5 items-start"
                  >
                    <img
                      src={item.product.image_url}
                      alt={item.product.name_en}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-lg object-cover bg-[#160b06] border border-[#31180d] shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-serif font-bold text-[#f7f2eb] truncate">
                          {lang === 'bn' ? item.product.name_bn : item.product.name_en}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.id, item.selectedSize.size)}
                          className="text-[#8e7666] hover:text-red-400 transition-colors p-0.5 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[11px] text-[#c59b27] font-medium mt-0.5">
                        {item.selectedSize.size}
                      </div>

                      {item.cake_message && (
                        <div className="text-[10px] text-[#a99485] bg-[#1a0d07] px-2 py-0.5 rounded mt-1 border border-[#2e160c] italic">
                          "{item.cake_message}"
                        </div>
                      )}

                      <div className="mt-2.5 flex items-center justify-between">
                        <div className="flex items-center bg-[#190d07] border border-[#361a0e] rounded">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, item.selectedSize.size, item.quantity - 1)}
                            className="px-2 py-0.5 text-xs text-[#c4b5a8] hover:text-white cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-mono font-bold text-white tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, item.selectedSize.size, item.quantity + 1)}
                            className="px-2 py-0.5 text-xs text-[#c4b5a8] hover:text-white cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <span className="text-xs font-bold font-mono text-[#f7f2eb] tabular-nums">
                          ৳{itemTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout Trigger */}
          {items.length > 0 && (
            <div className="p-5 border-t border-[#31180c] bg-[#221008] space-y-3">
              <div className="flex items-center justify-between text-xs text-[#c4b5a8]">
                <span>{t.subtotal}</span>
                <span className="text-sm font-mono font-bold text-[#f7f2eb] tabular-nums">
                  ৳{subtotal.toLocaleString()} BDT
                </span>
              </div>

              <div className="text-[11px] text-[#8e7666]">
                {lang === 'en'
                  ? 'Delivery fees will be calculated at checkout based on Balaganj or Sylhet area.'
                  : 'বালাগঞ্জ বা সিলেট এলাকার ওপর ভিত্তি করে চেকআউটে ডেলিভারি চার্জ যোগ হবে।'}
              </div>

              <button
                onClick={() => {
                  onClose();
                  onCheckout();
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#c59b27] via-[#d4af37] to-[#b38728] hover:from-[#d4af37] hover:to-[#c59b27] text-[#160b06] text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t.proceedToCheckout}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
