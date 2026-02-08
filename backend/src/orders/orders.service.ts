import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class OrdersService {
  constructor(private readonly supabase: SupabaseService) { }

  async createOrder(restaurantId: string, orderData: any) {
    const { data, error } = await this.supabase.getClient()
      .from('orders')
      .insert({
        restaurant_id: restaurantId,
        items: orderData.items,
        total_price: orderData.totalPrice,
        table_number: orderData.tableNumber,
        customer_name: orderData.customerName,
        customer_phone: orderData.customerPhone,
        order_type: orderData.orderType || 'dine_in',
        production_status: 'RECEIVED',
        payment_status: orderData.isPaid ? 'PAID' : 'UNPAID',
        is_paid: orderData.isPaid || false,
        processed_by: orderData.processedBy || null
      })
      .select().single();

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async getOrderById(orderId: string) {
    const { data, error } = await this.supabase.getClient().from('orders').select('*').eq('id', orderId).single();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async updateOrderStatus(orderId: string, status: string, isPaid?: boolean, staffId?: string) {
    const updateData: any = { production_status: status };
    if (isPaid !== undefined) updateData.is_paid = isPaid;
    if (staffId) updateData.processed_by = staffId;

    const { data, error } = await this.supabase.getClient().from('orders').update(updateData).eq('id', orderId).select().single();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async getStaffTransactions(staffId: string) {
    const { data, error } = await this.supabase.getClient()
      .from('orders')
      .select('*')
      .eq('processed_by', staffId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async getRestaurantOrders(restaurantId: string) {
    const { data, error } = await this.supabase.getClient()
      .from('orders')
      .select('*, staff_accounts:processed_by(display_name)')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }
}