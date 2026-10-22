import React from 'react';
import { MapPin, Phone, Clock, MessageCircle, Shield, Heart } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface BakeryFooterProps {
  lang: Language;
  onNavigateAdmin: () => void;
  onNavigateCustomCake: () => void;
  onNavigateTrack: () => void;
  onNavigateCatalog: () => void;
}

export const BakeryFooter: React.FC<BakeryFooterProps> = ({
  lang,
  onNavigateAdmin,
  onNavigateCustomCake,
  onNavigateTrack,
  onNavigateCatalog,
}) => {
  const t = translations[lang];

  return (
    <footer id="footer-contact" className="bg-[#120804] border-t border-[#2a1309] text-[#c4b5a8] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand & Story */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#c59b27] via-[#e5c158] to-[#996b13] p-0.5">
                <div className="w-full h-full bg-[#1c0e07] rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-[#e5c158]">YH</span>
                </div>
              </div>
              <span className="text-2xl font-serif font-bold text-[#f7f2eb] tracking-wide">
                YUM HUB
              </span>
            </div>

            <p className="text-xs text-[#a99485] leading-relaxed">
              {lang === 'en'
                ? 'Balaganj’s premier artisanal chocolate bakery boutique. Handcrafting bespoke chocolate celebration cakes, cupcakes, brownies, and decadent gourmet delights for life’s most cherished celebrations.'
                : 'বালাগঞ্জ ও সিলেটের প্রিয় চকলেট বেকারি। জন্মদিন, বিবাহ ও যেকোনো বিশেষ মুহূর্তে খাঁটি চকোলেট ও প্রিমিয়াম উপাদানে তৈরি কেক ও বেকড ডিলাইটস।'}
            </p>

            <div className="pt-2">
              <a
                href="https://wa.me/8801608627888"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/30 transition-colors font-semibold"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp: +8801608627888</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#f7f2eb]">
              {lang === 'en' ? 'Bakery' : 'বেকারি'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={onNavigateCatalog}
                  className="hover:text-[#e5c158] transition-colors cursor-pointer"
                >
                  {t.catalog}
                </button>
              </li>
              <li>
                <button
                  onClick={onNavigateCustomCake}
                  className="hover:text-[#e5c158] transition-colors cursor-pointer"
                >
                  {t.customOrder}
                </button>
              </li>
              <li>
                <button
                  onClick={onNavigateTrack}
                  className="hover:text-[#e5c158] transition-colors cursor-pointer"
                >
                  {t.trackOrder}
                </button>
              </li>
              <li>
                <button
                  onClick={onNavigateAdmin}
                  className="hover:text-[#e5c158] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5 text-[#c59b27]" />
                  <span>{t.adminLogin}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Delivery & Areas */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#f7f2eb]">
              {lang === 'en' ? 'Delivery Coverage' : 'ডেলিভারি এরিয়া'}
            </h4>
            <div className="space-y-2 text-xs text-[#a99485] leading-relaxed">
              <p>
                <strong className="text-white">Balaganj Sadar:</strong> ৳60 delivery · Same-day delivery available for orders placed before 2:00 PM.
              </p>
              <p>
                <strong className="text-white">Sylhet Metro & Osmani Nagar:</strong> ৳120 delivery · Insulated temperature-safe cake box.
              </p>
              <p className="text-[#e5c158] font-medium">
                ★ Free delivery on orders exceeding ৳2,500 BDT.
              </p>
            </div>
          </div>

          {/* Contact & Studio Info */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#f7f2eb]">
              {lang === 'en' ? 'Store & Studio' : 'ঠিকানা ও স্টুডিও'}
            </h4>
            <div className="space-y-2.5 text-xs text-[#a99485]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#c59b27] shrink-0 mt-0.5" />
                <span>Balaganj Bazar Road, Balaganj, Sylhet 3120, Bangladesh</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#c59b27] shrink-0" />
                <a href="tel:+8801608627888" className="hover:text-white transition-colors">
                  +8801608627888
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#c59b27] shrink-0" />
                <span>9:00 AM – 10:00 PM (Daily)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & admin discreet link */}
        <div className="mt-12 pt-6 border-t border-[#231007] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#7d6757]">
          <div className="flex items-center gap-1">
            <span>© {new Date().getFullYear()} YUM HUB Bakery.</span>
            <span>{t.rightsReserved}</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[#8e7666]">Crafted with devotion for sweet celebrations.</span>
            <button
              onClick={onNavigateAdmin}
              className="text-[#99775f] hover:text-[#e5c158] transition-colors cursor-pointer flex items-center gap-1"
            >
              <Shield className="w-3 h-3" />
              <span>Admin Access</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
