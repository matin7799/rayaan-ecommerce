export type ZarinpalCurrency = 'IRR' | 'IRT';

export interface ZarinpalCallbackPayload {
  Authority?: string;
  Status?: string;
  [key: string]: unknown;
}

export interface ZarinpalCreateResponseData {
  code: number;
  message?: string;
  authority?: string;
  fee_type?: string;
  fee?: number;
}

export interface ZarinpalVerifyResponseData {
  code: number;
  message?: string;
  ref_id?: number | string;
  card_pan?: string;
  fee?: number;
  fee_type?: string;
}

export interface ZarinpalInquiryResponseData {
  code?: number;
  message?: string;
  status?: string;
}

export interface ZarinpalSdkConfig {
  merchantId: string;
  sandbox: boolean;
  accessToken?: string;
}
