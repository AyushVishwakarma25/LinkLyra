import {
  doc,
  getDocs,
  collection,
  query,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  auth,
  db,
  sanitizeForFirestore,
  handleFirestoreError,
  OperationType,
} from './app';
import { LeadRecord, LeadStatus, LeadType } from '../../types';

export type SubmitLeadInput = {
  type: LeadType;
  name: string;
  email: string;
  phone?: string;
  companyOrBrand?: string;
  campaignType?: string;
  budgetOrPrice?: string;
  timelineOrDate?: string;
  details?: string;
  propertyTitle?: string;
  buyerStatus?: string;
  propertyAddress?: string;
  propertyCondition?: string;
  selectedPackageName?: string;
  sourceCardId?: string;
  status?: LeadStatus;
  notes?: string;
  _hp?: string;
};

export const leadsService = {
  // Submit an inbound lead into canonical subcollection: pages/{pageId}/leads
  async submitLead(
    pageId: string,
    leadData: SubmitLeadInput
  ): Promise<LeadRecord> {
    if (!pageId || pageId === 'public_page') {
      throw new Error('A valid pageId is required to submit an inquiry.');
    }

    // Honeypot check: Bots fill hidden fields; humans do not
    if (leadData._hp && leadData._hp.trim() !== '') {
      console.warn('Bot submission blocked via honeypot field.');
      return {
        id: `lead_${Date.now()}`,
        pageId,
        type: leadData.type,
        name: leadData.name,
        email: leadData.email,
        status: 'new',
        createdAt: new Date().toISOString(),
      };
    }

    const leadId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const nowIso = new Date().toISOString();

    const record: LeadRecord = {
      id: leadId,
      pageId,
      type: leadData.type,
      name: leadData.name.trim(),
      email: leadData.email.trim(),
      status: leadData.status || 'new',
      createdAt: nowIso,
      updatedAt: nowIso,
      ...(leadData.phone?.trim() ? { phone: leadData.phone.trim() } : {}),
      ...(leadData.companyOrBrand?.trim() ? { companyOrBrand: leadData.companyOrBrand.trim() } : {}),
      ...(leadData.campaignType ? { campaignType: leadData.campaignType } : {}),
      ...(leadData.budgetOrPrice ? { budgetOrPrice: leadData.budgetOrPrice } : {}),
      ...(leadData.timelineOrDate ? { timelineOrDate: leadData.timelineOrDate } : {}),
      ...(leadData.propertyTitle ? { propertyTitle: leadData.propertyTitle } : {}),
      ...(leadData.buyerStatus ? { buyerStatus: leadData.buyerStatus } : {}),
      ...(leadData.propertyAddress?.trim() ? { propertyAddress: leadData.propertyAddress.trim() } : {}),
      ...(leadData.propertyCondition ? { propertyCondition: leadData.propertyCondition } : {}),
      ...(leadData.selectedPackageName ? { selectedPackageName: leadData.selectedPackageName } : {}),
      ...(leadData.sourceCardId ? { sourceCardId: leadData.sourceCardId } : {}),
      ...(leadData.details?.trim() ? { details: leadData.details.trim() } : {}),
      ...(leadData.notes?.trim() ? { notes: leadData.notes.trim() } : {}),
    };

    const docPayload: Record<string, unknown> = {
      ...record,
      timestamp: serverTimestamp(),
    };

    try {
      const leadRef = doc(db, 'pages', pageId, 'leads', leadId);
      await setDoc(leadRef, sanitizeForFirestore(docPayload));
      return record;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `pages/${pageId}/leads/${leadId}`);
      return record;
    }
  },

  // Retrieve all leads from canonical subcollection: pages/{pageId}/leads
  async getLeads(pageId: string): Promise<LeadRecord[]> {
    const targetPageId = pageId || auth.currentUser?.uid;
    if (!targetPageId) return [];

    try {
      const leadsRef = collection(db, 'pages', targetPageId, 'leads');
      const snap = await getDocs(query(leadsRef));

      const records: LeadRecord[] = [];
      snap.forEach((d) => {
        const data = d.data();
        records.push({
          id: d.id,
          pageId: targetPageId,
          type: data.type || 'brand_inquiry',
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          status: data.status || 'new',
          companyOrBrand: data.companyOrBrand,
          timelineOrDate: data.timelineOrDate,
          budgetOrPrice: data.budgetOrPrice,
          selectedPackageName: data.selectedPackageName,
          propertyTitle: data.propertyTitle,
          details: data.details || '',
          notes: data.notes || '',
          sourceCardId: data.sourceCardId,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      });

      // Sort newest first
      return records.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, `pages/${targetPageId}/leads`);
      return [];
    }
  },

  // Update lead status in canonical subcollection: pages/{pageId}/leads/{leadId}
  async updateLeadStatus(
    pageId: string,
    leadId: string,
    status: LeadStatus,
    notes?: string
  ): Promise<void> {
    const targetPageId = pageId || auth.currentUser?.uid;
    if (!targetPageId || !leadId) return;

    const updates: Record<string, unknown> = {
      status,
      updatedAt: new Date().toISOString(),
      timestamp: serverTimestamp(),
    };
    if (notes !== undefined) updates.notes = notes;

    try {
      const ref = doc(db, 'pages', targetPageId, 'leads', leadId);
      await setDoc(ref, sanitizeForFirestore(updates), { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `pages/${targetPageId}/leads/${leadId}`);
    }
  },

  // Delete lead from canonical subcollection: pages/{pageId}/leads/{leadId}
  async deleteLead(pageId: string, leadId: string): Promise<void> {
    const targetPageId = pageId || auth.currentUser?.uid;
    if (!targetPageId || !leadId) return;

    try {
      await deleteDoc(doc(db, 'pages', targetPageId, 'leads', leadId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `pages/${targetPageId}/leads/${leadId}`);
    }
  },

  // Export leads as standard CSV string
  exportLeadsAsCsv(leads: LeadRecord[]): string {
    const headers = [
      'ID',
      'Date',
      'Status',
      'Type',
      'Name',
      'Email',
      'Phone',
      'Company/Brand',
      'Timeline',
      'Budget',
      'Package/Item',
      'Details',
      'Notes',
    ];

    const escapeCsv = (val?: string | number | null) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = leads.map((l) => [
      escapeCsv(l.id),
      escapeCsv(l.createdAt ? new Date(l.createdAt).toLocaleDateString() : ''),
      escapeCsv(l.status),
      escapeCsv(l.type),
      escapeCsv(l.name),
      escapeCsv(l.email),
      escapeCsv(l.phone),
      escapeCsv(l.companyOrBrand),
      escapeCsv(l.timelineOrDate),
      escapeCsv(l.budgetOrPrice),
      escapeCsv(l.selectedPackageName || l.propertyTitle),
      escapeCsv(l.details),
      escapeCsv(l.notes),
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  },
};
