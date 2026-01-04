import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../environmets/environments';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    username?: string;
    role?: string;
    // lo que devuelva tu backend
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    console.log('AuthService: Iniciando login con', credentials);
    return this.http
      .post<LoginResponse>(`${this.apiUrl}${environment.endpoints.auth}/login`, credentials)
      .pipe(
        tap((res) => {
          // Restaurando el almacenamiento del token
          localStorage.setItem('access_token', res.access_token);
          localStorage.setItem('current_user', JSON.stringify(res.user));
        }),
      );
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');
  }

  get token(): string | null {
    return localStorage.getItem('access_token');
  }

  get currentUser() {
    const raw = localStorage.getItem('current_user');
    return raw ? JSON.parse(raw) : null;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}
