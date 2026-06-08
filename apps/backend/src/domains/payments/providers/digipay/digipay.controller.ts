import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  BadRequestException,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { Auth } from '../../../../common/decorators/auth.decorator';
import { Role } from '../../../auth/enums/role.enum';
import { DigipayService } from './digipay.service';
import { DigipayRefundService } from './digipay-refund.service';
import {
  DIGIPAY_INSTALLMENT_PLANS,
  DIGIPAY_LIMITS_CONFIG,
} from './digipay.constants';
import { DataSource } from 'typeorm';
import { Order } from '../../../orders/entities/order.entity';
import { Payment } from '../../entities/payment.entity';
import { PaymentStatus } from '../../enums/payment-status.enum';
import { randomUUID } from 'crypto';

@ApiTags('Digipay')
@Controller('digipay')
export class DigipayController {
  constructor(
    private readonly digipayService: DigipayService,
    private readonly digipayRefundService: DigipayRefundService,
    private readonly dataSource: DataSource,
  ) {}

  @Get('plans')
  @ApiOperation({ summary: 'دریافت طرح‌های اقساط و اعتباری فعال دیجی‌پی' })
  @ApiResponse({
    status: 200,
    description: 'لیست طرح‌ها با نرخ بهره و اطلاعات اقساط',
  })
  getInstallmentPlans() {
    return {
      success: true,
      plans: DIGIPAY_INSTALLMENT_PLANS,
      config: DIGIPAY_LIMITS_CONFIG,
    };
  }

  @Post('deliver')
  @Auth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'ثبت تحویل سفارش در دیجی‌پی (مخصوص سفارش‌های اقساطی/اعتباری)',
  })
  @ApiResponse({
    status: 200,
    description: 'وضعیت تحویل با موفقیت به دیجی‌پی گزارش شد',
  })
  async deliverDigipayOrder(
    @Body()
    body: {
      orderId: string;
      invoiceNumber: string;
      type?: number;
    },
  ) {
    const { orderId, invoiceNumber, type = 5 } = body;
    if (!orderId || !invoiceNumber) {
      throw new BadRequestException(
        'وارد کردن شناسه سفارش و شماره فاکتور الزامی است',
      );
    }

    const order = await this.dataSource.getRepository(Order).findOne({
      where: { id: orderId },
    });
    if (!order) {
      throw new BadRequestException('سفارش یافت نشد');
    }

    const payment = await this.dataSource.getRepository(Payment).findOne({
      where: {
        order_id: orderId,
        status: PaymentStatus.SUCCESS,
        provider: 'digipay' as any,
      },
    });
    if (!payment || !payment.provider_ref_id) {
      throw new BadRequestException(
        'تراکنش موفق پرداخت دیجی‌پی برای این سفارش یافت نشد',
      );
    }

    const productCodes = order.items.map(
      (item) =>
        item.variant_sku || item.product_slug || String(item.product_id),
    );

    const response = await this.digipayService.deliverPurchase(
      {
        deliveryDate: Date.now(),
        invoiceNumber,
        trackingCode: payment.provider_ref_id,
        products: productCodes,
      },
      type,
    );

    if (response.result.status !== 0) {
      throw new BadRequestException(
        response.result.message || 'ثبت وضعیت تحویل در دیجی‌پی ناموفق بود',
      );
    }

    return {
      success: true,
      message: 'تحویل سفارش اعتباری با موفقیت در سیستم دیجی‌پی ثبت شد',
    };
  }

  @Post('reverse')
  @Auth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'بازگشت وجه دستی خرید در دیجی‌پی (حداکثر ۲۵ دقیقه پس از تأیید)',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'نوع تیکت: 0=IPG, 11=Wallet',
    type: Number,
  })
  async reverseDigipayOrder(
    @Body() body: { orderId: string },
    @Query('type', new DefaultValuePipe(0), ParseIntPipe) type: number,
  ) {
    const { orderId } = body;
    if (!orderId) {
      throw new BadRequestException('شناسه سفارش الزامی است');
    }

    const payment = await this.dataSource.getRepository(Payment).findOne({
      where: {
        order_id: orderId,
        status: PaymentStatus.SUCCESS,
        provider: 'digipay' as any,
      },
    });
    if (!payment || !payment.provider_ref_id) {
      throw new BadRequestException(
        'تراکنش موفق پرداخت دیجی‌پی برای این سفارش یافت نشد',
      );
    }

    const response = await this.digipayService.reversePurchase(
      payment.provider_ref_id,
      payment.id,
      type,
    );

    if (response.result.status !== 0) {
      throw new BadRequestException(
        response.result.message || 'بازگشت وجه دستی در دیجی‌پی ناموفق بود',
      );
    }

    return {
      success: true,
      message: 'بازگشت وجه دستی با موفقیت در دیجی‌پی ثبت شد',
      data: response,
    };
  }

  @Post('refund')
  @Auth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'ثبت درخواست بازگشت وجه (عودت) برای سفارش دیجی‌پی',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'نوع تیکت: 0=IPG, 5=Credit, 11=Wallet, 13=BNPL',
    type: Number,
  })
  async refundDigipayOrder(
    @Body() body: { orderId: string; amountTomans: number },
    @Query('type', new DefaultValuePipe(0), ParseIntPipe) type: number,
  ) {
    const { orderId, amountTomans } = body;
    if (!orderId || !amountTomans || amountTomans <= 0) {
      throw new BadRequestException('شناسه سفارش و مبلغ بازگشت وجه الزامی است');
    }

    const payment = await this.dataSource.getRepository(Payment).findOne({
      where: {
        order_id: orderId,
        status: PaymentStatus.SUCCESS,
        provider: 'digipay' as any,
      },
    });
    if (!payment || !payment.provider_ref_id) {
      throw new BadRequestException(
        'تراکنش موفق پرداخت دیجی‌پی برای این سفارش یافت نشد',
      );
    }

    const amountInRials = Math.floor(amountTomans * 10);

    const response = await this.digipayRefundService.refundPurchase(
      {
        providerId: `refund_${randomUUID()}`,
        amount: amountInRials,
        saleTrackingCode: payment.provider_ref_id,
      },
      type,
    );

    if (response.result.status !== 0) {
      throw new BadRequestException(
        response.result.message || 'عملیات بازگشت وجه در دیجی‌پی ناموفق بود',
      );
    }

    return {
      success: true,
      message: 'درخواست بازگشت وجه با موفقیت در دیجی‌پی ثبت شد',
      refundTrackingCode: response.trackingCode,
    };
  }

  @Get('refund-inquiry/:inquiryId')
  @Auth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'استعلام وضعیت ریفاند از دیجی‌پی' })
  @ApiParam({
    name: 'inquiryId',
    description: 'کد پیگیری یا providerId مربوط به ریفاند',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'نوع تیکت: 0=IPG, 5=Credit, 11=Wallet, 13=BNPL',
    type: Number,
  })
  async getRefundInquiry(
    @Param('inquiryId') inquiryId: string,
    @Query('type', new DefaultValuePipe(0), ParseIntPipe) type: number,
  ) {
    if (!inquiryId) {
      throw new BadRequestException('شناسه استعلام الزامی است');
    }
    const result = await this.digipayRefundService.getRefundInquiry(
      inquiryId,
      type,
    );
    return { success: true, data: result };
  }
}
