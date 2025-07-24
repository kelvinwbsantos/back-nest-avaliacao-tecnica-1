import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateRoleDto {
    @ApiProperty({
        description: 'Nome da Role',
        example: 'administrador',
    })
    @IsString()
    name: string;
}