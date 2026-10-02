import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TagList, TAG_VARIANTS, getTagVariant } from '../TagList';
import { Tag } from '@/types/content';

describe('TagList Component', () => {
  const mockTags: Tag[] = [
    { id: 'tag-1', name: 'Pendidikan', slug: 'pendidikan' },
    { id: 'tag-2', name: 'Prestasi', slug: 'prestasi' },
    { id: 'tag-3', name: 'Nasional', slug: 'nasional' },
    { id: 'tag-4', name: 'Teknologi', slug: 'teknologi' },
  ];

  it('renders nothing when tags array is empty or undefined', () => {
    const { container: emptyContainer } = render(<TagList tags={[]} categorySlug="beasiswa" />);
    expect(emptyContainer.firstChild).toBeNull();

    const { container: undefContainer } = render(<TagList categorySlug="beasiswa" />);
    expect(undefContainer.firstChild).toBeNull();
  });

  it('renders each tag with a "#" prefix and correct link destination with encoded slug', () => {
    render(<TagList tags={mockTags} categorySlug="beasiswa" />);

    const link1 = screen.getByRole('link', { name: /#?Pendidikan/i });
    expect(link1).toHaveAttribute('href', '/beasiswa?tag=pendidikan');
    expect(link1).toHaveTextContent('#Pendidikan');

    const link2 = screen.getByRole('link', { name: /#?Prestasi/i });
    expect(link2).toHaveAttribute('href', '/beasiswa?tag=prestasi');
    expect(link2).toHaveTextContent('#Prestasi');
  });

  it('encodes special characters in tag slugs for query parameters', () => {
    const specialTags: Tag[] = [{ id: 'tag-s1', name: 'S&T / AI', slug: 's&t / ai' }];
    render(<TagList tags={specialTags} categorySlug="event" />);

    const link = screen.getByRole('link', { name: /#?S&T \/ AI/i });
    expect(link).toHaveAttribute('href', '/event?tag=s%26t%20%2F%20ai');
  });

  it('applies varied variant classes that differ across consecutive tags', () => {
    render(<TagList tags={mockTags} categorySlug="beasiswa" />);

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(4);

    // Verify first and second tags have different background / border styling
    expect(links[0].className).not.toEqual(links[1].className);
    expect(links[0].className).toContain('bg-brand-50');
    expect(links[1].className).toContain('bg-gold-50');
    expect(links[2].className).toContain('bg-white');
    expect(links[3].className).toContain('bg-surface-50');
  });

  it('ensures each tag pill satisfies touch target height >= 32px and focus-visible styling', () => {
    render(<TagList tags={mockTags} categorySlug="beasiswa" />);

    const links = screen.getAllByRole('link');
    for (const link of links) {
      expect(link.className).toContain('min-h-[32px]');
      expect(link.className).toContain('rounded-full');
      expect(link.className).toContain('focus-visible:ring-2');
    }
  });

  it('getTagVariant returns deterministic styles based on index or slug hash', () => {
    expect(getTagVariant('test', 0)).toEqual(TAG_VARIANTS[0]);
    expect(getTagVariant('test', 1)).toEqual(TAG_VARIANTS[1]);
    expect(getTagVariant('test', 2)).toEqual(TAG_VARIANTS[2]);
    expect(getTagVariant('test', 3)).toEqual(TAG_VARIANTS[3]);
    expect(getTagVariant('test', 4)).toEqual(TAG_VARIANTS[0]);
  });
});
