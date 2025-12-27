import { Routes } from '@angular/router';
import { ReportsKpiShell } from './reports-kpi-shell';

export const REPORTS_KPI_ROUTES: Routes = [
  {
    path: '',
    component: ReportsKpiShell,
    children: [
      {
        path: 'oee',
        loadComponent: () =>
          import('./oee/oee').then((m) => m.OeeComponent),
      },
      {
        path: 'production',
        loadComponent: () =>
          import('./production-analysis/production-analysis').then((m) => m.ProductionAnalysisComponent),
      },
      {
        path: 'scrap',
        loadComponent: () =>
          import('./scrap-analysis/scrap-analysis').then((m) => m.ScrapAnalysisComponent),
      },
      {
        path: 'downtime',
        loadComponent: () =>
          import('./downtime-analysis/downtime-analysis').then((m) => m.DowntimeAnalysisComponent),
      },
      {
        path: 'traceability',
        loadComponent: () =>
          import('./traceability-audit/traceability-audit').then((m) => m.TraceabilityAuditComponent),
      },
      {
        path: '',
        redirectTo: 'oee',
        pathMatch: 'full',
      },
    ],
  },
];
