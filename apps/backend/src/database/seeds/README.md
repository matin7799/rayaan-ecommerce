# Database Seeders

This directory contains database seeders to populate your e-commerce database with initial data.

## Seeders Included

1. **category.seeder.ts** - Seeds 7 parent categories with 46 child categories
   - لپ تاپ (Laptops) - 8 subcategories
   - موبایل (Mobile Phones) - 8 subcategories
   - کنسول بازی (Gaming Consoles) - 6 subcategories
   - آل این وان (All-in-One PCs) - 5 subcategories
   - پرینتر (Printers) - 6 subcategories
   - کیس (PC Cases) - 6 subcategories
   - مانیتور (Monitors) - 7 subcategories

2. **user.seeder.ts** - Seeds test users
   - 1 Admin user (phone: 09123456789, password: Admin@123)
   - 3 Customer users (including phone: 09134300926, password: Customer@123)

3. **product.seeder.ts** - Seeds realistic products with variants
   - Gaming laptops (ASUS ROG, MSI Katana)
   - Student laptops (HP 15s)
   - MacBooks (MacBook Air M3)
   - iPhones (iPhone 15 Pro Max, iPhone 14)
   - Android phones (Samsung S24 Ultra, Xiaomi Redmi Note 13 Pro)
   - Gaming consoles (PS5, Xbox Series X)
   - Monitors (ASUS TUF, LG UltraGear)
   - PC Cases (Gaming, Office)
   - All-in-One (iMac 24")
   - Printers (HP LaserJet, Epson L3250)
   
   Each product includes:
   - Multiple variants (different RAM/Storage/Color options)
   - Realistic prices in Toman
   - Stock quantities
   - Product options (RAM, Storage, Color, etc.)

## How to Run

### Method 1: Using npm script (Recommended)
```bash
cd apps/backend
npm run seed
```

### Method 2: Direct execution
```bash
cd apps/backend
npx ts-node -r tsconfig-paths/register src/database/seeds/main.seeder.ts
```

### Method 3: Using pnpm (if in monorepo)
```bash
pnpm --filter backend seed
```

## Prerequisites

1. Make sure PostgreSQL is running
2. Database connection is configured in `.env` file:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_NAME=shopdb
   ```
3. Run migrations first:
   ```bash
   npm run migration:run
   ```

## What Gets Created

After running seeders, you'll have:
- **53 categories** (7 parents + 46 children)
- **4 users** (1 admin + 3 customers)
- **20+ products** with multiple variants each
- **50+ product variants** with different options
- **Inventory stock** for each variant

## Test Credentials

### Admin User
- Phone: `09123456789`
- Password: `Admin@123`
- Role: ADMIN

### Customer Users
- Phone: `09134300926` / Password: `Customer@123`
- Phone: `09121234567` / Password: `Customer@123`
- Phone: `09131234567` / Password: `Customer@123`

## Notes

- Seeders are idempotent - they check if data exists before inserting
- Running seeders multiple times won't create duplicates
- Products are linked to categories by slug
- All prices are in Iranian Toman
- Stock quantities are realistic (3-20 units per variant)

## Troubleshooting

### Error: "Category not found"
Make sure categories are seeded before products. The main seeder runs them in the correct order.

### Error: "Connection refused"
Check if PostgreSQL is running and connection details in `.env` are correct.

### Error: "Duplicate key value"
This is normal if data already exists. The seeder will skip existing records.
