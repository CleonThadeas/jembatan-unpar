import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  ReportApiError,
  fetchPublicCategories,
  requestEmailVerification,
  confirmEmailVerification,
  submitReport,
  checkAccessCode,
  getReporterReportDetail,
  downloadReporterAttachment,
  postReporterMessage,
  requestCodeRecovery,
  confirmCodeRecovery,
  getDemoOverview,
  resetDemoDatabase,
} from '@/lib/api-client';
import { closeDemoDatabase } from '@/lib/demo/storage';
import { SEED_REPORTS } from '@/lib/demo/report-seed';

describe('Reporting API Client (Prototype In-Memory / IndexedDB Engine)', () => {
  beforeEach(async () => {
    await resetDemoDatabase();
  });

  afterEach(async () => {
    await closeDemoDatabase();
  });

  it('operates entirely on client-side demo storage without invoking window.fetch', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const categories = await fetchPublicCategories();
    expect(categories.length).toBeGreaterThan(0);
    expect(fetchSpy).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

  describe('fetchPublicCategories', () => {
    it('returns all pre-configured public categories', async () => {
      const categories = await fetchPublicCategories();
      expect(categories).toBeInstanceOf(Array);
      expect(categories.length).toBeGreaterThanOrEqual(6);
      expect(categories[0]).toHaveProperty('id');
      expect(categories[0]).toHaveProperty('name');
      expect(categories[0]).toHaveProperty('slug');
    });
  });

  describe('Email Verification & Report Submission Flow', () => {
    it('completes the full request -> OTP confirm -> submit report workflow', async () => {
      const email = 'pelapor.baru@example.com';

      // 1. Request verification OTP
      const reqRes = await requestEmailVerification(email);
      expect(reqRes.message).toBeDefined();

      // Retrieve overview to find the OTP deposited in the demo inbox
      const overviewBefore = await getDemoOverview();
      const otpItem = overviewBefore.inbox.find((i) => i.email === email);
      expect(otpItem).toBeDefined();
      const otpMatch = otpItem?.subject.match(/\d{6}/);
      expect(otpMatch).toBeTruthy();
      const otpCode = otpMatch![0];

      // 2. Confirm OTP to get verification ticket
      const confirmRes = await confirmEmailVerification({
        email,
        code: otpCode,
      });
      expect(confirmRes.verified_email).toBe(email);
      expect(confirmRes.verification_ticket).toMatch(/^vt-demo-/);

      // 3. Submit report with attachment
      const sampleFile = new File(['informasi bukti'], 'bukti-laporan.txt', {
        type: 'text/plain',
      });
      const submitRes = await submitReport(
        {
          email,
          category_id: 'cat-fasilitas',
          title: 'Kerusakan Fasilitas Ruang Kuliah',
          description: 'Proyektor di ruang kuliah utama padam dan tidak dapat menampilkan slide.',
          reporter_impact: 'Tinggi',
          verification_ticket: confirmRes.verification_ticket,
        },
        'idemp-client-test-1',
        [sampleFile]
      );

      expect(submitRes.report_id).toBeDefined();
      expect(submitRes.reference_number).toMatch(/^DEMO-2025-/);
      expect(submitRes.access_code).toMatch(/^DEMO-PASS-/);

      // 4. Check that new access code works to log in
      const accessRes = await checkAccessCode(submitRes.access_code);
      expect(accessRes.session_token).toBeDefined();
      expect(accessRes.report_id).toBe(submitRes.report_id);

      // 5. Read report detail using session
      const detail = await getReporterReportDetail(accessRes.session_token);
      expect(detail.report.title).toBe('Kerusakan Fasilitas Ruang Kuliah');
      expect(detail.report.status).toBe('BARU');
      expect(detail.attachments).toHaveLength(1);
      expect(detail.attachments![0].original_filename).toBe('bukti-laporan.txt');
    });
  });

  describe('Authentication & Session Scoping (Honest Sign-in Prompt)', () => {
    it('throws 401 UNAUTHORIZED when calling getReporterReportDetail without session token', async () => {
      await expect(getReporterReportDetail(null)).rejects.toThrow(ReportApiError);
      await expect(getReporterReportDetail(undefined)).rejects.toThrow(
        'Sesi Anda telah berakhir atau belum terautentikasi'
      );
      await expect(getReporterReportDetail('')).rejects.toThrow(ReportApiError);
      await expect(getReporterReportDetail('invalid-session-token')).rejects.toThrow(
        'Sesi Anda tidak valid atau telah berakhir'
      );
    });

    it('denies downloading attachments from other reports (session isolation)', async () => {
      // Seed 5 owns att-demo-006-1
      const seed6 = SEED_REPORTS[5];
      const seed1 = SEED_REPORTS[0];

      // Login as seed 1
      const accessSeed1 = await checkAccessCode(seed1.access_code);

      // Try downloading seed 6's attachment using seed 1's session
      await expect(
        downloadReporterAttachment('att-demo-006-1', accessSeed1.session_token)
      ).rejects.toThrow('hak akses');
    });

    it('allows downloading attachment when session matches the owning report', async () => {
      const seed6 = SEED_REPORTS[5];
      const accessSeed6 = await checkAccessCode(seed6.access_code);

      const file = await downloadReporterAttachment('att-demo-006-1', accessSeed6.session_token);
      expect(file.blob).toBeInstanceOf(Blob);
      expect(file.filename).toBe('denah-usulan-kantin.pdf');
    });
  });

  describe('postReporterMessage', () => {
    it('requires valid session token and rejects empty messages', async () => {
      await expect(postReporterMessage('', null, null)).rejects.toThrow('Pesan tidak boleh kosong');
      await expect(postReporterMessage('Halo', null, null)).rejects.toThrow('Sesi mutasi');
    });

    it('transitions status from MENUNGGU_BALASAN_PELAPOR to DIPROSES when pelapor replies', async () => {
      const seedWaiting = SEED_REPORTS[3]; // rep-demo-004
      const access = await checkAccessCode(seedWaiting.access_code);

      const msg = await postReporterMessage(
        'Berikut informasi tambahan: kegiatan telah dijadwalkan ulang.',
        access.csrf_token,
        access.session_token
      );

      expect(msg.sender_type).toBe('PELAPOR');

      const detail = await getReporterReportDetail(access.session_token);
      expect(detail.report.status).toBe('DIPROSES');
    });
  });

  describe('requestCodeRecovery & confirmCodeRecovery', () => {
    it('rotates access code and delivers new code to demo inbox', async () => {
      const seed = SEED_REPORTS[1];
      const oldCode = seed.access_code;

      await requestCodeRecovery(seed.reporter_email, seed.reference_number);

      const overview = await getDemoOverview();
      const recMsg = overview.inbox.find(
        (i) => i.email === seed.reporter_email && i.subject.includes('Pemulihan')
      );
      expect(recMsg).toBeDefined();

      const otp = recMsg!.body.match(/\d{6}/)![0];
      const confirmRes = await confirmCodeRecovery({
        email: seed.reporter_email,
        reference_number: seed.reference_number,
        code: otp,
      });

      expect(confirmRes.message).toContain('berhasil');

      // Old access code should now fail
      await expect(checkAccessCode(oldCode)).rejects.toThrow('Kode akses');

      // New access code in inbox should succeed
      const freshOverview = await getDemoOverview();
      const newCodeMsg = freshOverview.inbox.find((i) => i.subject.includes('Kode Akses Baru'));
      expect(newCodeMsg).toBeDefined();
      const newCode = newCodeMsg!.body.match(/DEMO-PASS-[A-Z0-9]+/)?.[0];
      expect(newCode).toBeDefined();

      const newAccess = await checkAccessCode(newCode!);
      expect(newAccess.session_token).toBeDefined();
    });
  });

  describe('DemoCenter API & Event Synchronization', () => {
    it('getDemoOverview returns overview of reports, inbox, and storage mode', async () => {
      const overview = await getDemoOverview();
      expect(overview.reports).toHaveLength(6);
      expect(overview.inbox.length).toBeGreaterThan(0);
      expect(overview.storageMode).toBe('indexeddb');
      expect(overview.storageWarning).toBeNull();
    });

    it('resetDemoDatabase dispatches window event and BroadcastChannel message', async () => {
      let windowEventReceived = false;
      const windowListener = () => {
        windowEventReceived = true;
      };
      window.addEventListener('demo-database-reset', windowListener);

      let channelMessageReceived = false;
      let broadcastChannel: BroadcastChannel | null = null;
      if (typeof BroadcastChannel !== 'undefined') {
        broadcastChannel = new BroadcastChannel('portal-guest-prototype-reset');
        broadcastChannel.onmessage = (event) => {
          if (event.data?.type === 'demo-database-reset') {
            channelMessageReceived = true;
          }
        };
      }

      await resetDemoDatabase();
      await new Promise((r) => setTimeout(r, 20));

      expect(windowEventReceived).toBe(true);
      if (broadcastChannel) {
        expect(channelMessageReceived).toBe(true);
        broadcastChannel.close();
      }

      window.removeEventListener('demo-database-reset', windowListener);
    });
  });
});
