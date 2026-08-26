import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsInt } from 'class-validator';

export class CreateAppModuleDto {
  @IsString()
  @IsNotEmpty({ message: 'Module name is required' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Display name is required' })
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
