import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ContentService {
  constructor(private readonly supabase: SupabaseService) {}

  async getSiteContent() {
    const { data, error } = await this.supabase.getClient()
      .from('site_content')
      .select('*');
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async upsertContent(key: string, value: any) {
    const { data, error } = await this.supabase.getClient()
      .from('site_content')
      .upsert({ key, value }, { onConflict: 'key' })
      .select()
      .single();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async getHardwareProducts() {
    const { data, error } = await this.supabase.getClient()
      .from('hardware_products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async getAllHardwareProducts() {
    const { data, error } = await this.supabase.getClient()
      .from('hardware_products')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async createHardwareProduct(productData: any) {
    const { data, error } = await this.supabase.getClient()
      .from('hardware_products')
      .insert(productData)
      .select()
      .single();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async updateHardwareProduct(id: string, productData: any) {
    const { data, error } = await this.supabase.getClient()
      .from('hardware_products')
      .update(productData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async deleteHardwareProduct(id: string) {
    const { error } = await this.supabase.getClient()
      .from('hardware_products')
      .delete()
      .eq('id', id);
    if (error) throw new InternalServerErrorException(error.message);
    return { success: true };
  }
}
