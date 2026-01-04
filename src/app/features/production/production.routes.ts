import { Routes } from '@angular/router';

export const PRODUCTION_ROUTES: Routes = [
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
      import('./wip/wip-traceability').then((m) => m.WipTraceabilityComponent),
  },
  {
    path: 'board',
    loadComponent: () => import('./board/production-board').then(m => m.ProductionBoardComponent),
  },
  { 
    path: 'times', 
    loadComponent: () => import('./times/times').then(m => m.TimesComponent) 
  },
  {
    path: 'control-visual',
    loadComponent: () => import('./control-visual/control-visual').then(m => m.ControlVisualComponent),
  },
  { 
    path: '', 
    pathMatch: 'full', 
    redirectTo: 'orders' 
  },
];
