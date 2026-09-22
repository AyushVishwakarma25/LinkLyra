import {
  doc,
  getDocs,
  collection,
  query,
  setDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import {
  auth,
  db,
  sanitizeForFirestore,
  handleFirestoreError,
  OperationType,
  FirestoreSection,
} from './app';

export const sectionsService = {
  // Retrieve sections from canonical subcollection: pages/{pageId}/sections
  async getSections(pageId: string): Promise<FirestoreSection[]> {
    if (!pageId) return [];

    try {
      const secRef = collection(db, 'pages', pageId, 'sections');
      const q = query(secRef);
      const snap = await getDocs(q);

      const sections: FirestoreSection[] = [];
      snap.forEach((d) => {
        const data = d.data() as Partial<FirestoreSection>;
        sections.push({
          id: d.id,
          title: data.title || 'Untitled Section',
          position: data.position ?? 0,
          isVisible: data.isVisible !== undefined ? data.isVisible : data.is_visible !== false,
          is_visible: data.isVisible !== undefined ? data.isVisible : data.is_visible !== false,
          page_id: pageId,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });

      return sections.sort((a, b) => a.position - b.position);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, `pages/${pageId}/sections`);
      return [];
    }
  },

  // Add section into canonical subcollection: pages/{pageId}/sections
  async addSection(
    pageId: string,
    sectionData: Partial<FirestoreSection>
  ): Promise<{ id: string }> {
    const targetPageId = pageId || auth.currentUser?.uid;
    if (!targetPageId) throw new Error('Unauthenticated');

    const newId = `sec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const position = sectionData.position ?? 0;
    const isVisible = sectionData.isVisible !== undefined ? sectionData.isVisible : sectionData.is_visible !== false;

    const payload = {
      id: newId,
      pageId: targetPageId,
      page_id: targetPageId,
      title: sectionData.title || 'New Section',
      position,
      isVisible,
      is_visible: isVisible,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, 'pages', targetPageId, 'sections', newId), sanitizeForFirestore(payload));
      return { id: newId };
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `pages/${targetPageId}/sections/${newId}`);
      return { id: newId };
    }
  },

  // Update section in canonical subcollection: pages/{pageId}/sections/{sectionId}
  async updateSection(
    pageIdOrSecId: string,
    secIdOrUpdates: string | Partial<FirestoreSection>,
    maybeUpdates?: Partial<FirestoreSection>
  ): Promise<void> {
    let pageId = auth.currentUser?.uid || '';
    let sectionId: string;
    let updates: Partial<FirestoreSection>;

    if (typeof secIdOrUpdates === 'string') {
      pageId = pageIdOrSecId;
      sectionId = secIdOrUpdates;
      updates = maybeUpdates || {};
    } else {
      sectionId = pageIdOrSecId;
      updates = secIdOrUpdates || {};
    }

    if (!pageId || !sectionId) return;

    const docUpdates: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };
    if (updates.title !== undefined) docUpdates.title = updates.title;
    if (updates.position !== undefined) docUpdates.position = updates.position;
    if (updates.isVisible !== undefined || updates.is_visible !== undefined) {
      const vis = updates.isVisible ?? updates.is_visible;
      docUpdates.isVisible = vis;
      docUpdates.is_visible = vis;
    }

    try {
      await setDoc(doc(db, 'pages', pageId, 'sections', sectionId), sanitizeForFirestore(docUpdates), { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `pages/${pageId}/sections/${sectionId}`);
    }
  },

  // Delete section from canonical subcollection: pages/{pageId}/sections/{sectionId}
  async deleteSection(pageIdOrSecId: string, maybeSecId?: string): Promise<void> {
    let pageId = auth.currentUser?.uid || '';
    let sectionId: string;

    if (maybeSecId) {
      pageId = pageIdOrSecId;
      sectionId = maybeSecId;
    } else {
      sectionId = pageIdOrSecId;
    }

    if (!pageId || !sectionId) return;

    try {
      await deleteDoc(doc(db, 'pages', pageId, 'sections', sectionId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `pages/${pageId}/sections/${sectionId}`);
    }
  },

  // Atomic batch reorder of sections
  async reorderSections(pageId: string, sectionIds: string[]): Promise<void> {
    if (!pageId || sectionIds.length === 0) return;

    const batch = writeBatch(db);
    sectionIds.forEach((id, index) => {
      const ref = doc(db, 'pages', pageId, 'sections', id);
      batch.update(ref, {
        position: index,
        updatedAt: serverTimestamp(),
      });
    });

    try {
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `pages/${pageId}/sections:reorder`);
    }
  },
};
