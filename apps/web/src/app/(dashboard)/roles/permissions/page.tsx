'use client';

import React, { Suspense } from 'react';
import RolePermissionsClient from '../[id]/permissions/RolePermissionsClient';

export default function RolePermissionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RolePermissionsClient />
    </Suspense>
  );
}
