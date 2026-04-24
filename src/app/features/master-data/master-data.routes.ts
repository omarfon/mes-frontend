import { Routes } from '@angular/router';

export const MASTER_DATA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./master-data-shell/master-data-shell').then(m => m.MasterDataShellComponent),
    children: [
      // ── Organización y Planta ──────────────────────────────
      {
        path: 'plants',
        loadComponent: () => import('./plants/plants').then(m => m.PlantsComponent),
      },
      {
        path: 'areas',
        loadComponent: () => import('./areas/areas').then(m => m.AreasComponent),
      },
      {
        path: 'work-centers',
        loadComponent: () => import('./work-centers/work-centers').then(m => m.WorkCentersComponent),
      },
      {
        path: 'workstations',
        loadComponent: () => import('./workstations/workstations').then(m => m.WorkstationsComponent),
      },
      {
        path: 'plant-calendar',
        loadComponent: () => import('./plant-calendar/plant-calendar').then(m => m.PlantCalendarComponent),
      },
      {
        path: 'shift-groups',
        loadComponent: () => import('./shift-groups/shift-groups').then(m => m.ShiftGroupsComponent),
      },
      // ── Producción / Planta ────────────────────────────────
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
      // ── Productos y Procesos ───────────────────────────────
      {
        path: 'product-variants',
        loadComponent: () => import('./product-variants/product-variants').then(m => m.ProductVariantsComponent),
      },
      {
        path: 'routings',
        loadComponent: () => import('./routings/routings').then(m => m.RoutingsComponent),
      },
      {
        path: 'process-recipes',
        loadComponent: () => import('./process-recipes/process-recipes').then(m => m.ProcessRecipesComponent),
      },
      {
        path: 'standard-times',
        loadComponent: () => import('./standard-times/standard-times').then(m => m.StandardTimesComponent),
      },
      {
        path: 'order-types',
        loadComponent: () => import('./order-types/order-types').then(m => m.OrderTypesComponent),
      },
      // ── Materiales (nuevos) ────────────────────────────────
      {
        path: 'bill-of-materials',
        loadComponent: () => import('./bill-of-materials/bill-of-materials').then(m => m.BillOfMaterialsComponent),
      },
      {
        path: 'movement-types',
        loadComponent: () => import('./movement-types/movement-types').then(m => m.MovementTypesComponent),
      },
      {
        path: 'scrap-reasons',
        loadComponent: () => import('./scrap-reasons/scrap-reasons').then(m => m.ScrapReasonsComponent),
      },
      {
        path: 'material-lots',
        loadComponent: () => import('./material-lots/material-lots').then(m => m.MaterialLotsComponent),
      },
      { path: '', pathMatch: 'full', redirectTo: 'plants' },
    ],
  },
];
