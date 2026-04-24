import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScrapReasonsService, ScrapReason, ScrapClass, CreateScrapReasonDto } from './scrap-reasons.service';

@Component({
  standalone: true,
  selector: 'app-scrap-reasons',
  imports: [CommonModule, FormsModule],
  templateUrl: './scrap-reasons.html',
})
export class ScrapReasonsComponent implements OnInit {
  form: CreateScrapReasonDto = {
    code: '', name: '', classification: 'PROCESS',
    description: '', affectsEfficiency: true, reportable: true, active: true,
  };

  items: ScrapReason[] = [];
  editingId: string | null = null;
  filterClass: ScrapClass | '' = '';
  q = '';
  loading = false;
  error: string | null = null;

  readonly classes: { value: ScrapClass; label: string; cls: string; icon: string }[] = [
    { value: 'PROCESS', label: 'Proceso', cls: 'bg-blue-500/10 text-blue-300 border border-blue-500/30', icon: 'pi-cog' },
    { value: 'MACHINE', label: 'Máquina', cls: 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30', icon: 'pi-server' },
    { value: 'MATERIAL', label: 'Material', cls: 'bg-amber-500/10 text-amber-300 border border-amber-500/30', icon: 'pi-box' },
    { value: 'OPERATOR', label: 'Operario', cls: 'bg-purple-500/10 text-purple-300 border border-purple-500/30', icon: 'pi-user' },
    { value: 'DESIGN', label: 'Diseño', cls: 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30', icon: 'pi-pencil' },
    { value: 'OTHER', label: 'Otro', cls: 'bg-slate-500/15 text-slate-300 border border-slate-500/30', icon: 'pi-question-circle' },
  ];

  constructor(private svc: ScrapReasonsService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.error = null;
    this.svc.getAll().subscribe({
      next: data => { this.items = data; this.loading = false; this.cdr.detectChanges(); },
      error: err => { this.error = this.extractError(err); this.loading = false; this.cdr.detectChanges(); },
    });
  }

  get filtered() {
    let list = this.items;
    if (this.filterClass) list = list.filter(x => x.classification === this.filterClass);
    const t = this.q.trim().toLowerCase();
    if (t) list = list.filter(x => [x.code, x.name, x.description].some(v => v.toLowerCase().includes(t)));
    return list;
  }

  classCls(c: ScrapClass): string { return this.classes.find(x => x.value === c)?.cls ?? ''; }
  classLabel(c: ScrapClass): string { return this.classes.find(x => x.value === c)?.label ?? c; }
  countByClass(c: ScrapClass): number { return this.items.filter(x => x.classification === c).length; }

  submit() {
    if (!this.form.code || !this.form.name) return;
    this.loading = true;
    const obs = this.editingId ? this.svc.update(this.editingId, this.form) : this.svc.create(this.form);
    obs.subscribe({
      next: () => { this.load(); this.editingId ? this.cancelEdit() : this.resetForm(); },
      error: err => { this.error = this.extractError(err); this.loading = false; },
    });
  }

  edit(it: ScrapReason) {
    this.editingId = it.id;
    this.form = { code: it.code, name: it.name, classification: it.classification, description: it.description, affectsEfficiency: it.affectsEfficiency, reportable: it.reportable, active: it.active };
  }

  remove(id: string) {
    if (!confirm('¿Eliminar este motivo de merma?')) return;
    this.svc.delete(id).subscribe({
      next: () => { this.load(); if (this.editingId === id) this.cancelEdit(); },
      error: err => { this.error = this.extractError(err); },
    });
  }

  cancelEdit() { this.editingId = null; this.resetForm(); }

  resetForm() {
    this.form = { code: '', name: '', classification: 'PROCESS', description: '', affectsEfficiency: true, reportable: true, active: true };
  }

  private extractError(err: any): string {
    if (typeof err.error?.message === 'string') return err.error.message;
    if (Array.isArray(err.error?.message)) return err.error.message.join(', ');
    if (err.error?.error) return err.error.error;
    return err.message || 'Error desconocido';
  }
}
