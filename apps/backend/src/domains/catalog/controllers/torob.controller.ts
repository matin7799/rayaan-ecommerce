import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import type {
  TorobProductsRequestDto,
  TorobProductsResponseDto,
} from '../dto/torob-feed.dto';
import { CatalogService } from '../services/catalog.service';
import { TorobTokenGuard } from '../guards/torob-token.guard';

@Controller('torob')
@UseGuards(TorobTokenGuard)
export class TorobController {
  constructor(private readonly catalogService: CatalogService) {}

  @Post('products')
  async getProducts(
    @Body() dto: TorobProductsRequestDto,
  ): Promise<TorobProductsResponseDto> {
    return this.catalogService.getTorobFeed(dto);
  }
}
