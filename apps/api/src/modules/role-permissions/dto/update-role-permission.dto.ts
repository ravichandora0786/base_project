import { IsString, IsArray, IsUUID, IsOptional } from 'class-validator';

export class UpdateRolePermissionDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsUUID('4')
  @IsOptional()
  role_id?: string;

  @IsUUID('4')
  @IsOptional()
  module_id?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  permission_ids?: string[];
}
