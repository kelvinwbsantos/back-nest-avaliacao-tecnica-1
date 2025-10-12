import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateCertificationDto } from './create-certification.dto';
import { IsBoolean, IsInt, IsNumber, IsString } from 'class-validator';

export class UpdateCertificationDto extends PartialType(CreateCertificationDto) {
        @ApiProperty({ example: 'Certificação de Segurança da Informação' })
        @IsString()
        name: string;
    
        @ApiProperty({ example: 'Se inscreva e garanta seu certificado' })
        @IsString()
        shortDescription: string;
    
        @ApiProperty({ example: 'A Certificação de Segurança da Informação visa conferir ao usuario um atestado de suas habilidades.' })
        @IsString()
        description: string;
    
        @ApiProperty({ example: 70 })
        @IsNumber()
        passingScore: number;
    
        @ApiProperty({ examples: ['inPerson', 'online'] })
        @IsString()
        modality: string;
    
        @ApiProperty({ example: 12 })
        @IsInt()
        durationHours: number;

        @ApiProperty({ example: true })
        @IsBoolean()
        isActive: boolean;
}
