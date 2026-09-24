import React from 'react';
import { HugeIcon } from '../HugeIcon';
import { Analytics01Icon, PlayIcon, ShoppingBag01Icon } from '@hugeicons/core-free-icons';
import { CardTemplateType } from '../../types';

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
}) => {
  return (
    <>
      {/* CREATOR STATS FIELDS */}
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

      {/* FEATURED WORK FIELDS */}
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

      {/* AFFILIATE RECOMMENDATION */}
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
