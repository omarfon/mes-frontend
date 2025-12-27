import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-traceability-audit',
  imports: [CommonModule, FormsModule],
  templateUrl: './traceability-audit.html',
  styleUrls: ['./traceability-audit.css'],
})
export class TraceabilityAuditComponent {
  searchType = 'LOT';
  searchValue = '';
  
  results = [
    { type: 'Lote', code: 'LOT-2024-001', date: '2024-12-20', status: 'Activo', location: 'A-01-01', quantity: 500 },
    { type: 'Movimiento', code: 'MOV-2024-045', date: '2024-12-21', action: 'Salida', quantity: 150 },
    { type: 'Producción', code: 'WO-2024-089', date: '2024-12-22', product: 'PROD-A', quantity: 200 },
  ];
}
