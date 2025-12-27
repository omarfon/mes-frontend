import { Routes } from '@angular/router';
import { IntegrationsShell } from './integrations-shell';

export const INTEGRATIONS_ROUTES: Routes = [
  {
    path: '',
    component: IntegrationsShell,
    children: [
      {
        path: 'erp',
        loadComponent: () => import('./erp/erp-integration').then(m => m.ErpIntegrationComponent)
      },
      {
        path: 'scada',
        loadComponent: () => import('./scada/scada-integration').then(m => m.ScadaIntegrationComponent)
      },
      {
        path: 'cmms',
        loadComponent: () => import('./cmms/cmms-integration').then(m => m.CmmsIntegrationComponent)
      },
      {
        path: 'messaging',
        loadComponent: () => import('./messaging/messaging-integration').then(m => m.MessagingIntegrationComponent)
      },
      { path: '', redirectTo: 'erp', pathMatch: 'full' }
    ]
  }
];
