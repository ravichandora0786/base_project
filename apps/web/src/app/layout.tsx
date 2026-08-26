import React from 'react';
import type { Metadata } from 'next';
import { ReduxProvider } from '../store/provider';
import { ToastContainer } from 'react-toastify';
import '../styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';

import RouteGuard from '../components/ui/routeGuard';

export const metadata: Metadata = {
  title: 'Base Platform',
  description: 'Enterprise administration system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ReduxProvider>
          <RouteGuard>
            {children}
          </RouteGuard>
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </ReduxProvider>
      </body>
    </html>
  );
}
