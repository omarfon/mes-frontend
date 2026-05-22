import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-forgot-password',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
})
export class ForgotPasswordComponent {
  email = '';
  loading = false;
  error: string | null = null;
  resetToken: string | null = null;
  successMessage: string | null = null;

  constructor(private auth: AuthService) {}

  submit() {
    if (!this.email) {
      this.error = 'Ingresa tu correo electrónico';
      return;
    }

    this.loading = true;
    this.error = null;
    this.resetToken = null;

    this.auth.forgotPassword(this.email).subscribe({
      next: (res) => {
        this.loading = false;
        this.successMessage = res.message;
        if (res.resetToken) {
          this.resetToken = res.resetToken;
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message ?? 'Error al procesar la solicitud';
      },
    });
  }
}
