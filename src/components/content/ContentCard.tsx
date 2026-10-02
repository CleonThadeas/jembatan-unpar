import React from 'react';
import Link from 'next/link';
import { Content, CATEGORIES } from '@/types/content';
import { formatDate, formatDateTimeRange, safeImageUrl } from '@/lib/utils';
import { isContentExpired, getContentDeadline } from '@/lib/expiry';
import { Calendar, Clock, MapPin, Building2, ArrowRight } from 'lucide-react';

interface ContentCardProps {
  content: Content;
}

export function ContentCard({ content }: ContentCardProps): React.JSX.Element {
  const category = CATEGORIES[content.type] || CATEGORIES.BEASISWA;
  const detailHref = `/${category.slug}/${content.slug}`;
  const heroImageUrl = safeImageUrl(content.hero_image_url);

  const expired = isContentExpired(content);
  const deadline = getContentDeadline(content);

  return (
    <article
      className={`group rounded-xl border overflow-hidden flex flex-col h-full focus-within:ring-2 focus-within:ring-brand-600 animate-fade-up motion-reduce:animate-none transition-shadow duration-200 ${
        expired
          ? 'bg-slate-50/70 border-slate-200 text-slate-500 opacity-85'
          : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Hero Image / Placeholder */}
      <div className={`relative aspect-[16/9] w-full bg-slate-100 overflow-hidden ${expired ? 'grayscale' : ''}`}>
        {heroImageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={heroImageUrl}
            alt={content.hero_image_alt || content.title}
            width={640}
            height={360}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 motion-reduce:transform-none"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-brand-50 text-slate-500 p-4 text-center">
            <span className="text-2xl font-bold text-brand-800 mb-1">{category.label}</span>
            <span className="text-xs text-slate-600">{content.organizer}</span>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-sm backdrop-blur-md bg-white/90 ${category.badgeColor}`}
          >
            {category.label}
          </span>
        </div>

        {/* Status / Expiry Badge */}
        {expired ? (
          <div className="absolute top-3 right-3">
            <span
              data-testid="expired-badge"
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800/85 text-white backdrop-blur-md shadow-sm"
            >
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Berakhir</span>
            </span>
          </div>
        ) : deadline ? (
          <div className="absolute top-3 right-3">
            <span
              data-testid="active-badge"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-600/90 text-white backdrop-blur-md shadow-sm"
            >
              <span>Aktif</span>
            </span>
          </div>
        ) : null}
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Organizer & Date */}
        <div className="flex items-center justify-between text-xs text-slate-600 mb-2.5 gap-2">
          <span className="flex items-center gap-1 font-medium text-slate-700 truncate" title={content.organizer}>
            <Building2 className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" aria-hidden="true" />
            <span className="truncate">{content.organizer}</span>
          </span>
          <span className="flex-shrink-0 text-slate-600">
            {formatDate(content.published_at || content.created_at)}
          </span>
        </div>

        {/* Title */}
        <h3 className={`text-base font-bold line-clamp-2 mb-2 leading-snug ${expired ? 'text-slate-700 group-hover:text-slate-900' : 'text-slate-900 group-hover:text-brand-700'} transition-colors`}>
          <Link
            href={detailHref}
            className="rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
          >
            {content.title}
          </Link>
        </h3>

        {/* Summary */}
        <p className="text-sm text-slate-600 line-clamp-3 mb-4 flex-grow leading-relaxed">
          {content.summary}
        </p>

        {/* Category-Specific Info Pill */}
        <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1.5 mb-3">
          {content.type === 'BEASISWA' && content.registration_deadline && (
            <div className={`flex items-center gap-1.5 font-medium ${expired ? 'text-slate-500' : 'text-gold-700'}`}>
              <Clock className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
              <span>Batas: {formatDate(content.registration_deadline)}</span>
            </div>
          )}

          {content.type === 'EVENT' && (content.event_start_at || content.location_or_url) && (
            <>
              {content.event_start_at && (
                <div className={`flex items-center gap-1.5 ${expired ? 'text-slate-500' : 'text-brand-700'}`}>
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                  <span>{formatDateTimeRange(content.event_start_at, content.event_end_at)}</span>
                </div>
              )}
              {content.location_or_url && (
                <div className="flex items-center gap-1.5 text-slate-600 truncate">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" aria-hidden="true" />
                  <span className="truncate">{content.location_or_url}</span>
                </div>
              )}
            </>
          )}

          {content.type === 'KEGIATAN_KOMPETISI' && (
            <div className="flex items-center gap-1.5 text-slate-600 truncate">
              {content.registration_deadline ? (
                <div className={`flex items-center gap-1.5 font-medium ${expired ? 'text-slate-500' : 'text-gold-700'}`}>
                  <Clock className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                  <span>Batas Daftar: {formatDate(content.registration_deadline)}</span>
                </div>
              ) : content.location_or_url ? (
                <div className="flex items-center gap-1.5 text-slate-600 truncate">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" aria-hidden="true" />
                  <span className="truncate">{content.location_or_url}</span>
                </div>
              ) : null}
            </div>
          )}

          {content.type === 'PROMOSI' && (content.promo_period_start || content.promo_period_end) && (
            <div className={`flex items-center gap-1.5 font-medium ${expired ? 'text-slate-500' : 'text-brand-800'}`}>
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
              <span>
                Periode: {formatDate(content.promo_period_start)} - {formatDate(content.promo_period_end)}
              </span>
            </div>
          )}
        </div>

        {/* Tags list */}
        {content.tags && content.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {content.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600"
              >
                #{tag.name}
              </span>
            ))}
            {content.tags.length > 3 && (
              <span className="text-[11px] text-slate-600 self-center">
                +{content.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Read More Link */}
        <Link
          href={detailHref}
          aria-label={`Lihat selengkapnya: ${content.title}`}
          className={`mt-auto pt-2 min-h-[44px] flex items-center justify-between text-xs font-semibold rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 ${
            expired
              ? 'text-slate-600 hover:text-slate-800'
              : 'text-brand-700 hover:text-brand-800'
          }`}
        >
          <span>Lihat Selengkapnya</span>
          <ArrowRight
            className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform"
            aria-hidden="true"
          />
        </Link>
      </div>
    </article>
  );
}
