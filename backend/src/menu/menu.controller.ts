import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { MenuService } from './menu.service';
import { QrCodeService } from './qrcode.service';
import { EmailService } from '../email/email.service';
import { SupabaseGuard } from '../auth/supabase.guard';
import { StaffGuard } from '../auth/staff.guard';

@Controller('menu')
export class MenuController {
    constructor(
        private readonly menuService: MenuService,
        private readonly qrCodeService: QrCodeService,
        private readonly emailService: EmailService
    ) { }

    @UseGuards(SupabaseGuard)
    @Patch('master/approve/:id')
    async approveRestaurant(@Req() req: any, @Param('id') id: string, @Body() body: { is_approved: boolean }) {
        const requesterId = req.user.id;
        const isMaster = await this.menuService.checkIfMaster(requesterId);
        if (!isMaster) throw new ForbiddenException('Only masters can approve restaurants');
        
        return this.menuService.masterUpdateRestaurant(id, { is_approved: body.is_approved });
    }

    @UseGuards(SupabaseGuard)
    @Post('onboard')
    async onboardRestaurant(@Req() req: any, @Body() body: { name: string; ownerId: string }) {
        const token = this.extractToken(req);
        const userEmail = req.user?.email || 'new-user@noremenu.com'; // In prod, get from JWT payload

        const restaurant = await this.menuService.createRestaurant(body.name, body.ownerId, token);

        // Send welcome email
        await this.emailService.sendWelcomeEmail(userEmail, body.name);

        return restaurant;
    }

    @Get(':restaurantId')
    async getMenu(@Param('restaurantId') restaurantId: string) {
        return this.menuService.getMenu(restaurantId);
    }

    @Get(':restaurantId/qr')
    async generateQr(@Param('restaurantId') restaurantId: string) {
        const url = `https://nore-menu.vercel.app/menu/${restaurantId}`;
        const qrCode = await this.qrCodeService.generateQrCode(url);
        return { qrCode, url };
    }

    @UseGuards(SupabaseGuard)
    @Post('category')
    async createCategory(@Req() req: any, @Body() body: { name: string; name_en?: string; restaurantId: string }) {
        const token = this.extractToken(req);
        return this.menuService.createCategory(body.restaurantId, body.name, body.name_en || '', token);
    }

    @UseGuards(SupabaseGuard)
    @Patch('category/:id')
    async updateCategory(@Req() req: any, @Param('id') id: string, @Body() body: { name: string; name_en?: string }) {
        const token = this.extractToken(req);
        return this.menuService.updateCategory(id, body.name, body.name_en || '', token);
    }

    @UseGuards(SupabaseGuard)
    @Post('reorder-categories')
    async reorderCategories(@Req() req: any, @Body() body: { orders: { id: string, order: number }[] }) {
        const token = this.extractToken(req);
        return this.menuService.reorderCategories(body.orders, token);
    }

    @UseGuards(SupabaseGuard)
    @Delete('category/:id')
    async deleteCategory(@Req() req: any, @Param('id') id: string) {
        const token = this.extractToken(req);
        return this.menuService.deleteCategory(id, token);
    }

    @UseGuards(SupabaseGuard)
    @Post('dish')
    async createDish(@Req() req: any, @Body() body: { restaurantId: string; categoryId: string; name: string; price: number; description?: string }) {
        const token = this.extractToken(req);
        const { restaurantId, categoryId, ...dish } = body;
        return this.menuService.createDish(restaurantId, categoryId, dish, token);
    }

    @UseGuards(SupabaseGuard)
    @Post('dishes-bulk')
    async createDishesBulk(@Req() req: any, @Body() body: { dishes: any[] }) {
        const token = this.extractToken(req);
        return this.menuService.createDishesBulk(body.dishes, token);
    }

    @UseGuards(SupabaseGuard)
    @Post('import-global')
    async importGlobal(@Req() req: any, @Body() body: { restaurantId: string; items: any[] }) {
        const token = this.extractToken(req);
        return this.menuService.importGlobal(body.restaurantId, body.items, token);
    }

    @UseGuards(StaffGuard)
    @Patch('dish/:id/availability')
    async toggleDishAvailability(@Req() req: any, @Param('id') id: string, @Body() body: { isAvailable: boolean; staffId?: string }) {
        const token = this.extractToken(req);
        return this.menuService.toggleDishAvailability(id, body.isAvailable, token);
    }

    @UseGuards(SupabaseGuard)
    @Patch('dish/:id')
    async updateDish(@Req() req: any, @Param('id') id: string, @Body() body: any) {
        const token = this.extractToken(req);
        const { restaurantId, categoryId, ...rest } = body;
        const updateData: any = { ...rest };
        if (restaurantId) updateData.restaurant_id = restaurantId;
        if (categoryId) updateData.category_id = categoryId;
        return this.menuService.updateDish(id, updateData, token);
    }

    @UseGuards(SupabaseGuard)
    @Patch('settings/:restaurantId')
    async updateRestaurantSettings(@Req() req: any, @Param('restaurantId') restaurantId: string, @Body() body: any) {
        const token = this.extractToken(req);
        return this.menuService.updateRestaurantInfo(restaurantId, body, token);
    }

    @UseGuards(SupabaseGuard)
    @Get('master/all')
    async getAllRestaurants(@Req() req: any) {
        const token = this.extractToken(req);
        return this.menuService.getAllRestaurants(token);
    }

    @UseGuards(SupabaseGuard)
    @Post('badge')
    async createBadge(@Req() req: any, @Body() body: { restaurantId: string; categoryId: string; badge: any }) {
        const token = this.extractToken(req);
        return this.menuService.createBadge(body.restaurantId, body.categoryId, body.badge, token);
    }

    @UseGuards(SupabaseGuard)
    @Patch('badge/:id')
    async updateBadge(@Req() req: any, @Param('id') id: string, @Body() body: any) {
        const token = this.extractToken(req);
        return this.menuService.updateBadge(id, body, token);
    }

    @UseGuards(SupabaseGuard)
    @Delete('badge/:id')
    async deleteBadge(@Req() req: any, @Param('id') id: string) {
        const token = this.extractToken(req);
        return this.menuService.deleteBadge(id, token);
    }

    @UseGuards(SupabaseGuard)
    @Delete('dish/:id')
    async deleteDish(@Req() req: any, @Param('id') id: string) {
        const token = this.extractToken(req);
        return this.menuService.deleteDish(id, token);
    }

    private extractToken(req: any): string {
        const [type, token] = req.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : '';
    }
}