'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Tag, CONTENT_SORTS, ContentSort } from '@/types/content';
import { Search, X, SlidersHorizontal } from 'lucide-react';

interface FilterBarProps {
  tags: Tag[];
  initialQuery?: string;
  initialTag?: string;
  initialSort?: string;
  initialAvailability?: string;
}

const SORT_LABELS: Record<ContentSort, string> = {
  published_at_desc: 'Terbaru',
  published_at_asc: 'Terlama',
  views_desc: 'Paling Populer',
  created_at_desc: 'Waktu Dibuat',
};

const AVAILABILITY_OPTIONS = [
  { value: '', label: 'Semua' },
  { value: 'aktif', label: 'Aktif' },
  { value: 'berakhir', label: 'Berakhir' },
] as const;

export function FilterBar({
  tags,
  initialQuery = '',
  initialTag = '',
  initialSort = 'published_at_desc',
  initialAvailability = '',
}: FilterBarProps): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);

  // Draft state inside dialog panel
  const [draftAvailability, setDraftAvailability] = useState(initialAvailability);
  const [draftSort, setDraftSort] = useState(initialSort);
  const [draftTag, setDraftTag] = useState(initialTag);
  const [tagSearch, setTagSearch] = useState('');

  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Active filter count (tag, sort != default, availability)
  const isSortActive = initialSort && initialSort !== 'published_at_desc';
  const isTagActive = Boolean(initialTag);
  const isAvailabilityActive = Boolean(initialAvailability);
  const activeFilterCount = (isTagActive ? 1 : 0) + (isSortActive ? 1 : 0) + (isAvailabilityActive ? 1 : 0);

  // Open/close lifecycle & accessibility
  const openPanel = () => {
    setDraftAvailability(initialAvailability);
    setDraftSort(initialSort);
    setDraftTag(initialTag);
    setTagSearch('');
    setIsOpen(true);
  };

  const closePanel = () => {
    setIsOpen(false);
    setTagSearch('');
    filterButtonRef.current?.focus();
  };

  useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closePanel();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        filterButtonRef.current &&
        !filterButtonRef.current.contains(target)
      ) {
        closePanel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const applyParams = (newParams: { q?: string; tag?: string; sort?: string; availability?: string }) => {
    startTransition(() => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));

      const finalQuery = newParams.q !== undefined ? newParams.q : query;
      const finalTag = newParams.tag !== undefined ? newParams.tag : initialTag;
      const finalSort = newParams.sort !== undefined ? newParams.sort : initialSort;
      const finalAvailability =
        newParams.availability !== undefined ? newParams.availability : initialAvailability;

      if (finalQuery.trim()) {
        current.set('q', finalQuery.trim());
      } else {
        current.delete('q');
      }

      if (finalTag) {
        current.set('tag', finalTag);
      } else {
        current.delete('tag');
      }

      if (finalSort && finalSort !== 'published_at_desc') {
        current.set('sort', finalSort);
      } else {
        current.delete('sort');
      }

      if (finalAvailability && finalAvailability !== 'semua') {
        current.set('availability', finalAvailability);
      } else {
        current.delete('availability');
      }

      // Reset to page 1 on any filter change
      current.delete('page');

      const search = current.toString();
      const targetUrl = search ? `${pathname}?${search}` : pathname;
      router.push(targetUrl);
    });
  };

  const handleSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyParams({ q: query });
  };

  const handleApplyDraft = () => {
    applyParams({
      tag: draftTag,
      sort: draftSort,
      availability: draftAvailability,
    });
    setIsOpen(false);
    setTagSearch('');
    filterButtonRef.current?.focus();
  };

  const handleResetFilters = () => {
    setDraftTag('');
    setDraftSort('published_at_desc');
    setDraftAvailability('');
    setTagSearch('');
    applyParams({
      tag: '',
      sort: 'published_at_desc',
      availability: '',
    });
    setIsOpen(false);
    filterButtonRef.current?.focus();
  };

  // Draft equals currently applied filters?
  const isDraftUnchanged =
    draftTag === (initialTag || '') &&
    draftSort === (initialSort || 'published_at_desc') &&
    (draftAvailability || '') === (initialAvailability || '');

  const isApplyDisabled = isDraftUnchanged || isPending;

  // Reset filter disabled when no filter is applied AND draft is empty/default
  const hasAppliedFilters = isTagActive || isSortActive || isAvailabilityActive;
  const hasDraftFilters =
    Boolean(draftTag) ||
    (draftSort && draftSort !== 'published_at_desc') ||
    Boolean(draftAvailability);
  const isResetDisabled = !hasAppliedFilters && !hasDraftFilters;

  // Active filter label helpers for chips
  const activeSortLabel = SORT_LABELS[initialSort as ContentSort] || initialSort;
  const activeTagObj = tags.find((t) => t.slug === initialTag);
  const activeTagName = activeTagObj ? activeTagObj.name : initialTag;
  const activeAvailabilityLabel =
    initialAvailability === 'aktif' ? 'Aktif' : initialAvailability === 'berakhir' ? 'Berakhir' : '';

  const filteredTags = tagSearch.trim()
    ? tags.filter((t) => t.name.toLowerCase().includes(tagSearch.trim().toLowerCase()))
    : tags;

  return (
    <div className="mb-6 space-y-3">
      {/* Search Input + Filter Button Bar */}
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <form onSubmit={handleSubmitSearch} className="flex-1 relative">
          <label htmlFor="content-search" className="sr-only">
            Cari informasi
          </label>
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" aria-hidden="true" />
          </div>
          <input
            id="content-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari judul, kata kunci, atau penyelenggara..."
            className="w-full pl-10 pr-11 py-2.5 min-h-[44px] rounded-xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors motion-reduce:transition-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                applyParams({ q: '' });
              }}
              className="absolute inset-y-0 right-0 min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-r-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 transition-colors motion-reduce:transition-none"
              aria-label="Hapus kata kunci pencarian"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </form>

        {/* Filter Trigger Button & Popup */}
        <div className="relative">
          <button
            ref={filterButtonRef}
            type="button"
            onClick={() => (isOpen ? closePanel() : openPanel())}
            aria-expanded={isOpen}
            aria-haspopup="dialog"
            className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <SlidersHorizontal className="w-4 h-4 text-slate-600" aria-hidden="true" />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span
                data-testid="filter-count-badge"
                className="min-w-[20px] h-5 px-1.5 rounded-full bg-gold-400 text-brand-950 text-xs font-bold flex items-center justify-center"
              >
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Dialog: Mobile Bottom Sheet Backdrop (<sm) */}
          {isOpen && (
            <div
              className="fixed inset-0 bg-slate-900/50 z-40 sm:hidden transition-opacity motion-reduce:transition-none"
              onClick={closePanel}
              aria-hidden="true"
            />
          )}

          {/* Dialog: Popover on Desktop / Bottom Sheet on Mobile */}
          {isOpen && (
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="filter-dialog-title"
              tabIndex={-1}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] flex flex-col rounded-t-2xl bg-white shadow-2xl sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 sm:max-h-[min(640px,calc(100vh-160px))] sm:rounded-2xl sm:border sm:border-slate-200 sm:shadow-xl transition-opacity transition-transform motion-reduce:transition-none focus:outline-none"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 pb-3 border-b border-slate-100 flex-shrink-0">
                <h2 id="filter-dialog-title" className="text-base font-bold text-slate-900">
                  Filter Konten
                </h2>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={closePanel}
                  className="min-h-[44px] min-w-[44px] rounded-lg text-slate-400 hover:text-slate-600 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 transition-colors motion-reduce:transition-none"
                  aria-label="Tutup filter"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="p-4 sm:p-5 py-3 overflow-y-auto overflow-x-hidden flex-1 min-h-0 space-y-5">
                {/* Status Section */}
                <fieldset>
                  <legend className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Status
                  </legend>
                  <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
                    {AVAILABILITY_OPTIONS.map((opt) => {
                      const isSelected = (draftAvailability || '') === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setDraftAvailability(opt.value)}
                          aria-pressed={isSelected}
                          className={`min-h-[44px] py-2 px-3 text-xs font-semibold rounded-lg transition-colors motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                            isSelected
                              ? 'bg-white text-brand-900 shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                {/* Sort Section */}
                <fieldset>
                  <legend className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Urutkan
                  </legend>
                  <div className="space-y-1.5">
                    {CONTENT_SORTS.map((sortKey) => {
                      const isSelected = draftSort === sortKey;
                      return (
                        <button
                          key={sortKey}
                          type="button"
                          onClick={() => setDraftSort(sortKey)}
                          aria-pressed={isSelected}
                          className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-left text-xs font-medium border flex items-center justify-between transition-colors motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                            isSelected
                              ? 'border-brand-500 bg-brand-50 text-brand-900 font-semibold'
                              : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span>{SORT_LABELS[sortKey]}</span>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-brand-600" aria-hidden="true" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                {/* Tag Section (ALWAYS rendered) */}
                <fieldset>
                  <legend className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Tagar
                  </legend>
                  {tags.length === 0 ? (
                    <p className="text-xs text-slate-500 py-2 italic">
                      Belum ada tagar untuk kategori ini.
                    </p>
                  ) : (
                    <>
                      {tags.length > 12 && (
                        <div className="relative mb-2.5">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Search className="w-3.5 h-3.5" aria-hidden="true" />
                          </div>
                          <input
                            type="search"
                            value={tagSearch}
                            onChange={(e) => setTagSearch(e.target.value)}
                            placeholder="Cari tagar..."
                            aria-label="Cari tagar"
                            className="w-full pl-8 pr-8 py-2 min-h-[40px] text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:bg-white transition-colors motion-reduce:transition-none"
                          />
                          {tagSearch && (
                            <button
                              type="button"
                              onClick={() => setTagSearch('')}
                              className="absolute inset-y-0 right-0 min-w-[36px] min-h-[40px] flex items-center justify-center text-slate-400 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 transition-colors motion-reduce:transition-none"
                              aria-label="Hapus pencarian tagar"
                            >
                              <X className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      )}

                      <div
                        className={`flex flex-wrap gap-1.5 p-0.5 ${
                          tags.length > 12 ? 'max-h-44 overflow-y-auto' : ''
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setDraftTag('')}
                          aria-pressed={!draftTag}
                          className={`min-h-[44px] px-3.5 py-2 rounded-full text-xs font-medium transition-colors border motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                            !draftTag
                              ? 'bg-brand-900 border-brand-900 text-white font-semibold shadow-sm'
                              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400'
                          }`}
                        >
                          Semua Tagar
                        </button>
                        {filteredTags.map((t) => {
                          const isSelected = draftTag === t.slug;
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setDraftTag(t.slug)}
                              aria-pressed={isSelected}
                              className={`min-h-[44px] px-3.5 py-2 rounded-full text-xs font-medium transition-colors border motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                                isSelected
                                  ? 'bg-brand-900 border-brand-900 text-white font-semibold shadow-sm'
                                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400'
                              }`}
                            >
                              #{t.name}
                            </button>
                          );
                        })}
                        {tags.length > 12 && filteredTags.length === 0 && (
                          <p className="text-xs text-slate-500 py-2 italic w-full">
                            Tidak ada tagar yang cocok dengan &ldquo;{tagSearch}&rdquo;.
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </fieldset>
              </div>

              {/* Sticky Footer Actions */}
              <div className="p-4 sm:p-5 pt-3 border-t border-slate-100 flex-shrink-0 bg-white flex items-center gap-3">
                <button
                  type="button"
                  disabled={isResetDisabled}
                  onClick={handleResetFilters}
                  className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  Reset filter
                </button>
                <button
                  type="button"
                  disabled={isApplyDisabled}
                  onClick={handleApplyDraft}
                  className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-950 text-white text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors motion-reduce:transition-none shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  Terapkan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Filter Chips (Removable: tag, sort, availability) */}
      {hasAppliedFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1" aria-label="Filter yang aktif">
          {activeAvailabilityLabel && (
            <span className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 min-h-[32px] rounded-full bg-gold-50 border border-gold-300 text-brand-950 text-xs font-medium">
              <span>Status: {activeAvailabilityLabel}</span>
              <button
                type="button"
                onClick={() => applyParams({ availability: '' })}
                className="min-w-[24px] min-h-[24px] rounded-full hover:bg-gold-200/60 flex items-center justify-center text-brand-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 transition-colors motion-reduce:transition-none"
                aria-label="Hapus filter status"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </span>
          )}

          {isTagActive && (
            <span className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 min-h-[32px] rounded-full bg-brand-50 border border-brand-200 text-brand-900 text-xs font-medium">
              <span>#{activeTagName}</span>
              <button
                type="button"
                onClick={() => applyParams({ tag: '' })}
                className="min-w-[24px] min-h-[24px] rounded-full hover:bg-brand-100 flex items-center justify-center text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 transition-colors motion-reduce:transition-none"
                aria-label={`Hapus filter tagar ${activeTagName}`}
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </span>
          )}

          {isSortActive && (
            <span className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 min-h-[32px] rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
              <span>Urut: {activeSortLabel}</span>
              <button
                type="button"
                onClick={() => applyParams({ sort: 'published_at_desc' })}
                className="min-w-[24px] min-h-[24px] rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 transition-colors motion-reduce:transition-none"
                aria-label="Hapus filter urutan"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
