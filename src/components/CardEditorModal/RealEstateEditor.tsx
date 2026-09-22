import React from 'react';
import { HugeIcon } from '../HugeIcon';
import { Building01Icon } from '@hugeicons/core-free-icons';
import { RealEstateStatusTag } from '../../types';

export interface RealEstateEditorProps {
  title: string;
  setTitle: (val: string) => void;
  propertyName: string;
  setPropertyName: (val: string) => void;
  priceBracket: string;
  setPriceBracket: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
  propertyType: string;
  setPropertyType: (val: string) => void;
  statusTag: RealEstateStatusTag;
  setStatusTag: (val: RealEstateStatusTag) => void;
  featuredAmenity: string;
  setFeaturedAmenity: (val: string) => void;
}

export const RealEstateEditor: React.FC<RealEstateEditorProps> = ({
  title,
  setTitle,
  setPropertyName,
  priceBracket,
  setPriceBracket,
  location,
  setLocation,
  propertyType,
  setPropertyType,
  statusTag,
  setStatusTag,
  featuredAmenity,
  setFeaturedAmenity,
}) => {
  return (
    <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-3">
      <h4 className="font-bold text-xs text-emerald-800 uppercase tracking-wider flex items-center gap-1">
        <HugeIcon icon={Building01Icon} size={14} className="w-3.5 h-3.5" /> Real Estate Listing Details
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-stone-700 block mb-1">Property Title *</label>
          <input
            type="text"
            required
            placeholder="e.g. Modern Hill Country Estate"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setPropertyName(e.target.value);
            }}
            className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-stone-700 block mb-1">Price / Price Bracket *</label>
          <input
            type="text"
            required
            placeholder="e.g. $1,250,000 or ₹1.8 Cr"
            value={priceBracket}
            onChange={(e) => setPriceBracket(e.target.value)}
            className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-stone-700 block mb-1">Location & City *</label>
          <input
            type="text"
            required
            placeholder="e.g. Austin, TX (Zilker Park)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-stone-700 block mb-1">Property Specs *</label>
          <input
            type="text"
            required
            placeholder="e.g. 4 Bed • 3.5 Bath • 3,200 sq ft"
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div>
          <label className="text-xs font-semibold text-stone-700 block mb-1">Listing Status Tag</label>
          <select
            value={statusTag}
            onChange={(e) => setStatusTag(e.target.value as RealEstateStatusTag)}
            className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500"
          >
            <option value="just_listed">🔥 Just Listed</option>
            <option value="open_house">📍 Open House This Weekend</option>
            <option value="price_drop">🏷️ Price Reduced</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-stone-700 block mb-1">Key Feature / Amenity</label>
          <input
            type="text"
            placeholder="e.g. Infinity Pool • Smart Home"
            value={featuredAmenity}
            onChange={(e) => setFeaturedAmenity(e.target.value)}
            className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
    </div>
  );
};
