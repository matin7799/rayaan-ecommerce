// apps/backend/src/database/seeds/brand.seeder.ts

import { DataSource } from 'typeorm';
import { Brand } from '../../domains/catalog/entities/brand.entity';

const brandData = [
  // Laptop Brands
  {
    name: 'ASUS',
    slug: 'asus',
    description: 'برند تایوانی تولید کننده لپ تاپ و قطعات کامپیوتر',
  },
  {
    name: 'MSI',
    slug: 'msi',
    description: 'برند تایوانی متخصص در لپ تاپ‌های گیمینگ',
  },
  {
    name: 'HP',
    slug: 'hp',
    description: 'برند آمریکایی تولید کننده لپ تاپ و پرینتر',
  },
  {
    name: 'Dell',
    slug: 'dell',
    description: 'برند آمریکایی تولید کننده لپ تاپ و کامپیوتر',
  },
  {
    name: 'Lenovo',
    slug: 'lenovo',
    description: 'برند چینی تولید کننده لپ تاپ و تبلت',
  },
  {
    name: 'Acer',
    slug: 'acer',
    description: 'برند تایوانی تولید کننده لپ تاپ',
  },
  {
    name: 'Apple',
    slug: 'apple',
    description: 'برند آمریکایی تولید کننده مک بوک و آیفون',
  },

  // Mobile Brands
  {
    name: 'Samsung',
    slug: 'samsung',
    description: 'برند کره‌ای تولید کننده گوشی‌های هوشمند',
  },
  {
    name: 'Xiaomi',
    slug: 'xiaomi',
    description: 'برند چینی تولید کننده گوشی‌های هوشمند',
  },
  {
    name: 'Huawei',
    slug: 'huawei',
    description: 'برند چینی تولید کننده گوشی‌های هوشمند',
  },
  {
    name: 'OnePlus',
    slug: 'oneplus',
    description: 'برند چینی تولید کننده گوشی‌های پرچمدار',
  },
  {
    name: 'Google',
    slug: 'google',
    description: 'برند آمریکایی تولید کننده گوشی‌های پیکسل',
  },
  {
    name: 'Nokia',
    slug: 'nokia',
    description: 'برند فنلاندی تولید کننده گوشی‌های موبایل',
  },
  {
    name: 'Oppo',
    slug: 'oppo',
    description: 'برند چینی تولید کننده گوشی‌های هوشمند',
  },
  {
    name: 'Realme',
    slug: 'realme',
    description: 'برند چینی تولید کننده گوشی‌های میان رده',
  },

  // Console Brands
  {
    name: 'Sony',
    slug: 'sony',
    description: 'برند ژاپنی تولید کننده پلی استیشن',
  },
  {
    name: 'Microsoft',
    slug: 'microsoft',
    description: 'برند آمریکایی تولید کننده ایکس باکس',
  },
  {
    name: 'Nintendo',
    slug: 'nintendo',
    description: 'برند ژاپنی تولید کننده کنسول‌های بازی',
  },

  // Monitor Brands
  {
    name: 'LG',
    slug: 'lg',
    description: 'برند کره‌ای تولید کننده مانیتور و تلویزیون',
  },
  {
    name: 'BenQ',
    slug: 'benq',
    description: 'برند تایوانی تولید کننده مانیتور',
  },
  { name: 'AOC', slug: 'aoc', description: 'برند تایوانی تولید کننده مانیتور' },

  // Printer Brands
  {
    name: 'Canon',
    slug: 'canon',
    description: 'برند ژاپنی تولید کننده پرینتر و دوربین',
  },
  {
    name: 'Epson',
    slug: 'epson',
    description: 'برند ژاپنی تولید کننده پرینتر',
  },
  {
    name: 'Brother',
    slug: 'brother',
    description: 'برند ژاپنی تولید کننده پرینتر',
  },

  // PC Component Brands
  {
    name: 'Intel',
    slug: 'intel',
    description: 'برند آمریکایی تولید کننده پردازنده',
  },
  {
    name: 'AMD',
    slug: 'amd',
    description: 'برند آمریکایی تولید کننده پردازنده و کارت گرافیک',
  },
  {
    name: 'NVIDIA',
    slug: 'nvidia',
    description: 'برند آمریکایی تولید کننده کارت گرافیک',
  },
];

export async function seedBrands(dataSource: DataSource): Promise<void> {
  const brandRepo = dataSource.getRepository(Brand);

  console.log('🌱 Seeding brands...');

  for (const data of brandData) {
    const existing = await brandRepo.findOne({
      where: { slug: data.slug },
    });

    if (!existing) {
      const brand = brandRepo.create({
        name: data.name,
        slug: data.slug,
        description: data.description,
        isActive: true,
      });

      await brandRepo.save(brand);
      console.log(`  ✓ Created brand: ${brand.name}`);
    } else {
      console.log(`  ⊙ Brand already exists: ${data.name}`);
    }
  }

  console.log('✅ Brands seeded successfully!\n');
}
