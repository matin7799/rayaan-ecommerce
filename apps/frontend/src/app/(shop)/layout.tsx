import Footer from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { StorySectionWrapper } from '@/components/shop/story-section-wrapper';
import { Suspense } from 'react';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="mt-20">
        <Suspense fallback={null}>
          <StorySectionWrapper />
        </Suspense>
      </div>
      <main className="md:mx-10 pt-4">
        {children}
      </main>
      <Footer />
      <MobileBottomNav />
    </>
  );
}
