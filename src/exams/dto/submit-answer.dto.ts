import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsUUID, IsArray, ValidateNested, ArrayMinSize } from "class-validator";

export class SubmitAnswerDto {
    @ApiProperty({
        description: 'ID da questão sendo respondida',
        example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    })
    @IsUUID()
    questionId: string;

    @ApiProperty({
        description: 'Resposta do usuário (true/false)',
        example: true,
    })
    @IsBoolean()
    userAnswer: boolean;
}

export class SubmitExamDto {
    @ApiProperty({
        description: 'Lista de respostas do exame',
        type: [SubmitAnswerDto],
        example: [
            {
                questionId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
                userAnswer: true
            },
            {
                questionId: 'b2c3d4e5-f6a7-8901-2345-678901bcdefg',
                userAnswer: false
            }
        ]
    })
    @IsArray()
    @ArrayMinSize(1, { message: 'Deve fornecer pelo menos uma resposta' })
    @ValidateNested({ each: true })
    @Type(() => SubmitAnswerDto)
    answers: SubmitAnswerDto[];
}