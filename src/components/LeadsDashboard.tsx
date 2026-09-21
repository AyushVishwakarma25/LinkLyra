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
  Cancel01Icon,
  ViewIcon,
} from '@hugeicons/core-free-icons';
import { LeadRecord, LeadType, LeadStatus, UserProfile } from '../types';
import { profileService } from '../lib/firebase';
import { downloadLeadsCsv } from '../lib/csvExport';
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
  showing: {
    label: 'Property Showing',
    icon: Building01Icon,
    colorClass: 'bg-[#FAF8F5] text-[#1C1E22] border-black/10',
  },
  brand: {
    label: 'Brand Partnership',
    icon: Building01Icon,
    colorClass: 'bg-[#FAF8F5] text-[#1C1E22] border-black/10',
  },
  valuation: {
    label: 'Home Valuation',
    icon: TrendingUpIcon,
    colorClass: 'bg-[#FAF8F5] text-[#1C1E22] border-black/10',
  },
  coaching: {
    label: 'Coaching Session',
    icon: ColorsIcon,
    colorClass: 'bg-[#FAF8F5] text-[#1C1E22] border-black/10',
  },
};

const STATUS_CONFIG: Record<LeadStatus, { label: string; badgeClass: string }> = {
  new: { label: 'New', badgeClass: 'bg-[#1C1E22] text-white border-[#1C1E22]' },
  contacted: { label: 'Contacted', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  won: { label: 'Won', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  lost: { label: 'Lost', badgeClass: 'bg-stone-100 text-stone-600 border-stone-200' },
  qualified: { label: 'Qualified', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  in_progress: { label: 'In Discussion', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  closed: { label: 'Won', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  booked: { label: 'Won', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  archived: { label: 'Lost', badgeClass: 'bg-stone-100 text-stone-600 border-stone-200' },
};

const PAGE_SIZE = 10;

export const LeadsDashboard: React.FC<LeadsDashboardProps> = ({
  profile,
  currentUser,
}) => {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const pageId = profile.id || currentUser?.uid || profile.username || '';
  const localKey = `linklyra_leads_${pageId}`;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch leads from Firestore + local cache
  const fetchLeads = async () => {
    if (!pageId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      let localLeads: LeadRecord[] = [];
      try {
        const cached = localStorage.getItem(localKey);
        if (cached) localLeads = JSON.parse(cached);
      } catch (e) {
        console.error('Error reading leads cache', e);
      }

      const remoteLeads = await profileService.getLeads(pageId);

      const combinedMap = new Map<string, LeadRecord>();
      [...localLeads, ...remoteLeads].forEach((item) => {
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

  // Reset pagination when search query or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter, statusFilter]);

  // Status update
  const handleUpdateStatus = async (leadId: string, newStatus: LeadStatus) => {
    if (!pageId) return;
    setIsUpdatingStatus(leadId);
    try {
      await profileService.updateLeadStatus(pageId, leadId, newStatus);
      const updated = leads.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l));
      setLeads(updated);
      if (selectedLead?.id === leadId) {
        setSelectedLead({ ...selectedLead, status: newStatus });
      }
      try {
        localStorage.setItem(localKey, JSON.stringify(updated));
      } catch (e) {
        console.error('Error writing leads cache', e);
      }
      showToast(`Lead marked as ${STATUS_CONFIG[newStatus]?.label || newStatus}`);
    } catch (err) {
      console.error('Error updating status:', err);
      showToast('Failed to update lead status');
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  // Notes update
  const handleSaveNotes = async (leadId: string, notesText?: string) => {
    if (!pageId) return;
    const finalNotes = notesText !== undefined ? notesText : tempNotes;
    try {
      const targetLead = leads.find((l) => l.id === leadId);
      await profileService.updateLeadStatus(pageId, leadId, targetLead?.status || 'new', finalNotes);
      const updated = leads.map((l) => (l.id === leadId ? { ...l, notes: finalNotes } : l));
      setLeads(updated);
      if (selectedLead?.id === leadId) {
        setSelectedLead({ ...selectedLead, notes: finalNotes });
      }
      try {
        localStorage.setItem(localKey, JSON.stringify(updated));
      } catch (e) {
        console.error('Error writing leads cache', e);
      }
      setEditingNotesId(null);
      showToast('Internal notes saved');
    } catch (err) {
      console.error('Error saving notes:', err);
      showToast('Failed to save notes');
    }
  };

  // Delete lead
  const handleDeleteLead = async (leadId: string) => {
    if (!pageId) return;
    if (!confirm('Are you sure you want to delete this lead? This action cannot be undone.')) return;
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
      showToast('Failed to delete lead');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (leads.length === 0) {
      alert('No inbound inquiries available to export yet.');
      return;
    }

    const exportDataset = filteredLeads.length > 0 ? filteredLeads : leads;
    downloadLeadsCsv(exportDataset, profile.username || 'creator', {
      statusFilter: statusFilter !== 'all' ? (statusFilter as LeadStatus) : undefined,
    });
    showToast(`Exported ${exportDataset.length} leads to CSV`);
  };

  // Add realistic test inquiry
  const handleAddSampleInquiry = async () => {
    if (!pageId) {
      alert('Cannot create sample lead: Missing page ID');
      return;
    }

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
      showToast('Failed to create sample lead');
    }
  };

  // Filtered Leads (Newest first)
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Type Filter
      if (typeFilter !== 'all' && lead.type !== typeFilter) return false;

      // Status Filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'new' && lead.status !== 'new') return false;
        if (statusFilter === 'contacted' && lead.status !== 'contacted' && lead.status !== 'in_progress' && lead.status !== 'qualified') return false;
        if (statusFilter === 'won' && lead.status !== 'won' && lead.status !== 'closed' && lead.status !== 'booked') return false;
        if (statusFilter === 'lost' && lead.status !== 'lost' && lead.status !== 'archived') return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (lead.name || '').toLowerCase().includes(q);
        const matchesEmail = (lead.email || '').toLowerCase().includes(q);
        const matchesPhone = (lead.phone || '').toLowerCase().includes(q);
        const matchesCompany = (lead.companyOrBrand || '').toLowerCase().includes(q);
        const matchesDetails = (lead.details || '').toLowerCase().includes(q);
        const matchesBudget = (lead.budgetOrPrice || '').toLowerCase().includes(q);
        const matchesPkg = (lead.selectedPackageName || '').toLowerCase().includes(q);
        return matchesName || matchesEmail || matchesPhone || matchesCompany || matchesDetails || matchesBudget || matchesPkg;
      }

      return true;
    });
  }, [leads, typeFilter, statusFilter, searchQuery]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / PAGE_SIZE));
  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredLeads.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredLeads, currentPage]);

  // High-level KPI metrics
  const totalInquiries = leads.length;
  const newInquiriesCount = leads.filter((l) => l.status === 'new').length;
  const inProgressCount = leads.filter((l) => l.status === 'contacted' || l.status === 'in_progress' || l.status === 'qualified').length;
  const wonCount = leads.filter((l) => l.status === 'won' || l.status === 'closed' || l.status === 'booked').length;

  return (
    <div className="space-y-4 max-w-full text-left">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#1C1E22] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-fadeIn border border-white/10">
          <HugeiconsIcon icon={Tick01Icon} size={15} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with Title & Direct Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-black/5">
        <div>
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
            Incoming booking requests, brand sponsorship deals, showing appointments, and inquiries.
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

      {/* CRM Stats Metric Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 bg-white rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between transition-all hover:border-black/20">
          <span className="text-[11px] font-bold text-[#737882] uppercase tracking-wider">
            Total Leads
          </span>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-xl sm:text-2xl font-extrabold text-[#1C1E22] tracking-tight">{totalInquiries}</span>
            <span className="text-[10px] font-medium text-[#737882]">All Time</span>
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between transition-all hover:border-black/20">
          <span className="text-[11px] font-bold text-[#737882] uppercase tracking-wider">
            Unread / New
          </span>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-xl sm:text-2xl font-extrabold text-[#1C1E22] tracking-tight">{newInquiriesCount}</span>
            <span className="text-[10px] font-medium text-[#737882]">Needs Response</span>
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between transition-all hover:border-black/20">
          <span className="text-[11px] font-bold text-[#737882] uppercase tracking-wider">
            Contacted
          </span>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-xl sm:text-2xl font-extrabold text-[#1C1E22] tracking-tight">{inProgressCount}</span>
            <span className="text-[10px] font-medium text-[#737882]">In Pipeline</span>
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between transition-all hover:border-black/20">
          <span className="text-[11px] font-bold text-[#737882] uppercase tracking-wider">
            Won / Converted
          </span>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-xl sm:text-2xl font-extrabold text-[#1C1E22] tracking-tight">{wonCount}</span>
            <span className="text-[10px] font-medium text-[#737882]">Closed Deals</span>
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
              placeholder="Search by name, company, email, or brief..."
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
            <option value="won">Won</option>
            <option value="lost">Lost</option>
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
          paginatedLeads.map((lead) => {
            const typeConfig = LEAD_TYPE_LABELS[lead.type] || LEAD_TYPE_LABELS.general_contact;
            const statusConfig = STATUS_CONFIG[lead.status] || STATUS_CONFIG.new;
            const TypeIcon = typeConfig.icon;
            const isEditingNotes = editingNotesId === lead.id;

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
                className="p-4 sm:p-5 bg-white rounded-2xl border border-black/10 hover:border-black/25 shadow-2xs hover:shadow-xs transition-all flex flex-col gap-3.5"
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

                    {/* Status Select Switcher */}
                    <div className="relative">
                      <select
                        value={lead.status === 'booked' || lead.status === 'closed' ? 'won' : lead.status === 'archived' ? 'lost' : lead.status === 'in_progress' || lead.status === 'qualified' ? 'contacted' : lead.status}
                        disabled={isUpdatingStatus === lead.id}
                        onChange={(e) => handleUpdateStatus(lead.id, e.target.value as LeadStatus)}
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#1C1E22] transition-colors ${statusConfig.badgeClass}`}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="won">Won</option>
                        <option value="lost">Lost</option>
                      </select>
                    </div>
                  </div>

                  <span className="text-[11px] font-medium text-[#737882] flex items-center gap-1 shrink-0">
                    <HugeiconsIcon icon={Calendar01Icon} size={12} className="shrink-0" />
                    <span>{createdDate}</span>
                  </span>
                </div>

                {/* Lead Identity & Actions */}
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="min-w-0 flex-1 cursor-pointer"
                    onClick={() => setSelectedLead(lead)}
                  >
                    <h4 className="text-sm font-bold text-[#1C1E22] flex items-center gap-1.5 truncate hover:underline">
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

                  {/* Direct Contact & Detail Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedLead(lead)}
                      className="p-2 rounded-xl bg-[#FAF8F5] border border-black/10 text-[#1C1E22] hover:bg-black hover:text-white transition-all shadow-2xs flex items-center justify-center shrink-0 cursor-pointer"
                      title="View full lead details drawer"
                    >
                      <HugeiconsIcon icon={ViewIcon} size={14} className="shrink-0" />
                    </button>

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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 bg-[#FAF8F5] rounded-xl border border-black/5 text-xs">
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
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-black/5 text-xs text-[#1C1E22] leading-relaxed">
                    <span className="text-[10px] font-bold text-[#737882] uppercase block tracking-wider mb-1">
                      Inquiry Note & Brief
                    </span>
                    <p className="whitespace-pre-wrap break-words">{lead.details}</p>
                  </div>
                )}

                {/* Internal Private Notes Section */}
                <div className="pt-2 border-t border-black/5">
                  {isEditingNotes ? (
                    <div className="space-y-2">
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
                    <div className="flex items-center justify-between gap-2">
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

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 pb-1 border-t border-black/5 text-xs text-[#737882]">
            <span>
              Showing {(currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, filteredLeads.length)} of {filteredLeads.length} leads
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-xl border border-black/10 bg-white hover:bg-[#FAF8F5] disabled:opacity-40 font-semibold cursor-pointer shadow-2xs"
              >
                Previous
              </button>
              <span className="px-2 font-bold text-[#1C1E22]">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-xl border border-black/10 bg-white hover:bg-[#FAF8F5] disabled:opacity-40 font-semibold cursor-pointer shadow-2xs"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Drawer Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div 
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-5 sm:p-6 bg-[#1C1E22] text-white relative">
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Close"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={20} />
              </button>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-stone-300 uppercase tracking-wider mb-2">
                {LEAD_TYPE_LABELS[selectedLead.type]?.label || selectedLead.type}
              </span>
              <h3 className="text-xl font-bold tracking-tight">{selectedLead.name}</h3>
              {selectedLead.companyOrBrand && (
                <p className="text-xs text-stone-400 mt-0.5 font-medium">{selectedLead.companyOrBrand}</p>
              )}
            </div>

            {/* Drawer Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs text-[#1C1E22]">
              {/* Status Selector & Date */}
              <div className="flex items-center justify-between p-3 bg-[#FAF8F5] rounded-2xl border border-black/5">
                <div>
                  <span className="text-[10px] font-bold text-[#737882] uppercase block tracking-wider mb-1">
                    Lead Status
                  </span>
                  <select
                    value={selectedLead.status === 'booked' || selectedLead.status === 'closed' ? 'won' : selectedLead.status === 'archived' ? 'lost' : selectedLead.status === 'in_progress' || selectedLead.status === 'qualified' ? 'contacted' : selectedLead.status}
                    onChange={(e) => handleUpdateStatus(selectedLead.id, e.target.value as LeadStatus)}
                    className="text-xs font-bold px-3 py-1 rounded-xl border border-black/10 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1C1E22]"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="won">Won</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-[#737882] uppercase block tracking-wider mb-1">
                    Received On
                  </span>
                  <span className="font-semibold text-stone-700">
                    {selectedLead.createdAt
                      ? new Date(selectedLead.createdAt).toLocaleString('en-US')
                      : 'Recently'}
                  </span>
                </div>
              </div>

              {/* Contact Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#FAF8F5] rounded-2xl border border-black/5">
                <div>
                  <span className="text-[10px] font-bold text-[#737882] uppercase block tracking-wider">Email Address</span>
                  <a href={`mailto:${selectedLead.email}`} className="font-bold text-[#5E4BF7] hover:underline break-all mt-0.5 block">
                    {selectedLead.email || 'N/A'}
                  </a>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#737882] uppercase block tracking-wider">Phone / WhatsApp</span>
                  <span className="font-bold text-[#1C1E22] mt-0.5 block">
                    {selectedLead.phone || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Deal & Requirement Specifics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#FAF8F5] rounded-2xl border border-black/5">
                {selectedLead.budgetOrPrice && (
                  <div>
                    <span className="text-[10px] font-bold text-[#737882] uppercase block tracking-wider">Budget / Price</span>
                    <span className="font-bold text-[#1C1E22] mt-0.5 block">{selectedLead.budgetOrPrice}</span>
                  </div>
                )}
                {selectedLead.timelineOrDate && (
                  <div>
                    <span className="text-[10px] font-bold text-[#737882] uppercase block tracking-wider">Timeline / Date</span>
                    <span className="font-semibold text-[#1C1E22] mt-0.5 block">{selectedLead.timelineOrDate}</span>
                  </div>
                )}
                {(selectedLead.campaignType || selectedLead.selectedPackageName || selectedLead.propertyTitle) && (
                  <div>
                    <span className="text-[10px] font-bold text-[#737882] uppercase block tracking-wider">Deliverable / Item</span>
                    <span className="font-semibold text-[#1C1E22] mt-0.5 block truncate">
                      {selectedLead.selectedPackageName || selectedLead.campaignType || selectedLead.propertyTitle}
                    </span>
                  </div>
                )}
              </div>

              {/* Full Details Message */}
              {selectedLead.details && (
                <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-black/5 space-y-1">
                  <span className="text-[10px] font-bold text-[#737882] uppercase block tracking-wider">
                    Full Submission Brief
                  </span>
                  <p className="text-xs text-stone-800 leading-relaxed whitespace-pre-wrap">{selectedLead.details}</p>
                </div>
              )}

              {/* Internal Notes Editor */}
              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-black/5 space-y-2">
                <span className="text-[10px] font-bold text-[#737882] uppercase block tracking-wider">
                  Internal Creator Notes
                </span>
                <textarea
                  defaultValue={selectedLead.notes || ''}
                  placeholder="Record private deal progress, phone discussion notes, or next steps..."
                  className="w-full p-2.5 text-xs bg-white border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C1E22]"
                  rows={3}
                  id="drawer-lead-notes"
                />
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('drawer-lead-notes') as HTMLTextAreaElement | null;
                    if (el) handleSaveNotes(selectedLead.id, el.value);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#1C1E22] text-white text-xs font-bold hover:bg-black transition-all cursor-pointer shadow-2xs"
                >
                  Save Internal Note
                </button>
              </div>

              {/* Quick Actions Footer */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteLead(selectedLead.id)}
                  className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <HugeiconsIcon icon={Delete01Icon} size={14} />
                  <span>Delete Lead</span>
                </button>

                <div className="flex items-center gap-2">
                  {selectedLead.phone && (
                    <a
                      href={`https://wa.me/${selectedLead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                        `Hi ${selectedLead.name}, thank you for reaching out via my LinkLyra page!`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <HugeiconsIcon icon={WhatsappIcon} size={14} className="text-white" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                  {selectedLead.email && (
                    <a
                      href={`mailto:${selectedLead.email}?subject=${encodeURIComponent(
                        `Re: Inquiry from ${profile.name || 'LinkLyra'}`
                      )}`}
                      className="px-3.5 py-2 rounded-xl bg-[#1C1E22] hover:bg-black text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <HugeiconsIcon icon={Mail01Icon} size={14} />
                      <span>Send Email</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const LeadsPanel = LeadsDashboard;
