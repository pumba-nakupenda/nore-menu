import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MenuModule } from './menu/menu.module';
import { SupabaseModule } from './supabase/supabase.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { EmailModule } from './email/email.module';
import { FeedbackModule } from './feedback/feedback.module';
import { OrdersModule } from './orders/orders.module';
import { StaffModule } from './staff/staff.module';
import { UploadModule } from './upload/upload.module';
import { ShopModule } from './shop/shop.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule,
    AuthModule,
    MenuModule,
    AnalyticsModule,
    EmailModule,
    FeedbackModule,
    OrdersModule,
    StaffModule,
    UploadModule,
    ShopModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
