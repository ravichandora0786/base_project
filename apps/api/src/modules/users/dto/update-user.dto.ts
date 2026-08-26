import { IsString, IsEmail, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { GenderEnum } from '../../../common/constants/enums';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
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
}
