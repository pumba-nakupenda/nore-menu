import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private client: SupabaseClient;
  private supabaseUrl: string;
  private supabaseKey: string;

  constructor(private configService: ConfigService) {
    this.supabaseUrl = this.configService.get<string>('SUPABASE_URL') || '';
    this.supabaseKey = this.configService.get<string>('SUPABASE_KEY') || '';

    if (!this.supabaseUrl || !this.supabaseKey) {
      this.logger.error('Supabase URL or Key is missing!');
    }

    this.client = createClient(this.supabaseUrl, this.supabaseKey);
  }

  getClient(token?: string): SupabaseClient {
    if (token) {
      return createClient(this.supabaseUrl, this.supabaseKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
    }
    return this.client;
  }
}
