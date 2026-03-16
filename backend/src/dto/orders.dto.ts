import { IsString, IsNumber, IsArray, IsBoolean, IsOptional, IsIn, Min, ArrayMaxSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsNumber()
  @Min(0)
  totalPrice: number;

  @IsString() @IsOptional()
  tableNumber?: string;

  @IsString() @IsOptional()
  customerName?: string;

  @IsString() @IsOptional()
  customerPhone?: string;

  @IsString() @IsOptional()
  @IsIn(['dine_in', 'takeaway', 'delivery'])
  orderType?: string;

  @IsBoolean() @IsOptional()
  isPaid?: boolean;

  @IsString() @IsOptional()
  processedBy?: string;
}

export class UpdateOrderStatusDto {
  @IsString()
  @IsIn(['RECEIVED', 'IN_PROGRESS', 'READY', 'SERVED', 'DELIVERED', 'CANCELLED'])
  status: string;

  @IsBoolean() @IsOptional()
  isPaid?: boolean;

  @IsString() @IsOptional()
  staffId?: string;
}
