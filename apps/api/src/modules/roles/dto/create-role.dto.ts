import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty({ message: 'Role name is required' })
  name: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
