import {
  PublicCategory,
  SubmitReportRequest,
  SubmitReportResponse,
  AccessResponse,
  ReporterReportDetail,
  ReportMessage,
  AttachmentMeta,
} from '@/types/report';
import {
  DemoReportRecord,
  DemoAttachmentRecord,
  DemoEventRecord,
  DemoInboxItem,
  DemoOverview,
} from './types';
import { getDemoStorage, IDemoStorage } from './storage';
import { SEED_CATEGORIES } from './report-seed';
import { generateAccessCode } from './verification';
import { ReportApiError } from '@/lib/api-client';

interface DemoSession {
  sessionToken: string;
  reportId: string;
  accessCode: string;
  csrfToken: string;
  expiresAt: string;
}

const activeSessions = new Map<string, DemoSession>();

export function clearActiveSessionDemo(): void {
  activeSessions.clear();
}

async function resolveSession(
  sessionToken?: string | null,
  storage?: IDemoStorage
): Promise<DemoSession> {
  if (!sessionToken || !sessionToken.trim()) {
    throw new ReportApiError(
      'UNAUTHORIZED',
      'Sesi Anda telah berakhir atau belum terautentikasi. Silakan masukkan kembali kode akses Anda.',
      401
    );
  }

  const token = sessionToken.trim();
  const session = activeSessions.get(token);
  if (!session) {
    throw new ReportApiError(
      'UNAUTHORIZED',
      'Sesi Anda tidak valid atau telah berakhir. Masukkan kembali kode akses Anda.',
      401
    );
  }

  if (Date.now() > Date.parse(session.expiresAt)) {
    activeSessions.delete(token);
    throw new ReportApiError(
      'UNAUTHORIZED',
      'Sesi Anda telah kedaluwarsa. Silakan masukkan kembali kode akses Anda.',
      401
    );
  }

  // Cross-tab rotation check: verify that the report's access code has not been rotated
  if (storage) {
    const report = await storage.getReportById(session.reportId);
    if (!report || report.access_code !== session.accessCode) {
      activeSessions.delete(token);
      throw new ReportApiError(
        'UNAUTHORIZED',
        'Sesi telah dibatalkan karena kode akses laporan telah dirotasi atau dipulihkan. Masukkan kembali kode akses baru Anda.',
        401
      );
    }
  }

  return session;
}

export async function fetchPublicCategoriesDemo(): Promise<PublicCategory[]> {
  return [...SEED_CATEGORIES];
}

export async function checkAccessCodeDemo(
  accessCode: string,
  _captchaToken?: string
): Promise<AccessResponse> {
  const trimmed = accessCode.trim();
  if (!trimmed) {
    throw new ReportApiError('INVALID_ACCESS_CODE', 'Masukkan kode akses rahasia Anda.', 400);
  }

  const storage = await getDemoStorage();
  const report = await storage.getReportByAccessCode(trimmed);

  if (!report) {
    throw new ReportApiError(
      'INVALID_ACCESS_CODE',
      'Kode akses rahasia tidak ditemukan atau salah. Periksa kembali kode akses Anda.',
      401
    );
  }

  const sessionToken = `ses-demo-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
  const csrfToken = `csrf-demo-${Math.random().toString(36).slice(2, 10)}`;
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // 2 hours

  const session: DemoSession = {
    sessionToken,
    reportId: report.id,
    accessCode: report.access_code,
    csrfToken,
    expiresAt,
  };

  activeSessions.set(sessionToken, session);

  return {
    session_token: sessionToken,
    report_id: report.id,
    expires_at: expiresAt,
    csrf_token: csrfToken,
  };
}

export async function getReporterReportDetailDemo(
  sessionToken?: string | null
): Promise<ReporterReportDetail> {
  const storage = await getDemoStorage();
  const session = await resolveSession(sessionToken, storage);
  const report = await storage.getReportById(session.reportId);

  if (!report) {
    throw new ReportApiError('NOT_FOUND', 'Data laporan tidak ditemukan.', 404);
  }

  const [messages, events, rawAttachments] = await Promise.all([
    storage.getMessagesByReportId(session.reportId),
    storage.getEventsByReportId(session.reportId),
    storage.getAttachmentsByReportId(session.reportId),
  ]);

  const attachments: AttachmentMeta[] = rawAttachments.map((att) => ({
    id: att.id,
    original_filename: att.original_filename,
    filename: att.filename,
    file_size_bytes: att.file_size_bytes,
    size_bytes: att.file_size_bytes,
    content_type: att.content_type,
    mime_type: att.content_type,
    created_at: att.created_at,
  }));

  return {
    report,
    messages: messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    events: events.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    attachments,
  };
}

export async function downloadReporterAttachmentDemo(
  attachmentId: string,
  sessionToken?: string | null,
  signal?: AbortSignal
): Promise<{ blob: Blob; filename?: string; contentType?: string }> {
  if (signal?.aborted) {
    throw new Error('Permintaan unduh dibatalkan');
  }

  const storage = await getDemoStorage();
  const session = await resolveSession(sessionToken, storage);
  const attachment = await storage.getAttachmentById(attachmentId);

  if (!attachment) {
    throw new ReportApiError('NOT_FOUND', 'Berkas lampiran tidak ditemukan.', 404);
  }

  // Exact session scoping guard
  if (attachment.report_id !== session.reportId) {
    throw new ReportApiError(
      'FORBIDDEN',
      'Anda tidak memiliki hak akses untuk mengunduh lampiran laporan ini.',
      403
    );
  }

  return {
    blob: attachment.blob,
    filename: attachment.original_filename || attachment.filename,
    contentType: attachment.content_type,
  };
}

export async function postReporterMessageDemo(
  message: string,
  _csrfToken?: string | null,
  sessionToken?: string | null,
  idempotencyKey?: string
): Promise<ReportMessage> {
  const trimmed = message.trim();
  if (!trimmed) {
    throw new ReportApiError('INVALID_MESSAGE', 'Pesan tidak boleh kosong.', 400);
  }
  if (trimmed.length > 5000) {
    throw new ReportApiError(
      'INVALID_MESSAGE',
      'Pesan laporan melebihi batas panjang maksimum 5000 karakter.',
      400
    );
  }

  if (!sessionToken || !sessionToken.trim() || !activeSessions.has(sessionToken.trim())) {
    throw new ReportApiError(
      'SESSION_REQUIRED',
      'Sesi mutasi belum terverifikasi. Masukkan kembali kode akses Anda.',
      403
    );
  }

  const storage = await getDemoStorage();
  const session = await resolveSession(sessionToken, storage);
  const report = await storage.getReportById(session.reportId);

  if (!report) {
    throw new ReportApiError('NOT_FOUND', 'Laporan tidak ditemukan.', 404);
  }

  if (report.status === 'SELESAI') {
    throw new ReportApiError(
      'REPORT_CLOSED',
      'Laporan ini telah selesai. Percakapan telah ditutup.',
      400
    );
  }

  // Message idempotency check
  if (idempotencyKey && idempotencyKey.trim()) {
    const existing = await storage.getIdempotency(idempotencyKey.trim());
    if (existing && existing.response) {
      const expectedPayloadHash = `${session.reportId}|${trimmed}`;
      if (existing.payloadHash && existing.payloadHash !== expectedPayloadHash) {
        throw new ReportApiError(
          'IDEMPOTENCY_CONFLICT',
          'Kunci idempotensi telah digunakan untuk pesan berbeda.',
          409
        );
      }
      return existing.response as ReportMessage;
    }
  }

  const nowIso = new Date().toISOString();
  const msgRecord: ReportMessage = {
    id: `msg-demo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    report_id: report.id,
    sender_type: 'PELAPOR',
    visibility: 'PUBLIC_TO_REPORTER',
    message: trimmed,
    created_at: nowIso,
  };

  let updatedReport: DemoReportRecord | undefined;
  let transitionEvent: DemoEventRecord | undefined;

  // If status is MENUNGGU_BALASAN_PELAPOR, student's reply transitions status back to DIPROSES
  if (report.status === 'MENUNGGU_BALASAN_PELAPOR') {
    updatedReport = {
      ...report,
      status: 'DIPROSES',
      updated_at: nowIso,
    };

    transitionEvent = {
      id: `ev-reply-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      report_id: report.id,
      actor_type: 'PELAPOR',
      event_type: 'STATUS_DIUBAH',
      old_status: 'MENUNGGU_BALASAN_PELAPOR',
      new_status: 'DIPROSES',
      reason: 'Pelapor mengirimkan tanggapan balasan',
      created_at: nowIso,
    };
  }

  // Atomic message commit with idempotency support
  await storage.saveMessageAtomic({
    message: msgRecord,
    updatedReport,
    event: transitionEvent,
    idempotency:
      idempotencyKey && idempotencyKey.trim()
        ? {
            key: idempotencyKey.trim(),
            payloadHash: `${session.reportId}|${trimmed}`,
            response: msgRecord,
            created_at: Date.now(),
          }
        : undefined,
  });

  return msgRecord;
}

export async function submitReportDemo(
  payload: SubmitReportRequest,
  idempotencyKey?: string,
  files?: File[]
): Promise<SubmitReportResponse> {
  const storage = await getDemoStorage();

  const email = (payload.email || '').trim().toLowerCase();
  const ticket = (payload.verification_ticket || '').trim();

  const ver = await storage.getVerification(email);
  if (!ver || !ver.verified || ver.ticket !== ticket) {
    throw new ReportApiError(
      'INVALID_TICKET',
      'Tiket verifikasi email tidak valid atau belum terverifikasi untuk alamat email ini.',
      400
    );
  }

  if (ver.ticket_expires_at && Date.now() > ver.ticket_expires_at) {
    throw new ReportApiError(
      'TICKET_EXPIRED',
      'Tiket verifikasi email telah kedaluwarsa. Silakan lakukan verifikasi ulang.',
      400
    );
  }

  const currentPayloadHash = `${email}|${payload.category_id}|${payload.title?.trim()}|${ticket}`;

  // Submission idempotency check before checking consumed status
  if (idempotencyKey && idempotencyKey.trim()) {
    const existing = await storage.getIdempotency(idempotencyKey.trim());
    if (existing && existing.response) {
      if (existing.payloadHash && existing.payloadHash !== currentPayloadHash) {
        throw new ReportApiError(
          'IDEMPOTENCY_CONFLICT',
          'Kunci idempotensi telah digunakan untuk permintaan submission yang berbeda.',
          409
        );
      }
      return existing.response as SubmitReportResponse;
    }
  }

  // A new non-idempotent submission cannot reuse an already consumed ticket
  if (ver.consumed) {
    throw new ReportApiError(
      'TICKET_CONSUMED',
      'Tiket verifikasi email telah digunakan untuk laporan lain. Silakan lakukan verifikasi ulang untuk mengajukan laporan baru.',
      400
    );
  }

  const title = (payload.title || '').trim();
  if (title.length < 5 || title.length > 200) {
    throw new ReportApiError(
      'INVALID_TITLE',
      'Judul laporan harus diisi antara 5 hingga 200 karakter.',
      400
    );
  }

  const description = (payload.description || '').trim();
  if (description.length < 10 || description.length > 5000) {
    throw new ReportApiError(
      'INVALID_DESCRIPTION',
      'Deskripsi laporan harus diisi antara 10 hingga 5000 karakter.',
      400
    );
  }

  if (!payload.category_id) {
    throw new ReportApiError('INVALID_CATEGORY', 'Kategori laporan wajib dipilih.', 400);
  }

  const category = SEED_CATEGORIES.find((c) => c.id === payload.category_id);
  if (!category) {
    throw new ReportApiError(
      'INVALID_CATEGORY',
      'Kategori laporan tidak valid atau tidak terdaftar.',
      400
    );
  }

  const validImpacts = ['Rendah', 'Sedang', 'Tinggi'];
  const impact = payload.reporter_impact || 'Sedang';
  if (!validImpacts.includes(impact)) {
    throw new ReportApiError(
      'INVALID_IMPACT',
      'Tingkat dampak laporan harus Rendah, Sedang, atau Tinggi.',
      400
    );
  }

  // Attachment validation
  const validFiles = Array.isArray(files) ? files : [];
  if (validFiles.length > 3) {
    throw new ReportApiError(
      'ATTACHMENT_LIMIT_EXCEEDED',
      'Jumlah berkas lampiran melebihi batas maksimum 3 berkas.',
      400
    );
  }

  const ALLOWED_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'application/pdf',
    'text/plain',
  ]);

  for (const f of validFiles) {
    if (f.size > 10 * 1024 * 1024) {
      throw new ReportApiError(
        'ATTACHMENT_TOO_LARGE',
        `Ukuran berkas "${f.name}" melebihi batas 10 MB.`,
        400
      );
    }
    if (f.type && !ALLOWED_MIME_TYPES.has(f.type)) {
      throw new ReportApiError(
        'INVALID_ATTACHMENT_TYPE',
        `Format berkas "${f.name}" (${f.type}) tidak didukung. Harap unggah berkas PDF, JPG, PNG, atau TXT.`,
        400
      );
    }
  }

  const allReports = await storage.getAllReports();
  const nextNum = (allReports.length + 1).toString().padStart(4, '0');
  const referenceNumber = `DEMO-2025-${nextNum}`;
  const accessCode = generateAccessCode();
  const reportId = `rep-demo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const nowIso = new Date().toISOString();

  const newReport: DemoReportRecord = {
    id: reportId,
    reference_number: referenceNumber,
    access_code: accessCode,
    reporter_email: email,
    category_id: payload.category_id,
    category_name: category.name,
    title,
    description,
    reporter_impact: impact,
    priority: null,
    status: 'BARU',
    first_responded_at: null,
    resolved_at: null,
    resolution_reason: null,
    resolution_next_steps: null,
    reopened_at: null,
    reopen_reason: null,
    created_at: nowIso,
    updated_at: nowIso,
  };

  const attachmentsToSave: DemoAttachmentRecord[] = validFiles.map((f) => ({
    id: `att-demo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    report_id: reportId,
    original_filename: f.name,
    filename: f.name,
    file_size_bytes: f.size,
    content_type: f.type || 'application/octet-stream',
    blob: f,
    created_at: nowIso,
  }));

  const eventToSave: DemoEventRecord = {
    id: `ev-create-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    report_id: reportId,
    actor_type: 'SYSTEM',
    event_type: 'LAPORAN_DIBUAT',
    new_status: 'BARU',
    created_at: nowIso,
  };

  const inboxItemToSave: DemoInboxItem = {
    id: `inbox-submit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    email,
    subject: `[Simulasi Demo] Laporan Diterima: ${referenceNumber}`,
    body: `Laporan Anda "${title}" telah berhasil diajukan dan disimpan di database lokal demo. Nomor Referensi: ${referenceNumber}. Kode Akses Rahasia: ${accessCode}. Gunakan kode ini untuk memantau perkembangan tindak lanjut dan berkomunikasi dengan tim.`,
    created_at: nowIso,
  };

  const response: SubmitReportResponse = {
    report_id: reportId,
    reference_number: referenceNumber,
    access_code: accessCode,
    created_at: nowIso,
  };

  const idempotencyToSave =
    idempotencyKey && idempotencyKey.trim()
      ? {
          key: idempotencyKey.trim(),
          payloadHash: currentPayloadHash,
          response,
          created_at: Date.now(),
        }
      : undefined;

  // Atomic transactional commit of submission + consumed verification ticket
  await storage.saveReportSubmissionAtomic({
    report: newReport,
    attachments: attachmentsToSave,
    event: eventToSave,
    inboxItem: inboxItemToSave,
    idempotency: idempotencyToSave,
    verificationToUpdate: {
      ...ver,
      consumed: true,
    },
  });

  return response;
}

export async function getDemoOverview(): Promise<DemoOverview> {
  const storage = await getDemoStorage();
  const [reports, inbox] = await Promise.all([
    storage.getAllReports(),
    storage.getInboxItems(),
  ]);
  const storageState = storage.getStorageState();

  return {
    reports: reports.map((r) => ({
      title: r.title,
      reference_number: r.reference_number,
      email: r.reporter_email,
      access_code: r.access_code,
      status: r.status,
    })),
    inbox: inbox.map((i) => ({
      id: i.id,
      email: i.email,
      subject: i.subject,
      body: i.body,
      created_at: i.created_at,
    })),
    storageMode: storageState.mode,
    storageWarning: storageState.warning,
  };
}

export async function resetDemoDatabase(): Promise<void> {
  clearActiveSessionDemo();
  const storage = await getDemoStorage();
  await storage.reset();

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('demo-database-reset'));
  }

  if (typeof BroadcastChannel !== 'undefined') {
    try {
      const channel = new BroadcastChannel('portal-guest-prototype-reset');
      channel.postMessage({ type: 'demo-database-reset' });
      setTimeout(() => {
        try {
          channel.close();
        } catch {
          // Ignore
        }
      }, 50);
    } catch {
      // Ignore broadcast errors
    }
  }
}
