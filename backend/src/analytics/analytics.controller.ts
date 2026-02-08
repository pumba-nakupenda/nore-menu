import { Body, Controller, Get, Param, Post, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { SupabaseGuard } from '../auth/supabase.guard';

@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    // Public endpoint - Toggle dish like
    @Post('like')
    async toggleLike(@Body() body: { restaurantId: string; dishId: string; sessionId: string }) {
        return this.analyticsService.toggleDishLike(body.restaurantId, body.dishId, body.sessionId);
    }

    // Public endpoint - Track QR scan
    @Post('qr-scan')
    async trackQrScan(@Body() body: { restaurantId: string; tableNumber?: string }, @Req() req: any) {
        const userAgent = req.headers['user-agent'] || 'unknown';
        const referrer = req.headers['referer'] || req.headers['referrer'];
        return this.analyticsService.trackQrScan(body.restaurantId, userAgent, referrer, body.tableNumber);
    }

    // Public endpoint - Track dish view
    @Post('dish-view')
    async trackDishView(@Body() body: { restaurantId: string; dishId: string; sessionId?: string }) {
        return this.analyticsService.trackDishView(body.restaurantId, body.dishId, body.sessionId);
    }

    // Public endpoint - Track WhatsApp order
    @Post('whatsapp-order')
    async trackWhatsAppOrder(@Body() body: {
        restaurantId: string;
        items: any[];
        totalPrice: number;
        customerName?: string;
        tableNumber?: string;
        orderType?: string;
        deliveryAddress?: string;
    }) {
        return this.analyticsService.trackWhatsAppOrder(body.restaurantId, {
            items: body.items,
            totalPrice: body.totalPrice,
            customerName: body.customerName,
            tableNumber: body.tableNumber,
            orderType: body.orderType,
            deliveryAddress: body.deliveryAddress
        });
    }

    // Protected endpoint - Get WhatsApp orders
    @UseGuards(SupabaseGuard)
    @Get('whatsapp-orders/:restaurantId')
    async getWhatsAppOrders(@Req() req: any, @Param('restaurantId') restaurantId: string) {
        const token = this.extractToken(req);
        return this.analyticsService.getWhatsAppOrders(restaurantId, token);
    }

    // Public/POS endpoint - Update WhatsApp order status (Validate/Cancel)
    @Patch('whatsapp-orders/:orderId')
    async updateWhatsAppStatus(
        @Param('orderId') orderId: string,
        @Body() body: { status: 'VALIDATED' | 'CANCELLED'; staffId?: string }
    ) {
        return this.analyticsService.updateWhatsAppOrderStatus(orderId, body.status, body.staffId);
    }

    // Public/POS endpoint - Update WhatsApp order payment status
    @Patch('whatsapp-orders/:orderId/payment')
    async updateWhatsAppPayment(
        @Param('orderId') orderId: string,
        @Body() body: { isPaid: boolean; staffId?: string }
    ) {
        return this.analyticsService.updateWhatsAppPaymentStatus(orderId, body.isPaid, body.staffId);
    }

    // Public endpoint - Get liked dishes for a session
    @Get('liked-dishes/:restaurantId')
    async getLikedDishes(
        @Param('restaurantId') restaurantId: string,
        @Query('sessionId') sessionId: string
    ) {
        return this.analyticsService.getLikedDishes(restaurantId, sessionId);
    }

    // Protected endpoint - Get dashboard stats (admin only)
    @UseGuards(SupabaseGuard)
    @Get('dashboard/:restaurantId')
    async getDashboardStats(
        @Req() req: any,
        @Param('restaurantId') restaurantId: string,
        @Query('days') days?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('source') source?: string,
        @Query('type') type?: string,
        @Query('status') status?: string,
        @Query('search') search?: string,
        @Query('dateStart') dateStart?: string,
        @Query('dateEnd') dateEnd?: string
    ) {
        const token = this.extractToken(req);
        return this.analyticsService.getDashboardConsolidatedData(
            restaurantId,
            token,
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 50,
            { source, type, status, search, dateStart, dateEnd }
        );
    }

    @Post('aggregate')
    async triggerAggregation(@Query('date') date?: string) {
        return this.analyticsService.runDailyAggregation(date);
    }

    @UseGuards(SupabaseGuard)
    @Get('staff-activity/:staffId/:restaurantId')
    async getStaffActivity(
        @Req() req: any,
        @Param('staffId') staffId: string,
        @Param('restaurantId') restaurantId: string
    ) {
        const token = this.extractToken(req);
        return this.analyticsService.getStaffActivity(staffId, restaurantId, token);
    }

    @UseGuards(SupabaseGuard)
    @Get('global-stats')
    async getGlobalStats() {
        return this.analyticsService.getGlobalStats();
    }

    private extractToken(req: any): string {
        const [type, token] = req.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : '';
    }
}
