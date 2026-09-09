import React from 'react';
import type { Metadata } from 'next';
import { ReduxProvider } from '../store/provider';
import ToastComponent from '../components/ui/toastComponent';
import '../styles/globals.css';

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
          <ToastComponent />
        </ReduxProvider>
      </body>
    </html>
  );
}
