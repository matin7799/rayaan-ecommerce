// apps/backend/src/database/seeds/category.seeder.ts

import { DataSource } from 'typeorm';
import { Category } from '../../domains/catalog/entities/category.entity';

const categoryData = [
  {
    name: 'لپ تاپ',
    slug: 'laptop',
    description: 'انواع لپ تاپ برای کاربردهای مختلف',
    children: [
      {
        name: 'لپ تاپ گیمینگ',
        slug: 'gaming-laptop',
        description: 'لپ تاپ‌های قدرتمند برای بازی',
      },
      {
        name: 'لپ تاپ دانشجویی',
        slug: 'student-laptop',
        description: 'لپ تاپ‌های مناسب دانشجویان',
      },
      {
        name: 'لپ تاپ برنامه نویسی',
        slug: 'programming-laptop',
        description: 'لپ تاپ‌های حرفه‌ای برای برنامه‌نویسی',
      },
      {
        name: 'لپ تاپ مهندسی',
        slug: 'engineering-laptop',
        description: 'لپ تاپ‌های قدرتمند برای نرم‌افزارهای مهندسی',
      },
      {
        name: 'لپ تاپ سبک و باریک',
        slug: 'ultrabook',
        description: 'اولترابوک‌های سبک و قابل حمل',
      },
      {
        name: 'لپ تاپ اقتصادی',
        slug: 'budget-laptop',
        description: 'لپ تاپ‌های مقرون به صرفه',
      },
      {
        name: 'لپ تاپ 2 در 1',
        slug: 'convertible-laptop',
        description: 'لپ تاپ‌های قابل تبدیل به تبلت',
      },
      { name: 'مک بوک', slug: 'macbook', description: 'لپ تاپ‌های اپل مک بوک' },
    ],
  },
  {
    name: 'موبایل',
    slug: 'mobile',
    description: 'گوشی‌های هوشمند',
    children: [
      {
        name: 'گوشی پرچمدار',
        slug: 'flagship-phone',
        description: 'گوشی‌های پرچمدار با بالاترین امکانات',
      },
      {
        name: 'گوشی میان رده',
        slug: 'midrange-phone',
        description: 'گوشی‌های میان رده با قیمت مناسب',
      },
      {
        name: 'گوشی اقتصادی',
        slug: 'budget-phone',
        description: 'گوشی‌های ارزان قیمت',
      },
      {
        name: 'گوشی گیمینگ',
        slug: 'gaming-phone',
        description: 'گوشی‌های مخصوص بازی',
      },
      {
        name: 'گوشی مناسب عکاسی',
        slug: 'camera-phone',
        description: 'گوشی‌های با دوربین حرفه‌ای',
      },
      {
        name: 'گوشی مقاوم',
        slug: 'rugged-phone',
        description: 'گوشی‌های ضد ضربه و آب',
      },
      { name: 'آیفون', slug: 'iphone', description: 'گوشی‌های اپل آیفون' },
      {
        name: 'گوشی اندرویدی',
        slug: 'android-phone',
        description: 'گوشی‌های اندروید',
      },
    ],
  },
  {
    name: 'کنسول بازی',
    slug: 'gaming-console',
    description: 'کنسول‌های بازی',
    children: [
      {
        name: 'PlayStation',
        slug: 'playstation',
        description: 'کنسول‌های پلی استیشن سونی',
      },
      {
        name: 'Xbox',
        slug: 'xbox',
        description: 'کنسول‌های ایکس باکس مایکروسافت',
      },
      { name: 'Nintendo', slug: 'nintendo', description: 'کنسول‌های نینتندو' },
      {
        name: 'کنسول دستی',
        slug: 'handheld-console',
        description: 'کنسول‌های قابل حمل',
      },
      {
        name: 'کنسول نسل نهم',
        slug: 'next-gen-console',
        description: 'کنسول‌های نسل جدید',
      },
      {
        name: 'کنسول نسل هشتم',
        slug: 'eighth-gen-console',
        description: 'کنسول‌های نسل قبل',
      },
    ],
  },
  {
    name: 'آل این وان',
    slug: 'all-in-one',
    description: 'کامپیوترهای همه کاره',
    children: [
      {
        name: 'آل این وان خانگی',
        slug: 'home-all-in-one',
        description: 'کامپیوترهای همه کاره خانگی',
      },
      {
        name: 'آل این وان اداری',
        slug: 'office-all-in-one',
        description: 'کامپیوترهای همه کاره اداری',
      },
      {
        name: 'آل این وان لمسی',
        slug: 'touch-all-in-one',
        description: 'کامپیوترهای همه کاره با صفحه لمسی',
      },
      {
        name: 'آل این وان حرفه ای',
        slug: 'professional-all-in-one',
        description: 'کامپیوترهای همه کاره حرفه‌ای',
      },
      { name: 'iMac', slug: 'imac', description: 'کامپیوترهای همه کاره اپل' },
    ],
  },
  {
    name: 'پرینتر',
    slug: 'printer',
    description: 'چاپگرها',
    children: [
      {
        name: 'پرینتر لیزری',
        slug: 'laser-printer',
        description: 'چاپگرهای لیزری',
      },
      {
        name: 'پرینتر جوهرافشان',
        slug: 'inkjet-printer',
        description: 'چاپگرهای جوهرافشان',
      },
      {
        name: 'پرینتر چندکاره',
        slug: 'all-in-one-printer',
        description: 'چاپگرهای چندکاره',
      },
      {
        name: 'پرینتر خانگی',
        slug: 'home-printer',
        description: 'چاپگرهای خانگی',
      },
      {
        name: 'پرینتر اداری',
        slug: 'office-printer',
        description: 'چاپگرهای اداری',
      },
      {
        name: 'پرینتر حرارتی',
        slug: 'thermal-printer',
        description: 'چاپگرهای حرارتی',
      },
    ],
  },
  {
    name: 'کیس',
    slug: 'pc-case',
    description: 'کامپیوترهای رومیزی',
    children: [
      {
        name: 'کیس گیمینگ',
        slug: 'gaming-pc',
        description: 'کامپیوترهای گیمینگ',
      },
      {
        name: 'کیس اداری',
        slug: 'office-pc',
        description: 'کامپیوترهای اداری',
      },
      {
        name: 'کیس رندرینگ',
        slug: 'rendering-pc',
        description: 'کامپیوترهای رندرینگ و گرافیک',
      },
      {
        name: 'کیس اقتصادی',
        slug: 'budget-pc',
        description: 'کامپیوترهای اقتصادی',
      },
      { name: 'مینی کیس', slug: 'mini-pc', description: 'کامپیوترهای کوچک' },
      {
        name: 'ورک استیشن',
        slug: 'workstation-pc',
        description: 'ایستگاه‌های کاری حرفه‌ای',
      },
    ],
  },
  {
    name: 'مانیتور',
    slug: 'monitor',
    description: 'نمایشگرها',
    children: [
      {
        name: 'مانیتور گیمینگ',
        slug: 'gaming-monitor',
        description: 'مانیتورهای گیمینگ',
      },
      {
        name: 'مانیتور اداری',
        slug: 'office-monitor',
        description: 'مانیتورهای اداری',
      },
      {
        name: 'مانیتور طراحی',
        slug: 'design-monitor',
        description: 'مانیتورهای طراحی و گرافیک',
      },
      { name: 'مانیتور 4K', slug: '4k-monitor', description: 'مانیتورهای 4K' },
      {
        name: 'مانیتور Ultrawide',
        slug: 'ultrawide-monitor',
        description: 'مانیتورهای فوق عریض',
      },
      {
        name: 'مانیتور خمیده',
        slug: 'curved-monitor',
        description: 'مانیتورهای خمیده',
      },
      {
        name: 'مانیتور اقتصادی',
        slug: 'budget-monitor',
        description: 'مانیتورهای اقتصادی',
      },
    ],
  },
];

export async function seedCategories(dataSource: DataSource): Promise<void> {
  const categoryRepo = dataSource.getRepository(Category);

  console.log('🌱 Seeding categories...');

  for (const parentData of categoryData) {
    let parent = await categoryRepo.findOne({
      where: { slug: parentData.slug },
    });

    if (!parent) {
      parent = categoryRepo.create({
        name: parentData.name,
        slug: parentData.slug,
        description: parentData.description,
      });
      await categoryRepo.save(parent);
      console.log(`  ✓ Created parent category: ${parent.name}`);
    } else {
      console.log(`  ⊙ Parent category already exists: ${parent.name}`);
    }

    for (const childData of parentData.children) {
      const existingChild = await categoryRepo.findOne({
        where: { slug: childData.slug },
      });

      if (!existingChild) {
        const child = categoryRepo.create({
          name: childData.name,
          slug: childData.slug,
          description: childData.description,
          parent,
        });
        await categoryRepo.save(child);
        console.log(`    ✓ Created child category: ${child.name}`);
      } else {
        console.log(`    ⊙ Child category already exists: ${childData.name}`);
      }
    }
  }

  console.log('✅ Categories seeded successfully!\n');
}
