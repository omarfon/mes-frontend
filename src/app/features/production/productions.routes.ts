import { Routes } from '@angular/router';

export const PRODUCTION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./production-shell/production-shell').then(
        (m) => m.ProductionShellComponent
      ),
    children: [
      {
        path: 'orders',
        loadComponent: () =>
          import('./orders/orders').then((m) => m.OrdersComponent),
      },
      {
        path: 'dispatch',
        loadComponent: () =>
          import('./dispatch/dispatch').then((m) => m.DispatchComponent),
      },
      {
        path: 'execution',
        loadComponent: () =>
          import('./execution/execution').then((m) => m.ExecutionComponent),
      },
      {
        path: 'wip',
        loadComponent: () =>
          import('./wip/wip').then((m) => m.WipComponent),
      },
      { path: '', pathMatch: 'full', redirectTo: 'orders' 

      },
      {
        path: 'board',
        loadComponent: () => import('./board/board').then(m => m.BoardComponent),
      },
      { path: 'times', loadComponent: () => import('./times/times').then(m => m.TimesComponent) },

    ],
  },
];
