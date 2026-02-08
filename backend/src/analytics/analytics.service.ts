import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AnalyticsService {
    constructor(private readonly supabase: SupabaseService) { }

    // Generate a simple session ID from user agent and timestamp
    generateSessionId(userAgent: string): string {
        const hash = Buffer.from(`${userAgent}-${Date.now()}`).toString('base64');
        return hash.substring(0, 32);
    }

    // Toggle dish like
    async toggleDishLike(restaurantId: string, dishId: string, sessionId: string) {
        const { data: existing } = await this.supabase.getClient()
            .from('dish_likes')
            .select('id')
            .eq('dish_id', dishId)
            .eq('session_id', sessionId)
            .single();

        if (existing) {
            const { error } = await this.supabase.getClient().from('dish_likes').delete().eq('id', existing.id);
            if (error) throw error;
            return { liked: false, message: 'Dish unliked' };
        } else {
            const { error } = await this.supabase.getClient().from('dish_likes').insert({ restaurant_id: restaurantId, dish_id: dishId, session_id: sessionId });
            if (error) throw error;
            return { liked: true, message: 'Dish liked' };
        }
    }

    // Track QR code scan
    async trackQrScan(restaurantId: string, userAgent: string, referrer?: string, tableNumber?: string) {
        const { error } = await this.supabase.getClient().from('qr_scans').insert({ restaurant_id: restaurantId, user_agent: userAgent, referrer: referrer || null, table_number: tableNumber || null });
        if (error) throw error;
        return { success: true };
    }

    // Track dish view
    async trackDishView(restaurantId: string, dishId: string, sessionId?: string) {
        const { error } = await this.supabase.getClient().from('dish_views').insert({ restaurant_id: restaurantId, dish_id: dishId, session_id: sessionId || null });
        if (error) throw error;
        return { success: true };
    }

    // Track WhatsApp Order intent
    async trackWhatsAppOrder(restaurantId: string, orderData: { items: any[]; totalPrice: number; customerName?: string; tableNumber?: string; orderType?: string; deliveryAddress?: string; }) {
        const { error } = await this.supabase.getClient().from('whatsapp_orders').insert({
            restaurant_id: restaurantId,
            items: orderData.items,
            total_price: orderData.totalPrice,
            customer_name: orderData.customerName || null,
            table_number: orderData.tableNumber || null,
            order_type: orderData.orderType || 'dine_in',
            delivery_address: orderData.deliveryAddress || null,
            status: 'PENDING'
        });
        if (error) throw error;
        return { success: true };
    }

    // Activity Logging
    async logActivity(restaurantId: string, staffId: string, actionType: string, description: string, metadata?: any) {
        await this.supabase.getClient().from('activity_logs').insert({
            restaurant_id: restaurantId,
            staff_id: staffId,
            action_type: actionType,
            description,
            metadata: metadata || {}
        });
    }

    // Get WhatsApp orders for admin dashboard
    async getWhatsAppOrders(restaurantId: string, token: string) {
        const { data, error } = await this.supabase.getClient(token)
            .from('whatsapp_orders')
            .select('*, staff_accounts(display_name)')
            .eq('restaurant_id', restaurantId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    }


    async updateWhatsAppOrderStatus(orderId: string, status: 'VALIDATED' | 'CANCELLED', staffId?: string) {
        const client = this.supabase.getClient();
        const { data, error } = await client
            .from('whatsapp_orders')
            .update({ status, processed_by: staffId })
            .eq('id', orderId)
            .select()
            .single();

        if (error) throw new InternalServerErrorException(error.message);

        // Log activity for audit trail
        if (staffId && data) {
            await this.logActivity(
                data.restaurant_id,
                staffId,
                status === 'VALIDATED' ? 'ORDER_VALIDATED' : 'ORDER_CANCELLED',
                `WhatsApp order ${orderId.slice(0, 8)} ${status.toLowerCase()}`,
                { orderId, status, source: 'WHATSAPP', totalPrice: data.total_price }
            );
        }

        return data;
    }

    async updateWhatsAppPaymentStatus(orderId: string, isPaid: boolean, staffId?: string) {
        const client = this.supabase.getClient();
        const paymentStatus = isPaid ? 'PAID' : 'UNPAID';

        const { data, error } = await client
            .from('whatsapp_orders')
            .update({ is_paid: isPaid, payment_status: paymentStatus })
            .eq('id', orderId)
            .select()
            .single();

        if (error) throw new InternalServerErrorException(error.message);

        // Log activity for audit trail
        if (staffId && data) {
            await this.logActivity(
                data.restaurant_id,
                staffId,
                'PAYMENT_UPDATED',
                `WhatsApp order ${orderId.slice(0, 8)} marked as ${paymentStatus}`,
                { orderId, isPaid, paymentStatus, source: 'WHATSAPP', totalPrice: data.total_price }
            );
        }

        return data;
    }

    async getStaffActivity(staffId: string, restaurantId: string, token: string) {
        const client = this.supabase.getClient(token);

        // Get activity logs for this staff member
        const { data: logs, error: logsError } = await client
            .from('activity_logs')
            .select('*')
            .eq('staff_id', staffId)
            .eq('restaurant_id', restaurantId)
            .order('created_at', { ascending: false })
            .limit(100);

        if (logsError) throw logsError;

        // Get staff's transaction stats from orders table
        const { data: orders, error: ordersError } = await client
            .from('orders')
            .select('id, total_price, production_status, created_at')
            .eq('processed_by', staffId)
            .eq('restaurant_id', restaurantId);

        if (ordersError) throw ordersError;

        const stats = {
            totalSales: orders?.filter(o => o.production_status === 'SERVED').length || 0,
            totalRevenue: orders?.filter(o => o.production_status === 'SERVED').reduce((sum, o) => sum + (o.total_price || 0), 0) || 0,
            totalCancellations: orders?.filter(o => o.production_status === 'CANCELLED').length || 0,
        };

        return { logs, stats, orders };
    }

    async getDashboardConsolidatedData(
        restaurantId: string,
        token: string,
        page: number = 1,
        limit: number = 50,
        filters?: { source?: string; type?: string; status?: string; search?: string; dateStart?: string; dateEnd?: string; }
    ) {
        const stats = await this.getDashboardStats(restaurantId, token, 30);
        const client = this.supabase.getClient(token);

        // 1. Fetch Order Stats (Full count for KPIs)
        const { data: emitted } = await client.from('whatsapp_orders').select('id, status, total_price').eq('restaurant_id', restaurantId);
        const { data: allRealOrders } = await client.from('orders').select('id, production_status, total_price').eq('restaurant_id', restaurantId);

        const orderStats = {
            emitted: emitted?.length || 0,
            validated: emitted?.filter(o => o.status === 'VALIDATED').length || 0,
            served: allRealOrders?.filter(o => o.production_status === 'delivered').length || 0,
            cancelled: (emitted?.filter(o => o.status === 'CANCELLED').length || 0) +
                (allRealOrders?.filter(o => o.production_status === 'cancelled').length || 0),
            totalRevenue: (allRealOrders?.filter(o => o.production_status === 'delivered').reduce((s, o) => s + (o.total_price || 0), 0) || 0),
            whatsappRevenue: (emitted?.filter(o => o.status === 'VALIDATED').reduce((s, o) => s + (o.total_price || 0), 0) || 0)
        };

        // 2. Fetch Paginated Unified Orders (THE SCALABLE PART)
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = client
            .from('unified_orders')
            .select(`*`, { count: 'exact' }) // Simplify to verify data first
            .eq('restaurant_id', restaurantId)
            .order('created_at', { ascending: false });

        if (filters?.source && filters.source !== 'ALL') query = query.eq('source', filters.source);
        if (filters?.type && filters.type !== 'ALL') query = query.eq('order_type', filters.type);
        if (filters?.status && filters.status !== 'ALL') {
            // Handle both POS (lowercase) and WhatsApp (uppercase) status values with case-insensitive matching
            query = query.ilike('current_status', filters.status);
        }
        if (filters?.dateStart) query = query.gte('created_at', `${filters.dateStart}T00:00:00`);
        if (filters?.dateEnd) query = query.lte('created_at', `${filters.dateEnd}T23:59:59`);
        if (filters?.search) query = query.or(`customer_name.ilike.%${filters.search}%,id.cast.text.ilike.%${filters.search}%`);

        const { data: unifiedOrders, count: totalOrders, error: queryError } = await query.range(from, to);
        if (queryError) {
            console.error('Unified query error:', queryError);
        }

        return {
            ...stats,
            orderStats,
            consolidatedOrders: unifiedOrders || [],
            pagination: {
                total: totalOrders || 0,
                page,
                limit
            }
        };
    }

    async getDashboardStats(restaurantId: string, token: string, days: number = 30) {
        const client = this.supabase.getClient(token);
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - days);
        const today = new Date().toISOString().split('T')[0];

        // 1. Fetch Aggregated Historical Data (Before Today)
        const { data: aggregated } = await client.from('daily_analytics')
            .select('*')
            .eq('restaurant_id', restaurantId)
            .gte('date', dateThreshold.toISOString().split('T')[0])
            .lt('date', today);

        // 2. Fetch Raw Today Data
        const { count: qrToday } = await client.from('qr_scans').select('*', { count: 'exact', head: true }).eq('restaurant_id', restaurantId).gte('scanned_at', `${today}T00:00:00`);
        const { data: viewsToday } = await client.from('dish_views').select('dish_id').eq('restaurant_id', restaurantId).gte('viewed_at', `${today}T00:00:00`);

        // 3. Process QR Scans
        const scansByDateMap = new Map<string, number>();
        // Add historical
        aggregated?.filter(a => a.metric_name === 'qr_scans').forEach(a => {
            scansByDateMap.set(a.date, (scansByDateMap.get(a.date) || 0) + a.value);
        });
        // Add today
        scansByDateMap.set(today, qrToday || 0);

        const totalQrScans = Array.from(scansByDateMap.values()).reduce((a, b) => a + b, 0);

        // 4. Process Dish Views
        const viewsCountMap = new Map<string, number>(); // dish_id -> total_views
        // Add historical
        aggregated?.filter(a => a.metric_name === 'dish_view' && a.dish_id).forEach(a => {
            viewsCountMap.set(a.dish_id, (viewsCountMap.get(a.dish_id) || 0) + a.value);
        });
        // Add today
        viewsToday?.forEach((v: any) => {
            viewsCountMap.set(v.dish_id, (viewsCountMap.get(v.dish_id) || 0) + 1);
        });

        // 5. Build Top Viewed Dishes (requires fetching dish details if we want full objects)
        const topViewedIds = Array.from(viewsCountMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);
        const { data: dishes } = await client.from('dishes').select('id, name, image_url, price').in('id', topViewedIds.map(v => v[0]));

        const topViewedDishes = topViewedIds.map(v => {
            const dish = dishes?.find(d => d.id === v[0]);
            return dish ? { ...dish, views: v[1] } : null;
        }).filter(Boolean);

        // 6. Process Likes (Remain Raw for now as volume is lower)
        const { data: mostLikedDishes } = await client.from('dish_likes').select('dish_id, dishes(id, name, image_url, price)').eq('restaurant_id', restaurantId).gte('created_at', dateThreshold.toISOString());
        const likesMap = new Map<string, any>();
        mostLikedDishes?.forEach((like: any) => {
            if (like.dishes) {
                const dishId = like.dishes.id;
                if (likesMap.has(dishId)) likesMap.get(dishId).likes++;
                else likesMap.set(dishId, { ...like.dishes, likes: 1 });
            }
        });

        return {
            qrScans: totalQrScans,
            qrScansByDate: Array.from(scansByDateMap.entries()).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date)),
            topLikedDishes: Array.from(likesMap.values()).sort((a, b) => b.likes - a.likes).slice(0, 10),
            topViewedDishes,
            period: `${days} days`
        };
    }

    async getLikedDishes(restaurantId: string, sessionId: string) {
        const { data, error } = await this.supabase.getClient().from('dish_likes').select('dish_id').eq('restaurant_id', restaurantId).eq('session_id', sessionId);
        if (error) throw error;
        return data?.map(like => like.dish_id) || [];
    }

    async getGlobalStats() {
        const client = this.supabase.getClient();
        
        const { count: totalRestaurants } = await client.from('restaurants').select('*', { count: 'exact', head: true });
        const { count: totalDishes } = await client.from('dishes').select('*', { count: 'exact', head: true });
        const { count: totalScans } = await client.from('qr_scans').select('*', { count: 'exact', head: true });
        const { count: totalWhatsAppOrdersRaw } = await client.from('whatsapp_orders').select('*', { count: 'exact', head: true });
        const totalWhatsAppOrders = totalWhatsAppOrdersRaw || 0;
        
        const { data: revenueData } = await client.from('orders').select('total_price, restaurant_id').eq('production_status', 'delivered');
        const totalRevenue = revenueData?.reduce((sum, order) => sum + (Number(order.total_price) || 0), 0) || 0;

        const { data: shops } = await client.from('restaurants')
            .select('id, name, created_at, is_master, owner_id')
            .order('created_at', { ascending: false });

        // Calculate Revenue per Shop for Ranking
        const shopPerformance = shops?.map(shop => {
            const shopOrders = revenueData?.filter(o => o.restaurant_id === shop.id) || [];
            const revenue = shopOrders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);
            return {
                id: shop.id,
                name: shop.name,
                revenue,
                orderCount: shopOrders.length
            };
        }).sort((a, b) => b.revenue - a.revenue).slice(0, 10) || [];

        return {
            totalRestaurants: totalRestaurants || 0,
            totalDishes: totalDishes || 0,
            totalScans: totalScans || 0,
            totalWhatsAppOrders,
            totalRevenue,
            averageOrderValue: totalWhatsAppOrders > 0 ? totalRevenue / totalWhatsAppOrders : 0,
            shops: shops || [],
            topShops: shopPerformance
        };
    }

    async runDailyAggregation(date?: string) {
        const client = this.supabase.getClient();
        const targetDate = date || new Date(Date.now() - 86400000).toISOString().split('T')[0];

        const { data: restaurants } = await client.from('restaurants').select('id');
        if (!restaurants) return { message: 'No restaurants found' };

        const results = [];
        for (const res of restaurants) {
            // Aggregate QR Scans
            const { count: qrCount } = await client.from('qr_scans')
                .select('*', { count: 'exact', head: true })
                .eq('restaurant_id', res.id)
                .gte('scanned_at', `${targetDate}T00:00:00`)
                .lte('scanned_at', `${targetDate}T23:59:59`);

            await client.from('daily_analytics').upsert({
                restaurant_id: res.id,
                date: targetDate,
                metric_name: 'qr_scans',
                value: qrCount || 0
            }, { onConflict: 'restaurant_id, date, metric_name' });

            // Aggregate Dish Views
            const { data: views } = await client.from('dish_views')
                .select('dish_id')
                .eq('restaurant_id', res.id)
                .gte('viewed_at', `${targetDate}T00:00:00`)
                .lte('viewed_at', `${targetDate}T23:59:59`);

            if (views && views.length > 0) {
                const dishCounts = views.reduce((acc: any, v: any) => {
                    acc[v.dish_id] = (acc[v.dish_id] || 0) + 1;
                    return acc;
                }, {});

                for (const [dishId, count] of Object.entries(dishCounts)) {
                    await client.from('daily_analytics').upsert({
                        restaurant_id: res.id,
                        dish_id: dishId,
                        date: targetDate,
                        metric_name: 'dish_view',
                        value: count
                    }, { onConflict: 'restaurant_id, dish_id, date, metric_name' });
                }
            }
            results.push({ restaurantId: res.id, qrCount, dishViews: views?.length || 0 });
        }
        return { message: 'Aggregation completed', date: targetDate, results };
    }
}