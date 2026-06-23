"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const comments_service_1 = require("./comments.service");
const messaging_service_1 = require("../messaging/messaging.service");
let CommentsController = class CommentsController {
    constructor(commentsService, messagingService) {
        this.commentsService = commentsService;
        this.messagingService = messagingService;
    }
    async findAll() {
        return this.commentsService.findAll();
    }
    async findByTask(taskId) {
        return this.commentsService.findByTaskId(taskId);
    }
    async create(body) {
        const comment = await this.commentsService.create(body.taskId, body.content, body.author || 'anonymous');
        await this.messagingService.publishToKafka('comment-created-topic', {
            type: 'COMMENT_CREATED',
            taskId: body.taskId,
            commentId: comment._id,
            content: body.content,
        });
        return comment;
    }
    async delete(id) {
        await this.commentsService.delete(id);
        return { message: 'Deleted' };
    }
};
exports.CommentsController = CommentsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all comments' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('task/:taskId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get comments for a task (called by Feign from task-service)' }),
    __param(0, (0, common_1.Param)('taskId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "findByTask", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create comment (publishes Kafka event)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete comment' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "delete", null);
exports.CommentsController = CommentsController = __decorate([
    (0, swagger_1.ApiTags)('Comments'),
    (0, common_1.Controller)('api/comments'),
    __metadata("design:paramtypes", [comments_service_1.CommentsService,
        messaging_service_1.MessagingService])
], CommentsController);
//# sourceMappingURL=comments.controller.js.map