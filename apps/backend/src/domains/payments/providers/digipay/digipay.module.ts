import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DigipayService } from './digipay.service';
import { DigipayAuthService } from './digipay-auth.service';
import { DigipayRefundService } from './digipay-refund.service';
import { DigipayProvider } from './digipay.provider';
import { DigipayController } from './digipay.controller';

@Module({
  imports: [ConfigModule],
  controllers: [DigipayController],
  providers: [
    DigipayAuthService,
    DigipayRefundService,
    DigipayService,
    DigipayProvider,
  ],
  exports: [
    DigipayAuthService,
    DigipayRefundService,
    DigipayService,
    DigipayProvider,
  ],
})
export class DigipayModule {}
