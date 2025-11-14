import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class IssueCertificateDto {
  @ApiProperty({ example: 'uuid-do-certificado', description: 'ID do certificado no banco de dados' })
  @IsString()
  @IsNotEmpty()
  certificateId: string;

  @ApiProperty({ example: '0x123...', description: 'Endereço da carteira Sui do aluno' })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;
}