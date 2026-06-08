import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { DigipayAuthService } from './digipay-auth.service';
import {
  DigipayTicketRequest,
  DigipayTicketResponse,
  DigipayVerifyResponse,
  DigipayDeliverRequest,
  DigipayDeliverResponse,
  DigipayReverseRequest,
  DigipayReverseResponse,
} from './digipay.types';

@Injectable()
export class DigipayService {
  private readonly logger = new Logger(DigipayService.name);

  constructor(
    private readonly authService: DigipayAuthService,
    private readonly configService: ConfigService,
  ) {}

  /** Standard headers required by DigiPay for all secured endpoints */
  private async buildAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.authService.getAccessToken();
    return {
      Authorization: `Bearer ${token}`,
      Agent: 'WEB',
      'Digipay-Version': '2022-02-02',
      'Content-Type': 'application/json',
    };
  }

  // ─────────────────────────────────────────────────────────
  // Ticket Creation (Section 5)
  // ─────────────────────────────────────────────────────────

  /**
   * Generates a UPG purchase ticket for Credit, BNPL, Wallet, or IPG.
   * Returns `redirectUrl` to send the user to the DigiPay payment page.
   */
  async createPurchaseTicket(
    payload: DigipayTicketRequest,
  ): Promise<DigipayTicketResponse> {
    if (this.authService.isMockMode) {
      this.logger.log(
        `[MOCK] Creating purchase ticket for amount=${payload.amount} IRR`,
      );
      const mockTicket = `v2:mock_ticket_${Math.random().toString(36).substring(2, 10)}`;

      let mockRedirect: string;
      try {
        const parsedUrl = new URL(payload.callbackUrl);
        parsedUrl.searchParams.set('result', 'SUCCESS');
        parsedUrl.searchParams.set('trackingCode', `MOCK_TRACK_${Date.now()}`);
        parsedUrl.searchParams.set('amount', String(payload.amount));
        parsedUrl.searchParams.set('providerId', payload.providerId);
        mockRedirect = parsedUrl.toString();
      } catch {
        const frontendUrl = this.configService.get<string>(
          'FRONTEND_URL',
          'http://localhost:3001',
        );
        mockRedirect =
          `${frontendUrl}/payment/callback?provider=digipay` +
          `&status=success&paymentId=${payload.providerId}` +
          `&result=SUCCESS&trackingCode=MOCK_TRACK_${Date.now()}` +
          `&amount=${payload.amount}&providerId=${payload.providerId}`;
      }

      return {
        result: {
          title: 'SUCCESS',
          status: 0,
          message: 'عملیات با موفقیت انجام شد (MOCK)',
          level: 'INFO',
        },
        ticket: mockTicket,
        redirectUrl: mockRedirect,
      };
    }

    try {
      const headers = await this.buildAuthHeaders();
      const response = await axios.post<DigipayTicketResponse>(
        `${this.authService.getBaseUrl()}/tickets/business?type=11`,
        payload,
        { headers },
      );

      const data = response.data;
      if (data.result.status !== 0 || !data.ticket) {
        throw new BadRequestException(
          data.result.message || 'درخواست تیکت پرداخت با خطا مواجه شد',
        );
      }

      return data;
    } catch (error: any) {
      const errorMsg = error?.response?.data
        ? JSON.stringify(error.response.data)
        : error.message;
      this.logger.error(
        `Failed to create DigiPay ticket: ${errorMsg}`,
        error.stack,
      );
      throw new BadRequestException(
        error?.response?.data?.result?.message ||
          'خطا در ثبت درخواست تراکنش دیجی‌پی',
      );
    }
  }

  // ─────────────────────────────────────────────────────────
  // Payment Verification (Section 7)
  // ─────────────────────────────────────────────────────────

  /**
   * Verifies a purchase after gateway callback.
   * Must be called ONLY when the callback result indicates success.
   * @param type Payment type: 0=IPG, 5=Credit, 11=Wallet/UPG, 13=BNPL, 24=CreditCard
   */
  async verifyPurchase(
    trackingCode: string,
    providerId: string,
    type = 11,
  ): Promise<DigipayVerifyResponse> {
    if (this.authService.isMockMode) {
      this.logger.log(
        `[MOCK] Verifying purchase trackingCode=${trackingCode}, providerId=${providerId}`,
      );
      return {
        result: {
          status: 0,
          message: 'تأیید تراکنش با موفقیت انجام شد (MOCK)',
          level: 'INFO',
        },
        trackingCode,
        providerId,
        amount: 100_000,
        paymentGateway: 4,
        additionalInfo: {
          prepaymentAmount: 0,
          cashAmount: 0,
          creditAmount: 100_000,
          instantFinalization: true,
          generateInvoice: true,
        },
      };
    }

    try {
      const headers = await this.buildAuthHeaders();
      const response = await axios.post<DigipayVerifyResponse>(
        `${this.authService.getBaseUrl()}/purchases/verify?type=${type}`,
        { trackingCode, providerId },
        { headers },
      );
      return response.data;
    } catch (error: any) {
      const errorMsg = error?.response?.data
        ? JSON.stringify(error.response.data)
        : error.message;
      this.logger.error(
        `Failed to verify DigiPay purchase: ${errorMsg}`,
        error.stack,
      );
      return {
        result: {
          status: error?.response?.data?.result?.status || 9999,
          message:
            error?.response?.data?.result?.message ||
            'خطای تأیید تراکنش دیجی‌پی',
          level: 'ERROR',
        },
        trackingCode,
        providerId,
        amount: 0,
        paymentGateway: 0,
      };
    }
  }

  // ─────────────────────────────────────────────────────────
  // Manual Reverse (Section 8 — within 25 minutes)
  // Only for IPG and DPG payment types
  // ─────────────────────────────────────────────────────────

  async reversePurchase(
    trackingCode: string,
    providerId: string,
    type = 0,
  ): Promise<DigipayReverseResponse> {
    if (this.authService.isMockMode) {
      this.logger.log(`[MOCK] Reversing purchase trackingCode=${trackingCode}`);
      return {
        result: {
          status: 0,
          message: 'بازگشت وجه با موفقیت انجام شد (MOCK)',
          level: 'INFO',
        },
        trackingCode,
        providerId,
        amount: 0,
        paymentGateway: 0,
      };
    }

    const payload: DigipayReverseRequest = { trackingCode, providerId };

    try {
      const headers = await this.buildAuthHeaders();
      const response = await axios.post<DigipayReverseResponse>(
        `${this.authService.getBaseUrl()}/reverse?type=${type}`,
        payload,
        { headers },
      );
      return response.data;
    } catch (error: any) {
      const errorMsg = error?.response?.data
        ? JSON.stringify(error.response.data)
        : error.message;
      this.logger.error(
        `Failed to reverse DigiPay purchase: ${errorMsg}`,
        error.stack,
      );
      return {
        result: {
          status: error?.response?.data?.result?.status || 9999,
          message:
            error?.response?.data?.result?.message ||
            'خطا در بازگشت وجه دستی دیجی‌پی',
          level: 'ERROR',
        },
      };
    }
  }

  // ─────────────────────────────────────────────────────────
  // Delivery Reporting (Section 9 — Credit/BNPL required)
  // ─────────────────────────────────────────────────────────

  async deliverPurchase(
    payload: DigipayDeliverRequest,
    type = 5,
  ): Promise<DigipayDeliverResponse> {
    if (this.authService.isMockMode) {
      this.logger.log(
        `[MOCK] Delivering purchase trackingCode=${payload.trackingCode}`,
      );
      return {
        result: {
          status: 0,
          message: 'عملیات تحویل با موفقیت ثبت شد (MOCK)',
          level: 'INFO',
        },
      };
    }

    try {
      const headers = await this.buildAuthHeaders();
      const response = await axios.post<DigipayDeliverResponse>(
        `${this.authService.getBaseUrl()}/purchases/deliver?type=${type}`,
        payload,
        { headers },
      );
      return response.data;
    } catch (error: any) {
      const errorMsg = error?.response?.data
        ? JSON.stringify(error.response.data)
        : error.message;
      this.logger.error(
        `Failed to deliver DigiPay order: ${errorMsg}`,
        error.stack,
      );
      return {
        result: {
          status: error?.response?.data?.result?.status || 9999,
          message:
            error?.response?.data?.result?.message ||
            'خطا در ثبت وضعیت تحویل سفارش',
          level: 'ERROR',
        },
      };
    }
  }
}
