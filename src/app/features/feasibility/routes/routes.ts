import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-feasibility-routes',
  imports: [CommonModule, FormsModule],
  templateUrl: './routes.html',
})
export class FeasibilityRoutesComponent implements OnInit {
  items: any[] = [];
  loading = false;
  q = '';
  showForm = false;
  editingId: string | null = null;
  error: string | null = null;
  form = this.emptyForm();

  emptyForm(): any {
    return {
      code: '', name: '', productType: '', description: '',
      steps: [] as any[], totalSetupMin: 0, totalCycleMin: 0,
      active: true,
    };
  }

  get filtered() {
    const s = this.q.toLowerCase();
    return this.items.filter(i =>
      i.code?.toLowerCase().includes(s) ||
      i.name?.toLowerCase().includes(s) ||
      i.productType?.toLowerCase().includes(s)
    );
  }

  ngOnInit() { this.load(); }
  load() { this.loading = true; setTimeout(() => { this.loading = false; }, 300); }
  openNew() { this.form = this.emptyForm(); this.editingId = null; this.showForm = true; }
  edit(item: any) { this.editingId = item.id; this.form = { ...item, steps: [...(item.steps || [])] }; this.showForm = true; }
  cancel() { this.showForm = false; this.editingId = null; this.error = null; }

  addStep() {
    this.form.steps.push({
      seq: this.form.steps.length + 1,
      operation: '', workCenter: '', machineCode: '',
      setupTimeMin: 0, cycleTimeSec: 0, notes: '',
    });
  }

  removeStep(i: number) {
    this.form.steps.splice(i, 1);
    this.form.steps.forEach((s: any, idx: number) => s.seq = idx + 1);
    this.recalc();
  }

  recalc() {
    this.form.totalSetupMin = this.form.steps.reduce((a: number, s: any) => a + (s.setupTimeMin || 0), 0);
    this.form.totalCycleMin = this.form.steps.reduce((a: number, s: any) => a + (s.cycleTimeSec || 0), 0) / 60;
  }

  submit() {
    if (!this.form.code || !this.form.name) {
      this.error = 'Código y nombre son obligatorios.'; return;
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
