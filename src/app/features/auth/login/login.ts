import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  error: string | null = null;
  Date = new Date; // Agregar esta línea

  constructor(private auth: AuthService, private router: Router) {}

  submit(username: string, password: string) {
  console.log('Intentando iniciar sesión con', username, password);
  this.loading = true;
  this.error = null;

  this.auth.login({ username: username, password: password }).subscribe({
    next: () => {
      this.router.navigate(['/dashboard']);
      this.loading = false;
    },
    error: (err) => {
      this.loading = false;
      this.error = err.error?.message || 'Credenciales inválidas';
    },
  });
  }
}
