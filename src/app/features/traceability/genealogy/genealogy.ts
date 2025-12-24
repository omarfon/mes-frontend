import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TraceabilityStoreService, LotLink, Lot } from '../services/traceability-store';

@Component({
  standalone: true,
  selector: 'app-genealogy',
  imports: [CommonModule, FormsModule],
  templateUrl: './genealogy.html',
})
export class GenealogyComponent {
  qLot = '';
  lot: Lot | null = null;
  error = '';

  // split form
  splitChildCode = '';
  splitQty = 0;
  splitCount = 2;

  // merge form
  mergeResultCode = '';
  mergeParents = ''; // "LOT-1:100,LOT-2:50"
  mergeLocation = '';

  constructor(public store: TraceabilityStoreService) {}

  load() {
    this.error = '';
    const code = this.qLot.trim();
    if (!code) return;

    const lot = this.store.findLotByCode(code);
    if (!lot) {
      this.lot = null;
      this.error = 'Lote no encontrado';
      return;
    }
    this.lot = lot;
  }

  get upstream(): LotLink[] {
    if (!this.lot) return [];
    return this.store.getUpstream(this.lot.code);
  }

  get downstream(): LotLink[] {
    if (!this.lot) return [];
    return this.store.getDownstream(this.lot.code);
  }

  // árbol simple (BFS) hasta depth=3
  buildTree(direction: 'up' | 'down', maxDepth = 3) {
    if (!this.lot) return [];
    const root = this.lot.code;

    const rows: { depth: number; from: string; to: string; type: string; qty?: number; uom?: string; at: string }[] = [];
    const visited = new Set<string>([root]);

    let frontier = [root];
    for (let depth = 1; depth <= maxDepth; depth++) {
      const next: string[] = [];
      for (const node of frontier) {
        const links = direction === 'up' ? this.store.getUpstream(node) : this.store.getDownstream(node);
        for (const l of links) {
          const from = direction === 'up' ? l.parentLotCode : l.parentLotCode;
          const to = direction === 'up' ? l.childLotCode : l.childLotCode;
          // en 'up', queremos mostrar padre -> hijo (siempre parent->child) pero navegamos hacia padres
          rows.push({ depth, from: l.parentLotCode, to: l.childLotCode, type: l.type, qty: l.qty, uom: l.uom, at: l.at });

          const nextNode = direction === 'up' ? l.parentLotCode : l.childLotCode;
          if (!visited.has(nextNode)) {
            visited.add(nextNode);
            next.push(nextNode);
          }
        }
      }
      frontier = next;
      if (frontier.length === 0) break;
    }
    return rows;
  }

  openLot(code: string) {
    this.qLot = code;
    this.load();
  }

  doSplit() {
    if (!this.lot) return;
    if (this.splitCount < 1) return;

    // genera hijos automáticamente si no puso código
    const children = Array.from({ length: this.splitCount }).map((_, i) => ({
      code: this.splitChildCode?.trim()
        ? `${this.splitChildCode.trim()}-${i + 1}`
        : `${this.lot!.code}-CH${i + 1}`,
      qty: Number(this.splitQty || 0),
      uom: this.lot!.uom,
      location: this.lot!.location,
      type: this.lot!.type,
      itemCode: this.lot!.itemCode,
      description: this.lot!.description,
    }));

    try {
      this.store.splitLot({
        parentLotCode: this.lot.code,
        children,
        by: 'user',
        note: 'Split desde Genealogía',
      });
      this.load();
    } catch (e: any) {
      this.error = e?.message ?? 'Error en split';
    }
  }

  doMerge() {
    if (!this.lot) return;

    try {
      const parents = (this.mergeParents || '')
        .split(',')
        .map(x => x.trim())
        .filter(Boolean)
        .map(part => {
          const [code, qtyStr] = part.split(':').map(s => s.trim());
          return { code, qty: Number(qtyStr) };
        });

      const resultCode = this.mergeResultCode.trim() || `${this.lot.code}-MERGE`;

      this.store.mergeLots({
        childLotCode: resultCode,
        parents,
        by: 'user',
        note: 'Merge desde Genealogía',
        location: this.mergeLocation.trim() || this.lot.location,
        uom: this.lot.uom,
      });

      // abrir resultado
      this.openLot(resultCode);
    } catch (e: any) {
      this.error = e?.message ?? 'Error en merge';
    }
  }
}
