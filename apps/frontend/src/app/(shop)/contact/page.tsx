import { MapPin, Phone, UserCircle, Headset, Crown, Share2 } from "lucide-react"

export const metadata = {
  title: "ارتباط با ما | رایان‌تک یزد",
  description: "راه‌های ارتباطی، آدرس شعب و شماره تماس کارشناسان رایان‌تک یزد",
}

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      <section className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight">📞 ارتباط با <span className="text-primary">رایان‌تک یزد</span></h1>
        <p className="text-zinc-600 dark:text-zinc-300">
          برای مشاوره خرید، پشتیبانی فنی یا هرگونه سوال می‌توانید با مشاورین ما در شعب مختلف در تماس باشید.
        </p>
      </section>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Branches */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="text-primary" /> آدرس شعب ما
          </h2>
          
          <div className="p-6 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-3xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="font-bold text-lg text-primary mb-2">🏢 شعبه بلوار جوان</h3>
            <p className="text-zinc-600 dark:text-zinc-300 mb-4">یزد، میدان عالم به سمت دانش‌آموز، بعد از پل عابر پیاده</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-white dark:bg-zinc-800 p-3 rounded-xl">
                <UserCircle className="text-zinc-400" />
                <span className="font-medium">احسان رضایی</span>
                <span className="mr-auto  text-left" dir="ltr">0913 430 0916</span>
              </div>
              <div className="flex items-center gap-3 bg-white dark:bg-zinc-800 p-3 rounded-xl">
                <UserCircle className="text-zinc-400" />
                <span className="font-medium">عرفان هاتفی</span>
                <span className="mr-auto  text-left" dir="ltr">0913 430 0926</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-3xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="font-bold text-lg text-primary mb-2">🏢 شعبه دهه فجر</h3>
            <p className="text-zinc-600 dark:text-zinc-300 mb-4">یزد، جنب پل عابر پیاده امامزاده نصرالله</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-white dark:bg-zinc-800 p-3 rounded-xl">
                <UserCircle className="text-zinc-400" />
                <span className="font-medium">محسن رضایی</span>
                <span className="mr-auto  text-left" dir="ltr">0913 438 8606</span>
              </div>
              <div className="flex items-center gap-3 bg-white dark:bg-zinc-800 p-3 rounded-xl">
                <UserCircle className="text-zinc-400" />
                <span className="font-medium">رسام کریمی</span>
                <span className="mr-auto  text-left" dir="ltr">0913 438 8636</span>
              </div>
            </div>
          </div>
        </div>

        {/* Support & Management */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Phone className="text-primary" /> پشتیبانی و مدیریت
          </h2>

          <div className="p-6 bg-emerald-50 dark:bg-emerald-950/30 rounded-3xl border border-emerald-100 dark:border-emerald-900/50">
            <h3 className="font-bold flex items-center gap-2 mb-4 text-emerald-700 dark:text-emerald-400">
              <Headset /> پشتیبانی فنی و نرم‌افزار
            </h3>
            <div className="flex items-center gap-3 bg-white/60 dark:bg-zinc-900/60 p-4 rounded-xl">
              <UserCircle className="text-emerald-600" />
              <span className="font-medium">محمد تقوی</span>
              <span className="mr-auto  font-bold text-left" dir="ltr">0935 255 5519</span>
            </div>
          </div>

          <div className="p-6 bg-primary/5 rounded-3xl border border-primary/20">
            <h3 className="font-bold flex items-center gap-2 mb-4 text-primary">
              <Crown /> مدیریت مجموعه
            </h3>
            <div className="flex items-center gap-3 bg-white/60 dark:bg-zinc-900/60 p-4 rounded-xl">
              <UserCircle className="text-primary" />
              <span className="font-medium">علیرضا حاتمی</span>
              <span className="mr-auto  font-bold text-left" dir="ltr">0913 151 2790</span>
            </div>
          </div>

          {/* Social Media */}
          <div className="p-6 bg-linear-to-r from-blue-500 to-indigo-600 text-white rounded-3xl text-center space-y-4 shadow-lg shadow-blue-500/20">
            <Share2 className="w-8 h-8 mx-auto opacity-80" />
            <h3 className="text-xl font-bold">شبکه‌های اجتماعی ما</h3>
            <p className="text-blue-100 text-sm">در روبیکا، بله، ایتا و تلگرام همراه ما باشید</p>
            <div className="inline-block bg-white/20 backdrop-blur-md px-6 py-2 rounded-full  text-lg font-bold border border-white/30">
              @rayaantech_yazd
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
