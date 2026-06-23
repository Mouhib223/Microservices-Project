import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'tasks',
    loadComponent: () => import('./pages/tasks/tasks.component').then(m => m.TasksComponent),
    canActivate: [authGuard]
  },
  {
    path: 'tasks/:id',
    loadComponent: () => import('./pages/task-detail/task-detail.component').then(m => m.TaskDetailComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'login' }
];
