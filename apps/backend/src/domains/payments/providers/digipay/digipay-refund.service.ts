import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { DigipayAuthService } from './digipay-auth.service';
import {
  DigipayRefundRequest,
  DigipayRefundResponse,
  DigipayRefundInquiryResponse,
} from './digipay.types';

@Injectable()
export class DigipayRefundService {
  private readonly logger = new Logger(DigipayRefundService.name);

  constructor(private readonly authService: DigipayAuthService) {}

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
  // Refund (Section 10 — long-term refund)
  // ─────────────────────────────────────────────────────────

  async refundPurchase(
    payload: DigipayRefundRequest,
    type = 0,
  ): Promise<DigipayRefundResponse> {
    if (this.authService.isMockMode) {
      this.logger.log(
        `[MOCK] Refunding purchase saleTrackingCode=${payload.saleTrackingCode}`,
      );
      return {
        result: {
          title: 'SUCCESS',
          status: 0,
          message: 'عملیات بازگشت وجه با موفقیت انجام شد (MOCK)',
          level: 'INFO',
        },
        trackingCode: `MOCK_REFUND_${Date.now()}`,
      };
    }

    try {
      const headers = await this.buildAuthHeaders();
      const response = await axios.post<DigipayRefundResponse>(
        `${this.authService.getBaseUrl()}/refunds?type=${type}`,
        payload,
        { headers },
      );
      return response.data;
    } catch (error: any) {
      const errorMsg = error?.response?.data
        ? JSON.stringify(error.response.data)
        : error.message;
      this.logger.error(
        `Failed to issue DigiPay refund: ${errorMsg}`,
        error.stack,
      );
      return {
        result: {
          status: error?.response?.data?.result?.status || 9999,
          message:
            error?.response?.data?.result?.message ||
            'خطا در عملیات بازگشت وجه دیجی‌پی',
          level: 'ERROR',
        },
      };
    }
  }

  // ─────────────────────────────────────────────────────────
  // Refund Inquiry (Section 11)
  // ─────────────────────────────────────────────────────────

  async getRefundInquiry(
    inquiryId: string,
    type = 0,
  ): Promise<DigipayRefundInquiryResponse> {
    if (this.authService.isMockMode) {
      this.logger.log(`[MOCK] Refund inquiry for inquiryId=${inquiryId}`);
      return {
        result: {
          status: 0,
          message: 'وضعیت ریفاند با موفقیت دریافت شد (MOCK)',
          level: 'INFO',
        },
        status: 0,
        providerId: inquiryId,
        trackingCode: `MOCK_REFUND_TRACK_${Date.now()}`,
      };
    }

    try {
      const headers = await this.buildAuthHeaders();
      const response = await axios.post<DigipayRefundInquiryResponse>(
        `${this.authService.getBaseUrl()}/refunds/${inquiryId}?type=${type}`,
        {},
        { headers },
      );
      return response.data;
    } catch (error: any) {
      const errorMsg = error?.response?.data
        ? JSON.stringify(error.response.data)
        : error.message;
      this.logger.error(
        `Failed to inquire DigiPay refund: ${errorMsg}`,
        error.stack,
      );
      return {
        result: {
          status: error?.response?.data?.result?.status || 9999,
          message:
            error?.response?.data?.result?.message ||
            'خطا در استعلام وضعیت ریفاند دیجی‌پی',
          level: 'ERROR',
        },
      };
    }
  }
}
