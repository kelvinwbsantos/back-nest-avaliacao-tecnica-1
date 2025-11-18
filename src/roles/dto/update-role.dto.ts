import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleDto {
  @ApiProperty({
    description: 'Role name',
    example: 'Admin',
    required: false
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(50)
  name?: string;

  @ApiProperty({
    description: 'Role description',
    example: 'Administrator role with full access',
    required: false
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;
}