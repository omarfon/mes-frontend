import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaintenanceStoreService } from '../services/maintenance-store.service';

@Component({
  standalone: true,
  selector: 'app-history',
  imports: [CommonModule, FormsModule],
  templateUrl: './history.html',
})
export class HistoryComponent {
  assetCode = 'MAQ-001';

  constructor(public ms: MaintenanceStoreService) {}

  get assets() { return this.ms.assets; }

  get data() {
    return this.ms.historyForAsset(this.assetCode);
  }

  badgeType(t: string) {
    if (t === 'WO') return 'bg-amber-500/10 text-amber-200 border border-amber-500/20 rounded-full px-2 py-1 text-[11px]';
    if (t === 'DT') return 'bg-rose-500/10 text-rose-200 border border-rose-500/20 rounded-full px-2 py-1 text-[11px]';
    return 'bg-blue-500/10 text-blue-200 border border-blue-500/20 rounded-full px-2 py-1 text-[11px]';
  }
}
