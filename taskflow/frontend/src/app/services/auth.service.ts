import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private TOKEN_KEY = 'taskflow_token';
  private REFRESH_KEY = 'taskflow_refresh';
  private USERNAME_KEY = 'taskflow_username';

  private keycloakTokenUrl = 'http://localhost:8080/realms/TaskFlow/protocol/openid-connect/token';
  private clientId = 'taskflow-frontend';

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<boolean> {
    const body = new HttpParams()
      .set('grant_type', 'password')
      .set('client_id', this.clientId)
      .set('username', username)
      .set('password', password);

    return this.http.post<TokenResponse>(this.keycloakTokenUrl, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).pipe(
      map(response => {
        localStorage.setItem(this.TOKEN_KEY, response.access_token);
        localStorage.setItem(this.REFRESH_KEY, response.refresh_token);
        localStorage.setItem(this.USERNAME_KEY, username);
        return true;
      }),
      catchError(() => of(false))
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
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
