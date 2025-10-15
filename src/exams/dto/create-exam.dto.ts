import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class CreateExamDto {
    @ApiProperty({
        description: 'ID da inscrição (enrollment) para iniciar o exame',
        example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    })
    @IsUUID()
    enrollmentId: string;
}