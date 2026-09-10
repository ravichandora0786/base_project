import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsInt, Matches } from 'class-validator';

export class CreateAppModuleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsNotEmpty({ message: 'Display name is required' })
  @Matches(/^[a-zA-Z\s]+$/, { message: 'Display name can only contain alphabets and spaces' })
  display_name: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  route?: string;

  @IsInt()
  @IsOptional()
  sort_order?: number;
}
