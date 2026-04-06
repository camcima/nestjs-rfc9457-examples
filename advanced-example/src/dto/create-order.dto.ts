import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsPostalCode,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class AddressDto {
  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsPostalCode('US')
  zip: string;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress: AddressDto;
}
