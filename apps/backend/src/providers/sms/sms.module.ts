// apps/backend/src/providers/sms/sms.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { SmsService } from './sms.service';
import { MeliPayamakProvider } from './providers/melipayamak.provider';
import { SmsIrProvider } from './providers/sms-ir.provider';

@Module({
  imports: [ConfigModule, HttpModule],
  providers: [SmsService, MeliPayamakProvider, SmsIrProvider],
  exports: [SmsService],
})
export class SmsModule {}
