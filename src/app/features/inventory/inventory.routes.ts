import { Routes } from '@angular/router';
import { InventoryShell } from './inventory-shell';

export const INVENTORY_ROUTES: Routes = [
  {
    path: '',
    component: InventoryShell,
    children: [
      {
        path: 'movements',
        loadComponent: () =>
          import('./movements/movements').then((m) => m.MovementsComponent),
      },
      {
        path: 'kardex',
        loadComponent: () =>
          import('./kardex/kardex').then((m) => m.KardexComponent),
      },
      {
        path: 'transfers',
        loadComponent: () =>
          import('./transfers/transfers').then((m) => m.TransfersComponent),
      },
      {
        path: 'counts',
        loadComponent: () =>
          import('./counts/counts').then((m) => m.CountsComponent),
      },
      {
        path: '',
        redirectTo: 'movements',
        pathMatch: 'full',
      },
    ],
  },
];
