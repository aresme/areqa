import { Suspense } from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { SearchOverlay } from '@/components/layout/SearchOverlay';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import { PageLoader } from '@/components/PageLoader';
import { QuickAddProvider } from '@/components/product/QuickAddContext';
import { Toaster } from '@/components/ui/Toaster';

export function StoreLayout() {
  return (
    <QuickAddProvider>
      <div className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="bg-paper sr-only z-[70] px-4 py-2 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <AnnouncementBar />
        <Header />
        <main id="main" className="flex-1">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
        <Footer />
        <WhatsAppButton />
        <MobileMenu />
        <SearchOverlay />
        <CartDrawer />
        <Toaster />
        <ScrollRestoration getKey={(loc) => loc.pathname} />
      </div>
    </QuickAddProvider>
  );
}
