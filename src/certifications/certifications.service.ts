import { Injectable, NotFoundException } from '@nestjs/common';
import { CertificationBodyDto, CreateCertificationDto } from './dto/create-certification.dto';
import { UpdateCertificationDto } from './dto/update-certification.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certification } from './entities/certification.entity';
import { promises as fs } from 'fs';
import { join } from 'path';

@Injectable()
export class CertificationsService {
  constructor(
    @InjectRepository(Certification)
    private readonly certificationRepository: Repository<Certification>,
  ) { }

  async create(certificationBody: CertificationBodyDto, pdfPath?: string): Promise<Certification> {
    const { name, shortDescription, description, passingScore, modality, durationHours } = certificationBody;

    const newCertification = this.certificationRepository.create({
      name,
      shortDescription,
      description,
      passingScore,
      modality,
      durationHours,
      pdfPath,
    });

    await this.certificationRepository.save(newCertification);

    return newCertification;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    modality?: 'inPerson' | 'online',
  ) {
    const skip = (page - 1) * limit;

    const queryBuilder = this.certificationRepository
      .createQueryBuilder('certification')
      .skip(skip)
      .take(limit)
      .orderBy('certification.createdAt', 'DESC');

    if (modality) {
      queryBuilder.andWhere('certification.modality = :modality', { modality });
    }

    const [certifications, total] = await queryBuilder.getManyAndCount();

    return {
      data: certifications,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Certification>{
    const certification = await this.certificationRepository.findOneBy({ id });

    if(!certification){
      throw new NotFoundException(`Certification with ID ${id} not found`);
    }

    return certification;
  }

  async update(
    id: string,
    updateCertificationDto: UpdateCertificationDto,
    pdfPath?: string,
  ): Promise<Certification> {
    const certification = await this.findOne(id);

    if (pdfPath && certification.pdfPath) {
      try {
        const oldFilePath = join(process.cwd(), certification.pdfPath);
        await fs.unlink(oldFilePath);
      } catch (error) {
        console.warn(`Falha em deletar arquivo antigo ${certification.pdfPath}:`, error);
      }
    }

    Object.assign(certification, updateCertificationDto);

    if (pdfPath) {
      certification.pdfPath = pdfPath;
    }

    return await this.certificationRepository.save(certification);
  }

  async softRemove(id: string): Promise<Certification> {
    const certification = await this.findOne(id);
    certification.isActive = false;
    return await this.certificationRepository.save(certification);
  }
}

