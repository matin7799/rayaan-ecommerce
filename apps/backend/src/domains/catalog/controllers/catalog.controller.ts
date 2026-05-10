import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';

import {
  CatalogListResponseDto,
  ProductDetailResponseDto,
} from '../dto/product-response.dto';

import { CreateProductDto } from '../dto/create-product.dto';
import { QueryCatalogDto } from '../dto/query-catalog.dto';
import { CatalogService } from '../services/catalog.service';
import { UpdateProductDto } from '../dto/update-product.dto';
import { Auth } from '../../../common/decorators/auth.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import {
  isTorobAttributed,
  refreshTorobAttribution,
} from '../../../common/utils/torob-attribution.util';

@ApiTags('Catalog')
@UseGuards(ThrottlerGuard)
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('products')
  @ApiOperation({ summary: 'Get catalog products' })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    type: CatalogListResponseDto,
  })
  async getProducts(
    @Query() query: QueryCatalogDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CatalogListResponseDto> {
    refreshTorobAttribution(req, res);
    res.setHeader(
      'X-Pricing-Channel',
      isTorobAttributed(req) ? 'torob' : 'public',
    );
    return this.catalogService.findAll(query, req.user as any, req);
  }

  @Get('products/:slug')
  @ApiOperation({ summary: 'Get product details by slug' })
  @ApiParam({ name: 'slug', description: 'Product slug' })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    type: ProductDetailResponseDto,
  })
  async getProduct(
    @Param('slug') slug: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ProductDetailResponseDto> {
    refreshTorobAttribution(req, res);
    res.setHeader(
      'X-Pricing-Channel',
      isTorobAttributed(req) ? 'torob' : 'public',
    );
    return this.catalogService.findOneBySlug(slug, req.user as any, req);
  }

  @Post('products')
  @Auth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: ProductDetailResponseDto,
  })
  async createProduct(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductDetailResponseDto> {
    return this.catalogService.createProduct(createProductDto);
  }

  @Patch('products/admin/:id')
  @Auth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiOperation({ summary: 'Admin update product' })
  async updateProductByAdmin(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductDetailResponseDto> {
    return this.catalogService.updateProductByAdmin(id, dto);
  }
}
