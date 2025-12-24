import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import {
  ChartConfiguration,
  ChartData,
  ChartType,
  ChartOptions,
} from 'chart.js';

@Component({
  standalone: true,
  selector: 'app-reports',
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './reports.html',
})
export class ReportsComponent {
  // KPIs (ejemplos)
  kpis = [
    { label: 'Órdenes', value: 42 },
    { label: 'Lotes en proceso', value: 17 },
    { label: 'Defectos (semana)', value: 28 },
    { label: 'OEE promedio', value: '78%' },
  ];

  // 1) Producción por día (línea)
  productionLineType: ChartType = 'line';
  productionLineData: ChartData<'line'> = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      { data: [120, 150, 180, 160, 210, 190, 230], label: 'Kg producidos' },
    ],
  };

  productionLineOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true } },
  };

  // 2) Defectos por familia (barra)
  defectsBarType: ChartType = 'bar';
  defectsBarData: ChartData<'bar'> = {
    labels: ['Mancha', 'Rotura', 'Tejido', 'Color', 'Costura'],
    datasets: [{ data: [8, 5, 6, 4, 5], label: 'Defectos' }],
  };
  defectsBarOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true } },
  };

  // 3) Estado de órdenes (dona)
  ordersDoughnutType: ChartType = 'doughnut';
  ordersDoughnutData: ChartData<'doughnut'> = {
    labels: ['Pendiente', 'En proceso', 'Terminado', 'Pausado'],
    datasets: [{ data: [10, 18, 12, 2] }],
  };
  ordersDoughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'bottom' } },
  };

  // Tabla resumen (ejemplo)
  topMachines = [
    { machine: 'Carda 01', uptime: '92%', stops: 3 },
    { machine: 'Hiladora 04', uptime: '88%', stops: 5 },
    { machine: 'Tejedora 02', uptime: '85%', stops: 6 },
  ];
}
