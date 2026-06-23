import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Task {
  id?: number;
  title: string;
  description: string;
  status: string;   // TODO | IN_PROGRESS | DONE
  priority: string; // LOW | MEDIUM | HIGH
  createdBy?: string;
  createdAt?: string;
}

export interface TaskWithComments {
  task: Task;
  comments: CommentItem[];
  commentCount: number;
}

export interface CommentItem {
  _id?: string;
  taskId: string;
  content: string;
  author: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private api = '/api';

  constructor(private http: HttpClient) {}

  // Tasks
  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.api}/tasks`);
  }

  getTaskWithComments(id: number): Observable<TaskWithComments> {
    return this.http.get<TaskWithComments>(`${this.api}/tasks/${id}`);
  }

  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(`${this.api}/tasks`, task);
  }

  updateStatus(id: number, status: string): Observable<Task> {
    return this.http.patch<Task>(`${this.api}/tasks/${id}/status`, { status });
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/tasks/${id}`);
  }

  // Comments
  getComments(taskId: string): Observable<CommentItem[]> {
    return this.http.get<CommentItem[]>(`${this.api}/comments/task/${taskId}`);
  }

  addComment(taskId: string, content: string, author: string): Observable<CommentItem> {
    return this.http.post<CommentItem>(`${this.api}/comments`, { taskId, content, author });
  }

  deleteComment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/comments/${id}`);
  }
}

