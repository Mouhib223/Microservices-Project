import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService, Task } from '../../services/task.service';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, TitleCasePipe],
  template: `
    <div class="max-w-7xl mx-auto px-6 py-8">

      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-white">My Tasks</h1>
          <p class="text-gray-400 mt-1 text-sm">Managed via Spring Boot → MySQL</p>
        </div>
        <button
          id="open-create-modal"
          (click)="showForm = !showForm"
          class="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105">
          <span class="text-lg">+</span>
          New Task
        </button>
      </div>

      <!-- Create Task Form -->
      <div *ngIf="showForm" class="bg-gray-900 border border-indigo-500/30 rounded-2xl p-6 mb-8 animate-pulse-once">
        <h2 class="text-lg font-semibold text-white mb-4">Create New Task</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            id="task-title"
            [(ngModel)]="newTask.title"
            placeholder="Task title *"
            class="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
          <select
            id="task-priority"
            [(ngModel)]="newTask.priority"
            class="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-all">
            <option value="LOW">🟢 Low Priority</option>
            <option value="MEDIUM">🟡 Medium Priority</option>
            <option value="HIGH">🔴 High Priority</option>
          </select>
          <textarea
            id="task-description"
            [(ngModel)]="newTask.description"
            placeholder="Description"
            rows="2"
            class="md:col-span-2 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all resize-none"
          ></textarea>
        </div>
        <div class="flex gap-3 mt-4">
          <button
            id="create-task-btn"
            (click)="createTask()"
            [disabled]="creating"
            class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all font-medium">
            {{ creating ? 'Creating...' : 'Create Task (→ RabbitMQ event)' }}
          </button>
          <button (click)="showForm = false" class="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-all">
            Cancel
          </button>
        </div>
        <p *ngIf="createError" class="text-red-400 text-sm mt-2">{{ createError }}</p>
      </div>

      <!-- Stats Bar -->
      <div class="grid grid-cols-3 gap-4 mb-8">
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <div class="text-2xl font-bold text-indigo-400">{{ countByStatus('TODO') }}</div>
          <div class="text-xs text-gray-500 mt-1">To Do</div>
        </div>
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <div class="text-2xl font-bold text-yellow-400">{{ countByStatus('IN_PROGRESS') }}</div>
          <div class="text-xs text-gray-500 mt-1">In Progress</div>
        </div>
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <div class="text-2xl font-bold text-green-400">{{ countByStatus('DONE') }}</div>
          <div class="text-xs text-gray-500 mt-1">Done</div>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex justify-center py-20">
        <div class="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <!-- Error -->
      <div *ngIf="error" class="text-center py-12">
        <p class="text-red-400 mb-2">{{ error }}</p>
        <button (click)="loadTasks()" class="text-indigo-400 hover:text-indigo-300 text-sm underline">Retry</button>
      </div>

      <!-- Task Cards -->
      <div *ngIf="!loading && !error" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          *ngFor="let task of tasks"
          class="bg-gray-900 border border-gray-800 hover:border-indigo-500/50 rounded-2xl p-5
                 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/10 group cursor-pointer"
          (click)="goToDetail(task.id!)">

          <!-- Priority badge -->
          <div class="flex items-center justify-between mb-3">
            <span [class]="getPriorityClass(task.priority)" class="text-xs font-medium px-2.5 py-1 rounded-full">
              {{ task.priority }}
            </span>
            <span [class]="getStatusClass(task.status)" class="text-xs font-medium px-2.5 py-1 rounded-full">
              {{ task.status | titlecase }}
            </span>
          </div>

          <!-- Title & description -->
          <h3 class="font-semibold text-white mb-1 group-hover:text-indigo-300 transition-colors truncate">{{ task.title }}</h3>
          <p class="text-gray-400 text-sm line-clamp-2 mb-4">{{ task.description || 'No description' }}</p>

          <!-- Footer -->
          <div class="flex items-center justify-between pt-3 border-t border-gray-800">
            <span class="text-xs text-gray-500">by {{ task.createdBy || 'unknown' }}</span>
            <div class="flex gap-2" (click)="$event.stopPropagation()">
              <select
                [id]="'status-select-' + task.id"
                (change)="onStatusChange(task, $event)"
                [value]="task.status"
                class="text-xs px-2 py-1 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-indigo-500">
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="DONE">DONE</option>
              </select>
              <button
                [id]="'delete-btn-' + task.id"
                (click)="deleteTask(task.id!)"
                class="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all">
                🗑️
              </button>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div *ngIf="tasks.length === 0" class="col-span-3 text-center py-20">
          <div class="text-6xl mb-4">📋</div>
          <h3 class="text-xl font-medium text-gray-400 mb-2">No tasks yet</h3>
          <p class="text-gray-600 text-sm">Create your first task to get started</p>
        </div>
      </div>
    </div>
  `
})
export class TasksComponent implements OnInit {
  tasks: Task[] = [];
  loading = false;
  error = '';
  showForm = false;
  creating = false;
  createError = '';

  newTask: Partial<Task> = { title: '', description: '', priority: 'MEDIUM', status: 'TODO' };

  constructor(private taskService: TaskService, private router: Router) {}

  ngOnInit() { this.loadTasks(); }

  loadTasks() {
    this.loading = true;
    this.error = '';
    this.taskService.getTasks().subscribe({
      next: tasks => { this.tasks = tasks; this.loading = false; },
      error: err => {
        this.error = 'Failed to load tasks. Is the API Gateway running?';
        this.loading = false;
      }
    });
  }

  createTask() {
    if (!this.newTask.title?.trim()) { this.createError = 'Title is required'; return; }
    this.creating = true;
    this.createError = '';
    this.taskService.createTask(this.newTask as Task).subscribe({
      next: task => {
        this.tasks.unshift(task);
        this.newTask = { title: '', description: '', priority: 'MEDIUM', status: 'TODO' };
        this.showForm = false;
        this.creating = false;
      },
      error: () => {
        this.createError = 'Failed to create task';
        this.creating = false;
      }
    });
  }

  onStatusChange(task: Task, event: Event) {
    const newStatus = (event.target as HTMLSelectElement).value;
    this.taskService.updateStatus(task.id!, newStatus).subscribe({
      next: updated => { task.status = updated.status; }
    });
  }

  deleteTask(id: number) {
    if (!confirm('Delete this task?')) return;
    this.taskService.deleteTask(id).subscribe({
      next: () => { this.tasks = this.tasks.filter(t => t.id !== id); }
    });
  }

  goToDetail(id: number) { this.router.navigate(['/tasks', id]); }

  countByStatus(status: string) { return this.tasks.filter(t => t.status === status).length; }

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

