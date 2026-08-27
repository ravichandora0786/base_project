'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider } from 'next-themes';
import { store, persistor } from './index';
import { ConfirmationProvider } from '@/components/ui/confirmationModal';

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false}>
          <ConfirmationProvider>
            {children}
          </ConfirmationProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
