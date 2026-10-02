import {
  ConfirmVerificationRequest,
  ConfirmVerificationResponse,
  RequestVerificationResponse,
  RecoveryResponse,
} from '@/types/report';
import { getDemoStorage } from './storage';
import { ReportApiError } from '@/lib/api-client';

const VERIFICATION_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes
const RECOVERY_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateTicket(): string {
  return `vt-demo-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function generateAccessCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `DEMO-PASS-${randomPart}`;
}

export async function requestEmailVerificationDemo(
  email: string,
  _captchaToken?: string
): Promise<RequestVerificationResponse> {
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
    throw new ReportApiError(
      'INVALID_EMAIL',
      'Alamat email pelapor tidak valid atau belum diisi.',
      400
    );
  }

  const code = generateOtp();
  const expiresAt = Date.now() + VERIFICATION_EXPIRY_MS;
  const storage = await getDemoStorage();

  await storage.saveVerification({
    id: trimmedEmail,
    code,
    expires_at: expiresAt,
    verified: false,
  });

  const nowIso = new Date().toISOString();
  await storage.addInboxItem({
    id: `inbox-otp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    email: trimmedEmail,
    subject: `[Simulasi Demo] Kode Verifikasi Email Laporan: ${code}`,
    body: `Halo, ini adalah simulasi demo prototype. Kode verifikasi email Anda adalah: ${code}. Masukkan kode ini pada formulir pembuatan laporan dalam 15 menit.`,
    created_at: nowIso,
  });

  return {
    message: 'Token verifikasi telah dikirimkan ke kotak masuk simulasi demo.',
  };
}

export async function confirmEmailVerificationDemo(
  payload: ConfirmVerificationRequest
): Promise<ConfirmVerificationResponse> {
  const email = payload.email.trim().toLowerCase();
  const code = payload.code.trim();

  if (!email || !isValidEmail(email)) {
    throw new ReportApiError('INVALID_EMAIL', 'Alamat email tidak valid.', 400);
  }
  if (!code) {
    throw new ReportApiError('INVALID_CODE', 'Kode verifikasi belum diisi.', 400);
  }

  const storage = await getDemoStorage();
  const record = await storage.getVerification(email);

  if (!record) {
    throw new ReportApiError(
      'INVALID_CODE',
      'Kode verifikasi salah atau belum pernah diminta.',
      400
    );
  }

  if (Date.now() > record.expires_at) {
    throw new ReportApiError(
      'CODE_EXPIRED',
      'Kode verifikasi telah kedaluwarsa. Silakan minta kode baru.',
      400
    );
  }

  if (record.code !== code) {
    throw new ReportApiError(
      'INVALID_CODE',
      'Kode verifikasi tidak sesuai.',
      400
    );
  }

  const ticket = generateTicket();
  const ticketExpiresAt = Date.now() + VERIFICATION_EXPIRY_MS;
  await storage.saveVerification({
    ...record,
    verified: true,
    ticket,
    ticket_expires_at: ticketExpiresAt,
    consumed: false,
  });

  return {
    verified_email: email,
    verification_ticket: ticket,
  };
}

export async function requestCodeRecoveryDemo(
  email: string,
  referenceNumber: string,
  _captchaToken?: string
): Promise<{ message: string }> {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedRef = referenceNumber.trim().toUpperCase();

  if (!trimmedEmail || !trimmedRef) {
    throw new ReportApiError(
      'INVALID_REQUEST',
      'Email dan nomor referensi laporan wajib diisi.',
      400
    );
  }

  const storage = await getDemoStorage();
  const report = await storage.getReportByReference(trimmedRef);

  // If report exists and email matches, send OTP to demo inbox
  if (report && report.reporter_email.toLowerCase() === trimmedEmail) {
    const code = generateOtp();
    const expiresAt = Date.now() + RECOVERY_EXPIRY_MS;
    const key = `${trimmedEmail}:${trimmedRef}`;

    await storage.saveRecovery({
      id: key,
      email: trimmedEmail,
      reference_number: trimmedRef,
      code,
      expires_at: expiresAt,
    });

    const nowIso = new Date().toISOString();
    await storage.addInboxItem({
      id: `inbox-rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      email: trimmedEmail,
      subject: `[Simulasi Demo] Kode Pemulihan Akses: ${code}`,
      body: `Permintaan pemulihan kode akses untuk nomor referensi ${trimmedRef} telah diterima di sistem demo lokal. Kode konfirmasi pemulihan Anda adalah: ${code}. Masukkan kode ini pada tab Konfirmasi Pemulihan.`,
      created_at: nowIso,
    });
  }

  return {
    message:
      'Instruksi pemulihan kode akses telah dikirimkan ke kotak masuk simulasi demo jika data cocok.',
  };
}

export async function confirmCodeRecoveryDemo(payload: {
  email: string;
  reference_number: string;
  code: string;
}): Promise<RecoveryResponse> {
  const trimmedEmail = payload.email.trim().toLowerCase();
  const trimmedRef = payload.reference_number.trim().toUpperCase();
  const trimmedCode = payload.code.trim();

  if (!trimmedEmail || !trimmedRef || !trimmedCode) {
    throw new ReportApiError(
      'INVALID_REQUEST',
      'Email, nomor referensi, dan kode verifikasi pemulihan wajib diisi.',
      400
    );
  }

  const storage = await getDemoStorage();
  const key = `${trimmedEmail}:${trimmedRef}`;
  const recovery = await storage.getRecovery(key);

  if (!recovery) {
    throw new ReportApiError(
      'INVALID_CODE',
      'Kode pemulihan salah atau permintaan pemulihan tidak ditemukan.',
      400
    );
  }

  if (Date.now() > recovery.expires_at) {
    throw new ReportApiError(
      'CODE_EXPIRED',
      'Kode pemulihan telah kedaluwarsa. Silakan lakukan permintaan ulang.',
      400
    );
  }

  if (recovery.code !== trimmedCode) {
    throw new ReportApiError(
      'INVALID_CODE',
      'Kode pemulihan tidak sesuai.',
      400
    );
  }

  const report = await storage.getReportByReference(trimmedRef);
  if (!report) {
    throw new ReportApiError(
      'REPORT_NOT_FOUND',
      'Laporan dengan nomor referensi tersebut tidak ditemukan.',
      404
    );
  }

  // Rotate access code: invalidate old access code and issue a new one
  const newAccessCode = generateAccessCode();
  const updatedReport = {
    ...report,
    access_code: newAccessCode,
    updated_at: new Date().toISOString(),
  };

  await storage.saveReport(updatedReport);
  await storage.deleteRecovery(key);

  // Log event in report timeline
  await storage.addEvent({
    id: `ev-rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    report_id: report.id,
    actor_type: 'PELAPOR',
    event_type: 'KODE_AKSES_DIPULIHKAN',
    created_at: new Date().toISOString(),
  });

  // Post confirmation to demo inbox with the new access code
  await storage.addInboxItem({
    id: `inbox-newcode-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    email: trimmedEmail,
    subject: `[Simulasi Demo] Kode Akses Baru Laporan ${trimmedRef}`,
    body: `Kode akses laporan Anda berhasil dipulihkan dan dirotasi. Kode akses baru Anda adalah: ${newAccessCode}. Kode akses lama tidak berlaku lagi. Simpan kode baru ini untuk mengakses kembali laporan Anda.`,
    created_at: new Date().toISOString(),
  });

  return {
    message: 'Kode akses baru berhasil dibuat. Silakan periksa kotak masuk demo.',
  };
}
