import React from 'react';
import { HugeIcon } from '../HugeIcon';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { CardTemplateType } from '../../types';
import { CategoryTab, TemplateCardItem } from './templateData';

export interface TemplatePickerProps {
  normalizedRole: {
    category: 'creator' | 'musician' | 'podcast' | 'real_estate' | 'coach';
    roleName: string;
    roleHeadline: string;
  };
  categoryTabs: Array<{ id: CategoryTab; label: string; count: number }>;
  selectedCategoryTab: CategoryTab;
  onSelectCategoryTab: (tab: CategoryTab) => void;
  visibleTemplates: TemplateCardItem[];
  templateType: CardTemplateType;
  onSelectTemplate: (type: CardTemplateType) => void;
}

export const TemplatePicker: React.FC<TemplatePickerProps> = ({
  normalizedRole,
  categoryTabs,
  selectedCategoryTab,
  onSelectCategoryTab,
  visibleTemplates,
  templateType,
  onSelectTemplate,
}) => {
  return (
    <div className="space-y-4">
      {/* Role Context & Guidance Banner */}
      <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#1C1E22] text-white">
                Curated Workflow
              </span>
              <span className="text-xs font-bold text-[#1C1E22]">
                {normalizedRole.roleName}
              </span>
            </div>
            <p className="text-xs text-[#737882] leading-relaxed">
              {normalizedRole.roleHeadline}
            </p>
          </div>
        </div>
      </div>

      {/* Horizontal Category Pill Tabs */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#737882]">
            Filter By Category
          </span>
          <span className="text-[11px] text-stone-400 font-medium">
            {visibleTemplates.length} templates
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
          {categoryTabs.map((tab) => {
            const isActiveTab = selectedCategoryTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectCategoryTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                  isActiveTab
                    ? 'bg-[#1C1E22] text-white border-[#1C1E22] shadow-2xs'
                    : 'bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-50 border-stone-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Curated Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {visibleTemplates.map((item) => {
          const isCurrent = templateType === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTemplate(item.id)}
              className={`group text-left p-4 rounded-2xl border transition-all duration-150 flex flex-col justify-between cursor-pointer relative overflow-hidden shadow-2xs hover:shadow-xs active:scale-[0.99] ${
                isCurrent
                  ? 'bg-stone-50 border-[#1C1E22] ring-2 ring-[#1C1E22]/10'
                  : 'bg-white hover:bg-white border-stone-200 hover:border-[#1C1E22]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="w-8 h-8 rounded-xl bg-stone-100 text-[#1C1E22] group-hover:bg-[#1C1E22] group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                    <HugeIcon icon={item.icon} size={16} className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 uppercase tracking-wider whitespace-nowrap border border-stone-200/60">
                        {item.badge}
                      </span>
                    )}
                    {isCurrent && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#1C1E22] text-white uppercase tracking-wider whitespace-nowrap">
                        ACTIVE
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="text-sm font-bold text-[#1C1E22] leading-snug mb-1 group-hover:text-black">
                  {item.title}
                </h3>
                <p className="text-xs text-[#737882] leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-[#1C1E22]">
                <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">
                  {item.categoryLabel}
                </span>
                <span className="inline-flex items-center gap-1 text-[#1C1E22] group-hover:translate-x-0.5 transition-transform font-bold">
                  Use Template <HugeIcon icon={ArrowRight01Icon} size={13} className="w-3.5 h-3.5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
