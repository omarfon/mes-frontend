import { Routes } from '@angular/router';

export const MAINTENANCE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./maintenance-shell/maintenance-shell')
        .then(m => m.MaintenanceShellComponent),
    children: [
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard').then(m => m.DashboardComponent) },
      { path: 'assets', loadComponent: () => import('./assets/assets').then(m => m.AssetsComponent) },
      { path: 'components', loadComponent: () => import('./components/components').then(m => m.ComponentsComponent) },
      { path: 'work-orders', loadComponent: () => import('./work-orders/work-orders').then(m => m.WorkOrdersComponent) },
      { path: 'work-orders/:id', loadComponent: () => import('./work-orders/work-orders').then(m => m.WorkOrdersComponent) },
      { path: 'preventive', loadComponent: () => import('./preventive/preventive').then(m => m.PreventiveComponent) },
      { path: 'interventions', loadComponent: () => import('./interventions/interventions').then(m => m.InterventionsComponent) },
      { path: 'interventions/:id', loadComponent: () => import('./interventions/interventions').then(m => m.InterventionsComponent) },
      { path: 'inventory', loadComponent: () => import('./inventory/inventory').then(m => m.InventoryComponent) },
      { path: 'history', loadComponent: () => import('./history/history').then(m => m.HistoryComponent) },
      { path: 'reports', loadComponent: () => import('./reports/reports').then(m => m.ReportsComponent) },
      { path: 'downtime', loadComponent: () => import('./downtime/downtime').then(m => m.DowntimeComponent) },
      { path: 'downtime/:id', loadComponent: () => import('./downtime/downtime').then(m => m.DowntimeComponent) },
      { path: 'calendar', loadComponent: () => import('./calendar/calendar').then(m => m.CalendarComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  }
];
