import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <!-- Background glow -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
        <div class="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl"></div>
      </div>

      <div class="relative w-full max-w-md">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center gap-3 mb-4">
            <span class="text-5xl">⚡</span>
            <h1 class="text-4xl font-bold text-white">TaskFlow</h1>
          </div>
          <p class="text-gray-400 text-sm">Microservices Task Manager</p>
          <div class="flex justify-center gap-2 mt-3 flex-wrap">
            <span class="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">Spring Boot</span>
            <span class="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full border border-green-500/30">NestJS</span>
            <span class="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded-full border border-red-500/30">RabbitMQ</span>
            <span class="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30">Kafka</span>
          </div>
        </div>

        <!-- Card -->
        <div class="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          <h2 class="text-xl font-semibold text-white mb-6">Sign in to your account</h2>

          <div *ngIf="error" class="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {{ error }}
          </div>

          <form (ngSubmit)="onLogin()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Username</label>
              <input
                id="username-input"
                type="text"
                [(ngModel)]="username"
                name="username"
                placeholder="Enter username"
                class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500
                       focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Password</label>
              <input
                id="password-input"
                type="password"
                [(ngModel)]="password"
                name="password"
                placeholder="Enter password"
                class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500
                       focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
            <button
              id="login-btn"
              type="submit"
              [disabled]="loading"
              class="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-semibold
                     rounded-xl transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99]">
              {{ loading ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>

          <p class="text-center text-gray-500 text-xs mt-6">
            Uses Keycloak JWT authentication via API Gateway
          </p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  onLogin() {
    this.error = '';
    if (!this.username || !this.password) {
      this.error = 'Please enter username and password';
      return;
    }
    this.loading = true;
    setTimeout(() => {
      const ok = this.auth.login(this.username, this.password);
      this.loading = false;
      if (ok) {
        this.router.navigate(['/tasks']);
      } else {
        this.error = 'Invalid credentials';
      }
    }, 600);
  }
}
