import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
    NotFoundException,
    Logger,
} from '@nestjs/common';
import { TasksService } from './tasks.service';


 
@Injectable()
export class TaskOwnershipGuard implements CanActivate {
    private readonly logger = new Logger(TaskOwnershipGuard.name);

    constructor(private readonly tasksService: TasksService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.id;
        const taskId = request.params.id || request.body.id;

        if (!userId) {
            this.logger.warn('Access attempt without user authentication');
            throw new ForbiddenException('Authentication required');
        }

        if (!taskId) {
            this.logger.warn('Task ID missing in request');
            throw new NotFoundException('Task ID is required');
        }

        try {
            const task = await this.tasksService.fetchCompleteTask(taskId);

            if (!task) {
                this.logger.warn(`Task with ID ${taskId} not found`);
                throw new NotFoundException('Task not found');
            }

            if (task.owner.id !== userId) {
                this.logger.warn(`User ${userId} tried to access a task they do not own`);
                throw new ForbiddenException('Access to this task is restricted');
            }

            this.logger.log(`User ${userId} verified as task owner`);
            return true;
        } catch (error) {
            this.logger.error('Error in task ownership verification', error.stack);
            throw error;
        }
    }
}
