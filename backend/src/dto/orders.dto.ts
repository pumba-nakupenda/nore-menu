import { IsString, IsNumber, IsArray, IsBoolean, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @IsArray()
  items: any[];

  @IsNumber()
  totalPrice: number;

  @IsString() @IsOptional()
  tableNumber?: string;

  @IsString() @IsOptional()
  customerName?: string;

  @IsString() @IsOptional()
  customerPhone?: string;

  @IsString() @IsOptional()
  orderType?: string;

  @IsBoolean() @IsOptional()
  isPaid?: boolean;

  @IsString() @IsOptional()
  processedBy?: string;
}

export class UpdateOrderStatusDto {
  @IsString()
  status: string;

  @IsBoolean() @IsOptional()
  isPaid?: boolean;

  @IsString() @IsOptional()
  staffId?: string;
}
