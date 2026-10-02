'use client';

import React, { useEffect, useRef, useState } from 'react';
import { SubmitReportResponse } from '@/types/report';
import { StepFormInput } from './StepFormInput';
import { StepEmailVerification } from './StepEmailVerification';
import { StepReviewSubmit } from './StepReviewSubmit';
import { StepSuccessSecret } from './StepSuccessSecret';
import { useReporterSession } from '@/context/ReporterSessionContext';

export function ReportWizard() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [submissionResult, setSubmissionResult] = useState<SubmitReportResponse | null>(null);
  const { resetDraft } = useReporterSession();
  const containerRef = useRef<HTMLDivElement>(null);
  const hasMountedRef = useRef(false);

  // Steps swap whole subtrees, so move focus to the new step's heading for
  // keyboard and screen-reader users. Skip the first render to avoid stealing focus on page load.
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    containerRef.current?.querySelector<HTMLHeadingElement>('h2')?.focus();
  }, [step]);

  // Reset internal step and submissionResult on demo database reset events
  useEffect(() => {
    const handleReset = () => {
      setStep(1);
      setSubmissionResult(null);
    };

    window.addEventListener('demo-database-reset', handleReset);
    const channel =
      typeof BroadcastChannel === 'function'
        ? new BroadcastChannel('portal-guest-prototype-reset')
        : null;
    if (channel) {
      channel.onmessage = handleReset;
    }

    return () => {
      window.removeEventListener('demo-database-reset', handleReset);
      channel?.close();
    };
  }, []);

  const handleSubmissionSuccess = (result: SubmitReportResponse) => {
    setSubmissionResult(result);
    setStep(4);
  };

  const handleReset = () => {
    resetDraft();
    setSubmissionResult(null);
    setStep(1);
  };

  return (
    <div ref={containerRef} className="bg-white rounded-md border border-brand-900/15 shadow-sm p-4 sm:p-6 lg:p-8">
      {/* Visual Step Indicator (only for steps 1-3) */}
      {step < 4 && (
        <div
          role="progressbar"
          aria-label="Kemajuan formulir laporan"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={3}
          aria-valuetext={`Langkah ${step} dari 3`}
          className="mb-6"
        >
          <div className="grid grid-cols-3 gap-2">
            <div
              className={`h-2 rounded-full transition ${
                step >= 1 ? 'bg-brand-600' : 'bg-slate-200'
              }`}
            />
            <div
              className={`h-2 rounded-full transition ${
                step >= 2 ? 'bg-brand-600' : 'bg-slate-200'
              }`}
            />
            <div
              className={`h-2 rounded-full transition ${
                step >= 3 ? 'bg-brand-600' : 'bg-slate-200'
              }`}
            />
          </div>
        </div>
      )}

      {step === 1 && <StepFormInput onNext={() => setStep(2)} />}
      {step === 2 && (
        <StepEmailVerification
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <StepReviewSubmit
          onBack={() => setStep(1)}
          onSuccess={handleSubmissionSuccess}
        />
      )}
      {step === 4 && submissionResult && (
        <StepSuccessSecret result={submissionResult} onReset={handleReset} />
      )}
    </div>
  );
}
