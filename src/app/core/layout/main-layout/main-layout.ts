import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-main-layout',
  imports: [CommonModule, RouterModule],
  templateUrl: './main-layout.html',
})
export class MainLayout {
  sidebarCollapsed = false;
  userMenuOpen = false;

  constructor(public auth: AuthService, private router: Router) {}

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
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



