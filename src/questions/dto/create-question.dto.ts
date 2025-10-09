import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsString } from "class-validator";

export class CreateQuestionDto {
    @ApiProperty({ example: 'Qual capital do Brasil?'})
    @IsString()
    question: string;

    @ApiProperty({ example: true })
    @IsBoolean()
    answer: boolean;

    @ApiProperty({ example: 12 })
    @IsInt()
    validity_months: number;
}
