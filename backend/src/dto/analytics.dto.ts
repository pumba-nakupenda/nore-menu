import { IsString, IsNumber, IsArray, IsOptional, IsBoolean, IsIn, Min, ArrayMaxSize } from 'class-validator';

export class TrackLikeDto {
  @IsString()
  restaurantId: string;

  @IsString()
  dishId: string;

  @IsString()
  sessionId: string;
}

export class TrackQrScanDto {
  @IsString()
  restaurantId: string;

  @IsString() @IsOptional()
  tableNumber?: string;
}

export class TrackDishViewDto {
  @IsString()
  restaurantId: string;

  @IsString()
  dishId: string;

  @IsString() @IsOptional()
  sessionId?: string;
}

export class TrackWhatsAppOrderDto {
  @IsString()
  restaurantId: string;

  @IsArray()
  @ArrayMaxSize(200)
  items: any[];

  @IsNumber()
  @Min(0)
  totalPrice: number;

  @IsString() @IsOptional()
  customerName?: string;

  @IsString() @IsOptional()
  tableNumber?: string;

  @IsString() @IsOptional()
  @IsIn(['dine_in', 'takeaway', 'delivery'])
  orderType?: string;

  @IsString() @IsOptional()
  deliveryAddress?: string;
}

export class UpdateWhatsAppStatusDto {
  @IsString()
  @IsIn(['VALIDATED', 'CANCELLED'])
  status: 'VALIDATED' | 'CANCELLED';

  @IsString() @IsOptional()
  staffId?: string;

  @IsString() @IsOptional()
  customerName?: string;

  @IsString() @IsOptional()
  deliveryAddress?: string;
}

export class UpdateWhatsAppPaymentDto {
  @IsBoolean()
  isPaid: boolean;

  @IsString() @IsOptional()
  staffId?: string;
}
