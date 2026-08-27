import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsEnum, Matches } from 'class-validator';
import { RoleEnum, GenderEnum } from '../../../common/constants/enums';

export class RegisterDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @Matches(/^[a-zA-Z0-9._%+\-]+@gmail\.com$/, { message: 'Only Gmail addresses are allowed (e.g. user@gmail.com)' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,}$/, {
    message: 'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character',
  })
  password: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(RoleEnum)
  @IsOptional()
  role?: RoleEnum;

  @IsString()
  @IsOptional()
  @Matches(/^[6-9]\d{9}$/, { message: 'Invalid phone number (10 digits, starts with 6-9, e.g. 9000000000)' })
  phone?: string;

  @IsEnum(GenderEnum)
  @IsOptional()
  gender?: GenderEnum;

  @IsOptional()
  address?: any;

  @IsOptional()
  date_of_birth?: any;

  @IsString()
  @IsOptional()
  about?: string;
}
