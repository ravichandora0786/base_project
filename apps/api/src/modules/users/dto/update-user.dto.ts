import { IsString, IsEmail, IsOptional, IsBoolean, IsEnum, Matches } from 'class-validator';
import { GenderEnum } from '../../../common/constants/enums';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @Matches(/^[a-zA-Z0-9._%+\-]+@gmail\.com$/, { message: 'Only Gmail addresses are allowed (e.g. user@gmail.com)' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[6-9]\d{9}$/, { message: 'Invalid phone number (10 digits, starts with 6-9, e.g. 9000000000)' })
  phone?: string;

  @IsEnum(GenderEnum)
  @IsOptional()
  gender?: GenderEnum;

  @IsString()
  @IsOptional()
  profile_image?: string;

  @IsString()
  @IsOptional()
  about?: string;

  @IsString()
  @IsOptional()
  role_id?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsOptional()
  address?: any;

  @IsOptional()
  date_of_birth?: any;
}
