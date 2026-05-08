/**
 * Convert Persian/Arabic digits to English digits
 */
export function normalizeDigits(value: string): string {
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩';

  return value
    .replace(/[۰-۹]/g, (digit) => String(persianDigits.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(arabicDigits.indexOf(digit)));
}

/**
 * Format number to Persian with thousand separators
 */
export function formatPersianPrice(value: number | string): string {
  const normalizedValue = typeof value === 'string' ? normalizeDigits(value) : value;
  const num = typeof normalizedValue === 'string' ? parseFloat(normalizedValue) : normalizedValue;

  if (isNaN(num)) return '0';

  return num.toLocaleString('fa-IR');
}

/**
 * Format input value with thousand separators as user types
 */
export function formatPriceInput(value: string): string {
  const normalized = normalizeDigits(value);

  // Remove all non-English-digit characters after normalization
  const digits = normalized.replace(/\D/g, '');

  if (!digits) return '';

  return parseInt(digits, 10).toLocaleString('fa-IR');
}

/**
 * Parse formatted price string to number
 */
export function parsePriceInput(value: string): number {
  const normalized = normalizeDigits(value);

  const digits = normalized.replace(/\D/g, '');

  return digits ? parseInt(digits, 10) : 0;
}

/**
 * Convert English digits to Persian
 */
export function toPersianDigits(value: string | number): string {
  const str = String(value);
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

  return str.replace(/\d/g, (digit) => persianDigits[parseInt(digit, 10)]);
}
