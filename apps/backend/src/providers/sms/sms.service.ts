// apps/backend/src/providers/sms/sms.service.ts

import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SmsProvider } from './interfaces/sms-provider.interface';
import { MeliPayamakProvider } from './providers/melipayamak.provider';
import { SmsIrProvider } from './providers/sms-ir.provider';

type SmsProviderName = 'melipayamak' | 'smsir';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly melipayamakProvider: MeliPayamakProvider,
    private readonly smsIrProvider: SmsIrProvider,
  ) {}

  async sendOtp(phone: string, code: string): Promise<void> {
    const providerName = this.getActiveProviderName();
    const provider = this.getProvider(providerName);

    this.logger.log(
      `Sending OTP using ${providerName} provider to ${this.maskPhone(phone)}`,
    );

    await provider.sendOtp({
      phone,
      code,
    });
  }

  private getActiveProviderName(): SmsProviderName {
    const provider =
      this.configService.get<string>('SMS_PROVIDER') || 'melipayamak';

    switch (provider) {
      case 'melipayamak':
      case 'smsir':
        return provider;

      default:
        throw new ServiceUnavailableException({
          code: 'SMS_PROVIDER_NOT_SUPPORTED',
          message: `Unsupported SMS provider: ${provider}`,
        });
    }
  }

  private getProvider(providerName: SmsProviderName): SmsProvider {
    switch (providerName) {
      case 'melipayamak':
        return this.melipayamakProvider;

      case 'smsir':
        return this.smsIrProvider;
    }
  }

  private maskPhone(phone: string): string {
    if (phone.length < 7) return phone;
    return `${phone.slice(0, 4)}***${phone.slice(-3)}`;
  }
}
