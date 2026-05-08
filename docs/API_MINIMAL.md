# Minimal Backend API Documentation

Base path: `/api/v1`

Response envelope (most routes):
```json
{ "success": true, "data": {}, "error": null, "meta": {} }
```

## App

### GET /
- Auth: none
- Required Fields: none
- Optional Fields: none
- Example Request JSON: `{}`
- Example Response JSON:
```json
{ "success": true, "data": "Hello..." }
```

## Health

### GET /health
- Auth: none
- Required Fields: none
- Optional Fields: none
- Example Request JSON: `{}`
- Example Response JSON:
```json
{ "status": "ok", "services": { "database": {"healthy": true}, "redis": {"healthy": true} } }
```

### GET /health/ready
- Auth: none
- Required Fields: none
- Optional Fields: none
- Example Request JSON: `{}`
- Example Response JSON:
```json
{ "status": "ready" }
```

### GET /health/live
- Auth: none
- Required Fields: none
- Optional Fields: none
- Example Request JSON: `{}`
- Example Response JSON:
```json
{ "status": "alive" }
```

## Authentication

### POST /auth/otp/request
- Auth: none
- Required Fields:
  - `phone` — `string` — required
- Optional Fields: none
- Example Request JSON:
```json
{ "phone": "09123456789" }
```
- Example Response JSON:
```json
{ "success": true, "data": { "message": "OTP sent" } }
```

### POST /auth/otp/verify
- Auth: none
- Required Fields:
  - `phone` — `string` — required
  - `code` — `string` — required
- Optional Fields: none
- Example Request JSON:
```json
{ "phone": "09123456789", "code": "123456" }
```
- Example Response JSON:
```json
{ "success": true, "data": { "needsRegistration": false, "userId": "uuid" } }
```

### POST /auth/register
- Auth: none (or temp token in Authorization)
- Required Fields:
  - `firstName` — `string` — required
  - `lastName` — `string` — required
  - `password` — `string` — required
- Optional Fields:
  - `phone` — `string`
- Example Request JSON:
```json
{ "firstName": "Ali", "lastName": "Ahmadi", "password": "StrongPassword123", "phone": "09123456789" }
```
- Example Response JSON:
```json
{ "success": true, "data": { "accessToken": "...", "refreshToken": "...", "userId": "uuid" } }
```

### POST /auth/login
- Auth: none
- Required Fields:
  - `phone` — `string` — required
  - `password` — `string` — required
- Optional Fields: none
- Example Request JSON:
```json
{ "phone": "09123456789", "password": "StrongPassword123" }
```
- Example Response JSON:
```json
{ "success": true, "data": { "accessToken": "...", "refreshToken": "...", "userId": "uuid" } }
```

### POST /auth/refresh
- Auth: none
- Required Fields:
  - `refreshToken` — `string` — required
- Optional Fields: none
- Example Request JSON:
```json
{ "refreshToken": "..." }
```
- Example Response JSON:
```json
{ "success": true, "data": { "accessToken": "...", "refreshToken": "..." } }
```

### POST /auth/logout
- Auth: none
- Required Fields: none
- Optional Fields:
  - `refreshToken` — `string`
- Example Request JSON:
```json
{ "refreshToken": "..." }
```
- Example Response JSON:
```json
{ "success": true, "data": { "message": "Logged out successfully" } }
```

## Users

### GET /users/me
- Auth: user
- Required Fields: none
- Optional Fields: none
- Example Request JSON: `{}`
- Example Response JSON:
```json
{ "success": true, "data": { "id": "uuid", "phone": "0912...", "firstName": "Ali", "lastName": "Ahmadi", "role": "customer" } }
```

### PATCH /users/me
- Auth: user
- Required Fields: none
- Optional Fields:
  - `firstName` — `string`
  - `lastName` — `string`
  - `email` — `string`
- Example Request JSON:
```json
{ "firstName": "Ali" }
```
- Example Response JSON:
```json
{ "success": true, "data": { "id": "uuid", "firstName": "Ali" } }
```

## Addresses

### GET /addresses
- Auth: user
- Required Fields: none
- Optional Fields: none
- Example Request JSON: `{}`
- Example Response JSON:
```json
{ "success": true, "data": [ { "id": "uuid", "full_name": "..." } ] }
```

### GET /addresses/:id
- Auth: user
- Required Fields: none
- Optional Fields: none
- Example Request JSON: `{}`
- Example Response JSON:
```json
{ "success": true, "data": { "id": "uuid", "city": "Tehran" } }
```

### POST /addresses
- Auth: user
- Required Fields:
  - `full_name` — `string` — required
  - `phone` — `string` — required
  - `province` — `string` — required
  - `city` — `string` — required
  - `address` — `string` — required
- Optional Fields:
  - `postal_code` — `string`
  - `is_default` — `boolean`
- Example Request JSON:
```json
{ "full_name": "Ali Ahmadi", "phone": "0912...", "province": "Tehran", "city": "Tehran", "address": "Street ..." }
```
- Example Response JSON:
```json
{ "success": true, "data": { "id": "uuid" } }
```

### PATCH /addresses/:id
- Auth: user
- Required Fields: none
- Optional Fields: same as create
- Example Request JSON:
```json
{ "city": "Karaj" }
```
- Example Response JSON:
```json
{ "success": true, "data": { "id": "uuid", "city": "Karaj" } }
```

### DELETE /addresses/:id
- Auth: user
- Required Fields: none
- Optional Fields: none
- Example Request JSON: `{}`
- Example Response JSON:
```json
{}
```

### PATCH /addresses/:id/set-default
- Auth: user
- Required Fields: none
- Optional Fields: none
- Example Request JSON: `{}`
- Example Response JSON:
```json
{ "success": true, "data": { "id": "uuid", "is_default": true } }
```

## Catalog

### GET /catalog/products
- Auth: none
- Required Fields: none
- Optional Fields:
  - `page` — `number`
  - `limit` — `number`
  - `search` — `string`
  - `categorySlugs` — `string[]`
  - `brandSlugs` — `string[]`
  - `tagSlugs` — `string[]`
  - `minPrice` — `number`
  - `maxPrice` — `number`
  - `isOnSale` — `boolean`
  - `inStock` — `boolean`
  - `isFeatured` — `boolean`
  - `sortBy` — `name|basePrice|createdAt`
  - `sortOrder` — `ASC|DESC`
- Example Request JSON: `{}`
- Example Response JSON:
```json
{ "success": true, "data": { "data": [ { "id": "uuid", "name": "Product" } ], "meta": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 } } }
```

### GET /catalog/products/:slug
- Auth: none
- Required Fields: none
- Optional Fields: none
- Example Request JSON: `{}`
- Example Response JSON:
```json
{ "success": true, "data": { "id": "uuid", "slug": "abc", "name": "Product", "variants": [], "attributes": [] } }
```

### POST /catalog/products
- Auth: none (currently)
- Required Fields:
  - `name` — `string` — required
  - `slug` — `string` — required
  - `sku` — `string(4-6 digits)` — required
  - `base_price` — `number` — required
  - `category_slugs` — `string[]` — required
- Optional Fields:
  - `description` — `string`
  - `short_description` — `string`
  - `sale_price` — `number`
  - `partner_discount_percent` — `number`
  - `stock_quantity` — `number`
  - `images` — `string[]`
  - `media_ids` — `string[]`
  - `tag_slugs` — `string[]`
  - `brand_slug` — `string`
- Example Request JSON:
```json
{ "name": "Product", "slug": "product-1", "sku": "1234", "base_price": 100000, "category_slugs": ["electronics"] }
```
- Example Response JSON:
```json
{ "success": true, "data": { "id": "uuid", "sku": "1234" } }
```

### PATCH /catalog/products/admin/:id
- Auth: admin/super_admin
- Required Fields: none
- Optional Fields: partial of create-product fields
- Example Request JSON:
```json
{ "name": "New name", "base_price": 120000 }
```
- Example Response JSON:
```json
{ "success": true, "data": { "id": "uuid", "name": "New name" } }
```

## Categories

### GET /categories/tree
### GET /categories
### GET /categories/slug/:slug
### GET /categories/:id
- Auth: none
- Required Fields: none
- Optional Fields: none
- Example Response JSON:
```json
{ "success": true, "data": [] }
```

### POST /categories
- Auth: admin
- Required Fields:
  - `name` — `string` — required
  - `slug` — `string` — required
- Optional Fields:
  - `parent_id` — `uuid`
- Example Request JSON:
```json
{ "name": "Phones", "slug": "phones" }
```
- Example Response JSON:
```json
{ "success": true, "data": { "id": "uuid" } }
```

### PATCH /categories/:id
- Auth: admin
- Required Fields: none
- Optional Fields: same as create
- Example Request JSON:
```json
{ "name": "Smartphones" }
```
- Example Response JSON:
```json
{ "success": true, "data": { "id": "uuid", "name": "Smartphones" } }
```

### DELETE /categories/:id
- Auth: admin
- Required Fields: none
- Optional Fields: none
- Example Request JSON: `{}`
- Example Response JSON:
```json
{ "success": true, "data": { "message": "deleted" } }
```

## Brands

### GET /brands
### GET /brands/:id
### GET /brands/slug/:slug
- Auth: none
- Required Fields: none
- Optional Fields: none
- Example Response JSON:
```json
{ "success": true, "data": [] }
```

### POST /brands
- Auth: admin
- Required Fields:
  - `name` — `string` — required
  - `slug` — `string` — required
- Optional Fields:
  - `description` — `string`
  - `logoUrl` — `string`
  - `isActive` — `boolean`
- Example Request JSON:
```json
{ "name": "Apple", "slug": "apple" }
```
- Example Response JSON:
```json
{ "success": true, "data": { "id": "uuid" } }
```

### PATCH /brands/:id
### DELETE /brands/:id
- Auth: admin
- Required Fields: none
- Optional Fields: same as create
- Example Request JSON:
```json
{ "name": "Updated" }
```
- Example Response JSON:
```json
{ "success": true, "data": {} }
```

## Tags

### GET /tags
### GET /tags/:id
### GET /tags/slug/:slug
- Auth: none

### POST /tags
- Auth: admin
- Required Fields:
  - `name` — `string` — required
  - `slug` — `string` — required
- Optional Fields:
  - `isActive` — `boolean`
- Example Request JSON:
```json
{ "name": "Gaming", "slug": "gaming" }
```
- Example Response JSON:
```json
{ "success": true, "data": { "id": "uuid" } }
```

### PATCH /tags/:id
### DELETE /tags/:id
- Auth: admin

## Torob

### POST /torob/products
- Auth: none
- Required Fields: none
- Optional Fields:
  - `page_urls` — `string[]`
  - `page_uniques` — `string[]`
  - `page` — `number`
  - `page_size` — `number`
  - `sort` — `date_added|date_updated`
- Example Request JSON:
```json
{ "page": 1, "page_size": 20 }
```
- Example Response JSON:
```json
{ "api_version": "torob_api_v3", "current_page": 1, "total": 100, "max_pages": 5, "products": [] }
```

## Cart

### GET /cart
- Auth: optional user/guest
- Required Fields: none
- Optional Fields: none
- Example Request JSON: `{}`
- Example Response JSON:
```json
{ "success": true, "data": { "items": [], "totalItems": 0, "totalPrice": 0 } }
```

### POST /cart/items
- Auth: optional user/guest
- Required Fields:
  - `variantId` — `uuid` — required
  - `quantity` — `number` — required
- Optional Fields: none
- Example Request JSON:
```json
{ "variantId": "uuid", "quantity": 1 }
```
- Example Response JSON:
```json
{ "success": true, "data": { "items": [] } }
```

### PATCH /cart/items/:variantId
- Auth: optional user/guest
- Required Fields:
  - `quantity` — `number` — required
- Optional Fields: none
- Example Request JSON:
```json
{ "quantity": 2 }
```
- Example Response JSON:
```json
{ "success": true, "data": { "items": [] } }
```

### DELETE /cart/items/:variantId
### DELETE /cart
- Auth: optional user/guest
- Required Fields: none
- Optional Fields: none
- Example Response JSON:
```json
{ "success": true, "data": {} }
```

## Orders

### POST /orders
- Auth: user
- Required Fields:
  - `addressId` — `uuid` — required
  - `shippingMethodId` — `uuid` — required
  - `paymentMethod` — `online|cash_on_delivery` — required
- Optional Fields:
  - `notes` — `string`
- Example Request JSON:
```json
{ "addressId": "uuid", "shippingMethodId": "uuid", "paymentMethod": "online" }
```
- Example Response JSON:
```json
{ "success": true, "data": { "id": "uuid", "status": "PENDING" } }
```

### GET /orders
### GET /orders/:id
### PATCH /orders/:id/cancel
- Auth: user
- Required Fields: none
- Optional Fields: none
- Example Response JSON:
```json
{ "success": true, "data": {} }
```

### POST /orders/:id/cancel-request
- Auth: user
- Required Fields:
  - `reason` — `string` — required
- Optional Fields: none
- Example Request JSON:
```json
{ "reason": "Please cancel this paid order..." }
```
- Example Response JSON:
```json
{ "success": true, "data": { "id": "uuid", "status": "PENDING" } }
```

### GET /orders/:id/cancel-request
- Auth: user
- Required Fields: none
- Optional Fields: none
- Example Response JSON:
```json
{ "success": true, "data": { "id": "uuid", "status": "PENDING" } }
```

### GET /orders/admin/all
- Auth: admin
- Required Fields: none
- Optional Fields:
  - `page` — `number`
  - `limit` — `number`
  - `status` — `OrderStatus`
- Example Request JSON: `{}`
- Example Response JSON:
```json
{ "success": true, "data": { "data": [], "total": 0 } }
```

### PATCH /orders/admin/:id/status
- Auth: admin
- Required Fields:
  - `status` — `OrderStatus` — required
- Optional Fields: none
- Example Request JSON:
```json
{ "status": "SHIPPED" }
```
- Example Response JSON:
```json
{ "success": true, "data": { "id": "uuid", "status": "SHIPPED" } }
```

### GET /orders/admin/cancel-requests/all
- Auth: admin
- Required Fields: none
- Optional Fields: none
- Example Response JSON:
```json
{ "success": true, "data": [] }
```

### PATCH /orders/admin/cancel-requests/:id/review
- Auth: admin
- Required Fields:
  - `status` — `APPROVED|REJECTED` — required
- Optional Fields:
  - `adminNote` — `string`
- Example Request JSON:
```json
{ "status": "APPROVED", "adminNote": "Approved" }
```
- Example Response JSON:
```json
{ "success": true, "data": { "id": "uuid", "status": "APPROVED" } }
```

## Payments

### POST /payments/initiate
- Auth: user
- Required Fields:
  - `orderId` — `uuid` — required
- Optional Fields: none
- Example Request JSON:
```json
{ "orderId": "uuid" }
```
- Example Response JSON:
```json
{ "success": true, "data": { "paymentId": "uuid", "paymentUrl": "https://..." } }
```

### GET /payments/callback/:provider
- Auth: none
- Required Fields:
  - `paymentId` — `string` — query required
- Optional Fields: gateway callback params
- Example Request JSON: `{}`
- Example Response JSON:
```json
{ "redirect": "/payment/callback?status=success&orderId=..." }
```

### GET /payments/admin/all
- Auth: admin/super_admin
- Required Fields: none
- Optional Fields:
  - `page` — `number`
  - `limit` — `number`
  - `status` — `pending|success|failed`
- Example Request JSON: `{}`
- Example Response JSON:
```json
{ "success": true, "data": { "data": [], "total": 0 } }
```

## Shipping

### GET /shipping-methods
- Auth: none
- Required Fields: none
- Optional Fields: none
- Example Response JSON:
```json
{ "success": true, "data": [] }
```

### GET /shipping-methods/admin/all
- Auth: admin
- Required Fields: none
- Optional Fields: none
- Example Response JSON:
```json
{ "success": true, "data": [] }
```

### POST /shipping-methods
- Auth: admin
- Required Fields:
  - `name` — `string` — required
  - `cost` — `number` — required
- Optional Fields:
  - `description` — `string`
  - `estimated_days` — `number`
  - `is_active` — `boolean`
  - `is_pay_on_delivery` — `boolean`
  - `sort_order` — `number`
- Example Request JSON:
```json
{ "name": "Express", "cost": 50000 }
```
- Example Response JSON:
```json
{ "success": true, "data": { "id": "uuid" } }
```

### PATCH /shipping-methods/:id
### DELETE /shipping-methods/:id
- Auth: admin
- Required Fields: none
- Optional Fields: same as create

## Campaigns

### GET /campaigns
### GET /campaigns/:id
- Auth: none
- Required Fields: none
- Optional Fields:
  - `page` — `number`
  - `limit` — `number`

### POST /campaigns
- Auth: admin
- Required Fields:
  - `title` — `string` — required
  - `type` — `percentage|fixed` — required
  - `value` — `number` — required
  - `startsAt` — `string(date)` — required
  - `endsAt` — `string(date)` — required
- Optional Fields:
  - `isActive` — `boolean`
- Example Request JSON:
```json
{ "title": "Nowruz", "type": "percentage", "value": 15, "startsAt": "2026-03-01T00:00:00.000Z", "endsAt": "2026-03-31T23:59:59.000Z" }
```
- Example Response JSON:
```json
{ "success": true, "data": { "id": "uuid" } }
```

### PUT /campaigns/:id
### DELETE /campaigns/:id
### POST /campaigns/:id/products/:productId
### DELETE /campaigns/:id/products/:productId
- Auth: admin

## Blogs

### GET /blogs
### GET /blogs/published
### GET /blogs/slug/:slug
### GET /blogs/:id
### POST /blogs/:id/view
- Auth: none

### POST /blogs
- Auth: admin
- Required Fields:
  - `title` — `string` — required
  - `slug` — `string` — required
  - `content` — `string` — required
- Optional Fields:
  - `excerpt` — `string`
  - `featuredImage` — `string`
  - `status` — `string`
  - `tags` — `string[]`
  - `readingTime` — `number`
  - `metaTitle` — `string`
  - `metaDescription` — `string`
  - `metaKeywords` — `string[]`
- Example Request JSON:
```json
{ "title": "Post", "slug": "post", "content": "..." }
```
- Example Response JSON:
```json
{ "success": true, "data": { "id": "uuid" } }
```

### PATCH /blogs/:id
### DELETE /blogs/:id
- Auth: admin

## Banners

### GET /banners
### GET /banners/position/:position
### GET /banners/:id
### POST /banners/:id/view
### POST /banners/:id/click
- Auth: none

### POST /banners
- Auth: admin
- Required Fields:
  - `title` — `string` — required
  - `imageUrl` — `string(url)` — required
  - `position` — `enum` — required
- Optional Fields:
  - `description` — `string`
  - `mobileImageUrl` — `string(url)`
  - `linkUrl` — `string(url)`
  - `order` — `number`
  - `isActive` — `boolean`
  - `startDate` — `string(date)`
  - `endDate` — `string(date)`
- Example Request JSON:
```json
{ "title": "Hero", "imageUrl": "https://...", "position": "HOME_HERO" }
```
- Example Response JSON:
```json
{ "success": true, "data": { "id": "uuid" } }
```

### PATCH /banners/:id
### DELETE /banners/:id
- Auth: admin

## Media

### POST /media/upload
- Auth: admin
- Required Fields:
  - `file` — `multipart file` — required
- Optional Fields:
  - `usage` — `MediaUsage`
  - `entityId` — `uuid`
  - `alt` — `string`
- Example Request JSON:
```json
{}
```
- Example Response JSON:
```json
{ "success": true, "data": { "id": "uuid", "url": "https://..." } }
```

### POST /media/upload-multiple
- Auth: admin
- Required Fields:
  - `files` — `multipart file[]` — required
- Optional Fields:
  - `usage` — `MediaUsage`
  - `entityId` — `uuid`

### POST /media/register-by-url
- Auth: admin
- Required Fields:
  - `url` — `string(url)` — required
  - `usage` — `MediaUsage` — required
- Optional Fields:
  - `entityId` — `uuid`
  - `type` — `MediaType`
  - `alt` — `string`
  - `caption` — `string`
  - `order` — `number`
- Example Request JSON:
```json
{ "url": "https://...", "usage": "product" }
```
- Example Response JSON:
```json
{ "success": true, "data": { "id": "uuid" } }
```

### POST /media/reorder
- Auth: admin
- Required Fields:
  - `mediaIds` — `string[]` — required
- Optional Fields: none
- Example Request JSON:
```json
{ "mediaIds": ["uuid1", "uuid2"] }
```
- Example Response JSON:
```json
{ "success": true, "data": { "message": "Media reordered successfully" } }
```

### GET /media
### GET /media/entity/:usage/:entityId
### GET /media/:id
- Auth: none

### PATCH /media/:id
- Auth: admin
- Required Fields: none
- Optional Fields:
  - `alt` — `string`
  - `caption` — `string`
  - `order` — `number`
  - `entityId` — `uuid`
  - `usage` — `MediaUsage`

### DELETE /media/:id
- Auth: admin
