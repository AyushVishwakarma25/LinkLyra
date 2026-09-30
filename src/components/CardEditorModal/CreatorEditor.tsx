import React from 'react';
import { HugeIcon } from '../HugeIcon';
import {
  Analytics01Icon,
  PlayIcon,
  ShoppingBag01Icon,
  DollarSquareIcon,
  Calendar01Icon,
  PlusSignIcon,
  Delete02Icon,
} from '@hugeicons/core-free-icons';
import { CardTemplateType, TourDateItem } from '../../types';

export interface CreatorEditorProps {
  templateType: CardTemplateType;
  // Creator Stats
  instagramFollowers: string;
  setInstagramFollowers: (val: string) => void;
  engagementRate: string;
  setEngagementRate: (val: string) => void;
  monthlyReach: string;
  setMonthlyReach: (val: string) => void;
  primaryNiche: string;
  setPrimaryNiche: (val: string) => void;
  // Featured Work
  brandName: string;
  setBrandName: (val: string) => void;
  resultsMetric: string;
  setResultsMetric: (val: string) => void;
  clientTestimonial: string;
  setClientTestimonial: (val: string) => void;
  // Recommendation
  productName: string;
  setProductName: (val: string) => void;
  recommendationBrand: string;
  setRecommendationBrand: (val: string) => void;
  discountCode: string;
  setDiscountCode: (val: string) => void;
  productPrice: string;
  setProductPrice: (val: string) => void;
  setTitle: (val: string) => void;

  // Direct UPI & Tip Jar
  upiId?: string;
  setUpiId?: (val: string) => void;
  creatorTipName?: string;
  setCreatorTipName?: (val: string) => void;
  thankYouMessage?: string;
  setThankYouMessage?: (val: string) => void;
  presetAmountsStr?: string;
  setPresetAmountsStr?: (val: string) => void;

  // Live Tour Dates
  tourTitle?: string;
  setTourTitle?: (val: string) => void;
  tourDatesList?: TourDateItem[];
  setTourDatesList?: (val: TourDateItem[]) => void;
}

export const CreatorEditor: React.FC<CreatorEditorProps> = ({
  templateType,
  instagramFollowers,
  setInstagramFollowers,
  engagementRate,
  setEngagementRate,
  monthlyReach,
  setMonthlyReach,
  primaryNiche,
  setPrimaryNiche,
  brandName,
  setBrandName,
  resultsMetric,
  setResultsMetric,
  clientTestimonial,
  setClientTestimonial,
  productName,
  setProductName,
  recommendationBrand,
  setRecommendationBrand,
  discountCode,
  setDiscountCode,
  productPrice,
  setProductPrice,
  setTitle,
  upiId = '',
  setUpiId,
  creatorTipName = '',
  setCreatorTipName,
  thankYouMessage = '',
  setThankYouMessage,
  presetAmountsStr = '100, 250, 500, 1000',
  setPresetAmountsStr,
  tourTitle = '',
  setTourTitle,
  tourDatesList = [],
  setTourDatesList,
}) => {
  return (
    <>
      {/* 1. DIRECT UPI TIP JAR */}
      {templateType === 'tip_support' && (
        <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-3.5 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <HugeIcon icon={DollarSquareIcon} size={16} />
            </span>
            <div>
              <h4 className="font-bold text-xs text-stone-900 uppercase tracking-wider">
                Direct Fan Tips & Support (0% Platform Fee)
              </h4>
              <p className="text-[11px] text-stone-500">
                Fans can pay you directly via Google Pay, PhonePe, or Paytm straight into your bank account.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1">
                Your UPI ID (VPA) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ayush@okhdfcbank or 9876543210@paytm"
                value={upiId}
                onChange={(e) => setUpiId?.(e.target.value.trim())}
                className="w-full px-3.5 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs font-mono font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[10px] text-stone-500 mt-1">
                Find this in your Google Pay, PhonePe, or Paytm profile. 100% of money goes straight to you.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Creator Display Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ayush or Creator Studio"
                  value={creatorTipName}
                  onChange={(e) => setCreatorTipName?.(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Preset Tip Amounts (₹)
                </label>
                <input
                  type="text"
                  placeholder="100, 250, 500, 1000"
                  value={presetAmountsStr}
                  onChange={(e) => setPresetAmountsStr?.(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Personal Thank You Message
              </label>
              <input
                type="text"
                placeholder="Thanks for fueling my creative journey! ☕"
                value={thankYouMessage}
                onChange={(e) => setThankYouMessage?.(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. LIVE TOUR DATES & TICKETS */}
      {templateType === 'live_tour' && (
        <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-3.5 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
              <HugeIcon icon={Calendar01Icon} size={16} />
            </span>
            <div>
              <h4 className="font-bold text-xs text-stone-900 uppercase tracking-wider">
                Live Tour Dates & Ticket Links
              </h4>
              <p className="text-[11px] text-stone-500">
                Display upcoming shows, cities, venues, and direct ticketing buttons.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Tour / Show Series Title
              </label>
              <input
                type="text"
                placeholder="e.g. Late Night Laughs India Tour 2026"
                value={tourTitle}
                onChange={(e) => setTourTitle?.(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs font-medium"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                  Upcoming Tour Stops ({tourDatesList.length})
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const newItem: TourDateItem = {
                      id: `tour_${Date.now()}`,
                      city: 'Bengaluru',
                      venue: 'Good Shepherd Auditorium',
                      date: 'Sat, Dec 12',
                      ticketUrl: 'https://insider.in',
                    };
                    setTourDatesList?.([...tourDatesList, newItem]);
                  }}
                  className="px-2 py-1 rounded-lg text-xs font-bold bg-[#1C1E22] text-white hover:bg-black transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <HugeIcon icon={PlusSignIcon} size={12} />
                  <span>Add Stop</span>
                </button>
              </div>

              {tourDatesList.map((stop, index) => (
                <div key={stop.id || index} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="City (e.g. Mumbai)"
                      value={stop.city}
                      onChange={(e) => {
                        const updated = [...tourDatesList];
                        updated[index].city = e.target.value;
                        setTourDatesList?.(updated);
                      }}
                      className="px-2.5 py-1.5 bg-white rounded-lg border border-stone-200 text-xs font-bold"
                    />
                    <input
                      type="text"
                      placeholder="Date (e.g. Fri, Nov 20)"
                      value={stop.date}
                      onChange={(e) => {
                        const updated = [...tourDatesList];
                        updated[index].date = e.target.value;
                        setTourDatesList?.(updated);
                      }}
                      className="px-2.5 py-1.5 bg-white rounded-lg border border-stone-200 text-xs text-amber-700 font-semibold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Venue (e.g. NCPA Hall)"
                      value={stop.venue}
                      onChange={(e) => {
                        const updated = [...tourDatesList];
                        updated[index].venue = e.target.value;
                        setTourDatesList?.(updated);
                      }}
                      className="px-2.5 py-1.5 bg-white rounded-lg border border-stone-200 text-xs"
                    />
                    <input
                      type="url"
                      placeholder="Ticket Booking URL"
                      value={stop.ticketUrl || ''}
                      onChange={(e) => {
                        const updated = [...tourDatesList];
                        updated[index].ticketUrl = e.target.value;
                        setTourDatesList?.(updated);
                      }}
                      className="px-2.5 py-1.5 bg-white rounded-lg border border-stone-200 text-xs font-mono"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-1.5 text-xs text-stone-600 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(stop.soldOut)}
                        onChange={(e) => {
                          const updated = [...tourDatesList];
                          updated[index].soldOut = e.target.checked;
                          setTourDatesList?.(updated);
                        }}
                        className="rounded text-red-600"
                      />
                      <span>Mark as Sold Out</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = tourDatesList.filter((_, i) => i !== index);
                        setTourDatesList?.(updated);
                      }}
                      className="text-stone-400 hover:text-red-600 transition-colors p-1"
                      title="Remove tour date"
                    >
                      <HugeIcon icon={Delete02Icon} size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. CREATOR STATS FIELDS */}
      {templateType === 'creator_stats' && (
        <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-3">
          <h4 className="font-bold text-xs text-purple-900 uppercase tracking-wider flex items-center gap-1">
            <HugeIcon icon={Analytics01Icon} size={14} className="w-3.5 h-3.5" /> Audience & Engagement Metrics
          </h4>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-stone-700 block mb-1">Followers</label>
              <input
                type="text"
                value={instagramFollowers}
                onChange={(e) => setInstagramFollowers(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold text-center"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-stone-700 block mb-1">Avg Engagement</label>
              <input
                type="text"
                value={engagementRate}
                onChange={(e) => setEngagementRate(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold text-center text-emerald-600"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-stone-700 block mb-1">Monthly Reach</label>
              <input
                type="text"
                value={monthlyReach}
                onChange={(e) => setMonthlyReach(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold text-center text-amber-600"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">Creator Niche</label>
            <input
              type="text"
              placeholder="e.g. AI Tools, Productivity, Tech & Design"
              value={primaryNiche}
              onChange={(e) => setPrimaryNiche(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs"
            />
          </div>
        </div>
      )}

      {/* 4. FEATURED WORK FIELDS */}
      {templateType === 'featured_work' && (
        <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-3">
          <h4 className="font-bold text-xs text-purple-900 uppercase tracking-wider flex items-center gap-1">
            <HugeIcon icon={PlayIcon} size={14} className="w-3.5 h-3.5" /> Featured Reel / Video Showcase
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Sponsoring Brand</label>
              <input
                type="text"
                placeholder="e.g. Notion or Samsung"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Results Metric</label>
              <input
                type="text"
                placeholder="e.g. 🔥 420K Views • 14% Click Rate"
                value={resultsMetric}
                onChange={(e) => setResultsMetric(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">Client Quote / Testimonial</label>
            <input
              type="text"
              placeholder="e.g. One of our highest performing sponsored campaigns!"
              value={clientTestimonial}
              onChange={(e) => setClientTestimonial(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs"
            />
          </div>
        </div>
      )}

      {/* 5. AFFILIATE RECOMMENDATION */}
      {templateType === 'recommendation' && (
        <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-3">
          <h4 className="font-bold text-xs text-purple-900 uppercase tracking-wider flex items-center gap-1">
            <HugeIcon icon={ShoppingBag01Icon} size={14} className="w-3.5 h-3.5" /> Affiliate Product / Gear Details
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Product Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Shure SM7B Microphone"
                value={productName}
                onChange={(e) => {
                  setProductName(e.target.value);
                  setTitle(e.target.value);
                }}
                className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Brand Name</label>
              <input
                type="text"
                placeholder="e.g. Shure Audio"
                value={recommendationBrand}
                onChange={(e) => setRecommendationBrand(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Discount Code (1-Tap Copy)</label>
              <input
                type="text"
                placeholder="e.g. CREATOR20"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs font-mono font-bold text-purple-700"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Price</label>
              <input
                type="text"
                placeholder="e.g. $399"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
