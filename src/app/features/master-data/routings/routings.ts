import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoutingsService, Routing, RoutingStep, CreateRoutingDto, CreateRoutingStepDto } from './routings.service';

@Component({
  standalone: true,
  selector: 'app-routings',
  imports: [CommonModule, FormsModule],
  templateUrl: './routings.html',
})
export class RoutingsComponent implements OnInit {
  form: CreateRoutingDto = {
    code: '', name: '', productCode: '', version: '1.0', active: true,
  };

  stepForm: CreateRoutingStepDto = {
    seq: 1, operationCode: '', operationName: '', workCenterCode: '',
    setupMin: 0, cycleMin: 1, qtyPerCycle: 1, mandatory: true, notes: '',
  };

  items: Routing[] = [];
  selectedSteps: RoutingStep[] = [];
  editingId: string | null = null;
  selectedId: string | null = null;
  editingStepSeq: number | null = null;
  editingStepId: string | null = null;
  q = '';
  loading = false;
  error: string | null = null;

  constructor(private svc: RoutingsService, private cdr: ChangeDetectorRef) {}

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
    const t = this.q.trim().toLowerCase();
    if (!t) return this.items;
    return this.items.filter(x =>
      [x.code, x.name, x.productCode, x.version].some(v => v.toLowerCase().includes(t))
    );
  }

  get selectedRouting(): Routing | null {
    return this.items.find(r => r.id === this.selectedId) ?? null;
  }

  get totalCycleMin(): number {
    return this.selectedSteps.reduce((a, s) => a + s.cycleMin, 0);
  }

  selectRouting(id: string) {
    if (this.selectedId === id) {
      this.selectedId = null;
      this.selectedSteps = [];
      this.cancelStepEdit();
      return;
    }
    this.selectedId = id;
    this.cancelStepEdit();
    this.svc.getSteps(id).subscribe({
      next: steps => { this.selectedSteps = steps; this.cdr.detectChanges(); },
      error: err => { this.error = this.extractError(err); },
    });
  }

  submit() {
    if (!this.form.code || !this.form.productCode) return;
    this.loading = true;
    const obs = this.editingId
      ? this.svc.update(this.editingId, this.form)
      : this.svc.create(this.form);
    obs.subscribe({
      next: () => {
        this.load();
        this.editingId ? this.cancelEdit() : this.resetForm();
      },
      error: err => { this.error = this.extractError(err); this.loading = false; },
    });
  }

  edit(it: Routing) {
    this.editingId = it.id;
    this.form = { code: it.code, name: it.name, productCode: it.productCode, version: it.version, active: it.active };
  }

  remove(id: string) {
    if (!confirm('¿Eliminar esta ruta y todos sus pasos?')) return;
    this.svc.delete(id).subscribe({
      next: () => {
        if (this.selectedId === id) {
          this.selectedId = null;
          this.selectedSteps = [];
        }
        if (this.editingId === id) this.cancelEdit();
        this.load();
      },
      error: err => { this.error = this.extractError(err); },
    });
  }

  cancelEdit() { this.editingId = null; this.resetForm(); }

  resetForm() {
    this.form = { code: '', name: '', productCode: '', version: '1.0', active: true };
  }

  addStep() {
    if (!this.selectedId || !this.stepForm.operationCode) return;
    const stepId = this.editingStepId ?? (this.editingStepSeq !== null ? String(this.editingStepSeq) : null);
    const obs = stepId
      ? this.svc.updateStep(this.selectedId, stepId, this.stepForm)
      : this.svc.addStep(this.selectedId, this.stepForm);

    obs.subscribe({
      next: () => {
        this.cancelStepEdit();
        this.svc.getSteps(this.selectedId!).subscribe(steps => {
          this.selectedSteps = steps;
          this.cdr.detectChanges();
        });
      },
      error: err => { this.error = this.extractError(err); },
    });
  }

  editStep(s: RoutingStep) {
    this.editingStepSeq = s.seq;
    this.editingStepId = s.id ?? null;
    this.stepForm = {
      seq: s.seq,
      operationCode: s.operationCode,
      operationName: s.operationName,
      workCenterCode: s.workCenterCode,
      setupMin: s.setupMin,
      cycleMin: s.cycleMin,
      qtyPerCycle: s.qtyPerCycle,
      mandatory: s.mandatory,
      notes: s.notes,
    };
  }

  removeStep(seq: number) {
    if (!this.selectedId || !confirm('¿Eliminar este paso?')) return;
    const step = this.selectedSteps.find(s => s.seq === seq);
    if (!step) return;

    this.svc.deleteStep(this.selectedId, step.id ?? String(seq)).subscribe({
      next: () => {
        this.selectedSteps = this.selectedSteps.filter(s => s.seq !== seq);
        if (this.editingStepSeq === seq) this.cancelStepEdit();
        this.cdr.detectChanges();
      },
      error: err => { this.error = this.extractError(err); },
    });
  }

  moveStep(seq: number, dir: 1 | -1) {
    const steps = [...this.selectedSteps];
    const idx = steps.findIndex(s => s.seq === seq);
    const swapIdx = idx + dir;
    if (idx < 0 || swapIdx < 0 || swapIdx >= steps.length) return;
    [steps[idx], steps[swapIdx]] = [steps[swapIdx], steps[idx]];
    this.selectedSteps = steps.map((s, i) => ({ ...s, seq: i + 1 }));
  }

  cancelStepEdit() {
    this.editingStepSeq = null;
    this.editingStepId = null;
    this.resetStepForm();
  }

  resetStepForm(nextSeq?: number) {
    this.stepForm = {
      seq: nextSeq ?? (this.selectedSteps.length + 1),
      operationCode: '', operationName: '', workCenterCode: '',
      setupMin: 0, cycleMin: 1, qtyPerCycle: 1, mandatory: true, notes: '',
    };
  }

  private extractError(err: any): string {
    if (typeof err.error?.message === 'string') return err.error.message;
    if (Array.isArray(err.error?.message)) return err.error.message.join(', ');
    if (err.error?.error) return err.error.error;
    const map: Record<number, string> = { 400: 'Datos inválidos.', 409: 'Conflicto de datos.', 500: 'Error del servidor.' };
    return map[err.status] || err.message || 'Error desconocido';
  }
}

