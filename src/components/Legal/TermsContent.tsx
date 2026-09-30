import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CheckmarkCircle01Icon,
  ShieldIcon,
  CrownIcon,
  File01Icon,
  AlertCircleIcon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons';

export const TermsContent: React.FC = () => {
  return (
    <div className="space-y-10 text-[#222222] font-sans leading-relaxed text-sm sm:text-base">
      {/* Overview Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#F4F4F0] border border-[#E8E8E4] flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#111111] text-white flex items-center justify-center shrink-0">
          <HugeiconsIcon icon={ShieldIcon} size={20} />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#111111]">
            Creator-First Agreement Summary
          </h3>
          <p className="text-xs sm:text-sm text-[#666666] mt-0.5">
            You own 100% of your content, intellectual property, and audience links. LinkLyra takes 0% commission on direct tips & payments.
          </p>
        </div>
      </div>

      {/* 1. Agreement to Terms */}
      <section id="agreement" className="scroll-mt-24 space-y-3">
        <h2 className="text-lg sm:text-xl font-black text-[#111111] tracking-tight flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-zinc-200 text-zinc-800 text-xs font-mono font-bold flex items-center justify-center">1</span>
          Agreement to Terms
        </h2>
        <p className="text-[#444444]">
          Welcome to LinkLyra, a creator tool and digital identity platform provided by Zeper AI (&ldquo;LinkLyra&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). By accessing our website, creating an account, or publishing a link page, you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service.
        </p>
        <p className="text-[#444444]">
          If you are using LinkLyra on behalf of an organization, company, or brand, you represent that you have legal authority to bind that entity to these Terms. You must be at least 13 years of age (or the minimum legal age in your jurisdiction) to use our platform.
        </p>
      </section>

      {/* 2. Accounts and Handle Reservation */}
      <section id="account-handles" className="scroll-mt-24 space-y-3">
        <h2 className="text-lg sm:text-xl font-black text-[#111111] tracking-tight flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-zinc-200 text-zinc-800 text-xs font-mono font-bold flex items-center justify-center">2</span>
          Creator Accounts &amp; Handle Reservation
        </h2>
        <p className="text-[#444444]">
          When you register for LinkLyra, you select a unique username or URL handle (e.g., <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 font-mono text-xs">linklyra.com/@yourname</code>). You agree to:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-[#555555]">
          <li>Provide accurate, current, and complete registration information.</li>
          <li>Safeguard your authentication credentials and notify us immediately of any unauthorized access.</li>
          <li>Never squat on trademarked names, impersonate other creators, public figures, or brands, or attempt to sell handles for profit.</li>
        </ul>
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm">
          <strong>Fair Use of Usernames:</strong> We reserve the right to reclaim or reassign inactive handles (accounts with no activity or traffic for more than 12 consecutive months) or handles subject to legitimate trademark dispute.
        </div>
      </section>

      {/* 3. 100% Content Ownership */}
      <section id="content-ownership" className="scroll-mt-24 space-y-3">
        <h2 className="text-lg sm:text-xl font-black text-[#111111] tracking-tight flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-mono font-bold flex items-center justify-center">3</span>
          100% Content Ownership &amp; Creator Rights
        </h2>
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
          <p className="font-bold flex items-center gap-1.5">
            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} className="text-emerald-700" />
            <span>You own your content. Always.</span>
          </p>
          <p className="text-xs sm:text-sm text-emerald-900">
            You retain 100% copyright, trademark, and intellectual property rights in all text, images, videos, audio clips, thumbnails, logos, and links you publish on LinkLyra.
          </p>
        </div>
        <p className="text-[#444444]">
          By adding content to your page, you grant LinkLyra solely a worldwide, royalty-free, non-exclusive license to host, cache, display, format, and distribute that content exclusively for the purpose of serving your public link page to your audience across mobile and desktop devices. We will never sell your content to third parties or claim ownership of your work.
        </p>
      </section>

      {/* 4. Payments, Tips & 0% Fee Guarantee */}
      <section id="payments-tips" className="scroll-mt-24 space-y-3">
        <h2 className="text-lg sm:text-xl font-black text-[#111111] tracking-tight flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-zinc-200 text-zinc-800 text-xs font-mono font-bold flex items-center justify-center">4</span>
          Payments, Direct Tips &amp; Zero-Commission Guarantee
        </h2>
        <p className="text-[#444444]">
          LinkLyra provides creators with direct payment links, 1-tap UPI tip cards, and product showcase cards to monetize their audience directly.
        </p>
        <ul className="list-disc pl-5 space-y-2 text-[#555555]">
          <li>
            <strong>0% Platform Commission:</strong> LinkLyra takes 0% platform fee on your direct tip links and UPI payments. What your fans send goes straight to your designated payment account.
          </li>
          <li>
            <strong>Direct-to-Creator Processing:</strong> When visitors click your payment or tip link (such as UPI apps, PayPal, or Stripe links), transactions are processed directly between the payer and your account or third-party processor. LinkLyra is not a custodian, bank, or escrow service.
          </li>
          <li>
            <strong>Taxes and Fulfilment:</strong> You are solely responsible for all applicable taxes, fulfillment of products or digital downloads, and any refunds required by law for services you advertise on your page.
          </li>
        </ul>
      </section>

      {/* 5. Subscriptions and Pro Plans */}
      <section id="subscriptions" className="scroll-mt-24 space-y-3">
        <h2 className="text-lg sm:text-xl font-black text-[#111111] tracking-tight flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-zinc-200 text-zinc-800 text-xs font-mono font-bold flex items-center justify-center">5</span>
          Subscriptions &amp; Pro Memberships
        </h2>
        <p className="text-[#444444]">
          LinkLyra offers a comprehensive <strong>Free Forever</strong> plan as well as optional premium tiers (<strong>LinkLyra Pro</strong> and <strong>LinkLyra VIP</strong>) for advanced styling, custom domain mapping, and high-resolution video spotlights.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
          <div className="p-3.5 rounded-xl border border-zinc-200 bg-white">
            <h4 className="font-bold text-[#111111]">Transparent Billing</h4>
            <p className="text-[#666666] mt-1">
              Subscriptions renew automatically on a monthly or yearly cycle. You can view all invoices directly inside Account Settings.
            </p>
          </div>
          <div className="p-3.5 rounded-xl border border-zinc-200 bg-white">
            <h4 className="font-bold text-[#111111]">Cancel Anytime</h4>
            <p className="text-[#666666] mt-1">
              No contracts or lock-ins. When you cancel, you keep full access to Pro features until the end of your prepaid billing period.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Acceptable Use Policy */}
      <section id="acceptable-use" className="scroll-mt-24 space-y-3">
        <h2 className="text-lg sm:text-xl font-black text-[#111111] tracking-tight flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-zinc-200 text-zinc-800 text-xs font-mono font-bold flex items-center justify-center">6</span>
          Acceptable Use &amp; Community Standards
        </h2>
        <p className="text-[#444444]">
          To keep LinkLyra safe, fast, and reputable for millions of visitors worldwide, you agree not to use LinkLyra to publish, host, or link to:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-[#555555]">
          <li>Malicious software, phishing schemes, spyware, or deceptive affiliate scams.</li>
          <li>Unlawful harassment, hate speech, defamation, or threats of violence.</li>
          <li>Explicit, non-consensual sexual imagery or exploitation of minors.</li>
          <li>Unauthorized distribution of copyrighted materials, counterfeit products, or pirated media.</li>
          <li>Automated abuse, denial-of-service attempts, or scraping of LinkLyra systems.</li>
        </ul>
        <p className="text-xs text-[#888888]">
          Violations of this policy will result in immediate suspension or termination of your account and deletion of associated link pages without prior notice.
        </p>
      </section>

      {/* 7. Third-Party Integrations & Embeds */}
      <section id="third-party" className="scroll-mt-24 space-y-3">
        <h2 className="text-lg sm:text-xl font-black text-[#111111] tracking-tight flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-zinc-200 text-zinc-800 text-xs font-mono font-bold flex items-center justify-center">7</span>
          Third-Party Platforms &amp; Embedded Media
        </h2>
        <p className="text-[#444444]">
          LinkLyra enables you to embed and spotlight media from third-party services including YouTube, Instagram Reels, Spotify, Apple Podcasts, Vimeo, and WhatsApp. Your use of these embeds is subject to the terms and privacy policies of the respective third-party platforms (including YouTube Terms of Service and Google Privacy Policy). LinkLyra is not responsible for changes in availability or policies of external services.
        </p>
      </section>

      {/* 8. Limitation of Liability */}
      <section id="liability" className="scroll-mt-24 space-y-3">
        <h2 className="text-lg sm:text-xl font-black text-[#111111] tracking-tight flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-zinc-200 text-zinc-800 text-xs font-mono font-bold flex items-center justify-center">8</span>
          Warranty Disclaimer &amp; Limitation of Liability
        </h2>
        <p className="text-[#444444]">
          LinkLyra is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;. While we strive for 99.9% uptime, global CDN speed, and reliable data synchronization, we disclaim all warranties of any kind, whether express or implied.
        </p>
        <p className="text-[#444444]">
          In no event shall Zeper AI, its founders, directors, employees, or partners be liable for any indirect, incidental, special, or consequential damages resulting from lost profits, data loss, service interruption, or third-party unauthorized access. Our total liability for any claim shall not exceed the total fees paid by you to LinkLyra during the twelve (12) months preceding the claim.
        </p>
      </section>

      {/* 9. Contact & Notice */}
      <section id="contact" className="scroll-mt-24 pt-4 border-t border-zinc-200 space-y-3">
        <h2 className="text-lg sm:text-xl font-black text-[#111111] tracking-tight flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-zinc-200 text-zinc-800 text-xs font-mono font-bold flex items-center justify-center">9</span>
          Contact Us &amp; Legal Notices
        </h2>
        <p className="text-[#444444]">
          If you have any questions regarding these Terms or need to report an intellectual property infringement or violation of acceptable use, please reach out to our team:
        </p>
        <div className="p-4 rounded-xl bg-zinc-100 text-xs sm:text-sm font-mono text-zinc-800 space-y-1">
          <p><strong>Legal &amp; Policy:</strong> legal@linklyra.com</p>
          <p><strong>Support &amp; Inquiries:</strong> support@linklyra.com</p>
          <p><strong>Company:</strong> Zeper AI</p>
        </div>
      </section>
    </div>
  );
};
