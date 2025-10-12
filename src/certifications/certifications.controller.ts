import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CertificationsService } from './certifications.service';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { UpdateCertificationDto } from './dto/update-certification.dto';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Certification } from './entities/certification.entity';

@ApiTags('certifications')
@Controller('certifications')
export class CertificationsController {
  constructor(private readonly certificationsService: CertificationsService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new certification' })
  @ApiBody({ type: CreateCertificationDto })
  @ApiResponse({ status: 201, description: 'Certification created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  create(@Body() createCertificationDto: CreateCertificationDto) {
    return this.certificationsService.create(createCertificationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all certifications' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit per page' })
  @ApiQuery({ name: 'modality', required: false, type: String, description: 'Filter by modality (inPerson or online)' })
  @ApiResponse({ status: 200, description: 'List of certifications returned successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('modality') modality?: 'inPerson' | 'online',
  ) {
    return this.certificationsService.findAll(Number(page), Number(limit), modality);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a certification by ID' })
  @ApiResponse({ status: 200, description: 'Certification details.', type: Certification })
  @ApiResponse({ status: 404, description: 'Certification not found.' })
  findOne(@Param('id') id: string) {
    return this.certificationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a certification' })
  @ApiBody({ type: UpdateCertificationDto })
  @ApiResponse({ status: 200, description: 'Certification updated successfully' })
  @ApiResponse({ status: 404, description: 'Certification not found' })
  update(@Param('id') id: string, @Body() updateCertificationDto: UpdateCertificationDto) {
    return this.certificationsService.update(id, updateCertificationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a certification by ID' })
  @ApiParam({ name: 'id', required: true, description: 'Certification ID' })
  @ApiResponse({ status: 200, description: 'Certification deactivated successfully', type: Certification })
  @ApiResponse({ status: 404, description: 'Certification not found' })
  remove(@Param('id') id: string) {
    return this.certificationsService.softRemove(id);
  }
}
