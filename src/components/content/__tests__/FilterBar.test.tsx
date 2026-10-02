import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterBar } from '../FilterBar';
import { Tag } from '@/types/content';

const mockPush = vi.fn();
const mockPathname = '/beasiswa';
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}));

describe('FilterBar Component', () => {
  const sampleTags: Tag[] = [
    { id: '1', name: 'Riset', slug: 'riset' },
    { id: '2', name: 'Prestasi', slug: 'prestasi' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  it('renders search input and single Filter button with no active count badge when default', () => {
    render(<FilterBar tags={sampleTags} />);

    expect(
      screen.getByPlaceholderText('Cari judul, kata kunci, atau penyelenggara...')
    ).toBeInTheDocument();

    const filterBtn = screen.getByRole('button', { name: /^filter/i });
    expect(filterBtn).toBeInTheDocument();
    expect(screen.queryByTestId('filter-count-badge')).not.toBeInTheDocument();
  });

  it('shows gold active count badge when filters are active', () => {
    render(
      <FilterBar
        tags={sampleTags}
        initialTag="riset"
        initialSort="views_desc"
        initialAvailability="aktif"
      />
    );

    const badge = screen.getByTestId('filter-count-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('3');
  });

  it('submits search query on form submit', () => {
    render(<FilterBar tags={sampleTags} initialQuery="" />);

    const searchInput = screen.getByPlaceholderText('Cari judul, kata kunci, atau penyelenggara...');
    fireEvent.change(searchInput, { target: { value: 'prestasi' } });

    fireEvent.submit(searchInput.closest('form')!);
    expect(mockPush).toHaveBeenCalledWith('/beasiswa?q=prestasi');
  });

  it('clears query when X button in search box is clicked', () => {
    render(<FilterBar tags={sampleTags} initialQuery="prestasi" />);

    const clearBtn = screen.getByRole('button', { name: /hapus kata kunci pencarian/i });
    fireEvent.click(clearBtn);
    expect(mockPush).toHaveBeenCalledWith('/beasiswa');
  });

  it('opens dialog panel on click, moves focus, and closes on Escape key', () => {
    render(<FilterBar tags={sampleTags} />);

    const filterBtn = screen.getByRole('button', { name: /^filter/i });
    fireEvent.click(filterBtn);

    const dialog = screen.getByRole('dialog', { name: /filter konten/i });
    expect(dialog).toBeInTheDocument();

    // Escape closes dialog
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('manages draft state and disabled states for Terapkan and Reset filter', () => {
    render(<FilterBar tags={sampleTags} />);

    const filterBtn = screen.getByRole('button', { name: /^filter/i });
    fireEvent.click(filterBtn);

    const applyBtn = screen.getByRole('button', { name: /terapkan/i });
    const resetBtn = screen.getByRole('button', { name: /reset filter/i });

    // Initially unchanged and default: Terapkan and Reset are disabled
    expect(applyBtn).toBeDisabled();
    expect(resetBtn).toBeDisabled();

    // Select Status "Aktif"
    const aktifBtn = screen.getByRole('button', { name: /^aktif$/i });
    fireEvent.click(aktifBtn);

    // Now draft is changed: Terapkan and Reset become enabled
    expect(applyBtn).not.toBeDisabled();
    expect(resetBtn).not.toBeDisabled();
  });

  it('applies draft filter changes including availability and pushes correct URL', () => {
    mockSearchParams = new URLSearchParams('page=2&q=djarum');
    render(<FilterBar tags={sampleTags} initialQuery="djarum" />);

    // Open filter dialog
    const filterBtn = screen.getByRole('button', { name: /^filter/i });
    fireEvent.click(filterBtn);

    // Pick Status "Aktif"
    const aktifBtn = screen.getByRole('button', { name: /^aktif$/i });
    fireEvent.click(aktifBtn);

    // Pick Sort "Paling Populer"
    const populerBtn = screen.getByRole('button', { name: /paling populer/i });
    fireEvent.click(populerBtn);

    // Pick Tag "#Riset"
    const risetBtn = screen.getByRole('button', { name: /#riset/i });
    fireEvent.click(risetBtn);

    // Click Terapkan
    const applyBtn = screen.getByRole('button', { name: /terapkan/i });
    fireEvent.click(applyBtn);

    // Dialog closes and router.push called with reset page (page=1 omitted)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mockPush).toHaveBeenCalledWith(
      '/beasiswa?q=djarum&tag=riset&sort=views_desc&availability=aktif'
    );
  });

  it('resets filters clearing tag, sort, availability while preserving query', () => {
    mockSearchParams = new URLSearchParams('q=kip&tag=riset&sort=views_desc&availability=berakhir&page=3');
    render(
      <FilterBar
        tags={sampleTags}
        initialQuery="kip"
        initialTag="riset"
        initialSort="views_desc"
        initialAvailability="berakhir"
      />
    );

    const filterBtn = screen.getByRole('button', { name: /^filter/i });
    fireEvent.click(filterBtn);

    const resetBtn = screen.getByRole('button', { name: /reset filter/i });
    expect(resetBtn).not.toBeDisabled();
    fireEvent.click(resetBtn);

    expect(mockPush).toHaveBeenCalledWith('/beasiswa?q=kip');
  });

  it('renders removable filter chips and allows removing individual filters', () => {
    render(
      <FilterBar
        tags={sampleTags}
        initialTag="riset"
        initialAvailability="aktif"
      />
    );

    expect(screen.getByText('Status: Aktif')).toBeInTheDocument();
    expect(screen.getByText('#Riset')).toBeInTheDocument();

    const removeStatusBtn = screen.getByRole('button', { name: /hapus filter status/i });
    fireEvent.click(removeStatusBtn);
    expect(mockPush).toHaveBeenCalledWith('/beasiswa?tag=riset');
  });

  it('always renders Tagar section with empty message when tags array is empty', () => {
    render(<FilterBar tags={[]} />);

    const filterBtn = screen.getByRole('button', { name: /^filter/i });
    fireEvent.click(filterBtn);

    expect(screen.getByText('Tagar')).toBeInTheDocument();
    expect(screen.getByText('Belum ada tagar untuk kategori ini.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /semua tagar/i })).not.toBeInTheDocument();
  });

  it('renders tag chips with # prefix and toggles aria-pressed when selecting', () => {
    render(<FilterBar tags={sampleTags} />);

    const filterBtn = screen.getByRole('button', { name: /^filter/i });
    fireEvent.click(filterBtn);

    const allTagsBtn = screen.getByRole('button', { name: /semua tagar/i });
    const risetBtn = screen.getByRole('button', { name: '#Riset' });
    const prestasiBtn = screen.getByRole('button', { name: '#Prestasi' });

    expect(allTagsBtn).toHaveAttribute('aria-pressed', 'true');
    expect(risetBtn).toHaveAttribute('aria-pressed', 'false');
    expect(prestasiBtn).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(risetBtn);
    expect(allTagsBtn).toHaveAttribute('aria-pressed', 'false');
    expect(risetBtn).toHaveAttribute('aria-pressed', 'true');

    // Re-select "Semua Tagar"
    fireEvent.click(allTagsBtn);
    expect(allTagsBtn).toHaveAttribute('aria-pressed', 'true');
    expect(risetBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('supports tag search inside popup when tags count exceeds 12', () => {
    const manyTags: Tag[] = Array.from({ length: 15 }, (_, i) => ({
      id: `tag-${i + 1}`,
      name: `Tagar ${i + 1}`,
      slug: `tagar-${i + 1}`,
    }));

    render(<FilterBar tags={manyTags} />);

    const filterBtn = screen.getByRole('button', { name: /^filter/i });
    fireEvent.click(filterBtn);

    const searchTagInput = screen.getByPlaceholderText('Cari tagar...');
    expect(searchTagInput).toBeInTheDocument();

    // Filter tags by typing "Tagar 15"
    fireEvent.change(searchTagInput, { target: { value: 'Tagar 15' } });
    expect(screen.getByRole('button', { name: '#Tagar 15' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '#Tagar 2' })).not.toBeInTheDocument();

    // Search non-existent tag
    fireEvent.change(searchTagInput, { target: { value: 'NonExistent' } });
    expect(screen.getByText(/tidak ada tagar yang cocok dengan/i)).toBeInTheDocument();

    // Clear tag search with clear button
    const clearTagSearchBtn = screen.getByRole('button', { name: /hapus pencarian tagar/i });
    fireEvent.click(clearTagSearchBtn);
    expect(searchTagInput).toHaveValue('');
    expect(screen.getByRole('button', { name: '#Tagar 2' })).toBeInTheDocument();
  });

  it('falls back to displaying slug in active filter chip when active tag is not in tag list', () => {
    render(<FilterBar tags={sampleTags} initialTag="alumni-award" />);

    // activeTagName falls back to initialTag slug
    expect(screen.getByText('#alumni-award')).toBeInTheDocument();

    const removeTagBtn = screen.getByRole('button', { name: /hapus filter tagar alumni-award/i });
    fireEvent.click(removeTagBtn);
    expect(mockPush).toHaveBeenCalledWith('/beasiswa');
  });

  it('maintains consistent aria-pressed toggle semantics across status and sort options', () => {
    render(
      <FilterBar
        tags={sampleTags}
        initialAvailability="aktif"
        initialSort="views_desc"
      />
    );

    const filterBtn = screen.getByRole('button', { name: /^filter/i });
    fireEvent.click(filterBtn);

    const aktifBtn = screen.getByRole('button', { name: /^aktif$/i });
    const berakhirBtn = screen.getByRole('button', { name: /^berakhir$/i });
    expect(aktifBtn).toHaveAttribute('aria-pressed', 'true');
    expect(berakhirBtn).toHaveAttribute('aria-pressed', 'false');

    const populerBtn = screen.getByRole('button', { name: /paling populer/i });
    const terbaruBtn = screen.getByRole('button', { name: /terbaru/i });
    expect(populerBtn).toHaveAttribute('aria-pressed', 'true');
    expect(terbaruBtn).toHaveAttribute('aria-pressed', 'false');
  });
});
