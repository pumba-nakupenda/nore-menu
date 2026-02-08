import { Controller, Post, Get, Delete, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { StaffService } from './staff.service';
import { SupabaseGuard } from '../auth/supabase.guard';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post('login')
  async loginPOS(@Body() body: any) {
    return this.staffService.loginPOS(body.username, body.password);
  }

  @UseGuards(SupabaseGuard)
  @Post(':restaurantId')
  async createStaff(@Param('restaurantId') restaurantId: string, @Body() staffData: any, @Request() req: any) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.staffService.createStaffAccount(restaurantId, staffData, token);
  }

  @UseGuards(SupabaseGuard)
  @Get(':restaurantId')
  async getStaff(@Param('restaurantId') restaurantId: string, @Request() req: any) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.staffService.getRestaurantStaff(restaurantId, token);
  }

  @UseGuards(SupabaseGuard)
  @Delete(':staffId')
  async deleteStaff(@Param('staffId') staffId: string, @Request() req: any) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.staffService.deleteStaffAccount(staffId, token);
  }

  @UseGuards(SupabaseGuard)
  @Patch(':staffId')
  async updateStaff(@Param('staffId') staffId: string, @Body() staffData: any, @Request() req: any) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.staffService.updateStaffAccount(staffId, staffData, token);
  }
}
