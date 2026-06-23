import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private TOKEN_KEY = 'taskflow_token';
  private USERNAME_KEY = 'taskflow_username';

  constructor(private router: Router) {}

  /**
   * In production this would redirect to Keycloak.
   * For dev convenience we accept any non-empty credentials and store a mock token.
   */
  login(username: string, password: string): boolean {
    if (username && password) {
      // Mock JWT — replace with real Keycloak flow in production
      const mockToken = btoa(JSON.stringify({ preferred_username: username, exp: Date.now() + 3600000 }));
      localStorage.setItem(this.TOKEN_KEY, mockToken);
      localStorage.setItem(this.USERNAME_KEY, username);
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USERNAME_KEY);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUsername(): string {
    return localStorage.getItem(this.USERNAME_KEY) || 'User';
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
