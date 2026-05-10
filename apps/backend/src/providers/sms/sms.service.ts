// backend/src/providers/sms/sms.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * ارسال پیامک OTP از طریق ملی‌پیامک
   * در محیط development کد رو فقط لاگ می‌کنیم
   */
  async sendOtp(phone: string, code: string): Promise<void> {
    const isDev = this.configService.get('NODE_ENV') === 'development';

    if (isDev) {
      // در محیط توسعه فقط لاگ می‌کنیم - هزینه پیامک نمیدیم
      this.logger.debug(`📱 [DEV] OTP for ${phone}: ${code}`);
      return;
    }

    try {
      const username = this.configService.get<string>('SMS_USERNAME');
      const password = this.configService.get<string>('SMS_PASSWORD');
      const from = this.configService.get<string>('SMS_FROM_NUMBER');

      // ملی‌پیامک از SOAP API استفاده می‌کنه
      const soapBody = `<?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <SendSimpleSMS2 xmlns="http://tempuri.org/">
              <username>${username}</username>
              <password>${password}</password>
              <to>${phone}</to>
              <from>${from}</from>
              <text>کد تایید شما: ${code}</text>
              <isflash>false</isflash>
            </SendSimpleSMS2>
          </soap:Body>
        </soap:Envelope>`;

      const response = await fetch(
        'https://api.payamak-panel.com/post/Send.asmx',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            SOAPAction: 'http://tempuri.org/SendSimpleSMS2',
          },
          body: soapBody,
        },
      );

      if (!response.ok) {
        throw new Error(`SMS API responded with status ${response.status}`);
      }

      this.logger.log(`✅ OTP sent to ${phone}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send OTP to ${phone}`, error);
      // خطای SMS نباید فرآیند رو متوقف کنه - کد در Redis ذخیره شده
      // کاربر می‌تونه دوباره درخواست بده
      throw error;
    }
  }
}
