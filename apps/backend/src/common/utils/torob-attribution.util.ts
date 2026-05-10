import type { Request, Response } from 'express';

export const TOROB_ATTR_COOKIE = 'torob_attribution_until';
export const TOROB_ATTR_TTL_MS = 20 * 60 * 1000;

function parseCookieExpiry(value: unknown): number {
  if (typeof value !== 'string') {
    return 0;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function isTorobRequest(req?: Request): boolean {
  if (!req) {
    return false;
  }
  const utmSource = req.query?.utm_source;
  const source =
    typeof utmSource === 'string'
      ? utmSource.toLowerCase()
      : Array.isArray(utmSource) && typeof utmSource[0] === 'string'
        ? utmSource[0].toLowerCase()
        : '';

  if (source === 'torob') {
    return true;
  }

  const attributionHeader = String(req.headers['x-attribution-source'] ?? '')
    .trim()
    .toLowerCase();
  if (attributionHeader === 'torob') {
    return true;
  }

  const referer = String(req.headers.referer ?? req.headers.referrer ?? '');
  return /(^|\.)torob\.com$/i.test(extractHostname(referer));
}

export function isTorobAttributed(req?: Request): boolean {
  if (!req) {
    return false;
  }
  const now = Date.now();
  const cookieUntil = parseCookieExpiry(req.cookies?.[TOROB_ATTR_COOKIE]);
  return cookieUntil > now || isTorobRequest(req);
}

export function refreshTorobAttribution(req: Request, res: Response): void {
  if (!isTorobRequest(req)) {
    return;
  }

  const expiresAt = Date.now() + TOROB_ATTR_TTL_MS;
  res.cookie(TOROB_ATTR_COOKIE, String(expiresAt), {
    maxAge: TOROB_ATTR_TTL_MS,
    httpOnly: true,
    sameSite: 'lax',
  });
}

function extractHostname(urlLike: string): string {
  try {
    const url = new URL(urlLike);
    return url.hostname;
  } catch {
    return '';
  }
}
