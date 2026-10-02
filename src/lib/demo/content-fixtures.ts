import { Content, Tag } from '@/types/content';
import { DEMO_BEASISWA_ITEMS } from './content-fixtures-beasiswa';
import { DEMO_EVENT_ITEMS } from './content-fixtures-event';
import { DEMO_KEGIATAN_ITEMS } from './content-fixtures-kegiatan';
import { DEMO_PROMOSI_ITEMS } from './content-fixtures-promosi';

export {
  DEMO_BEASISWA_ITEMS,
  DEMO_EVENT_ITEMS,
  DEMO_KEGIATAN_ITEMS,
  DEMO_PROMOSI_ITEMS,
};

export const DEMO_CONTENT_ITEMS: Content[] = [
  ...DEMO_BEASISWA_ITEMS,
  ...DEMO_EVENT_ITEMS,
  ...DEMO_KEGIATAN_ITEMS,
  ...DEMO_PROMOSI_ITEMS,
];

// Extract all unique tags
const tagMap = new Map<string, Tag>();
for (const item of DEMO_CONTENT_ITEMS) {
  if (Array.isArray(item.tags)) {
    for (const tag of item.tags) {
      if (tag && tag.slug && !tagMap.has(tag.slug)) {
        tagMap.set(tag.slug, tag);
      }
    }
  }
}

export const DEMO_TAGS: Tag[] = Array.from(tagMap.values()).sort((a, b) =>
  a.name.localeCompare(b.name, 'id')
);
