import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth-guard';
import { MainLayout } from './core/layout/main-layout/main-layout';
import { AuthLayout } from './core/layout/auth-layout/auth-layout';

export const routes: Routes = [
  {
    path: 'auth',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login').then(m => m.LoginComponent),
      },
      { path: '', pathMatch: 'full', redirectTo: 'login' },
    ],
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard/dashboard').then(m => m.Dashboard),
      },
      {
        path: 'traceability/lots',
        loadComponent: () =>
          import('./features/traceability/lots-list/lots-list').then(m => m.LotsListComponent),
      },
      {
        path: 'quality/defects',
        loadComponent: () =>
          import('./features/quality/defect-catalog/defect-catalog').then(
            m => m.DefectCatalog,
          ),
      },
      {
        path: 'master-data/machines',
        loadComponent: () =>
          import('./features/master-data/machines-list/machines-list').then(
            m => m.MachinesList,
          ),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: '' },
];
