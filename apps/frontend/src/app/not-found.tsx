'use client'; // ✅ اضافه شده

import Link from 'next/link';
import { Home, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-gray-900">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-gray-700">
          صفحه مورد نظر یافت نشد
        </h2>
        <p className="mb-8 text-gray-600">
          متأسفانه صفحه‌ای که دنبال آن هستید وجود ندارد.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/">
            <button className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700">
              <Home className="h-5 w-5" />
              بازگشت به خانه
            </button>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <ArrowRight className="h-5 w-5" />
            بازگشت به صفحه قبل
          </button>
        </div>
      </div>
    </div>
  );
}
