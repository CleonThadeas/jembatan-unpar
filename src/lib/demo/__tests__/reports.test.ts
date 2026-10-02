import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  fetchPublicCategoriesDemo,
  submitReportDemo,
  checkAccessCodeDemo,
  getReporterReportDetailDemo,
  downloadReporterAttachmentDemo,
  postReporterMessageDemo,
  clearActiveSessionDemo,
  getDemoOverview,
  resetDemoDatabase,
} from '@/lib/demo/reports';
import { requestEmailVerificationDemo, confirmEmailVerificationDemo } from '@/lib/demo/verification';
import { getDemoStorage, closeDemoDatabase } from '@/lib/demo/storage';
import { SEED_REPORTS } from '@/lib/demo/report-seed';
import { ReportApiError } from '@/lib/api-client';

describe('Demo Reports Service & Session Scoping', () => {
  beforeEach(async () => {
    clearActiveSessionDemo();
    await resetDemoDatabase();
  });

  afterEach(async () => {
    clearActiveSessionDemo();
    await closeDemoDatabase();
  });

  it('fetchPublicCategoriesDemo returns available public categories', async () => {
    const categories = await fetchPublicCategoriesDemo();
    expect(categories.length).toBeGreaterThan(0);
    expect(categories[0]).toHaveProperty('id');
    expect(categories[0]).toHaveProperty('name');
    expect(categories[0]).toHaveProperty('slug');
  });

  describe('submitReportDemo & idempotency', () => {
    it('validates empty email or ticket', async () => {
      await expect(
        submitReportDemo({
          email: '',
          category_id: 'cat-fasilitas',
          title: 'Judul Validasi',
          description: 'Deskripsi laporan pengujian validasi tiket yang cukup panjang.',
          reporter_impact: 'Sedang',
          verification_ticket: '',
        })
      ).rejects.toThrow('Tiket verifikasi email tidak valid');
    });

    it('validates verification ticket and enforces matching email', async () => {
      await expect(
        submitReportDemo({
          email: 'test@example.com',
          category_id: 'cat-fasilitas',
          title: 'Judul Laporan Validasi',
          description: 'Deskripsi laporan pengujian validasi tiket yang cukup panjang.',
          reporter_impact: 'Sedang',
          verification_ticket: 'vt-invalid-ticket',
        })
      ).rejects.toThrow('Tiket verifikasi email tidak valid');
    });

    it('validates minimum length for title and description', async () => {
      const email = 'submitter@example.com';
      await requestEmailVerificationDemo(email);
      const storage = await getDemoStorage();
      const rec = await storage.getVerification(email);
      const { verification_ticket } = await confirmEmailVerificationDemo({ email, code: rec!.code });

      await expect(
        submitReportDemo({
          email,
          category_id: 'cat-fasilitas',
          title: 'Pendek',
          description: 'Pendek',
          reporter_impact: 'Sedang',
          verification_ticket,
        })
      ).rejects.toThrow(ReportApiError);
    });

    it('creates report, stores attachments, sends access code to demo inbox', async () => {
      const email = 'submitter@example.com';
      await requestEmailVerificationDemo(email);
      const storage = await getDemoStorage();
      const rec = await storage.getVerification(email);
      const { verification_ticket } = await confirmEmailVerificationDemo({ email, code: rec!.code });

      const file = new File(['konten lampiran'], 'bukti.txt', { type: 'text/plain' });

      const res = await submitReportDemo(
        {
          email,
          category_id: 'cat-fasilitas',
          title: 'Lampu Penerangan Lapangan Parkir Mati',
          description: 'Lampu sorot penerangan di area parkir timur mati sejak dua hari yang lalu.',
          reporter_impact: 'Sedang',
          verification_ticket,
        },
        'idempotency-key-1',
        [file]
      );

      expect(res.report_id).toBeDefined();
      expect(res.reference_number).toMatch(/^DEMO-/);
      expect(res.access_code).toMatch(/^DEMO-PASS-/);

      // Verify report in DB
      const report = await storage.getReportById(res.report_id);
      expect(report).toBeDefined();
      expect(report?.status).toBe('BARU');
      expect(report?.title).toBe('Lampu Penerangan Lapangan Parkir Mati');

      // Verify attachment
      const attachments = await storage.getAttachmentsByReportId(res.report_id);
      expect(attachments).toHaveLength(1);
      expect(attachments[0].original_filename).toBe('bukti.txt');

      // Verify inbox has access code
      const inbox = await storage.getInboxItems();
      const notification = inbox.find(
        (i) => i.email === email && i.subject.includes(res.reference_number)
      );
      expect(notification).toBeDefined();
      expect(notification?.body).toContain(res.access_code);
    });

    it('submission is idempotent when same idempotency key is replayed', async () => {
      const email = 'idempotent@example.com';
      await requestEmailVerificationDemo(email);
      const storage = await getDemoStorage();
      const rec = await storage.getVerification(email);
      const { verification_ticket } = await confirmEmailVerificationDemo({ email, code: rec!.code });

      const payload = {
        email,
        category_id: 'cat-fasilitas',
        title: 'Laporan Pengujian Idempotensi',
        description: 'Deskripsi laporan untuk menguji bahwa submission tidak terduplikasi.',
        reporter_impact: 'Sedang',
        verification_ticket,
      };

      const key = 'idem-test-key-123';
      const first = await submitReportDemo(payload, key);
      const second = await submitReportDemo(payload, key);

      expect(second.report_id).toBe(first.report_id);
      expect(second.reference_number).toBe(first.reference_number);
      expect(second.access_code).toBe(first.access_code);

      const allReports = await storage.getAllReports();
      const matching = allReports.filter((r) => r.title === payload.title);
      expect(matching).toHaveLength(1);
    });

    it('rejects submission when verification ticket is expired', async () => {
      const email = 'expired.ticket@example.com';
      await requestEmailVerificationDemo(email);
      const storage = await getDemoStorage();
      const rec = await storage.getVerification(email);
      const { verification_ticket } = await confirmEmailVerificationDemo({ email, code: rec!.code });

      // Manually expire the ticket
      const saved = await storage.getVerification(email);
      await storage.saveVerification({ ...saved!, ticket_expires_at: Date.now() - 1000 });

      await expect(
        submitReportDemo({
          email,
          category_id: 'cat-fasilitas',
          title: 'Judul Pengujian Tiket Expired',
          description: 'Deskripsi laporan yang cukup panjang untuk pengujian tiket kedaluwarsa.',
          reporter_impact: 'Sedang',
          verification_ticket,
        })
      ).rejects.toThrow('kedaluwarsa');
    });

    it('consumes verification ticket upon submission and rejects reuse for a new report', async () => {
      const email = 'single.ticket@example.com';
      await requestEmailVerificationDemo(email);
      const storage = await getDemoStorage();
      const rec = await storage.getVerification(email);
      const { verification_ticket } = await confirmEmailVerificationDemo({ email, code: rec!.code });

      const payload1 = {
        email,
        category_id: 'cat-fasilitas',
        title: 'Laporan Pertama Pengguna',
        description: 'Deskripsi laporan pertama yang berhasil diajukan dengan tiket ini.',
        reporter_impact: 'Sedang',
        verification_ticket,
      };

      await submitReportDemo(payload1, 'idemp-first-submission');

      // Attempting to submit a second report with the same consumed ticket must fail
      const payload2 = {
        email,
        category_id: 'cat-akademik',
        title: 'Laporan Kedua yang Ditolak',
        description: 'Deskripsi laporan kedua yang seharusnya ditolak karena tiket sudah digunakan.',
        reporter_impact: 'Sedang',
        verification_ticket,
      };

      await expect(submitReportDemo(payload2, 'idemp-second-submission')).rejects.toThrow(
        'telah digunakan'
      );
    });

    it('rejects idempotency replay when the key is reused with a different payload', async () => {
      const email = 'conflict@example.com';
      await requestEmailVerificationDemo(email);
      const storage = await getDemoStorage();
      const rec = await storage.getVerification(email);
      const { verification_ticket } = await confirmEmailVerificationDemo({ email, code: rec!.code });

      const payload1 = {
        email,
        category_id: 'cat-fasilitas',
        title: 'Laporan Asli Idempotensi',
        description: 'Deskripsi laporan pertama dengan key idempotensi tertentu.',
        reporter_impact: 'Sedang',
        verification_ticket,
      };

      const key = 'idem-conflict-key';
      await submitReportDemo(payload1, key);

      // Replaying with same key but altered title
      const payloadAltered = {
        ...payload1,
        title: 'Laporan Berbeda dengan Key Sama',
      };

      await expect(submitReportDemo(payloadAltered, key)).rejects.toThrow(
        /Kunci idempotensi telah digunakan/
      );
    });

    it('validates category_id against known categories', async () => {
      const email = 'category.test@example.com';
      await requestEmailVerificationDemo(email);
      const storage = await getDemoStorage();
      const rec = await storage.getVerification(email);
      const { verification_ticket } = await confirmEmailVerificationDemo({ email, code: rec!.code });

      await expect(
        submitReportDemo({
          email,
          category_id: 'cat-non-existent-category',
          title: 'Kategori Tidak Terdaftar',
          description: 'Deskripsi laporan dengan kategori fiktif yang tidak ada.',
          reporter_impact: 'Sedang',
          verification_ticket,
        })
      ).rejects.toThrow('Kategori');
    });

    it('validates reporter_impact to be Rendah, Sedang, or Tinggi', async () => {
      const email = 'impact.test@example.com';
      await requestEmailVerificationDemo(email);
      const storage = await getDemoStorage();
      const rec = await storage.getVerification(email);
      const { verification_ticket } = await confirmEmailVerificationDemo({ email, code: rec!.code });

      await expect(
        submitReportDemo({
          email,
          category_id: 'cat-fasilitas',
          title: 'Dampak Tidak Valid',
          description: 'Deskripsi laporan dengan dampak yang bukan Rendah/Sedang/Tinggi.',
          reporter_impact: 'Sangat Parah Sekali' as any,
          verification_ticket,
        })
      ).rejects.toThrow('dampak');
    });

    it('rejects submission with missing category_id', async () => {
      const email = 'nocat.test@example.com';
      await requestEmailVerificationDemo(email);
      const storage = await getDemoStorage();
      const rec = await storage.getVerification(email);
      const { verification_ticket } = await confirmEmailVerificationDemo({ email, code: rec!.code });

      await expect(
        submitReportDemo({
          email,
          category_id: '' as any,
          title: 'Judul Tanpa Kategori',
          description: 'Deskripsi laporan lengkap tapi tanpa memilih kategori.',
          reporter_impact: 'Sedang',
          verification_ticket,
        })
      ).rejects.toThrow('Kategori');
    });

    it('rejects title longer than 200 characters or description longer than 5000 characters', async () => {
      const email = 'length.test@example.com';
      await requestEmailVerificationDemo(email);
      const storage = await getDemoStorage();
      const rec = await storage.getVerification(email);
      const { verification_ticket } = await confirmEmailVerificationDemo({ email, code: rec!.code });

      await expect(
        submitReportDemo({
          email,
          category_id: 'cat-fasilitas',
          title: 'A'.repeat(201),
          description: 'Deskripsi laporan yang valid dan cukup panjang untuk pengujian.',
          reporter_impact: 'Sedang',
          verification_ticket,
        })
      ).rejects.toThrow('Judul');

      await expect(
        submitReportDemo({
          email,
          category_id: 'cat-fasilitas',
          title: 'Judul Laporan Valid',
          description: 'A'.repeat(5001),
          reporter_impact: 'Sedang',
          verification_ticket,
        })
      ).rejects.toThrow('Deskripsi');
    });

    it('rejects submissions with more than 3 attachments', async () => {
      const email = 'too-many-files@example.com';
      await requestEmailVerificationDemo(email);
      const storage = await getDemoStorage();
      const rec = await storage.getVerification(email);
      const { verification_ticket } = await confirmEmailVerificationDemo({ email, code: rec!.code });

      const files = [
        new File(['1'], 'file1.txt', { type: 'text/plain' }),
        new File(['2'], 'file2.txt', { type: 'text/plain' }),
        new File(['3'], 'file3.txt', { type: 'text/plain' }),
        new File(['4'], 'file4.txt', { type: 'text/plain' }),
      ];

      await expect(
        submitReportDemo(
          {
            email,
            category_id: 'cat-fasilitas',
            title: 'Lampiran Lebih dari Tiga',
            description: 'Deskripsi pengujian penolakan jumlah lampiran melebihi 3 file.',
            reporter_impact: 'Sedang',
            verification_ticket,
          },
          'idemp-too-many',
          files
        )
      ).rejects.toThrow(/melebihi batas maksimum 3/);
    });

    it('rejects attachment exceeding 10MB', async () => {
      const email = 'huge-file@example.com';
      await requestEmailVerificationDemo(email);
      const storage = await getDemoStorage();
      const rec = await storage.getVerification(email);
      const { verification_ticket } = await confirmEmailVerificationDemo({ email, code: rec!.code });

      const hugeFile = {
        name: 'huge.pdf',
        size: 11 * 1024 * 1024,
        type: 'application/pdf',
      } as unknown as File;

      await expect(
        submitReportDemo(
          {
            email,
            category_id: 'cat-fasilitas',
            title: 'Berkas Terlalu Besar',
            description: 'Deskripsi pengujian penolakan berkas lampiran berukuran lebih dari 10 MB.',
            reporter_impact: 'Sedang',
            verification_ticket,
          },
          'idemp-huge',
          [hugeFile]
        )
      ).rejects.toThrow(/melebihi batas 10 MB/);
    });

    it('rejects disallowed attachment MIME types', async () => {
      const email = 'mime.test@example.com';
      await requestEmailVerificationDemo(email);
      const storage = await getDemoStorage();
      const rec = await storage.getVerification(email);
      const { verification_ticket } = await confirmEmailVerificationDemo({ email, code: rec!.code });

      const disallowedFile = new File(['bin content'], 'exploit.exe', {
        type: 'application/x-msdownload',
      });

      await expect(
        submitReportDemo(
          {
            email,
            category_id: 'cat-fasilitas',
            title: 'Lampiran Tidak Didukung',
            description: 'Deskripsi pengujian lampiran file yang tipe MIME tidak diizinkan.',
            reporter_impact: 'Sedang',
            verification_ticket,
          },
          'idemp-mime-test',
          [disallowedFile]
        )
      ).rejects.toThrow('tidak didukung');
    });
  });

  describe('checkAccessCodeDemo & session management', () => {
    it('rejects empty access code', async () => {
      await expect(checkAccessCodeDemo('   ')).rejects.toThrow('Masukkan kode akses');
    });

    it('rejects nonexistent access code with 401', async () => {
      await expect(checkAccessCodeDemo('KODE-SALAH-999')).rejects.toThrow('Kode akses');
    });

    it('creates active session when access code is correct', async () => {
      const seed = SEED_REPORTS[0];
      const session = await checkAccessCodeDemo(seed.access_code);

      expect(session.report_id).toBe(seed.id);
      expect(session.session_token).toMatch(/^ses-demo-/);
      expect(session.csrf_token).toMatch(/^csrf-demo-/);
      expect(session.expires_at).toBeDefined();
    });
  });

  describe('getReporterReportDetailDemo & session scoping', () => {
    it('rejects access without session token or empty token', async () => {
      clearActiveSessionDemo();
      await expect(getReporterReportDetailDemo(null)).rejects.toThrow('Sesi');
      await expect(getReporterReportDetailDemo('   ')).rejects.toThrow('Sesi');
    });

    it('rejects access without valid session', async () => {
      clearActiveSessionDemo();
      await expect(getReporterReportDetailDemo('invalid-token')).rejects.toThrow('Sesi');
    });

    it('returns detail scoped to authenticated report with messages, events, and attachment meta', async () => {
      const seed = SEED_REPORTS[5]; // rep-demo-006 with attachment
      const session = await checkAccessCodeDemo(seed.access_code);

      const detail = await getReporterReportDetailDemo(session.session_token);
      expect(detail.report.id).toBe(seed.id);
      expect(detail.report.title).toBe(seed.title);
      expect(detail.messages).toBeInstanceOf(Array);
      expect(detail.events).toBeInstanceOf(Array);
      expect(detail.attachments).toBeDefined();
      expect(detail.attachments!.length).toBeGreaterThan(0);

      // Attachment meta should have metadata without raw Blob object
      const attMeta = detail.attachments![0];
      expect(attMeta).toHaveProperty('id');
      expect(attMeta).toHaveProperty('original_filename');
      expect(attMeta).toHaveProperty('file_size_bytes');
    });

    it('logout clears session and blocks further detail requests', async () => {
      const seed = SEED_REPORTS[0];
      const session = await checkAccessCodeDemo(seed.access_code);
      expect(await getReporterReportDetailDemo(session.session_token)).toBeDefined();

      clearActiveSessionDemo();
      await expect(getReporterReportDetailDemo(session.session_token)).rejects.toThrow('Sesi');
    });
  });

  describe('downloadReporterAttachmentDemo', () => {
    it('aborts download when AbortSignal is already aborted', async () => {
      const controller = new AbortController();
      controller.abort();

      await expect(
        downloadReporterAttachmentDemo('att-demo-006-1', 'any-session', controller.signal)
      ).rejects.toThrow('dibatalkan');
    });

    it('rejects download when attachment does not exist', async () => {
      const seed = SEED_REPORTS[0];
      const session = await checkAccessCodeDemo(seed.access_code);

      await expect(
        downloadReporterAttachmentDemo('att-non-existent', session.session_token)
      ).rejects.toThrow('tidak ditemukan');
    });

    it('allows download when session belongs to the report owning the attachment', async () => {
      const seed = SEED_REPORTS[5]; // rep-demo-006 has att-demo-006-1
      const session = await checkAccessCodeDemo(seed.access_code);

      const res = await downloadReporterAttachmentDemo('att-demo-006-1', session.session_token);
      expect(res.blob).toBeInstanceOf(Blob);
      expect(res.filename).toBe('denah-usulan-kantin.pdf');
      expect(res.contentType).toBe('application/pdf');
    });

    it('blocks download with 403 when session belongs to a different report (session scoping)', async () => {
      const seedOther = SEED_REPORTS[0]; // rep-demo-001 (not owner of att-demo-006-1)
      const sessionOther = await checkAccessCodeDemo(seedOther.access_code);

      await expect(
        downloadReporterAttachmentDemo('att-demo-006-1', sessionOther.session_token)
      ).rejects.toThrow('hak akses');
    });
  });

  describe('postReporterMessageDemo', () => {
    it('requires session token to post message', async () => {
      await expect(postReporterMessageDemo('Pesan pengujian', null, null)).rejects.toThrow(
        'Sesi mutasi'
      );
    });

    it('rejects posting message when report is already SELESAI', async () => {
      const seedSelesai = SEED_REPORTS[4]; // rep-demo-005 is SELESAI
      const session = await checkAccessCodeDemo(seedSelesai.access_code);

      await expect(
        postReporterMessageDemo('Pesan setelah selesai', null, session.session_token)
      ).rejects.toThrow('telah selesai');
    });

    it('posts reporter message and transitions status to DIPROSES when MENUNGGU_BALASAN_PELAPOR', async () => {
      const seedWaiting = SEED_REPORTS[3]; // rep-demo-004 is MENUNGGU_BALASAN_PELAPOR
      const session = await checkAccessCodeDemo(seedWaiting.access_code);

      const msg = await postReporterMessageDemo(
        'NIM saya 12345678, kelas paralel A, berikut surat dokter terlampir.',
        session.csrf_token,
        session.session_token
      );

      expect(msg.sender_type).toBe('PELAPOR');
      expect(msg.message).toContain('12345678');

      // Verify report status is now DIPROSES
      const detail = await getReporterReportDetailDemo(session.session_token);
      expect(detail.report.status).toBe('DIPROSES');

      // Verify event logged
      const transitionEvent = detail.events.find(
        (e) => e.event_type === 'STATUS_DIUBAH' && e.new_status === 'DIPROSES'
      );
      expect(transitionEvent).toBeDefined();
    });

    it('rejects message that exceeds 5000 characters', async () => {
      const seedWaiting = SEED_REPORTS[3];
      const session = await checkAccessCodeDemo(seedWaiting.access_code);

      const tooLong = 'A'.repeat(5001);
      await expect(
        postReporterMessageDemo(tooLong, session.csrf_token, session.session_token)
      ).rejects.toThrow('panjang');
    });

    it('replays message idempotently and prevents duplicate insertion', async () => {
      const seedWaiting = SEED_REPORTS[3];
      const session = await checkAccessCodeDemo(seedWaiting.access_code);

      const text = 'Pesan idempotensi pelapor.';
      const key = 'idem-msg-key-1';

      const first = await postReporterMessageDemo(
        text,
        session.csrf_token,
        session.session_token,
        key
      );
      const second = await postReporterMessageDemo(
        text,
        session.csrf_token,
        session.session_token,
        key
      );

      expect(second.id).toBe(first.id);

      const detail = await getReporterReportDetailDemo(session.session_token);
      const matchingMessages = detail.messages.filter((m) => m.message === text);
      expect(matchingMessages).toHaveLength(1);
    });

    it('rejects message idempotency replay when key is reused with different text', async () => {
      const seedWaiting = SEED_REPORTS[3];
      const session = await checkAccessCodeDemo(seedWaiting.access_code);

      const key = 'idem-msg-conflict-key';
      await postReporterMessageDemo('Pesan pertama asli', session.csrf_token, session.session_token, key);

      await expect(
        postReporterMessageDemo('Pesan kedua berbeda', session.csrf_token, session.session_token, key)
      ).rejects.toThrow(/Kunci idempotensi/);
    });

    it('rejects empty message', async () => {
      const seedWaiting = SEED_REPORTS[3];
      const session = await checkAccessCodeDemo(seedWaiting.access_code);

      await expect(
        postReporterMessageDemo('   ', session.csrf_token, session.session_token)
      ).rejects.toThrow('Pesan tidak boleh kosong');
    });

    it('revokes active session across tabs when access code is rotated via recovery', async () => {
      const seed = SEED_REPORTS[1];
      const session = await checkAccessCodeDemo(seed.access_code);

      // Session is valid initially
      expect(await getReporterReportDetailDemo(session.session_token)).toBeDefined();

      // Simulate recovery in another tab/process
      const { requestCodeRecoveryDemo, confirmCodeRecoveryDemo } = await import(
        '@/lib/demo/verification'
      );
      await requestCodeRecoveryDemo(seed.reporter_email, seed.reference_number);

      const storage = await getDemoStorage();
      const key = `${seed.reporter_email.toLowerCase()}:${seed.reference_number.toUpperCase()}`;
      const rec = await storage.getRecovery(key);

      await confirmCodeRecoveryDemo({
        email: seed.reporter_email,
        reference_number: seed.reference_number,
        code: rec!.code,
      });

      // Now the old session token must be revoked because access_code was rotated
      await expect(getReporterReportDetailDemo(session.session_token)).rejects.toThrow(
        /dirotasi|dibatalkan|tidak valid/
      );
    });
  });

  describe('DemoCenter API: getDemoOverview & resetDemoDatabase', () => {
    it('getDemoOverview returns overview of 6 reports, demo inbox, and storage mode', async () => {
      const overview = await getDemoOverview();
      expect(overview.reports).toHaveLength(6);
      expect(overview.inbox.length).toBeGreaterThan(0);
      expect(overview.storageMode).toBe('indexeddb');
      expect(overview.storageWarning).toBeNull();

      for (const rep of overview.reports) {
        expect(rep.title).toBeDefined();
        expect(rep.reference_number).toMatch(/^DEMO-/);
        expect(rep.access_code).toMatch(/^DEMO-/);
        expect(rep.email).toContain('@example.com');
      }
    });

    it('resetDemoDatabase restores database to seed state and wipes sessions', async () => {
      const seed = SEED_REPORTS[0];
      const session = await checkAccessCodeDemo(seed.access_code);

      await resetDemoDatabase();

      // Session should be wiped
      await expect(getReporterReportDetailDemo(session.session_token)).rejects.toThrow('Sesi');

      const overview = await getDemoOverview();
      expect(overview.reports).toHaveLength(6);
    });
  });
});
