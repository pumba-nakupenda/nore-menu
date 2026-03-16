import { IsString, IsBoolean, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateStaffDto {
  @IsString()
  @MaxLength(50)
  displayName: string;

  @IsString()
  @MaxLength(50)
  username: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(128)
  password: string;

  @IsBoolean() @IsOptional()
  can_view_whatsapp?: boolean;

  @IsBoolean() @IsOptional()
  can_view_cashier?: boolean;

  @IsBoolean() @IsOptional()
  can_view_kitchen?: boolean;

  @IsBoolean() @IsOptional()
  can_manage_stocks?: boolean;

  @IsBoolean() @IsOptional()
  can_view_transactions?: boolean;

  @IsBoolean() @IsOptional()
  can_process_payments?: boolean;

  @IsBoolean() @IsOptional()
  can_validate_orders?: boolean;

  @IsBoolean() @IsOptional()
  can_cancel_orders?: boolean;
}

export class LoginPosDto {
  @IsString()
  @MaxLength(100)
  username: string;

  @IsString()
  password: string;
}

export class UpdateStaffDto {
  @IsString() @IsOptional()
  @MaxLength(50)
  displayName?: string;

  @IsString() @IsOptional()
  @MaxLength(50)
  username?: string;

  @IsString() @IsOptional()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(128)
  password?: string;

  @IsBoolean() @IsOptional()
  can_view_whatsapp?: boolean;

  @IsBoolean() @IsOptional()
  can_view_cashier?: boolean;

  @IsBoolean() @IsOptional()
  can_view_kitchen?: boolean;

  @IsBoolean() @IsOptional()
  can_manage_stocks?: boolean;

  @IsBoolean() @IsOptional()
  can_view_transactions?: boolean;

  @IsBoolean() @IsOptional()
  can_process_payments?: boolean;

  @IsBoolean() @IsOptional()
  can_validate_orders?: boolean;

  @IsBoolean() @IsOptional()
  can_cancel_orders?: boolean;
}
