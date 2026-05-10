// apps/backend/src/domains/cart/cart.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { OptionalAuth } from '../../common/decorators/optional-auth.decorator';
import type { ICart } from './interfaces';
import {
  isTorobAttributed,
  refreshTorobAttribution,
} from '../../common/utils/torob-attribution.util';

@OptionalAuth()
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * Get user/session identifier for cart
   * If user is authenticated, use userId
   * If guest, use session ID from cookie or generate new one
   */
  private getCartIdentifier(req: Request, res: Response): string {
    // Check if user is authenticated
    const user = (req as any).user;
    if (user && user.id) {
      return `user:${user.id}`;
    }

    // For guest users, use session ID from cookie or generate new one
    let sessionId = req.cookies?.['cart_session_id'];
    if (!sessionId) {
      sessionId = `guest:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      // Set cookie for 30 days
      res.cookie('cart_session_id', sessionId, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax',
      });
    }
    return sessionId;
  }

  @Get()
  async getCart(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ICart> {
    const cartId = this.getCartIdentifier(req, res);
    return this.cartService.getCart(cartId);
  }

  @Post('items')
  async addItem(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: AddToCartDto,
  ): Promise<ICart> {
    const cartId = this.getCartIdentifier(req, res);
    refreshTorobAttribution(req, res);
    return this.cartService.addToCart(
      cartId,
      dto,
      isTorobAttributed(req),
      (req as any).user,
    );
  }

  @Patch('items/:variantId')
  async updateItemQuantity(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Body() dto: UpdateCartItemDto,
  ): Promise<ICart> {
    const cartId = this.getCartIdentifier(req, res);
    return this.cartService.updateItemQuantity(cartId, variantId, dto.quantity);
  }

  @Delete('items/:variantId')
  async removeItem(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Param('variantId', ParseUUIDPipe) variantId: string,
  ): Promise<ICart> {
    const cartId = this.getCartIdentifier(req, res);
    return this.cartService.removeItem(cartId, variantId);
  }

  @Delete()
  async clearCart(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const cartId = this.getCartIdentifier(req, res);
    return this.cartService.clearCart(cartId);
  }
}
