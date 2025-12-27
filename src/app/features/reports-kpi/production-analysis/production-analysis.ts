import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ProductionData {
  name: string;
  produced: number;
  defects: number;
  rate: number;
  efficiency: number;
}

@Component({
  standalone: true,
  selector: 'app-production-analysis',
  imports: [CommonModule, FormsModule],
  templateUrl: './production-analysis.html',
  styleUrls: ['./production-analysis.css'],
})
export class ProductionAnalysisComponent {
  filterType = 'SHIFT';
  filterDate = '';
  
  dataByShift: ProductionData[] = [
    { name: 'Turno 1', produced: 1250, defects: 45, rate: 156, efficiency: 92 },
    { name: 'Turno 2', produced: 1180, defects: 62, rate: 148, efficiency: 87 },
    { name: 'Turno 3', produced: 980, defects: 38, rate: 123, efficiency: 85 },
  ];

  dataByMachine: ProductionData[] = [
    { name: 'M-001', produced: 1450, defects: 52, rate: 181, efficiency: 89 },
    { name: 'M-002', produced: 1320, defects: 48, rate: 165, efficiency: 91 },
    { name: 'M-003', produced: 1140, defects: 45, rate: 143, efficiency: 88 },
  ];

  dataByProduct: ProductionData[] = [
    { name: 'PROD-A', produced: 1680, defects: 62, rate: 210, efficiency: 90 },
    { name: 'PROD-B', produced: 1250, defects: 38, rate: 156, efficiency: 92 },
    { name: 'PROD-C', produced: 980, defects: 45, rate: 123, efficiency: 86 },
  ];

  get data() {
    if (this.filterType === 'MACHINE') return this.dataByMachine;
    if (this.filterType === 'PRODUCT') return this.dataByProduct;
    return this.dataByShift;
  }

  get totalProduced() {
    return this.data.reduce((sum, d) => sum + d.produced, 0);
  }

  get averageRate() {
    return this.data.reduce((sum, d) => sum + d.rate, 0) / this.data.length;
  }

  get efficiency() {
    return this.data.reduce((sum, d) => sum + d.efficiency, 0) / this.data.length;
  }

  get scrapRate() {
    const total = this.data.reduce((sum, d) => sum + d.produced, 0);
    const defects = this.data.reduce((sum, d) => sum + d.defects, 0);
    return (defects / total) * 100;
  }
}
