import { Routes } from '@angular/router';

export const TRACEABILITY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./traceability-shell/traceability-shell').then(
        (m) => m.TraceabilityShellComponent
      ),
    children: [
      {
        path: 'lots',
        loadComponent: () =>
          import('./lots/lots').then((m) => m.LotsComponent),
      },
      {
        path: 'movements',
        loadComponent: () =>
          import('./movements/movements').then((m) => m.MovementsComponent),
      },
      {
        path: 'genealogy',
        loadComponent: () =>
          import('./genealogy/genealogy').then((m) => m.GenealogyComponent),
      },
      {
        path: 'audit',
        loadComponent: () =>
          import('./audit/audit').then((m) => m.AuditComponent),
      },
      { path: '', pathMatch: 'full', redirectTo: 'lots' },
    ],
  },
];
