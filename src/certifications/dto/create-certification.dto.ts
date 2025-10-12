import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsNumber, IsString } from "class-validator";

export class CreateCertificationDto {
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
}
