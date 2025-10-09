import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateQuestionDto } from './create-question.dto';

export class UpdateQuestionDto extends PartialType(CreateQuestionDto) {
    @ApiProperty({ example: 'Qual capital do Brasil?'})
    question?: string;

    @ApiProperty({ example: true })
    answer?: boolean;
    
    @ApiProperty({ example: 12 })
    validity_months?: number;
}
