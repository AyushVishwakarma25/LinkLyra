import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  WhatsappIcon,
  ShoppingBag01Icon,
  Clock01Icon,
  Location01Icon,
  CheckmarkCircle01Icon,
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  Menu01Icon,
  ViewIcon,
  Share01Icon,
  SparklesIcon,
  Mail01Icon,
  Edit01Icon,
} from '@hugeicons/core-free-icons';

export interface BusinessDashboardSnapshotProps {
  onOpenStudio: () => void;
  onOpenAuth: () => void;
  currentUser?: any;
}

type BusinessTab = 'whatsapp' | 'products' | 'hours' | 'inquiries';

export const BusinessDashboardSnapshot: React.FC<BusinessDashboardSnapshotProps> = ({
  onOpenStudio,
  onOpenAuth,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<BusinessTab>('whatsapp');
  const [whatsappToggle, setWhatsappToggle] = useState(true);
  const [orderOnlineToggle, setOrderOnlineToggle] = useState(true);

  return (
    <section id="businesses" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-[#E8E8E8]">
      {/* ------------------------------------------------------------- */}
      {/* SECTION HEADER                                                */}
      {/* ------------------------------------------------------------- */}
      <div className="max-w-3xl mx-auto text-center space-y-4 mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E8E8E8] shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold tracking-[0.2em] text-[#666666] uppercase font-mono">
            BUILT FOR MODERN BUSINESSES
          </span>
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#111111] tracking-tight leading-[1.08]">
          Put your brand, products and contact points in one place.
        </h2>

        <p className="text-sm sm:text-base md:text-lg text-[#555555] leading-relaxed">
          Order fresh roast coffee, reserve a pour-over tasting flight via 1-tap WhatsApp, view seasonal menus, and check roastery hours instantly.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => (currentUser ? onOpenStudio() : onOpenAuth())}
            className="px-7 py-3.5 rounded-full bg-[#111111] hover:bg-black text-white text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Build a business page →</span>
          </button>
          <span className="text-xs text-[#888888] font-mono">
            Full-featured studio dashboard included
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SNAPSHOT OF STUDIO DASHBOARD WINDOW                           */}
      {/* ------------------------------------------------------------- */}
      <div className="relative rounded-[28px] sm:rounded-[36px] bg-[#141518] border border-white/10 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.45),0_15px_30px_-10px_rgba(0,0,0,0.3)] overflow-hidden text-white select-none">
        {/* Window Chrome Titlebar */}
        <div className="h-12 px-4 sm:px-6 bg-[#1A1C20] border-b border-white/10 flex items-center justify-between gap-4">
          {/* Mac window dots */}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
            <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
          </div>

          {/* Browser Address & Page Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-xs font-mono text-stone-300">
            <span className="text-stone-500">https://</span>
            <span className="font-semibold text-white">linklyra.com/studio/komorebiroasters/settings</span>
          </div>

          {/* Status Badges */}
          <div className="flex items-center gap-2 text-xs">
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live on /@komorebiroasters
            </span>
            <span className="text-[11px] text-stone-400 font-mono">
              Auto-saved
            </span>
          </div>
        </div>

        {/* Dashboard Sub-Header / Workspace Header */}
        <div className="px-5 sm:px-8 py-4 bg-[#181A1E] border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 bg-stone-800 shrink-0">
              <img
                src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&auto=format&fit=crop&q=80"
                alt="Komorebi Roasters"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base tracking-tight">Komorebi Roasters</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-stone-300 uppercase">
                  Business Pro
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Specialty Micro-Roastery & Slow Bar • Arts District, Los Angeles
              </p>
            </div>
          </div>

          {/* Quick Dashboard Action Pills */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => (currentUser ? onOpenStudio() : onOpenAuth())}
              className="px-3.5 py-1.5 rounded-full bg-white hover:bg-stone-100 text-[#111111] text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Launch Studio</span>
              <HugeiconsIcon icon={ArrowRight01Icon} size={13} />
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* DASHBOARD WORKSPACE: Settings Tabs + Interactive Canvas       */}
        {/* ------------------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
          {/* Left Column: Settings Navigation Tabs */}
          <div className="lg:col-span-4 p-4 sm:p-6 bg-[#16181C] border-b lg:border-b-0 lg:border-r border-white/10 space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 px-3 block">
              Business Configuration Modules
            </span>

            <button
              type="button"
              onClick={() => setActiveTab('whatsapp')}
              className={`w-full text-left p-3.5 rounded-2xl transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                activeTab === 'whatsapp'
                  ? 'bg-[#25D366]/15 border border-[#25D366]/40 text-white shadow-xs'
                  : 'bg-white/[0.03] border border-white/5 hover:bg-white/[0.07] text-stone-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activeTab === 'whatsapp' ? 'bg-[#25D366] text-black font-bold' : 'bg-white/10 text-stone-300'}`}>
                  <HugeiconsIcon icon={WhatsappIcon} size={18} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold">1-Tap WhatsApp Booking</h4>
                  <p className="text-[11px] text-stone-400">Tasting flight table reservations</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeTab === 'whatsapp' ? 'bg-[#25D366]/20 text-[#25D366]' : 'text-stone-500'}`}>
                ACTIVE
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`w-full text-left p-3.5 rounded-2xl transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                activeTab === 'products'
                  ? 'bg-[#D95338]/15 border border-[#D95338]/40 text-white shadow-xs'
                  : 'bg-white/[0.03] border border-white/5 hover:bg-white/[0.07] text-stone-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activeTab === 'products' ? 'bg-[#D95338] text-white font-bold' : 'bg-white/10 text-stone-300'}`}>
                  <HugeiconsIcon icon={ShoppingBag01Icon} size={18} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold">Products & Fresh Roasts</h4>
                  <p className="text-[11px] text-stone-400">Live single-origin coffee stock</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeTab === 'products' ? 'bg-[#D95338]/20 text-[#D95338]' : 'text-stone-500'}`}>
                3 ITEMS
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('hours')}
              className={`w-full text-left p-3.5 rounded-2xl transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                activeTab === 'hours'
                  ? 'bg-[#4F46E5]/15 border border-[#4F46E5]/40 text-white shadow-xs'
                  : 'bg-white/[0.03] border border-white/5 hover:bg-white/[0.07] text-stone-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activeTab === 'hours' ? 'bg-[#4F46E5] text-white font-bold' : 'bg-white/10 text-stone-300'}`}>
                  <HugeiconsIcon icon={Clock01Icon} size={18} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold">Roastery Hours & Location</h4>
                  <p className="text-[11px] text-stone-400">Open now status & map directions</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeTab === 'hours' ? 'bg-[#4F46E5]/20 text-indigo-300' : 'text-stone-500'}`}>
                OPEN NOW
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('inquiries')}
              className={`w-full text-left p-3.5 rounded-2xl transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                activeTab === 'inquiries'
                  ? 'bg-amber-500/15 border border-amber-500/40 text-white shadow-xs'
                  : 'bg-white/[0.03] border border-white/5 hover:bg-white/[0.07] text-stone-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activeTab === 'inquiries' ? 'bg-amber-500 text-black font-bold' : 'bg-white/10 text-stone-300'}`}>
                  <HugeiconsIcon icon={Mail01Icon} size={18} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold">Customer Leads & Inquiries</h4>
                  <p className="text-[11px] text-stone-400">Real-time bookings stream</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeTab === 'inquiries' ? 'bg-amber-500/20 text-amber-300' : 'text-stone-500'}`}>
                LIVE
              </span>
            </button>

            {/* Quick Helper Callout */}
            <div className="pt-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-[11px] font-bold text-stone-300 flex items-center gap-1.5">
                <HugeiconsIcon icon={SparklesIcon} size={14} className="text-[#F8BA38]" />
                Zero-Code Business Builder
              </span>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Connect your WhatsApp number, add your menu, and update opening hours in seconds from mobile or desktop.
              </p>
            </div>
          </div>

          {/* Right Column: Active Module Settings Canvas + Live Mobile Preview */}
          <div className="lg:col-span-8 p-5 sm:p-8 bg-[#121316] flex flex-col justify-between">
            {/* ----------------------------------------------------------- */}
            {/* TAB 1: WHATSAPP 1-TAP RESERVATION SETTINGS                  */}
            {/* ----------------------------------------------------------- */}
            {activeTab === 'whatsapp' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <HugeiconsIcon icon={WhatsappIcon} size={20} className="text-[#25D366]" />
                      1-Tap WhatsApp Tasting Table Booking
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Direct customer chats without third-party reservation commissions or app downloads.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWhatsappToggle(!whatsappToggle)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                      whatsappToggle ? 'bg-[#25D366] text-black' : 'bg-stone-700 text-stone-300'
                    }`}
                  >
                    <span>{whatsappToggle ? 'Enabled' : 'Disabled'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone Input Box */}
                  <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                    <label className="text-[11px] font-mono text-stone-400 uppercase tracking-wider block">
                      Target WhatsApp Number
                    </label>
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/10 font-mono text-sm text-white">
                      <span className="text-[#25D366] font-bold">+1</span>
                      <span>(415) 555-2671</span>
                      <span className="ml-auto text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        Verified API
                      </span>
                    </div>
                  </div>

                  {/* Booking Subject */}
                  <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                    <label className="text-[11px] font-mono text-stone-400 uppercase tracking-wider block">
                      Reservation Experience
                    </label>
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-sm font-medium text-white flex items-center justify-between">
                      <span>Pour-Over Tasting Flight (Origin Cupping)</span>
                      <span className="text-xs font-mono text-stone-400">$18 / person</span>
                    </div>
                  </div>
                </div>

                {/* Pre-filled Message Generator */}
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-mono text-stone-400 uppercase tracking-wider">
                      Pre-filled Customer WhatsApp Message
                    </label>
                    <span className="text-[11px] text-stone-500 font-mono">
                      Opens automatically in visitor WhatsApp
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#0B141A] border border-[#25D366]/30 text-xs sm:text-sm text-stone-200 font-mono flex items-start gap-2.5">
                    <span className="text-[#25D366] text-base leading-none">💬</span>
                    <p className="leading-relaxed">
                      "Hey Komorebi Roasters! I'd like to reserve the Pour-Over Tasting Flight for 2 people this Saturday afternoon. Are there slots available?"
                    </p>
                  </div>
                </div>

                {/* Conversion metric callout */}
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 text-xs text-emerald-300">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} className="text-[#25D366] shrink-0" />
                  <span>
                    <strong>+48% Higher Conversion:</strong> WhatsApp booking opens directly in chat with zero friction, capturing customer phone numbers instantly.
                  </span>
                </div>
              </div>
            )}

            {/* ----------------------------------------------------------- */}
            {/* TAB 2: PRODUCTS & FRESH ROAST COFFEE SETTINGS               */}
            {/* ----------------------------------------------------------- */}
            {activeTab === 'products' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <HugeiconsIcon icon={ShoppingBag01Icon} size={20} className="text-[#D95338]" />
                      Products & Fresh Roast Coffee Inventory
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Showcase today's roast batch, retail bags, and takeaway orders directly on your link.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOrderOnlineToggle(!orderOnlineToggle)}
                    className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>+ Add New Product</span>
                  </button>
                </div>

                {/* Live Products Table */}
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#D95338] text-white flex items-center justify-center font-bold text-sm shrink-0">
                        ☕
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Ethiopian Yirgacheffe (Anaerobic Natural)</h4>
                        <p className="text-xs text-stone-400">Jasmine, wild bergamot, candied peach • Whole Bean 250g</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono text-sm font-bold text-white">$22.00</span>
                      <span className="block text-[10px] text-emerald-400 font-mono">In Stock (18 bags)</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center font-bold text-sm shrink-0">
                        ✨
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Pour-Over Tasting Flight Experience</h4>
                        <p className="text-xs text-stone-400">3 comparative single-origins with origin cards & tasting notes</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono text-sm font-bold text-white">$18.00</span>
                      <span className="block text-[10px] text-emerald-400 font-mono">Available Daily</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#EAB308] text-black flex items-center justify-center font-bold text-sm shrink-0">
                        🥖
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Artisan Sourdough Loaf (Daily Batch)</h4>
                        <p className="text-xs text-stone-400">36-hour slow fermentation with organic stoneground flours</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono text-sm font-bold text-white">$6.50</span>
                      <span className="block text-[10px] text-amber-300 font-mono">Morning Batch (Fresh)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ----------------------------------------------------------- */}
            {/* TAB 3: ROASTERY HOURS & LOCATION SETTINGS                   */}
            {/* ----------------------------------------------------------- */}
            {activeTab === 'hours' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <HugeiconsIcon icon={Clock01Icon} size={20} className="text-[#4F46E5]" />
                      Roastery Hours & Physical Store Location
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Let visitors check today's brewing hours and launch 1-tap navigation to your door.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold">
                    🟢 Open Now (Closes 8:00 PM)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                    <label className="text-[11px] font-mono text-stone-400 uppercase tracking-wider block">
                      Operating Schedule
                    </label>
                    <div className="space-y-1 text-xs font-mono">
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-white">Monday – Friday</span>
                        <span className="text-emerald-400 font-bold">7:30 AM – 8:00 PM</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-white">Saturday – Sunday</span>
                        <span className="text-emerald-400 font-bold">8:00 AM – 8:30 PM</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                    <label className="text-[11px] font-mono text-stone-400 uppercase tracking-wider block">
                      Physical Location & Maps Integration
                    </label>
                    <p className="text-sm font-medium text-white">
                      424 S Spring St, Arts District, Los Angeles, CA 90013
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded-md text-stone-300">
                        1-Tap Google Maps
                      </span>
                      <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded-md text-stone-300">
                        Apple Maps
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Seasonal Tasting Menu PDF & Story</span>
                    <span className="text-xs text-indigo-400 cursor-pointer hover:underline font-mono">
                      Preview Menu (Spring 2026) ↗
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Single-origin profiles, cupping notes, and Japanese slow-bar pour-over options uploaded directly to your link.
                  </p>
                </div>
              </div>
            )}

            {/* ----------------------------------------------------------- */}
            {/* TAB 4: DIRECT INQUIRIES & RECENT LEADS STREAM               */}
            {/* ----------------------------------------------------------- */}
            {activeTab === 'inquiries' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <HugeiconsIcon icon={Mail01Icon} size={20} className="text-amber-400" />
                      Live Customer Inquiries & Bookings Feed
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Direct WhatsApp conversations and roast orders recorded in real-time.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                    3 New Inquiries Today
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white block">Elena Rostova</span>
                      <span className="text-stone-400">Reserved Pour-Over Flight (2 people)</span>
                    </div>
                    <span className="font-mono text-stone-400 text-[11px]">14m ago via WhatsApp</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white block">Marcus Vance</span>
                      <span className="text-stone-400">Purchased 2x Ethiopian Yirgacheffe</span>
                    </div>
                    <span className="font-mono text-stone-400 text-[11px]">38m ago via Order Link</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white block">Sarah Chen</span>
                      <span className="text-stone-400">Private Cupping & Roastery Tour Request</span>
                    </div>
                    <span className="font-mono text-stone-400 text-[11px]">1h 12m ago via WhatsApp</span>
                  </div>
                </div>
              </div>
            )}

            {/* Dashboard Footer Action Strip */}
            <div className="mt-8 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>All business cards synced with mobile live preview</span>
              </div>
              <button
                type="button"
                onClick={() => (currentUser ? onOpenStudio() : onOpenAuth())}
                className="font-bold text-white hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Customize your business cards in Studio</span>
                <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
