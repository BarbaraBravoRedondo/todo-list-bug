import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../entities/task.entity';
import { AuthModule } from 'src/auth/auth.module';
import { AuthGuard } from '../auth/auth.guard';
import { TaskOwnershipGuard } from './task.guard';

@Module({
    imports: [AuthModule, TypeOrmModule.forFeature([Task])],
    controllers: [TasksController],
    providers: [TasksService, TaskOwnershipGuard, AuthGuard],
})
export class TasksModule {}
