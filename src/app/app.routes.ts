import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth/auth-guard';
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
/*     canActivate: [AuthGuard], */
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard/dashboard').then(m => m.Dashboard),
      },
      {
        path: 'traceability/lots-list',
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
      path: 'reports',
     loadComponent: () =>
        import('./features/reports/reports/reports').then(m => m.ReportsComponent),
      },

      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
      path: 'master-data',
      loadChildren: () =>
     import('./features/master-data/master-data.routes').then(m => m.MASTER_DATA_ROUTES),
      },
        {
      path: 'production',
      loadChildren: () =>
        import('./features/production/productions.routes').then((m) => m.PRODUCTION_ROUTES),
        },
      {
        path: 'traceability',
        loadChildren: () =>
          import('./features/traceability/traceability.routes').then((m) => m.TRACEABILITY_ROUTES),
      },
      
    ],
  },

  { path: '**', redirectTo: '' },
  
];
