import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowRight01Icon,
  CheckmarkCircle01Icon,
  Mail01Icon,
  GlobeIcon,
  SparklesIcon,
  HelpCircleIcon,
  CheckmarkBadge01Icon,
  Loading03Icon,
} from '@hugeicons/core-free-icons';

export interface ContactPageProps {
  onBack: () => void;
  onOpenTerms?: () => void;
  onOpenPrivacy?: () => void;
  onOpenStudio?: () => void;
  onOpenAuth?: () => void;
  currentUser?: any;
}

export const ContactPage: React.FC<ContactPageProps> = ({
  onBack,
  onOpenTerms,
  onOpenPrivacy,
  onOpenStudio,
  onOpenAuth,
  currentUser,
}) => {
  const [formData, setFormData] = useState({
    name: currentUser?.displayName || '',
    email: currentUser?.email || '',
    topic: 'support',
    handle: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.message) return;

    setSubmitting(true);
    // Simulate instantaneous delivery
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  const handleCopy = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const faqs = [
    {
      q: 'How do I claim and customize my unique LinkLyra handle?',
      a: 'You can claim any available handle during signup (or inside Account Settings -> Profile). Your link page will immediately be available at linklyra.com/@yourname.',
    },
    {
      q: 'Does LinkLyra really take 0% commission on direct tips?',
      a: 'Yes, absolutely. When your audience tips you via direct UPI, Stripe, or PayPal links, 100% of the funds go directly into your designated account.',
    },
    {
      q: 'Can I embed full YouTube videos and Instagram Reels?',
      a: 'Yes! LinkLyra supports rich media spotlight cards that play videos, podcasts, and audio directly within your link page without navigating away.',
    },
    {
      q: 'How do I cancel or change my Pro subscription?',
      a: 'You can manage or cancel your subscription anytime with zero penalty from Account Settings -> Billing. Your Pro access remains active until the end of the billing period.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#111111] flex flex-col font-sans selection:bg-[#4F46E5] selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-[#E8E8E4] bg-[#FAFAF7]/90 backdrop-blur-md px-4 sm:px-8 py-3.5 sm:py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-[#111111] text-white flex items-center justify-center font-black text-xs shadow-xs group-hover:scale-105 transition-transform">
                LL
              </div>
              <span className="font-extrabold text-sm sm:text-base tracking-wider uppercase text-[#111111]">
                LINKLYRA
              </span>
            </button>
            <span className="hidden sm:inline-block text-zinc-300">/</span>
            <span className="hidden sm:inline-block text-xs font-bold font-mono tracking-wider uppercase text-zinc-500">
              CONTACT &amp; SUPPORT
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              ← Back to Home
            </button>

            {currentUser && onOpenStudio ? (
              <button
                type="button"
                onClick={onOpenStudio}
                className="px-4 py-2 rounded-full text-xs font-bold bg-[#111111] text-white hover:bg-zinc-800 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <span>Creator Studio</span>
                <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
              </button>
            ) : onOpenAuth ? (
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-full text-xs font-bold bg-[#111111] text-white hover:bg-zinc-800 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <span>Create Your Page</span>
                <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
              </button>
            ) : null}
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <div className="w-full border-b border-[#E8E8E4] bg-white py-12 sm:py-16 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto text-left space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 text-xs font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>CREATOR SUPPORT &amp; INQUIRIES</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#111111] tracking-tight">
            How can we help?
          </h1>
          <p className="text-base sm:text-lg text-[#666666] max-w-2xl leading-relaxed">
            Have a question about your link page, need help setting up video embeds, or want to discuss a partnership? Our creator team is here for you.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-medium text-zinc-600">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAFAF8] border border-zinc-200">
              <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} className="text-emerald-600" />
              <span>Average response time: &lt; 4 hours</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAFAF8] border border-zinc-200">
              <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} className="text-emerald-600" />
              <span>Direct human assistance</span>
            </span>
          </div>
        </div>
      </div>

      {/* Contact Cards Grid */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Creator Support */}
          <div className="p-6 rounded-2xl bg-white border border-[#E8E8E4] shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 flex items-center justify-center font-bold">
                <HugeiconsIcon icon={HelpCircleIcon} size={20} />
              </div>
              <h3 className="font-bold text-base text-[#111111]">Creator Support</h3>
              <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                Need help editing your cards, fixing a video preview, or setting up a custom domain?
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleCopy('support@linklyra.com')}
                className="w-full py-2.5 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-mono text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>support@linklyra.com</span>
                <span className="text-[11px] text-zinc-500">
                  {copiedEmail === 'support@linklyra.com' ? 'Copied!' : 'Copy'}
                </span>
              </button>
            </div>
          </div>

          {/* Card 2: Legal & Privacy */}
          <div className="p-6 rounded-2xl bg-white border border-[#E8E8E4] shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 flex items-center justify-center font-bold">
                <HugeiconsIcon icon={CheckmarkBadge01Icon} size={20} />
              </div>
              <h3 className="font-bold text-base text-[#111111]">Legal &amp; Privacy</h3>
              <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                Inquiries concerning intellectual property, copyright takedown requests, or GDPR data erasure.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleCopy('legal@linklyra.com')}
                className="w-full py-2.5 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-mono text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>legal@linklyra.com</span>
                <span className="text-[11px] text-zinc-500">
                  {copiedEmail === 'legal@linklyra.com' ? 'Copied!' : 'Copy'}
                </span>
              </button>
            </div>
          </div>

          {/* Card 3: Brand & Partnerships */}
          <div className="p-6 rounded-2xl bg-white border border-[#E8E8E4] shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 flex items-center justify-center font-bold">
                <HugeiconsIcon icon={SparklesIcon} size={20} />
              </div>
              <h3 className="font-bold text-base text-[#111111]">Partnerships</h3>
              <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                Talent agencies, media houses, or creator networks interested in VIP onboarding packages.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleCopy('partnerships@linklyra.com')}
                className="w-full py-2.5 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-mono text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>partnerships@linklyra.com</span>
                <span className="text-[11px] text-zinc-500">
                  {copiedEmail === 'partnerships@linklyra.com' ? 'Copied!' : 'Copy'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Message Form & FAQ Split Section */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Message Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-10 rounded-2xl sm:rounded-3xl border border-[#E8E8E4] shadow-xs">
            <h2 className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight">
              Send a Message
            </h2>
            <p className="text-xs sm:text-sm text-[#666666] mt-1">
              Fill out the form below and we will route your inquiry directly to the right specialist.
            </p>

            {submitted ? (
              <div className="mt-8 p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={22} />
                </div>
                <h3 className="text-lg font-bold">Message Received!</h3>
                <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
                  Thank you for contacting us. A creator support engineer has received your message and will reply to <strong>{formData.email}</strong> within a few hours.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: currentUser?.displayName || '',
                        email: currentUser?.email || '',
                        topic: 'support',
                        handle: '',
                        message: '',
                      });
                    }}
                    className="text-xs font-bold text-emerald-800 underline cursor-pointer"
                  >
                    Send another message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Maya Lin"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-[#111111] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@domain.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-[#111111] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                      Topic
                    </label>
                    <select
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-[#111111] transition-colors"
                    >
                      <option value="support">Creator Support &amp; Setup</option>
                      <option value="billing">Billing &amp; Pro Plans</option>
                      <option value="domain">Custom Domain Mapping</option>
                      <option value="partnership">Brand &amp; Agency Partnership</option>
                      <option value="feedback">Feature Request / Feedback</option>
                      <option value="legal">Legal &amp; Privacy Request</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                      LinkLyra Username (Optional)
                    </label>
                    <div className="flex items-center rounded-xl border border-zinc-200 bg-white px-3 focus-within:border-[#111111] transition-colors">
                      <span className="text-xs text-zinc-400 font-mono">@</span>
                      <input
                        type="text"
                        value={formData.handle}
                        onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                        placeholder="yourname"
                        className="w-full px-1 py-2.5 text-xs sm:text-sm text-zinc-900 focus:outline-none bg-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                    Your Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe how we can help you..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-[#111111] transition-colors resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#111111] hover:bg-zinc-800 text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" />
                        <span>Sending message...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Inquiry</span>
                        <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Quick FAQs */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border border-[#E8E8E4] shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-[#111111]">Frequently Asked Questions</h3>
              <div className="space-y-4 text-xs sm:text-sm">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="pb-3 border-b border-zinc-150 last:border-none last:pb-0 space-y-1">
                    <p className="font-bold text-[#111111]">{faq.q}</p>
                    <p className="text-[#666666] leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Zeper AI Company Info */}
            <div className="p-6 rounded-2xl bg-[#F4F4F0] border border-[#E8E8E4] text-xs text-[#555555] space-y-2">
              <h4 className="font-bold text-[#111111] uppercase tracking-wider font-mono text-[11px]">
                Zeper AI
              </h4>
              <p>
                LinkLyra is designed, engineered, and operated by Zeper AI. Building focused creator identity tools with tactile computing aesthetics.
              </p>
              <p className="font-mono text-[11px] text-zinc-500">
                Inquiries: support@linklyra.com
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-[#E8E8E4] bg-white py-8 px-4 sm:px-8 text-center text-xs text-zinc-500 space-y-2">
        <p>© 2026 LinkLyra • A product of Zeper AI. All rights reserved.</p>
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="hover:text-zinc-900 transition-colors cursor-pointer"
          >
            Home
          </button>
          <span>·</span>
          {onOpenTerms && (
            <button
              type="button"
              onClick={onOpenTerms}
              className="hover:text-zinc-900 transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
          )}
          <span>·</span>
          {onOpenPrivacy && (
            <button
              type="button"
              onClick={onOpenPrivacy}
              className="hover:text-zinc-900 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};
