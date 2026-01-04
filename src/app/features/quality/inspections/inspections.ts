import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QualityStoreService } from '../services/quality-store.service';
import { Inspection, CreateInspectionDto, UpdateInspectionDto, InspectionType, InspectionResult } from '../../../shared/models/quality.model';
import { Observable, map } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-inspections',
  imports: [CommonModule, FormsModule],
  templateUrl: './inspections.html',
})
export class InspectionsComponent {
  q = '';
  editing: Inspection | null = null;
  loading = false;
  error: string | null = null;

  // Enums para el template
  InspectionType = InspectionType;
  InspectionResult = InspectionResult;

  form: Partial<CreateInspectionDto> = {
    code: '',
    type: InspectionType.INCOMING,
    result: InspectionResult.PENDING,
    productId: '',
    productionOrderId: '',
    lotId: '',
    quantityInspected: 0,
    quantityApproved: 0,
    quantityRejected: 0,
    inspectorId: '',
    inspectionDate: new Date(),
    observations: '',
    corrective_actions: '',
  };

  // Observables reactivos
  inspections$!: Observable<Inspection[]>;
  list$!: Observable<Inspection[]>;

  constructor(public qs: QualityStoreService) {
    this.inspections$ = this.qs.inspections$;
    
    this.list$ = this.inspections$.pipe(
      map(inspections => {
        const t = this.q.trim().toLowerCase();
        return inspections.filter(i => {
          if (!t) return true;
          return [
            i.code,
            i.type,
            i.result,
            i.observations ?? '',
            i.inspectorId
          ].join(' ').toLowerCase().includes(t);
        });
      })
    );
  }

  get inspectionTypes() {
    return Object.values(InspectionType);
  }

  get inspectionResults() {
    return Object.values(InspectionResult);
  }

  filterList() {
    this.list$ = this.inspections$.pipe(
      map(inspections => {
        const t = this.q.trim().toLowerCase();
        return inspections.filter(i => {
          if (!t) return true;
          return [
            i.code,
            i.type,
            i.result,
            i.observations ?? '',
            i.inspectorId
          ].join(' ').toLowerCase().includes(t);
        });
      })
    );
  }

  new() {
    this.editing = null;
    this.error = null;
    this.form = {
      code: '',
      type: InspectionType.INCOMING,
      result: InspectionResult.PENDING,
      productId: '',
      productionOrderId: '',
      lotId: '',
      quantityInspected: 0,
      quantityApproved: 0,
      quantityRejected: 0,
      inspectorId: '',
      inspectionDate: new Date(),
      observations: '',
      corrective_actions: '',
    };
  }

  edit(i: Inspection) {
    this.editing = i;
    this.error = null;
    this.form = {
      code: i.code,
      type: i.type,
      result: i.result,
      productId: i.productId,
      productionOrderId: i.productionOrderId,
      lotId: i.lotId,
      quantityInspected: i.quantityInspected,
      quantityApproved: i.quantityApproved,
      quantityRejected: i.quantityRejected,
      inspectorId: i.inspectorId,
      inspectionDate: new Date(i.inspectionDate),
      observations: i.observations,
      corrective_actions: i.corrective_actions,
    };
  }

  formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  getResultClass(result: InspectionResult): string {
    switch (result) {
      case InspectionResult.APPROVED:
        return 'ui-badge-ok';
      case InspectionResult.REJECTED:
        return 'ui-badge-bad';
      case InspectionResult.CONDITIONAL:
        return 'ui-badge-warn';
      default:
        return 'ui-badge';
    }
  }

  save() {
    if (!this.form.code || !this.form.type || !this.form.inspectorId || !this.form.inspectionDate) {
      this.error = 'Por favor complete los campos requeridos';
      return;
    }

    this.loading = true;
    this.error = null;

    if (!this.editing) {
      const dto: CreateInspectionDto = {
        code: this.form.code!,
        type: this.form.type!,
        result: this.form.result,
        productId: this.form.productId,
        productionOrderId: this.form.productionOrderId,
        lotId: this.form.lotId,
        quantityInspected: this.form.quantityInspected,
        quantityApproved: this.form.quantityApproved,
        quantityRejected: this.form.quantityRejected,
        inspectorId: this.form.inspectorId!,
        inspectionDate: this.form.inspectionDate!,
        observations: this.form.observations,
        corrective_actions: this.form.corrective_actions,
      };

      this.qs.createInspection(dto).subscribe({
        next: () => {
          this.loading = false;
          this.new();
          console.log('✅ Inspección creada');
        },
        error: (err: any) => {
          this.loading = false;
          this.error = err.error?.message || 'Error al crear inspección';
          console.error('❌ Error creando inspección:', err);
        }
      });
    } else {
      const dto: UpdateInspectionDto = {
        code: this.form.code,
        type: this.form.type,
        result: this.form.result,
        productId: this.form.productId,
        productionOrderId: this.form.productionOrderId,
        lotId: this.form.lotId,
        quantityInspected: this.form.quantityInspected,
        quantityApproved: this.form.quantityApproved,
        quantityRejected: this.form.quantityRejected,
        inspectorId: this.form.inspectorId,
        inspectionDate: this.form.inspectionDate,
        observations: this.form.observations,
        corrective_actions: this.form.corrective_actions,
      };

      this.qs.updateInspection(this.editing.id, dto).subscribe({
        next: () => {
          this.loading = false;
          this.new();
          console.log('✅ Inspección actualizada');
        },
        error: (err: any) => {
          this.loading = false;
          this.error = err.error?.message || 'Error al actualizar inspección';
          console.error('❌ Error actualizando inspección:', err);
        }
      });
    }
  }

  delete(i: Inspection) {
    if (!confirm(`¿Eliminar inspección ${i.code}?`)) return;
    this.loading = true;
    this.error = null;

    this.qs.deleteInspection(i.id).subscribe({
      next: () => {
        this.loading = false;
        console.log('✅ Inspección eliminada');
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.message || 'Error al eliminar inspección';
        console.error('❌ Error eliminando inspección:', err);
      }
    });
  }
}
