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
      .post<any>(`${this.apiUrl}${environment.endpoints.auth}/login`, credentials)
      .pipe(
        tap((res) => {
          const responseAny = res as any;
          const payload = responseAny?.data ?? responseAny;
          const token = payload?.access_token ?? payload?.token ?? payload?.accessToken;
          const user = payload?.user ?? payload?.usuario ?? null;

          if (!token || String(token).trim() === '') {
            throw new Error('Login exitoso sin token válido en la respuesta.');
          }

          localStorage.setItem('access_token', String(token));
          if (user) {
            localStorage.setItem('current_user', JSON.stringify(user));
          } else {
            localStorage.removeItem('current_user');
          }
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
    if (!raw || raw === 'undefined' || raw === 'null') return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  getCurrentUsername(): string {
    const user = this.currentUser;
    return user?.username || user?.email || '-';
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  forgotPassword(email: string): Observable<{ message: string; resetToken?: string; expiresIn?: string }> {
    return this.http.post<any>(`${this.apiUrl}${environment.endpoints.auth}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<any>(`${this.apiUrl}${environment.endpoints.auth}/reset-password`, { token, newPassword });
  }
}
