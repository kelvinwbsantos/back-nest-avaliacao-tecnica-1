import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsNumber, IsString } from "class-validator";

export class CertificationBodyDto {
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
    @Type(() => Number)
    passingScore: number;

    @ApiProperty({ enum: ['inPerson', 'online'], example: 'online' })
    @IsEnum(['inPerson', 'online'], { message: 'Modalidade deve ser "inPerson" ou "online"' })
    modality: 'inPerson' | 'online';

    @ApiProperty({ example: 12 })
    @IsInt()
    @Type(() => Number)
    durationHours: number;
}

export class CreateCertificationDto extends CertificationBodyDto {
    @ApiProperty({
        type: 'string',
        format: 'binary',
        description: 'Arquivo PDF contendo o conteúdo da certificação, a geração de questões será baseada neste arquivo.',
        required: true,
    })
    file: any;
}
