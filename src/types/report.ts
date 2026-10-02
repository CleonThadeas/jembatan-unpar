// Core domain models and transfer objects for reporting in portal-guest

export type ReportStatus =
  | 'BARU'
  | 'DITINJAU'
  | 'DIPROSES'
  | 'MENUNGGU_BALASAN_PELAPOR'
  | 'SELESAI';

export type ReportPriority = 'P1' | 'P2' | 'P3' | 'P4' | 'P5';

export type SenderType = 'PELAPOR' | 'ADMIN';

export type MessageVisibility = 'PUBLIC_TO_REPORTER' | 'INTERNAL_ADMIN_NOTE';

export interface PublicCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ReportMessage {
  id: string;
  report_id: string;
  sender_type: SenderType;
  admin_name?: string;
  visibility: MessageVisibility;
  message: string;
  created_at: string;
}

export interface ReportEvent {
  id: string;
  report_id: string;
  actor_type: string;
  event_type: string;
  old_status?: ReportStatus;
  new_status?: ReportStatus;
  old_priority?: ReportPriority;
  new_priority?: ReportPriority;
  reason?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface Report {
  id: string;
  reference_number: string;
  reporter_email: string;
  category_id: string;
  category_name?: string;
  title: string;
  description: string;
  reporter_impact: string;
  priority?: ReportPriority | null;
  status: ReportStatus;
  first_responded_at?: string | null;
  resolved_at?: string | null;
  resolution_reason?: string | null;
  resolution_next_steps?: string | null;
  reopened_at?: string | null;
  reopen_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AttachmentMeta {
  id: string;
  filename: string;
  original_filename: string;
  file_size_bytes: number;
  size_bytes: number;
  content_type: string;
  mime_type: string;
  created_at: string;
}

export interface ReporterReportDetail {
  report: Report;
  messages: ReportMessage[];
  events: ReportEvent[];
  attachments?: AttachmentMeta[];
}

export interface APIErrorDetail {
  field: string;
  message: string;
}

export interface APIErrorMeta {
  remaining_attempts?: number;
  retry_after_seconds?: number;
  [key: string]: unknown;
}

export interface APIError {
  code: string;
  message: string;
  details?: APIErrorDetail[];
  meta?: APIErrorMeta;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: APIError;
}

// Request and Response DTOs
export interface RequestVerificationResponse {
  message: string;
}

export interface ConfirmVerificationRequest {
  email: string;
  code: string;
}

export interface ConfirmVerificationResponse {
  verified_email: string;
  verification_ticket: string;
}

export interface SubmitReportRequest {
  email: string;
  category_id: string;
  title: string;
  description: string;
  reporter_impact: string;
  verification_ticket: string;
  captcha_token?: string;
}

export interface SubmitReportResponse {
  report_id: string;
  reference_number: string;
  access_code: string;
  created_at: string;
}

export interface AccessResponse {
  session_token: string;
  report_id: string;
  expires_at: string;
  csrf_token?: string;
}

export interface RecoveryResponse {
  message: string;
}

// In-memory draft for student report wizard
export interface ReportDraft {
  title: string;
  category_id: string;
  category_name?: string;
  reporter_impact: string;
  description: string;
  email: string;
}

export const MIN_ATTACHMENT_SIZE_BYTES = 1;
export const MAX_ATTACHMENT_COUNT = 3;
export const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB (10,485,760 bytes)
export const ALLOWED_ATTACHMENT_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
] as const;
export const ALLOWED_ATTACHMENT_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'] as const;

