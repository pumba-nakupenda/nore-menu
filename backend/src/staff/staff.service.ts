import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class StaffService {
  constructor(private readonly supabase: SupabaseService) {}

  async createStaffAccount(restaurantId: string, staffData: any, token: string) {
    const { data, error } = await this.supabase.getClient(token)
      .from('staff_accounts')
      .insert({
        restaurant_id: restaurantId,
        username: staffData.username,
        password: staffData.password,
        display_name: staffData.displayName,
        can_view_whatsapp: staffData.can_view_whatsapp,
        can_view_cashier: staffData.can_view_cashier,
        can_view_kitchen: staffData.can_view_kitchen
      })
      .select()
      .single();

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async getRestaurantStaff(restaurantId: string, token: string) {
    const { data, error } = await this.supabase.getClient(token)
      .from('staff_accounts')
      .select('*')
      .eq('restaurant_id', restaurantId);

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async deleteStaffAccount(staffId: string, token: string) {
    const { error } = await this.supabase.getClient(token).from('staff_accounts').delete().eq('id', staffId);
    if (error) throw new InternalServerErrorException(error.message);
    return { success: true };
  }

  async updateStaffAccount(staffId: string, staffData: any, token: string) {
    const { data, error } = await this.supabase.getClient(token).from('staff_accounts').update({
        username: staffData.username,
        password: staffData.password,
        display_name: staffData.displayName,
        can_view_whatsapp: staffData.can_view_whatsapp,
        can_view_cashier: staffData.can_view_cashier,
        can_view_kitchen: staffData.can_view_kitchen
      }).eq('id', staffId).select().single();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async loginPOS(username: string, password: string) {
    const { data, error } = await this.supabase.getClient().from('staff_accounts').select('*').eq('username', username).eq('password', password).single();
    if (error || !data) throw new UnauthorizedException('Identifiants POS incorrects');
    return data;
  }
}
