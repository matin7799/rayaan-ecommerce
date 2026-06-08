// apps/backend/src/providers/sms/providers/sms-ir.provider.ts

import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SendOtpPayload,
  SmsProvider,
} from '../interfaces/sms-provider.interface';

interface SmsIrVerifyResponse {
  status?: number;
  message?: string;
  data?: unknown;
}

@Injectable()
export class SmsIrProvider implements SmsProvider {
  private readonly logger = new Logger(SmsIrProvider.name);

  constructor(private readonly configService: ConfigService) {}

  async sendOtp(payload: SendOtpPayload): Promise<void> {
    const { phone, code } = payload;

    const apiKey = this.configService.get<string>('SMSIR_API_KEY');
    const templateId = this.configService.get<number>('SMSIR_OTP_TEMPLATE_ID');
    const parameterName =
      this.configService.get<string>('SMSIR_OTP_PARAMETER_NAME') || 'CODE';

    if (!apiKey || !templateId) {
      throw new ServiceUnavailableException({
        code: 'SMS_PROVIDER_CONFIG_MISSING',
        message: 'SMS.ir api key or template id is missing',
      });
    }

    try {
      const response = await fetch('https://api.sms.ir/v1/send/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          mobile: phone,
          templateId: Number(templateId),
          parameters: [
            {
              name: parameterName,
              value: code,
            },
          ],
        }),
      });

      const result = (await response
        .json()
        .catch(() => null)) as SmsIrVerifyResponse | null;

      if (!response.ok) {
        this.logger.error(
          `SMS.ir HTTP error. Status: ${response.status}. Body: ${JSON.stringify(
            result,
          )}`,
        );

        throw new ServiceUnavailableException({
          code: 'SMS_SEND_FAILED',
          message: 'Failed to send verification code',
        });
      }

      /**
       * SMS.ir معمولاً status دارد.
       * بسته به نسخه API ممکن است status = 1 یعنی موفق.
       * برای جلوگیری از false negative، فعلاً response.ok را معیار اصلی گذاشته‌ایم.
       * اگر خروجی دقیق پنل را داری، می‌توانیم validation را سخت‌گیرانه‌تر کنیم.
       */
      this.logger.log(
        `OTP sent via SMS.ir to ${this.maskPhone(phone)}. Response: ${JSON.stringify(
          result,
        )}`,
      );
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      this.logger.error(
        `Failed to send OTP via SMS.ir to ${this.maskPhone(phone)}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new ServiceUnavailableException({
        code: 'SMS_SEND_FAILED',
        message: 'Failed to send verification code',
      });
    }
  }

  private maskPhone(phone: string): string {
    if (phone.length < 7) return phone;
    return `${phone.slice(0, 4)}***${phone.slice(-3)}`;
  }
}
