import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { MessagingService } from '../messaging/messaging.service';

@ApiTags('Comments')
@Controller('api/comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly messagingService: MessagingService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all comments' })
  async findAll() {
    return this.commentsService.findAll();
  }

  @Get('task/:taskId')
  @ApiOperation({ summary: 'Get comments for a task (called by Feign from task-service)' })
  async findByTask(@Param('taskId') taskId: string) {
    return this.commentsService.findByTaskId(taskId);
  }

  @Post()
  @ApiOperation({ summary: 'Create comment (publishes Kafka event)' })
  async create(@Body() body: { taskId: string; content: string; author: string }) {
    const comment = await this.commentsService.create(
      body.taskId,
      body.content,
      body.author || 'anonymous',
    );
    // Publish to Kafka
    await this.messagingService.publishToKafka('comment-created-topic', {
      type: 'COMMENT_CREATED',
      taskId: body.taskId,
      commentId: (comment as any)._id,
      content: body.content,
    });
    return comment;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete comment' })
  async delete(@Param('id') id: string) {
    await this.commentsService.delete(id);
    return { message: 'Deleted' };
  }
}
