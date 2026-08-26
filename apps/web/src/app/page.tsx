'use client';

import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full space-y-8 text-center bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div>
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Next-Nest Stack
          </h2>
          <p className="mt-3 text-sm text-gray-500">
            A production-ready Monorepo Boilerplate with Next.js, NestJS, Prisma, and PostgreSQL.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/login"
            className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-primary-650 hover:bg-primary-700 transition duration-200"
          >
            Go to Login
          </Link>
          
          <Link
            href="/register"
            className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition duration-200"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
