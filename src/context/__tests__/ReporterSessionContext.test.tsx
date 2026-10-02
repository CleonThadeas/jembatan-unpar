import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ReporterSessionProvider, useReporterSession } from '@/context/ReporterSessionContext';
import * as apiClient from '@/lib/api-client';
import { AccessResponse } from '@/types/report';

function TestConsumer({ onState }: { onState: (state: ReturnType<typeof useReporterSession>) => void }) {
  const context = useReporterSession();
  onState(context);
  return (
    <div>
      <span data-testid="has-mutation">{String(context.hasMutationCapability)}</span>
      <span data-testid="verified-email">{context.verifiedEmail ?? 'none'}</span>
      <span data-testid="draft-title">{context.draft.title}</span>
    </div>
  );
}

describe('ReporterSessionContext (portal-guest)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('throws error when useReporterSession is used outside Provider', () => {
    // Suppress console.error in React for this expected boundary throw
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer onState={() => {}} />)).toThrow(
      /useReporterSession must be used within a ReporterSessionProvider/i
    );
    spy.mockRestore();
  });

  it('initializes with clean in-memory state and default draft', () => {
    let capturedState!: ReturnType<typeof useReporterSession>;
    render(
      <ReporterSessionProvider>
        <TestConsumer onState={(s) => (capturedState = s)} />
      </ReporterSessionProvider>
    );

    expect(capturedState.reportId).toBeNull();
    expect(capturedState.sessionToken).toBeNull();
    expect(capturedState.csrfToken).toBeNull();
    expect(capturedState.hasMutationCapability).toBe(false);
    expect(capturedState.verifiedEmail).toBeNull();
    expect(capturedState.verificationTicket).toBeNull();
    expect(capturedState.draft).toEqual({
      title: '',
      category_id: '',
      category_name: '',
      reporter_impact: 'Sedang',
      description: '',
      email: '',
    });
  });

  it('clears session, verification, draft and attachments after database reset', () => {
    let state: ReturnType<typeof useReporterSession> | undefined;
    render(<ReporterSessionProvider><TestConsumer onState={(value) => { state = value; }} /></ReporterSessionProvider>);
    act(() => {
      state?.setSession({ report_id: 'demo-1', session_token: 'demo-session', expires_at: '2099-01-01' });
      state?.updateDraft({ title: 'Draft demo' });
      state?.setVerification('demo-ticket', 'pelapor1@example.com');
      state?.addAttachments([new File(['demo'], 'demo.pdf', { type: 'application/pdf' })]);
    });
    act(() => { window.dispatchEvent(new Event('demo-database-reset')); });
    expect(state?.sessionToken).toBeNull();
    expect(state?.draft.title).toBe('');
    expect(state?.verificationTicket).toBeNull();
    expect(state?.attachments).toEqual([]);
  });

  it('updates and resets draft correctly', () => {
    let capturedState!: ReturnType<typeof useReporterSession>;
    render(
      <ReporterSessionProvider>
        <TestConsumer onState={(s) => (capturedState = s)} />
      </ReporterSessionProvider>
    );

    act(() => {
      capturedState.updateDraft({ title: 'Kerusakan Kursi Kuliah', category_id: 'cat-1' });
    });
    expect(capturedState.draft.title).toBe('Kerusakan Kursi Kuliah');
    expect(capturedState.draft.category_id).toBe('cat-1');
    expect(capturedState.draft.reporter_impact).toBe('Sedang');

    act(() => {
      capturedState.resetDraft();
    });
    expect(capturedState.draft.title).toBe('');
    expect(capturedState.verifiedEmail).toBeNull();
    expect(capturedState.verificationTicket).toBeNull();
  });

  it('sets and clears email verification state', () => {
    let capturedState!: ReturnType<typeof useReporterSession>;
    render(
      <ReporterSessionProvider>
        <TestConsumer onState={(s) => (capturedState = s)} />
      </ReporterSessionProvider>
    );

    act(() => {
      capturedState.setVerification('vt-ticket-123', 'mhs@kampus.ac.id');
    });
    expect(capturedState.verificationTicket).toBe('vt-ticket-123');
    expect(capturedState.verifiedEmail).toBe('mhs@kampus.ac.id');

    act(() => {
      capturedState.clearVerification();
    });
    expect(capturedState.verificationTicket).toBeNull();
    expect(capturedState.verifiedEmail).toBeNull();
  });

  it('invalidates verification ticket and email when draft email is edited with a new value', () => {
    let capturedState!: ReturnType<typeof useReporterSession>;
    render(
      <ReporterSessionProvider>
        <TestConsumer onState={(s) => (capturedState = s)} />
      </ReporterSessionProvider>
    );

    act(() => {
      capturedState.updateDraft({ email: 'original@univ.ac.id' });
      capturedState.setVerification('vt-ticket-456', 'original@univ.ac.id');
    });
    expect(capturedState.verificationTicket).toBe('vt-ticket-456');
    expect(capturedState.verifiedEmail).toBe('original@univ.ac.id');

    // Editing draft email to a different email must invalidate the verification ticket
    act(() => {
      capturedState.updateDraft({ email: 'modified@univ.ac.id' });
    });
    expect(capturedState.verificationTicket).toBeNull();
    expect(capturedState.verifiedEmail).toBeNull();
    expect(capturedState.draft.email).toBe('modified@univ.ac.id');
  });

  it('preserves verification when draft email is updated with the identical value', () => {
    let capturedState!: ReturnType<typeof useReporterSession>;
    render(
      <ReporterSessionProvider>
        <TestConsumer onState={(s) => (capturedState = s)} />
      </ReporterSessionProvider>
    );

    act(() => {
      capturedState.updateDraft({ email: 'original@univ.ac.id' });
      capturedState.setVerification('vt-ticket-456', 'original@univ.ac.id');
    });

    act(() => {
      capturedState.updateDraft({ title: 'New Title Only' });
    });
    expect(capturedState.verificationTicket).toBe('vt-ticket-456');
    expect(capturedState.verifiedEmail).toBe('original@univ.ac.id');

    act(() => {
      capturedState.updateDraft({ email: 'original@univ.ac.id' });
    });
    expect(capturedState.verificationTicket).toBe('vt-ticket-456');
    expect(capturedState.verifiedEmail).toBe('original@univ.ac.id');
  });

  it('preserves verification when draft email is updated with case-insensitive variation', () => {
    let capturedState!: ReturnType<typeof useReporterSession>;
    render(
      <ReporterSessionProvider>
        <TestConsumer onState={(s) => (capturedState = s)} />
      </ReporterSessionProvider>
    );

    act(() => {
      capturedState.updateDraft({ email: 'mahasiswa@univ.ac.id' });
      capturedState.setVerification('vt-ticket-case', 'mahasiswa@univ.ac.id');
    });

    // Case change should NOT invalidate verification
    act(() => {
      capturedState.updateDraft({ email: 'MAHASISWA@UNIV.AC.ID' });
    });
    expect(capturedState.verificationTicket).toBe('vt-ticket-case');
    expect(capturedState.verifiedEmail).toBe('mahasiswa@univ.ac.id');

    // Case change with leading/trailing spaces should NOT invalidate verification
    act(() => {
      capturedState.updateDraft({ email: '  mahasiswa@univ.ac.id  ' });
    });
    expect(capturedState.verificationTicket).toBe('vt-ticket-case');
    expect(capturedState.verifiedEmail).toBe('mahasiswa@univ.ac.id');

    // Actual email address change MUST invalidate verification
    act(() => {
      capturedState.updateDraft({ email: 'other.person@univ.ac.id' });
    });
    expect(capturedState.verificationTicket).toBeNull();
    expect(capturedState.verifiedEmail).toBeNull();
  });

  it('sets session tokens and enables mutation capability', () => {
    let capturedState!: ReturnType<typeof useReporterSession>;
    render(
      <ReporterSessionProvider>
        <TestConsumer onState={(s) => (capturedState = s)} />
      </ReporterSessionProvider>
    );

    act(() => {
      capturedState.setSession({
        report_id: 'rep-1',
        session_token: 'sess-tok-1',
        csrf_token: 'csrf-tok-1',
        expires_at: '2026-09-27T15:00:00Z',
      });
    });

    expect(capturedState.reportId).toBe('rep-1');
    expect(capturedState.sessionToken).toBe('sess-tok-1');
    expect(capturedState.csrfToken).toBe('csrf-tok-1');
    expect(capturedState.hasMutationCapability).toBe(true);

    act(() => {
      capturedState.clearLocalSession();
    });
    expect(capturedState.reportId).toBeNull();
    expect(capturedState.sessionToken).toBeNull();
    expect(capturedState.csrfToken).toBeNull();
    expect(capturedState.hasMutationCapability).toBe(false);
  });

  it('reauthenticates with secret code via checkAccessCode', async () => {
    vi.spyOn(apiClient, 'checkAccessCode').mockResolvedValueOnce({
      report_id: 'rep-restored',
      session_token: 'sess-restored',
      csrf_token: 'csrf-restored',
      expires_at: '2026-09-27T18:00:00Z',
    });

    let capturedState!: ReturnType<typeof useReporterSession>;
    render(
      <ReporterSessionProvider>
        <TestConsumer onState={(s) => (capturedState = s)} />
      </ReporterSessionProvider>
    );

    await act(async () => {
      const resp = await capturedState.reauthenticateWithCode('MY-SECRET-CODE');
      expect(resp.report_id).toBe('rep-restored');
    });

    expect(capturedState.reportId).toBe('rep-restored');
    expect(capturedState.sessionToken).toBe('sess-restored');
    expect(capturedState.csrfToken).toBe('csrf-restored');
    expect(capturedState.hasMutationCapability).toBe(true);
  });

  it('does not store session tokens in context when reauthenticating with code for a mismatched expected report ID', async () => {
    vi.spyOn(apiClient, 'checkAccessCode').mockResolvedValueOnce({
      report_id: 'rep-B',
      session_token: 'sess-B',
      csrf_token: 'csrf-B',
      expires_at: '2026-09-27T18:00:00Z',
    });

    let capturedState!: ReturnType<typeof useReporterSession>;
    render(
      <ReporterSessionProvider>
        <TestConsumer onState={(s) => (capturedState = s)} />
      </ReporterSessionProvider>
    );

    await act(async () => {
      const resp = await capturedState.reauthenticateWithCode('CODE-FOR-REPORT-B', 'rep-A');
      expect(resp.report_id).toBe('rep-B');
    });

    // In-memory state must NOT be populated with rep-B's tokens when expected was rep-A
    expect(capturedState.reportId).toBeNull();
    expect(capturedState.sessionToken).toBeNull();
    expect(capturedState.csrfToken).toBeNull();
    expect(capturedState.hasMutationCapability).toBe(false);
  });

  it('strictly requires sessionToken && reportId for hasMutationCapability (csrfToken alone is insufficient)', () => {
    let capturedState!: ReturnType<typeof useReporterSession>;
    render(
      <ReporterSessionProvider>
        <TestConsumer onState={(s) => (capturedState = s)} />
      </ReporterSessionProvider>
    );

    // Case 1: csrfToken and reportId set, but sessionToken is empty string or null
    act(() => {
      capturedState.setSession({
        report_id: 'rep-1',
        session_token: '',
        csrf_token: 'csrf-only-token',
        expires_at: '2026-09-27T18:00:00Z',
      });
    });

    expect(capturedState.hasMutationCapability).toBe(false);

    // Case 2: sessionToken and reportId set -> mutation allowed
    act(() => {
      capturedState.setSession({
        report_id: 'rep-1',
        session_token: 'valid-session-token',
        csrf_token: 'csrf-token',
        expires_at: '2026-09-27T18:00:00Z',
      });
    });

    expect(capturedState.hasMutationCapability).toBe(true);

    // Case 3: sessionToken set but reportId is empty -> mutation blocked
    act(() => {
      capturedState.setSession({
        report_id: '',
        session_token: 'valid-session-token',
        csrf_token: 'csrf-token',
        expires_at: '2026-09-27T18:00:00Z',
      });
    });

    expect(capturedState.hasMutationCapability).toBe(false);
  });

  it('prevents out-of-order session desync on concurrent reauthenticateWithCode calls using deferred promises', async () => {
    function createDeferred<T>() {
      let resolve!: (value: T | PromiseLike<T>) => void;
      let reject!: (reason?: unknown) => void;
      const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    }

    const deferred1 = createDeferred<AccessResponse>();
    const deferred2 = createDeferred<AccessResponse>();

    const checkAccessSpy = vi.spyOn(apiClient, 'checkAccessCode');
    checkAccessSpy.mockReturnValueOnce(deferred1.promise);
    checkAccessSpy.mockReturnValueOnce(deferred2.promise);

    let capturedState!: ReturnType<typeof useReporterSession>;
    render(
      <ReporterSessionProvider>
        <TestConsumer onState={(s) => (capturedState = s)} />
      </ReporterSessionProvider>
    );

    // Call 1 initiates first (slow request for report-1)
    let call1Promise: Promise<AccessResponse>;
    act(() => {
      call1Promise = capturedState.reauthenticateWithCode('CODE-REPORT-1');
    });

    // Call 2 initiates second (fast request for report-2)
    let call2Promise: Promise<AccessResponse>;
    act(() => {
      call2Promise = capturedState.reauthenticateWithCode('CODE-REPORT-2');
    });

    // Call 2 resolves first
    await act(async () => {
      deferred2.resolve({
        report_id: 'rep-2',
        session_token: 'sess-2',
        csrf_token: 'csrf-2',
        expires_at: '2026-09-27T19:00:00Z',
      });
      const res2 = await call2Promise;
      expect(res2.report_id).toBe('rep-2');
    });

    // State is now rep-2
    expect(capturedState.reportId).toBe('rep-2');
    expect(capturedState.sessionToken).toBe('sess-2');

    // Call 1 resolves LATER. Because it was superseded, it must NOT overwrite rep-2!
    await act(async () => {
      deferred1.resolve({
        report_id: 'rep-1',
        session_token: 'sess-1',
        csrf_token: 'csrf-1',
        expires_at: '2026-09-27T18:00:00Z',
      });
      // Call 1 must reject with SupersededError or be handled as superseded
      await expect(call1Promise).rejects.toThrow();
    });

    // Context must STILL retain rep-2's tokens, NOT rep-1's
    expect(capturedState.reportId).toBe('rep-2');
    expect(capturedState.sessionToken).toBe('sess-2');
    expect(capturedState.csrfToken).toBe('csrf-2');
    expect(capturedState.hasMutationCapability).toBe(true);
  });
});
