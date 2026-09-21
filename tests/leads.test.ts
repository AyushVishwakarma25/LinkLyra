import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { escapeCsvCell, generateLeadsCsv } from '../src/lib/csvExport';
import { LeadRecord } from '../src/types';

describe('Leads & CSV Export System', () => {
  describe('escapeCsvCell', () => {
    it('returns empty string for null and undefined', () => {
      expect(escapeCsvCell(null)).toBe('');
      expect(escapeCsvCell(undefined)).toBe('');
    });

    it('neutralizes spreadsheet formula injection (=, +, -, @, \\t, \\r)', () => {
      expect(escapeCsvCell('=1+1')).toBe(`"'=1+1"`);
      expect(escapeCsvCell('@SUM(A1:A10)')).toBe(`"'@SUM(A1:A10)"`);
      expect(escapeCsvCell('+cmd|/c calc')).toBe(`"'+cmd|/c calc"`);
      expect(escapeCsvCell('-2+5')).toBe(`"'-2+5"`);
      expect(escapeCsvCell('\tmalicious')).toBe(`"'\tmalicious"`);
    });

    it('properly escapes commas, newlines, and double quotes per RFC-4180', () => {
      expect(escapeCsvCell('Hello, World')).toBe('"Hello, World"');
      expect(escapeCsvCell('Line 1\nLine 2')).toBe('"Line 1\nLine 2"');
      expect(escapeCsvCell('John "The Boss" Doe')).toBe('"John ""The Boss"" Doe"');
    });

    it('leaves standard alphanumeric strings unquoted', () => {
      expect(escapeCsvCell('StandardLeadName')).toBe('StandardLeadName');
      expect(escapeCsvCell('john.doe@example.com')).toBe('john.doe@example.com');
      expect(escapeCsvCell('9876543210')).toBe('9876543210');
    });
  });

  describe('generateLeadsCsv', () => {
    const mockLeads: LeadRecord[] = [
      {
        id: 'lead_1',
        pageId: 'user_123',
        type: 'brand_inquiry',
        name: 'Sarah Connor',
        email: 'sarah@skynet.com',
        phone: '+1 555-0199',
        companyOrBrand: 'Cyberdyne',
        campaignType: 'UGC Reel',
        budgetOrPrice: '$2,000',
        timelineOrDate: 'Next Week',
        details: 'Looking for a 60-second product review.',
        selectedPackageName: 'Premium Video',
        status: 'new',
        notes: 'Promising lead',
        createdAt: '2026-09-20T10:00:00.000Z',
      },
      {
        id: 'lead_2',
        pageId: 'user_123',
        type: 'home_valuation',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1 555-0200',
        propertyAddress: '123 Main St, Springfield',
        details: '3 Bed, 2 Bath',
        status: 'contacted',
        createdAt: '2026-09-15T12:00:00.000Z',
      },
      {
        id: 'lead_3',
        pageId: 'user_123',
        type: 'music_booking',
        name: 'Alex Rivera',
        email: 'alex@festival.org',
        status: 'won',
        createdAt: '2026-09-10T14:00:00.000Z',
      },
    ];

    it('prepends UTF-8 BOM for Microsoft Excel', () => {
      const csv = generateLeadsCsv(mockLeads);
      expect(csv.startsWith('\uFEFF')).toBe(true);
    });

    it('includes standard headers', () => {
      const csv = generateLeadsCsv(mockLeads);
      expect(csv).toContain('Lead ID,Date (UTC),Status,Inquiry Type,Full Name,Email');
    });

    it('filters by status when specified', () => {
      const csv = generateLeadsCsv(mockLeads, { statusFilter: 'new' });
      expect(csv).toContain('Sarah Connor');
      expect(csv).not.toContain('John Doe');
      expect(csv).not.toContain('Alex Rivera');
    });

    it('filters by inquiry type when specified', () => {
      const csv = generateLeadsCsv(mockLeads, { typeFilter: 'music_booking' });
      expect(csv).toContain('Alex Rivera');
      expect(csv).not.toContain('Sarah Connor');
      expect(csv).not.toContain('John Doe');
    });

    it('filters by date range', () => {
      const csv = generateLeadsCsv(mockLeads, {
        dateFrom: '2026-09-14T00:00:00.000Z',
        dateTo: '2026-09-21T00:00:00.000Z',
      });
      expect(csv).toContain('Sarah Connor');
      expect(csv).toContain('John Doe');
      expect(csv).not.toContain('Alex Rivera');
    });
  });
});
