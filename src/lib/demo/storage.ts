import { openDB, IDBPDatabase } from 'idb';
import {
  DemoReportRecord,
  DemoMessageRecord,
  DemoEventRecord,
  DemoAttachmentRecord,
  DemoInboxItem,
  DemoVerificationRecord,
  DemoRecoveryRecord,
  DemoIdempotencyRecord,
  DemoStorageState,
} from './types';
import {
  SEED_REPORTS,
  SEED_MESSAGES,
  SEED_EVENTS,
  createSeedAttachments,
  SEED_INBOX_ITEMS,
} from './report-seed';

// Polyfill Blob methods in environments (like JSDOM) where text() or arrayBuffer() may be missing
if (typeof Blob !== 'undefined') {
  if (!Blob.prototype.text) {
    Blob.prototype.text = function (this: Blob): Promise<string> {
      return new Promise((resolve, reject) => {
        if (typeof FileReader === 'undefined') {
          resolve('');
          return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string) || '');
        reader.onerror = () => reject(reader.error);
        reader.readAsText(this);
      });
    };
  }
  if (!Blob.prototype.arrayBuffer) {
    Blob.prototype.arrayBuffer = function (this: Blob): Promise<ArrayBuffer> {
      return new Promise((resolve, reject) => {
        if (typeof FileReader === 'undefined') {
          resolve(new ArrayBuffer(0));
          return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as ArrayBuffer) || new ArrayBuffer(0));
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(this);
      });
    };
  }
}

export const DEMO_DB_NAME = 'aspirasi_demo_db';
export const DEMO_DB_VERSION = 1;

async function getSeedAttachmentsWithBytes(): Promise<Array<DemoAttachmentRecord & { bytes: Uint8Array }>> {
  const seedAtts = createSeedAttachments();
  return Promise.all(
    seedAtts.map(async (att) => {
      const buffer = await att.blob.arrayBuffer();
      return {
        ...att,
        bytes: new Uint8Array(buffer),
      };
    })
  );
}

export interface IDemoStorage {
  getAllReports(): Promise<DemoReportRecord[]>;
  getReportById(id: string): Promise<DemoReportRecord | undefined>;
  getReportByReference(referenceNumber: string): Promise<DemoReportRecord | undefined>;
  getReportByAccessCode(accessCode: string): Promise<DemoReportRecord | undefined>;
  saveReport(report: DemoReportRecord): Promise<void>;

  getMessagesByReportId(reportId: string): Promise<DemoMessageRecord[]>;
  addMessage(message: DemoMessageRecord): Promise<void>;

  getEventsByReportId(reportId: string): Promise<DemoEventRecord[]>;
  addEvent(event: DemoEventRecord): Promise<void>;

  getAttachmentById(id: string): Promise<DemoAttachmentRecord | undefined>;
  getAttachmentsByReportId(reportId: string): Promise<DemoAttachmentRecord[]>;
  saveAttachment(attachment: DemoAttachmentRecord): Promise<void>;

  getInboxItems(): Promise<DemoInboxItem[]>;
  addInboxItem(item: DemoInboxItem): Promise<void>;

  getVerification(email: string): Promise<DemoVerificationRecord | undefined>;
  saveVerification(record: DemoVerificationRecord): Promise<void>;
  deleteVerification(email: string): Promise<void>;

  getRecovery(key: string): Promise<DemoRecoveryRecord | undefined>;
  saveRecovery(record: DemoRecoveryRecord): Promise<void>;
  deleteRecovery(key: string): Promise<void>;

  getIdempotency(key: string): Promise<DemoIdempotencyRecord | undefined>;
  saveIdempotency(record: DemoIdempotencyRecord): Promise<void>;

  saveReportSubmissionAtomic(params: {
    report: DemoReportRecord;
    attachments: DemoAttachmentRecord[];
    event: DemoEventRecord;
    inboxItem: DemoInboxItem;
    idempotency?: DemoIdempotencyRecord;
    verificationToUpdate?: DemoVerificationRecord;
  }): Promise<void>;

  saveMessageAtomic(params: {
    message: DemoMessageRecord;
    updatedReport?: DemoReportRecord;
    event?: DemoEventRecord;
    idempotency?: DemoIdempotencyRecord;
  }): Promise<void>;

  getStorageState(): DemoStorageState;
  reset(): Promise<void>;
  close(): Promise<void>;
}

function handleWriteQuotaError(err: unknown): never {
  const isQuota =
    (err instanceof DOMException &&
      (err.name === 'QuotaExceededError' || err.code === 22 || err.name === 'NS_ERROR_DOM_QUOTA_REACHED')) ||
    (typeof err === 'object' && err !== null && 'name' in err && (err as { name: string }).name === 'QuotaExceededError');

  if (isQuota) {
    const error = new Error('Penyimpanan lokal peramban penuh. Tidak dapat menyimpan data baru.');
    (error as unknown as { code: string; statusCode: number }).code = 'STORAGE_QUOTA_EXCEEDED';
    (error as unknown as { code: string; statusCode: number }).statusCode = 507;
    throw error;
  }
  throw err;
}

class IndexedDBDemoStorage implements IDemoStorage {
  private db: IDBPDatabase;

  constructor(db: IDBPDatabase) {
    this.db = db;
  }

  async getAllReports(): Promise<DemoReportRecord[]> {
    return this.db.getAll('reports');
  }

  async getReportById(id: string): Promise<DemoReportRecord | undefined> {
    return this.db.get('reports', id);
  }

  async getReportByReference(referenceNumber: string): Promise<DemoReportRecord | undefined> {
    return this.db.getFromIndex('reports', 'by_ref', referenceNumber.trim().toUpperCase());
  }

  async getReportByAccessCode(accessCode: string): Promise<DemoReportRecord | undefined> {
    return this.db.getFromIndex('reports', 'by_code', accessCode.trim());
  }

  async saveReport(report: DemoReportRecord): Promise<void> {
    try {
      await this.db.put('reports', report);
    } catch (err) {
      handleWriteQuotaError(err);
    }
  }

  async getMessagesByReportId(reportId: string): Promise<DemoMessageRecord[]> {
    return this.db.getAllFromIndex('messages', 'by_report', reportId);
  }

  async addMessage(message: DemoMessageRecord): Promise<void> {
    try {
      await this.db.put('messages', message);
    } catch (err) {
      handleWriteQuotaError(err);
    }
  }

  async getEventsByReportId(reportId: string): Promise<DemoEventRecord[]> {
    return this.db.getAllFromIndex('events', 'by_report', reportId);
  }

  async addEvent(event: DemoEventRecord): Promise<void> {
    try {
      await this.db.put('events', event);
    } catch (err) {
      handleWriteQuotaError(err);
    }
  }

  async getAttachmentById(id: string): Promise<DemoAttachmentRecord | undefined> {
    const raw = await this.db.get('attachments', id);
    if (!raw) return undefined;
    let blob = raw.blob;
    if (!(blob instanceof Blob) || typeof blob.text !== 'function') {
      const bytes = (raw as unknown as { bytes?: Uint8Array }).bytes || new Uint8Array();
      const buffer = new ArrayBuffer(bytes.byteLength);
      new Uint8Array(buffer).set(bytes);
      blob = new Blob([buffer], { type: raw.content_type });
    }
    return {
      ...raw,
      blob,
    };
  }

  async getAttachmentsByReportId(reportId: string): Promise<DemoAttachmentRecord[]> {
    const list = await this.db.getAllFromIndex('attachments', 'by_report', reportId);
    return list.map((raw) => {
      let blob = raw.blob;
      if (!(blob instanceof Blob) || typeof blob.text !== 'function') {
        const bytes = (raw as unknown as { bytes?: Uint8Array }).bytes || new Uint8Array();
        const buffer = new ArrayBuffer(bytes.byteLength);
        new Uint8Array(buffer).set(bytes);
        blob = new Blob([buffer], { type: raw.content_type });
      }
      return {
        ...raw,
        blob,
      };
    });
  }

  async saveAttachment(attachment: DemoAttachmentRecord): Promise<void> {
    try {
      let bytes = new Uint8Array();
      if (attachment.blob instanceof Blob && typeof attachment.blob.arrayBuffer === 'function') {
        const buffer = await attachment.blob.arrayBuffer();
        bytes = new Uint8Array(buffer);
      }
      await this.db.put('attachments', {
        id: attachment.id,
        report_id: attachment.report_id,
        original_filename: attachment.original_filename,
        filename: attachment.filename,
        file_size_bytes: attachment.file_size_bytes,
        content_type: attachment.content_type,
        bytes,
        created_at: attachment.created_at,
      });
    } catch (err) {
      handleWriteQuotaError(err);
    }
  }

  async saveReportSubmissionAtomic(params: {
    report: DemoReportRecord;
    attachments: DemoAttachmentRecord[];
    event: DemoEventRecord;
    inboxItem: DemoInboxItem;
    idempotency?: DemoIdempotencyRecord;
    verificationToUpdate?: DemoVerificationRecord;
  }): Promise<void> {
    try {
      // Pre-compute all attachment byte buffers before opening the readwrite transaction
      const serializedAttachments: Array<{
        id: string;
        report_id: string;
        original_filename: string;
        filename: string;
        file_size_bytes: number;
        content_type: string;
        bytes: Uint8Array;
        created_at: string;
      }> = [];

      for (const att of params.attachments) {
        let bytes = new Uint8Array();
        if (att.blob instanceof Blob && typeof att.blob.arrayBuffer === 'function') {
          const buffer = await att.blob.arrayBuffer();
          bytes = new Uint8Array(buffer);
        }
        serializedAttachments.push({
          id: att.id,
          report_id: att.report_id,
          original_filename: att.original_filename,
          filename: att.filename,
          file_size_bytes: att.file_size_bytes,
          content_type: att.content_type,
          bytes,
          created_at: att.created_at,
        });
      }

      const tx = this.db.transaction(
        ['reports', 'attachments', 'events', 'inbox', 'idempotency', 'verifications'],
        'readwrite'
      );

      await tx.objectStore('reports').put(params.report);
      for (const att of serializedAttachments) {
        await tx.objectStore('attachments').put(att);
      }
      await tx.objectStore('events').put(params.event);
      await tx.objectStore('inbox').put(params.inboxItem);

      if (params.idempotency) {
        await tx.objectStore('idempotency').put(params.idempotency);
      }
      if (params.verificationToUpdate) {
        await tx.objectStore('verifications').put(params.verificationToUpdate);
      }

      await tx.done;
    } catch (err) {
      handleWriteQuotaError(err);
    }
  }

  async saveMessageAtomic(params: {
    message: DemoMessageRecord;
    updatedReport?: DemoReportRecord;
    event?: DemoEventRecord;
    idempotency?: DemoIdempotencyRecord;
  }): Promise<void> {
    try {
      const tx = this.db.transaction(
        ['messages', 'reports', 'events', 'idempotency'],
        'readwrite'
      );

      await tx.objectStore('messages').put(params.message);
      if (params.updatedReport) {
        await tx.objectStore('reports').put(params.updatedReport);
      }
      if (params.event) {
        await tx.objectStore('events').put(params.event);
      }
      if (params.idempotency) {
        await tx.objectStore('idempotency').put(params.idempotency);
      }

      await tx.done;
    } catch (err) {
      handleWriteQuotaError(err);
    }
  }

  async getInboxItems(): Promise<DemoInboxItem[]> {
    const items = await this.db.getAll('inbox');
    return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async addInboxItem(item: DemoInboxItem): Promise<void> {
    try {
      await this.db.put('inbox', item);
    } catch (err) {
      handleWriteQuotaError(err);
    }
  }

  async getVerification(email: string): Promise<DemoVerificationRecord | undefined> {
    return this.db.get('verifications', email.trim().toLowerCase());
  }

  async saveVerification(record: DemoVerificationRecord): Promise<void> {
    try {
      await this.db.put('verifications', {
        ...record,
        id: record.id.trim().toLowerCase(),
      });
    } catch (err) {
      handleWriteQuotaError(err);
    }
  }

  async deleteVerification(email: string): Promise<void> {
    await this.db.delete('verifications', email.trim().toLowerCase());
  }

  async getRecovery(key: string): Promise<DemoRecoveryRecord | undefined> {
    return this.db.get('recoveries', key);
  }

  async saveRecovery(record: DemoRecoveryRecord): Promise<void> {
    try {
      await this.db.put('recoveries', record);
    } catch (err) {
      handleWriteQuotaError(err);
    }
  }

  async deleteRecovery(key: string): Promise<void> {
    await this.db.delete('recoveries', key);
  }

  async getIdempotency(key: string): Promise<DemoIdempotencyRecord | undefined> {
    return this.db.get('idempotency', key);
  }

  async saveIdempotency(record: DemoIdempotencyRecord): Promise<void> {
    try {
      await this.db.put('idempotency', record);
    } catch (err) {
      handleWriteQuotaError(err);
    }
  }

  getStorageState(): DemoStorageState {
    return {
      mode: 'indexeddb',
      warning: null,
    };
  }

  async reset(): Promise<void> {
    const seedAttachments = await getSeedAttachmentsWithBytes();
    const tx = this.db.transaction(
      ['reports', 'messages', 'events', 'attachments', 'inbox', 'verifications', 'recoveries', 'idempotency', 'meta'],
      'readwrite'
    );
    await Promise.all([
      tx.objectStore('reports').clear(),
      tx.objectStore('messages').clear(),
      tx.objectStore('events').clear(),
      tx.objectStore('attachments').clear(),
      tx.objectStore('inbox').clear(),
      tx.objectStore('verifications').clear(),
      tx.objectStore('recoveries').clear(),
      tx.objectStore('idempotency').clear(),
      tx.objectStore('meta').clear(),
    ]);

    for (const report of SEED_REPORTS) {
      await tx.objectStore('reports').put(report);
    }
    for (const msg of SEED_MESSAGES) {
      await tx.objectStore('messages').put(msg);
    }
    for (const ev of SEED_EVENTS) {
      await tx.objectStore('events').put(ev);
    }
    for (const att of seedAttachments) {
      await tx.objectStore('attachments').put(att);
    }
    for (const item of SEED_INBOX_ITEMS) {
      await tx.objectStore('inbox').put(item);
    }
    await tx.objectStore('meta').put({ key: 'seeded_v1', value: true });
    await tx.done;
  }

  async close(): Promise<void> {
    this.db.close();
  }
}

class MemoryDemoStorage implements IDemoStorage {
  private reports = new Map<string, DemoReportRecord>();
  private messages = new Map<string, DemoMessageRecord>();
  private events = new Map<string, DemoEventRecord>();
  private attachments = new Map<string, DemoAttachmentRecord>();
  private inbox = new Map<string, DemoInboxItem>();
  private verifications = new Map<string, DemoVerificationRecord>();
  private recoveries = new Map<string, DemoRecoveryRecord>();
  private idempotency = new Map<string, DemoIdempotencyRecord>();

  constructor() {
    this.seed();
  }

  private seed(): void {
    this.reports.clear();
    this.messages.clear();
    this.events.clear();
    this.attachments.clear();
    this.inbox.clear();
    this.verifications.clear();
    this.recoveries.clear();
    this.idempotency.clear();

    for (const report of SEED_REPORTS) {
      this.reports.set(report.id, { ...report });
    }
    for (const msg of SEED_MESSAGES) {
      this.messages.set(msg.id, { ...msg });
    }
    for (const ev of SEED_EVENTS) {
      this.events.set(ev.id, { ...ev });
    }
    for (const att of createSeedAttachments()) {
      this.attachments.set(att.id, att);
    }
    for (const item of SEED_INBOX_ITEMS) {
      this.inbox.set(item.id, { ...item });
    }
  }

  async getAllReports(): Promise<DemoReportRecord[]> {
    return Array.from(this.reports.values());
  }

  async getReportById(id: string): Promise<DemoReportRecord | undefined> {
    const rep = this.reports.get(id);
    return rep ? { ...rep } : undefined;
  }

  async getReportByReference(referenceNumber: string): Promise<DemoReportRecord | undefined> {
    const upper = referenceNumber.trim().toUpperCase();
    for (const rep of this.reports.values()) {
      if (rep.reference_number.toUpperCase() === upper) {
        return { ...rep };
      }
    }
    return undefined;
  }

  async getReportByAccessCode(accessCode: string): Promise<DemoReportRecord | undefined> {
    const code = accessCode.trim();
    for (const rep of this.reports.values()) {
      if (rep.access_code === code) {
        return { ...rep };
      }
    }
    return undefined;
  }

  async saveReport(report: DemoReportRecord): Promise<void> {
    this.reports.set(report.id, { ...report });
  }

  async getMessagesByReportId(reportId: string): Promise<DemoMessageRecord[]> {
    return Array.from(this.messages.values())
      .filter((m) => m.report_id === reportId)
      .map((m) => ({ ...m }));
  }

  async addMessage(message: DemoMessageRecord): Promise<void> {
    this.messages.set(message.id, { ...message });
  }

  async getEventsByReportId(reportId: string): Promise<DemoEventRecord[]> {
    return Array.from(this.events.values())
      .filter((e) => e.report_id === reportId)
      .map((e) => ({ ...e }));
  }

  async addEvent(event: DemoEventRecord): Promise<void> {
    this.events.set(event.id, { ...event });
  }

  async getAttachmentById(id: string): Promise<DemoAttachmentRecord | undefined> {
    return this.attachments.get(id);
  }

  async getAttachmentsByReportId(reportId: string): Promise<DemoAttachmentRecord[]> {
    return Array.from(this.attachments.values()).filter((a) => a.report_id === reportId);
  }

  async saveAttachment(attachment: DemoAttachmentRecord): Promise<void> {
    this.attachments.set(attachment.id, attachment);
  }

  async getInboxItems(): Promise<DemoInboxItem[]> {
    return Array.from(this.inbox.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  async addInboxItem(item: DemoInboxItem): Promise<void> {
    this.inbox.set(item.id, { ...item });
  }

  async getVerification(email: string): Promise<DemoVerificationRecord | undefined> {
    const rec = this.verifications.get(email.trim().toLowerCase());
    return rec ? { ...rec } : undefined;
  }

  async saveVerification(record: DemoVerificationRecord): Promise<void> {
    this.verifications.set(record.id.trim().toLowerCase(), { ...record });
  }

  async deleteVerification(email: string): Promise<void> {
    this.verifications.delete(email.trim().toLowerCase());
  }

  async getRecovery(key: string): Promise<DemoRecoveryRecord | undefined> {
    const rec = this.recoveries.get(key);
    return rec ? { ...rec } : undefined;
  }

  async saveRecovery(record: DemoRecoveryRecord): Promise<void> {
    this.recoveries.set(record.id, { ...record });
  }

  async deleteRecovery(key: string): Promise<void> {
    this.recoveries.delete(key);
  }

  async getIdempotency(key: string): Promise<DemoIdempotencyRecord | undefined> {
    const rec = this.idempotency.get(key);
    return rec ? { ...rec } : undefined;
  }

  async saveIdempotency(record: DemoIdempotencyRecord): Promise<void> {
    this.idempotency.set(record.key, { ...record });
  }

  async saveReportSubmissionAtomic(params: {
    report: DemoReportRecord;
    attachments: DemoAttachmentRecord[];
    event: DemoEventRecord;
    inboxItem: DemoInboxItem;
    idempotency?: DemoIdempotencyRecord;
    verificationToUpdate?: DemoVerificationRecord;
  }): Promise<void> {
    this.reports.set(params.report.id, { ...params.report });
    for (const att of params.attachments) {
      this.attachments.set(att.id, att);
    }
    this.events.set(params.event.id, { ...params.event });
    this.inbox.set(params.inboxItem.id, { ...params.inboxItem });

    if (params.idempotency) {
      this.idempotency.set(params.idempotency.key, { ...params.idempotency });
    }
    if (params.verificationToUpdate) {
      this.verifications.set(params.verificationToUpdate.id, { ...params.verificationToUpdate });
    }
  }

  async saveMessageAtomic(params: {
    message: DemoMessageRecord;
    updatedReport?: DemoReportRecord;
    event?: DemoEventRecord;
    idempotency?: DemoIdempotencyRecord;
  }): Promise<void> {
    this.messages.set(params.message.id, { ...params.message });
    if (params.updatedReport) {
      this.reports.set(params.updatedReport.id, { ...params.updatedReport });
    }
    if (params.event) {
      this.events.set(params.event.id, { ...params.event });
    }
    if (params.idempotency) {
      this.idempotency.set(params.idempotency.key, { ...params.idempotency });
    }
  }

  getStorageState(): DemoStorageState {
    return {
      mode: 'memory',
      warning:
        'Penyimpanan peramban (IndexedDB) tidak tersedia. Berjalan dalam mode memori sementara (data akan hilang saat halaman dimuat ulang).',
    };
  }

  async reset(): Promise<void> {
    this.seed();
  }

  async close(): Promise<void> {
    // No-op for in-memory
  }
}

let activeStoragePromise: Promise<IDemoStorage> | null = null;
let activeStorageInstance: IDemoStorage | null = null;

export async function getDemoStorage(): Promise<IDemoStorage> {
  if (activeStorageInstance) {
    return activeStorageInstance;
  }

  if (activeStoragePromise) {
    return activeStoragePromise;
  }

  activeStoragePromise = (async () => {
    // Check if indexedDB is available in the runtime environment
    const isIndexedDBAvailable =
      typeof window !== 'undefined' &&
      typeof window.indexedDB !== 'undefined' &&
      typeof window.indexedDB.open === 'function';

    if (!isIndexedDBAvailable) {
      const memStorage = new MemoryDemoStorage();
      activeStorageInstance = memStorage;
      return memStorage;
    }

    try {
      const db = await openDB(DEMO_DB_NAME, DEMO_DB_VERSION, {
        upgrade(dbInstance, oldVersion) {
          if (oldVersion < 1) {
            const reportsStore = dbInstance.createObjectStore('reports', { keyPath: 'id' });
            reportsStore.createIndex('by_ref', 'reference_number', { unique: true });
            reportsStore.createIndex('by_code', 'access_code', { unique: true });
            reportsStore.createIndex('by_email', 'reporter_email', { unique: false });

            const messagesStore = dbInstance.createObjectStore('messages', { keyPath: 'id' });
            messagesStore.createIndex('by_report', 'report_id', { unique: false });

            const eventsStore = dbInstance.createObjectStore('events', { keyPath: 'id' });
            eventsStore.createIndex('by_report', 'report_id', { unique: false });

            const attachmentsStore = dbInstance.createObjectStore('attachments', { keyPath: 'id' });
            attachmentsStore.createIndex('by_report', 'report_id', { unique: false });

            const inboxStore = dbInstance.createObjectStore('inbox', { keyPath: 'id' });
            inboxStore.createIndex('by_email', 'email', { unique: false });
            inboxStore.createIndex('by_date', 'created_at', { unique: false });

            dbInstance.createObjectStore('verifications', { keyPath: 'id' });
            dbInstance.createObjectStore('recoveries', { keyPath: 'id' });
            dbInstance.createObjectStore('idempotency', { keyPath: 'key' });
            dbInstance.createObjectStore('meta', { keyPath: 'key' });
          }
        },
      });

      // Prepare seed attachments with bytes in advance so IDB transaction is not starved
      const initialSeedAttachments = await getSeedAttachmentsWithBytes();

      // Transactionally seed initial data if not yet seeded
      const tx = db.transaction(['reports', 'messages', 'events', 'attachments', 'inbox', 'meta'], 'readwrite');
      const seeded = await tx.objectStore('meta').get('seeded_v1');
      if (!seeded) {
        for (const report of SEED_REPORTS) {
          await tx.objectStore('reports').put(report);
        }
        for (const msg of SEED_MESSAGES) {
          await tx.objectStore('messages').put(msg);
        }
        for (const ev of SEED_EVENTS) {
          await tx.objectStore('events').put(ev);
        }
        for (const att of initialSeedAttachments) {
          await tx.objectStore('attachments').put(att);
        }
        for (const item of SEED_INBOX_ITEMS) {
          await tx.objectStore('inbox').put(item);
        }
        await tx.objectStore('meta').put({ key: 'seeded_v1', value: true });
      }
      await tx.done;

      const idbStorage = new IndexedDBDemoStorage(db);
      activeStorageInstance = idbStorage;
      return idbStorage;
    } catch {
      // In case IndexedDB open throws (SecurityError, private browsing, quota), smoothly fall back to memory
      const memStorage = new MemoryDemoStorage();
      activeStorageInstance = memStorage;
      return memStorage;
    }
  })();

  try {
    return await activeStoragePromise;
  } finally {
    activeStoragePromise = null;
  }
}

export async function resetDemoDatabase(): Promise<void> {
  const storage = await getDemoStorage();
  await storage.reset();
}

export async function closeDemoDatabase(): Promise<void> {
  if (activeStorageInstance) {
    await activeStorageInstance.close();
    activeStorageInstance = null;
  }
}
