import { Routes } from '@angular/router';

export const FEASIBILITY_ROUTES: Routes = [
  {
    path: 'studies',
    loadComponent: () =>
      import('./studies/studies').then((m) => m.FeasibilityStudiesComponent),
  },
  {
    path: 'history',
    loadComponent: () =>
      import('./history/history').then((m) => m.FeasibilityHistoryComponent),
  },
  { path: '', pathMatch: 'full', redirectTo: 'studies' },
];
