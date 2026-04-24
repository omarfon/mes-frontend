import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-feasibility-capacity',
  imports: [CommonModule, FormsModule],
  templateUrl: './capacity.html',
})
export class FeasibilityCapacityComponent implements OnInit {
  items: any[] = [];
  loading = false;
  q = '';
  filterArea = '';
  showForm = false;
  editingId: string | null = null;
  error: string | null = null;
  form = this.emptyForm();

  emptyForm() {
    return {
      machineCode: '', machineName: '', area: '', workCenter: '',
      availableHoursDay: 8, shiftsPerDay: 1, daysPerWeek: 5,
      capacityUnitsHour: null as number | null, capacityUnit: '',
      utilization: 85, plannedDowntime: 10, efficiency: 90,
      weeklyCapacity: 0, monthlyCapacity: 0, notes: '',
    };
  }

  get areas(): string[] {
    return [...new Set(this.items.map((i: any) => i.area).filter(Boolean))];
  }

  get filtered() {
    const s = this.q.toLowerCase();
    return this.items.filter(i =>
      (!this.filterArea || i.area === this.filterArea) &&
      (i.machineCode?.toLowerCase().includes(s) ||
       i.machineName?.toLowerCase().includes(s) ||
       i.workCenter?.toLowerCase().includes(s))
    );
  }

  ngOnInit() { this.load(); }
  load() { this.loading = true; setTimeout(() => { this.loading = false; }, 300); }

  openNew() { this.form = this.emptyForm(); this.editingId = null; this.showForm = true; }
  edit(item: any) { this.editingId = item.id; this.form = { ...item }; this.showForm = true; }
  cancel() { this.showForm = false; this.editingId = null; this.error = null; }

  recalc() {
    const hrsDay = (this.form.availableHoursDay || 0) * (this.form.shiftsPerDay || 1);
    const eff = (this.form.efficiency || 100) / 100;
    const util = (this.form.utilization || 100) / 100;
    const realHrs = hrsDay * eff * util;
    const uph = this.form.capacityUnitsHour || 0;
    this.form.weeklyCapacity = Math.round(realHrs * uph * (this.form.daysPerWeek || 5));
    this.form.monthlyCapacity = Math.round(this.form.weeklyCapacity * 4.33);
  }

  submit() {
    if (!this.form.machineCode || !this.form.machineName) {
      this.error = 'Código y nombre de máquina son obligatorios.'; return;
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
