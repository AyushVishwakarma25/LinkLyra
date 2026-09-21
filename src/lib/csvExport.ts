import { LeadRecord, LeadStatus, LeadType } from '../types';

export interface CsvExportOptions {
  statusFilter?: string;
  typeFilter?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Sanitizes a single cell value for CSV generation:
 * 1. Converts null/undefined to empty string.
 * 2. Neutralizes Spreadsheet Formula Injection (CSV injection / DDE attacks)
 *    by prefixing cells starting with =, +, -, @, \t, \r with a single quote (').
 * 3. Applies strict RFC-4180 escaping: if the value contains quotes, commas,
 *    or newlines, wraps the cell in quotes and doubles any internal quotes.
 */
export function escapeCsvCell(val: any): string {
  if (val === null || val === undefined) {
    return '';
  }

  let str = String(val);

  // Prevent Spreadsheet Formula Injection (CWE-1236)
  // If the cell begins with =, +, -, @, tab, or carriage return, prepend a single quote
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // RFC-4180 escaping: wrap in quotes if containing comma, quote, or newline
  if (/[",\n\r]/.test(str) || str.startsWith("'")) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Generates an RFC-4180 compliant CSV string with UTF-8 BOM from an array of LeadRecords.
 */
export function generateLeadsCsv(leads: LeadRecord[], options: CsvExportOptions = {}): string {
  let filtered = [...leads];

  if (options.statusFilter && options.statusFilter !== 'all') {
    filtered = filtered.filter((l) => l.status === options.statusFilter);
  }

  if (options.typeFilter && options.typeFilter !== 'all') {
    filtered = filtered.filter((l) => l.type === options.typeFilter);
  }

  if (options.dateFrom) {
    const fromTime = new Date(options.dateFrom).getTime();
    if (!isNaN(fromTime)) {
      filtered = filtered.filter((l) => new Date(l.createdAt || 0).getTime() >= fromTime);
    }
  }

  if (options.dateTo) {
    const toTime = new Date(options.dateTo).getTime();
    if (!isNaN(toTime)) {
      filtered = filtered.filter((l) => new Date(l.createdAt || 0).getTime() <= toTime);
    }
  }

  const headers = [
    'Lead ID',
    'Date (UTC)',
    'Status',
    'Inquiry Type',
    'Full Name',
    'Email',
    'Phone',
    'Company / Brand',
    'Campaign / Property / Event',
    'Budget / Price',
    'Timeline / Date',
    'Selected Package',
    'Inquiry Details',
    'Creator Notes',
  ];

  const rows = filtered.map((lead) => {
    return [
      escapeCsvCell(lead.id),
      escapeCsvCell(lead.createdAt),
      escapeCsvCell(lead.status),
      escapeCsvCell(lead.type),
      escapeCsvCell(lead.name),
      escapeCsvCell(lead.email),
      escapeCsvCell(lead.phone),
      escapeCsvCell(lead.companyOrBrand),
      escapeCsvCell(lead.propertyTitle || lead.campaignType || ''),
      escapeCsvCell(lead.budgetOrPrice),
      escapeCsvCell(lead.timelineOrDate),
      escapeCsvCell(lead.selectedPackageName),
      escapeCsvCell(lead.details),
      escapeCsvCell(lead.notes),
    ].join(',');
  });

  // Prepend UTF-8 Byte Order Mark (\uFEFF) for seamless Microsoft Excel Unicode decoding
  return `\uFEFF${headers.map(escapeCsvCell).join(',')}\n${rows.join('\n')}`;
}

/**
 * Triggers a browser file download of the generated CSV.
 */
export function downloadLeadsCsv(leads: LeadRecord[], filename = 'linklyra_leads.csv', options?: CsvExportOptions): void {
  const csvContent = generateLeadsCsv(leads, options);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
