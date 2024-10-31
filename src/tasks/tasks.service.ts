import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from '../entities/task.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private readonly tasksRepository: Repository<Task>,
    ) {}

    logger = new Logger(TasksService.name);
    async listTasks(userId: string) {
        const tasks = await this.tasksRepository.find({
            where: { owner: { id: userId } },
        });
        return tasks;
    }

    async getTask(id: string, userId: string) {
        const task = await this.tasksRepository
            .createQueryBuilder('task')
            .where('task.id = :id AND task.owner.id = :userId', { id, userId })
            .getOne();

        if (!task) {
            throw new NotFoundException('Task with ${id} not found');
        }

        return task;
    }
    async fetchCompleteTask(id: string) {
        try {
            const taskDetails = await this.tasksRepository
                .createQueryBuilder('task')
                .leftJoinAndSelect('task.user', 'user')
                .where('task.id = :id', { id })
                .getOne();

            return taskDetails;
        } catch (error) {
            this.logger.error(`Failed to retrieve task with ID: ${id}`);
            throw error;
        }
    }

    async editTask(body: any, userId: string) {
        const task = await this.getTask(body.id, userId);

        await this.tasksRepository.update(body.id, body);

        const editedTask = await this.getTask(body.id, userId);

        return editedTask;
    }
}
