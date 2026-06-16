'use client';

import { FilterCalculator } from '@/components/FilterCalculator';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-4 px-4">
      <div className="max-w-4xl mx-auto">
        <FilterCalculator />
      </div>
    </main>
  );
}
