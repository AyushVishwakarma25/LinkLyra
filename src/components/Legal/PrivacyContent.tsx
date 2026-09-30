import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CheckmarkCircle01Icon,
  ShieldIcon,
  File01Icon,
  CrownIcon,
  GlobeIcon,
  Settings01Icon,
} from '@hugeicons/core-free-icons';

export const PrivacyContent: React.FC = () => {
  return (
    <div className="space-y-10 text-[#222222] font-sans leading-relaxed text-sm sm:text-base">
      {/* Privacy Promise Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
          <HugeiconsIcon icon={ShieldIcon} size={20} />
        </div>
        <div>
          <h3 className="text-base font-bold text-emerald-950">
            Our Core Privacy Commitment
          </h3>
          <p className="text-xs sm:text-sm text-emerald-800 mt-0.5">
            We never sell your personal data. We do not place third-party cross-site ad trackers on your link page. Your data is encrypted and belongs to you.
          </p>
        </div>
      </div>

      {/* 1. What Information We Collect */}
      <section id="collection" className="scroll-mt-24 space-y-4">
        <h2 className="text-lg sm:text-xl font-black text-[#111111] tracking-tight flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-zinc-200 text-zinc-800 text-xs font-mono font-bold flex items-center justify-center">1</span>
          Information We Collect
        </h2>
        <p className="text-[#444444]">
          LinkLyra collects only the minimal data necessary to provide you with a fast, reliable creator page and give you actionable audience analytics:
        </p>

        <div className="space-y-3">
          <div className="p-4 rounded-xl border border-zinc-200 bg-white">
            <h4 className="font-bold text-[#111111] text-sm">Account Information You Provide</h4>
            <p className="text-xs sm:text-sm text-[#666666] mt-1">
              When creating your account, you provide an email address, name, username handle, profile avatar, biography, social media links, and custom cards.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 bg-white">
            <h4 className="font-bold text-[#111111] text-sm">Anonymous Aggregate Visitor Analytics</h4>
            <p className="text-xs sm:text-sm text-[#666666] mt-1">
              When someone views your LinkLyra profile, we record aggregate, non-personally identifiable metrics (page view count, link click count, approximate country/region, device type, and referrer). We do <strong>not</strong> track individual visitor names or build cross-site tracking profiles.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 bg-white">
            <h4 className="font-bold text-[#111111] text-sm">Payments &amp; Direct Tips</h4>
            <p className="text-xs sm:text-sm text-[#666666] mt-1">
              We never store your credit card details, CVVs, or UPI PINs. If you upgrade to Pro or receive direct UPI tips, payments are handled directly by PCI-DSS certified payment processors (Razorpay, Stripe) or standard device UPI protocols.
            </p>
          </div>
        </div>
      </section>

      {/* 2. How We Use Your Information */}
      <section id="usage" className="scroll-mt-24 space-y-3">
        <h2 className="text-lg sm:text-xl font-black text-[#111111] tracking-tight flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-zinc-200 text-zinc-800 text-xs font-mono font-bold flex items-center justify-center">2</span>
          How We Use Your Information
        </h2>
        <p className="text-[#444444]">
          We use collected information solely for legitimate creator platform operations:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-[#555555]">
          <li>Publishing, caching, and serving your high-speed link page globally.</li>
          <li>Providing your creator analytics dashboard with real-time click and traffic counts.</li>
          <li>Securing your account with authentication and preventing spam, fraud, or abuse.</li>
          <li>Sending essential transactional notifications (password resets, billing receipts).</li>
          <li>Continuously improving platform performance, uptime, and mobile compatibility.</li>
        </ul>
      </section>

      {/* 3. Data Sharing & Third-Party Services */}
      <section id="sharing" className="scroll-mt-24 space-y-3">
        <h2 className="text-lg sm:text-xl font-black text-[#111111] tracking-tight flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-zinc-200 text-zinc-800 text-xs font-mono font-bold flex items-center justify-center">3</span>
          Data Sharing &amp; Third Parties
        </h2>
        <div className="p-4 rounded-xl bg-zinc-100 text-xs sm:text-sm text-zinc-800 font-medium">
          🔒 <strong>Zero Data Selling:</strong> We do not sell, rent, or trade your personal information or your audience data to advertisers, data brokers, or third parties under any circumstances.
        </div>
        <p className="text-[#444444]">
          We only share data with trusted infrastructure providers strictly for hosting and platform stability:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-[#555555]">
          <li><strong>Cloud Infrastructure:</strong> Google Cloud Platform &amp; Firebase (encrypted databases, authentication, and global CDN delivery).</li>
          <li><strong>Billing Processors:</strong> Razorpay &amp; Stripe for processing subscription upgrades securely under PCI-DSS compliance.</li>
          <li><strong>Embedded Content:</strong> When visitors interact with embedded media (e.g., YouTube or Spotify embeds), standard network requests occur between the visitor&apos;s browser and the third-party service under that provider&apos;s privacy policy.</li>
        </ul>
      </section>

      {/* 4. Cookies & Local Browser Storage */}
      <section id="cookies" className="scroll-mt-24 space-y-3">
        <h2 className="text-lg sm:text-xl font-black text-[#111111] tracking-tight flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-zinc-200 text-zinc-800 text-xs font-mono font-bold flex items-center justify-center">4</span>
          Cookies &amp; Local Storage
        </h2>
        <p className="text-[#444444]">
          LinkLyra uses minimal, strictly essential browser storage:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-[#555555]">
          <li><strong>Authentication Cookies:</strong> Secure session tokens that keep you logged in to your Studio.</li>
          <li><strong>LocalStorage:</strong> Used to store your draft edits and UI preferences so changes render instantly before being synced with the cloud.</li>
          <li><strong>No Ad Trackers:</strong> We do not use Facebook Pixel, Google AdSense, or invasive third-party ad profiling cookies.</li>
        </ul>
      </section>

      {/* 5. Your Rights: Export & Deletion */}
      <section id="your-rights" className="scroll-mt-24 space-y-3">
        <h2 className="text-lg sm:text-xl font-black text-[#111111] tracking-tight flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-zinc-200 text-zinc-800 text-xs font-mono font-bold flex items-center justify-center">5</span>
          Your Rights &amp; Data Control (GDPR &amp; DPDP)
        </h2>
        <p className="text-[#444444]">
          Wherever you reside in the world, LinkLyra provides full data transparency and sovereign control:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
          <div className="p-3.5 rounded-xl border border-zinc-200 bg-white">
            <h4 className="font-bold text-[#111111]">1. Right to Access &amp; Export</h4>
            <p className="text-[#666666] mt-1">
              Download your entire profile, cards, and analytics data anytime in portable JSON format.
            </p>
          </div>
          <div className="p-3.5 rounded-xl border border-zinc-200 bg-white">
            <h4 className="font-bold text-[#111111]">2. Right to Rectify</h4>
            <p className="text-[#666666] mt-1">
              Update, change, or rename your links, username, and profile in real-time from the dashboard.
            </p>
          </div>
          <div className="p-3.5 rounded-xl border border-zinc-200 bg-white">
            <h4 className="font-bold text-[#111111]">3. Right to Erasure</h4>
            <p className="text-[#666666] mt-1">
              Delete your account and all associated profile data with one click in Account Settings.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Data Security & Storage */}
      <section id="security" className="scroll-mt-24 space-y-3">
        <h2 className="text-lg sm:text-xl font-black text-[#111111] tracking-tight flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-zinc-200 text-zinc-800 text-xs font-mono font-bold flex items-center justify-center">6</span>
          Data Security &amp; Encryption
        </h2>
        <p className="text-[#444444]">
          We take platform security seriously. All network traffic between your browser and our servers is secured with TLS 1.3 encryption in transit. Data stored in our databases is encrypted at rest using industry-standard AES-256 protocols on Google Cloud infrastructure.
        </p>
      </section>

      {/* 7. Contact Privacy Team */}
      <section id="contact-privacy" className="scroll-mt-24 pt-4 border-t border-zinc-200 space-y-3">
        <h2 className="text-lg sm:text-xl font-black text-[#111111] tracking-tight flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-zinc-200 text-zinc-800 text-xs font-mono font-bold flex items-center justify-center">7</span>
          Contact the Privacy Team
        </h2>
        <p className="text-[#444444]">
          If you have any questions or data requests regarding your privacy, please email our Data Protection Officer:
        </p>
        <div className="p-4 rounded-xl bg-zinc-100 text-xs sm:text-sm font-mono text-zinc-800 space-y-1">
          <p><strong>Email:</strong> privacy@linklyra.com</p>
          <p><strong>Support:</strong> support@linklyra.com</p>
          <p><strong>Data Controller:</strong> Zeper AI</p>
        </div>
      </section>
    </div>
  );
};
