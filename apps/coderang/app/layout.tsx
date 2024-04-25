'use client';

import { BootDataProvider } from '@/contexts/boot-provider';
import { BootApp } from '@/lib/boot';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { defaultQueryClientConfig } from '@/lib/query';
import { OnboardingContextProvider } from '@/contexts/onboarding-context';

import '@/styles/globals.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [queryClient] = useState(() => new QueryClient(defaultQueryClientConfig));

  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <BootDataProvider app={BootApp.Webapp}>
            <OnboardingContextProvider>{children} </OnboardingContextProvider>
          </BootDataProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
