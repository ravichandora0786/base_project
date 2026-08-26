'use client';

import React, { useEffect } from 'react';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { useAppSelector } from '@/store';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    const loggedIn = Cookies.get('logged_in') === 'true';
    if (isAuthenticated && loggedIn) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4">
      <LoginForm />
    </div>
  );
}
