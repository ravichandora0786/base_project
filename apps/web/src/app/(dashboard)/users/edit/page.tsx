'use client';

import React, { Suspense } from 'react';
import AddEditUserComponent from '../components/AddEditUserComponent';
import { useSearchParams } from 'next/navigation';

function EditUserContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  return <AddEditUserComponent userId={id} isEdit={true} />;
}

export default function EditUser() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <EditUserContent />
    </Suspense>
  );
}
