import { Body, Controller, Get, Param, Post, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { SupabaseGuard } from '../auth/supabase.guard';
import { StaffGuard } from '../auth/staff.guard';
import { MasterGuard } from '../auth/master.guard';
import { TrackLikeDto, TrackQrScanDto, TrackDishViewDto, TrackWhatsAppOrderDto, UpdateWhatsAppStatusDto, UpdateWhatsAppPaymentDto } from '../dto/analytics.dto';

@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    // Public endpoint - Toggle dish like
    @Post('like')
    async toggleLike(@Body() body: TrackLikeDto) {
        return this.analyticsService.toggleDishLike(body.restaurantId, body.dishId, body.sessionId);
    }

    // Public endpoint - Track QR scan
    @Post('qr-scan')
    async trackQrScan(@Body() body: TrackQrScanDto, @Req() req: any) {
        const userAgent = req.headers['user-agent'] || 'unknown';
        const referrer = req.headers['referer'] || req.headers['referrer'];
        return this.analyticsService.trackQrScan(body.restaurantId, userAgent, referrer, body.tableNumber);
    }

    // Public endpoint - Track dish view
    @Post('dish-view')
    async trackDishView(@Body() body: TrackDishViewDto) {
        return this.analyticsService.trackDishView(body.restaurantId, body.dishId, body.sessionId);
    }

    // Public endpoint - Track WhatsApp order
    @Post('whatsapp-order')
    async trackWhatsAppOrder(@Body() body: TrackWhatsAppOrderDto) {
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

    // Protected endpoint - Update WhatsApp order status (StaffGuard required)
    @UseGuards(StaffGuard)
    @Patch('whatsapp-orders/:orderId')
    async updateWhatsAppStatus(
        @Param('orderId') orderId: string,
        @Body() body: UpdateWhatsAppStatusDto
    ) {
        return this.analyticsService.updateWhatsAppOrderStatus(orderId, body.status, body.staffId, {
            customerName: body.customerName,
            deliveryAddress: body.deliveryAddress
        });
    }

    // Protected endpoint - Update WhatsApp order payment status (StaffGuard required)
    @UseGuards(StaffGuard)
    @Patch('whatsapp-orders/:orderId/payment')
    async updateWhatsAppPayment(
        @Param('orderId') orderId: string,
        @Body() body: UpdateWhatsAppPaymentDto
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

    // Protected endpoint - Trigger aggregation (master admin only)
    @UseGuards(SupabaseGuard, MasterGuard)
    @Post('aggregate')
    async triggerAggregation(@Req() req: any, @Query('date') date?: string) {
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

    // Protected endpoint - Global stats (master admin only)
    @UseGuards(SupabaseGuard, MasterGuard)
    @Get('global-stats')
    async getGlobalStats(@Req() req: any) {
        const token = this.extractToken(req);
        return this.analyticsService.getGlobalStats(token);
    }

    private extractToken(req: any): string {
        const [type, token] = req.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : '';
    }
}
