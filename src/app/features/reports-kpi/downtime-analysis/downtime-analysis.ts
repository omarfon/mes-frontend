import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-downtime-analysis',
  imports: [CommonModule, FormsModule],
  templateUrl: './downtime-analysis.html',
  styleUrls: ['./downtime-analysis.css'],
})
export class DowntimeAnalysisComponent {
  reasons = [
    { name: 'Falla mecánica', minutes: 180, percentage: 45, cumulative: 45 },
    { name: 'Cambio de herramienta', minutes: 80, percentage: 20, cumulative: 65 },
    { name: 'Falta de material', minutes: 60, percentage: 15, cumulative: 80 },
    { name: 'Mantenimiento preventivo', minutes: 40, percentage: 10, cumulative: 90 },
    { name: 'Otros', minutes: 40, percentage: 10, cumulative: 100 },
  ];

  get totalDowntime() {
    return this.reasons.reduce((sum, r) => sum + r.minutes, 0);
  }
}
