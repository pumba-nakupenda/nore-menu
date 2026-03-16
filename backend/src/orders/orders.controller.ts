import { Controller, Post, Get, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { StaffGuard } from '../auth/staff.guard';
import { SupabaseGuard } from '../auth/supabase.guard';
import { CreateOrderDto, UpdateOrderStatusDto } from '../dto/orders.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @UseGuards(StaffGuard)
  @Post(':restaurantId')
  async createOrder(@Param('restaurantId') restaurantId: string, @Body() orderData: CreateOrderDto) {
    return this.ordersService.createOrder(restaurantId, orderData);
  }

  @Get(':orderId/status')
  async getOrderStatus(@Param('orderId') orderId: string) {
    return this.ordersService.getOrderById(orderId);
  }

  @UseGuards(StaffGuard)
  @Get('transactions/:staffId')
  async getTransactions(@Param('staffId') staffId: string) {
    return this.ordersService.getStaffTransactions(staffId);
  }

  @UseGuards(StaffGuard)
  @Patch(':orderId/pos-status')
  async updateStatus(@Param('orderId') orderId: string, @Body() body: UpdateOrderStatusDto) {
    return this.ordersService.updateOrderStatus(orderId, body.status, body.isPaid, body.staffId);
  }

  @UseGuards(StaffGuard)
  @Get('staff/:restaurantId')
  async getStaffRestaurantOrders(@Param('restaurantId') restaurantId: string) {
    return this.ordersService.getRestaurantOrders(restaurantId);
  }

  @UseGuards(SupabaseGuard)
  @Get('admin/:restaurantId')
  async getRestaurantOrders(@Param('restaurantId') restaurantId: string) {
    return this.ordersService.getRestaurantOrders(restaurantId);
  }

  @UseGuards(StaffGuard)
  @Get('active/:restaurantId')
  async getActiveOrders(@Param('restaurantId') restaurantId: string) {
    return this.ordersService.getActiveOrders(restaurantId);
  }
}
