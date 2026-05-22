import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  loading = false;
  error: string | null = null;
  showPassword = false;
  rememberMe = false;

  constructor(private auth: AuthService, private router: Router, private route: ActivatedRoute, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    const saved = localStorage.getItem('mes_remembered_email');
    if (saved) {
      this.email = saved;
      this.rememberMe = true;
    }
  }

  submit() {
    if (!this.email || !this.password) {
      this.error = 'Por favor complete todos los campos';
      this.cdr.detectChanges();
      return;
    }
    if (this.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres';
      this.cdr.detectChanges();
      return;
    }
    this.loading = true;
    this.error = null;
    if (this.rememberMe) {
      localStorage.setItem('mes_remembered_email', this.email);
    } else {
      localStorage.removeItem('mes_remembered_email');
    }

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        const rawReturnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        const returnUrl = typeof rawReturnUrl === 'string' ? rawReturnUrl : '/dashboard';
        const safeReturnUrl = returnUrl.startsWith('/auth') ? '/dashboard' : returnUrl;
        this.router.navigateByUrl(safeReturnUrl);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        if (err.error?.message) {
          this.error = Array.isArray(err.error.message)
            ? err.error.message.join(', ')
            : err.error.message;
        } else if (err.status === 401) {
          this.error = 'Credenciales inválidas';
        } else if (err.status === 422) {
          this.error = 'Datos inválidos. Verifica tu email y contraseña';
        } else if (err.status === 0) {
          this.error = 'No se puede conectar con el servidor';
        } else {
          this.error = 'Error al iniciar sesión. Intenta nuevamente';
        }
        this.cdr.detectChanges();
      },
    });
  }
}
