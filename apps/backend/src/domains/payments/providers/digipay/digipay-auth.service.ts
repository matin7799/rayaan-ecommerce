import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import axios from 'axios';
import { DigipayTokenResponse } from './digipay.types';

@Injectable()
export class DigipayAuthService {
  private readonly logger = new Logger(DigipayAuthService.name);
  private readonly baseUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly username?: string;
  private readonly password?: string;
  public readonly isMockMode: boolean;

  private cachedToken: string | null = null;
  private cachedRefreshToken: string | null = null;
  private tokenExpiresAt = 0;
  private pendingTokenPromise: Promise<string> | null = null;

  constructor() {
    this.clientId = (process.env['DIGIPAY_CLIENT_ID'] ?? '').trim();
    this.clientSecret = (process.env['DIGIPAY_CLIENT_SECRET'] ?? '').trim();
    this.username = (process.env['DIGIPAY_USERNAME'] ?? '').trim();
    this.password = (process.env['DIGIPAY_PASSWORD'] ?? '').trim();

    const sandbox = (process.env['DIGIPAY_SANDBOX'] ?? 'true') === 'true';
    this.baseUrl = sandbox
      ? 'https://uat.mydigipay.info/digipay/api'
      : 'https://api.mydigipay.com/digipay/api';

    const explicitMockMode =
      (process.env['DIGIPAY_MOCK_MODE'] ?? 'false') === 'true';
    this.isMockMode =
      explicitMockMode ||
      !this.clientId ||
      !this.clientSecret ||
      !this.username ||
      !this.password;

    this.logger.debug(
      `DigiPay Auth init — clientId="${this.clientId}" | username="${this.username}" | ` +
        `MOCK_MODE_ENV="${process.env['DIGIPAY_MOCK_MODE']}" | explicitMock=${explicitMockMode} | isMockMode=${this.isMockMode}`,
    );

    if (this.isMockMode) {
      const reason = explicitMockMode
        ? 'DIGIPAY_MOCK_MODE=true'
        : 'credentials not configured';
      this.logger.warn(`⚠️  DigiPay running in MOCK Mode (reason: ${reason}).`);
    } else {
      this.logger.log(
        `DigiPay Auth Service initialized in ${sandbox ? 'Sandbox (UAT)' : 'Production'} mode`,
      );
    }
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Securely retrieves or refreshes the access token.
   * Leverages an in-memory lock (Promise caching) to prevent race conditions during concurrent API requests.
   */
  async getAccessToken(): Promise<string> {
    if (this.isMockMode) {
      return 'mock-access-token';
    }

    if (this.cachedToken && Date.now() < this.tokenExpiresAt - 30_000) {
      return this.cachedToken;
    }

    if (this.pendingTokenPromise) {
      this.logger.log(
        'Awaiting pending DigiPay authentication token promise...',
      );
      return this.pendingTokenPromise;
    }

    this.pendingTokenPromise = (async () => {
      try {
        if (this.cachedRefreshToken) {
          const refreshed = await this.refreshTokenFlow();
          if (refreshed) {
            return refreshed;
          }
        }
        return await this.credentialsLoginFlow();
      } finally {
        this.pendingTokenPromise = null;
      }
    })();

    return this.pendingTokenPromise;
  }

  /**
   * Refreshes the token using refresh_token parameter inside form-data body.
   */
  private async refreshTokenFlow(): Promise<string | null> {
    try {
      this.logger.log('Attempting to silently refresh DigiPay OAuth2 token...');
      const basicAuth = Buffer.from(
        `${this.clientId}:${this.clientSecret}`,
      ).toString('base64');

      const params = new URLSearchParams();
      params.append('grant_type', 'refresh_token');
      params.append('refresh_token', this.cachedRefreshToken || '');

      const response = await axios.post<DigipayTokenResponse>(
        `${this.baseUrl}/oauth/token`,
        params,
        {
          headers: {
            Authorization: `Basic ${basicAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const data = response.data;
      this.cachedToken = data.access_token;
      this.cachedRefreshToken = data.refresh_token || this.cachedRefreshToken;
      this.tokenExpiresAt = Date.now() + data.expires_in * 1000;
      this.logger.log('DigiPay OAuth2 token successfully refreshed.');
      return this.cachedToken;
    } catch (error: any) {
      const errorMsg = error?.response?.data
        ? JSON.stringify(error.response.data)
        : error.message;
      this.logger.warn(
        `Failed to refresh DigiPay token: ${errorMsg}. Invalidating refresh token...`,
      );
      this.cachedRefreshToken = null;
      return null;
    }
  }

  /**
   * Requests a new token using the password credentials grant inside URLSearchParams body.
   */
  private async credentialsLoginFlow(): Promise<string> {
    try {
      this.logger.log(
        'Acquiring brand new DigiPay OAuth2 token using credentials...',
      );
      const basicAuth = Buffer.from(
        `${this.clientId}:${this.clientSecret}`,
      ).toString('base64');

      const params = new URLSearchParams();
      params.append('username', this.username || '');
      params.append('password', this.password || '');
      params.append('grant_type', 'password');

      const response = await axios.post<DigipayTokenResponse>(
        `${this.baseUrl}/oauth/token`,
        params,
        {
          headers: {
            Authorization: `Basic ${basicAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const data = response.data;
      this.cachedToken = data.access_token;
      this.cachedRefreshToken = data.refresh_token || null;
      this.tokenExpiresAt = Date.now() + data.expires_in * 1000;
      this.logger.log('Successfully authenticated and cached DigiPay tokens.');
      return this.cachedToken;
    } catch (error: any) {
      const errorDetails = error?.response?.data
        ? JSON.stringify(error.response.data)
        : error.message;
      this.logger.error(
        `Failed to authenticate with DigiPay API: ${errorDetails}`,
        error.stack,
      );
      throw new ServiceUnavailableException(
        'ارتباط با سرور پرداخت دیجی‌پی موقتاً برقرار نیست',
      );
    }
  }
}
