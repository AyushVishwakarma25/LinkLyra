import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Check,
  Trash2,
  Upload,
  Loader2,
  Building2,
  GraduationCap,
  Link2,
  MessageCircle,
  MapPin,
  Tag,
  Clock,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import {
  CardColor,
  CardTemplateType,
  ProfileCardData,
  RealEstateMetadata,
  CoachingMetadata,
  DbSection,
} from '../types';
import { BRAND_LOGOS } from '../data';
import { ProfileCard } from './ProfileCard';
import { UI_KIT } from '../lib/ui-kit';
import { generateWhatsAppIntentUrl } from '../lib/whatsapp';
import { uploadImageToStorage } from '../lib/storage';

export interface CardEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: ProfileCardData) => void;
  onDelete?: (id: string) => void;
  initialCard?: ProfileCardData | null;
  businessPhone?: string;
  sections?: DbSection[];
}

const AVAILABLE_COLORS = Object.values(UI_KIT.cardPalettes);

const PRESET_BADGES = ['FEATURED', 'FOR SALE', 'ADMISSIONS OPEN', 'NEW LAUNCH', 'HOT DEAL', 'LIMITED SEATS'];

// Quick Suggestions for Real Estate
const REAL_ESTATE_SUGGESTIONS = {
  propertyTypes: ['3 BHK Apartment', '4 BHK Luxury Villa', '2 BHK Premium Flat', 'Commercial Office', 'Gated Plot'],
  locations: ['Whitefield, Bengaluru', 'Bandra West, Mumbai', 'Sector 62, Noida', 'Hitech City, Hyderabad', 'Koregaon Park, Pune'],
  priceBrackets: ['₹45L - 75L', '₹75L - 1.2Cr', '₹1.5Cr - 2.8Cr', '₹3Cr+', 'Rent: ₹35,000/mo'],
};

// Quick Suggestions for Coaching
const COACHING_SUGGESTIONS = {
  examTracks: ['JEE Main & Advanced', 'NEET-UG Medical', 'Foundation (8-10th)', 'Spoken English & IELTS', 'UPSC & Civil Services', 'CA Foundation'],
  batchTimings: ['Morning (7:30 - 11:30 AM)', 'Evening (4:00 - 8:00 PM)', 'Weekend Intensive', 'Flexible Online Batch'],
  feeStructures: ['₹45,000 / year', '₹3,500 / month', '₹85,000 Full Course', 'Scholarship up to 100%'],
};

export const CardEditorModal: React.FC<CardEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialCard,
  businessPhone = '',
  sections = [],
}) => {
  const isEditing = Boolean(initialCard);

  // Template Type: 'standard' | 'real_estate' | 'coaching_institute' | 'youtube' | 'spotify' | 'product' | 'email' | 'phone'
  const [templateType, setTemplateType] = useState<CardTemplateType>('standard');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');

  // Core Fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('https://');
  const [color, setColor] = useState<CardColor>('purple');
  const [logoSrc, setLogoSrc] = useState('');
  const [badgeText, setBadgeText] = useState('FOR SALE');
  const [expanded, setExpanded] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [customWhatsappPhone, setCustomWhatsappPhone] = useState('');

  // Real Estate Specialized Fields
  const [propertyName, setPropertyName] = useState('');
  const [location, setLocation] = useState('Whitefield, Bengaluru');
  const [priceBracket, setPriceBracket] = useState('₹75L - 1.2Cr');
  const [propertyType, setPropertyType] = useState('3 BHK Apartment / Villa');

  // Coaching Institute Specialized Fields
  const [courseName, setCourseName] = useState('');
  const [examTrack, setExamTrack] = useState('JEE / NEET');
  const [batchTiming, setBatchTiming] = useState('Morning (8:00 AM - 12:00 PM)');
  const [feeStructure, setFeeStructure] = useState('₹45,000 / year');

  // Sync state when initialCard changes
  useEffect(() => {
    if (initialCard) {
      const type = initialCard.templateType || 'standard';
      setTemplateType(type);
      setSelectedSectionId(initialCard.sectionId || '');
      setTitle(initialCard.title || '');
      setSubtitle(initialCard.subtitle || '');
      setLinkUrl(initialCard.linkUrl || 'https://');
      setColor(initialCard.color || 'purple');
      setLogoSrc(initialCard.logoSrc || '');
      setBadgeText(initialCard.badgeText || '');
      setExpanded(initialCard.expanded ?? true);
      setIsActive(initialCard.isActive !== false);
      setCustomWhatsappPhone(initialCard.customWhatsappPhone || '');

      if (initialCard.realEstate) {
        setPropertyName(initialCard.realEstate.propertyName || initialCard.title || '');
        setLocation(initialCard.realEstate.location || '');
        setPriceBracket(initialCard.realEstate.priceBracket || '');
        setPropertyType(initialCard.realEstate.propertyType || '');
      }

      if (initialCard.coaching) {
        setCourseName(initialCard.coaching.courseName || initialCard.title || '');
        setExamTrack(initialCard.coaching.examTrack || '');
        setBatchTiming(initialCard.coaching.batchTiming || '');
        setFeeStructure(initialCard.coaching.feeStructure || '');
      }
    } else {
      // Clean blank starter card
      setTemplateType('standard');
      setSelectedSectionId('');
      setTitle('');
      setPropertyName('');
      setLocation('');
      setPriceBracket('');
      setPropertyType('');
      setCourseName('');
      setExamTrack('');
      setBatchTiming('');
      setFeeStructure('');
      setSubtitle('');
      setLinkUrl('https://');
      setColor('purple');
      setLogoSrc('');
      setBadgeText('');
      setExpanded(false);
      setIsActive(true);
      setCustomWhatsappPhone('');
    }
  }, [initialCard, isOpen]);

  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      return;
    }
    setIsUploading(true);
    try {
      const url = await uploadImageToStorage(file, 'page_image');
      setLogoSrc(url);
    } catch (err) {
      console.error('Error uploading image to storage:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Switch template archetype with intelligent defaults
  const handleSelectTemplate = (type: CardTemplateType) => {
    setTemplateType(type);
    if (type === 'real_estate') {
      if (!title || title.includes('Course') || title.includes('Batch')) {
        setTitle(propertyName || 'Prestige Heights');
      }
      if (!badgeText) setBadgeText('FOR SALE');
    } else if (type === 'coaching_institute') {
      if (!title || title.includes('Residences') || title.includes('Villas') || title.includes('Apartment')) {
        setTitle(courseName || 'Target JEE & NEET 2027');
      }
      if (!badgeText) setBadgeText('ADMISSIONS OPEN');
    }
  };

  // Build live preview object
  const previewRealEstate: RealEstateMetadata | undefined =
    templateType === 'real_estate'
      ? {
          propertyName: propertyName.trim() || title.trim(),
          location: location.trim(),
          priceBracket: priceBracket.trim(),
          propertyType: propertyType.trim(),
        }
      : undefined;

  const previewCoaching: CoachingMetadata | undefined =
    templateType === 'coaching_institute'
      ? {
          courseName: courseName.trim() || title.trim(),
          examTrack: examTrack.trim(),
          batchTiming: batchTiming.trim(),
          feeStructure: feeStructure.trim(),
        }
      : undefined;

  const previewCard: ProfileCardData = {
    id: initialCard ? initialCard.id : 'preview-card',
    title: title.trim() || (templateType === 'real_estate' ? 'Property Name' : templateType === 'coaching_institute' ? 'Course Name' : 'Card Title'),
    subtitle: subtitle.trim() || undefined,
    linkUrl: linkUrl.trim() || 'https://',
    color,
    logoSrc: logoSrc || undefined,
    badgeText: badgeText.trim() || undefined,
    expanded,
    isActive,
    templateType,
    realEstate: previewRealEstate,
    coaching: previewCoaching,
    customWhatsappPhone: customWhatsappPhone.trim() || undefined,
  };

  // WhatsApp Intent generation for live preview
  const whatsAppIntent = generateWhatsAppIntentUrl(previewCard, businessPhone);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      return;
    }

    const finalCard: ProfileCardData = {
      id: initialCard ? initialCard.id : `card_${Date.now()}`,
      sectionId: selectedSectionId ? selectedSectionId : undefined,
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      linkUrl: linkUrl.trim() || 'https://',
      color,
      logoSrc: logoSrc || undefined,
      badgeText: badgeText.trim() || undefined,
      expanded,
      isActive,
      templateType,
      realEstate: previewRealEstate,
      coaching: previewCoaching,
      customWhatsappPhone: customWhatsappPhone.trim() || undefined,
      clicks: initialCard?.clicks || 0,
    };

    onSave(finalCard);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/40 backdrop-blur-xs animate-fadeIn overflow-hidden">
      <div
        className="bg-[#F5F2EB] w-full max-w-xl rounded-[28px] sm:rounded-[32px] border border-black/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-black/10 flex items-center justify-between bg-white/70 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-full bg-[#1C1E22] text-white flex items-center justify-center shadow-xs shrink-0">
              {templateType === 'real_estate' ? (
                <Building2 className="w-4 h-4" />
              ) : templateType === 'coaching_institute' ? (
                <GraduationCap className="w-4 h-4" />
              ) : (
                <Link2 className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm sm:text-base font-bold text-[#1C1E22] truncate">
                {isEditing ? 'Edit Business Card' : 'Create High-Converting Card'}
              </h2>
              <p className="text-[10px] sm:text-xs text-[#737882] truncate">
                Direct WhatsApp lead routing & industry metadata
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center text-[#737882] hover:text-[#1C1E22] transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 max-w-full">
          {/* Template Archetype Selector */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#737882] block mb-2">
              Industry Conversion Template
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSelectTemplate('real_estate')}
                className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all flex flex-col gap-1.5 ${
                  templateType === 'real_estate'
                    ? 'bg-white border-[#1C1E22] ring-2 ring-black/10 shadow-xs'
                    : 'bg-white/60 border-black/10 hover:bg-white text-[#737882]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${templateType === 'real_estate' ? 'bg-[#E75646] text-white' : 'bg-black/5 text-[#1C1E22]'}`}>
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  {templateType === 'real_estate' && <Check className="w-4 h-4 text-[#1C1E22]" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1C1E22]">Real Estate</div>
                  <div className="text-[10px] text-[#737882] leading-tight">Property, price & location</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTemplate('coaching_institute')}
                className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all flex flex-col gap-1.5 ${
                  templateType === 'coaching_institute'
                    ? 'bg-white border-[#1C1E22] ring-2 ring-black/10 shadow-xs'
                    : 'bg-white/60 border-black/10 hover:bg-white text-[#737882]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${templateType === 'coaching_institute' ? 'bg-[#5E4BF7] text-white' : 'bg-black/5 text-[#1C1E22]'}`}>
                    <GraduationCap className="w-3.5 h-3.5" />
                  </div>
                  {templateType === 'coaching_institute' && <Check className="w-4 h-4 text-[#1C1E22]" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1C1E22]">Coaching Inst.</div>
                  <div className="text-[10px] text-[#737882] leading-tight">Exam track, timing & fee</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTemplate('standard')}
                className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all flex flex-col gap-1.5 ${
                  templateType === 'standard'
                    ? 'bg-white border-[#1C1E22] ring-2 ring-black/10 shadow-xs'
                    : 'bg-white/60 border-black/10 hover:bg-white text-[#737882]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${templateType === 'standard' ? 'bg-[#1C1E22] text-white' : 'bg-black/5 text-[#1C1E22]'}`}>
                    <Link2 className="w-3.5 h-3.5" />
                  </div>
                  {templateType === 'standard' && <Check className="w-4 h-4 text-[#1C1E22]" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1C1E22]">Standard Link</div>
                  <div className="text-[10px] text-[#737882] leading-tight">Classic link card</div>
                </div>
              </button>
            </div>
          </div>

          {/* Live Card Preview */}
          <div className="space-y-1.5 max-w-full">
            <div className="flex items-center justify-between">
              <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#737882] block">
                Live Card Preview
              </label>
              <span className="text-[10px] font-semibold text-[#10B981] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                WhatsApp Lead Engine Active
              </span>
            </div>
            <div className="p-3 sm:p-4 bg-white/70 rounded-2xl sm:rounded-3xl border border-black/10 shadow-2xs max-w-full overflow-hidden">
              <ProfileCard
                title={previewCard.title}
                subtitle={previewCard.subtitle}
                linkUrl={previewCard.linkUrl}
                color={previewCard.color}
                logoSrc={previewCard.logoSrc}
                badgeText={previewCard.badgeText}
                expanded={previewCard.expanded}
                templateType={previewCard.templateType}
                realEstate={previewCard.realEstate}
                coaching={previewCard.coaching}
                businessPhone={businessPhone}
                customWhatsappPhone={previewCard.customWhatsappPhone}
                interactive={false}
              />
            </div>
          </div>

          {/* Real-Time WhatsApp Lead Routing Preview Box */}
          <div className="p-3 bg-[#E7F8EE] rounded-2xl border border-[#25D366]/30 text-xs space-y-1.5">
            <div className="flex items-center justify-between font-bold text-[#128C7E]">
              <div className="flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-[#25D366]" fill="#25D366" />
                <span>Automated WhatsApp Lead Intent Preview</span>
              </div>
              <span className="text-[10px] font-semibold bg-[#25D366]/20 text-[#128C7E] px-2 py-0.5 rounded-full">
                wa.me intent
              </span>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-[#25D366]/20 font-mono text-[11px] text-[#1C1E22] break-words">
              "{whatsAppIntent.messageText}"
            </div>
            <div className="text-[10px] text-[#737882] flex items-center justify-between">
              <span>
                Routes to:{' '}
                <strong className="text-[#1C1E22]">
                  {whatsAppIntent.businessPhone ? `+${whatsAppIntent.businessPhone}` : '⚠️ Phone not configured yet'}
                </strong>
              </span>
              {!whatsAppIntent.hasPhone && (
                <span className="text-amber-700 font-medium">Set WhatsApp in profile settings or below</span>
              )}
            </div>
          </div>

          <form id="card-editor-form" onSubmit={handleSubmit} className="space-y-4 max-w-full">
            {/* Template Specific Form Fields */}
            {templateType === 'real_estate' && (
              <div className="p-4 bg-white/80 rounded-2xl border border-black/10 space-y-3.5 shadow-2xs">
                <div className="flex items-center gap-1.5 font-bold text-xs text-[#E75646]">
                  <Building2 className="w-4 h-4" />
                  <span>Real Estate Metadata</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#1C1E22] block mb-1">
                      Property Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Prestige Palm Residences"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        setPropertyName(e.target.value);
                      }}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-black/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#E75646] shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#1C1E22] block mb-1">
                      Property Type *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 3 BHK Apartment / Villa"
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-black/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#E75646] shadow-xs"
                    />
                    <div className="flex flex-wrap gap-1 mt-1">
                      {REAL_ESTATE_SUGGESTIONS.propertyTypes.slice(0, 3).map((pt) => (
                        <button
                          key={pt}
                          type="button"
                          onClick={() => setPropertyType(pt)}
                          className="text-[9px] px-1.5 py-0.5 rounded-md bg-black/5 hover:bg-black/10 text-[#1C1E22] font-medium"
                        >
                          {pt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#1C1E22] block mb-1">
                      Location / Neighborhood *
                    </label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-[#737882] absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Whitefield, Bengaluru"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-white rounded-xl border border-black/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#E75646] shadow-xs"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {REAL_ESTATE_SUGGESTIONS.locations.slice(0, 3).map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => setLocation(loc)}
                          className="text-[9px] px-1.5 py-0.5 rounded-md bg-black/5 hover:bg-black/10 text-[#1C1E22] font-medium truncate max-w-[120px]"
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#1C1E22] block mb-1">
                      Price Bracket *
                    </label>
                    <div className="relative">
                      <Tag className="w-3.5 h-3.5 text-[#737882] absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. ₹75L - 1.2Cr"
                        value={priceBracket}
                        onChange={(e) => setPriceBracket(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-white rounded-xl border border-black/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#E75646] shadow-xs"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {REAL_ESTATE_SUGGESTIONS.priceBrackets.slice(0, 3).map((pb) => (
                        <button
                          key={pb}
                          type="button"
                          onClick={() => setPriceBracket(pb)}
                          className="text-[9px] px-1.5 py-0.5 rounded-md bg-black/5 hover:bg-black/10 text-[#1C1E22] font-medium"
                        >
                          {pb}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Coaching Institute Form Fields */}
            {templateType === 'coaching_institute' && (
              <div className="p-4 bg-white/80 rounded-2xl border border-black/10 space-y-3.5 shadow-2xs">
                <div className="flex items-center gap-1.5 font-bold text-xs text-[#5E4BF7]">
                  <GraduationCap className="w-4 h-4" />
                  <span>Coaching Institute Metadata</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#1C1E22] block mb-1">
                      Course Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Target JEE Advanced 2027"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        setCourseName(e.target.value);
                      }}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-black/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5E4BF7] shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#1C1E22] block mb-1">
                      Exam Track *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. JEE / NEET / Spoken English"
                      value={examTrack}
                      onChange={(e) => setExamTrack(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-black/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5E4BF7] shadow-xs"
                    />
                    <div className="flex flex-wrap gap-1 mt-1">
                      {COACHING_SUGGESTIONS.examTracks.slice(0, 3).map((et) => (
                        <button
                          key={et}
                          type="button"
                          onClick={() => setExamTrack(et)}
                          className="text-[9px] px-1.5 py-0.5 rounded-md bg-black/5 hover:bg-black/10 text-[#1C1E22] font-medium"
                        >
                          {et}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#1C1E22] block mb-1">
                      Batch Timing *
                    </label>
                    <div className="relative">
                      <Clock className="w-3.5 h-3.5 text-[#737882] absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Morning / Evening"
                        value={batchTiming}
                        onChange={(e) => setBatchTiming(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-white rounded-xl border border-black/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5E4BF7] shadow-xs"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {COACHING_SUGGESTIONS.batchTimings.slice(0, 2).map((bt) => (
                        <button
                          key={bt}
                          type="button"
                          onClick={() => setBatchTiming(bt)}
                          className="text-[9px] px-1.5 py-0.5 rounded-md bg-black/5 hover:bg-black/10 text-[#1C1E22] font-medium truncate max-w-[130px]"
                        >
                          {bt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#1C1E22] block mb-1">
                      Fee Structure *
                    </label>
                    <div className="relative">
                      <CreditCard className="w-3.5 h-3.5 text-[#737882] absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. ₹45,000 / year"
                        value={feeStructure}
                        onChange={(e) => setFeeStructure(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-white rounded-xl border border-black/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5E4BF7] shadow-xs"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {COACHING_SUGGESTIONS.feeStructures.slice(0, 3).map((fs) => (
                        <button
                          key={fs}
                          type="button"
                          onClick={() => setFeeStructure(fs)}
                          className="text-[9px] px-1.5 py-0.5 rounded-md bg-black/5 hover:bg-black/10 text-[#1C1E22] font-medium"
                        >
                          {fs}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Standard Link Fields */}
            {templateType === 'standard' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-[#1C1E22] block mb-1">
                    Card Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Official Brochure or Consultation"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white rounded-xl border border-black/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5E4BF7] shadow-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#1C1E22] block mb-1">
                    Website / Destination URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white rounded-xl border border-black/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5E4BF7] shadow-xs"
                  />
                </div>
              </div>
            )}

            {/* Subtitle / Description */}
            <div>
              <label className="text-xs font-bold text-[#1C1E22] block mb-1">
                Detailed Pitch / Subtitle (Optional)
              </label>
              <input
                type="text"
                placeholder={
                  templateType === 'real_estate'
                    ? 'e.g. Ready-to-move-in, luxury clubhouse, 80% open green space'
                    : templateType === 'coaching_institute'
                    ? 'e.g. Daily practice papers, top AIR faculty, small batch size'
                    : 'e.g. Tap to inquire directly with our team on WhatsApp'
                }
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-3.5 py-2 bg-white rounded-xl border border-black/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5E4BF7] shadow-xs"
              />
            </div>

            {/* Specific WhatsApp Phone Override */}
            <div>
              <label className="text-xs font-bold text-[#1C1E22] flex items-center justify-between mb-1">
                <span>Card-Specific WhatsApp Phone (Optional)</span>
                <span className="text-[10px] text-[#737882] font-normal">
                  Overrides default profile phone
                </span>
              </label>
              <div className="relative">
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366] absolute left-3 top-2.5" fill="#25D366" />
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210 (leave empty to use business profile number)"
                  value={customWhatsappPhone}
                  onChange={(e) => setCustomWhatsappPhone(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-white rounded-xl border border-black/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#25D366] shadow-xs"
                />
              </div>
            </div>

            {/* Color Palette Selector */}
            <div>
              <label className="text-xs font-bold text-[#1C1E22] block mb-1.5">
                Chunky Card Color
              </label>
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {AVAILABLE_COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColor(c.id)}
                    className={`py-2 px-1 rounded-xl sm:rounded-2xl border flex flex-col items-center gap-1 transition-all ${
                      color === c.id
                        ? 'border-black ring-2 ring-black/20 shadow-xs'
                        : 'border-black/10 hover:border-black/30'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    <span
                      className={`text-[10px] sm:text-xs font-bold truncate max-w-full ${
                        c.id === 'yellow' || c.id === 'green' ? 'text-[#191A1E]' : 'text-white'
                      }`}
                    >
                      {c.name}
                    </span>
                    {color === c.id && (
                      <Check
                        className={`w-3 h-3 ${
                          c.id === 'yellow' || c.id === 'green' ? 'text-[#191A1E]' : 'text-white'
                        }`}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Badge / Pill Text */}
            <div>
              <label className="text-xs font-bold text-[#1C1E22] block mb-1">
                Highlight Badge (Optional)
              </label>
              <div className="flex flex-wrap gap-1 mb-1.5">
                {PRESET_BADGES.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBadgeText(badgeText === b ? '' : b)}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide transition-all ${
                      badgeText === b
                        ? 'bg-[#1C1E22] text-white shadow-2xs'
                        : 'bg-white border border-black/10 text-[#737882] hover:text-[#1C1E22]'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Or custom badge (e.g. READY POSSESSION, 20% SCHOLARSHIP)"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                className="w-full px-3 py-1.5 bg-white rounded-xl border border-black/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5E4BF7] shadow-xs"
              />
            </div>

            {/* Section Assignment (Optional) */}
            {sections && sections.length > 0 && (
              <div>
                <label className="text-xs font-bold text-[#1C1E22] block mb-1">
                  Assign to Section (Optional)
                </label>
                <select
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white rounded-xl border border-black/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5E4BF7] shadow-xs"
                >
                  <option value="">-- No Section (General Links) --</option>
                  {sections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      📁 {sec.title}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-[#737882] mt-1">
                  Group this link neatly under a section header in your showcase.
                </p>
              </div>
            )}

            {/* Card Layout Style: Compact vs Expanded */}
            <div className="p-3 bg-white/70 rounded-xl border border-black/10 flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-[#1C1E22] block truncate">
                  Featured / Expanded Card View
                </span>
                <span className="text-[10px] sm:text-[11px] text-[#737882] block truncate">
                  Displays full badges, tags & detailed pitch on profile
                </span>
              </div>
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className={`w-10 h-5 rounded-full transition-colors relative flex items-center px-0.5 shrink-0 ${
                  expanded ? 'bg-[#1C1E22]' : 'bg-black/20'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform shadow-xs ${
                    expanded ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </form>
        </div>

        {/* Footer actions */}
        <div className="px-4 sm:px-6 py-3.5 border-t border-black/10 flex items-center justify-between bg-white/70 backdrop-blur-sm shrink-0">
          {isEditing && onDelete ? (
            <button
              type="button"
              onClick={() => {
                if (initialCard) {
                  onDelete(initialCard.id);
                  onClose();
                }
              }}
              className="px-2.5 py-1.5 rounded-xl text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl hover:bg-black/5 text-xs font-bold text-[#737882] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="card-editor-form"
              className="px-4 py-2 rounded-xl bg-[#1C1E22] hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Update Card' : 'Add to Showcase'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
