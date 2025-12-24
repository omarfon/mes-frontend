import { Routes } from '@angular/router';

export const TRACEABILITY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./traceability-shell/traceability-shell').then(
        (m) => m.TraceabilityShellComponent
      ),
    children: [
      // Core
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

      // Modern / Pro
      {
        path: 'serials',
        loadComponent: () =>
          import('./serials/serials').then((m) => m.SerialsComponent),
      },
      {
        path: 'quarantine',
        loadComponent: () =>
          import('./quarantine/quarantine').then((m) => m.QuarantineComponent),
      },
      {
        path: 'warehouse-map',
        loadComponent: () =>
          import('./warehouse-map/warehouse-map').then((m) => m.WarehouseMapComponent),
      },
      {
        path: 'search',
        loadComponent: () =>
          import('./search/search').then((m) => m.SearchComponent),
      },
      {
        path: 'labels',
        loadComponent: () =>
          import('./labels/labels').then((m) => m.LabelsComponent),
      },

      // Audit + Integrations
      {
        path: 'audit',
        loadComponent: () =>
          import('./audit/audit').then((m) => m.AuditComponent),
      },
      {
        path: 'integrations',
        loadComponent: () =>
          import('./integrations/integrations').then((m) => m.IntegrationsComponent),
      },

      { path: '', pathMatch: 'full', redirectTo: 'lots' },
    ],
  },
];
