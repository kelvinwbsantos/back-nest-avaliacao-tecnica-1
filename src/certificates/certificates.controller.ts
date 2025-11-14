import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, UseGuards, Res, BadRequestException } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Certificate } from './entities/certificate.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Response } from 'express';
import { SuiService } from 'src/sui/sui.service';
import { IssueCertificateDto } from './dto/issue-certificate.dto';

@ApiTags('Certificates')
@ApiBearerAuth()
@Controller('certificates')
export class CertificatesController {
  constructor(
    private readonly certificatesService: CertificatesService,
    private readonly suiService: SuiService,
  ) { }

  @Get('verify')
  @ApiOperation({ summary: 'Verifica validade de um certificado' })
  @ApiResponse({ status: 200, description: 'Certificado válido.', type: Certificate })
  @ApiResponse({ status: 404, description: 'Certificado não encontrado.' })
  @ApiResponse({ status: 403, description: 'Certificado expirado.' })
  verify(@Param('certificateId') certificateId: string) {
    return this.certificatesService.verify(certificateId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Busca todas certificações do usuário' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número da página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limite por página' })
  @ApiQuery({ name: 'active', required: false, type: Boolean, description: 'Filtrar por status' })
  @ApiResponse({ status: 200, description: 'Lista de certificados retornado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  findAllByUser(
    @Req() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('active') active?: boolean,
  ) {
    const userId = req.user.userId;
    return this.certificatesService.findAllByUser(userId, Number(page), Number(limit), active);
  }

  @Post('generate/:certificationId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Gera e baixa o certificado em PDF' })
  @ApiResponse({ status: 200, description: 'Certificado gerado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Certificado não encontrado.' })
  async generateCertificate(
    @Param('certificationId') certificationId: string,
    @Req() req,
    @Res() res: Response,
  ) {

    const pdfBuffer = await this.certificatesService.generate(certificationId, req.user.userId)

    const fileName = `certificado-${certificationId}.pdf`;

    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.setHeader('Content-Type', 'application/pdf');

    return res.send(pdfBuffer);
  }

  @Post('issue')
  @ApiOperation({ summary: 'Emite o certificado na blockchain Sui' })
  @ApiResponse({ status: 201, description: 'Certificado emitido com sucesso na blockchain.' })
  async issueCertificate(@Body() data: IssueCertificateDto) {

    const certificado = await this.certificatesService.verify(data.certificateId);
    const imagem = `https://placehold.co/800x600/101820/Gold/png?text=CERTIFICADO%0A${encodeURIComponent(certificado.snapshot_student_name)}`;

    if (!certificado) {
      throw new BadRequestException('Certificado não encontrado.');
    }

    const carteiraDestino = data.walletAddress;

    await this.certificatesService.snapshotCertificateData(data.certificateId, certificado.user.name, certificado.certification.name);

    try {
      const blockchainResult = await this.suiService.mintCertificate({
        studentName: certificado.user.name,
        courseName: certificado.certification.name,
        issueDate: new Date(certificado.createdAt).toLocaleDateString('pt-BR'),
        expiresAt: new Date(certificado.expiresAt).toLocaleDateString('pt-BR'),
        certificateId: certificado.id,
        imageUrl: imagem,
        studentAddress: carteiraDestino
      });

      await this.certificatesService.saveBlockchainInfo(data.certificateId, blockchainResult.txHash, blockchainResult.success, blockchainResult.nftId);

      return {
        message: "Certificado emitido e registrado na blockchain!",
        blockchain: blockchainResult
      };

    } catch (error) {
      throw new BadRequestException(`Erro na Blockchain: ${error.message}`);
    }
  }

  @Get('validate-blockchain/:nftId')
  @ApiOperation({ summary: 'Valida a autenticidade de um NFT na blockchain Sui' })
  @ApiResponse({ status: 200, description: 'Retorna o status e os dados do NFT.' })
  @ApiResponse({ status: 400, description: 'NFT inválido, não encontrado ou falsificado.' })
  async validateOnBlockchain(
    @Param('nftId') nftId: string,
  ) {
    const validationResult = await this.suiService.validateNft(nftId);

    if (!validationResult.isValid) {
      throw new BadRequestException(validationResult.message);
    }

    return validationResult;
  }
}
