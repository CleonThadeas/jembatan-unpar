import type { Metadata } from 'next';
import { DemoCenter } from '@/components/demo/DemoCenter';

export const metadata: Metadata = { title: 'Pusat Demo' };
export default function DemoPage() { return <DemoCenter />; }
