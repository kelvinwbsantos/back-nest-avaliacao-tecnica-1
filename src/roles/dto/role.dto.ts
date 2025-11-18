import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

/**
 * DTO para criação e futura manutenção de 'roles'.
 */

export class CreateRoleDto {
    /**
     * Nome da role a ser criada.
     * Deve ser uma string não vazia, como "administrador", "user", etc.
     */
    @ApiProperty({
        description: 'Nome da Role',
        example: 'administrador',
    })
    @IsString()
    name: string;

    /**
     * Descrição da role a ser criada.
     */
    @ApiProperty({
        description: 'Descrição da role',
        example: 'Role de acesso total',
    })
    @IsString()
    description: string;
}