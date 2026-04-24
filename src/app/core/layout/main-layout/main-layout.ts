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

  // grupos internos de la sección Maestros (colapsables)
  mg = { org: true, time: false, prod: false, materials: true };
  toggleMg(key: keyof typeof this.mg) { this.mg[key] = !this.mg[key]; }

  open = {
    production: false,
      traceability: false,
      quality: false,
      maintenance: false,
      inventory: false,
      reportsKpi: false,
      admin: false,
      integrations: false,
      feasibility: false,
  };

  toggle(key: keyof typeof this.open) {
    this.open[key] = !this.open[key];
  }

};



