import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ViewIcon,
  TrendingUpIcon,
  ChartBarLineIcon,
  SmartPhone01Icon,
  ComputerIcon,
  Tablet01Icon,
  Copy01Icon,
  CheckmarkCircle01Icon,
} from '@hugeicons/core-free-icons';
import { UserProfile, SpecializedAnalyticsSummary } from '../../types';
import { COLOR_CONFIG } from '../ProfileCard';

export interface AnalyticsTabProps {
  profile: UserProfile;
  analyticsData: SpecializedAnalyticsSummary | null;
  isLoadingStats: boolean;
  analyticsDays: 7 | 30 | 90;
  setAnalyticsDays: (days: 7 | 30 | 90) => void;
  copiedAnalyticsLink: boolean;
  setCopiedAnalyticsLink: (val: boolean) => void;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  profile,
  analyticsData,
  isLoadingStats,
  analyticsDays,
  setAnalyticsDays,
  copiedAnalyticsLink,
  setCopiedAnalyticsLink,
}) => {
  return (
    <div className="space-y-4 max-w-full">
      {/* Header with Date Range Selector */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-xs font-bold text-[#1C1E22] truncate">Traffic & Performance</h3>
          <p className="text-[11px] text-[#737882] mt-0.5">
            Daily rollups & link performance
          </p>
        </div>
        <div className="flex items-center bg-black/5 p-0.5 rounded-xl text-[10px] font-bold shrink-0">
          {([7, 30, 90] as const).map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setAnalyticsDays(days)}
              className={`px-2 py-1 rounded-lg transition-all ${
                analyticsDays === days
                  ? 'bg-white text-[#1C1E22] shadow-2xs'
                  : 'text-[#737882] hover:text-[#1C1E22]'
              }`}
            >
              {days}D
            </button>
          ))}
        </div>
      </div>

      {isLoadingStats ? (
        /* Loading Skeleton */
        <div className="space-y-3 animate-pulse">
          <div className="grid grid-cols-3 gap-2">
            <div className="h-20 bg-black/5 rounded-2xl" />
            <div className="h-20 bg-black/5 rounded-2xl" />
            <div className="h-20 bg-black/5 rounded-2xl" />
          </div>
          <div className="h-24 bg-black/5 rounded-2xl" />
          <div className="h-32 bg-black/5 rounded-2xl" />
        </div>
      ) : !analyticsData || (analyticsData.totalViews === 0 && analyticsData.totalClicks === 0) ? (
        /* Empty State */
        <div className="p-6 bg-white rounded-3xl border border-black/10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] border border-black/5 flex items-center justify-center mx-auto text-[#5E4BF7]">
            <HugeiconsIcon icon={ChartBarLineIcon} size={22} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1C1E22]">No activity recorded in past {analyticsDays} days</h4>
            <p className="text-[11px] text-[#737882] mt-1 leading-relaxed">
              Page views and link clicks will automatically aggregate here as visitors explore your page.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              const publicUrl = profile.username ? `${window.location.origin}/@${profile.username}` : window.location.origin;
              navigator.clipboard.writeText(publicUrl);
              setCopiedAnalyticsLink(true);
              setTimeout(() => setCopiedAnalyticsLink(false), 2000);
            }}
            className="w-full py-2.5 rounded-xl bg-[#5E4BF7] hover:bg-[#4E3BE5] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <HugeiconsIcon icon={copiedAnalyticsLink ? CheckmarkCircle01Icon : Copy01Icon} size={14} />
            <span>{copiedAnalyticsLink ? 'Link Copied!' : 'Copy Link to Share'}</span>
          </button>
        </div>
      ) : (
        /* Active Analytics Dashboard */
        <>
          {/* Key Metrics Overview Cards */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 bg-white rounded-2xl border border-black/10 shadow-2xs space-y-1 min-w-0">
              <div className="flex items-center justify-between text-[#737882]">
                <span className="text-[9px] font-bold uppercase truncate">Views</span>
                <HugeiconsIcon icon={ViewIcon} size={12} className="text-[#5E4BF7] shrink-0" />
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-[#1C1E22] truncate">
                {analyticsData.totalViews.toLocaleString()}
              </div>
              <div className="text-[9px] text-emerald-600 font-semibold flex items-center gap-0.5 truncate">
                <HugeiconsIcon icon={TrendingUpIcon} size={10} className="shrink-0" />
                <span>{analyticsDays}D Rollup</span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-black/10 shadow-2xs space-y-1 min-w-0">
              <div className="flex items-center justify-between text-[#737882]">
                <span className="text-[9px] font-bold uppercase truncate">Clicks</span>
                <HugeiconsIcon icon={TrendingUpIcon} size={12} className="text-[#E75646] shrink-0" />
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-[#1C1E22] truncate">
                {analyticsData.totalClicks.toLocaleString()}
              </div>
              <div className="text-[9px] text-[#737882] font-semibold truncate">
                Verified link clicks
              </div>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-black/10 shadow-2xs space-y-1 min-w-0">
              <div className="flex items-center justify-between text-[#737882]">
                <span className="text-[9px] font-bold uppercase truncate">Click Rate</span>
                <HugeiconsIcon icon={TrendingUpIcon} size={12} className="text-[#F8BA38] shrink-0" />
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-[#1C1E22] truncate">
                {analyticsData.ctr || '0.0'}%
              </div>
              <div className="text-[9px] text-[#737882] font-semibold truncate">
                CTR
              </div>
            </div>
          </div>

          {/* Lead Inquiries / Conversions Summary if any */}
          {((analyticsData.packageBookings || 0) + (analyticsData.brandInquiries || 0) + (analyticsData.showingRequests || 0) + (analyticsData.homeValuations || 0) + (analyticsData.generalContacts || 0)) > 0 && (
            <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-black/5 space-y-2">
              <label className="text-[10px] font-bold text-[#737882] uppercase tracking-wider block">
                Lead Inquiries & Conversions
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(analyticsData.packageBookings || 0) > 0 && (
                  <div className="p-2 bg-white rounded-xl border border-black/5 flex items-center justify-between">
                    <span className="text-[#737882]">Package Bookings</span>
                    <span className="font-bold text-[#1C1E22]">{analyticsData.packageBookings}</span>
                  </div>
                )}
                {(analyticsData.brandInquiries || 0) > 0 && (
                  <div className="p-2 bg-white rounded-xl border border-black/5 flex items-center justify-between">
                    <span className="text-[#737882]">Brand Deals</span>
                    <span className="font-bold text-[#1C1E22]">{analyticsData.brandInquiries}</span>
                  </div>
                )}
                {(analyticsData.showingRequests || 0) > 0 && (
                  <div className="p-2 bg-white rounded-xl border border-black/5 flex items-center justify-between">
                    <span className="text-[#737882]">Property Showings</span>
                    <span className="font-bold text-[#1C1E22]">{analyticsData.showingRequests}</span>
                  </div>
                )}
                {(analyticsData.homeValuations || 0) > 0 && (
                  <div className="p-2 bg-white rounded-xl border border-black/5 flex items-center justify-between">
                    <span className="text-[#737882]">Valuations</span>
                    <span className="font-bold text-[#1C1E22]">{analyticsData.homeValuations}</span>
                  </div>
                )}
                {(analyticsData.generalContacts || 0) > 0 && (
                  <div className="p-2 bg-white rounded-xl border border-black/5 flex items-center justify-between">
                    <span className="text-[#737882]">General Leads</span>
                    <span className="font-bold text-[#1C1E22]">{analyticsData.generalContacts}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Device Distribution */}
          {(() => {
            const devTotal = (analyticsData.deviceCounts?.mobile || 0) + (analyticsData.deviceCounts?.desktop || 0) + (analyticsData.deviceCounts?.tablet || 0);
            const mobilePct = devTotal > 0 ? Math.round(((analyticsData.deviceCounts?.mobile || 0) / devTotal) * 100) : 0;
            const desktopPct = devTotal > 0 ? Math.round(((analyticsData.deviceCounts?.desktop || 0) / devTotal) * 100) : 0;
            const tabletPct = devTotal > 0 ? Math.round(((analyticsData.deviceCounts?.tablet || 0) / devTotal) * 100) : 0;

            return (
              <div className="p-3.5 bg-white rounded-2xl border border-black/10 shadow-2xs space-y-2">
                <label className="text-[10px] font-bold text-[#737882] uppercase tracking-wider block">
                  Device Distribution
                </label>
                {devTotal === 0 ? (
                  <p className="text-xs text-[#737882] py-1 text-center">No device events recorded in this period.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 bg-[#FAF8F5] rounded-xl border border-black/5">
                      <HugeiconsIcon icon={SmartPhone01Icon} size={16} className="mx-auto text-[#5E4BF7] mb-1" />
                      <div className="font-bold text-[#1C1E22]">{mobilePct}%</div>
                      <div className="text-[9px] text-[#737882]">Mobile</div>
                    </div>
                    <div className="p-2 bg-[#FAF8F5] rounded-xl border border-black/5">
                      <HugeiconsIcon icon={ComputerIcon} size={16} className="mx-auto text-[#1C1E22] mb-1" />
                      <div className="font-bold text-[#1C1E22]">{desktopPct}%</div>
                      <div className="text-[9px] text-[#737882]">Desktop</div>
                    </div>
                    <div className="p-2 bg-[#FAF8F5] rounded-xl border border-black/5">
                      <HugeiconsIcon icon={Tablet01Icon} size={16} className="mx-auto text-[#E75646] mb-1" />
                      <div className="font-bold text-[#1C1E22]">{tabletPct}%</div>
                      <div className="text-[9px] text-[#737882]">Tablet</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Top Performing Link Card from Rollups */}
          {analyticsData.topLinks && analyticsData.topLinks.length > 0 && (
            <div className="p-3.5 bg-white rounded-2xl border border-black/10 shadow-2xs space-y-2">
              <label className="text-[10px] font-bold text-[#737882] uppercase tracking-wider block">
                Top Links (Past {analyticsDays} Days)
              </label>
              <div className="space-y-1.5">
                {analyticsData.topLinks.slice(0, 5).map((item, idx) => {
                  const matchedCard = profile.cards.find((c) => c.id === item.linkId);
                  const title = matchedCard?.title || item.title || `Link #${idx + 1}`;
                  const url = matchedCard?.linkUrl || '';
                  const cardColor = (matchedCard && COLOR_CONFIG[matchedCard.color]) || COLOR_CONFIG.purple;

                  return (
                    <div
                      key={item.linkId}
                      className="p-2.5 bg-[#FAF8F5] rounded-xl border border-black/5 flex items-center justify-between gap-2 text-xs min-w-0"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cardColor.hex }}
                        />
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-[#1C1E22] truncate block">{title}</span>
                          {url && <span className="text-[10px] text-[#737882] truncate block">{url}</span>}
                        </div>
                      </div>
                      <span className="font-extrabold text-[#5E4BF7] bg-[#5E4BF7]/10 px-2 py-0.5 rounded-full text-[10px] shrink-0">
                        {item.clicks} clicks
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top Traffic Referrers */}
          {analyticsData.referrerCounts && Object.keys(analyticsData.referrerCounts).length > 0 && (
            <div className="p-3.5 bg-white rounded-2xl border border-black/10 shadow-2xs space-y-2">
              <label className="text-[10px] font-bold text-[#737882] uppercase tracking-wider block">
                Traffic Sources
              </label>
              <div className="space-y-1.5">
                {Object.entries(analyticsData.referrerCounts)
                  .sort((a, b) => Number(b[1]) - Number(a[1]))
                  .slice(0, 5)
                  .map(([ref, count]) => (
                    <div
                      key={ref}
                      className="p-2 bg-[#FAF8F5] rounded-xl border border-black/5 flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-[#1C1E22] truncate capitalize">
                        {ref === 'direct' ? 'Direct / Bio Links' : ref}
                      </span>
                      <span className="font-bold text-[#737882] text-[10px] bg-black/5 px-1.5 py-0.5 rounded-full">
                        {count}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
