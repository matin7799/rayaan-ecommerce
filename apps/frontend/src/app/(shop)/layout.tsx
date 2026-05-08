import Footer from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { StorySectionWrapper } from '@/components/shop/story-section-wrapper';
import { Suspense } from 'react';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <Suspense fallback={null}>
        <StorySectionWrapper />
      </Suspense>
      <main className="mx-10 pt-24">
        {children}
      </main>
      <Footer />
      <MobileBottomNav />
    </>
  );
}
