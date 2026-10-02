import {
  PublicCategory,
  RequestVerificationResponse,
  ConfirmVerificationRequest,
  ConfirmVerificationResponse,
  SubmitReportRequest,
  SubmitReportResponse,
  AccessResponse,
  ReporterReportDetail,
  ReportMessage,
  RecoveryResponse,
  APIErrorMeta,
} from '@/types/report';
import {
  fetchPublicCategoriesDemo,
  submitReportDemo,
  checkAccessCodeDemo,
  getReporterReportDetailDemo,
  downloadReporterAttachmentDemo,
  postReporterMessageDemo,
  getDemoOverview,
  resetDemoDatabase,
} from './demo/reports';
import {
  requestEmailVerificationDemo,
  confirmEmailVerificationDemo,
  requestCodeRecoveryDemo,
  confirmCodeRecoveryDemo,
} from './demo/verification';

export class ReportApiError extends Error {
  code: string;
  details?: Array<{ field: string; message: string }>;
  meta?: APIErrorMeta;
  statusCode: number;

  constructor(
    code: string,
    message: string,
    statusCode: number,
    details?: Array<{ field: string; message: string }>,
    meta?: APIErrorMeta
  ) {
    super(message);
    this.name = 'ReportApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.meta = meta;
  }
}

// 1. Categories
export async function fetchPublicCategories(): Promise<PublicCategory[]> {
  return fetchPublicCategoriesDemo();
}

// 2. Email verification (Phase 1: Request token)
export async function requestEmailVerification(
  email: string,
  captchaToken?: string
): Promise<RequestVerificationResponse> {
  return requestEmailVerificationDemo(email, captchaToken);
}

// 3. Email verification (Phase 2: Confirm OTP code, get verification ticket)
export async function confirmEmailVerification(
  payload: ConfirmVerificationRequest
): Promise<ConfirmVerificationResponse> {
  return confirmEmailVerificationDemo(payload);
}

// 4. Submit report (Phase 3: Final submit with verification ticket and idempotency key)
export async function submitReport(
  payload: SubmitReportRequest,
  idempotencyKey?: string,
  files?: File[]
): Promise<SubmitReportResponse> {
  return submitReportDemo(payload, idempotencyKey, files);
}

// 5. Check access code (Creates session, returns session_token and csrf_token)
export async function checkAccessCode(
  accessCode: string,
  captchaToken?: string
): Promise<AccessResponse> {
  return checkAccessCodeDemo(accessCode, captchaToken);
}

// 6. Get reporter's report detail
// Returns honest 401 prompt when sessionToken is missing or expired, rather than pretending ambient cookie persists auth.
export async function getReporterReportDetail(
  sessionToken?: string | null
): Promise<ReporterReportDetail> {
  return getReporterReportDetailDemo(sessionToken);
}

// 6b. Download reporter attachment
// Requests private attachment file using in-memory session. Returns a Blob with filename and contentType.
export async function downloadReporterAttachment(
  attachmentId: string,
  sessionToken?: string | null,
  signal?: AbortSignal
): Promise<{ blob: Blob; filename?: string; contentType?: string }> {
  return downloadReporterAttachmentDemo(attachmentId, sessionToken, signal);
}

// 7. Post reporter message
export async function postReporterMessage(
  message: string,
  csrfToken?: string | null,
  sessionToken?: string | null,
  idempotencyKey?: string
): Promise<ReportMessage> {
  return postReporterMessageDemo(message, csrfToken, sessionToken, idempotencyKey);
}

// 8. Request access code recovery
export async function requestCodeRecovery(
  email: string,
  referenceNumber: string,
  captchaToken?: string
): Promise<{ message: string }> {
  return requestCodeRecoveryDemo(email, referenceNumber, captchaToken);
}

// 9. Confirm access code recovery
export async function confirmCodeRecovery(payload: {
  email: string;
  reference_number: string;
  code: string;
}): Promise<RecoveryResponse> {
  return confirmCodeRecoveryDemo(payload);
}

// Re-export DemoCenter control contract
export { getDemoOverview, resetDemoDatabase };
