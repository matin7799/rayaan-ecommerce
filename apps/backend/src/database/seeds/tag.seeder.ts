// apps/backend/src/database/seeds/tag.seeder.ts

import { DataSource } from 'typeorm';
import { Tag } from '../../domains/catalog/entities/tag.entity';

const tagData = [
  // General Tags
  { name: 'پرفروش', slug: 'bestseller' },
  { name: 'جدید', slug: 'new' },
  { name: 'تخفیف دار', slug: 'on-sale' },
  { name: 'پیشنهاد ویژه', slug: 'special-offer' },
  { name: 'محصول برتر', slug: 'top-rated' },

  // Performance Tags
  { name: 'گیمینگ', slug: 'gaming' },
  { name: 'حرفه‌ای', slug: 'professional' },
  { name: 'اقتصادی', slug: 'budget' },
  { name: 'پرچمدار', slug: 'flagship' },
  { name: 'میان رده', slug: 'midrange' },

  // Features Tags
  { name: 'صفحه لمسی', slug: 'touchscreen' },
  { name: 'قابل تبدیل', slug: 'convertible' },
  { name: 'سبک و باریک', slug: 'lightweight' },
  { name: 'باتری طولانی', slug: 'long-battery' },
  { name: 'شارژ سریع', slug: 'fast-charging' },
  { name: 'ضد آب', slug: 'waterproof' },
  { name: 'ضد ضربه', slug: 'shockproof' },

  // Display Tags
  { name: '4K', slug: '4k' },
  { name: 'Full HD', slug: 'full-hd' },
  { name: 'OLED', slug: 'oled' },
  { name: 'رفرش ریت بالا', slug: 'high-refresh-rate' },
  { name: 'HDR', slug: 'hdr' },
  { name: 'خمیده', slug: 'curved' },

  // Storage Tags
  { name: 'SSD', slug: 'ssd' },
  { name: 'حافظه بالا', slug: 'high-storage' },
  { name: 'قابل ارتقا', slug: 'upgradable' },

  // Camera Tags
  { name: 'دوربین حرفه‌ای', slug: 'pro-camera' },
  { name: 'دوربین سلفی', slug: 'selfie-camera' },
  { name: 'زوم اپتیکال', slug: 'optical-zoom' },

  // Connectivity Tags
  { name: '5G', slug: '5g' },
  { name: 'Wi-Fi 6', slug: 'wifi-6' },
  { name: 'بلوتوث', slug: 'bluetooth' },
  { name: 'USB-C', slug: 'usb-c' },
  { name: 'Thunderbolt', slug: 'thunderbolt' },

  // Use Case Tags
  { name: 'دانشجویی', slug: 'student' },
  { name: 'اداری', slug: 'office' },
  { name: 'طراحی', slug: 'design' },
  { name: 'برنامه نویسی', slug: 'programming' },
  { name: 'مهندسی', slug: 'engineering' },
  { name: 'رندرینگ', slug: 'rendering' },
  { name: 'ویرایش ویدیو', slug: 'video-editing' },
  { name: 'عکاسی', slug: 'photography' },

  // Brand Specific Tags
  { name: 'اورجینال', slug: 'original' },
  { name: 'گارانتی معتبر', slug: 'warranty' },
  { name: 'ساخت ژاپن', slug: 'made-in-japan' },
  { name: 'ساخت آمریکا', slug: 'made-in-usa' },

  // Color Tags
  { name: 'مشکی', slug: 'black' },
  { name: 'سفید', slug: 'white' },
  { name: 'نقره‌ای', slug: 'silver' },
  { name: 'آبی', slug: 'blue' },
  { name: 'قرمز', slug: 'red' },
];

export async function seedTags(dataSource: DataSource): Promise<void> {
  const tagRepo = dataSource.getRepository(Tag);

  console.log('🌱 Seeding tags...');

  for (const data of tagData) {
    const existing = await tagRepo.findOne({
      where: { slug: data.slug },
    });

    if (!existing) {
      const tag = tagRepo.create({
        name: data.name,
        slug: data.slug,
        isActive: true,
      });

      await tagRepo.save(tag);
      console.log(`  ✓ Created tag: ${tag.name}`);
    } else {
      console.log(`  ⊙ Tag already exists: ${data.name}`);
    }
  }

  console.log('✅ Tags seeded successfully!\n');
}
