import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  SmsProvider,
  SendOtpPayload,
} from '../interfaces/sms-provider.interface';

@Injectable()
export class MeliPayamakProvider implements SmsProvider {
  private readonly logger = new Logger(MeliPayamakProvider.name);

  private readonly apiUrl: string;
  private readonly username: string;
  private readonly password: string;
  private readonly bodyId: number;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl =
      this.configService.get<string>('MELIPAYAMAK_PATTERN_API_URL') ??
      'https://rest.payamak-panel.com/api/SendSMS/BaseServiceNumber';

    this.username = this.configService.getOrThrow<string>(
      'MELIPAYAMAK_USERNAME',
    );

    this.password = this.configService.getOrThrow<string>(
      'MELIPAYAMAK_PASSWORD',
    );

    this.bodyId = Number(
      this.configService.getOrThrow<string>('MELIPAYAMAK_OTP_BODY_ID'),
    );
  }

  async sendOtp({ phone, code }: SendOtpPayload): Promise<void> {
    try {
      const payload = {
        username: this.username,
        password: this.password,
        text: code, // چون pattern شما از {0} استفاده می‌کند
        to: phone,
        bodyId: this.bodyId,
      };

      this.logger.log(
        `Sending OTP with MeliPayamak pattern. phone=${phone}, bodyId=${this.bodyId}`,
      );

      const response = await firstValueFrom(
        this.httpService.post(this.apiUrl, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }),
      );

      const data = response.data;

      this.logger.log(`MeliPayamak pattern response: ${JSON.stringify(data)}`);

      const value = Number(data?.Value ?? data?.value);

      const isSuccess =
        data?.RetStatus === 1 ||
        data?.retStatus === 1 ||
        (!Number.isNaN(value) && value > 0);

      if (!isSuccess) {
        this.logger.error(
          `MeliPayamak pattern sending failed: ${JSON.stringify(data)}`,
        );

        throw new InternalServerErrorException('SMS pattern sending failed');
      }

      this.logger.log(`OTP sent successfully via MeliPayamak to ${phone}`);
    } catch (error: any) {
      this.logger.error(
        `MeliPayamak pattern request failed: ${error?.message}`,
        error?.stack,
      );

      throw new InternalServerErrorException('Failed to send OTP');
    }
  }
}
