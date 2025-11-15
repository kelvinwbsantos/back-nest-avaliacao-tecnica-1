import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, UseGuards, Res, BadRequestException } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Certificate } from './entities/certificate.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Response } from 'express';
import { SuiService } from 'src/sui/sui.service';
import { IssueCertificateDto } from './dto/issue-certificate.dto';
import * as crypto from 'crypto';

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
  @ApiOperation({ summary: 'Emite o selo (NFT) do certificado na blockchain' })
  @ApiResponse({ status: 201, description: 'Selo emitido com sucesso.' })
  async issueCertificate(@Body() data: IssueCertificateDto) {

    const certificado = await this.certificatesService.verify(data.certificateId);
    if (!certificado) {
      throw new BadRequestException('Certificado não encontrado.');
    }

    await this.certificatesService.snapshotCertificateData(
      data.certificateId,
      certificado.user.name,
      certificado.certification.name
    );

    const privateData = {
      snapshot_student_name: certificado.user.name,
      snapshot_certification_name: certificado.certification.name,
      issueDateISO: new Date(certificado.createdAt).toISOString(),
      expiresAtISO: new Date(certificado.expiresAt).toISOString(),
      certificateId: certificado.id
    };

    const dataString = JSON.stringify(privateData);
    const dataHash = crypto.createHash('sha256').update(dataString).digest('hex');

    const imagemGenerica = `https://placehold.co/1080/101820/Gold/png?font=Poppins&text=CERTIFICADO%20DE%20CONCLUS%C3%83O%0A${encodeURIComponent(certificado.certification.name)}`;

    try {
      const blockchainResult = await this.suiService.mintCertificate({
        dataHash: dataHash,
        imageUrl: imagemGenerica,
        studentAddress: data.walletAddress
      });

      await this.certificatesService.saveBlockchainInfo(
        data.certificateId,
        blockchainResult.txHash,
        blockchainResult.success,
        blockchainResult.nftId,
        dataHash
      );

      return {
        message: "Selo de autenticidade (NFT) emitido!",
        blockchain: blockchainResult,
        privateData: privateData
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
