import { Routes } from '@angular/router';

export const QUALITY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./quality-shell/quality-shell').then((m) => m.QualityShellComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard').then((m) => m.DashboardComponent),
      },
      {
        path: 'defect-families',
        loadComponent: () =>
          import('./defect-families/defect-families').then((m) => m.DefectFamiliesComponent),
      },
      {
        path: 'severities',
        loadComponent: () =>
          import('./severities/severities').then((m) => m.SeveritiesComponent),
      },
      {
        path: 'defects',
        loadComponent: () =>
          import('./defects/defects').then((m) => m.DefectsComponent),
      },
      {
        path: 'inspections',
        loadComponent: () =>
          import('./inspections/inspections').then((m) => m.InspectionsComponent),
      },
      {
        path: 'non-conformities',
        loadComponent: () =>
          import('./ncapa/ncapa').then((m) => m.NcapaComponent),
      },
      {
        path: 'decision',
        loadComponent: () =>
          import('./pages/quality-decision/quality-decision').then((m) => m.QualityDecisionComponent),
      },
      {
        path: 'op-review',
        loadComponent: () =>
          import('./op-review/op-review').then((m) => m.OpReviewComponent),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
];
