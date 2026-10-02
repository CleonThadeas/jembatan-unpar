import React from 'react';
import { Content } from '@/types/content';
import { ContentCard } from './ContentCard';

interface ContentGridProps {
  contents: Content[];
}

export function ContentGrid({ contents }: ContentGridProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {contents.map((content) => (
        <ContentCard key={content.id} content={content} />
      ))}
    </div>
  );
}
