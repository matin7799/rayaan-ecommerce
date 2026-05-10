import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1778147752042 implements MigrationInterface {
  name = 'InitialMigration1778147752042';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_status_enum" AS ENUM('active', 'blocked')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('super_admin', 'admin', 'partner', 'customer', 'guest')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "phone" character varying(11) NOT NULL, "email" character varying(255), "password_hash" character varying(255) NOT NULL, "first_name" character varying(50) NOT NULL, "last_name" character varying(50) NOT NULL, "status" "public"."users_status_enum" NOT NULL DEFAULT 'active', "role" "public"."users_role_enum" NOT NULL DEFAULT 'customer', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_a000cca60bcf04454e727699490" UNIQUE ("phone"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a000cca60bcf04454e72769949" ON "users" ("phone") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `,
    );
    await queryRunner.query(
      `CREATE TABLE "addresses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "full_name" character varying(255) NOT NULL, "phone" character varying(20) NOT NULL, "province" character varying(100) NOT NULL, "city" character varying(100) NOT NULL, "address" text NOT NULL, "postal_code" character varying(20), "is_default" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_745d8f43d3af10ab8247465e450" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "brands" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "description" text, "logo_url" character varying(500), "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_b15428f362be2200922952dc268" UNIQUE ("slug"), CONSTRAINT "PK_b0c437120b624da1034a81fc561" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_b15428f362be2200922952dc26" ON "brands" ("slug") `,
    );
    await queryRunner.query(
      `CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "description" text, "parent_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_420d9f679d41281f282f5bc7d09" UNIQUE ("slug"), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_420d9f679d41281f282f5bc7d0" ON "categories" ("slug") `,
    );
    await queryRunner.query(
      `CREATE TABLE "inventory_stock" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "variant_id" uuid NOT NULL, "stock" integer NOT NULL DEFAULT '0', "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_95f725ee463467375cc3b8c636" UNIQUE ("variant_id"), CONSTRAINT "PK_a13d56d2087e6d9eb3d480395bf" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_variant_options" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "variant_id" uuid NOT NULL, "name" character varying(255) NOT NULL, "value" character varying(255) NOT NULL, CONSTRAINT "PK_cd62d81fd4813d94bfd1ef7cda5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_variants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "product_id" uuid NOT NULL, "sku" character varying(255) NOT NULL, "title" character varying(255), "price" bigint NOT NULL, "compare_price" bigint, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_46f236f21640f9da218a063a866" UNIQUE ("sku"), CONSTRAINT "PK_281e3f2c55652d6a22c0aa59fd7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_attributes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "product_id" uuid NOT NULL, "key" character varying NOT NULL, "value" character varying NOT NULL, CONSTRAINT "PK_4fa18fc5c893cb9894fc40ca921" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_options" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "product_id" uuid NOT NULL, "option_name" character varying NOT NULL, "price_modifier" bigint NOT NULL, CONSTRAINT "PK_3916b02fb43aa725f8167c718e4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."media_type_enum" AS ENUM('image', 'video', 'document')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."media_usage_enum" AS ENUM('product', 'brand', 'category', 'user', 'banner', 'blog')`,
    );
    await queryRunner.query(
      `CREATE TABLE "media" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "filename" character varying NOT NULL, "original_name" character varying NOT NULL, "mime_type" character varying NOT NULL, "size" bigint NOT NULL, "url" character varying NOT NULL, "thumbnail_url" character varying, "type" "public"."media_type_enum" NOT NULL DEFAULT 'image', "usage" "public"."media_usage_enum", "entity_id" character varying, "width" integer, "height" integer, "alt" character varying, "caption" character varying, "order" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_42a60c07e4b566f0cc06a1eaaff" UNIQUE ("url"), CONSTRAINT "PK_f4e0fcac36e050de337b670d8bd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_640fd90c29b05d99714980112d" ON "media" ("usage") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7f2f144c5119791dbeac5f5a9c" ON "media" ("entity_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "product_media" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "product_id" uuid NOT NULL, "media_id" uuid NOT NULL, "order" integer NOT NULL DEFAULT '0', "alt" character varying, "caption" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_product_media_product_media" UNIQUE ("product_id", "media_id"), CONSTRAINT "PK_09d4639de8082a32aa27f3ac9a6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_product_media_product_id" ON "product_media" ("product_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_product_media_media_id" ON "product_media" ("media_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "sku" character varying(6) NOT NULL, "description" text, "short_description" text, "base_price" bigint NOT NULL, "sale_price" bigint, "partner_discount_percent" numeric(5,2) NOT NULL DEFAULT '0', "is_on_sale" boolean NOT NULL DEFAULT false, "sale_start_date" TIMESTAMP, "sale_end_date" TIMESTAMP, "stock_quantity" integer NOT NULL DEFAULT '0', "track_inventory" boolean NOT NULL DEFAULT true, "low_stock_threshold" integer NOT NULL DEFAULT '5', "meta_title" character varying(255), "meta_description" text, "meta_keywords" text, "featured_image" character varying(500), "is_active" boolean NOT NULL DEFAULT true, "is_featured" boolean NOT NULL DEFAULT false, "brand_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_464f927ae360106b783ed0b4106" UNIQUE ("slug"), CONSTRAINT "UQ_c44ac33a05b144dd0d9ddcf9327" UNIQUE ("sku"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1530a6f15d3c79d1b70be98f2b" ON "products" ("brand_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c8d24f43c491943f2fa6c32e95" ON "products" ("is_active", "is_on_sale") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_c44ac33a05b144dd0d9ddcf932" ON "products" ("sku") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_464f927ae360106b783ed0b410" ON "products" ("slug") `,
    );
    await queryRunner.query(
      `CREATE TABLE "tags" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_b3aa10c29ea4e61a830362bd25a" UNIQUE ("slug"), CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "cart_snapshots" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cartId" character varying(255) NOT NULL, "cartData" jsonb NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_795b701a8ecc517ca3362a3101c" UNIQUE ("cartId"), CONSTRAINT "PK_1ad913b0d740c6ac1b4a450bcaa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_795b701a8ecc517ca3362a3101" ON "cart_snapshots" ("cartId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "order_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "product_id" uuid, "product_title" character varying NOT NULL, "product_slug" character varying NOT NULL, "option_name" character varying, "quantity" integer NOT NULL, "unit_price" bigint NOT NULL, "total_price" bigint NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."orders_status_enum" AS ENUM('PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "total_price" bigint NOT NULL, "status" "public"."orders_status_enum" NOT NULL DEFAULT 'PENDING', "payment_ref" character varying, "shipping_address" jsonb, "shipping_method_id" uuid, "shipping_cost" bigint NOT NULL DEFAULT '0', "payment_method" character varying(50), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."order_cancel_requests_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_cancel_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "user_id" uuid NOT NULL, "reason" text NOT NULL, "status" "public"."order_cancel_requests_status_enum" NOT NULL DEFAULT 'PENDING', "admin_note" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_79eb2570ba956a6883b59ea4eb9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payments_status_enum" AS ENUM('pending', 'success', 'failed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payments_provider_enum" AS ENUM('zarinpal', 'idpay')`,
    );
    await queryRunner.query(
      `CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "amount" bigint NOT NULL, "status" "public"."payments_status_enum" NOT NULL DEFAULT 'pending', "provider" "public"."payments_provider_enum" NOT NULL, "provider_track_id" character varying(255), "callback_payload" json, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "campaign_products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "campaign_id" uuid NOT NULL, "product_id" uuid NOT NULL, CONSTRAINT "PK_c052809cb3a3b9f34a6149328bb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_campaign_products_unique" ON "campaign_products" ("campaign_id", "product_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."campaign_type_enum" AS ENUM('percentage', 'fixed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "campaign" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "type" "public"."campaign_type_enum" NOT NULL, "value" bigint NOT NULL, "starts_at" TIMESTAMP NOT NULL, "ends_at" TIMESTAMP NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0ce34d26e7f2eb316a3a592cdc4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."blogs_status_enum" AS ENUM('draft', 'published', 'archived')`,
    );
    await queryRunner.query(
      `CREATE TABLE "blogs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "slug" character varying NOT NULL, "excerpt" text, "content" text NOT NULL, "featured_image" character varying, "status" "public"."blogs_status_enum" NOT NULL DEFAULT 'draft', "author_id" uuid NOT NULL, "view_count" integer NOT NULL DEFAULT '0', "reading_time" integer NOT NULL DEFAULT '0', "published_at" TIMESTAMP, "meta_title" character varying, "meta_description" text, "meta_keywords" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_7b18faaddd461656ff66f32e2d7" UNIQUE ("slug"), CONSTRAINT "PK_e113335f11c926da929a625f118" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7b18faaddd461656ff66f32e2d" ON "blogs" ("slug") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_55d52365907068ea6cc68cd607" ON "blogs" ("status") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."banners_position_enum" AS ENUM('home_hero', 'home_secondary', 'category_top', 'sidebar', 'footer')`,
    );
    await queryRunner.query(
      `CREATE TABLE "banners" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text, "image_url" character varying NOT NULL, "mobile_image_url" character varying, "link_url" character varying, "position" "public"."banners_position_enum" NOT NULL DEFAULT 'home_hero', "order" integer NOT NULL DEFAULT '0', "is_active" boolean NOT NULL DEFAULT true, "start_date" TIMESTAMP, "end_date" TIMESTAMP, "click_count" integer NOT NULL DEFAULT '0', "view_count" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e9b186b959296fcb940790d31c3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "shipping_methods" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "description" text, "cost" bigint NOT NULL DEFAULT '0', "estimated_days" integer, "is_active" boolean NOT NULL DEFAULT true, "is_pay_on_delivery" boolean NOT NULL DEFAULT false, "sort_order" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5bee9dd62a8b72d6d9caabd63cf" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_categories" ("product_id" uuid NOT NULL, "category_id" uuid NOT NULL, CONSTRAINT "PK_54f2e1dbf14cfa770f59f0aac8f" PRIMARY KEY ("product_id", "category_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8748b4a0e8de6d266f2bbc877f" ON "product_categories" ("product_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9148da8f26fc248e77a387e311" ON "product_categories" ("category_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "product_tags" ("product_id" uuid NOT NULL, "tag_id" uuid NOT NULL, CONSTRAINT "PK_8ca809b37ff76596b63fe60ac41" PRIMARY KEY ("product_id", "tag_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5b0c6fc53c574299ecc7f9ee22" ON "product_tags" ("product_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f2cd3faf2e129a4c69c05a291e" ON "product_tags" ("tag_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "blog_tags" ("blog_id" uuid NOT NULL, "tag_id" uuid NOT NULL, CONSTRAINT "PK_561e9296a2ba753a9900831104c" PRIMARY KEY ("blog_id", "tag_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_20ce3565a4dda1ce7a3e8104f2" ON "blog_tags" ("blog_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7d8cc813269fa2a0ec3f857187" ON "blog_tags" ("tag_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD CONSTRAINT "FK_16aac8a9f6f9c1dd6bcb75ec023" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "FK_88cea2dc9c31951d06437879b40" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_stock" ADD CONSTRAINT "FK_95f725ee463467375cc3b8c636f" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variant_options" ADD CONSTRAINT "FK_7a3d01d76ff30675b0c15549127" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variants" ADD CONSTRAINT "FK_6343513e20e2deab45edfce1316" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_attributes" ADD CONSTRAINT "FK_f5a6700abd0494bae3032cf5bbd" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_options" ADD CONSTRAINT "FK_49677f87ad61a8b2a31f33c8a2c" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_media" ADD CONSTRAINT "FK_e6bb4a69096db4f6a1f5bada151" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_media" ADD CONSTRAINT "FK_b0895b1d84d747625a54b7fe9cf" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_1530a6f15d3c79d1b70be98f2be" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_145532db85752b29c57d2b7b1f1" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_a922b820eeef29ac1c6800e826a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_cancel_requests" ADD CONSTRAINT "FK_8763873126fda4bdd6d3cf9cf9d" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD CONSTRAINT "FK_b2f7b823a21562eeca20e72b006" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "campaign_products" ADD CONSTRAINT "FK_0194022b822e2565667255de00c" FOREIGN KEY ("campaign_id") REFERENCES "campaign"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "blogs" ADD CONSTRAINT "FK_b324119dcb71e877cee411f7929" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_categories" ADD CONSTRAINT "FK_8748b4a0e8de6d266f2bbc877f6" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_categories" ADD CONSTRAINT "FK_9148da8f26fc248e77a387e3112" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_tags" ADD CONSTRAINT "FK_5b0c6fc53c574299ecc7f9ee22e" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_tags" ADD CONSTRAINT "FK_f2cd3faf2e129a4c69c05a291e8" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "blog_tags" ADD CONSTRAINT "FK_20ce3565a4dda1ce7a3e8104f2a" FOREIGN KEY ("blog_id") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "blog_tags" ADD CONSTRAINT "FK_7d8cc813269fa2a0ec3f8571876" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "blog_tags" DROP CONSTRAINT "FK_7d8cc813269fa2a0ec3f8571876"`,
    );
    await queryRunner.query(
      `ALTER TABLE "blog_tags" DROP CONSTRAINT "FK_20ce3565a4dda1ce7a3e8104f2a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_tags" DROP CONSTRAINT "FK_f2cd3faf2e129a4c69c05a291e8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_tags" DROP CONSTRAINT "FK_5b0c6fc53c574299ecc7f9ee22e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_categories" DROP CONSTRAINT "FK_9148da8f26fc248e77a387e3112"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_categories" DROP CONSTRAINT "FK_8748b4a0e8de6d266f2bbc877f6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "blogs" DROP CONSTRAINT "FK_b324119dcb71e877cee411f7929"`,
    );
    await queryRunner.query(
      `ALTER TABLE "campaign_products" DROP CONSTRAINT "FK_0194022b822e2565667255de00c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "FK_b2f7b823a21562eeca20e72b006"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_cancel_requests" DROP CONSTRAINT "FK_8763873126fda4bdd6d3cf9cf9d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_a922b820eeef29ac1c6800e826a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_145532db85752b29c57d2b7b1f1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_1530a6f15d3c79d1b70be98f2be"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_media" DROP CONSTRAINT "FK_b0895b1d84d747625a54b7fe9cf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_media" DROP CONSTRAINT "FK_e6bb4a69096db4f6a1f5bada151"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_options" DROP CONSTRAINT "FK_49677f87ad61a8b2a31f33c8a2c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_attributes" DROP CONSTRAINT "FK_f5a6700abd0494bae3032cf5bbd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variants" DROP CONSTRAINT "FK_6343513e20e2deab45edfce1316"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variant_options" DROP CONSTRAINT "FK_7a3d01d76ff30675b0c15549127"`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_stock" DROP CONSTRAINT "FK_95f725ee463467375cc3b8c636f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "FK_88cea2dc9c31951d06437879b40"`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" DROP CONSTRAINT "FK_16aac8a9f6f9c1dd6bcb75ec023"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7d8cc813269fa2a0ec3f857187"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_20ce3565a4dda1ce7a3e8104f2"`,
    );
    await queryRunner.query(`DROP TABLE "blog_tags"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f2cd3faf2e129a4c69c05a291e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5b0c6fc53c574299ecc7f9ee22"`,
    );
    await queryRunner.query(`DROP TABLE "product_tags"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9148da8f26fc248e77a387e311"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8748b4a0e8de6d266f2bbc877f"`,
    );
    await queryRunner.query(`DROP TABLE "product_categories"`);
    await queryRunner.query(`DROP TABLE "shipping_methods"`);
    await queryRunner.query(`DROP TABLE "banners"`);
    await queryRunner.query(`DROP TYPE "public"."banners_position_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_55d52365907068ea6cc68cd607"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7b18faaddd461656ff66f32e2d"`,
    );
    await queryRunner.query(`DROP TABLE "blogs"`);
    await queryRunner.query(`DROP TYPE "public"."blogs_status_enum"`);
    await queryRunner.query(`DROP TABLE "campaign"`);
    await queryRunner.query(`DROP TYPE "public"."campaign_type_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_campaign_products_unique"`,
    );
    await queryRunner.query(`DROP TABLE "campaign_products"`);
    await queryRunner.query(`DROP TABLE "payments"`);
    await queryRunner.query(`DROP TYPE "public"."payments_provider_enum"`);
    await queryRunner.query(`DROP TYPE "public"."payments_status_enum"`);
    await queryRunner.query(`DROP TABLE "order_cancel_requests"`);
    await queryRunner.query(
      `DROP TYPE "public"."order_cancel_requests_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_795b701a8ecc517ca3362a3101"`,
    );
    await queryRunner.query(`DROP TABLE "cart_snapshots"`);
    await queryRunner.query(`DROP TABLE "tags"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_464f927ae360106b783ed0b410"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c44ac33a05b144dd0d9ddcf932"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c8d24f43c491943f2fa6c32e95"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1530a6f15d3c79d1b70be98f2b"`,
    );
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_product_media_media_id"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_product_media_product_id"`,
    );
    await queryRunner.query(`DROP TABLE "product_media"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7f2f144c5119791dbeac5f5a9c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_640fd90c29b05d99714980112d"`,
    );
    await queryRunner.query(`DROP TABLE "media"`);
    await queryRunner.query(`DROP TYPE "public"."media_usage_enum"`);
    await queryRunner.query(`DROP TYPE "public"."media_type_enum"`);
    await queryRunner.query(`DROP TABLE "product_options"`);
    await queryRunner.query(`DROP TABLE "product_attributes"`);
    await queryRunner.query(`DROP TABLE "product_variants"`);
    await queryRunner.query(`DROP TABLE "product_variant_options"`);
    await queryRunner.query(`DROP TABLE "inventory_stock"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_420d9f679d41281f282f5bc7d0"`,
    );
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b15428f362be2200922952dc26"`,
    );
    await queryRunner.query(`DROP TABLE "brands"`);
    await queryRunner.query(`DROP TABLE "addresses"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a000cca60bcf04454e72769949"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
  }
}
