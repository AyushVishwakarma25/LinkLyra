import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CheckmarkCircle01Icon,
  SparklesIcon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons';
import { SpecularButton } from './ui/SpecularButton';

export interface PricingSectionProps {
  onSelectPlan: (planName: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPlan }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      id: 'free',
      name: 'Free Forever',
      badge: 'STARTER',
      priceMonthly: '₹0',
      priceYearly: '₹0',
      periodText: 'forever',
      description: 'Everything you need to create your link page and share your work.',
      isPopular: false,
      ctaText: 'Get Started Free',
      ctaVariant: 'secondary' as const,
      features: [
        'Unlimited links & collections',
        'Video & YouTube previews',
        'Mobile studio editor',
        'Clean minimalist themes',
        'Standard visitor stats',
      ],
    },
    {
      id: 'pro',
      name: 'Pro Creator',
      badge: 'CREATOR FAVORITE',
      priceMonthly: '₹299',
      priceYearly: '₹249',
      periodText: 'per month',
      yearlyBillingNote: 'billed annually (₹2,990/yr)',
      description: 'For creators ready to showcase video reels, collect tips, and customize.',
      isPopular: true,
      ctaText: 'Start with Pro',
      ctaVariant: 'primary' as const,
      features: [
        'Everything in Free, plus:',
        'Collect 1-tap fan tips (0% fee)',
        'Full custom colors, fonts & cards',
        'Featured Reel & Video spotlights',
        'Verified creator checkmark',
        'Detailed click & visitor insights',
      ],
    },
    {
      id: 'vip',
      name: 'Studio VIP',
      badge: 'AGENCY & PROS',
      priceMonthly: '₹999',
      priceYearly: '₹799',
      periodText: 'per month',
      yearlyBillingNote: 'billed annually (₹9,590/yr)',
      description: 'For established creators, podcasts, and talent who want full control.',
      isPopular: false,
      ctaText: 'Get Studio VIP',
      ctaVariant: 'secondary' as const,
      features: [
        'Everything in Pro, plus:',
        'Use your own custom web domain',
        'Remove LinkLyra branding completely',
        'Digital media kit & rate cards',
        'Priority WhatsApp creator support',
      ],
    },
  ];

  return (
    <section id="pricing" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-[#E8E8E8]">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-[#E8E8E8] shadow-2xs">
          <HugeiconsIcon icon={SparklesIcon} size={13} className="text-amber-500" />
          <span className="text-[11px] font-bold tracking-[0.2em] text-[#666666] uppercase font-mono">
            SIMPLE, HONEST PRICING
          </span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-[#111111] tracking-tight leading-[1.1]">
          Free to start. Upgrade as you grow.
        </h2>

        <p className="text-sm sm:text-base text-[#666666] leading-relaxed">
          Zero surprise charges. No platform cut on your tips. Keep 100% of what you earn.
        </p>

        {/* Monthly / Yearly Billing Toggle */}
        <div className="pt-3 flex items-center justify-center">
          <div className="inline-flex items-center bg-stone-100 p-1 rounded-full border border-stone-200/80 shadow-2xs">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-white text-[#111111] shadow-xs'
                  : 'text-[#666666] hover:text-[#111111]'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                billingCycle === 'yearly'
                  ? 'bg-[#111111] text-white shadow-xs'
                  : 'text-[#666666] hover:text-[#111111]'
              }`}
            >
              <span>Yearly</span>
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                billingCycle === 'yearly' ? 'bg-amber-400 text-[#111111]' : 'bg-emerald-100 text-emerald-800'
              }`}>
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {plans.map((plan) => {
          const currentPrice = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;

          return (
            <div
              key={plan.id}
              className={`relative rounded-[32px] p-7 sm:p-8 flex flex-col justify-between transition-all duration-200 ${
                plan.isPopular
                  ? 'bg-[#18181B] text-white border-2 border-amber-400/80 shadow-xl lg:-translate-y-2'
                  : 'bg-white text-[#111111] border border-[#E8E8E8] shadow-xs hover:border-black/20'
              }`}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-[#111111] text-[10px] font-black tracking-wider uppercase shadow-md">
                    ★ {plan.badge}
                  </span>
                </div>
              )}

              <div>
                {/* Plan Header */}
                <div className="flex items-center justify-between">
                  <h3 className={`text-xl font-bold tracking-tight ${plan.isPopular ? 'text-white' : 'text-[#111111]'}`}>
                    {plan.name}
                  </h3>
                  {!plan.isPopular && (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-stone-100 text-[#666666] border border-stone-200">
                      {plan.badge}
                    </span>
                  )}
                </div>

                <p className={`text-xs mt-2 leading-relaxed ${plan.isPopular ? 'text-zinc-400' : 'text-[#666666]'}`}>
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mt-5 pb-5 border-b border-black/5 dark:border-white/10">
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-4xl sm:text-5xl font-black tracking-tight ${plan.isPopular ? 'text-white' : 'text-[#111111]'}`}>
                      {currentPrice}
                    </span>
                    <span className={`text-xs font-semibold ${plan.isPopular ? 'text-zinc-400' : 'text-[#777777]'}`}>
                      /{plan.periodText}
                    </span>
                  </div>
                  {billingCycle === 'yearly' && plan.yearlyBillingNote && (
                    <p className={`text-[11px] font-medium mt-1 ${plan.isPopular ? 'text-amber-400' : 'text-emerald-700'}`}>
                      {plan.yearlyBillingNote}
                    </p>
                  )}
                </div>

                {/* Feature Checklist */}
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs font-medium">
                      <HugeiconsIcon
                        icon={CheckmarkCircle01Icon}
                        size={16}
                        className={`shrink-0 mt-0.5 ${
                          plan.isPopular ? 'text-amber-400' : 'text-emerald-600'
                        }`}
                      />
                      <span className={plan.isPopular ? 'text-zinc-200' : 'text-[#444444]'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-4">
                <SpecularButton
                  size="md"
                  radius={999}
                  tint={plan.isPopular ? '#F8BA38' : '#111111'}
                  tintOpacity={1}
                  textColor={plan.isPopular ? '#111111' : '#ffffff'}
                  lineColor={plan.isPopular ? '#ffffff' : '#F8BA38'}
                  baseColor={plan.isPopular ? '#D97706' : '#27272a'}
                  intensity={plan.isPopular ? 1.4 : 1.2}
                  shineSize={plan.isPopular ? 16 : 12}
                  shineFade={plan.isPopular ? 40 : 35}
                  thickness={plan.isPopular ? 1.5 : 1.2}
                  speed={plan.isPopular ? 0.45 : 0.35}
                  followMouse={true}
                  proximity={250}
                  autoAnimate={plan.isPopular}
                  onClick={() => onSelectPlan(plan.name)}
                  className={`w-full !font-bold !text-xs ${
                    plan.isPopular ? 'shadow-md shadow-amber-400/20 !font-black' : 'shadow-xs'
                  }`}
                >
                  <span>{plan.ctaText}</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
                </SpecularButton>
              </div>
            </div>
          );
        })}
      </div>

      {/* Assurance Footer */}
      <div className="mt-10 pt-6 text-center text-xs text-[#777777] font-medium border-t border-[#E8E8E8]/60 flex flex-wrap items-center justify-center gap-2 sm:gap-6">
        <span>✓ No credit card required to start</span>
        <span className="hidden sm:inline">•</span>
        <span>✓ Cancel anytime with 1 click</span>
        <span className="hidden sm:inline">•</span>
        <span>✓ 0% platform fee on fan tips & UPI payments</span>
      </div>
    </section>
  );
};
