import { IsNotEmpty, IsString, IsArray, IsUUID } from 'class-validator';

export class CreateRolePermissionDto {
  @IsString()
  @IsNotEmpty({ message: 'Mapping name is required' })
  name: string;

  @IsUUID('4', { message: 'Invalid role ID' })
  @IsNotEmpty({ message: 'Role ID is required' })
  role_id: string;

  @IsUUID('4', { message: 'Invalid module ID' })
  @IsNotEmpty({ message: 'Module ID is required' })
  module_id: string;

  @IsArray()
  @IsUUID('4', { each: true, message: 'Permission IDs must be valid UUIDs' })
  permission_ids: string[];
}
