import { Body, Controller, Get, Param, Post, Request, UnauthorizedException , ForbiddenException ,NotFoundException} from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) {}

    @Get('')
    async listTasks(@Request() req) {
        const userId = req.user.id; 
        return this.tasksService.listTasks(userId);
    }

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
            throw new UnauthorizedException('You do not have permission to access this task');
        }
    }

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
            throw new UnauthorizedException('Error occurred while editing task');
        }
    }
}
