import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface KPI {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: string;
  color: string;
}

interface ProductionOrder {
  id: string;
  product: string;
  quantity: number;
  progress: number;
  status: string;
  machine: string;
}

interface Alert {
  id: number;
  type: 'error' | 'warning' | 'info';
  module: string;
  message: string;
  time: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  // KPIs principales
  kpis: KPI[] = [
    { label: 'OEE Global', value: '78.5%', change: '+2.3%', trend: 'up', icon: 'pi-chart-line', color: 'blue' },
    { label: 'Órdenes Activas', value: 12, change: '+3', trend: 'up', icon: 'pi-list', color: 'green' },
    { label: 'Calidad (Conformidad)', value: '96.2%', change: '-0.5%', trend: 'down', icon: 'pi-check-circle', color: 'green' },
    { label: 'Disponibilidad', value: '89.3%', change: '+1.2%', trend: 'up', icon: 'pi-clock', color: 'purple' },
    { label: 'Producción Hoy', value: '1,245 uds', change: '+8%', trend: 'up', icon: 'pi-box', color: 'orange' },
    { label: 'Scrap Rate', value: '2.1%', change: '-0.3%', trend: 'up', icon: 'pi-exclamation-triangle', color: 'red' },
  ];

  // Órdenes en ejecución
  activeOrders: ProductionOrder[] = [
    { id: 'OP-1234', product: 'Producto A', quantity: 500, progress: 75, status: 'EN_EJECUCION', machine: 'M-001' },
    { id: 'OP-1235', product: 'Producto B', quantity: 300, progress: 45, status: 'EN_EJECUCION', machine: 'M-002' },
    { id: 'OP-1236', product: 'Producto C', quantity: 800, progress: 90, status: 'EN_EJECUCION', machine: 'M-003' },
    { id: 'OP-1237', product: 'Producto D', quantity: 200, progress: 20, status: 'EN_EJECUCION', machine: 'M-005' },
  ];

  // Alertas recientes
  alerts: Alert[] = [
    { id: 1, type: 'error', module: 'Producción', message: 'Máquina M-004 detenida por falla eléctrica', time: '10:45' },
    { id: 2, type: 'warning', module: 'Calidad', message: 'Lote LOT-789 pendiente de inspección urgente', time: '10:30' },
    { id: 3, type: 'warning', module: 'Mantenimiento', message: 'PM-101 vence hoy - Mantenimiento preventivo', time: '09:15' },
    { id: 4, type: 'info', module: 'Inventarios', message: 'Material MAT-550 bajo nivel de stock crítico', time: '08:50' },
  ];

  // Estados de máquinas
  machineStatus = [
    { name: 'M-001', status: 'RUNNING', utilization: 95, oee: 82 },
    { name: 'M-002', status: 'RUNNING', utilization: 88, oee: 76 },
    { name: 'M-003', status: 'RUNNING', utilization: 92, oee: 85 },
    { name: 'M-004', status: 'STOPPED', utilization: 0, oee: 0 },
    { name: 'M-005', status: 'RUNNING', utilization: 78, oee: 70 },
    { name: 'M-006', status: 'IDLE', utilization: 45, oee: 38 },
  ];

  // Producción por turno (sample data)
  shiftProduction = [
    { shift: 'Turno 1', planned: 500, actual: 485, efficiency: 97 },
    { shift: 'Turno 2', planned: 500, actual: 520, efficiency: 104 },
    { shift: 'Turno 3', planned: 500, actual: 240, efficiency: 48, current: true },
  ];

  getTrendIcon(trend?: 'up' | 'down' | 'neutral') {
    if (trend === 'up') return 'pi-arrow-up';
    if (trend === 'down') return 'pi-arrow-down';
    return 'pi-minus';
  }

  getTrendColor(trend?: 'up' | 'down' | 'neutral') {
    if (trend === 'up') return 'text-green-400';
    if (trend === 'down') return 'text-red-400';
    return 'text-slate-400';
  }

  getAlertClass(type: string) {
    const map: Record<string, string> = {
      error: 'border-l-4 border-red-500 bg-red-500/5',
      warning: 'border-l-4 border-yellow-500 bg-yellow-500/5',
      info: 'border-l-4 border-blue-500 bg-blue-500/5'
    };
    return map[type] || '';
  }

  getAlertIcon(type: string) {
    const map: Record<string, string> = {
      error: 'pi-times-circle text-red-400',
      warning: 'pi-exclamation-triangle text-yellow-400',
      info: 'pi-info-circle text-blue-400'
    };
    return map[type] || '';
  }

  getMachineStatusClass(status: string) {
    const map: Record<string, string> = {
      RUNNING: 'bg-green-500',
      STOPPED: 'bg-red-500',
      IDLE: 'bg-yellow-500'
    };
    return map[status] || 'bg-slate-500';
  }

  getMachineStatusText(status: string) {
    const map: Record<string, string> = {
      RUNNING: 'Operando',
      STOPPED: 'Detenida',
      IDLE: 'Inactiva'
    };
    return map[status] || status;
  }
}
