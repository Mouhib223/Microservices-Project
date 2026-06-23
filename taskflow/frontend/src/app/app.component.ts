import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  template: `
    <div class="min-h-screen bg-gray-950">
      <nav *ngIf="auth.isLoggedIn()" class="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <a routerLink="/tasks" class="flex items-center gap-2 text-xl font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
          <span class="text-2xl">⚡</span>
          <span>TaskFlow</span>
        </a>
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-400">{{ auth.getUsername() }}</span>
          <button
            (click)="auth.logout()"
            class="px-4 py-2 text-sm bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/30 rounded-lg transition-all">
            Logout
          </button>
        </div>
      </nav>
      <router-outlet />
    </div>
  `
})
export class AppComponent {
  constructor(public auth: AuthService) {}
}

