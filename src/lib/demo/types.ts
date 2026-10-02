import {
  Report,
  ReportMessage,
  ReportEvent,
  ReportStatus,
} from '@/types/report';

export interface DemoReportRecord extends Report {
  access_code: string;
}

export type DemoMessageRecord = ReportMessage;

export type DemoEventRecord = ReportEvent;

export interface DemoAttachmentRecord {
  id: string;
  report_id: string;
  original_filename: string;
  filename: string;
  file_size_bytes: number;
  content_type: string;
  blob: Blob;
  created_at: string;
}

export interface DemoInboxItem {
  id: string;
  email: string;
  subject: string;
  body: string;
  created_at: string;
}

export interface DemoVerificationRecord {
  id: string; // email (lowercase)
  code: string;
  ticket?: string;
  ticket_expires_at?: number;
  consumed?: boolean;
  expires_at: number;
  verified: boolean;
}

export interface DemoRecoveryRecord {
  id: string; // `${email.toLowerCase()}:${reference_number.toUpperCase()}`
  email: string;
  reference_number: string;
  code: string;
  expires_at: number;
}

export interface DemoIdempotencyRecord {
  key: string;
  payloadHash?: string;
  response: unknown;
  created_at: number;
}

export interface DemoOverview {
  reports: Array<{
    title: string;
    reference_number: string;
    email: string;
    access_code: string;
    status: ReportStatus;
  }>;
  inbox: Array<{
    id: string;
    email: string;
    subject: string;
    body: string;
    created_at: string;
  }>;
  storageMode: string;
  storageWarning: string | null;
}

export interface DemoStorageState {
  mode: 'indexeddb' | 'memory';
  warning: string | null;
}
