import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createPublicKey, verify } from 'crypto';
import type { Request } from 'express';

const TOROB_PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAt6Mu4T0pBORY11W+QeM35UsmLO3vsf+6yKpFDEImFk0=
-----END PUBLIC KEY-----`;

interface TorobJwtPayload {
  aud?: string;
  exp?: number;
  nbf?: number;
}

@Injectable()
export class TorobTokenGuard implements CanActivate {
  private readonly publicKey = createPublicKey(TOROB_PUBLIC_KEY_PEM);

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();

    const tokenVersion = req.header('x-torob-token-version');
    if (tokenVersion !== '1') {
      throw new UnauthorizedException('Invalid Torob token version');
    }

    const token = req.header('x-torob-token');
    if (!token) {
      throw new UnauthorizedException('Missing Torob token');
    }

    const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');
    if (!encodedHeader || !encodedPayload || !encodedSignature) {
      throw new UnauthorizedException('Invalid Torob token format');
    }

    const message = `${encodedHeader}.${encodedPayload}`;
    const signature = this.base64UrlToBuffer(encodedSignature);
    const validSignature = verify(
      null,
      Buffer.from(message),
      this.publicKey,
      signature,
    );

    if (!validSignature) {
      throw new UnauthorizedException('Invalid Torob token signature');
    }

    const payload = this.parsePayload(encodedPayload);
    const host = req.header('host');

    if (!host || payload.aud !== host) {
      throw new UnauthorizedException('Invalid Torob token audience');
    }

    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.nbf !== 'number' || now < payload.nbf) {
      throw new UnauthorizedException('Torob token not active yet');
    }

    if (typeof payload.exp !== 'number' || now > payload.exp) {
      throw new UnauthorizedException('Torob token expired');
    }

    return true;
  }

  private parsePayload(encodedPayload: string): TorobJwtPayload {
    try {
      const payloadJson = this.base64UrlToBuffer(encodedPayload).toString(
        'utf-8',
      );
      return JSON.parse(payloadJson) as TorobJwtPayload;
    } catch {
      throw new UnauthorizedException('Invalid Torob token payload');
    }
  }

  private base64UrlToBuffer(value: string): Buffer {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padLength = (4 - (normalized.length % 4)) % 4;
    return Buffer.from(`${normalized}${'='.repeat(padLength)}`, 'base64');
  }
}
