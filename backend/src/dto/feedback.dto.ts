import { IsString, IsNumber, IsOptional, Min, Max, MaxLength } from 'class-validator';

export class CreateFeedbackDto {
  @IsString()
  restaurantId: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @MaxLength(1000)
  comment: string;

  @IsString() @IsOptional()
  tableNumber?: string;
}
