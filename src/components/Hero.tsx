import React from 'react';
import { ArrowRight, Sparkles, Clock, Truck, Award } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface HeroProps {
  lang: Language;
  onShopClick: () => void;
  onCustomCakeClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ lang, onShopClick, onCustomCakeClick }) => {
  const t = translations[lang];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#160b06] via-[#1e0f08] to-[#160b06] pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-[#30180d]">
      {/* Subtle warm golden ambient backdrop glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#c59b27]/8 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Quiet text kicker with typographic separator */}
            <div className="inline-flex items-center gap-2 text-xs tracking-wider uppercase text-[#c59b27] font-semibold">
              <span>{lang === 'en' ? 'Artisanal Bakery & Patisserie' : 'হস্তনির্মিত চকোলেট বেকারি'}</span>
              <span aria-hidden="true">·</span>
              <span>{lang === 'en' ? 'Balaganj, Sylhet' : 'বালাগঞ্জ, সিলেট'}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-serif font-bold text-[#f7f2eb] leading-[1.15] text-balance">
              {t.tagline}
            </h1>

            {/* Secondary bilingual kicker for authentic connection */}
            <p className="text-base sm:text-lg text-[#e5c158] font-medium font-serif italic">
              {lang === 'en'
                ? '“প্রতিটি আনন্দের মুহূর্তে থাকুক মিষ্টি ছোঁয়া।”'
                : '“Every Celebration Deserves a Beautiful Cake.”'}
            </p>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-[#c4b5a8] leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {t.subtagline}
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={onShopClick}
                className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-gradient-to-r from-[#c59b27] via-[#d4af37] to-[#b38728] hover:from-[#d4af37] hover:to-[#c59b27] text-[#160b06] font-semibold text-sm transition-all shadow-lg hover:shadow-[#c59b27]/20 flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>{t.shopCakes}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onCustomCakeClick}
                className="w-full sm:w-auto px-7 py-3.5 rounded-lg bg-[#251209] hover:bg-[#341b0f] border border-[#4a2614] text-[#f7f2eb] hover:text-[#e5c158] text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#c59b27]" />
                <span>{t.orderCustomCake}</span>
              </button>
            </div>

            {/* Contact reassurance */}
            <div className="pt-2 text-xs text-[#9d8675] flex items-center justify-center lg:justify-start gap-3">
              <span>{lang === 'en' ? 'Direct Baker Hotline / WhatsApp:' : 'হোয়াটসঅ্যাপে সরাসরি অর্ডার:'}</span>
              <a
                href="https://wa.me/8801608627888"
                target="_blank"
                rel="noreferrer"
                className="text-[#e5c158] font-semibold hover:underline"
              >
                +8801608627888
              </a>
            </div>
          </div>

          {/* Right Column: Hero Cake Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-[#432314] shadow-2xl bg-[#1e0e07] group">
              <img
                src="/src/assets/images/hero_chocolate_cake_1792698652472.jpg"
                alt="YUM HUB Signature Chocolate Fudge Cake"
                referrerPolicy="no-referrer"
                className="w-full h-[360px] sm:h-[440px] lg:h-[480px] object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="eager"
              />

              {/* Gradient scrim for subtle luxury contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#160b06]/90 via-[#160b06]/20 to-transparent pointer-events-none" />

              {/* Bottom Caption Overlay */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-[#190d08]/85 backdrop-blur-md border border-[#432314] text-left">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#c59b27] font-semibold uppercase tracking-wider">
                    {lang === 'en' ? 'Masterpiece Special' : 'স্পেশাল সৃষ্টি'}
                  </span>
                  <span className="text-white font-mono tabular-nums font-bold">৳1,350 BDT</span>
                </div>
                <div className="text-sm font-serif font-bold text-[#f7f2eb]">
                  {lang === 'en' ? 'Royal Grand Dark Chocolate Drip Cake' : 'রয়্যাল গ্র্যান্ড ডার্ক চকোলেট ড্রিপ কেক'}
                </div>
                <div className="text-xs text-[#a99485] mt-0.5">
                  {lang === 'en' ? '24K Edible Gold · Fresh Berries · 70% Cocoa' : '২৪ ক্যারেট গোল্ড লিফ · তাজা বেরি · ৭০% কোকো'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full-width 3-pillar Bakery Trust Bar */}
        <div className="mt-14 pt-8 border-t border-[#2e160c] grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-[#201009]/60 border border-[#341b0f]">
            <div className="p-2.5 rounded-lg bg-[#2e170c] text-[#e5c158] shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#f7f2eb]">{t.features.freshBaked}</h3>
              <p className="text-xs text-[#a99485] mt-1 leading-relaxed">{t.features.freshBakedDesc}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-[#201009]/60 border border-[#341b0f]">
            <div className="p-2.5 rounded-lg bg-[#2e170c] text-[#e5c158] shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#f7f2eb]">{t.features.delivery}</h3>
              <p className="text-xs text-[#a99485] mt-1 leading-relaxed">{t.features.deliveryDesc}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-[#201009]/60 border border-[#341b0f]">
            <div className="p-2.5 rounded-lg bg-[#2e170c] text-[#e5c158] shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#f7f2eb]">{t.features.custom}</h3>
              <p className="text-xs text-[#a99485] mt-1 leading-relaxed">{t.features.customDesc}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
