import { IsNotEmpty, IsString, IsBoolean, IsOptional, Matches } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty({ message: 'Permission name is required' })
  @Matches(/^[a-zA-Z\s]+$/, { message: 'Permission name can only contain alphabets and spaces' })
  name: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
