'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { AccessResponse, ReportDraft } from '@/types/report';
import { checkAccessCode } from '@/lib/api-client';

const INITIAL_DRAFT: ReportDraft = {
  title: '',
  category_id: '',
  category_name: '',
  reporter_impact: 'Sedang',
  description: '',
  email: '',
};

export class SupersededError extends Error {
  constructor(message = 'Permintaan autentikasi telah digantikan oleh permintaan yang lebih baru') {
    super(message);
    this.name = 'SupersededError';
  }
}

interface ReporterSessionContextType {
  // In-memory authentication state (wiped on page reload)
  reportId: string | null;
  sessionToken: string | null;
  csrfToken: string | null;
  expiresAt: string | null;
  hasMutationCapability: boolean;

  // In-memory wizard draft & verification ticket
  draft: ReportDraft;
  verifiedEmail: string | null;
  verificationTicket: string | null;
  attachments: File[];

  // Actions
  setSession: (session: AccessResponse) => void;
  clearLocalSession: () => void;
  updateDraft: (partial: Partial<ReportDraft>) => void;
  resetDraft: () => void;
  setVerification: (ticket: string, email: string) => void;
  clearVerification: () => void;
  setAttachments: (files: File[]) => void;
  addAttachments: (files: File[]) => void;
  removeAttachment: (index: number) => void;
  clearAttachments: () => void;
  reauthenticateWithCode: (accessCode: string, expectedReportId?: string) => Promise<AccessResponse>;
}

const ReporterSessionContext = createContext<ReporterSessionContextType | null>(null);

interface ReporterSessionProviderProps {
  children: React.ReactNode;
  initialDraft?: Partial<ReportDraft>;
  initialAttachments?: File[];
  initialVerifiedEmail?: string | null;
  initialVerificationTicket?: string | null;
}

export function ReporterSessionProvider({
  children,
  initialDraft,
  initialAttachments,
  initialVerifiedEmail,
  initialVerificationTicket,
}: ReporterSessionProviderProps) {
  // In-memory secrets: Never written to localStorage or sessionStorage
  const [reportId, setReportId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  // In-memory wizard state: preserved as student navigates through email verification
  const [draft, setDraft] = useState<ReportDraft>(() => ({
    ...INITIAL_DRAFT,
    ...initialDraft,
  }));
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(() => initialVerifiedEmail ?? null);
  const [verificationTicket, setVerificationTicket] = useState<string | null>(
    () => initialVerificationTicket ?? null
  );
  const [attachments, setAttachmentsState] = useState<File[]>(() => initialAttachments ?? []);

  const setAttachments = useCallback((files: File[]) => {
    setAttachmentsState(files);
  }, []);

  const addAttachments = useCallback((newFiles: File[]) => {
    setAttachmentsState((prev) => [...prev, ...newFiles]);
  }, []);

  const removeAttachment = useCallback((index: number) => {
    setAttachmentsState((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearAttachments = useCallback(() => {
    setAttachmentsState([]);
  }, []);

  const setSession = useCallback((resp: AccessResponse) => {
    setReportId(resp.report_id);
    setSessionToken(resp.session_token);
    setCsrfToken(resp.csrf_token || null);
    setExpiresAt(resp.expires_at);
  }, []);

  // Honest local logout: clears memory, clarifies that server-side cookie persists until expiration
  const clearLocalSession = useCallback(() => {
    setReportId(null);
    setSessionToken(null);
    setCsrfToken(null);
    setExpiresAt(null);
  }, []);

  const updateDraft = useCallback((partial: Partial<ReportDraft>) => {
    if (
      partial.email !== undefined &&
      partial.email.trim().toLowerCase() !== draft.email.trim().toLowerCase()
    ) {
      setVerificationTicket(null);
      setVerifiedEmail(null);
    }
    setDraft((prev) => ({ ...prev, ...partial }));
  }, [draft.email]);

  const resetDraft = useCallback(() => {
    setDraft(INITIAL_DRAFT);
    setVerifiedEmail(null);
    setVerificationTicket(null);
    setAttachmentsState([]);
  }, []);

  const setVerification = useCallback((ticket: string, email: string) => {
    setVerificationTicket(ticket);
    setVerifiedEmail(email);
  }, []);

  const clearVerification = useCallback(() => {
    setVerificationTicket(null);
    setVerifiedEmail(null);
  }, []);

  const reauthSeqRef = React.useRef(0);

  // When user reloads the page, in-memory CSRF & session tokens are lost.
  // This method verifies their secret access code to restore in-memory mutation credentials.
  // Uses a sequence ref to guard against concurrent out-of-order responses. Superseded calls reject
  // with SupersededError and skip setSession.
  const reauthenticateWithCode = useCallback(
    async (accessCode: string, expectedReportId?: string) => {
      const seq = ++reauthSeqRef.current;
      const resp = await checkAccessCode(accessCode);
      if (seq !== reauthSeqRef.current) {
        throw new SupersededError();
      }
      if (!resp || typeof resp.report_id !== 'string') {
        throw new Error('Format respons sesi tidak valid dari server');
      }
      if (expectedReportId && resp.report_id !== expectedReportId) {
        // Cross-report mismatch: do NOT activate B's in-memory tokens into this session
        return resp;
      }
      setSession(resp);
      return resp;
    },
    [setSession]
  );

  useEffect(() => {
    const handleReset = () => {
      reauthSeqRef.current += 1;
      clearLocalSession();
      resetDraft();
    };
    window.addEventListener('demo-database-reset', handleReset);
    const channel = typeof BroadcastChannel === 'function'
      ? new BroadcastChannel('portal-guest-prototype-reset') : null;
    if (channel) channel.onmessage = handleReset;
    return () => {
      window.removeEventListener('demo-database-reset', handleReset);
      channel?.close();
    };
  }, [clearLocalSession, resetDraft]);

  const hasMutationCapability = useMemo(() => {
    return Boolean(sessionToken && sessionToken.trim() && reportId && reportId.trim());
  }, [sessionToken, reportId]);

  const value = useMemo(
    () => ({
      reportId,
      sessionToken,
      csrfToken,
      expiresAt,
      hasMutationCapability,
      draft,
      verifiedEmail,
      verificationTicket,
      attachments,
      setSession,
      clearLocalSession,
      updateDraft,
      resetDraft,
      setVerification,
      clearVerification,
      setAttachments,
      addAttachments,
      removeAttachment,
      clearAttachments,
      reauthenticateWithCode,
    }),
    [
      reportId,
      sessionToken,
      csrfToken,
      expiresAt,
      hasMutationCapability,
      draft,
      verifiedEmail,
      verificationTicket,
      attachments,
      setSession,
      clearLocalSession,
      updateDraft,
      resetDraft,
      setVerification,
      clearVerification,
      setAttachments,
      addAttachments,
      removeAttachment,
      clearAttachments,
      reauthenticateWithCode,
    ]
  );

  return <ReporterSessionContext.Provider value={value}>{children}</ReporterSessionContext.Provider>;
}

export function useReporterSession() {
  const context = useContext(ReporterSessionContext);
  if (!context) {
    throw new Error('useReporterSession must be used within a ReporterSessionProvider');
  }
  return context;
}
