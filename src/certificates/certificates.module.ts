import { Module } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { CertificatesController } from './certificates.controller';
import { Certificate } from './entities/certificate.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { PdfGeneratorService } from './pdf-generator.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Certificate]),
    AuthModule
  ],
  controllers: [CertificatesController],
  providers: [CertificatesService, PdfGeneratorService],
  exports: [CertificatesService]
})
export class CertificatesModule {}
