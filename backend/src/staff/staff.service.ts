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
        can_view_kitchen: staffData.can_view_kitchen,
        can_manage_stocks: staffData.can_manage_stocks,
        can_view_transactions: staffData.can_view_transactions,
        can_process_payments: staffData.can_process_payments,
        can_validate_orders: staffData.can_validate_orders,
        can_cancel_orders: staffData.can_cancel_orders
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
        can_view_kitchen: staffData.can_view_kitchen,
        can_manage_stocks: staffData.can_manage_stocks,
        can_view_transactions: staffData.can_view_transactions,
        can_process_payments: staffData.can_process_payments,
        can_validate_orders: staffData.can_validate_orders,
        can_cancel_orders: staffData.can_cancel_orders
      }).eq('id', staffId).select().single();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async loginPOS(credential: string, password: string) {
    // Support both direct username (if unique) and scoped username (restaurant@user)
    if (credential.includes('@')) {
      const [resSlug, username] = credential.split('@');
      
      // First find the restaurant by name/slug (case insensitive search)
      const { data: restaurant } = await this.supabase.getClient()
        .from('restaurants')
        .select('id')
        .ilike('name', resSlug)
        .single();

      if (restaurant) {
        const { data, error } = await this.supabase.getClient()
          .from('staff_accounts')
          .select('*')
          .eq('restaurant_id', restaurant.id)
          .eq('username', username)
          .eq('password', password)
          .single();
        
        if (!error && data) return data;
      }
    }

    // Fallback to global search (for backward compatibility)
    const { data, error } = await this.supabase.getClient().from('staff_accounts').select('*').eq('username', credential).eq('password', password).single();
    if (error || !data) throw new UnauthorizedException('Identifiants POS incorrects (Format: restaurant@identifiant)');
    return data;
  }
}
