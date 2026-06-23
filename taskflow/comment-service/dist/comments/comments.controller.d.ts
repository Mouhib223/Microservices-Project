import { CommentsService } from './comments.service';
import { MessagingService } from '../messaging/messaging.service';
export declare class CommentsController {
    private readonly commentsService;
    private readonly messagingService;
    constructor(commentsService: CommentsService, messagingService: MessagingService);
    findAll(): Promise<import("./comment.schema").Comment[]>;
    findByTask(taskId: string): Promise<import("./comment.schema").Comment[]>;
    create(body: {
        taskId: string;
        content: string;
        author: string;
    }): Promise<import("./comment.schema").Comment>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
