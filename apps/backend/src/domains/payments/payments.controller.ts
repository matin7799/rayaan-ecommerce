import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { Auth } from '../../common/decorators/auth.decorator';
import { PaymentStatus } from './enums/payment-status.enum';
import {
  InitiatePaymentDto,
  InitiatePaymentResponseDto,
  CallbackPaymentResponseDto,
} from './dto';
import { PaymentProvider } from './enums/payment-provider.enum';

// ──────────────────────────────────────────────────────
// کنترلر پرداخت — طبق API Contract (06-api-contracts.md)
// دو endpoint:
//   POST /api/v1/payments/initiate     → شروع پرداخت (نیاز به auth)
//   POST /api/v1/payments/callback/:provider → دریافت callback (بدون auth)
// ──────────────────────────────────────────────────────

@ApiTags('Payments')
@UseGuards(ThrottlerGuard)
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  // ────────────────────────────────────────────
  // شروع پرداخت — کاربر احراز هویت شده
  // ورودی: orderId
  // خروجی: paymentId + paymentUrl (لینک ریدایرکت به درگاه)
  // ────────────────────────────────────────────
  @Post('initiate')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'شروع فرآیند پرداخت برای یک سفارش' })
  @ApiResponse({
    status: 200,
    description: 'لینک پرداخت با موفقیت ایجاد شد',
    type: InitiatePaymentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'سفارش یافت نشد' })
  @ApiResponse({ status: 400, description: 'سفارش قابل پرداخت نیست' })
  async initiatePayment(
    @Body() dto: InitiatePaymentDto,
    @Req() req: Request,
  ): Promise<InitiatePaymentResponseDto> {
    // userId از JWT token استخراج می‌شود
    const userId = (req as any).user.id;

    this.logger.log(
      `درخواست شروع پرداخت: orderId=${dto.orderId}, userId=${userId}`,
    );

    return this.paymentsService.initiatePayment(dto.orderId, userId);
  }

  // ────────────────────────────────────────────
  // دریافت callback از درگاه پرداخت
  // این endpoint بدون auth است چون درگاه آن را فراخوانی می‌کند
  // provider از URL path و paymentId از query string گرفته می‌شود
  // ────────────────────────────────────────────
  @Get('callback/:provider')
  @Throttle({ default: { limit: 120, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت callback از درگاه پرداخت' })
  @ApiParam({
    name: 'provider',
    enum: PaymentProvider,
    description: 'نام درگاه پرداخت',
  })
  @ApiQuery({
    name: 'paymentId',
    description: 'شناسه پرداخت',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'نتیجه پردازش callback',
    type: CallbackPaymentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'پرداخت یافت نشد' })
  async handleCallback(
    @Param('provider') provider: PaymentProvider,
    @Query('paymentId') paymentId: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.log(
      `callback دریافت شد: provider=${provider}, paymentId=${paymentId}`,
    );

    // ────────────────────────────────────────────
    // ترکیب query params و body برای ارسال کامل payload به service
    // زرین‌پال اطلاعات را در query string می‌فرستد
    // ────────────────────────────────────────────
    const fullPayload = {
      ...req.query,
    };

    const result = await this.paymentsService.handleCallback(
      provider,
      paymentId,
      fullPayload,
    );

    // Redirect to frontend callback page
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const callbackUrl = new URL('/payment/callback', frontendUrl);

    // Pass payment result as query params
    callbackUrl.searchParams.set(
      'status',
      result.success ? 'success' : 'failed',
    );
    callbackUrl.searchParams.set('orderId', result.orderId);
    if (result.refId) {
      callbackUrl.searchParams.set('refId', result.refId);
    }

    res.redirect(callbackUrl.toString());
  }

  @Get('admin/all')
  @Auth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @ApiOperation({ summary: 'لیست پرداخت‌ها برای ادمین' })
  async getAllPaymentsForAdmin(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: string,
  ) {
    const validStatus =
      status && Object.values(PaymentStatus).includes(status as PaymentStatus)
        ? (status as PaymentStatus)
        : undefined;

    return this.paymentsService.getAllPaymentsForAdmin({
      page,
      limit,
      status: validStatus,
    });
  }
}
