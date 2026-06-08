import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Auth } from '../../common/decorators/auth.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { PaymentsService } from './payments.service';
import { PaymentProvider } from './enums/payment-provider.enum';
import { PaymentStatus } from './enums/payment-status.enum';
import {
  CallbackPaymentResponseDto,
  InitiatePaymentDto,
  InitiatePaymentResponseDto,
} from './dto';

@ApiTags('Payments')
@UseGuards(ThrottlerGuard)
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly configService: ConfigService,
  ) {}

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
  async initiatePayment(
    @Body() dto: InitiatePaymentDto,
    @Req() req: Request,
  ): Promise<InitiatePaymentResponseDto> {
    const userId = (req as any).user.id;
    this.logger.log(
      `initiate payment requested. orderId=${dto.orderId}, provider=${dto.provider ?? 'default'}, userId=${userId}`,
    );

    return this.paymentsService.initiatePayment(
      dto.orderId,
      userId,
      dto.provider,
    );
  }

  @Get('callback/:provider')
  @Post('callback/:provider')
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
    description: 'شناسه داخلی پرداخت',
    type: String,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'نتیجه پردازش callback',
    type: CallbackPaymentResponseDto,
  })
  async handleCallback(
    @Param('provider') provider: PaymentProvider,
    @Query('paymentId') paymentId: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const resolvedPaymentId = (paymentId ||
      req.body?.paymentId ||
      req.body?.providerId ||
      req.query?.providerId ||
      '') as string;

    if (!resolvedPaymentId?.trim()) {
      throw new BadRequestException('paymentId is required');
    }

    this.logger.log(
      `payment callback received. provider=${provider}, paymentId=${resolvedPaymentId}`,
    );

    const fullPayload = { ...req.query, ...req.body };

    const result = await this.paymentsService.handleCallback(
      provider,
      resolvedPaymentId,
      fullPayload,
    );

    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3001',
    );

    const callbackUrl = new URL('/payment/callback', frontendUrl);
    callbackUrl.searchParams.set(
      'status',
      result.success ? 'success' : 'failed',
    );
    callbackUrl.searchParams.set('message', result.message);
    callbackUrl.searchParams.set('orderId', result.orderId);
    if (result.refId) callbackUrl.searchParams.set('refId', result.refId);
    if (result.authority) {
      callbackUrl.searchParams.set('authority', result.authority);
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
