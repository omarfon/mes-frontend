import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { GenealogyService, LotGenealogy, CreateLotGenealogyDto, RelationType } from './genealogy.service';
import { LotsService } from '../lots/lots.service';
import { environment } from '../../../../environmets/environments';

@Component({
  standalone: true,
  selector: 'app-genealogy',
  imports: [CommonModule, FormsModule],
  templateUrl: './genealogy.html',
})
export class GenealogyComponent implements OnInit {
  form: CreateLotGenealogyDto = {
    parentLotId: '',
    childLotId: '',
    relationType: RelationType.PARENT,
    quantity: 0,
    unitOfMeasure: 'KG',
    notes: '',
    workOrderId: '',
  };

  items: LotGenealogy[] = [];
  editingId: string | null = null;
  formPanelOpen = false;
  q = '';
  loading = false;
  error: string | null = null;

  // Listas para selects
  lots: any[] = [];
  workOrders: any[] = [];

  // Enum para template
  RelationType = RelationType;
  relationTypes = Object.values(RelationType);

  constructor(
    private genealogyService: GenealogyService,
    private lotsService: LotsService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadGenealogy();
    this.loadLots();
    this.loadWorkOrders();
  }

  loadGenealogy() {
    this.loading = true;
    this.genealogyService.getAll().subscribe({
      next: (data) => {
        this.items = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando genealogía:', err);
        this.error = this.extractErrorMessage(err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadLots() {
    this.lotsService.getAll().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.lots = data;
          console.log('✅ Lotes cargados desde backend:', data.length);
        } else {
          console.log('ℹ️ Backend sin datos, usando lotes de demostración');
          this.lots = [
            { id: '2bc417bc-95ec-4363-8269-f45bd765845c', lotNumber: 'LOT-MP-001', productName: 'Hilo 29/1' },
            { id: 'e084523e-4fdf-49f6-8096-c034b1d99803', lotNumber: 'LOT-MP-002', productName: 'Hilo 29/1' },
            { id: '155cf115-a15c-4313-8ba6-6917c518374c', lotNumber: 'LOT-WIP-001', productName: 'Hilo 29/1' },
            { id: '5f9931e8-7c1d-41a3-a49d-fc858cc1bba5', lotNumber: 'LOT-WIP-002', productName: 'Hilo 29/1' },
            { id: '3542f685-be36-4223-a907-a215cbbfff35', lotNumber: 'LOT-PT-001', productName: 'Hilo 29/1' },
            { id: '2319c4e7-8206-418b-a345-5fd6380ddcfd', lotNumber: 'LOT-PT-002', productName: 'Hilo 29/1' },
          ];
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('ℹ️ Error al cargar lotes, usando datos de demostración');
        setTimeout(() => {
          this.lots = [
            { id: '2bc417bc-95ec-4363-8269-f45bd765845c', lotNumber: 'LOT-MP-001', productName: 'Hilo 29/1' },
            { id: 'e084523e-4fdf-49f6-8096-c034b1d99803', lotNumber: 'LOT-MP-002', productName: 'Hilo 29/1' },
            { id: '155cf115-a15c-4313-8ba6-6917c518374c', lotNumber: 'LOT-WIP-001', productName: 'Hilo 29/1' },
            { id: '5f9931e8-7c1d-41a3-a49d-fc858cc1bba5', lotNumber: 'LOT-WIP-002', productName: 'Hilo 29/1' },
            { id: '3542f685-be36-4223-a907-a215cbbfff35', lotNumber: 'LOT-PT-001', productName: 'Hilo 29/1' },
            { id: '2319c4e7-8206-418b-a345-5fd6380ddcfd', lotNumber: 'LOT-PT-002', productName: 'Hilo 29/1' },
          ];
          this.cdr.detectChanges();
        }, 0);
      }
    });
  }

  loadWorkOrders() {
    this.http.get<any>(`${environment.apiUrl}/production/ordenes`).subscribe({
      next: (response) => {
        this.workOrders = response.data || response || [];
        console.log('✅ Órdenes cargadas desde backend:', this.workOrders.length);
      },
      error: (err) => {
        console.log('ℹ️ Usando órdenes de demostración (endpoint temporal)');
        // Mock temporal
        setTimeout(() => {
          this.workOrders = [
            { id: '21529a43-8529-4c0f-8b2f-8f73343d20ed', numeroOrden: 'OP-2024-001', productoNombre: 'Producto A' },
            { id: '32639b54-9639-5d1f-9c3f-9f84454e31fe', numeroOrden: 'OP-2024-002', productoNombre: 'Producto B' },
            { id: '43749c65-a749-6e2f-ad4f-af95565f42gf', numeroOrden: 'OP-2024-003', productoNombre: 'Producto C' },
          ];
          this.cdr.detectChanges();
        }, 0);
      }
    });
  }

  get filtered() {
    const t = this.q.trim().toLowerCase();
    if (!t) return this.items || [];
    
    return (this.items || []).filter(x =>
      [x.parentLotId, x.childLotId, x.relationType, x.notes]
        .some(v => String(v || '').toLowerCase().includes(t))
    );
  }

  submit() {
    if (!this.form.parentLotId || !this.form.childLotId || !this.form.relationType) {
      this.error = 'Lote padre, lote hijo y tipo de relación son requeridos';
      return;
    }

    this.loading = true;
    this.error = null;

    const dto: any = {
      parentLotId: this.form.parentLotId,
      childLotId: this.form.childLotId,
      relationType: this.form.relationType,
      quantity: Number(this.form.quantity),
    };

    // Agregar campos opcionales
    if (this.form.unitOfMeasure) dto.unitOfMeasure = this.form.unitOfMeasure;
    if (this.form.notes) dto.notes = this.form.notes;
    if (this.form.workOrderId) dto.workOrderId = this.form.workOrderId;

    console.log('📤 Enviando genealogía:', JSON.stringify(dto, null, 2));

    if (this.editingId) {
      this.genealogyService.update(this.editingId, dto).subscribe({
        next: (updated) => {
          console.log('Genealogía actualizada:', updated);
          this.q = '';
          this.loadGenealogy();
          this.cancelEdit();
        },
        error: (err) => {
          console.error('❌ Error actualizando:', err);
          console.error('📋 Error details:', err.error);
          this.error = this.extractErrorMessage(err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.genealogyService.create(dto).subscribe({
        next: (created) => {
          console.log('Genealogía creada:', created);
          this.q = '';
          this.loadGenealogy();
          this.resetForm();
          this.formPanelOpen = false;
        },
        error: (err) => {
          console.error('❌ Error creando:', err);
          console.error('📋 Error details:', err.error);
          this.error = this.extractErrorMessage(err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  private extractErrorMessage(err: any): string {
    if (typeof err.error?.message === 'string') {
      return err.error.message;
    }
    
    if (Array.isArray(err.error?.message)) {
      return err.error.message.join(', ');
    }
    
    if (err.error?.error) {
      return err.error.error;
    }
    
    switch (err.status) {
      case 400:
        return 'Datos inválidos. Verifica el formulario.';
      case 404:
        return '⚠️ Endpoint no implementado en el backend. El frontend está listo, esperando implementación de /api/traceability/lot-genealogy';
      case 422:
        return 'Error de validación: ' + (err.error?.message || 'Verifica los datos ingresados');
      case 500:
        return 'Error del servidor. Intenta nuevamente.';
      default:
        return err.message || 'Error desconocido';
    }
  }

  edit(item: LotGenealogy) {
    this.formPanelOpen = true;
    this.editingId = item.id;
    this.form = {
      parentLotId: item.parentLotId,
      childLotId: item.childLotId,
      relationType: item.relationType,
      quantity: item.quantity,
      unitOfMeasure: item.unitOfMeasure || 'KG',
      notes: item.notes || '',
      workOrderId: item.workOrderId || '',
    };
    this.error = null;
    this.cdr.detectChanges();
  }

  remove(id: string) {
    if (!confirm('¿Eliminar esta relación de genealogía?')) return;

    this.loading = true;
    this.genealogyService.delete(id).subscribe({
      next: () => {
        console.log('Genealogía eliminada');
        this.loadGenealogy();
      },
      error: (err) => {
        console.error('Error eliminando:', err);
        this.error = this.extractErrorMessage(err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancelEdit() {
    this.editingId = null;
    this.resetForm();
    this.formPanelOpen = false;
  }

  openCreatePanel() {
    this.editingId = null;
    this.resetForm();
    this.formPanelOpen = true;
  }

  resetForm() {
    this.form = {
      parentLotId: '',
      childLotId: '',
      relationType: RelationType.PARENT,
      quantity: 0,
      unitOfMeasure: 'KG',
      notes: '',
      workOrderId: '',
    };
    this.error = null;
    this.loading = false;
    this.cdr.detectChanges();
  }

  getLotInfo(lotId: string): string {
    const lot = this.lots.find(l => l.id === lotId);
    return lot ? `${lot.lotNumber || lot.code || lot.numero}` : lotId.slice(0, 8) + '...';
  }

  getWorkOrderInfo(orderId: string): string {
    if (!orderId) return '-';
    const order = this.workOrders.find(o => o.id === orderId);
    return order ? `${order.numeroOrden}` : orderId.slice(0, 8) + '...';
  }

  getRelationTypeLabel(type: RelationType): string {
    const labels: Record<RelationType, string> = {
      [RelationType.PARENT]: 'Padre',
      [RelationType.CHILD]: 'Hijo',
      [RelationType.COMPONENT]: 'Componente',
      [RelationType.CONSUMED]: 'Consumido',
      [RelationType.PRODUCED]: 'Producido',
      [RelationType.SIBLING]: 'Hermano',
    };
    return labels[type] || type;
  }
}
