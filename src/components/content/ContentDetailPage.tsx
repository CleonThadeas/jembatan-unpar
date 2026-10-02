import React from 'react';
import Link from 'next/link';
import { Content, ContentType, CATEGORIES } from '@/types/content';
import { formatDate, safeImageUrl } from '@/lib/utils';
import { isContentExpired } from '@/lib/expiry';
import { DetailFields } from './DetailFields';
import { TagList } from './TagList';
import {
  ChevronRight,
  ArrowLeft,
  Building2,
  Calendar,
  Eye,
  Tag as TagIcon,
  GraduationCap,
  Trophy,
  Clock,
  Sparkles,
} from 'lucide-react';

interface ContentDetailPageProps {
  content: Content;
}

const CATEGORY_ICONS: Record<
  ContentType,
  React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>
> = {
  BEASISWA: GraduationCap,
  EVENT: Calendar,
  KEGIATAN_KOMPETISI: Trophy,
  PROMOSI: TagIcon,
};

const EXPIRED_MESSAGES: Record<string, string> = {
  BEASISWA:
    'Pendaftaran beasiswa ini sudah berakhir. Simpan informasi ini sebagai referensi untuk periode pendaftaran berikutnya.',
  EVENT: 'Acara ini sudah berakhir. Nantikan agenda dan kegiatan menarik berikutnya.',
  KEGIATAN_KOMPETISI:
    'Pendaftaran kegiatan atau kompetisi ini sudah berakhir. Pantau terus pembaruan untuk kesempatan berikutnya.',
  PROMOSI:
    'Periode promosi ini sudah berakhir. Simak penawaran menarik lainnya yang sedang berlangsung.',
};

export function ContentDetailPage({ content }: ContentDetailPageProps): React.JSX.Element {
  const category = CATEGORIES[content.type] || CATEGORIES.BEASISWA;
  const heroImageUrl = safeImageUrl(content.hero_image_url);
  const expired = isContentExpired(content);
  const CategoryIcon = CATEGORY_ICONS[content.type] || Sparkles;

  return (
    <article className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-slate-600 overflow-x-auto whitespace-nowrap pb-1">
        <ol className="flex items-center">
          <li className="inline-flex items-center">
            <Link href="/" className="hover:text-slate-900 transition-colors">
              Beranda
            </Link>
            <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-slate-500 flex-shrink-0" aria-hidden="true" />
          </li>
          <li className="inline-flex items-center">
            <Link href={`/${category.slug}`} className="hover:text-slate-900 transition-colors">
              {category.label}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-slate-500 flex-shrink-0" aria-hidden="true" />
          </li>
          <li className="inline-flex items-center">
            <span className="text-slate-900 font-medium truncate max-w-[200px] sm:max-w-xs" aria-current="page">
              {content.title}
            </span>
          </li>
        </ol>
      </nav>

      {/* Top Back Navigation Link (Single, >=44px touch target) */}
      <div className="mb-6">
        <Link
          href={`/${category.slug}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-brand-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 rounded-md py-2 px-1 -ml-1 min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4 text-brand-700 flex-shrink-0" aria-hidden="true" />
          <span>Kembali ke Daftar {category.label}</span>
        </Link>
      </div>

      {/* Editorial Header */}
      <header className="space-y-4 mb-8 border-t-4 border-brand-900 pt-6">
        {/* Category Eyebrow, Tags & Status Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <CategoryIcon className="w-7 h-7 text-brand-700 flex-shrink-0" aria-hidden="true" />
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${category.badgeColor}`}
            >
              {category.label}
            </span>
            {content.tags && content.tags.length > 0 && (
              <TagList tags={content.tags} categorySlug={category.slug} />
            )}
          </div>

          <div>
            {expired ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" aria-hidden="true" />
                <span>Berakhir</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" aria-hidden="true" />
                <span>Aktif</span>
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-brand-900 tracking-tight leading-[1.15] text-balance break-words [overflow-wrap:anywhere]">
          {content.title}
        </h1>

        {/* Metadata Row */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 sm:gap-x-6 text-xs sm:text-sm text-slate-600 border-y border-slate-200 py-3.5">
          <span className="flex items-center gap-1.5 font-medium text-slate-800">
            <Building2 className="w-4 h-4 text-brand-700 flex-shrink-0" aria-hidden="true" />
            <span className="break-words">{content.organizer}</span>
          </span>

          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-500 flex-shrink-0" aria-hidden="true" />
            <span>Diterbitkan: {formatDate(content.published_at || content.created_at)}</span>
          </span>

          {content.view_count !== undefined && (
            <span className="flex items-center gap-1.5 sm:ml-auto">
              <Eye className="w-4 h-4 text-slate-500 flex-shrink-0" aria-hidden="true" />
              <span>{content.view_count} dilihat</span>
            </span>
          )}
        </div>
      </header>

      {/* Expiry Notice Banner */}
      {expired && (
        <div
          role="status"
          aria-label="Pemberitahuan Konten Berakhir"
          className="rounded-2xl border border-amber-300/80 bg-amber-50/90 p-4 sm:p-5 flex items-start gap-3.5 mb-8 text-amber-950 shadow-xs"
        >
          <Clock className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-amber-950">Informasi Telah Berakhir</h2>
            <p className="text-sm text-amber-900 leading-relaxed break-words">
              {EXPIRED_MESSAGES[content.type] || 'Informasi ini sudah berakhir.'}
            </p>
          </div>
        </div>
      )}

      {/* Hero Image */}
      {heroImageUrl && (
        <div className="mb-8 overflow-hidden rounded-2xl border border-brand-900/10 bg-surface-50 aspect-[16/9] relative shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImageUrl}
            alt={content.hero_image_alt || content.title}
            width={1280}
            height={720}
            loading="eager"
            decoding="async"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Two-Column Responsive Layout (Main Column & Sticky Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Main Column: Summary Lead & Deskripsi Lengkap */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8 order-2 lg:order-1">
          {/* Summary Lead */}
          {content.summary && (
            <div className="bg-brand-50/60 rounded-xl p-5 sm:p-6 border-l-4 border-gold-500 shadow-xs">
              <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-normal break-words [overflow-wrap:anywhere]">
                {content.summary}
              </p>
            </div>
          )}

          {/* Main Body */}
          <section aria-label="Deskripsi Lengkap" className="space-y-4">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-brand-900 border-b border-brand-900/15 pb-3">
              Deskripsi Lengkap
            </h2>
            <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-4 break-words [overflow-wrap:anywhere]">
              {content.body}
            </div>
          </section>
        </div>

        {/* Sidebar: DetailFields / Ringkasan Informasi */}
        <section
          aria-label="Informasi Khusus"
          className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 order-1 lg:order-2"
        >
          <DetailFields content={content} />
        </section>
      </div>
    </article>
  );
}
