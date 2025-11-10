import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Certificate } from './entities/certificate.entity';
import { Repository } from 'typeorm';
import { PdfGeneratorService } from './pdf-generator.service';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,
    private readonly pdfGeneratorService: PdfGeneratorService
  ) { }

  async create(createCertificateDto: CreateCertificateDto): Promise<Certificate> {
    const { userId, certificationId } = createCertificateDto;

    const newCertificate = this.certificateRepository.create({
      userId,
      certificationId,
      expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Expira em 1 ano
    })

    await this.certificateRepository.save(newCertificate);

    return newCertificate
  }

  async generate(certificationId: string, userId: string): Promise<Buffer> {
    const certificate = await this.verify(certificationId);

    if (certificate.userId != userId) {
      throw new ForbiddenException('Esta certificação não pertence a você.');
    }

    const pdfData = {
      title: 'Certificado de Conclusão',
      name: certificate.user.name,
      certificationName: certificate.certification.name,
      issueDate: new Date(certificate.createdAt).toLocaleDateString('pt-BR'),
      certificateId: certificate.id,
    };

    const pdfBuffer: Buffer = await this.pdfGeneratorService.generate(pdfData);

    return pdfBuffer;
  }

  async verify(certificateId: string): Promise<Certificate> {
    const certificate = await this.certificateRepository.findOne({
      where: { id: certificateId },
      relations: ['user', 'certification'],
    });

    if (!certificate) {
      throw new NotFoundException("Não existe certificado com essa identificação");
    }

    if (certificate.expiresAt < new Date()) {
      throw new ForbiddenException("Este certificado está expirado");
    }

    return certificate;
  }

  async findAllByUser(
    userId: string,
    page: number = 1,
    limit: number = 10,
    active?: boolean,
  ) {
    const skip = (page - 1) * limit;

    const queryBuilder = this.certificateRepository
      .createQueryBuilder('certificate')
      .where('certificate.userId = :userId', { userId })
      .skip(skip)
      .take(limit)
      .orderBy('certificate.createdAt', 'DESC');

    if (active != undefined) {
      queryBuilder.andWhere('certificate.active = :active', { active });
    }

    queryBuilder
      .leftJoin('certificate.certification', 'certification')
      .addSelect(['certification.name']);

    const [certificates, total] = await queryBuilder.getManyAndCount();

    return {
      data: certificates,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / limit),
      },
    };
  }
}
