'use client';

import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { loginSchema } from '../schemas/auth.schema';
import { useAppDispatch, useAppSelector } from '../../../store';
import { loginStart, clearError } from '../store/auth.slice';
import { FaFacebook, FaGoogle } from 'react-icons/fa';
import { FiEyeOff, FiEye } from 'react-icons/fi';
import Link from 'next/link';
import LoadingButton from '@/components/ui/loadingButton';

export function LoginForm() {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state?.auth || {}) as any;
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  return (
    <div className="w-full max-w-md p-10 bg-[#FCEEA7] text-[#14532D] rounded-[2.5rem] shadow-xl space-y-6 flex flex-col justify-between">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-serif font-semibold tracking-tight text-[#14532D]">Login Now</h2>
      </div>

      {error && (
        <div className="p-3.5 text-xs font-bold text-red-800 bg-red-100/50 border border-red-300 rounded-xl">
          {error}
        </div>
      )}

      <Formik
        initialValues={{ email: 'admin@gmail.com', password: 'Admin@123' }}
        validationSchema={loginSchema}
        onSubmit={(values) => {
          dispatch(loginStart(values));
        }}
      >
        {() => (
          <Form className="space-y-6">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#14532D]">
                Email
              </label>
              <Field
                type="email"
                name="email"
                className="w-full py-1 bg-transparent border-b border-[#14532D] text-[#14532D] focus:outline-none focus:border-[#14532D] transition duration-150 font-semibold"
                placeholder=""
              />
              <ErrorMessage
                name="email"
                component="div"
                className="text-xs text-red-700 font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#14532D]">
                Password
              </label>
              <div className="relative">
                <Field
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="w-full py-1 pr-8 bg-transparent border-b border-[#14532D] text-[#14532D] focus:outline-none focus:border-[#14532D] transition duration-150 font-semibold"
                  placeholder=""
                />
                <LoadingButton
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  variant="custom"
                  className="absolute inset-y-0 right-0 pr-1 flex items-center text-[#14532D] cursor-pointer focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <FiEye className="w-4 h-4" />
                  ) : (
                    <FiEyeOff className="w-4 h-4" />
                  )}
                </LoadingButton>
              </div>
              <ErrorMessage
                name="password"
                component="div"
                className="text-xs text-red-700 font-semibold"
              />
            </div>

            <div className="pt-2">
              <LoadingButton
                type="submit"
                isLoading={isLoading}
                variant="custom"
                className="w-full py-3 bg-[#14532D] hover:bg-[#1B4332] text-[#FCEEA7] font-bold rounded-full shadow-md transition duration-200 flex items-center justify-center disabled:opacity-50"
              >
                Login
              </LoadingButton>
            </div>
          </Form>
        )}
      </Formik>

      <div className="text-center text-xs text-[#14532D] pt-4 font-bold">
        Don&apos;t have an account ?{' '}
        <Link href="/register" className="text-[#14532D] hover:underline font-extrabold ml-1">
          Sign Up
        </Link>
      </div>
    </div>
  );
}
