import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { Repository } from 'typeorm';
import { CertificationsService } from 'src/certifications/certifications.service';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    private readonly certificationsService: CertificationsService
  ) {}

  async create(userId: string, createEnrollmentDto: CreateEnrollmentDto): Promise<Enrollment> {
    const { certificationId } = createEnrollmentDto;

    await this.certificationsService.findOne(certificationId);

    const existingEnrollment = await this.enrollmentRepository.findOne({
      where: { userId, certificationId }
    });

    if (existingEnrollment) {
      throw new ConflictException('User is already enrolled in this certification');
    }

    const newEnrollment = this.enrollmentRepository.create({
      userId,
      certificationId
    });

    return this.enrollmentRepository.save(newEnrollment);
  }

  async findAllByUser(userId: string): Promise<Enrollment[]> {
    return this.enrollmentRepository.find({
      where: { userId },
      relations: ['certification']
    });
  }

  async unenroll(userId: string, enrollmentId: string): Promise<void> {
    const enrollment = await this.enrollmentRepository.findOneBy({ id: enrollmentId, userId });
    if (!enrollment) {
      throw new NotFoundException('Enrollment not found or does not belong to the user');
    }

    await this.enrollmentRepository.remove(enrollment);
  }
}
