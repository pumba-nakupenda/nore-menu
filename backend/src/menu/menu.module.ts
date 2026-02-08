import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { QrCodeService } from './qrcode.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { EmailModule } from '../email/email.module';

import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [SupabaseModule, EmailModule, AnalyticsModule],
  providers: [MenuService, QrCodeService],
  controllers: [MenuController],
  exports: [MenuService],
})
export class MenuModule { }
