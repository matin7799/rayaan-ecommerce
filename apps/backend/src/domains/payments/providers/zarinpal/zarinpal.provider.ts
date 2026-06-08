import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ZarinPal from 'zarinpal-node-sdk';
import {
  IPaymentProvider,
  PaymentInquiryResult,
  PaymentRequestInput,
  PaymentRequestResult,
  PaymentVerifyResult,
} from '../payment-provider.interface';
import {
  ZarinpalCallbackPayload,
  ZarinpalInquiryResponseData,
  ZarinpalSdkConfig,
  ZarinpalVerifyResponseData,
} from './zarinpal.types';
import {
  isTemporaryGatewayError,
  isValidMerchantId,
  normalizeAmountToRials,
  stringifyError,
} from './zarinpal.utils';

const ZARINPAL_MIN_AMOUNT_IRR = 10_000;
const ZARINPAL_MAX_AMOUNT_IRR = 4_000_000_000;

@Injectable()
export class ZarinpalProvider implements IPaymentProvider {
  readonly providerName = 'zarinpal';
  private readonly logger = new Logger(ZarinpalProvider.name);
  private readonly client: ZarinPal;
  private readonly merchantId: string;
  private readonly sandbox: boolean;

  constructor(private readonly configService: ConfigService) {
    this.sandbox =
      this.configService.get<string>('ZARINPAL_SANDBOX', 'true') === 'true';

    this.merchantId = this.configService
      .get<string>('ZARINPAL_MERCHANT_ID', '')
      .trim();

    const accessToken = this.configService
      .get<string>('ZARINPAL_ACCESS_TOKEN', '')
      .trim();

    if (!isValidMerchantId(this.merchantId)) {
      throw new Error(
        'Invalid ZARINPAL_MERCHANT_ID. Expected a valid 36-character merchant id.',
      );
    }

    const sdkConfig: ZarinpalSdkConfig = {
      merchantId: this.merchantId,
      sandbox: this.sandbox,
      ...(accessToken ? { accessToken } : {}),
    };

    this.client = new ZarinPal(sdkConfig);

    this.logger.log(
      `Zarinpal SDK initialized in ${this.sandbox ? 'sandbox' : 'production'} mode`,
    );
  }

  async requestPayment(
    input: PaymentRequestInput,
  ): Promise<PaymentRequestResult> {
    const amount = normalizeAmountToRials(input.amount);

    if (amount < ZARINPAL_MIN_AMOUNT_IRR) {
      throw new BadRequestException(
        `حداقل مبلغ قابل پرداخت زرین‌پال ${ZARINPAL_MIN_AMOUNT_IRR.toLocaleString('fa-IR')} ریال است.`,
      );
    }

    if (amount > ZARINPAL_MAX_AMOUNT_IRR) {
      throw new BadRequestException(
        `حداکثر مبلغ قابل پرداخت زرین‌پال ${ZARINPAL_MAX_AMOUNT_IRR.toLocaleString('fa-IR')} ریال است. لطفاً سفارش را کوچک‌تر کنید یا روش پرداخت دیگری انتخاب کنید.`,
      );
    }

    try {
      const requestPayload = {
        amount,
        callback_url: input.callbackUrl,
        description: input.description,
        mobile: input.mobile,
        email: input.email,
        cardPan: input.cardPan,
        referrer_id: input.referrerId,
        currency: input.currency,
        wages: input.wages,
      };

      const response = await this.client.payments.create(requestPayload);

      const data = (response?.data ?? response) as {
        code?: number;
        authority?: string;
        message?: string;
      };

      if (data.code !== 100 || !data.authority) {
        throw new Error(
          `Zarinpal request failed. code=${data.code}, message=${data.message ?? 'Unknown error'}`,
        );
      }

      const paymentUrl = this.client.payments.getRedirectUrl(data.authority);

      return {
        authority: data.authority,
        paymentUrl,
        rawPayload: this.toRawPayload(response),
      };
    } catch (error) {
      this.logger.error(
        `Zarinpal requestPayment failed: ${stringifyError(error)}`,
      );

      if (isTemporaryGatewayError(error)) {
        throw new ServiceUnavailableException(
          'اتصال به درگاه پرداخت موقتاً برقرار نیست. لطفاً کمی بعد دوباره تلاش کنید.',
        );
      }

      const gatewayError = this.getGatewayError(error);
      if (gatewayError?.code === -9 || gatewayError?.message) {
        throw new BadRequestException(
          gatewayError.message ||
            'درخواست پرداخت توسط زرین‌پال رد شد. لطفاً اطلاعات سفارش را بررسی کنید.',
        );
      }

      throw error;
    }
  }

  async verifyPayment(input: {
    authority: string;
    amount: number;
    status?: string;
    payload?: Record<string, unknown>;
  }): Promise<PaymentVerifyResult> {
    const payload = (input.payload ?? {}) as ZarinpalCallbackPayload;

    if (input.status === 'NOK' || payload.Status === 'NOK') {
      return {
        success: false,
        refId: null,
        authority: input.authority,
        cardPan: null,
        fee: null,
        rawPayload: payload,
      };
    }

    try {
      const response = await this.client.verifications.verify({
        authority: input.authority,
        amount: normalizeAmountToRials(input.amount),
      });

      const data = (response?.data ?? response) as ZarinpalVerifyResponseData;
      const code = Number(data.code);
      const isSuccess = code === 100 || code === 101;

      return {
        success: isSuccess,
        alreadyVerified: code === 101,
        refId: isSuccess && data.ref_id ? String(data.ref_id) : null,
        authority: input.authority,
        cardPan: data.card_pan ?? null,
        fee: typeof data.fee === 'number' ? data.fee : null,
        rawPayload: {
          ...payload,
          verifyResponse: this.toRawPayload(response),
        },
      };
    } catch (error) {
      this.logger.error(
        `Zarinpal verifyPayment failed: ${stringifyError(error)}`,
      );

      if (isTemporaryGatewayError(error)) {
        throw new ServiceUnavailableException(
          'ارتباط با زرین‌پال هنگام تأیید پرداخت موقتاً برقرار نیست.',
        );
      }

      return {
        success: false,
        refId: null,
        authority: input.authority,
        cardPan: null,
        fee: null,
        rawPayload: {
          ...payload,
          verifyError: stringifyError(error),
        },
      };
    }
  }

  async inquiryPayment(authority: string): Promise<PaymentInquiryResult> {
    try {
      const response = await this.client.inquiries.inquire({ authority });
      const data = (response?.data ?? response) as ZarinpalInquiryResponseData;

      return {
        success: Number(data.code) === 100,
        status: data.status,
        code: typeof data.code === 'number' ? data.code : undefined,
        rawPayload: this.toRawPayload(response),
      };
    } catch (error) {
      this.logger.error(
        `Zarinpal inquiryPayment failed: ${stringifyError(error)}`,
      );

      if (isTemporaryGatewayError(error)) {
        throw new ServiceUnavailableException(
          'استعلام تراکنش از زرین‌پال موقتاً در دسترس نیست.',
        );
      }

      throw error;
    }
  }

  private toRawPayload(value: unknown): Record<string, unknown> {
    if (value && typeof value === 'object') {
      return value as Record<string, unknown>;
    }
    return { value: String(value) };
  }

  private getGatewayError(
    error: unknown,
  ): { code?: number; message?: string } | null {
    if (!error || typeof error !== 'object' || !('response' in error)) {
      return null;
    }

    const response = (
      error as {
        response?: {
          data?: {
            errors?: {
              code?: unknown;
              message?: unknown;
            };
          };
        };
      }
    ).response;

    const gatewayErrors = response?.data?.errors;
    if (!gatewayErrors) {
      return null;
    }

    return {
      code:
        typeof gatewayErrors.code === 'number' ? gatewayErrors.code : undefined,
      message:
        typeof gatewayErrors.message === 'string'
          ? gatewayErrors.message
          : undefined,
    };
  }
}
