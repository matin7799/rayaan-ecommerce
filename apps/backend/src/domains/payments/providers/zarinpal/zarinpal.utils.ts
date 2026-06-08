export function isValidMerchantId(value: string): boolean {
  return typeof value === 'string' && value.trim().length === 36;
}

export function normalizeAmountToRials(amount: number): number {
  const normalized = Math.floor(Number(amount));
  if (!Number.isFinite(normalized) || normalized <= 0) {
    throw new Error('Amount must be a positive integer in IRR');
  }
  return normalized;
}

export function isTemporaryGatewayError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const err = error as {
    code?: string;
    cause?: { code?: string };
    message?: string;
  };

  const code = err.code ?? err.cause?.code;
  return (
    code === 'EAI_AGAIN' ||
    code === 'ENOTFOUND' ||
    code === 'ETIMEDOUT' ||
    code === 'ECONNRESET'
  );
}

export function stringifyError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
