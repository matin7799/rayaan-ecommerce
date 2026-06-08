import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "حریم خصوصی",
  description: "سیاست‌ها و شرایط مربوط به حفظ حریم خصوصی کاربران",
};

export default function PrivacyPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-background">
      <section className="container mx-auto max-w-4xl px-4 py-10 md:py-16">
        <div className="rounded-2xl border bg-card p-6 shadow-sm md:p-10">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              حریم خصوصی
            </h1>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              آخرین به‌روزرسانی: ۲۳ اردیبهشت ۱۴۰۵
            </p>
          </header>

          <div className="space-y-8 text-sm leading-8 text-muted-foreground md:text-base">
            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                ۱. مقدمه
              </h2>
              <p>
                حفظ حریم خصوصی کاربران برای ما اهمیت زیادی دارد. این صفحه توضیح
                می‌دهد که چه اطلاعاتی از کاربران جمع‌آوری می‌شود، چگونه از آن
                استفاده می‌کنیم و کاربران چه حقوقی در رابطه با اطلاعات خود
                دارند.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                ۲. اطلاعاتی که جمع‌آوری می‌کنیم
              </h2>
              <p>
                بسته به نحوه استفاده شما از سرویس، ممکن است اطلاعات زیر
                جمع‌آوری شود:
              </p>
              <ul className="mt-3 list-inside list-disc space-y-2">
                <li>اطلاعات هویتی مانند نام و نام خانوادگی</li>
                <li>اطلاعات تماس مانند شماره موبایل یا ایمیل</li>
                <li>اطلاعات مربوط به سفارش‌ها، خریدها یا درخواست‌ها</li>
                <li>اطلاعات فنی مانند نوع مرورگر، دستگاه، IP و زمان مراجعه</li>
                <li>اطلاعات مربوط به تعامل شما با صفحات و امکانات سایت</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                ۳. نحوه استفاده از اطلاعات
              </h2>
              <p>
                اطلاعات جمع‌آوری‌شده برای اهداف زیر استفاده می‌شود:
              </p>
              <ul className="mt-3 list-inside list-disc space-y-2">
                <li>ایجاد و مدیریت حساب کاربری</li>
                <li>پردازش سفارش‌ها و ارائه خدمات</li>
                <li>بهبود کیفیت خدمات و تجربه کاربری</li>
                <li>پشتیبانی و پاسخ‌گویی به درخواست‌های کاربران</li>
                <li>افزایش امنیت سرویس و جلوگیری از سوءاستفاده</li>
                <li>ارسال اطلاع‌رسانی‌های ضروری مرتبط با سرویس</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                ۴. کوکی‌ها و فناوری‌های مشابه
              </h2>
              <p>
                ممکن است برای بهبود تجربه کاربری، ذخیره تنظیمات، تحلیل رفتار
                کاربران و افزایش امنیت از کوکی‌ها یا فناوری‌های مشابه استفاده
                کنیم. کاربران می‌توانند از طریق تنظیمات مرورگر خود، کوکی‌ها را
                مدیریت یا غیرفعال کنند؛ با این حال، غیرفعال‌سازی کوکی‌ها ممکن
                است باعث اختلال در برخی امکانات سایت شود.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                ۵. اشتراک‌گذاری اطلاعات با اشخاص ثالث
              </h2>
              <p>
                ما اطلاعات شخصی کاربران را به فروش نمی‌رسانیم. با این حال، در
                موارد ضروری ممکن است اطلاعات با ارائه‌دهندگان خدمات فنی، پرداخت،
                ارسال، پشتیبانی یا مراجع قانونی و صرفاً در چارچوب نیاز و قانون
                به اشتراک گذاشته شود.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                ۶. امنیت اطلاعات
              </h2>
              <p>
                ما تلاش می‌کنیم با استفاده از روش‌های فنی و مدیریتی مناسب، از
                اطلاعات کاربران در برابر دسترسی غیرمجاز، تغییر، افشا یا حذف
                غیرمجاز محافظت کنیم. با این حال، هیچ روش انتقال یا ذخیره‌سازی
                اطلاعات در اینترنت به‌صورت کامل و صددرصد امن نیست.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                ۷. نگهداری اطلاعات
              </h2>
              <p>
                اطلاعات کاربران تا زمانی نگهداری می‌شود که برای ارائه خدمات،
                انجام تعهدات قانونی، حل اختلافات، جلوگیری از سوءاستفاده یا
                اجرای توافق‌ها مورد نیاز باشد. پس از پایان نیاز، اطلاعات ممکن
                است حذف یا ناشناس‌سازی شود.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                ۸. حقوق کاربران
              </h2>
              <p>
                کاربران می‌توانند در چارچوب قوانین قابل اعمال، درخواست دسترسی،
                اصلاح، به‌روزرسانی یا حذف اطلاعات خود را ثبت کنند. همچنین
                کاربران می‌توانند در برخی موارد نسبت به پردازش اطلاعات خود
                اعتراض کنند یا محدودسازی آن را درخواست نمایند.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                ۹. اطلاعات کودکان
              </h2>
              <p>
                خدمات ما برای استفاده مستقیم کودکان بدون نظارت والدین طراحی
                نشده است. در صورتی که متوجه شویم اطلاعات شخصی کودک بدون رضایت
                والدین جمع‌آوری شده، اقدامات لازم برای حذف آن انجام خواهد شد.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                ۱۰. تغییرات در این سیاست
              </h2>
              <p>
                ممکن است این سیاست حریم خصوصی در آینده به‌روزرسانی شود. نسخه
                جدید از طریق همین صفحه منتشر خواهد شد و تاریخ آخرین به‌روزرسانی
                در بالای صفحه درج می‌شود.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                ۱۱. تماس با ما
              </h2>
              <p>
                اگر درباره این سیاست حریم خصوصی یا نحوه پردازش اطلاعات خود
                پرسشی دارید، می‌توانید از طریق بخش پشتیبانی یا راه‌های ارتباطی
                اعلام‌شده در سایت با ما تماس بگیرید.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
