import React from 'react';
import { Content } from '@/types/content';
import { formatDate, formatDateTimeRange, safeLinkUrl } from '@/lib/utils';
import { isContentExpired } from '@/lib/expiry';
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  ExternalLink,
  FileText,
  AlertCircle,
  Trophy,
  Layers,
} from 'lucide-react';

interface DetailFieldsProps {
  content: Content;
}

export function DetailFields({ content }: DetailFieldsProps): React.JSX.Element {
  const safeRegistrationUrl = safeLinkUrl(content.registration_url);
  const expired = isContentExpired(content);

  return (
    <div className="w-full">
      {/* ---------------- 1. BEASISWA ---------------- */}
      {content.type === 'BEASISWA' && (
        <div className="bg-white rounded-2xl border border-brand-900/10 shadow-sm p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-brand-100">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-700 border border-brand-200/80 flex-shrink-0">
              <Building2 className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 block">
                Ringkasan Informasi
              </span>
              <h2 className="text-base font-bold text-brand-950 leading-tight">
                Informasi Beasiswa
              </h2>
            </div>
          </div>

          <dl className="divide-y divide-brand-100/70 text-sm">
            <div className="pb-3.5 first:pt-0">
              <dt className="text-xs font-bold uppercase tracking-wider text-brand-950 flex items-center gap-1.5 mb-1">
                <Building2 className="w-3.5 h-3.5 text-brand-700 flex-shrink-0" aria-hidden="true" />
                <span className="text-brand-950">Penyelenggara</span>
              </dt>
              <dd className="font-medium text-slate-900 break-words [overflow-wrap:anywhere]">
                {content.organizer}
              </dd>
            </div>

            {content.registration_deadline && (
              <div className="py-3.5">
                <dt className="text-xs font-bold uppercase tracking-wider text-brand-950 flex items-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5 text-brand-700 flex-shrink-0" aria-hidden="true" />
                  <span className="text-brand-950">Batas Waktu Pendaftaran</span>
                </dt>
                <dd
                  className={`font-semibold flex items-center gap-1.5 ${
                    expired ? 'text-slate-500' : 'text-gold-700'
                  }`}
                >
                  <Clock className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  <span>{formatDate(content.registration_deadline)}</span>
                </dd>
              </div>
            )}

            {content.requirements && (
              <div className="pt-3.5">
                <dt className="text-xs font-bold uppercase tracking-wider text-brand-950 flex items-center gap-1.5 mb-2">
                  <FileText className="w-3.5 h-3.5 text-brand-700 flex-shrink-0" aria-hidden="true" />
                  <span className="text-brand-950">Persyaratan & Kriteria</span>
                </dt>
                <dd className="text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-brand-50/50 p-3.5 rounded-xl border border-brand-100 break-words [overflow-wrap:anywhere]">
                  {content.requirements}
                </dd>
              </div>
            )}
          </dl>

          {safeRegistrationUrl && (
            <div className="pt-2">
              {expired ? (
                <div
                  aria-disabled="true"
                  className="w-full inline-flex justify-center items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 text-slate-500 font-semibold text-sm cursor-not-allowed border border-slate-200 min-h-[44px]"
                >
                  <Clock className="w-4 h-4 text-slate-400" aria-hidden="true" />
                  <span>Pendaftaran Telah Ditutup</span>
                </div>
              ) : (
                <a
                  href={safeRegistrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex justify-center items-center gap-2 px-5 py-3 rounded-xl bg-brand-800 hover:bg-brand-900 active:bg-brand-950 text-white font-semibold text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2 min-h-[44px]"
                >
                  <span>Daftar / Akses Portal Beasiswa</span>
                  <span className="sr-only"> (terbuka di tab baru)</span>
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* ---------------- 2. EVENT ---------------- */}
      {content.type === 'EVENT' && (
        <div className="bg-white rounded-2xl border border-gold-400/50 shadow-sm p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-gold-100">
            <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center text-gold-700 border border-gold-200/80 flex-shrink-0">
              <Calendar className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gold-700 block">
                Ringkasan Informasi
              </span>
              <h2 className="text-base font-bold text-brand-950 leading-tight">
                Informasi Agenda Event
              </h2>
            </div>
          </div>

          <dl className="divide-y divide-gold-100/70 text-sm">
            <div className="pb-3.5 first:pt-0">
              <dt className="text-xs font-bold uppercase tracking-wider text-brand-950 flex items-center gap-1.5 mb-1">
                <Building2 className="w-3.5 h-3.5 text-gold-700 flex-shrink-0" aria-hidden="true" />
                <span className="text-brand-950">Penyelenggara</span>
              </dt>
              <dd className="font-medium text-slate-900 break-words [overflow-wrap:anywhere]">
                {content.organizer}
              </dd>
            </div>

            {(content.event_start_at || content.event_end_at) && (
              <div className="py-3.5">
                <dt className="text-xs font-bold uppercase tracking-wider text-brand-950 flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-gold-700 flex-shrink-0" aria-hidden="true" />
                  <span className="text-brand-950">Jadwal Pelaksanaan</span>
                </dt>
                <dd
                  className={`font-semibold flex items-center gap-1.5 ${
                    expired ? 'text-slate-500' : 'text-slate-900'
                  }`}
                >
                  <Calendar className="w-4 h-4 flex-shrink-0 text-gold-700" aria-hidden="true" />
                  <span>{formatDateTimeRange(content.event_start_at, content.event_end_at)}</span>
                </dd>
              </div>
            )}

            {content.location_or_url && (
              <div className="pt-3.5">
                <dt className="text-xs font-bold uppercase tracking-wider text-brand-950 flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-gold-700 flex-shrink-0" aria-hidden="true" />
                  <span className="text-brand-950">Lokasi / Tautan Online</span>
                </dt>
                <dd className="font-medium text-slate-900 flex items-start gap-1.5 break-words [overflow-wrap:anywhere]">
                  <MapPin className="w-4 h-4 text-gold-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{content.location_or_url}</span>
                </dd>
              </div>
            )}
          </dl>

          {safeRegistrationUrl && (
            <div className="pt-2">
              {expired ? (
                <div
                  aria-disabled="true"
                  className="w-full inline-flex justify-center items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 text-slate-500 font-semibold text-sm cursor-not-allowed border border-slate-200 min-h-[44px]"
                >
                  <Clock className="w-4 h-4 text-slate-400" aria-hidden="true" />
                  <span>Pendaftaran Telah Ditutup</span>
                </div>
              ) : (
                <a
                  href={safeRegistrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex justify-center items-center gap-2 px-5 py-3 rounded-xl bg-brand-800 hover:bg-brand-900 active:bg-brand-950 text-white font-semibold text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2 min-h-[44px]"
                >
                  <span>Pendaftaran Event</span>
                  <span className="sr-only"> (terbuka di tab baru)</span>
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* ---------------- 3. KEGIATAN & KOMPETISI ---------------- */}
      {content.type === 'KEGIATAN_KOMPETISI' && (
        <div className="bg-white rounded-2xl border border-brand-300 shadow-sm p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-brand-100">
            <div className="w-10 h-10 rounded-xl bg-brand-100/60 flex items-center justify-center text-brand-800 border border-brand-300/80 flex-shrink-0">
              <Trophy className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-800 block">
                Ringkasan Informasi
              </span>
              <h2 className="text-base font-bold text-brand-950 leading-tight">
                Informasi Kegiatan & Kompetisi
              </h2>
            </div>
          </div>

          <dl className="divide-y divide-brand-100/70 text-sm">
            <div className="pb-3.5 first:pt-0">
              <dt className="text-xs font-bold uppercase tracking-wider text-brand-950 flex items-center gap-1.5 mb-1">
                <Building2 className="w-3.5 h-3.5 text-brand-800 flex-shrink-0" aria-hidden="true" />
                <span className="text-brand-950">Penyelenggara</span>
              </dt>
              <dd className="font-medium text-slate-900 break-words [overflow-wrap:anywhere]">
                {content.organizer}
              </dd>
            </div>

            {Boolean(content.custom_metadata?.activity_type) && (
              <div className="py-3.5">
                <dt className="text-xs font-bold uppercase tracking-wider text-brand-950 flex items-center gap-1.5 mb-1">
                  <Layers className="w-3.5 h-3.5 text-brand-800 flex-shrink-0" aria-hidden="true" />
                  <span className="text-brand-950">Jenis Kegiatan</span>
                </dt>
                <dd className="font-medium text-slate-900 break-words [overflow-wrap:anywhere]">
                  {String(content.custom_metadata?.activity_type)}
                </dd>
              </div>
            )}

            {content.registration_deadline && (
              <div className="py-3.5">
                <dt className="text-xs font-bold uppercase tracking-wider text-brand-950 flex items-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5 text-brand-800 flex-shrink-0" aria-hidden="true" />
                  <span className="text-brand-950">Batas Pendaftaran</span>
                </dt>
                <dd
                  className={`font-semibold flex items-center gap-1.5 ${
                    expired ? 'text-slate-500' : 'text-gold-700'
                  }`}
                >
                  <Clock className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  <span>{formatDate(content.registration_deadline)}</span>
                </dd>
              </div>
            )}

            {content.location_or_url && (
              <div className="py-3.5">
                <dt className="text-xs font-bold uppercase tracking-wider text-brand-950 flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-800 flex-shrink-0" aria-hidden="true" />
                  <span className="text-brand-950">Lokasi / Media</span>
                </dt>
                <dd className="font-medium text-slate-900 flex items-start gap-1.5 break-words [overflow-wrap:anywhere]">
                  <MapPin className="w-4 h-4 text-brand-800 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{content.location_or_url}</span>
                </dd>
              </div>
            )}

            {content.requirements && (
              <div className="pt-3.5">
                <dt className="text-xs font-bold uppercase tracking-wider text-brand-950 flex items-center gap-1.5 mb-2">
                  <FileText className="w-3.5 h-3.5 text-brand-800 flex-shrink-0" aria-hidden="true" />
                  <span className="text-brand-950">Ketentuan & Persyaratan</span>
                </dt>
                <dd className="text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-brand-50/60 p-3.5 rounded-xl border border-brand-200 break-words [overflow-wrap:anywhere]">
                  {content.requirements}
                </dd>
              </div>
            )}
          </dl>

          {safeRegistrationUrl && (
            <div className="pt-2">
              {expired ? (
                <div
                  aria-disabled="true"
                  className="w-full inline-flex justify-center items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 text-slate-500 font-semibold text-sm cursor-not-allowed border border-slate-200 min-h-[44px]"
                >
                  <Clock className="w-4 h-4 text-slate-400" aria-hidden="true" />
                  <span>Pendaftaran Telah Ditutup</span>
                </div>
              ) : (
                <a
                  href={safeRegistrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex justify-center items-center gap-2 px-5 py-3 rounded-xl bg-brand-800 hover:bg-brand-900 active:bg-brand-950 text-white font-semibold text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2 min-h-[44px]"
                >
                  <span>Daftar Kompetisi / Kegiatan</span>
                  <span className="sr-only"> (terbuka di tab baru)</span>
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* ---------------- 4. PROMOSI ---------------- */}
      {content.type === 'PROMOSI' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center text-gold-700 border border-gold-200/80 flex-shrink-0">
              <AlertCircle className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                Ringkasan Informasi
              </span>
              <h2 className="text-base font-bold text-brand-950 leading-tight">
                Detail Penawaran & Promosi
              </h2>
            </div>
          </div>

          <dl className="divide-y divide-slate-100 text-sm">
            <div className="pb-3.5 first:pt-0">
              <dt className="text-xs font-bold uppercase tracking-wider text-brand-950 flex items-center gap-1.5 mb-1">
                <Building2 className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" aria-hidden="true" />
                <span className="text-brand-950">Penyedia / Mitra</span>
              </dt>
              <dd className="font-medium text-slate-900 break-words [overflow-wrap:anywhere]">
                {content.organizer}
              </dd>
            </div>

            {(content.promo_period_start || content.promo_period_end) && (
              <div className="py-3.5">
                <dt className="text-xs font-bold uppercase tracking-wider text-brand-950 flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" aria-hidden="true" />
                  <span className="text-brand-950">Periode Berlaku</span>
                </dt>
                <dd
                  className={`font-semibold flex items-center gap-1.5 ${
                    expired ? 'text-slate-500' : 'text-slate-900'
                  }`}
                >
                  <Calendar className="w-4 h-4 flex-shrink-0 text-slate-500" aria-hidden="true" />
                  <span>
                    {formatDate(content.promo_period_start)} s/d {formatDate(content.promo_period_end)}
                  </span>
                </dd>
              </div>
            )}

            {content.terms_and_conditions && (
              <div className="pt-3.5">
                <dt className="text-xs font-bold uppercase tracking-wider text-brand-950 flex items-center gap-1.5 mb-2">
                  <FileText className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" aria-hidden="true" />
                  <span className="text-brand-950">Syarat & Ketentuan Promosi</span>
                </dt>
                <dd className="text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 break-words [overflow-wrap:anywhere]">
                  {content.terms_and_conditions}
                </dd>
              </div>
            )}
          </dl>

          {safeRegistrationUrl && (
            <div className="pt-2">
              {expired ? (
                <div
                  aria-disabled="true"
                  className="w-full inline-flex justify-center items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 text-slate-500 font-semibold text-sm cursor-not-allowed border border-slate-200 min-h-[44px]"
                >
                  <Clock className="w-4 h-4 text-slate-400" aria-hidden="true" />
                  <span>Periode Penawaran Berakhir</span>
                </div>
              ) : (
                <a
                  href={safeRegistrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex justify-center items-center gap-2 px-5 py-3 rounded-xl bg-brand-800 hover:bg-brand-900 active:bg-brand-950 text-white font-semibold text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2 min-h-[44px]"
                >
                  <span>Kunjungi Penawaran / Website</span>
                  <span className="sr-only"> (terbuka di tab baru)</span>
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
