import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, UseGuards, Res } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Certificate } from './entities/certificate.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Response } from 'express';

@ApiTags('Certificates')
@ApiBearerAuth()
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) { }

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
}
