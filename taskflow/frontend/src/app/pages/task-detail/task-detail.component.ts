import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TaskService, CommentItem, TaskWithComments } from '../../services/task.service';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-4xl mx-auto px-6 py-8">

      <!-- Back -->
      <a routerLink="/tasks"
         class="inline-flex items-center gap-2 text-gray-400 hover:text-indigo-400 mb-6 transition-colors text-sm">
        ← Back to Tasks
      </a>

      <!-- Loading -->
      <div *ngIf="loading" class="flex justify-center py-20">
        <div class="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <!-- Error -->
      <div *ngIf="error" class="text-center py-12">
        <p class="text-red-400">{{ error }}</p>
      </div>

      <ng-container *ngIf="!loading && data">
        <!-- Task Card -->
        <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h1 class="text-2xl font-bold text-white mb-1">{{ data.task.title }}</h1>
              <p class="text-gray-400">{{ data.task.description }}</p>
            </div>
            <div class="flex flex-col gap-2 items-end">
              <span [class]="getPriorityClass(data.task.priority)" class="text-xs font-medium px-3 py-1 rounded-full">
                {{ data.task.priority }}
              </span>
              <span [class]="getStatusClass(data.task.status)" class="text-xs font-medium px-3 py-1 rounded-full">
                {{ data.task.status }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-800">
            <div>
              <span class="text-xs text-gray-500">Created by</span>
              <p class="text-white font-medium">{{ data.task.createdBy || 'unknown' }}</p>
            </div>
            <div>
              <span class="text-xs text-gray-500">Created at</span>
              <p class="text-white font-medium">{{ data.task.createdAt | date:'medium' }}</p>
            </div>
            <div>
              <span class="text-xs text-gray-500">Comments</span>
              <p class="text-indigo-400 font-bold text-lg">{{ data.commentCount }}</p>
            </div>
          </div>

          <!-- Architecture info -->
          <div class="mt-4 pt-4 border-t border-gray-800 flex gap-2 flex-wrap">
            <span class="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded-full">
              📡 Fetched via Feign Client
            </span>
            <span class="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-1 rounded-full">
              🐰 Status update → Kafka event
            </span>
          </div>
        </div>

        <!-- Comments Section -->
        <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 class="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            💬 Comments
            <span class="text-sm bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full">
              {{ data.comments.length }}
            </span>
          </h2>

          <!-- Add Comment -->
          <div class="mb-6">
            <div class="flex gap-3">
              <input
                id="comment-input"
                [(ngModel)]="newComment"
                placeholder="Add a comment... (→ Kafka event on submit)"
                class="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500
                       focus:outline-none focus:border-indigo-500 transition-all"
              />
              <button
                id="add-comment-btn"
                (click)="addComment()"
                [disabled]="!newComment.trim() || addingComment"
                class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 text-white rounded-xl transition-all font-medium">
                {{ addingComment ? '...' : 'Post' }}
              </button>
            </div>
          </div>

          <!-- Comment List -->
          <div class="space-y-3">
            <div
              *ngFor="let comment of data.comments"
              class="flex items-start gap-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <div class="w-8 h-8 bg-indigo-600/30 rounded-full flex items-center justify-center text-indigo-300 font-bold text-sm flex-shrink-0">
                {{ comment.author[0].toUpperCase() }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-medium text-indigo-300">{{ comment.author }}</span>
                  <span class="text-xs text-gray-500">{{ comment.createdAt | date:'short' }}</span>
                </div>
                <p class="text-gray-300 text-sm">{{ comment.content }}</p>
              </div>
              <button
                (click)="deleteComment(comment._id!)"
                class="text-gray-600 hover:text-red-400 transition-colors text-sm flex-shrink-0">
                ✕
              </button>
            </div>

            <div *ngIf="data.comments.length === 0" class="text-center py-8 text-gray-500">
              <div class="text-3xl mb-2">💭</div>
              <p class="text-sm">No comments yet. Be the first!</p>
            </div>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class TaskDetailComponent implements OnInit {
  data: TaskWithComments | null = null;
  loading = false;
  error = '';
  newComment = '';
  addingComment = false;
  private taskId!: number;

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
  ) {}

  ngOnInit() {
    this.taskId = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  load() {
    this.loading = true;
    this.taskService.getTaskWithComments(this.taskId).subscribe({
      next: d => { this.data = d; this.loading = false; },
      error: () => { this.error = 'Failed to load task details'; this.loading = false; }
    });
  }

  addComment() {
    if (!this.newComment.trim() || !this.data) return;
    this.addingComment = true;
    const author = localStorage.getItem('taskflow_username') || 'anonymous';
    this.taskService.addComment(this.taskId.toString(), this.newComment, author).subscribe({
      next: comment => {
        this.data!.comments.unshift(comment);
        this.data!.commentCount++;
        this.newComment = '';
        this.addingComment = false;
      },
      error: () => { this.addingComment = false; }
    });
  }

  deleteComment(id: string) {
    this.taskService.deleteComment(id).subscribe({
      next: () => {
        this.data!.comments = this.data!.comments.filter(c => c._id !== id);
        this.data!.commentCount--;
      }
    });
  }

  getPriorityClass(p: string): string {
    const map: Record<string, string> = {
      'LOW':    'bg-green-500/20 text-green-400 border border-green-500/30',
      'MEDIUM': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      'HIGH':   'bg-red-500/20 text-red-400 border border-red-500/30',
    };
    return map[p] ?? 'bg-gray-500/20 text-gray-400';
  }

  getStatusClass(s: string): string {
    const map: Record<string, string> = {
      'TODO':        'bg-gray-500/20 text-gray-400 border border-gray-500/30',
      'IN_PROGRESS': 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      'DONE':        'bg-green-500/20 text-green-400 border border-green-500/30',
    };
    return map[s] ?? 'bg-gray-500/20 text-gray-400';
  }
}
