import React from 'react';
import { ShoppingBag, Sparkles, Shield, Menu, X } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface NavbarProps {
  lang: Language;
  setLang: (l: Language) => void;
  currentView: string;
  setCurrentView: (v: string) => void;
  cartCount: number;
  openCart: () => void;
  openCustomCakeModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  setLang,
  currentView,
  setCurrentView,
  cartCount,
  openCart,
  openCustomCakeModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const t = translations[lang];

  const handleNav = (view: string) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#160b06]/95 backdrop-blur-md border-b border-[#341b0f]">
      {/* Top Notification Announcement Bar */}
      <div className="bg-[#2a140a] border-b border-[#3d2011] text-xs py-1.5 px-4 text-center text-[#e5c158] flex items-center justify-center gap-3">
        <span className="font-medium tracking-wide">
          {lang === 'en'
            ? 'Fresh Daily Baking in Balaganj, Sylhet · Free Delivery Above ৳2500'
            : 'সিলেটের বালাগঞ্জে প্রতিদিন সকালে তাজা বেকিং · ৳২৫০০ এর বেশি অর্ডারে ফ্রি ডেলিভারি'}
        </span>
        <a
          href="https://wa.me/8801608627888"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-white transition-colors ml-2 hidden sm:inline"
        >
          WhatsApp: +8801608627888
        </a>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => handleNav('home')}
          className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c59b27] via-[#e5c158] to-[#996b13] p-0.5 shadow-md group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#1c0e07] rounded-full flex items-center justify-center">
              <span className="text-sm font-bold tracking-wider text-[#e5c158]">YH</span>
            </div>
          </div>
          <div className="leading-tight">
            <span className="text-2xl font-serif font-bold tracking-wider text-[#f7f2eb] group-hover:text-[#e5c158] transition-colors whitespace-nowrap">
              YUM HUB
            </span>
            <span className="block text-[10px] tracking-widest text-[#a88d79] uppercase">
              {lang === 'en' ? 'Artisanal Bakery' : 'প্রিমিয়াম বেকারি'}
            </span>
          </div>
        </button>

        {/* Zone 2: Desktop Navigation Links (Strict single-line text links) */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#c4b5a8]">
          <button
            onClick={() => handleNav('home')}
            className={`cursor-pointer hover:text-[#e5c158] transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'home' ? 'text-[#e5c158] font-semibold' : ''
            }`}
          >
            {t.home}
          </button>
          <button
            onClick={() => handleNav('catalog')}
            className={`cursor-pointer hover:text-[#e5c158] transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'catalog' ? 'text-[#e5c158] font-semibold' : ''
            }`}
          >
            {t.catalog}
          </button>
          <button
            onClick={openCustomCakeModal}
            className="cursor-pointer hover:text-[#e5c158] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#c59b27]" />
            {t.customOrder}
          </button>
          <button
            onClick={() => handleNav('track')}
            className={`cursor-pointer hover:text-[#e5c158] transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'track' ? 'text-[#e5c158] font-semibold' : ''
            }`}
          >
            {t.trackOrder}
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('footer-contact');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="cursor-pointer hover:text-[#e5c158] transition-colors whitespace-nowrap shrink-0"
          >
            {t.contact}
          </button>
        </nav>

        {/* Zone 3: Actions (Language switcher, Bag, and CTA) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Language Switcher */}
          <div className="flex items-center bg-[#251209] border border-[#3e2013] rounded-md p-0.5 text-xs">
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-1 rounded transition-colors font-medium ${
                lang === 'en' ? 'bg-[#c59b27] text-[#160b06] font-semibold' : 'text-[#c4b5a8] hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('bn')}
              className={`px-2 py-1 rounded transition-colors font-medium ${
                lang === 'bn' ? 'bg-[#c59b27] text-[#160b06] font-semibold' : 'text-[#c4b5a8] hover:text-white'
              }`}
            >
              বাং
            </button>
          </div>

          {/* Cart Bag Button */}
          <button
            onClick={openCart}
            aria-label="Open Shopping Bag"
            className="relative p-2.5 rounded-lg bg-[#251209] hover:bg-[#341b0f] border border-[#3e2013] text-[#f7f2eb] hover:text-[#e5c158] transition-all cursor-pointer flex items-center gap-2"
          >
            <ShoppingBag className="w-5 h-5 text-[#e5c158]" />
            <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider">{t.cart}</span>
            {cartCount > 0 && (
              <span className="bg-[#c59b27] text-[#160b06] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center tabular-nums">
                {cartCount}
              </span>
            )}
          </button>

          {/* Admin Icon button */}
          <button
            onClick={() => handleNav('admin')}
            title="Admin Portal"
            className="p-2.5 rounded-lg bg-[#251209] hover:bg-[#341b0f] border border-[#3e2013] text-[#c4b5a8] hover:text-[#e5c158] transition-colors cursor-pointer hidden md:flex"
          >
            <Shield className="w-4 h-4" />
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-[#c4b5a8] hover:text-white hover:bg-[#251209] border border-[#3e2013]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#1a0e08] border-b border-[#3e2013] px-5 py-4 space-y-3">
          <button
            onClick={() => handleNav('home')}
            className="block w-full text-left py-2 text-sm text-[#f7f2eb] hover:text-[#e5c158]"
          >
            {t.home}
          </button>
          <button
            onClick={() => handleNav('catalog')}
            className="block w-full text-left py-2 text-sm text-[#f7f2eb] hover:text-[#e5c158]"
          >
            {t.catalog}
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              openCustomCakeModal();
            }}
            className="block w-full text-left py-2 text-sm text-[#e5c158] font-medium flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {t.customOrder}
          </button>
          <button
            onClick={() => handleNav('track')}
            className="block w-full text-left py-2 text-sm text-[#f7f2eb] hover:text-[#e5c158]"
          >
            {t.trackOrder}
          </button>
          <button
            onClick={() => handleNav('admin')}
            className="block w-full text-left py-2 text-sm text-[#c4b5a8] hover:text-[#e5c158] flex items-center gap-2 pt-2 border-t border-[#2e170c]"
          >
            <Shield className="w-4 h-4" />
            {t.adminLogin}
          </button>
        </div>
      )}
    </header>
  );
};
