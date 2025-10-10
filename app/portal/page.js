'use client';

import { Suspense } from 'react';
import PortalClient from './PortalClient';

export default function PortalPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen text-lg text-gray-700">
          Cargando portal de empleos...
        </div>
      }
    >
      <PortalClient />
    </Suspense>
  );
}
