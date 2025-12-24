import { Routes } from '@angular/router';

export const MASTER_DATA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./master-data-shell/master-data-shell').then(m => m.MasterDataShellComponent),
    children: [
      {
        path: 'machines',
        loadComponent: () => import('./machines/machines').then(m => m.MachinesComponent),
      },
      {
        path: 'materials',
        loadComponent: () => import('./materials/materials').then(m => m.MaterialsComponent),
      },
      {
        path: 'locations',
        loadComponent: () => import('./locations/locations').then(m => m.LocationsComponent),
      },
      {
        path: 'processes',
        loadComponent: () => import('./processes/processes').then(m => m.ProcessesComponent),
      },
      {
        path: 'uoms',
        loadComponent: () => import('./uoms/uoms').then(m => m.UomsComponent),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./products/products').then((m) => m.ProductsComponent),
      },
      {
        path: 'shifts',
        loadComponent: () =>
          import('./schifts/schifts').then((m) => m.ShiftsComponent),
      },
      {
        path: 'operators',
        loadComponent: () =>
          import('./operators/operators').then((m) => m.OperatorsComponent),
      },
      {
        path: 'downtime-reasons',
        loadComponent: () =>
          import('./downtimes-reasons/downtimes-reasons').then(
            (m) => m.DowntimeReasonsComponent
          ),
      },
      {
        path: 'suppliers',
        loadComponent: () =>
          import('./suppliers/suppliers').then((m) => m.SuppliersComponent),
      },
      { path: '', pathMatch: 'full', redirectTo: 'machines' },
    ],
  },
];
