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
  email = '';
  password = '';
  loading = false;
  error: string | null = null;
  Date = new Date; // Agregar esta línea

  constructor(private auth: AuthService, private router: Router) {}

  submit(email: string, password: string) {
  console.log('Intentando iniciar sesión con', email, password);
  
  // Validación básica en frontend
  if (!email || !password) {
    this.error = 'Por favor complete todos los campos';
    return;
  }
  
  if (password.length < 6) {
    this.error = 'La contraseña debe tener al menos 6 caracteres';
    return;
  }
  
  this.loading = true;
  this.error = null;

  this.auth.login({ email: email, password: password }).subscribe({
    next: () => {
      this.router.navigate(['/dashboard']);
      this.loading = false;
    },
    error: (err) => {
      this.loading = false;
      console.error('Error en login:', err);
      
      // Extraer mensajes de error del backend
      if (err.error?.message) {
        if (Array.isArray(err.error.message)) {
          this.error = err.error.message.join(', ');
        } else {
          this.error = err.error.message;
        }
      } else if (err.status === 401) {
        this.error = 'Credenciales inválidas';
      } else if (err.status === 422) {
        this.error = 'Datos inválidos. Verifica tu email y contraseña';
      } else {
        this.error = 'Error al iniciar sesión. Intenta nuevamente';
      }
    },
  });
  }
}
