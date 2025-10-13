import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Enrollments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Enroll a authenticated user on a certification' })
  @ApiResponse({ status: 201, description: 'The enrollment has been successfully created.' })
  @ApiResponse({ status: 409, description: 'Conflict. User is already enrolled in this certification.' })
  @ApiResponse({ status: 404, description: 'Not Found. Certification does not exist.' })
  @ApiResponse({ status: 401, description: 'Unauthorized. Missing or invalid JWT token.' })
  create(
    @Req() req,
    @Body() createEnrollmentDto: CreateEnrollmentDto
  ) {
    const userId = req.user.userId;
    return this.enrollmentsService.create(userId, createEnrollmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all enrollments for the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of enrollments for the user.' })
  @ApiResponse({ status: 401, description: 'Unauthorized. Missing or invalid JWT token.' })
  @ApiResponse({ status: 404, description: 'Not Found. User has no enrollments.' })
  findAllByUser(
    @Req() req
  ) {
    const userId = req.user.userId;
    return this.enrollmentsService.findAllByUser(userId);
  }

}
