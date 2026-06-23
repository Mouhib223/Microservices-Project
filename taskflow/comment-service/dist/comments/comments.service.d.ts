import { Model } from 'mongoose';
import { Comment, CommentDocument } from './comment.schema';
export declare class CommentsService {
    private commentModel;
    constructor(commentModel: Model<CommentDocument>);
    create(taskId: string, content: string, author: string): Promise<Comment>;
    findByTaskId(taskId: string): Promise<Comment[]>;
    findAll(): Promise<Comment[]>;
    delete(id: string): Promise<void>;
    countByTaskId(taskId: string): Promise<number>;
}
