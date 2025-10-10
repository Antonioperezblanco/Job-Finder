'use client';

import { Suspense } from 'react';
import ResultClient from './resultClient';

export default function ResultPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen text-lg text-gray-700">
          Cargando resultados...
        </div>
      }
    >
      <ResultClient />
    </Suspense>
  );
}
