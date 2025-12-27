import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface OeeData {
  machine: string;
  shift: string;
  date: string;
  plannedTime: number; // minutos
  downtime: number; // minutos
  availability: number; // %
  targetCycleTime: number; // segundos
  actualCycleTime: number; // segundos
  performance: number; // %
  goodUnits: number;
  totalUnits: number;
  quality: number; // %
  oee: number; // %
}

interface OeeTrend {
  date: string;
  availability: number;
  performance: number;
  quality: number;
  oee: number;
}

@Component({
  standalone: true,
  selector: 'app-oee',
  imports: [CommonModule, FormsModule],
  templateUrl: './oee.html',
  styleUrls: ['./oee.css'],
})
export class OeeComponent {
  oeeData: OeeData[] = [
    {
      machine: 'M-001',
      shift: 'Turno 1',
      date: '2024-12-26',
      plannedTime: 480,
      downtime: 45,
      availability: 90.6,
      targetCycleTime: 30,
      actualCycleTime: 33,
      performance: 90.9,
      goodUnits: 450,
      totalUnits: 470,
      quality: 95.7,
      oee: 78.8,
    },
    {
      machine: 'M-002',
      shift: 'Turno 1',
      date: '2024-12-26',
      plannedTime: 480,
      downtime: 30,
      availability: 93.8,
      targetCycleTime: 25,
      actualCycleTime: 26,
      performance: 96.2,
      goodUnits: 520,
      totalUnits: 530,
      quality: 98.1,
      oee: 88.5,
    },
    {
      machine: 'M-001',
      shift: 'Turno 2',
      date: '2024-12-26',
      plannedTime: 480,
      downtime: 60,
      availability: 87.5,
      targetCycleTime: 30,
      actualCycleTime: 35,
      performance: 85.7,
      goodUnits: 380,
      totalUnits: 410,
      quality: 92.7,
      oee: 69.5,
    },
  ];

  trend: OeeTrend[] = [
    { date: '2024-12-20', availability: 88, performance: 92, quality: 96, oee: 77.7 },
    { date: '2024-12-21', availability: 90, performance: 90, quality: 95, oee: 76.9 },
    { date: '2024-12-22', availability: 92, performance: 91, quality: 97, oee: 81.2 },
    { date: '2024-12-23', availability: 89, performance: 93, quality: 94, oee: 77.8 },
    { date: '2024-12-24', availability: 91, performance: 89, quality: 96, oee: 77.7 },
    { date: '2024-12-25', availability: 93, performance: 92, quality: 95, oee: 81.3 },
    { date: '2024-12-26', availability: 90.6, performance: 90.9, quality: 95.7, oee: 78.8 },
  ];

  selectedData: OeeData | null = null;

  // Filters
  filterMachine: string = 'ALL';
  filterShift: string = 'ALL';
  filterDate: string = '';

  get filtered() {
    let result = this.oeeData;

    if (this.filterMachine !== 'ALL') {
      result = result.filter((d) => d.machine === this.filterMachine);
    }

    if (this.filterShift !== 'ALL') {
      result = result.filter((d) => d.shift === this.filterShift);
    }

    if (this.filterDate) {
      result = result.filter((d) => d.date === this.filterDate);
    }

    return result;
  }

  get uniqueMachines() {
    return Array.from(new Set(this.oeeData.map((d) => d.machine)));
  }

  get uniqueShifts() {
    return Array.from(new Set(this.oeeData.map((d) => d.shift)));
  }

  get averageOee() {
    if (this.filtered.length === 0) return 0;
    return this.filtered.reduce((sum, d) => sum + d.oee, 0) / this.filtered.length;
  }

  get averageAvailability() {
    if (this.filtered.length === 0) return 0;
    return this.filtered.reduce((sum, d) => sum + d.availability, 0) / this.filtered.length;
  }

  get averagePerformance() {
    if (this.filtered.length === 0) return 0;
    return this.filtered.reduce((sum, d) => sum + d.performance, 0) / this.filtered.length;
  }

  get averageQuality() {
    if (this.filtered.length === 0) return 0;
    return this.filtered.reduce((sum, d) => sum + d.quality, 0) / this.filtered.length;
  }

  selectData(data: OeeData) {
    this.selectedData = data;
  }

  getOeeClass(oee: number) {
    if (oee >= 85) return 'text-green-400';
    if (oee >= 70) return 'text-amber-400';
    return 'text-red-400';
  }

  getMetricClass(value: number) {
    if (value >= 90) return 'text-green-400';
    if (value >= 80) return 'text-amber-400';
    return 'text-red-400';
  }

  getBarColor(value: number) {
    if (value >= 90) return 'bg-green-500';
    if (value >= 80) return 'bg-amber-500';
    return 'bg-red-500';
  }
}
