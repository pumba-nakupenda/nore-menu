import { Module } from '@nestjs/common';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
    imports: [SupabaseModule],
    controllers: [ShopController],
    providers: [ShopService],
    exports: [ShopService]
})
export class ShopModule { }
