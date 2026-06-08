import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TagsController } from './tags.controller';

import { CatalogService } from './services/catalog.service';

import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { Brand } from './entities/brand.entity';
import { Tag } from './entities/tag.entity';
import { InventoryStock } from './entities/inventory-stock.entity';
import { ProductAttribute } from './entities/product-attribute.entity';
import { ProductOption } from './entities/product-option.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductVariantOption } from './entities/product-variant-option.entity';
import { ProductMedia } from './entities/product-media.entity';

import { MediaModule } from '../media/media.module';
import { CampaignModule } from '../campaign/campaign.module';
import { ProductsRepository } from './catalog.repository';
import { BrandsController } from './controllers/brands.controller';
import { CatalogController } from './controllers/catalog.controller';
import { CategoriesController } from './controllers/categories.controller';
import { TorobController } from './controllers/torob.controller';
import { BrandsService } from './services/brands.service';
import { CategoriesService } from './services/categories.service';
import { PriceCalculatorService } from './services/price-calculator.service';
import { ProductPricingService } from './services/product-pricing.service';
import { TagsService } from './services/tags.service';
import { CategoriesRepository } from './categories.repository';
import { TorobTokenGuard } from './guards/torob-token.guard';
import { CatalogInvalidationService } from './services/catalog-invalidation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Category,
      Brand,
      Tag,
      InventoryStock,
      ProductAttribute,
      ProductOption,
      ProductVariant,
      ProductVariantOption,
      ProductMedia,
    ]),
    MediaModule,
    CampaignModule,
  ],
  controllers: [
    CatalogController,
    CategoriesController,
    BrandsController,
    TagsController,
    TorobController,
  ],
  providers: [
    CatalogService,
    CategoriesService,
    BrandsService,
    TagsService,
    PriceCalculatorService,
    ProductPricingService,
    ProductsRepository,
    CategoriesRepository,
    TorobTokenGuard,
    CatalogInvalidationService,
  ],
  exports: [
    CatalogService,
    PriceCalculatorService,
    ProductPricingService,
    ProductsRepository,
    TagsService,
    CatalogInvalidationService,
  ],
})
export class CatalogModule {}
