import { IsString, IsOptional, IsEnum, ValidateNested, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { GenderEnum } from '../../../common/constants/enums';

export class AddressDto {
  @IsString()
  @IsOptional()
  street?: string | null;

  @IsString()
  @IsOptional()
  city?: string | null;

  @IsString()
  @IsOptional()
  state?: string | null;

  @IsString()
  @IsOptional()
  country?: string | null;

  @IsString()
  @IsOptional()
  postal_code?: string | null;
}

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[6-9]\d{9}$/, { message: 'Invalid phone number (10 digits, starts with 6-9, e.g. 9000000000)' })
  phone?: string | null;

  @IsEnum(GenderEnum)
  @IsOptional()
  gender?: GenderEnum | null;

  @IsString()
  @IsOptional()
  about?: string | null;

  @ValidateNested()
  @Type(() => AddressDto)
  @IsOptional()
  address?: AddressDto | null;
}
