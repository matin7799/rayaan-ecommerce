export type SendOtpPayload = {
  phone: string;
  code: string;
};

export interface SmsProvider {
  sendOtp(payload: SendOtpPayload): Promise<void>;
}
