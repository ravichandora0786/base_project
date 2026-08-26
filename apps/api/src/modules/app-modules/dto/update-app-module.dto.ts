import { IsString, IsBoolean, IsOptional, IsInt } from 'class-validator';

export class UpdateAppModuleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  display_name?: string;

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
