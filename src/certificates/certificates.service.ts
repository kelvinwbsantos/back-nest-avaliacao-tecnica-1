import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Certificate } from './entities/certificate.entity';
import { Repository } from 'typeorm';
import { NotFoundError } from 'rxjs';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,
  ) { }

  async create(createCertificateDto: CreateCertificateDto): Promise<Certificate> {
    const { userId, certificationId } = createCertificateDto;

    const newCertificate = this.certificateRepository.create({
      userId,
      certificationId
    })

    await this.certificateRepository.save(newCertificate);

    return newCertificate
  }

  /* GERAR ARQUIVO PDF DO CERTIFICADO
  async generate(certificationId: string): Promise<Buffer> {
    const certificate = await this.verify(certificationId);

    const pdfData = {
      title: 'Certificado de Conclusão',
      name: certificate.user.name,
      certificationName: certificate.certification.name,
      issueDate: new Date(certificate.createdAt).toLocaleDateString('pt-BR'),
    };
    
    // const pdfBuffer: Buffer = await this.pdfGeneratorService.generate(pdfData);

    return pdfBuffer;
  } */

  async verify(certificateId: string): Promise<Certificate> {
    const certificate = await this.certificateRepository.findOneBy({ id: certificateId });

    if (!certificate) {
      throw new NotFoundException("Não existe certificado com essa identificação");
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
