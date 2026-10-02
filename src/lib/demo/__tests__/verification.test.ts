import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  requestEmailVerificationDemo,
  confirmEmailVerificationDemo,
  requestCodeRecoveryDemo,
  confirmCodeRecoveryDemo,
} from '@/lib/demo/verification';
import { getDemoStorage, resetDemoDatabase, closeDemoDatabase } from '@/lib/demo/storage';
import { SEED_REPORTS } from '@/lib/demo/report-seed';
import { ReportApiError } from '@/lib/api-client';

describe('Demo Verification & Recovery (OTP, Tickets, Inbox)', () => {
  beforeEach(async () => {
    await resetDemoDatabase();
  });

  afterEach(async () => {
    await closeDemoDatabase();
  });

  describe('requestEmailVerificationDemo', () => {
    it('validates email format and rejects invalid or empty email', async () => {
      await expect(requestEmailVerificationDemo('')).rejects.toThrow(ReportApiError);
      await expect(requestEmailVerificationDemo('bukan-email')).rejects.toThrow(ReportApiError);
    });

    it('generates a 6-digit OTP, stores it with expiry, and deposits notification in demo inbox', async () => {
      const email = 'mahasiswa.baru@example.com';
      const res = await requestEmailVerificationDemo(email);

      expect(res.message).toContain('verifikasi');

      const storage = await getDemoStorage();
      const verification = await storage.getVerification(email);
      expect(verification).toBeDefined();
      expect(verification?.code).toMatch(/^\d{6}$/);
      expect(verification?.expires_at).toBeGreaterThan(Date.now());

      const inbox = await storage.getInboxItems();
      const notification = inbox.find((item) => item.email === email);
      expect(notification).toBeDefined();
      expect(notification?.subject).toContain(verification?.code);
      expect(notification?.body).toContain(verification?.code);
    });
  });

  describe('confirmEmailVerificationDemo', () => {
    it('rejects confirmation if no request exists', async () => {
      await expect(
        confirmEmailVerificationDemo({ email: 'unknown@example.com', code: '123456' })
      ).rejects.toThrow('Kode verifikasi');
    });

    it('rejects wrong OTP code', async () => {
      const email = 'mahasiswa@example.com';
      await requestEmailVerificationDemo(email);

      await expect(
        confirmEmailVerificationDemo({ email, code: '000000' })
      ).rejects.toThrow('Kode verifikasi');
    });

    it('rejects expired OTP code', async () => {
      const email = 'expired@example.com';
      await requestEmailVerificationDemo(email);

      const storage = await getDemoStorage();
      const rec = await storage.getVerification(email);
      if (rec) {
        // Expire it in storage
        await storage.saveVerification({ ...rec, expires_at: Date.now() - 1000 });
      }

      await expect(
        confirmEmailVerificationDemo({ email, code: rec!.code })
      ).rejects.toThrow('kedaluwarsa');
    });

    it('confirms valid OTP and issues a verification ticket', async () => {
      const email = 'valid@example.com';
      await requestEmailVerificationDemo(email);

      const storage = await getDemoStorage();
      const rec = await storage.getVerification(email);
      expect(rec).toBeDefined();

      const result = await confirmEmailVerificationDemo({
        email: `  ${email}  `,
        code: `  ${rec!.code}  `,
      });

      expect(result.verified_email).toBe(email);
      expect(result.verification_ticket).toMatch(/^vt-demo-/);

      // Storage record should now be marked verified with the ticket
      const updated = await storage.getVerification(email);
      expect(updated?.verified).toBe(true);
      expect(updated?.ticket).toBe(result.verification_ticket);
    });
  });

  describe('requestCodeRecoveryDemo', () => {
    it('generates recovery OTP and deposits notification in demo inbox when reference and email match', async () => {
      const seed = SEED_REPORTS[0];
      const res = await requestCodeRecoveryDemo(seed.reporter_email, seed.reference_number);

      expect(res.message).toBeDefined();

      const storage = await getDemoStorage();
      const key = `${seed.reporter_email.toLowerCase()}:${seed.reference_number.toUpperCase()}`;
      const recovery = await storage.getRecovery(key);

      expect(recovery).toBeDefined();
      expect(recovery?.code).toMatch(/^\d{6}$/);

      const inbox = await storage.getInboxItems();
      const recoveryMsg = inbox.find(
        (item) => item.email === seed.reporter_email && item.subject.includes('Pemulihan')
      );
      expect(recoveryMsg).toBeDefined();
      expect(recoveryMsg?.body).toContain(recovery?.code);
    });

    it('returns generic message without error even if report does not exist (truthful security pattern)', async () => {
      const res = await requestCodeRecoveryDemo('nonexistent@example.com', 'DEMO-9999-0000');
      expect(res.message).toBeDefined();
    });
  });

  describe('confirmCodeRecoveryDemo', () => {
    it('rejects confirmation with wrong code', async () => {
      const seed = SEED_REPORTS[0];
      await requestCodeRecoveryDemo(seed.reporter_email, seed.reference_number);

      await expect(
        confirmCodeRecoveryDemo({
          email: seed.reporter_email,
          reference_number: seed.reference_number,
          code: '999999',
        })
      ).rejects.toThrow('Kode pemulihan');
    });

    it('rejects expired recovery code', async () => {
      const seed = SEED_REPORTS[0];
      await requestCodeRecoveryDemo(seed.reporter_email, seed.reference_number);

      const storage = await getDemoStorage();
      const key = `${seed.reporter_email.toLowerCase()}:${seed.reference_number.toUpperCase()}`;
      const rec = await storage.getRecovery(key);
      if (rec) {
        await storage.saveRecovery({ ...rec, expires_at: Date.now() - 1000 });
      }

      await expect(
        confirmCodeRecoveryDemo({
          email: seed.reporter_email,
          reference_number: seed.reference_number,
          code: rec!.code,
        })
      ).rejects.toThrow('kedaluwarsa');
    });

    it('rotates report access code, invalidates old code, and notifies via demo inbox', async () => {
      const seed = SEED_REPORTS[0];
      const oldAccessCode = seed.access_code;

      await requestCodeRecoveryDemo(seed.reporter_email, seed.reference_number);

      const storage = await getDemoStorage();
      const key = `${seed.reporter_email.toLowerCase()}:${seed.reference_number.toUpperCase()}`;
      const rec = await storage.getRecovery(key);
      expect(rec).toBeDefined();

      const result = await confirmCodeRecoveryDemo({
        email: seed.reporter_email,
        reference_number: seed.reference_number,
        code: rec!.code,
      });

      expect(result.message).toContain('berhasil');

      // Check that old access code is invalid now
      const reportWithOldCode = await storage.getReportByAccessCode(oldAccessCode);
      expect(reportWithOldCode).toBeUndefined();

      // Check report has new access code
      const updatedReport = await storage.getReportById(seed.id);
      expect(updatedReport?.access_code).not.toBe(oldAccessCode);
      expect(updatedReport?.access_code).toMatch(/^DEMO-PASS-/);

      // Check inbox has new access code notification
      const inbox = await storage.getInboxItems();
      const newCodeMsg = inbox.find(
        (item) => item.email === seed.reporter_email && item.subject.includes('Kode Akses Baru')
      );
      expect(newCodeMsg).toBeDefined();
      expect(newCodeMsg?.body).toContain(updatedReport?.access_code);

      // Check recovery record is cleaned up
      const cleanedRecovery = await storage.getRecovery(key);
      expect(cleanedRecovery).toBeUndefined();
    });
  });
});
