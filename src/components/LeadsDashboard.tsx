import React, { useState, useEffect, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Mail01Icon,
  Download01Icon,
  Tick01Icon,
  CheckmarkCircle01Icon,
  Delete01Icon,
  Calendar01Icon,
  FilterIcon,
  UserIcon,
  Building01Icon,
  MusicNote01Icon,
  Mic01Icon,
  Loading03Icon,
  TrendingUpIcon,
  PlusSignIcon,
  ColorsIcon,
  WhatsappIcon,
} from '@hugeicons/core-free-icons';
import { LeadRecord, LeadType, LeadStatus, UserProfile } from '../types';
import { profileService } from '../lib/firebase';
import { User } from 'firebase/auth';

export interface LeadsDashboardProps {
  profile: UserProfile;
  currentUser?: User | null;
  onOpenProModal?: (featureName?: string) => void;
}

const LEAD_TYPE_LABELS: Record<LeadType, { label: string; icon: any; colorClass: string }> = {
  brand_inquiry: {
    label: 'Brand Partnership',
    icon: Building01Icon,
    colorClass: 'bg-[#FAF8F5] text-[#1C1E22] border-black/10',
  },
  music_booking: {
    label: 'Music Booking',
    icon: MusicNote01Icon,
    colorClass: 'bg-[#FAF8F5] text-[#1C1E22] border-black/10',
  },
  podcast_sponsorship: {
    label: 'Podcast Sponsor',
    icon: Mic01Icon,
    colorClass: 'bg-[#FAF8F5] text-[#1C1E22] border-black/10',
  },
  showing_request: {
    label: 'Property Showing',
    icon: Building01Icon,
    colorClass: 'bg-[#FAF8F5] text-[#1C1E22] border-black/10',
  },
  home_valuation: {
    label: 'Home Valuation',
    icon: TrendingUpIcon,
    colorClass: 'bg-[#FAF8F5] text-[#1C1E22] border-black/10',
  },
  package_booking: {
    label: 'Package Booking',
    icon: ColorsIcon,
    colorClass: 'bg-[#FAF8F5] text-[#1C1E22] border-black/10',
  },
  general_contact: {
    label: 'General Inquiry',
    icon: Mail01Icon,
    colorClass: 'bg-[#FAF8F5] text-[#1C1E22] border-black/10',
  },
  media_kit_download: {
    label: 'Media Kit Lead',
    icon: Download01Icon,
    colorClass: 'bg-[#FAF8F5] text-[#1C1E22] border-black/10',
  },
};

const STATUS_BADGES: Record<LeadStatus, { label: string; badgeClass: string }> = {
  new: { label: 'New', badgeClass: 'bg-[#1C1E22] text-white border-[#1C1E22]' },
  contacted: { label: 'Contacted', badgeClass: 'bg-stone-100 text-[#1C1E22] border-black/15' },
  qualified: { label: 'Qualified', badgeClass: 'bg-stone-100 text-[#1C1E22] border-black/15' },
  in_progress: { label: 'In Discussion', badgeClass: 'bg-stone-100 text-[#1C1E22] border-black/15' },
  closed: { label: 'Closed / Won', badgeClass: 'bg-stone-100 text-[#1C1E22] border-black/15' },
  booked: { label: 'Booked', badgeClass: 'bg-stone-100 text-[#1C1E22] border-black/15' },
  archived: { label: 'Archived', badgeClass: 'bg-stone-50 text-[#737882] border-black/10' },
};

export const LeadsDashboard: React.FC<LeadsDashboardProps> = ({
  profile,
  currentUser,
}) => {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const pageId = currentUser?.uid || profile.username || 'public_page';
  const localKey = `linklyra_leads_${pageId}`;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch leads from Firestore + local cache
  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      // 1. Check local backup cache first
      let localLeads: LeadRecord[] = [];
      try {
        const cached = localStorage.getItem(localKey);
        if (cached) localLeads = JSON.parse(cached);
      } catch (e) {
        console.error('Error reading leads cache', e);
      }

      // 2. Fetch from Firestore for this user/page
      const remoteLeads = await profileService.getLeads(pageId);
      
      // Also query fallback if user was previously anonymous
      let publicLeads: any[] = [];
      if (pageId !== 'public_page') {
        publicLeads = await profileService.getLeads('public_page').catch(() => []);
      }

      // Merge and deduplicate
      const combinedMap = new Map<string, LeadRecord>();
      [...localLeads, ...publicLeads, ...remoteLeads].forEach((item) => {
        if (item && item.id) {
          combinedMap.set(item.id, item);
        }
      });

      const sorted = Array.from(combinedMap.values()).sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );

      setLeads(sorted);
      try {
        localStorage.setItem(localKey, JSON.stringify(sorted));
      } catch (e) {
        console.error('Error writing leads cache', e);
      }
    } catch (err) {
      console.warn('Notice: leads fetch', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [pageId]);

  // Status update
  const handleUpdateStatus = async (leadId: string, newStatus: LeadStatus) => {
    setIsUpdatingStatus(leadId);
    try {
      await profileService.updateLeadStatus(pageId, leadId, newStatus);
      const updated = leads.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l));
      setLeads(updated);
      try {
        localStorage.setItem(localKey, JSON.stringify(updated));
      } catch (e) {
        console.error('Error writing leads cache', e);
      }
      showToast(`Lead marked as ${STATUS_BADGES[newStatus]?.label || newStatus}`);
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  // Notes update
  const handleSaveNotes = async (leadId: string) => {
    try {
      await profileService.updateLeadStatus(pageId, leadId, leads.find((l) => l.id === leadId)?.status || 'new', tempNotes);
      const updated = leads.map((l) => (l.id === leadId ? { ...l, notes: tempNotes } : l));
      setLeads(updated);
      try {
        localStorage.setItem(localKey, JSON.stringify(updated));
      } catch (e) {
        console.error('Error writing leads cache', e);
      }
      setEditingNotesId(null);
      showToast('Internal notes saved');
    } catch (err) {
      console.error('Error saving notes:', err);
    }
  };

  // Delete lead
  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      await profileService.deleteLead(pageId, leadId);
      const updated = leads.filter((l) => l.id !== leadId);
      setLeads(updated);
      try {
        localStorage.setItem(localKey, JSON.stringify(updated));
      } catch (e) {
        console.error('Error writing leads cache', e);
      }
      if (selectedLead?.id === leadId) setSelectedLead(null);
      showToast('Lead deleted');
    } catch (err) {
      console.error('Error deleting lead:', err);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (leads.length === 0) {
      alert('No leads available to export yet.');
      return;
    }

    const headers = [
      'ID',
      'Date',
      'Type',
      'Status',
      'Name',
      'Email',
      'Phone',
      'Company / Brand',
      'Budget / Price',
      'Timeline / Date',
      'Campaign / Event / Property',
      'Package',
      'Inquiry Details',
      'Internal Notes',
    ];

    const rows = leads.map((l) => [
      l.id,
      new Date(l.createdAt || Date.now()).toLocaleDateString(),
      LEAD_TYPE_LABELS[l.type]?.label || l.type,
      l.status,
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
      `"${(l.companyOrBrand || '').replace(/"/g, '""')}"`,
      `"${(l.budgetOrPrice || '').replace(/"/g, '""')}"`,
      `"${(l.timelineOrDate || '').replace(/"/g, '""')}"`,
      `"${(l.campaignType || l.propertyTitle || l.propertyAddress || '').replace(/"/g, '""')}"`,
      `"${(l.selectedPackageName || '').replace(/"/g, '""')}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `linklyra_leads_${profile.username}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported leads to CSV');
  };

  // Add realistic test inquiry based on creator profile
  const handleAddSampleInquiry = async () => {
    let sampleLead: any = {
      name: 'Sahil Mehta',
      email: 'sahil.mehta@nexusagency.com',
      phone: '+91 98201 44552',
      companyOrBrand: 'Nexus Brand Studios',
      budgetOrPrice: '₹35,000 - ₹50,000',
      timelineOrDate: 'Next Month (Q3 Campaign)',
      details: `Hi ${profile.name || 'there'}! We came across your LinkLyra page and love your work. We are planning a targeted brand campaign and would love to collaborate on a sponsored integration. Please share your availability and commercial rates.`,
    };

    if (profile.title?.toLowerCase().includes('music') || profile.cards.some((c) => c.templateType?.includes('music'))) {
      sampleLead = {
        type: 'music_booking',
        name: 'Aarav Singhania',
        email: 'aarav@solsticefest.in',
        phone: '+91 98112 33441',
        companyOrBrand: 'Solstice Music Festival',
        campaignType: 'Live Concert (60-90 min headliner)',
        budgetOrPrice: '₹75,000 - ₹1,20,000',
        timelineOrDate: 'Saturday, November 14, 2026',
        propertyAddress: 'Royal Palms Amphitheatre, Pune',
        details: `We would love to book ${profile.name || 'you'} as our prime Saturday evening act. PA system, tech rider, and hospitality provided. Let us know if you are open to dates!`,
      };
    } else if (profile.title?.toLowerCase().includes('podcast') || profile.cards.some((c) => c.templateType?.includes('podcast'))) {
      sampleLead = {
        type: 'podcast_sponsorship',
        name: 'Pooja Verma',
        email: 'pooja.v@growfintech.io',
        phone: '+91 98765 43210',
        companyOrBrand: 'GrowFintech India',
        campaignType: 'Mid-Roll 60s Host-Read Ad',
        budgetOrPrice: '₹25,000 / episode (3-episode bundle)',
        timelineOrDate: 'Upcoming releases',
        details: 'Looking for a 3-episode sponsorship package with host personal endorsement and custom discount promo code.',
      };
    } else if (profile.title?.toLowerCase().includes('real estate') || profile.cards.some((c) => c.templateType?.includes('real_estate'))) {
      sampleLead = {
        type: 'showing_request',
        name: 'Vikram & Ananya Malhotra',
        email: 'v.malhotra@corporate.com',
        phone: '+91 98450 12345',
        propertyTitle: 'The Lumina 4BHK Penthouse',
        buyerStatus: 'Pre-Approved Mortgage Buyer',
        timelineOrDate: 'This Sunday, 11:00 AM',
        budgetOrPrice: '₹2.8 Cr - ₹3.5 Cr',
        details: 'Interested in an in-person walkthrough of the property with our architect. Please confirm if 11 AM works.',
      };
    } else {
      sampleLead.type = 'brand_inquiry';
    }

    try {
      const created = await profileService.submitLead(pageId, sampleLead);
      const updated = [created, ...leads];
      setLeads(updated);
      try {
        localStorage.setItem(localKey, JSON.stringify(updated));
      } catch (e) {
        console.error('Error writing leads cache', e);
      }
      showToast('Sample inquiry generated!');
    } catch (err) {
      console.error('Error creating sample lead:', err);
    }
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Type Filter
      if (typeFilter !== 'all' && lead.type !== typeFilter) return false;

      // Status Filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'new' && lead.status !== 'new') return false;
        if (statusFilter === 'in_progress' && lead.status !== 'in_progress' && lead.status !== 'qualified') return false;
        if (statusFilter === 'closed' && lead.status !== 'closed' && lead.status !== 'booked') return false;
        if (statusFilter === 'archived' && lead.status !== 'archived') return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (lead.name || '').toLowerCase().includes(q);
        const matchesEmail = (lead.email || '').toLowerCase().includes(q);
        const matchesCompany = (lead.companyOrBrand || '').toLowerCase().includes(q);
        const matchesDetails = (lead.details || '').toLowerCase().includes(q);
        const matchesBudget = (lead.budgetOrPrice || '').toLowerCase().includes(q);
        return matchesName || matchesEmail || matchesCompany || matchesDetails || matchesBudget;
      }

      return true;
    });
  }, [leads, typeFilter, statusFilter, searchQuery]);

  // High-level KPI metrics
  const totalInquiries = leads.length;
  const newInquiriesCount = leads.filter((l) => l.status === 'new').length;
  const inProgressCount = leads.filter((l) => l.status === 'in_progress' || l.status === 'qualified' || l.status === 'contacted').length;
  const closedCount = leads.filter((l) => l.status === 'closed' || l.status === 'booked').length;

  return (
    <div className="space-y-4 max-w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#1C1E22] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-fadeIn border border-white/10">
          <HugeiconsIcon icon={Tick01Icon} size={15} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with Title & Direct Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-black/5">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-[#1C1E22] tracking-tight">
              Inquiries & Leads CRM
            </h2>
            {newInquiriesCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1C1E22] text-white tracking-wide uppercase">
                {newInquiriesCount} NEW
              </span>
            )}
          </div>
          <p className="text-xs text-[#737882] mt-0.5">
            Incoming booking requests, brand sponsorship deals, and client lead submissions.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleAddSampleInquiry}
            className="px-3 py-1.5 rounded-xl border border-black/10 bg-white text-[#1C1E22] hover:bg-[#FAF8F5] text-xs font-semibold shadow-2xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            title="Generate a sample test lead to preview the CRM"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={13} className="shrink-0" />
            <span>Test Lead</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={leads.length === 0}
            className="px-3 py-1.5 rounded-xl border border-black/10 bg-white text-[#1C1E22] hover:bg-[#FAF8F5] disabled:opacity-50 text-xs font-semibold shadow-2xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            title="Download CSV report"
          >
            <HugeiconsIcon icon={Download01Icon} size={13} className="shrink-0" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* CRM Stats Metric Bar - Exact Design UI (Clean cards, no colored overlays, no dot signals) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 bg-white rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between text-left transition-all hover:border-black/20">
          <span className="text-[11px] font-bold text-[#737882] uppercase tracking-wider">
            Total Leads
          </span>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-xl sm:text-2xl font-extrabold text-[#1C1E22] tracking-tight">{totalInquiries}</span>
            <span className="text-[10px] font-medium text-[#737882]">All Time</span>
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between text-left transition-all hover:border-black/20">
          <span className="text-[11px] font-bold text-[#737882] uppercase tracking-wider">
            Unread / New
          </span>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-xl sm:text-2xl font-extrabold text-[#1C1E22] tracking-tight">{newInquiriesCount}</span>
            <span className="text-[10px] font-medium text-[#737882]">Needs Response</span>
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between text-left transition-all hover:border-black/20">
          <span className="text-[11px] font-bold text-[#737882] uppercase tracking-wider">
            In Discussion
          </span>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-xl sm:text-2xl font-extrabold text-[#1C1E22] tracking-tight">{inProgressCount}</span>
            <span className="text-[10px] font-medium text-[#737882]">Active Pipeline</span>
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between text-left transition-all hover:border-black/20">
          <span className="text-[11px] font-bold text-[#737882] uppercase tracking-wider">
            Booked / Won
          </span>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-xl sm:text-2xl font-extrabold text-[#1C1E22] tracking-tight">{closedCount}</span>
            <span className="text-[10px] font-medium text-[#737882]">Converted</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-2 pt-1">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, company, budget or email..."
              className="w-full pl-9 pr-8 py-2 bg-white border border-black/10 rounded-xl text-xs font-medium text-[#1C1E22] placeholder:text-[#737882] focus:outline-none focus:ring-2 focus:ring-[#1C1E22] transition-all"
            />
            <div className="absolute left-3 top-2.5 text-[#737882] pointer-events-none">
              <HugeiconsIcon icon={FilterIcon} size={14} />
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-[11px] font-bold text-[#737882] hover:text-[#1C1E22] cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Type Filter Select */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-black/10 rounded-xl text-xs font-semibold text-[#1C1E22] focus:outline-none focus:ring-2 focus:ring-[#1C1E22] cursor-pointer"
          >
            <option value="all">All Inquiry Types</option>
            <option value="brand_inquiry">Brand Partnerships</option>
            <option value="music_booking">Music Bookings</option>
            <option value="podcast_sponsorship">Podcast Sponsors</option>
            <option value="showing_request">Property Showings</option>
            <option value="home_valuation">Home Valuations</option>
            <option value="package_booking">Package Bookings</option>
            <option value="general_contact">General Inquiries</option>
            <option value="media_kit_download">Media Kit Leads</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-black/10 rounded-xl text-xs font-semibold text-[#1C1E22] focus:outline-none focus:ring-2 focus:ring-[#1C1E22] cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="in_progress">In Discussion</option>
            <option value="closed">Booked / Won</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Leads List */}
      <div className="space-y-3 pt-1">
        {isLoading ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-black/10 shadow-2xs flex flex-col items-center justify-center gap-2 text-[#737882]">
            <HugeiconsIcon icon={Loading03Icon} size={20} className="animate-spin text-[#1C1E22]" />
            <span className="text-xs font-medium">Fetching inbound leads...</span>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-black/10 shadow-2xs flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] text-[#1C1E22] border border-black/10 flex items-center justify-center shadow-2xs mb-3">
              <HugeiconsIcon icon={Mail01Icon} size={22} />
            </div>
            <h3 className="text-sm font-bold text-[#1C1E22]">No inquiries found</h3>
            <p className="text-xs text-[#737882] max-w-xs mt-1 leading-relaxed">
              {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
                ? 'Try clearing your active filters or search query.'
                : 'When visitors submit inquiries on your live cards (Booking, Collaborations, Showings), their submissions appear here.'}
            </p>
            <button
              type="button"
              onClick={handleAddSampleInquiry}
              className="mt-4 px-4 py-2 rounded-xl bg-[#1C1E22] text-white text-xs font-bold shadow-xs hover:bg-black transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <HugeiconsIcon icon={PlusSignIcon} size={14} className="shrink-0" />
              <span>Generate Sample Inquiry</span>
            </button>
          </div>
        ) : (
          filteredLeads.map((lead) => {
            const typeConfig = LEAD_TYPE_LABELS[lead.type] || LEAD_TYPE_LABELS.general_contact;
            const statusConfig = STATUS_BADGES[lead.status] || STATUS_BADGES.new;
            const TypeIcon = typeConfig.icon;
            const isEditingNotes = editingNotesId === lead.id;

            // Formatted date
            const createdDate = lead.createdAt
              ? new Date(lead.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Recently';

            return (
              <div
                key={lead.id}
                className="p-4 sm:p-5 bg-white rounded-2xl border border-black/10 hover:border-black/25 shadow-2xs hover:shadow-xs transition-all flex flex-col gap-3.5 text-left"
              >
                {/* Lead Header */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${typeConfig.colorClass}`}
                    >
                      <HugeiconsIcon icon={TypeIcon} size={12} className="shrink-0" />
                      <span>{typeConfig.label}</span>
                    </span>

                    {/* Status Dropdown - Clean without dot signals */}
                    <div className="relative">
                      <select
                        value={lead.status}
                        disabled={isUpdatingStatus === lead.id}
                        onChange={(e) => handleUpdateStatus(lead.id, e.target.value as LeadStatus)}
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#1C1E22] transition-colors ${statusConfig.badgeClass}`}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="in_progress">In Discussion</option>
                        <option value="booked">Booked / Won</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>

                  <span className="text-[11px] font-medium text-[#737882] flex items-center gap-1 shrink-0">
                    <HugeiconsIcon icon={Calendar01Icon} size={12} className="shrink-0" />
                    <span>{createdDate}</span>
                  </span>
                </div>

                {/* Lead Identity & Company */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-[#1C1E22] flex items-center gap-1.5 truncate">
                      <HugeiconsIcon icon={UserIcon} size={15} className="text-[#737882] shrink-0" />
                      <span className="truncate">{lead.name}</span>
                    </h4>
                    {lead.companyOrBrand && (
                      <p className="text-xs font-semibold text-[#737882] flex items-center gap-1 mt-0.5 truncate">
                        <HugeiconsIcon icon={Building01Icon} size={12} className="shrink-0" />
                        <span className="truncate">{lead.companyOrBrand}</span>
                      </p>
                    )}
                  </div>

                  {/* Direct Contact Shortcuts */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {lead.email && (
                      <a
                        href={`mailto:${lead.email}?subject=${encodeURIComponent(
                          `Re: Inquiry from ${profile.name || 'LinkLyra'}`
                        )}`}
                        className="p-2 rounded-xl bg-[#FAF8F5] border border-black/10 text-[#1C1E22] hover:bg-[#1C1E22] hover:text-white transition-all shadow-2xs flex items-center justify-center shrink-0"
                        title={`Email ${lead.email}`}
                      >
                        <HugeiconsIcon icon={Mail01Icon} size={14} className="shrink-0" />
                      </a>
                    )}
                    {lead.phone && (
                      <a
                        href={`https://wa.me/${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Hi ${lead.name}, thank you for reaching out via my LinkLyra page!`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-[#FAF8F5] border border-black/10 text-[#1C1E22] hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-all shadow-2xs flex items-center justify-center shrink-0"
                        title="Chat on WhatsApp"
                      >
                        <HugeiconsIcon icon={WhatsappIcon} size={15} className="shrink-0" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteLead(lead.id)}
                      className="p-2 rounded-xl bg-[#FAF8F5] border border-black/10 text-[#737882] hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all shadow-2xs cursor-pointer flex items-center justify-center shrink-0"
                      title="Delete lead"
                    >
                      <HugeiconsIcon icon={Delete01Icon} size={14} className="shrink-0" />
                    </button>
                  </div>
                </div>

                {/* Lead Attributes / Deal Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 bg-[#FAF8F5] rounded-xl border border-black/5 text-xs text-left">
                  {lead.budgetOrPrice && (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#737882] block tracking-wider">
                        Budget / Value
                      </span>
                      <span className="font-bold text-[#1C1E22] mt-0.5 block truncate">
                        {lead.budgetOrPrice}
                      </span>
                    </div>
                  )}

                  {lead.timelineOrDate && (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#737882] block tracking-wider">
                        Timeline / Target Date
                      </span>
                      <span className="font-medium text-[#1C1E22] mt-0.5 block truncate">
                        {lead.timelineOrDate}
                      </span>
                    </div>
                  )}

                  {(lead.campaignType || lead.propertyTitle || lead.selectedPackageName) && (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#737882] block tracking-wider">
                        Format / Deliverable
                      </span>
                      <span className="font-medium text-[#1C1E22] mt-0.5 block truncate">
                        {lead.selectedPackageName || lead.campaignType || lead.propertyTitle}
                      </span>
                    </div>
                  )}
                </div>

                {/* Inquiry Details Message */}
                {lead.details && (
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-black/5 text-xs text-[#1C1E22] leading-relaxed text-left">
                    <span className="text-[10px] font-bold text-[#737882] uppercase block tracking-wider mb-1">
                      Inquiry Note & Brief
                    </span>
                    <p className="whitespace-pre-wrap break-words">{lead.details}</p>
                  </div>
                )}

                {/* Internal Private Notes Section */}
                <div className="pt-2 border-t border-black/5">
                  {isEditingNotes ? (
                    <div className="space-y-2 text-left">
                      <label className="text-[11px] font-bold text-[#1C1E22] block">
                        Creator Private Notes:
                      </label>
                      <textarea
                        value={tempNotes}
                        onChange={(e) => setTempNotes(e.target.value)}
                        placeholder="Add private deal notes, follow-up dates, or client requirements..."
                        className="w-full p-2.5 text-xs bg-white border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C1E22] font-medium transition-all"
                        rows={2}
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingNotesId(null)}
                          className="px-2.5 py-1 text-xs font-semibold text-[#737882] hover:text-[#1C1E22] cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveNotes(lead.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#1C1E22] text-white text-xs font-bold hover:bg-black transition-all cursor-pointer shadow-2xs"
                        >
                          Save Note
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2 text-left">
                      <div className="text-[11px] text-[#737882] truncate flex-1 min-w-0">
                        {lead.notes ? (
                          <span className="text-[#1C1E22] truncate block">
                            <strong>Note:</strong> {lead.notes}
                          </span>
                        ) : (
                          <span className="italic">No private notes attached.</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingNotesId(lead.id);
                          setTempNotes(lead.notes || '');
                        }}
                        className="text-[11px] font-bold text-[#1C1E22] hover:underline shrink-0 cursor-pointer"
                      >
                        {lead.notes ? 'Edit Note' : '+ Add Note'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
