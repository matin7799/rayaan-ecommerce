import { plainToInstance } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @IsOptional()
  PORT: number = 3002;

  @IsString()
  @IsOptional()
  FRONTEND_URL: string = 'http://localhost:3001';

  @IsString()
  DB_HOST!: string;

  @IsNumber()
  DB_PORT!: number;

  @IsString()
  DB_USERNAME!: string;

  @IsString()
  DB_PASSWORD!: string;

  @IsString()
  DB_NAME!: string;

  @IsBoolean()
  @IsOptional()
  DB_SSL: boolean = false;

  @IsBoolean()
  @IsOptional()
  DB_SSL_REJECT_UNAUTHORIZED: boolean = true;

  @IsString()
  REDIS_HOST!: string;

  @IsNumber()
  REDIS_PORT!: number;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD?: string;

  @IsNumber()
  @IsOptional()
  REDIS_DB: number = 0;

  @IsString()
  JWT_SECRET!: string;

  @IsString()
  JWT_REFRESH_SECRET!: string;

  @IsString()
  JWT_TEMP_SECRET!: string;

  @IsString()
  @IsOptional()
  SMS_PROVIDER?: string;

  @IsString()
  @IsOptional()
  SMS_API_KEY?: string;

  @IsString()
  @IsOptional()
  SSL_KEY_PATH?: string;

  @IsString()
  @IsOptional()
  SSL_CERT_PATH?: string;

  // SMS Providers Configuration
  @IsString()
  @IsOptional()
  MELIPAYAMAK_USERNAME?: string;

  @IsString()
  @IsOptional()
  MELIPAYAMAK_PASSWORD?: string;

  @IsString()
  @IsOptional()
  MELIPAYAMAK_FROM?: string;

  @IsString()
  @IsOptional()
  MELIPAYAMAK_OTP_BODY_ID?: string;

  @IsString()
  @IsOptional()
  MELIPAYAMAK_PATTERN_API_URL?: string;

  @IsString()
  @IsOptional()
  SMSIR_API_KEY?: string;

  @IsNumber()
  @IsOptional()
  SMSIR_OTP_TEMPLATE_ID?: number;

  @IsString()
  @IsOptional()
  SMSIR_OTP_PARAMETER_NAME?: string;

  // DigiPay Configuration
  @IsBoolean()
  @IsOptional()
  DIGIPAY_SANDBOX?: boolean;

  @IsString()
  @IsOptional()
  DIGIPAY_CLIENT_ID?: string;

  @IsString()
  @IsOptional()
  DIGIPAY_CLIENT_SECRET?: string;

  @IsString()
  @IsOptional()
  DIGIPAY_USERNAME?: string;

  @IsString()
  @IsOptional()
  DIGIPAY_PASSWORD?: string;

  @IsBoolean()
  @IsOptional()
  DIGIPAY_MOCK_MODE?: boolean;

  @IsString()
  @IsOptional()
  DIGIPAY_SELLER_ID?: string;

  @IsString()
  @IsOptional()
  DIGIPAY_SUPPLIER_ID?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(
      `Environment validation failed. Missing or invalid variables:\n${errors.toString()}`,
    );
  }

  return validatedConfig;
}
