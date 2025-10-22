import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, UseGuards } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Certificate } from './entities/certificate.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Certificates')
@ApiBearerAuth()
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get('verify')
  @ApiOperation({ summary: 'Verifica validade de um certificado'})
  @ApiResponse({ status: 200, description: 'Certificado válido.', type: Certificate})
  @ApiResponse({ status: 404, description: 'Certificado não encontrado.'})
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
}
