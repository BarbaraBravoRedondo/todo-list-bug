import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Request,
    UnauthorizedException,
    ForbiddenException,
    NotFoundException,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { TasksService } from './tasks.service';
import {  TaskOwnershipGuard } from './task.guard';

@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) {}

    @UseGuards(AuthGuard)
    @Get('')
    async listTasks(@Request() req) {
        console.log('Request User:', req.user);
        const userId = req.user.id;
        try {
            return await this.tasksService.listTasks(userId);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            throw new UnauthorizedException('Could not fetch tasks');
        }
    }
    @UseGuards(AuthGuard,  TaskOwnershipGuard )
    @Get('/:id')
    async getTask(@Param('id') id: string, @Request() req) {
        const userId = req.user.id;
        try {
            const task = await this.tasksService.getTask(id, userId);
            return task;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException(error.message);
            }
            throw new UnauthorizedException(
                'You do not have permission to access this task',
            );
        }
    }
    @UseGuards(AuthGuard,  TaskOwnershipGuard )
    @Post('/edit')
    async editTask(@Body() body, @Request() req) {
        const userId = req.user.id;
        try {
            return await this.tasksService.editTask(body, userId);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException(error.message);
            }
            if (error instanceof ForbiddenException) {
                throw new ForbiddenException(error.message);
            }
            throw new UnauthorizedException(
                'Error occurred while editing task',
            );
        }
    }
}
