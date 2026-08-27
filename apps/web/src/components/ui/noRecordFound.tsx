import React from 'react';

export default function NoRecordFoundComponent() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in">
      <div className="mb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/no-records.png"
          alt="No Records Found"
          className="w-90 h-auto object-contain mx-auto mix-blend-multiply dark:mix-blend-normal"
        />
      </div>
    </div>
  );
}
