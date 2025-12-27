import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-main-layout',
  imports: [CommonModule, RouterModule],
  templateUrl: './main-layout.html',
})
export class MainLayout {
  sidebarCollapsed = false;

  constructor(public auth: AuthService) {}

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  logout() {
    this.auth.logout();
    // si ya tienes rutas protegidas, el guard te mandará al login
    // si prefieres directo:
    // location.href = '/auth/login';
  }
  masterMenuOpen = false;

toggleMasterMenu() {
  this.masterMenuOpen = !this.masterMenuOpen;
}
 open = {
    production: false, // ponlo true si quieres que inicie desplegado
      traceability: false, // 👈 añade esto
      quality: false, // 👈 añade esto
      maintenance: false, // 👈 añade esto
      inventory: false, // 👈 añade esto
      reportsKpi: false, // 👈 añade esto
      admin: false, // 👈 añade esto
      integrations: false, // 👈 añade esto
  };

  toggle(key: keyof typeof this.open) {
    this.open[key] = !this.open[key];
  }

};



