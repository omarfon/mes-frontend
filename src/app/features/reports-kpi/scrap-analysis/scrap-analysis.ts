import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ScrapCause {
  name: string;
  quantity: number;
  percentage: number;
  cumulative: number;
}

interface ScrapDetail {
  product: string;
  defect: string;
  quantity: number;
  percentage: number;
  cost: number;
}

@Component({
  standalone: true,
  selector: 'app-scrap-analysis',
  imports: [CommonModule, FormsModule],
  templateUrl: './scrap-analysis.html',
  styleUrls: ['./scrap-analysis.css'],
})
export class ScrapAnalysisComponent {
  startDate = '2024-12-20';
  endDate = '2024-12-26';
  
  causes: ScrapCause[] = [
    { name: 'Defecto de material', quantity: 125, percentage: 41.7, cumulative: 41.7 },
    { name: 'Error de operador', quantity: 78, percentage: 26.0, cumulative: 67.7 },
    { name: 'Falla de máquina', quantity: 45, percentage: 15.0, cumulative: 82.7 },
    { name: 'Problema de calibración', quantity: 32, percentage: 10.7, cumulative: 93.3 },
    { name: 'Otros', quantity: 20, percentage: 6.7, cumulative: 100.0 },
  ];

  details: ScrapDetail[] = [
    { product: 'PROD-001', defect: 'Defecto de material', quantity: 45, percentage: 15.0, cost: 2250 },
    { product: 'PROD-002', defect: 'Error de operador', quantity: 38, percentage: 12.7, cost: 1900 },
    { product: 'PROD-001', defect: 'Falla de máquina', quantity: 25, percentage: 8.3, cost: 1250 },
    { product: 'PROD-003', defect: 'Problema de calibración', quantity: 22, percentage: 7.3, cost: 1100 },
    { product: 'PROD-002', defect: 'Defecto de material', quantity: 18, percentage: 6.0, cost: 900 },
  ];

  get totalScrap() {
    return this.causes.reduce((sum, c) => sum + c.quantity, 0);
  }

  get scrapRate() {
    return (this.totalScrap / 10000) * 100;
  }

  get scrapCost() {
    return this.details.reduce((sum, d) => sum + d.cost, 0);
  }

  get topCauses() {
    return this.causes.length;
  }
  getTopCausesPercentage(): number {
  const topCauses = this.causes.slice(0, 2);
  return topCauses.reduce((sum, cause) => sum + cause.percentage, 0);
}
}
