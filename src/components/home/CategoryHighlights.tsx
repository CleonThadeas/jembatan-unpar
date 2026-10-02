import React from 'react';
import Link from 'next/link';
import { CATEGORIES, ContentType } from '@/types/content';
import type { HighlightSection } from '@/lib/home-highlights';
import { formatDate, safeImageUrl } from '@/lib/utils';
import {
  GraduationCap,
  Calendar,
  Trophy,
  Tag,
  ArrowRight,
  Clock,
  MapPin,
  Building2,
  AlertCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface CategoryHighlightsProps {
  scholarships: HighlightSection;
  events: HighlightSection;
  activities: HighlightSection;
  promotions: HighlightSection;
}

export function CategoryHighlights({
  scholarships,
  events,
  activities,
  promotions,
}: CategoryHighlightsProps): React.JSX.Element {
  const sections: Array<{
    type: ContentType;
    section: HighlightSection;
    icon: LucideIcon;
  }> = [
    {
      type: 'BEASISWA',
      section: scholarships,
      icon: GraduationCap,
    },
    {
      type: 'EVENT',
      section: events,
      icon: Calendar,
    },
    {
      type: 'KEGIATAN_KOMPETISI',
      section: activities,
      icon: Trophy,
    },
    {
      type: 'PROMOSI',
      section: promotions,
      icon: Tag,
    },
  ];

  return (
    <div className="space-y-12">
      {sections.map(({ type, section, icon: Icon }, index) => {
        const cat = CATEGORIES[type];
        return (
          <section key={type} className="space-y-6 border-t border-brand-900/20 pt-8 sm:pt-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2">
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-display text-sm font-bold text-brand-700 self-start pt-1">0{index + 1}</span>
                <Icon className="w-8 h-8 text-brand-800 shrink-0" aria-hidden="true" />
                <div className="min-w-0">
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-brand-900 tracking-tight text-balance">
                    {cat.label}
                  </h2>
                  <p className="text-sm text-slate-600 line-clamp-2 sm:line-clamp-none">{cat.description}</p>
                </div>
              </div>

              <Link
                href={`/${cat.slug}`}
                className="inline-flex items-center gap-1.5 min-h-[44px] min-w-[44px] py-2 text-xs font-semibold text-brand-700 hover:text-brand-900 hover:opacity-80 transition-opacity duration-150 motion-reduce:transition-none self-start sm:self-center shrink-0"
              >
                <span>Lihat Semua {cat.label}</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>

            {section.failed ? (
              <div
                role="alert"
                className="bg-amber-50 rounded-xl border border-amber-200 p-6 text-center text-ink-900 text-sm flex flex-col sm:flex-row items-center justify-center gap-2"
              >
                <div className="flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-700" aria-hidden="true" />
                  <span>Informasi belum dapat ditampilkan saat ini. Silakan coba lagi nanti.</span>
                </div>
                <a
                  href="/"
                  className="font-semibold underline text-brand-800 hover:text-brand-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 rounded min-h-[44px] inline-flex items-center ml-1"
                >
                  Coba lagi
                </a>
              </div>
            ) : section.items.length === 0 ? (
              <div
                role="status"
                className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500 text-sm"
              >
                Belum ada pengumuman {cat.label.toLowerCase()} terbit saat ini.
              </div>
            ) : (
              <div className="space-y-4">
                {section.items.slice(0, 3).map((item) => {
                  const imageUrl = safeImageUrl(item.hero_image_url);
                  const detailHref = `/${cat.slug}/${item.slug}`;

                  return (
                    <article
                      key={item.id}
                      className="group rounded-md border border-slate-200 bg-white overflow-hidden shadow-sm flex flex-col sm:flex-row hover:border-slate-300 transition-colors"
                    >
                      {/* Hero Image / Branded Placeholder (Image left sm+, stacked mobile) */}
                      <div className="relative aspect-[16/9] sm:aspect-auto w-full sm:w-64 md:w-72 lg:w-80 shrink-0 bg-slate-100 overflow-hidden">
                        {imageUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={imageUrl}
                            alt={item.hero_image_alt || item.title}
                            width={640}
                            height={360}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 motion-reduce:transform-none motion-reduce:transition-none"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div
                            data-testid="item-placeholder"
                            className="w-full h-full min-h-[160px] sm:min-h-full flex flex-col items-center justify-center bg-gradient-to-br from-brand-50 to-slate-100 text-slate-500 p-4 text-center select-none"
                          >
                            <Icon className="w-10 h-10 text-brand-700/60 mb-2" aria-hidden="true" />
                            <span className="text-xs font-bold text-brand-900 tracking-tight uppercase">
                              {cat.label}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Card Body & Footer (Text right sm+) */}
                      <div className="flex flex-col justify-between flex-1 p-5 sm:p-6 min-w-0">
                        <div className="min-w-0">
                          <div className="flex items-center justify-between text-xs text-slate-600 mb-2 gap-2">
                            <span className="flex items-center gap-1 font-medium truncate max-w-[60%]">
                              <Building2 className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" aria-hidden="true" />
                              <span className="truncate">{item.organizer}</span>
                            </span>
                            <span className="text-slate-600 shrink-0">
                              {formatDate(item.published_at || item.created_at)}
                            </span>
                          </div>

                          <h3 className="font-display font-bold text-lg sm:text-xl line-clamp-2 mb-2 leading-snug text-brand-900 group-hover:text-brand-700 hover:opacity-80 transition-opacity duration-150 motion-reduce:transition-none">
                            <Link
                              href={detailHref}
                              className="rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
                            >
                              {item.title}
                            </Link>
                          </h3>

                          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4 break-words">
                            {item.summary}
                          </p>
                        </div>

                        {/* Card Footer */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
                          {type === 'BEASISWA' && item.registration_deadline && (
                            <span className="text-gold-700 font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                              <span>Deadline: {formatDate(item.registration_deadline)}</span>
                            </span>
                          )}
                          {type === 'EVENT' && item.event_start_at && (
                            <span className="text-brand-700 font-medium flex items-center gap-1">
                              <Calendar className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                              <span>{formatDate(item.event_start_at)}</span>
                            </span>
                          )}
                          {type === 'KEGIATAN_KOMPETISI' && item.location_or_url && (
                            <span className="text-slate-600 truncate flex items-center gap-1 max-w-[70%]">
                              <MapPin className="w-3 h-3 flex-shrink-0 text-slate-400" aria-hidden="true" />
                              <span className="truncate">{item.location_or_url}</span>
                            </span>
                          )}
                          {type === 'PROMOSI' && item.promo_period_end && (
                            <span className="text-brand-800 font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                              <span>Hingga {formatDate(item.promo_period_end)}</span>
                            </span>
                          )}
                          <Link
                            href={detailHref}
                            aria-label={`Detail: ${item.title}`}
                            className="text-brand-700 hover:text-brand-900 hover:opacity-80 transition-opacity duration-150 motion-reduce:transition-none font-semibold ml-auto inline-flex items-center gap-1 min-h-[44px] min-w-[44px] justify-end py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
                          >
                            <span>Detail</span>
                            <ArrowRight className="w-3 h-3" aria-hidden="true" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
