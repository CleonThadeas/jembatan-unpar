import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchEventBySlug, isNotFoundError } from '@/lib/api';
import { getDemoSlugsByCategory } from '@/lib/demo/content-service';
import { safeImageUrl } from '@/lib/utils';
import { ContentDetailPage } from '@/components/content/ContentDetailPage';
import { Content } from '@/types/content';

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  return getDemoSlugsByCategory('EVENT').map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const content = await fetchEventBySlug(params.slug);
    const heroImageUrl = safeImageUrl(content.hero_image_url);
    return {
      title: `${content.title} | Event Kampus`,
      description: content.summary || content.title,
      openGraph: {
        title: content.title,
        description: content.summary,
        type: 'article',
        publishedTime: content.published_at,
        images: heroImageUrl ? [{ url: heroImageUrl }] : [],
      },
    };
  } catch {
    return {
      title: 'Event Kampus',
    };
  }
}

export default async function EventDetailPage({ params }: PageProps): Promise<React.JSX.Element> {
  let content: Content;

  try {
    content = await fetchEventBySlug(params.slug);
  } catch (err: unknown) {
    // Only a real 404 is "not found"; outages surface via app/error.tsx.
    if (isNotFoundError(err)) notFound();
    throw err;
  }

  return <ContentDetailPage content={content} />;
}
