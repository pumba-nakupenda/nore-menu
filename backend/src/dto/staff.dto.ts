import { IsString, IsBoolean, IsOptional, MinLength } from 'class-validator';

export class CreateStaffDto {
  @IsString()
  displayName: string;

  @IsString()
  username: string;

  @IsString()
  @MinLength(4)
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
  username: string;

  @IsString()
  password: string;
}

export class UpdateStaffDto {
  @IsString() @IsOptional()
  displayName?: string;

  @IsString() @IsOptional()
  username?: string;

  @IsString() @IsOptional()
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
