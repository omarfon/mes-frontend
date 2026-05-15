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
  formPanelOpen = false;
  loading = false;
  error: string | null = null;

  // Enums para el template
  InspectionType = InspectionType;
  InspectionResult = InspectionResult;

  form: Partial<CreateInspectionDto> = {
    code: '',
    nodeId: '',
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
            i.node?.code || '',
            i.type,
            i.status,
            i.notes ?? '',
            i.nodeId,
            i.inspectorId ?? ''
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
            i.node?.code || '',
            i.type,
            i.status,
            i.notes ?? '',
            i.nodeId,
            i.inspectorId ?? ''
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

  openCreatePanel() {
    this.new();
    this.formPanelOpen = true;
  }

  closeFormPanel() {
    this.formPanelOpen = false;
  }

  edit(i: Inspection) {
    this.editing = i;
    this.formPanelOpen = true;
    this.error = null;
    this.form = {
      code: i.node?.code || i.nodeId,
      nodeId: i.nodeId,
      type: i.type,
      result: i.status as any,
      productId: i.productId || i.node?.productId || undefined,
      productionOrderId: i.productionOrderId || i.node?.productionOrderId || undefined,
      lotId: i.lotId || i.nodeId,
      quantityInspected: typeof i.inspectedQuantity === 'string' ? parseFloat(i.inspectedQuantity) : i.inspectedQuantity,
      quantityApproved: i.quantityApproved,
      quantityRejected: i.quantityRejected,
      inspectorId: i.inspectorId ?? '',
      inspectionDate: i.inspectionDate ? new Date(i.inspectionDate) : new Date(i.createdAt),
      observations: i.notes || i.observations,
      corrective_actions: i.corrective_actions,
    };
  }

  formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  getResultClass(status: InspectionResult): string {
    switch (status) {
      case InspectionResult.PASSED:
      case 'APPROVED' as any:
        return 'ui-badge-ok';
      case InspectionResult.FAILED:
      case 'REJECTED' as any:
        return 'ui-badge-bad';
      case InspectionResult.PENDING:
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
        nodeId: (this.form as any).nodeId,
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
          this.formPanelOpen = false;
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
        nodeId: (this.form as any).nodeId,
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
          this.formPanelOpen = false;
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
