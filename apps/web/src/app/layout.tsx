import { BreadcrumbsContainer } from '@/components/shared/breadcrumbs/BreadcrumbsContainer';
import { NavigationMenu } from '@/components/shared/sidebar/NavigationMenu';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import { Header } from '@components/authentication/Header';
import { SignedOutView } from '@components/authentication/_signed-out/View';
import { SidebarInset, SidebarProvider } from '@repo/ui/components/ui/sidebar';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type React from 'react';
import Providers from './providers';

import '@repo/ui/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Misfits AI',
  description:
    'AI-powered building health analysis from Certificate of Occupancy data',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <div className="flex-1">
              <SignedOut>
                <SignedOutView />
              </SignedOut>
              <SignedIn>
                <SidebarProvider defaultOpen={false}>
                  <div className="flex min-h-screen w-full">
                    <NavigationMenu />
                    <main className="flex-1 overflow-auto w-full">
                      <SidebarInset className="relative w-full">
                        <header className="flex h-16 shrink-0 items-center px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                          <BreadcrumbsContainer />
                        </header>
                        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full">
                          {children}
                        </div>
                      </SidebarInset>
                    </main>
                  </div>
                </SidebarProvider>
              </SignedIn>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
