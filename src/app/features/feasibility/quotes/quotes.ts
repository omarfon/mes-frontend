import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-feasibility-quotes',
  imports: [CommonModule, FormsModule],
  templateUrl: './quotes.html',
})
export class FeasibilityQuotesComponent implements OnInit {
  items: any[] = [];
  loading = false;
  error: string | null = null;
  q = '';
  filterStatus = '';
  showForm = false;
  editingId: string | null = null;
  form = this.emptyForm();

  statuses = [
    { value: 'DRAFT', label: 'Borrador' },
    { value: 'SENT', label: 'Enviada' },
    { value: 'ACCEPTED', label: 'Aceptada' },
    { value: 'REJECTED', label: 'Rechazada' },
    { value: 'EXPIRED', label: 'Vencida' },
  ];

  emptyForm() {
    return {
      code: '', studyCode: '', clientName: '', productName: '',
      quantity: null as number | null, uom: '',
      materialCost: 0, laborCost: 0, overheadCost: 0,
      margin: 20, totalCost: 0, quotePrice: 0,
      currency: 'COP', status: 'DRAFT',
      validUntil: '', deliveryDays: null as number | null,
      notes: '', sentDate: '', responseDate: '',
    };
  }

  get filtered() {
    const s = this.q.toLowerCase();
    return this.items.filter(i =>
      (!this.filterStatus || i.status === this.filterStatus) &&
      (i.code?.toLowerCase().includes(s) ||
       i.clientName?.toLowerCase().includes(s) ||
       i.productName?.toLowerCase().includes(s))
    );
  }

  ngOnInit() { this.load(); }
  load() { this.loading = true; setTimeout(() => { this.loading = false; }, 300); }

  openNew() { this.form = this.emptyForm(); this.editingId = null; this.showForm = true; }

  edit(item: any) { this.editingId = item.id; this.form = { ...item }; this.showForm = true; }

  cancel() { this.showForm = false; this.editingId = null; this.error = null; }

  recalc() {
    this.form.totalCost = (this.form.materialCost || 0) + (this.form.laborCost || 0) + (this.form.overheadCost || 0);
    this.form.quotePrice = this.form.totalCost * (1 + (this.form.margin || 0) / 100);
  }

  statusLabel(s: string) { return this.statuses.find(x => x.value === s)?.label ?? s; }

  statusColor(s: string): string {
    const map: Record<string, string> = {
      DRAFT: 'text-slate-400', SENT: 'text-blue-400', ACCEPTED: 'text-emerald-400',
      REJECTED: 'text-rose-400', EXPIRED: 'text-amber-400',
    };
    return map[s] || 'text-slate-400';
  }

  submit() {
    if (!this.form.code || !this.form.clientName) {
      this.error = 'Código y cliente son obligatorios.'; return;
    }
    this.error = null;
    this.recalc();
    if (this.editingId) {
      const idx = this.items.findIndex(i => i.id === this.editingId);
      if (idx >= 0) this.items[idx] = { ...this.form, id: this.editingId };
    } else {
      this.items.push({ ...this.form, id: crypto.randomUUID() });
    }
    this.cancel();
  }

  remove(id: string) { this.items = this.items.filter(i => i.id !== id); }
}
