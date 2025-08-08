import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [AdminController],
  providers: [AdminService],
  imports: [UsersModule],
})
export class AdminModule {}
