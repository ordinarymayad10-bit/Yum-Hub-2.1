import React, { useState } from 'react';
import { ShoppingBag, Eye, Cake } from 'lucide-react';
import { Product, Language } from '../types';
import { translations } from '../translations';

interface ProductCardProps {
  product: Product;
  lang: Language;
  onSelect: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  lang,
  onSelect,
  onQuickAdd,
}) => {
  const [imgError, setImgError] = useState(false);
  const t = translations[lang];

  const title = lang === 'bn' ? product.name_bn : product.name_en;
  const description = lang === 'bn' ? product.description_bn : product.description_en;

  const lowestPrice = product.sizes && product.sizes.length > 0
    ? Math.min(...product.sizes.map((s) => s.price))
    : product.base_price;

  return (
    <div className="group rounded-xl overflow-hidden bg-[#201009] border border-[#3b1e11] hover:border-[#c59b27]/60 transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-xl hover:shadow-[#c59b27]/5">
      {/* Product Image Slot */}
      <div
        onClick={() => onSelect(product)}
        className="relative h-60 sm:h-64 w-full overflow-hidden bg-[#180c07] cursor-pointer"
      >
        {!imgError && product.image_url ? (
          <img
            src={product.image_url}
            alt={title}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#2a140a] to-[#180c07] p-4 text-center">
            <Cake className="w-10 h-10 text-[#c59b27] mb-2 stroke-1" />
            <span className="text-xs text-[#a99485] font-serif">{title}</span>
          </div>
        )}

        {/* Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#160b06]/70 via-transparent to-transparent pointer-events-none" />

        {/* Hover Quick View Trigger */}
        <div className="absolute inset-0 bg-[#160b06]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="px-4 py-2 rounded-lg bg-[#f7f2eb] text-[#160b06] text-xs font-semibold shadow-md flex items-center gap-1.5 hover:bg-[#e5c158] transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Customize & View' : 'কাস্টমাইজ ও সাইজ'}</span>
          </button>
        </div>

        {/* Availability / Stock Ribbon - Discreet */}
        <div className="absolute top-3 left-3 text-[11px] font-medium tracking-wide">
          {product.in_stock ? (
            product.is_bestseller ? (
              <span className="bg-[#c59b27] text-[#160b06] px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px]">
                {lang === 'en' ? 'Bestseller' : 'সেরা বিক্রিত'}
              </span>
            ) : (
              <span className="bg-[#1e0e07]/80 backdrop-blur-sm text-[#e5c158] px-2 py-0.5 rounded border border-[#432314]">
                {t.inStock}
              </span>
            )
          ) : (
            <span className="bg-red-950/90 text-red-300 px-2 py-0.5 rounded border border-red-800 text-[10px]">
              {t.outOfStock}
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category kicker */}
          <div className="text-[11px] uppercase tracking-wider text-[#a99485] font-medium mb-1">
            {product.category}
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onSelect(product)}
            className="text-base font-serif font-bold text-[#f7f2eb] group-hover:text-[#e5c158] transition-colors cursor-pointer line-clamp-1"
          >
            {title}
          </h3>

          {/* Bengali / English secondary subtitle */}
          <div className="text-xs text-[#b89b88] line-clamp-1 mt-0.5 italic font-serif">
            {lang === 'en' ? product.name_bn : product.name_en}
          </div>

          {/* Description */}
          <p className="text-xs text-[#9d8675] mt-2 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Sizes and Price */}
        <div className="mt-4 pt-3 border-t border-[#31180d]">
          {/* Available Sizes Tagline */}
          <div className="text-[11px] text-[#8e7666] mb-2 flex items-center justify-between">
            <span>
              {product.sizes && product.sizes.length > 0
                ? `${product.sizes.length} ${lang === 'en' ? 'Sizes available' : 'টি সাইজ আছে'}`
                : '1 lb'}
            </span>
            <span className="text-[#a99485]">
              {product.sizes?.[0]?.serves || '3-4 persons'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] text-[#8e7666] uppercase block">
                {t.fromPrice}
              </span>
              <span className="text-lg font-bold font-mono text-[#f7f2eb] tabular-nums">
                ৳{lowestPrice.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelect(product)}
                className="px-3 py-2 rounded-lg bg-[#2e170c] hover:bg-[#3d1f10] border border-[#4a2614] text-[#f7f2eb] hover:text-[#e5c158] text-xs font-medium transition-colors cursor-pointer"
              >
                {lang === 'en' ? 'Details' : 'বিস্তারিত'}
              </button>

              <button
                onClick={() => onQuickAdd(product)}
                disabled={!product.in_stock}
                className="p-2 rounded-lg bg-[#c59b27] hover:bg-[#d4af37] disabled:bg-stone-800 disabled:text-stone-600 text-[#160b06] transition-colors cursor-pointer disabled:cursor-not-allowed shadow-sm"
                title={t.addToCart}
              >
                <ShoppingBag className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
