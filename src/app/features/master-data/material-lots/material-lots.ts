import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialLotsService, MaterialLot, LotStatus, CreateMaterialLotDto } from './material-lots.service';

@Component({
  standalone: true,
  selector: 'app-material-lots',
  imports: [CommonModule, FormsModule],
  templateUrl: './material-lots.html',
})
export class MaterialLotsComponent implements OnInit {
  form: CreateMaterialLotDto = {
    lotNumber: '', materialCode: '', materialName: '', supplierCode: '', supplierLot: '',
    receivedDate: '', expiryDate: '', initialQty: 0, availableQty: 0,
    uom: 'kg', locationCode: '', status: 'AVAILABLE', notes: '',
  };

  items: MaterialLot[] = [];
  editingId: string | null = null;
  filterStatus: LotStatus | '' = '';
  filterMaterial = '';
  q = '';
  loading = false;
  error: string | null = null;

  readonly statuses: { value: LotStatus; label: string; cls: string; icon: string }[] = [
    { value: 'AVAILABLE', label: 'Disponible', cls: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30', icon: 'pi-check-circle' },
    { value: 'QUARANTINE', label: 'Cuarentena', cls: 'bg-amber-500/10 text-amber-300 border border-amber-500/30', icon: 'pi-exclamation-triangle' },
    { value: 'CONSUMED', label: 'Consumido', cls: 'bg-slate-500/15 text-slate-400 border border-slate-500/30', icon: 'pi-minus-circle' },
    { value: 'EXPIRED', label: 'Vencido', cls: 'bg-orange-500/10 text-orange-400 border border-orange-500/30', icon: 'pi-clock' },
    { value: 'REJECTED', label: 'Rechazado', cls: 'bg-red-500/10 text-red-400 border border-red-500/30', icon: 'pi-times-circle' },
  ];

  constructor(private svc: MaterialLotsService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.error = null;
    this.svc.getAll().subscribe({
      next: data => { this.items = data; this.loading = false; this.cdr.detectChanges(); },
      error: err => { this.error = this.extractError(err); this.loading = false; this.cdr.detectChanges(); },
    });
  }

  get uniqueMaterials(): string[] {
    return [...new Set(this.items.map(i => i.materialCode))].sort();
  }

  get filtered() {
    let list = this.items;
    if (this.filterStatus) list = list.filter(x => x.status === this.filterStatus);
    if (this.filterMaterial) list = list.filter(x => x.materialCode === this.filterMaterial);
    const t = this.q.trim().toLowerCase();
    if (t) list = list.filter(x =>
      [x.lotNumber, x.materialCode, x.materialName, x.supplierCode, x.supplierLot, x.locationCode]
        .some(v => v.toLowerCase().includes(t))
    );
    return list;
  }

  statusCls(s: LotStatus): string { return this.statuses.find(x => x.value === s)?.cls ?? ''; }
  statusLabel(s: LotStatus): string { return this.statuses.find(x => x.value === s)?.label ?? s; }
  statusIcon(s: LotStatus): string { return this.statuses.find(x => x.value === s)?.icon ?? ''; }
  countByStatus(s: LotStatus): number { return this.items.filter(x => x.status === s).length; }

  get consumedPct(): number {
    const total = this.items.reduce((a, l) => a + l.initialQty, 0);
    const consumed = this.items.reduce((a, l) => a + (l.initialQty - l.availableQty), 0);
    return total > 0 ? Math.round((consumed / total) * 100) : 0;
  }

  copyInitialToAvailable() {
    this.form.availableQty = this.form.initialQty;
  }

  submit() {
    if (!this.form.lotNumber || !this.form.materialCode) return;
    this.loading = true;
    const obs = this.editingId ? this.svc.update(this.editingId, this.form) : this.svc.create(this.form);
    obs.subscribe({
      next: () => { this.load(); this.editingId ? this.cancelEdit() : this.resetForm(); },
      error: err => { this.error = this.extractError(err); this.loading = false; },
    });
  }

  edit(it: MaterialLot) {
    this.editingId = it.id;
    this.form = { lotNumber: it.lotNumber, materialCode: it.materialCode, materialName: it.materialName, supplierCode: it.supplierCode, supplierLot: it.supplierLot, receivedDate: it.receivedDate, expiryDate: it.expiryDate, initialQty: it.initialQty, availableQty: it.availableQty, uom: it.uom, locationCode: it.locationCode, status: it.status, notes: it.notes };
  }

  remove(id: string) {
    if (!confirm('¿Eliminar este lote?')) return;
    this.svc.delete(id).subscribe({
      next: () => { this.load(); if (this.editingId === id) this.cancelEdit(); },
      error: err => { this.error = this.extractError(err); },
    });
  }

  cancelEdit() { this.editingId = null; this.resetForm(); }

  resetForm() {
    this.form = { lotNumber: '', materialCode: '', materialName: '', supplierCode: '', supplierLot: '', receivedDate: '', expiryDate: '', initialQty: 0, availableQty: 0, uom: 'kg', locationCode: '', status: 'AVAILABLE', notes: '' };
  }

  private extractError(err: any): string {
    if (typeof err.error?.message === 'string') return err.error.message;
    if (Array.isArray(err.error?.message)) return err.error.message.join(', ');
    if (err.error?.error) return err.error.error;
    return err.message || 'Error desconocido';
  }
}
