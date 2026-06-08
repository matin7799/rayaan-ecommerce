'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CreditCard, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function DigipayBanner() {
  return (
    <div dir="rtl" className="w-full">
      <div className="relative overflow-hidden rounded-3xl border border-sky-500/20 bg-zinc-950 p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        {/* Futuristic Grid Overlay Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Floating background glowing ambient elements */}
        <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-sky-500/20 blur-[80px]" />
        <div className="absolute -right-16 -bottom-16 h-48 w-48 rounded-full bg-indigo-500/20 blur-[80px]" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Text and Title Container */}
          <div className="flex-1 text-center lg:text-right space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-xs font-black text-sky-400">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>پیشنهاد ویژه خرید اعتباری</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
              لذت خرید اقساطی آسان با اعتبار دیجی‌پی
            </h2>
            
            <p className="text-sm md:text-base text-zinc-400 leading-relaxed font-medium">
              هر چه می‌خواهی بخر، بعدا پرداخت کن! بدون نیاز به ضامن و وثیقه، در کمتر از ۱۰ دقیقه به‌صورت آنلاین اعتبار بگیرید و اقساطی تسویه کنید.
            </p>

            {/* Benefit quick feature bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              {[
                { icon: CreditCard, title: 'تا ۵۰ میلیون تومان', sub: 'سقف اعتبار فوری' },
                { icon: Clock, title: 'بازپرداخت ۱۸ ماهه', sub: 'اقساط بلندمدت منعطف' },
                { icon: CheckCircle2, title: 'فعال‌سازی تمام آنلاین', sub: 'بدون نیاز به ضامن و چک' },
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-3 p-3.5 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md hover:border-white/10 transition-colors"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-zinc-200">{item.title}</div>
                    <div className="text-[10px] text-zinc-500 font-bold mt-0.5">{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action CTAs Block */}
          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-4 w-full sm:w-auto">
            <Link
              href="/products"
              className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 px-8 py-4.5 text-sm font-black text-white shadow-xl shadow-sky-500/20 active:scale-95 transition-all text-center"
            >
              <span>مشاهده و خرید کالاها</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-[-4px] transition-transform duration-300" />
            </Link>

            <a
              href="https://www.mydigipay.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 px-8 py-4.5 text-sm font-black text-zinc-300 hover:text-white transition-all text-center"
            >
              <span>ثبت‌نام و دریافت اعتبار دیجی‌پی</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
