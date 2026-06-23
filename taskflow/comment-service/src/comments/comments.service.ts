import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './comment.schema';

@Injectable()
export class CommentsService {
  constructor(@InjectModel(Comment.name) private commentModel: Model<CommentDocument>) {}

  async create(taskId: string, content: string, author: string): Promise<Comment> {
    const comment = new this.commentModel({ taskId, content, author });
    return comment.save();
  }

  async findByTaskId(taskId: string): Promise<Comment[]> {
    return this.commentModel.find({ taskId }).sort({ createdAt: -1 }).exec();
  }

  async findAll(): Promise<Comment[]> {
    return this.commentModel.find().sort({ createdAt: -1 }).exec();
  }

  async delete(id: string): Promise<void> {
    await this.commentModel.findByIdAndDelete(id).exec();
  }

  async countByTaskId(taskId: string): Promise<number> {
    return this.commentModel.countDocuments({ taskId }).exec();
  }
}
