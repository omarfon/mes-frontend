import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface MaintenanceMetric {
  label: string;
  value: number | string;
  unit?: string;
  trend?: number; // porcentaje de cambio
  icon: string;
  color: 'blue' | 'green' | 'amber' | 'red';
}

interface WorkOrder {
  id: string;
  code: string;
  asset: string;
  type: 'PREVENTIVE' | 'CORRECTIVE' | 'EMERGENCY';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  assignedTo: string;
  dueDate: string;
}

interface AssetHealth {
  asset: string;
  status: 'GOOD' | 'WARNING' | 'CRITICAL';
  lastMaintenance: string;
  nextMaintenance: string;
  healthScore: number;
}

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent {
  metrics: MaintenanceMetric[] = [
    {
      label: 'Órdenes Pendientes',
      value: 12,
      icon: 'pi-clipboard',
      color: 'amber',
      trend: -15
    },
    {
      label: 'Órdenes en Progreso',
      value: 8,
      icon: 'pi-cog',
      color: 'blue',
      trend: 5
    },
    {
      label: 'Completadas (Mes)',
      value: 45,
      icon: 'pi-check-circle',
      color: 'green',
      trend: 12
    },
    {
      label: 'Tiempo Prom. Respuesta',
      value: '2.5',
      unit: 'hrs',
      icon: 'pi-clock',
      color: 'blue',
      trend: -8
    },
    {
      label: 'MTTR',
      value: '4.2',
      unit: 'hrs',
      icon: 'pi-wrench',
      color: 'amber',
      trend: -5
    },
    {
      label: 'Disponibilidad',
      value: '96.5',
      unit: '%',
      icon: 'pi-chart-line',
      color: 'green',
      trend: 2.1
    }
  ];

  recentWorkOrders: WorkOrder[] = [
    {
      id: '1',
      code: 'WO-2024-001',
      asset: 'Hiladora 01',
      type: 'CORRECTIVE',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      assignedTo: 'Juan Pérez',
      dueDate: '2025-12-28'
    },
    {
      id: '2',
      code: 'WO-2024-002',
      asset: 'Carda 02',
      type: 'PREVENTIVE',
      priority: 'MEDIUM',
      status: 'PENDING',
      assignedTo: 'María Torres',
      dueDate: '2025-12-29'
    },
    {
      id: '3',
      code: 'WO-2024-003',
      asset: 'Compresor A1',
      type: 'EMERGENCY',
      priority: 'CRITICAL',
      status: 'IN_PROGRESS',
      assignedTo: 'Carlos Ruiz',
      dueDate: '2025-12-27'
    },
    {
      id: '4',
      code: 'WO-2024-004',
      asset: 'Telar 05',
      type: 'PREVENTIVE',
      priority: 'LOW',
      status: 'PENDING',
      assignedTo: 'Ana López',
      dueDate: '2025-12-30'
    }
  ];

  assetHealth: AssetHealth[] = [
    {
      asset: 'Hiladora 01',
      status: 'WARNING',
      lastMaintenance: '2025-12-15',
      nextMaintenance: '2025-12-28',
      healthScore: 72
    },
    {
      asset: 'Carda 02',
      status: 'GOOD',
      lastMaintenance: '2025-12-20',
      nextMaintenance: '2026-01-05',
      healthScore: 88
    },
    {
      asset: 'Compresor A1',
      status: 'CRITICAL',
      lastMaintenance: '2025-11-10',
      nextMaintenance: '2025-12-27',
      healthScore: 45
    },
    {
      asset: 'Telar 05',
      status: 'GOOD',
      lastMaintenance: '2025-12-22',
      nextMaintenance: '2026-01-10',
      healthScore: 91
    }
  ];

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      'PENDING': 'ui-badge-warn',
      'IN_PROGRESS': 'ui-badge bg-blue-500/15 border-blue-500/25 text-blue-200',
      'COMPLETED': 'ui-badge-ok',
      'CANCELLED': 'ui-badge-bad'
    };
    return classes[status] || 'ui-badge';
  }

  getPriorityBadgeClass(priority: string): string {
    const classes: Record<string, string> = {
      'LOW': 'ui-badge bg-slate-500/15 border-slate-500/25 text-slate-200',
      'MEDIUM': 'ui-badge-warn',
      'HIGH': 'ui-badge bg-orange-500/15 border-orange-500/25 text-orange-200',
      'CRITICAL': 'ui-badge-bad'
    };
    return classes[priority] || 'ui-badge';
  }

  getHealthStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'GOOD': 'ui-badge-ok',
      'WARNING': 'ui-badge-warn',
      'CRITICAL': 'ui-badge-bad'
    };
    return classes[status] || 'ui-badge';
  }

  getMetricColor(color: string): string {
    const colors: Record<string, string> = {
      'blue': 'from-blue-600/20 to-blue-600/5 border-blue-500/30',
      'green': 'from-emerald-600/20 to-emerald-600/5 border-emerald-500/30',
      'amber': 'from-amber-600/20 to-amber-600/5 border-amber-500/30',
      'red': 'from-rose-600/20 to-rose-600/5 border-rose-500/30'
    };
    return colors[color] || colors['blue'];
  }

  getHealthBarColor(score: number): string {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  }
}
