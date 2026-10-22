import React, { useState } from 'react';
import { X, ShoppingBag, ArrowRight, Check, Sparkles, Cake } from 'lucide-react';
import { Product, CakeSize, Language } from '../types';
import { translations } from '../translations';

interface ProductModalProps {
  product: Product | null;
  lang: Language;
  onClose: () => void;
  onAddToCart: (product: Product, size: CakeSize, quantity: number, message?: string) => void;
  onBuyNow: (product: Product, size: CakeSize, quantity: number, message?: string) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  lang,
  onClose,
  onAddToCart,
  onBuyNow,
}) => {
  if (!product) return null;

  const t = translations[lang];
  const initialSize = product.sizes && product.sizes.length > 0
    ? product.sizes[0]
    : { size: 'Standard', weight: '1 lb', price: product.base_price, serves: '3-4 persons' };

  const [selectedSize, setSelectedSize] = useState<CakeSize>(initialSize);
  const [quantity, setQuantity] = useState<number>(1);
  const [cakeMessage, setCakeMessage] = useState<string>('');
  const [addedAnimation, setAddedAnimation] = useState(false);

  const title = lang === 'bn' ? product.name_bn : product.name_en;
  const description = lang === 'bn' ? product.description_bn : product.description_en;
  const unitPrice = selectedSize.price;
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    onAddToCart(product, selectedSize, quantity, cakeMessage);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 600);
  };

  const handleBuy = () => {
    onBuyNow(product, selectedSize, quantity, cakeMessage);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-2xl bg-[#1c0e07] border border-[#3f2113] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-[#2a140a]/80 hover:bg-[#3d1f0f] text-[#c4b5a8] hover:text-white transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Top Info Header */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            <div className="sm:col-span-5 relative h-56 rounded-xl overflow-hidden bg-[#251209] border border-[#3b1e11]">
              <img
                src={product.image_url}
                alt={title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#160b06]/60 to-transparent pointer-events-none" />
              <div className="absolute bottom-2 left-2 right-2 text-[10px] text-[#e5c158] font-medium bg-[#160b06]/80 px-2 py-1 rounded border border-[#3b1e11]">
                {product.category}
              </div>
            </div>

            <div className="sm:col-span-7 space-y-2">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#f7f2eb] leading-tight">
                {title}
              </h2>
              <p className="text-xs text-[#b89b88] font-serif italic">
                {lang === 'en' ? product.name_bn : product.name_en}
              </p>
              <p className="text-xs text-[#a99485] leading-relaxed pt-1">
                {description}
              </p>

              <div className="pt-2 flex items-baseline gap-3">
                <span className="text-2xl font-bold font-mono text-[#e5c158] tabular-nums">
                  ৳{totalPrice.toLocaleString()} BDT
                </span>
                {quantity > 1 && (
                  <span className="text-xs text-[#8e7666]">
                    (৳{unitPrice.toLocaleString()} × {quantity})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Size / Weight Selector */}
          <div className="space-y-3 pt-2 border-t border-[#31180d]">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-[#f7f2eb]">{t.selectSize}</label>
              {selectedSize.serves && (
                <span className="text-[#a99485]">
                  {t.serves}: <strong className="text-[#e5c158]">{selectedSize.serves}</strong>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {product.sizes?.map((sizeObj, idx) => {
                const isSelected = selectedSize.size === sizeObj.size;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedSize(sizeObj)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#2f180c] border-[#c59b27] shadow-sm'
                        : 'bg-[#201009] border-[#381c0f] hover:border-[#4d2817]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold text-[#f7f2eb]">{sizeObj.size}</div>
                      {sizeObj.serves && (
                        <div className="text-[10px] text-[#a99485] mt-0.5">{sizeObj.serves}</div>
                      )}
                    </div>
                    <div className="text-xs font-mono font-bold text-[#e5c158] tabular-nums">
                      ৳{sizeObj.price.toLocaleString()}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Message to write on the Cake */}
          <div className="space-y-2 pt-2 border-t border-[#31180d]">
            <label className="block text-xs font-semibold text-[#f7f2eb] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#c59b27]" />
              {t.customMessagePrompt}
            </label>
            <input
              type="text"
              value={cakeMessage}
              onChange={(e) => setCakeMessage(e.target.value)}
              placeholder={t.customMessagePlaceholder}
              maxLength={45}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#251209] border border-[#3e2013] text-sm text-[#f7f2eb] placeholder-[#7d6757] focus:outline-none focus:border-[#c59b27] transition-colors"
            />
            <p className="text-[10px] text-[#8e7666]">
              {lang === 'en'
                ? 'Hand-piped in chocolate script on an edible sugar plaque.'
                : 'চকোলেটের সুবিন্যস্ত লিপিতে কেকের ওপরে লিখে দেওয়া হবে।'}
            </p>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-[#31180d]">
            <span className="text-xs font-semibold text-[#f7f2eb]">{t.quantity}</span>
            <div className="flex items-center bg-[#251209] border border-[#3e2013] rounded-lg">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-1 text-sm text-[#c4b5a8] hover:text-white cursor-pointer"
              >
                -
              </button>
              <span className="px-3 py-1 text-xs font-mono font-bold text-white tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3 py-1 text-sm text-[#c4b5a8] hover:text-white cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
            <button
              onClick={handleAdd}
              disabled={!product.in_stock}
              className="px-5 py-3 rounded-lg bg-[#2e170c] hover:bg-[#3d1f10] border border-[#4a2614] text-[#f7f2eb] hover:text-[#e5c158] text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {addedAnimation ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'en' ? 'Added!' : 'যুক্ত হয়েছে!'}</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 text-[#c59b27]" />
                  <span>{t.addToCart}</span>
                </>
              )}
            </button>

            <button
              onClick={handleBuy}
              disabled={!product.in_stock}
              className="px-5 py-3 rounded-lg bg-gradient-to-r from-[#c59b27] via-[#d4af37] to-[#b38728] hover:from-[#d4af37] hover:to-[#c59b27] text-[#160b06] text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{t.buyNow}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
