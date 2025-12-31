import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdenesService, Orden, EstadoOrden, PrioridadOrden, CreateOrdenDto } from './orders.service';

@Component({
  standalone: true,
  selector: 'app-orders',
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.html',
})
export class OrdersComponent implements OnInit {
  form = {
    numeroOrden: '',
    productoId: '',
    productoCodigo: '',
    productoNombre: '',
    cantidadPlanificada: 0,
    unidadMedida: 'UND',
    estado: EstadoOrden.PENDIENTE,
    prioridad: PrioridadOrden.NORMAL,
    fechaInicioPlanificada: '',
    fechaFinPlanificada: '',
    lote: '',
    cliente: '',
    pedidoCliente: '',
    notas: '',
  };

  items: Orden[] = [];
  editingId: string | null = null;
  q = '';
  loading = false;
  error: string | null = null;

  // Exponer enums para el template
  estados = Object.values(EstadoOrden);
  prioridades = Object.values(PrioridadOrden);

  constructor(
    private ordenesService: OrdenesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadOrdenes();
  }

  loadOrdenes() {
    this.loading = true;
    this.error = null;
    
    this.ordenesService.getAll().subscribe({
      next: (data) => {
        console.log('✅ Ordenes loaded:', data);
        this.items = data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error loading ordenes:', err);
        this.error = 'No se pudieron cargar las órdenes.';
        this.loading = false;
        this.items = [];
        this.cdr.detectChanges();
      }
    });
  }

  get filtered() {
    const t = this.q.trim().toLowerCase();
    if (!t) return this.items || [];
    
    return (this.items || []).filter(x =>
      [x.numeroOrden, x.productoCodigo, x.productoNombre, x.estado, x.cliente, x.lote]
        .some(v => String(v || '').toLowerCase().includes(t))
    );
  }

  submit() {
    if (!this.form.numeroOrden) {
      this.error = 'Número de orden es requerido';
      return;
    }

    if (!this.form.productoId && !this.form.productoCodigo) {
      this.error = 'Debe proporcionar Producto ID o Código de Producto';
      return;
    }

    this.loading = true;
    this.error = null;

    const dto: CreateOrdenDto = {
      numeroOrden: this.form.numeroOrden,
      productoId: this.form.productoId || undefined,
      productoCodigo: this.form.productoCodigo || undefined,
      productoNombre: this.form.productoNombre || undefined,
      cantidadPlanificada: this.form.cantidadPlanificada,
      unidadMedida: this.form.unidadMedida,
      estado: this.form.estado || undefined,
      prioridad: this.form.prioridad || undefined,
      fechaInicioPlanificada: this.form.fechaInicioPlanificada || undefined,
      fechaFinPlanificada: this.form.fechaFinPlanificada || undefined,
      lote: this.form.lote || undefined,
      cliente: this.form.cliente || undefined,
      pedidoCliente: this.form.pedidoCliente || undefined,
      notas: this.form.notas || undefined,
    };

    if (this.editingId) {
      this.ordenesService.update(this.editingId, dto).subscribe({
        next: (updated) => {
          console.log('Orden updated:', updated);
          this.q = '';
          this.loadOrdenes();
          this.cancelEdit();
        },
        error: (err) => {
          console.error('Error updating:', err);
          this.error = this.extractErrorMessage(err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.ordenesService.create(dto).subscribe({
        next: (created) => {
          console.log('Orden created:', created);
          this.q = '';
          this.loadOrdenes();
          this.resetForm();
        },
        error: (err) => {
          console.error('Error creating:', err);
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
      case 409:
        return 'Ya existe una orden con este número.';
      case 422:
        return 'Error de validación: ' + (err.error?.message || 'Verifica los datos ingresados');
      case 500:
        return 'Error del servidor. Intenta nuevamente.';
      default:
        return err.message || 'Error desconocido';
    }
  }

  edit(item: Orden) {
    this.editingId = item.id;
    this.form = {
      numeroOrden: item.numeroOrden,
      productoId: item.productoId,
      productoCodigo: item.productoCodigo || '',
      productoNombre: item.productoNombre || '',
      cantidadPlanificada: item.cantidadPlanificada,
      unidadMedida: item.unidadMedida,
      estado: item.estado,
      prioridad: item.prioridad || PrioridadOrden.NORMAL,
      fechaInicioPlanificada: item.fechaInicioPlanificada || '',
      fechaFinPlanificada: item.fechaFinPlanificada || '',
      lote: item.lote || '',
      cliente: item.cliente || '',
      pedidoCliente: item.pedidoCliente || '',
      notas: item.notas || '',
    };
    this.error = null;
    this.cdr.detectChanges();
  }

  remove(id: string) {
    if (!confirm('¿Eliminar esta orden?')) return;

    this.loading = true;
    this.ordenesService.delete(id).subscribe({
      next: () => {
        console.log('Orden deleted');
        this.loadOrdenes();
      },
      error: (err) => {
        console.error('Error deleting:', err);
        this.error = this.extractErrorMessage(err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancelEdit() {
    this.editingId = null;
    this.resetForm();
  }

  resetForm() {
    this.form = {
      numeroOrden: '',
      productoId: '',
      productoCodigo: '',
      productoNombre: '',
      cantidadPlanificada: 0,
      unidadMedida: 'UND',
      estado: EstadoOrden.PENDIENTE,
      prioridad: PrioridadOrden.NORMAL,
      fechaInicioPlanificada: '',
      fechaFinPlanificada: '',
      lote: '',
      cliente: '',
      pedidoCliente: '',
      notas: '',
    };
    this.error = null;
    this.loading = false;
    this.cdr.detectChanges();
  }

  badgeClass(estado: EstadoOrden) {
    switch (estado) {
      case EstadoOrden.LIBERADA: return 'ui-badge-warn';
      case EstadoOrden.EN_PROCESO: return 'ui-badge';
      case EstadoOrden.COMPLETADA: return 'ui-badge-ok';
      case EstadoOrden.CANCELADA: return 'ui-badge-bad';
      case EstadoOrden.PAUSADA: return 'ui-badge-warn';
      default: return 'ui-badge';
    }
  }

  prioridadClass(prioridad?: PrioridadOrden) {
    switch (prioridad) {
      case PrioridadOrden.URGENTE: return 'text-red-600 font-bold';
      case PrioridadOrden.ALTA: return 'text-orange-600 font-semibold';
      case PrioridadOrden.NORMAL: return 'text-slate-600';
      case PrioridadOrden.BAJA: return 'text-slate-400';
      default: return 'text-slate-600';
    }
  }
}
