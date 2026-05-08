import { Laptop, Gamepad2, Smartphone, Monitor, Printer, ShieldCheck, Wrench, Handshake, CheckCircle2 } from "lucide-react"

export const metadata = {
  title: "درباره ما | رایان‌تک یزد",
  description: "آشنایی با فروشگاه رایان‌تک یزد، واردکننده مستقیم لپ‌تاپ و تجهیزات دیجیتال",
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">🏢 درباره <span className="text-primary">رایان‌تک یزد</span></h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed">
          رایان‌تک یزد یک مرکز تخصصی در حوزه فروش و تأمین انواع دستگاه‌های دیجیتال است. ما به عنوان واردکننده و عرضه‌کننده مستقیم محصولات دیجیتال تلاش می‌کنیم تا بهترین کیفیت را با مناسب‌ترین قیمت در اختیار شما قرار دهیم.
        </p>
      </section>

      {/* Products Grid */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: Laptop, label: "لپ‌تاپ" },
          { icon: Gamepad2, label: "کنسول بازی" },
          { icon: Smartphone, label: "موبایل" },
          { icon: Monitor, label: "آل‌این‌وان" },
          { icon: Printer, label: "پرینتر" },
        ].map((item, index) => (
          <div key={index} className="flex flex-col items-center justify-center p-6 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-3xl border border-zinc-100 dark:border-zinc-800 hover:border-primary/50 transition-colors">
            <item.icon className="w-10 h-10 mb-3 text-primary" />
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{item.label}</span>
          </div>
        ))}
      </section>

      {/* Why Us Section */}
      <section className="bg-primary/5 rounded-[3rem] p-8 md:p-12 border border-primary/10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">چرا لپ‌تاپ‌های رایان‌تک ارزان‌تر است؟ 🤔</h2>
            <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
              خیلی‌ها می‌پرسند دلیل این تفاوت قیمت چیست؟ آیا دستگاه‌ها مشکلی دارند؟ اصلاً اینطور نیست! دلیل اصلی این است که ما دستگاه‌ها را <strong>به صورت مستقیم و بدون واسطه</strong> وارد می‌کنیم.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                <span>محصولات شامل دستگاه‌های استوک، اپن‌باکس و آکبند با ضمانت قیمت.</span>
              </li>
              <li className="flex items-start gap-3">
                <Wrench className="w-6 h-6 text-emerald-500 shrink-0" />
                <span>۳ مرحله تست سخت‌گیرانه فنی (سلامت صفحه‌نمایش، باتری، هارد) قبل از تحویل.</span>
              </li>
              <li className="flex items-start gap-3">
                <Handshake className="w-6 h-6 text-emerald-500 shrink-0" />
                <span>امکان خرید با شرایط اقساطی و کمترین کارمزد.</span>
              </li>
            </ul>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm flex gap-4 items-center">
              <ShieldCheck className="w-12 h-12 text-primary" />
              <div>
                <h3 className="font-bold text-lg">پشتیبانی واقعی</h3>
                <p className="text-sm text-zinc-500">ما می‌خواهیم رفیق تکنولوژی شما باشیم.</p>
              </div>
            </div>
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm flex gap-4 items-center">
              <span className="text-4xl">💎</span>
              <div>
                <h3 className="font-bold text-lg">فقط محصولات باکیفیت</h3>
                <p className="text-sm text-zinc-500">دستگاه‌هایی که خودمان حاضر باشیم با آن‌ها کار کنیم!</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
