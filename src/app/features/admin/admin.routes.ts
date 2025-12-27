import { Routes } from '@angular/router';
import { AdminShell } from './admin-shell';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminShell,
    children: [
      {
        path: 'users-roles',
        loadComponent: () =>
          import('./users-roles/users-roles').then((m) => m.UsersRolesComponent),
      },
      {
        path: 'audit-logs',
        loadComponent: () =>
          import('./audit-logs/audit-logs').then((m) => m.AuditLogsComponent),
      },
      {
        path: 'system-params',
        loadComponent: () =>
          import('./system-params/system-params').then((m) => m.SystemParamsComponent),
      },
      {
        path: '',
        redirectTo: 'users-roles',
        pathMatch: 'full',
      },
    ],
  },
];
