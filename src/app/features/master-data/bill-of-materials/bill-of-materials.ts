import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BillOfMaterialsService, Bom, BomLine, CreateBomDto, CreateBomLineDto } from './bill-of-materials.service';

@Component({
  standalone: true,
  selector: 'app-bill-of-materials',
  imports: [CommonModule, FormsModule],
  templateUrl: './bill-of-materials.html',
})
export class BillOfMaterialsComponent implements OnInit {
  form: CreateBomDto = {
    code: '', productCode: '', productName: '',
    version: '1.0', baseQty: 1, baseUom: 'kg', validFrom: '', active: true,
  };

  lineForm: CreateBomLineDto = {
    materialCode: '', materialName: '', qty: 1, uom: 'kg',
    scrapPct: 0, phase: '', optional: false, notes: '',
  };

  items: Bom[] = [];
  selectedLines: BomLine[] = [];
  editingId: string | null = null;
  editingLineId: string | null = null;
  selectedId: string | null = null;
  q = '';
  loading = false;
  error: string | null = null;

  constructor(private svc: BillOfMaterialsService, private cdr: ChangeDetectorRef) {}

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
    return this.items.filter(x => [x.code, x.productCode, x.productName, x.version].some(v => v.toLowerCase().includes(t)));
  }

  get selectedBom(): Bom | null {
    return this.items.find(b => b.id === this.selectedId) ?? null;
  }

  get totalMaterialQty(): number {
    return this.selectedLines.reduce((a, l) => a + l.qty, 0);
  }

  selectBom(id: string) {
    if (this.selectedId === id) {
      this.selectedId = null;
      this.selectedLines = [];
      return;
    }

    this.selectedId = id;
    this.editingLineId = null;
    this.resetLineForm();
    this.svc.getLines(id).subscribe({
      next: lines => { this.selectedLines = lines; this.cdr.detectChanges(); },
      error: err => { this.error = this.extractError(err); },
    });
  }

  submit() {
    if (!this.form.code || !this.form.productCode) return;
    this.loading = true;
    const obs = this.editingId ? this.svc.update(this.editingId, this.form) : this.svc.create(this.form);
    obs.subscribe({
      next: bom => {
        this.load();
        if (!this.editingId) this.selectedId = bom.id;
        this.editingId ? this.cancelEdit() : this.resetForm();
      },
      error: err => { this.error = this.extractError(err); this.loading = false; },
    });
  }

  edit(it: Bom) {
    this.editingId = it.id;
    this.form = { code: it.code, productCode: it.productCode, productName: it.productName, version: it.version, baseQty: it.baseQty, baseUom: it.baseUom, validFrom: it.validFrom, active: it.active };
  }

  remove(id: string) {
    if (!confirm('¿Eliminar esta BOM y sus líneas?')) return;
    this.svc.delete(id).subscribe({
      next: () => {
        if (this.editingId === id) this.cancelEdit();
        if (this.selectedId === id) {
          this.selectedId = null;
          this.selectedLines = [];
        }
        this.load();
      },
      error: err => { this.error = this.extractError(err); },
    });
  }

  cancelEdit() { this.editingId = null; this.resetForm(); }

  resetForm() {
    this.form = { code: '', productCode: '', productName: '', version: '1.0', baseQty: 1, baseUom: 'kg', validFrom: '', active: true };
  }

  addLine() {
    if (!this.selectedId || !this.lineForm.materialCode) return;
    const obs = this.editingLineId
      ? this.svc.updateLine(this.selectedId, this.editingLineId, this.lineForm)
      : this.svc.addLine(this.selectedId, this.lineForm);

    obs.subscribe({
      next: () => {
        this.editingLineId = null;
        this.svc.getLines(this.selectedId!).subscribe(lines => { this.selectedLines = lines; this.cdr.detectChanges(); });
        this.resetLineForm();
      },
      error: err => { this.error = this.extractError(err); },
    });
  }

  editLine(l: BomLine) {
    if (!l.id) return;
    this.editingLineId = l.id;
    this.lineForm = { materialCode: l.materialCode, materialName: l.materialName, qty: l.qty, uom: l.uom, scrapPct: l.scrapPct, phase: l.phase, optional: l.optional, notes: l.notes };
  }

  removeLine(id?: string) {
    if (!id || !this.selectedId || !confirm('¿Eliminar esta línea?')) return;
    this.svc.deleteLine(this.selectedId, id).subscribe({
      next: () => {
        this.selectedLines = this.selectedLines.filter(l => l.id !== id);
        if (this.editingLineId === id) {
          this.editingLineId = null;
          this.resetLineForm();
        }
        this.cdr.detectChanges();
      },
      error: err => { this.error = this.extractError(err); },
    });
  }

  cancelLineEdit() { this.editingLineId = null; this.resetLineForm(); }

  resetLineForm() {
    this.lineForm = { materialCode: '', materialName: '', qty: 1, uom: 'kg', scrapPct: 0, phase: '', optional: false, notes: '' };
  }

  private extractError(err: any): string {
    if (typeof err.error?.message === 'string') return err.error.message;
    if (Array.isArray(err.error?.message)) return err.error.message.join(', ');
    if (err.error?.error) return err.error.error;
    return err.message || 'Error desconocido';
  }
}
