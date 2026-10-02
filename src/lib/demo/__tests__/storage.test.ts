import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getDemoStorage,
  resetDemoDatabase,
  closeDemoDatabase,
  DEMO_DB_NAME,
} from '@/lib/demo/storage';
import { SEED_REPORTS } from '@/lib/demo/report-seed';
import { ReportApiError } from '@/lib/api-client';

describe('Demo Storage & Seeding (idb + fallback)', () => {
  beforeEach(async () => {
    await resetDemoDatabase();
  });

  afterEach(async () => {
    await closeDemoDatabase();
  });

  it('transactionally seeds exactly 6 synthetic reports with all canonical statuses on first initialize', async () => {
    const storage = await getDemoStorage();
    const reports = await storage.getAllReports();

    expect(reports).toHaveLength(6);

    const statuses = reports.map((r) => r.status);
    expect(statuses).toContain('BARU');
    expect(statuses).toContain('DITINJAU');
    expect(statuses).toContain('DIPROSES');
    expect(statuses).toContain('MENUNGGU_BALASAN_PELAPOR');
    expect(statuses).toContain('SELESAI');

    // All reference numbers and access codes must be clearly marked DEMO
    for (const report of reports) {
      expect(report.reference_number).toMatch(/^DEMO-/);
      expect(report.access_code).toMatch(/^DEMO-/);
      expect(report.reporter_email).toMatch(/@example\.com$/);
    }
  });

  it('seeding is idempotent and does not overwrite user-created reports or duplicate seeds upon reopen', async () => {
    const storage = await getDemoStorage();

    // Add a custom report
    await storage.saveReport({
      id: 'rep-user-test-1',
      reference_number: 'DEMO-2025-9999',
      access_code: 'DEMO-USER-CODE-999',
      title: 'Laporan Pengguna Buatan Demo',
      description: 'Deskripsi pengujian laporan pengguna yang dibuat di browser.',
      category_id: 'cat-fasilitas',
      category_name: 'Sarana & Prasarana',
      reporter_email: 'user.test@example.com',
      reporter_impact: 'Sedang',
      status: 'BARU',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Close and re-get storage
    await closeDemoDatabase();
    const reopenedStorage = await getDemoStorage();

    const reportsAfter = await reopenedStorage.getAllReports();
    expect(reportsAfter).toHaveLength(7);
    const userReport = await reopenedStorage.getReportById('rep-user-test-1');
    expect(userReport).toBeDefined();
    expect(userReport?.title).toBe('Laporan Pengguna Buatan Demo');
  });

  it('provides lookup by id, reference number, and access code', async () => {
    const storage = await getDemoStorage();
    const targetSeed = SEED_REPORTS[0];

    const byId = await storage.getReportById(targetSeed.id);
    expect(byId).toBeDefined();
    expect(byId?.id).toBe(targetSeed.id);

    const byRef = await storage.getReportByReference(targetSeed.reference_number);
    expect(byRef).toBeDefined();
    expect(byRef?.id).toBe(targetSeed.id);

    const byCode = await storage.getReportByAccessCode(targetSeed.access_code);
    expect(byCode).toBeDefined();
    expect(byCode?.id).toBe(targetSeed.id);
  });

  it('stores and retrieves messages and timeline events for reports', async () => {
    const storage = await getDemoStorage();
    const reportId = SEED_REPORTS[2].id; // DIPROSES seed

    const existingEvents = await storage.getEventsByReportId(reportId);
    expect(existingEvents.length).toBeGreaterThan(0);

    const newEvent = {
      id: 'ev-test-1',
      report_id: reportId,
      actor_type: 'PELAPOR',
      event_type: 'PESAN_PELAPOR',
      created_at: new Date().toISOString(),
    };
    await storage.addEvent(newEvent);

    const updatedEvents = await storage.getEventsByReportId(reportId);
    expect(updatedEvents.map((e) => e.id)).toContain('ev-test-1');

    const newMessage = {
      id: 'msg-test-1',
      report_id: reportId,
      sender_type: 'PELAPOR' as const,
      visibility: 'PUBLIC_TO_REPORTER' as const,
      message: 'Ini pesan pengujian pelapor.',
      created_at: new Date().toISOString(),
    };
    await storage.addMessage(newMessage);

    const messages = await storage.getMessagesByReportId(reportId);
    expect(messages.some((m) => m.id === 'msg-test-1')).toBe(true);
  });

  it('stores attachments as Blobs and retrieves them with binary integrity', async () => {
    const storage = await getDemoStorage();
    const reportId = SEED_REPORTS[0].id;
    const blobData = new Blob(['sample-test-attachment-content'], { type: 'text/plain' });

    await storage.saveAttachment({
      id: 'att-test-1',
      report_id: reportId,
      original_filename: 'dokumen-uji.txt',
      filename: 'dokumen-uji.txt',
      file_size_bytes: 30,
      content_type: 'text/plain',
      blob: blobData,
      created_at: new Date().toISOString(),
    });

    const att = await storage.getAttachmentById('att-test-1');
    expect(att).toBeDefined();
    expect(att?.original_filename).toBe('dokumen-uji.txt');
    expect(att?.blob).toBeInstanceOf(Blob);

    const text = await att!.blob.text();
    expect(text).toBe('sample-test-attachment-content');

    const attachmentsForReport = await storage.getAttachmentsByReportId(reportId);
    expect(attachmentsForReport.some((a) => a.id === 'att-test-1')).toBe(true);
  });

  it('manages inbox items for OTP and recovery notifications', async () => {
    const storage = await getDemoStorage();

    await storage.addInboxItem({
      id: 'inbox-test-1',
      email: 'mhs@example.com',
      subject: 'Kode Verifikasi Demo: 123456',
      body: 'Gunakan kode 123456.',
      created_at: new Date().toISOString(),
    });

    const items = await storage.getInboxItems();
    expect(items.some((i) => i.id === 'inbox-test-1')).toBe(true);
  });

  it('handles quota exceeded errors by throwing user-facing ReportApiError instead of silent failure', async () => {
    const storage = await getDemoStorage();

    // Mock a quota error on an underlying write
    const quotaError = new DOMException('The quota has been exceeded.', 'QuotaExceededError');
    vi.spyOn(storage, 'saveReport').mockRejectedValueOnce(
      new ReportApiError('STORAGE_QUOTA_EXCEEDED', 'Penyimpanan lokal peramban penuh.', 507)
    );

    await expect(
      storage.saveReport({
        id: 'rep-quota-test',
        reference_number: 'DEMO-9999-QUOTA',
        access_code: 'DEMO-QUOTA',
        title: 'Quota Test',
        description: 'Test',
        category_id: 'cat-1',
        reporter_email: 'q@example.com',
        reporter_impact: 'Rendah',
        status: 'BARU',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    ).rejects.toThrow('Penyimpanan lokal peramban penuh');
  });

  it('resetDemoDatabase restores database to initial seed state and clears user data', async () => {
    const storage = await getDemoStorage();

    await storage.saveReport({
      id: 'rep-user-to-be-deleted',
      reference_number: 'DEMO-2025-9998',
      access_code: 'DEMO-USER-CODE-998',
      title: 'Laporan Sementara',
      description: 'Akan dihapus saat reset.',
      category_id: 'cat-fasilitas',
      reporter_email: 'temp@example.com',
      reporter_impact: 'Rendah',
      status: 'BARU',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    await resetDemoDatabase();

    const freshStorage = await getDemoStorage();
    const reports = await freshStorage.getAllReports();
    expect(reports).toHaveLength(6);
    const deleted = await freshStorage.getReportById('rep-user-to-be-deleted');
    expect(deleted).toBeUndefined();
  });

  it('falls back to memory storage with visible warning when IndexedDB throws on open', async () => {
    await closeDemoDatabase();

    // Temporarily sabotage indexedDB.open
    const originalOpen = window.indexedDB.open;
    (window.indexedDB as unknown as { open: unknown }).open = () => {
      throw new DOMException('Access denied', 'SecurityError');
    };

    try {
      const fallbackStorage = await getDemoStorage();
      const state = fallbackStorage.getStorageState();

      expect(state.mode).toBe('memory');
      expect(state.warning).toContain('Penyimpanan peramban (IndexedDB) tidak tersedia');

      // Check that reports are still accessible in memory mode
      const reports = await fallbackStorage.getAllReports();
      expect(reports).toHaveLength(6);

      // Verify memory storage CRUD operations
      const seed0 = reports[0];
      expect(await fallbackStorage.getReportById(seed0.id)).toBeDefined();
      expect(await fallbackStorage.getReportByReference(seed0.reference_number)).toBeDefined();
      expect(await fallbackStorage.getReportByAccessCode(seed0.access_code)).toBeDefined();

      await fallbackStorage.saveReport({ ...seed0, title: 'Updated in memory' });
      expect((await fallbackStorage.getReportById(seed0.id))?.title).toBe('Updated in memory');

      await fallbackStorage.addMessage({
        id: 'msg-mem-1',
        report_id: seed0.id,
        sender_type: 'PELAPOR',
        visibility: 'PUBLIC_TO_REPORTER',
        message: 'Memory message',
        created_at: new Date().toISOString(),
      });
      const msgs = await fallbackStorage.getMessagesByReportId(seed0.id);
      expect(msgs.some((m) => m.id === 'msg-mem-1')).toBe(true);

      await fallbackStorage.addEvent({
        id: 'ev-mem-1',
        report_id: seed0.id,
        actor_type: 'SYSTEM',
        event_type: 'LAPORAN_DIBUAT',
        created_at: new Date().toISOString(),
      });
      const evs = await fallbackStorage.getEventsByReportId(seed0.id);
      expect(evs.some((e) => e.id === 'ev-mem-1')).toBe(true);

      const memBlob = new Blob(['mem att'], { type: 'text/plain' });
      await fallbackStorage.saveAttachment({
        id: 'att-mem-1',
        report_id: seed0.id,
        original_filename: 'mem.txt',
        filename: 'mem.txt',
        file_size_bytes: 7,
        content_type: 'text/plain',
        blob: memBlob,
        created_at: new Date().toISOString(),
      });
      expect(await fallbackStorage.getAttachmentById('att-mem-1')).toBeDefined();
      expect(await fallbackStorage.getAttachmentsByReportId(seed0.id)).toHaveLength(1);

      await fallbackStorage.addInboxItem({
        id: 'inbox-mem-1',
        email: 'mem@test.com',
        subject: 'Mem Subject',
        body: 'Mem Body',
        created_at: new Date().toISOString(),
      });
      expect((await fallbackStorage.getInboxItems()).some((i) => i.id === 'inbox-mem-1')).toBe(true);

      await fallbackStorage.saveVerification({
        id: 'mem@test.com',
        code: '123456',
        expires_at: Date.now() + 10000,
        verified: false,
      });
      expect(await fallbackStorage.getVerification('mem@test.com')).toBeDefined();
      await fallbackStorage.deleteVerification('mem@test.com');
      expect(await fallbackStorage.getVerification('mem@test.com')).toBeUndefined();

      await fallbackStorage.saveRecovery({
        id: 'mem-rec-key',
        email: 'mem@test.com',
        reference_number: 'REF-1',
        code: '654321',
        expires_at: Date.now() + 10000,
      });
      expect(await fallbackStorage.getRecovery('mem-rec-key')).toBeDefined();
      await fallbackStorage.deleteRecovery('mem-rec-key');
      expect(await fallbackStorage.getRecovery('mem-rec-key')).toBeUndefined();

      await fallbackStorage.saveIdempotency({
        key: 'mem-idem-key',
        response: { ok: true },
        created_at: Date.now(),
      });
      expect(await fallbackStorage.getIdempotency('mem-idem-key')).toBeDefined();

      await fallbackStorage.reset();
      expect(await fallbackStorage.getAllReports()).toHaveLength(6);
      await fallbackStorage.close();
    } finally {
      window.indexedDB.open = originalOpen;
      await closeDemoDatabase();
    }
  });
});
