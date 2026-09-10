'use client';

import React, { useEffect } from 'react';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { useAppSelector } from '@/store';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function RegisterPage() {
  const { isAuthenticated, isRegistered } = useAppSelector((state) => state?.auth || {}) as any;
  const router = useRouter();

  useEffect(() => {
    const loggedIn = Cookies.get('logged_in') === 'true' || !!Cookies.get('access_token');
    if (isAuthenticated || loggedIn) {
      router.push('/dashboard');
    }
    if (isRegistered) {
      router.push('/login');
    }
  }, [isAuthenticated, isRegistered, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4">
      <RegisterForm />
    </div>
  );
}
