import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import '@/styles/globals.css';
import { DirectionProvider } from '@base-ui/react';
import localFont from 'next/font/local';
import { Providers } from '@/components/providers';

const yekanBakh = localFont({
  src: '../../public/fonts/YekanBakh-VF.woff2',
  variable: '--font-yekan',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'فروشگاه اینترنتی | پلتفرم مدرن',
  description: 'تجربه خریدی نوین با پلتفرم تجارت الکترونیک ما',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa-IR" dir="rtl" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${yekanBakh.variable} antialiased`}>
        {/* تکسچر نویز برای پس زمینه */}
        <div className="fixed inset-0 z-[-1] bg-dots opacity-[0.03] dark:opacity-[0.05] pointer-events-none"></div>

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <DirectionProvider direction="rtl">
            <Providers>{children}</Providers>
          </DirectionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
