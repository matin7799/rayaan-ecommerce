import Link from "next/link";
import Image from "next/image";
import { 
  MapPin, 
  Phone, 
  
  HeadphonesIcon, 
  MessageCircle, 
  Send,
  ChevronLeft,
  ShieldCheck
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative w-full bg-white/80 dark:bg-gray-950/80 backdrop-blur-3xl pt-16 pb-28 md:pb-12 mt-20 border-t border-gray-200/50 dark:border-gray-800/50 overflow-hidden">
      
      {/* افکت نوری بالای فوتر */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#008080]/50 to-transparent" />
      
      {/* هاله‌های رنگی پس‌زمینه (Blobs) */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-[#008080]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-[#20B2AA]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative container mx-auto px-4 md:px-8 z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          
          {/* بخش درباره ما */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 shrink-0 ml-2 drop-shadow-sm transition-transform hover:scale-105" title="رایان تِک">
            <Image src="/images/logo-dark.svg" alt="رایان تِک" width={110} height={36} className="dark:hidden object-contain h-8 w-auto md:h-10" priority />
            <Image src="/images/logo-light.svg" alt="رایان تِک" width={110} height={36} className="hidden dark:block object-contain h-8 w-auto md:h-10" priority />
          </Link>
            <p className="text-sm leading-8 text-gray-600 dark:text-gray-400 text-justify">
              واردات مستقیم لپ‌تاپ، موبایل، کنسول بازی، آل‌این‌وان و پرینتر با تضمین بهترین قیمت و کیفیت. 
              ارائه شرایط اقساط ویژه با کمترین کارمزد در دو شعبه فعال استان یزد و ارسال سریع به سراسر ایران.
            </p>
          </div>

          {/* کارت شعبه بلوار جوان */}
          <div className="group relative p-6 rounded-3xl bg-gradient-to-b from-gray-50/50 to-transparent dark:from-gray-900/50 border border-gray-100 dark:border-gray-800/60 hover:shadow-2xl hover:shadow-[#008080]/5 transition-all duration-500">
            <div className="absolute top-0 right-6 w-12 h-1 bg-[#008080] rounded-b-full opacity-50 group-hover:h-2 transition-all duration-300" />
            <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
              <div className="p-2 bg-[#008080]/10 rounded-xl text-[#008080]">
                <MapPin className="w-5 h-5" />
              </div>
              شعبه بلوار جوان
            </h4>
            <address className="not-italic text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              میدان عالم به سمت دانش‌آموز، بعد از پل عابر پیاده
            </address>
            <div className="space-y-3">
              <a href="tel:09134300916" className="flex items-center justify-between p-2 rounded-xl hover:bg-white dark:hover:bg-gray-950 hover:shadow-sm transition-all group/phone">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 group-hover/phone:text-[#008080]">
                  <Phone className="w-4 h-4" />
                  <span className="font-medium dir-ltr">0913 430 0916</span>
                  <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">احسان رضایی</span>
                </div>
                <ChevronLeft className="w-4 h-4 text-gray-300 opacity-0 group-hover/phone:opacity-100 group-hover/phone:-translate-x-1 transition-all" />
              </a>
              <a href="tel:09134300926" className="flex items-center justify-between p-2 rounded-xl hover:bg-white dark:hover:bg-gray-950 hover:shadow-sm transition-all group/phone">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 group-hover/phone:text-[#008080]">
                  <Phone className="w-4 h-4" />
                  <span className="font-medium dir-ltr">0913 430 0926</span>
                  <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">عرفان حاتفی</span>
                </div>
                <ChevronLeft className="w-4 h-4 text-gray-300 opacity-0 group-hover/phone:opacity-100 group-hover/phone:-translate-x-1 transition-all" />
              </a>
            </div>
          </div>

          {/* کارت شعبه دهه فجر */}
          <div className="group relative p-6 rounded-3xl bg-gradient-to-b from-gray-50/50 to-transparent dark:from-gray-900/50 border border-gray-100 dark:border-gray-800/60 hover:shadow-2xl hover:shadow-[#20B2AA]/5 transition-all duration-500">
            <div className="absolute top-0 right-6 w-12 h-1 bg-[#20B2AA] rounded-b-full opacity-50 group-hover:h-2 transition-all duration-300" />
            <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
              <div className="p-2 bg-[#20B2AA]/10 rounded-xl text-[#20B2AA]">
                <MapPin className="w-5 h-5" />
              </div>
              شعبه دهه فجر
            </h4>
            <address className="not-italic text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              میدان یعقوبی به سمت صاحب الزمان، جنب پل عابر پیاده
            </address>
            <div className="space-y-3">
              <a href="tel:09134388606" className="flex items-center justify-between p-2 rounded-xl hover:bg-white dark:hover:bg-gray-950 hover:shadow-sm transition-all group/phone">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 group-hover/phone:text-[#20B2AA]">
                  <Phone className="w-4 h-4" />
                  <span className="font-medium dir-ltr">0913 438 8606</span>
                  <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">محسن رضایی</span>
                </div>
                <ChevronLeft className="w-4 h-4 text-gray-300 opacity-0 group-hover/phone:opacity-100 group-hover/phone:-translate-x-1 transition-all" />
              </a>
              <a href="tel:09134388636" className="flex items-center justify-between p-2 rounded-xl hover:bg-white dark:hover:bg-gray-950 hover:shadow-sm transition-all group/phone">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 group-hover/phone:text-[#20B2AA]">
                  <Phone className="w-4 h-4" />
                  <span className="font-medium dir-ltr">0913 438 8636</span>
                  <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">رسام کریمی</span>
                </div>
                <ChevronLeft className="w-4 h-4 text-gray-300 opacity-0 group-hover/phone:opacity-100 group-hover/phone:-translate-x-1 transition-all" />
              </a>
            </div>
          </div>

          {/* پشتیبانی، مدیریت و نماد اعتماد */}
          <div className="space-y-5">
            
            {/* کارت پشتیبانی فنی */}
            <div className="group p-4 rounded-2xl bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10 border border-blue-100 dark:border-blue-800/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all">
              <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-500">
                  <HeadphonesIcon className="w-4 h-4" />
                </div>
                پشتیبانی فنی
              </h4>
              <a href="tel:09352555519" className="flex items-center justify-between p-2 rounded-xl hover:bg-white dark:hover:bg-gray-950 transition-all group/phone">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 group-hover/phone:text-blue-500">
                  <Phone className="w-4 h-4" />
                  <span className="font-medium dir-ltr">0935 255 5519</span>
                  <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">صادق تقوی</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              </a>
            </div>

            {/* کارت مدیریت */}
            <div className="group p-4 rounded-2xl bg-gradient-to-b from-purple-50/50 to-transparent dark:from-purple-900/10 border border-purple-100 dark:border-purple-800/30 hover:shadow-lg hover:shadow-purple-500/5 transition-all">
              <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-500">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                مدیریت
              </h4>
              <a href="tel:09131512790" className="flex items-center justify-between p-2 rounded-xl hover:bg-white dark:hover:bg-gray-950 transition-all group/phone">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 group-hover/phone:text-purple-500">
                  <Phone className="w-4 h-4" />
                  <span className="font-medium dir-ltr">0913 151 2790</span>
                  <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">علیرضا حاتمی</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-purple-400" />
              </a>
            </div>

            {/* نماد اعتماد */}
            <div className="pt-2 flex gap-4">
              <div className="w-[72px] h-[72px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-center p-2 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
                <Image src="https://ranew.s3.ir-thr-at1.arvanstorage.ir/placeholder.png?text=eNamad" alt="اینماد" width={56} height={56} className="w-full h-auto object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-110 transition-transform" unoptimized/>
              </div>
              <div className="w-[72px] h-[72px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-center p-2 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
                <Image src="https://ranew.s3.ir-thr-at1.arvanstorage.ir/placeholder.png?text=Samandehi" alt="ساماندهی" width={56} height={56} className="w-full h-auto object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-110 transition-transform" unoptimized/>
              </div>
            </div>

          </div>
        </div>

        {/* شبکه‌های اجتماعی و لینک‌های پایین */}
        <div className="mt-16 pt-8 border-t border-gray-200/50 dark:border-gray-800/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100 rtl:ml-2">با ما همراه باشید:</span>
              
              {/* Instagram */}
              <a href="#" target="_blank" rel="noreferrer" className="group relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 flex items-center justify-center text-white hover:scale-110 hover:-translate-y-1 transition-all shadow-lg shadow-pink-500/20">
                <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <MessageCircle className="w-5 h-5 relative z-10" />
              </a>
              
              {/* Telegram */}
              <a href="#" target="_blank" rel="noreferrer" className="group relative w-11 h-11 rounded-2xl bg-[#229ED9] flex items-center justify-center text-white hover:scale-110 hover:-translate-y-1 transition-all shadow-lg shadow-blue-500/20">
                <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <Send className="w-5 h-5 -ml-1 relative z-10" />
              </a>

              {/* Eitaa */}
              <a href="#" target="_blank" rel="noreferrer" className="group relative px-4 h-11 rounded-2xl bg-gradient-to-r from-[#F26B22] to-[#ff8c4e] flex items-center justify-center text-white hover:scale-105 hover:-translate-y-1 transition-all shadow-lg shadow-orange-500/20 font-extrabold text-sm tracking-widest">
                <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10">ایتا</span>
              </a>

              {/* Bale */}
              <a href="#" target="_blank" rel="noreferrer" className="group relative px-4 h-11 rounded-2xl bg-gradient-to-r from-[#28A745] to-[#34ce57] flex items-center justify-center text-white hover:scale-105 hover:-translate-y-1 transition-all shadow-lg shadow-green-500/20 font-extrabold text-sm tracking-widest">
                <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10">بله</span>
              </a>

              {/* Rubika */}
              <a href="#" target="_blank" rel="noreferrer" className="group relative px-4 h-11 rounded-2xl bg-gradient-to-r from-[#8E24AA] to-[#ab30cc] flex items-center justify-center text-white hover:scale-105 hover:-translate-y-1 transition-all shadow-lg shadow-purple-500/20 font-extrabold text-sm tracking-widest">
                <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10">روبیکا</span>
              </a>
            </div>

            <div className="flex gap-6 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 px-6 py-3 rounded-2xl">
              <Link href="/terms" className="hover:text-[#008080] dark:hover:text-[#20B2AA] transition-colors">قوانین و مقررات</Link>
              <div className="w-[1px] h-4 bg-gray-300 dark:bg-gray-700" />
              <Link href="/privacy" className="hover:text-[#008080] dark:hover:text-[#20B2AA] transition-colors">حریم خصوصی</Link>
            </div>
          </div>
        </div>

        {/* کپی‌رایت */}
        <div className="mt-8 flex items-center justify-center pb-4">
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 text-center flex items-center gap-1">
            تمامی حقوق این سایت متعلق به مجموعه
            <span className="text-[#008080] dark:text-[#20B2AA] font-bold">رایان تک</span> 
            می‌باشد. © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
