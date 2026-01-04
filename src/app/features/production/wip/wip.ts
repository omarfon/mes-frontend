import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WIPService, WIP, CreateWIPDto } from './wip.service';
import { OrdenesService } from '../orders/orders.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environmets/environments';

@Component({
  standalone: true,
  selector: 'app-wip',
  imports: [CommonModule, FormsModule],
  templateUrl: './wip.html',
})
export class WipComponent implements OnInit {
  form = {
    ordenId: '',
    productoId: '',
    productoNombre: '',
    workCenterId: '',
    workCenterNombre: '',
    cantidadActual: 0,
    unidadMedida: 'KG',
    lote: '',
    ubicacion: '',
    fechaEntrada: '',
    movimientos: '[]', // JSON string
  };

  items: WIP[] = [];
  editingId: string | null = null;
  q = '';
  loading = false;
  error: string | null = null;

  // Listas para selects
  ordenes: any[] = [];
  productos: any[] = [];

  constructor(
    private wipService: WIPService,
    private ordenesService: OrdenesService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadWIP();
    this.loadOrdenes();
    this.loadProductos();
  }

  loadWIP() {
    this.loading = true;
    this.error = null;
    
    this.wipService.getAll().subscribe({
      next: (data) => {
        console.log('✅ WIP loaded:', data);
        this.items = data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error loading WIP:', err);
        this.error = 'No se pudieron cargar los registros de WIP.';
        this.loading = false;
        this.items = [];
        this.cdr.detectChanges();
      }
    });
  }

  loadOrdenes() {
    this.ordenesService.getAll().subscribe({
      next: (data) => {
        this.ordenes = data || [];
      },
      error: (err) => console.error('Error cargando órdenes:', err)
    });
  }

  loadProductos() {
    this.http.get<any>(`${environment.apiUrl}/master-data/products`).subscribe({
      next: (response) => {
        this.productos = response.data || response || [];
      },
      error: (err) => console.error('Error cargando productos:', err)
    });
  }

  get filtered() {
    const t = this.q.trim().toLowerCase();
    if (!t) return this.items || [];
    
    return (this.items || []).filter(x =>
      [x.ordenId, x.productoNombre, x.lote, x.ubicacion, x.unidadMedida]
        .some(v => String(v || '').toLowerCase().includes(t))
    );
  }

  submit() {
    if (!this.form.ordenId || !this.form.productoId || !this.form.productoNombre || !this.form.unidadMedida || !this.form.fechaEntrada) {
      this.error = 'Orden, producto, nombre de producto, unidad de medida y fecha de entrada son requeridos';
      return;
    }

    // Parsear movimientos JSON
    let movimientosObj: any = null;
    try {
      if (this.form.movimientos && this.form.movimientos.trim()) {
        movimientosObj = JSON.parse(this.form.movimientos);
      }
    } catch (e) {
      this.error = 'Movimientos debe ser un JSON válido. Ejemplo: [{"fecha":"2025-12-31","cantidad":50,"tipo":"entrada"}]';
      return;
    }

    this.loading = true;
    this.error = null;

    const dto: any = {
      ordenId: this.form.ordenId,
      productoId: this.form.productoId,
      productoNombre: this.form.productoNombre,
      cantidadActual: Number(this.form.cantidadActual),
      unidadMedida: this.form.unidadMedida,
      fechaEntrada: this.form.fechaEntrada,
    };

    // Agregar campos opcionales
    if (this.form.workCenterId) dto.workCenterId = this.form.workCenterId;
    if (this.form.workCenterNombre) dto.workCenterNombre = this.form.workCenterNombre;
    if (this.form.lote) dto.lote = this.form.lote;
    if (this.form.ubicacion) dto.ubicacion = this.form.ubicacion;
    if (movimientosObj) dto.movimientos = movimientosObj;

    console.log('📤 Enviando WIP:', JSON.stringify(dto, null, 2));

    if (this.editingId) {
      this.wipService.update(this.editingId, dto).subscribe({
        next: (updated) => {
          console.log('WIP updated:', updated);
          this.q = '';
          this.loadWIP();
          this.cancelEdit();
        },
        error: (err) => {
          console.error('❌ Error updating:', err);
          console.error('📋 Error details:', err.error);
          this.error = this.extractErrorMessage(err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.wipService.create(dto).subscribe({
        next: (created) => {
          console.log('WIP created:', created);
          this.q = '';
          this.loadWIP();
          this.resetForm();
        },
        error: (err) => {
          console.error('❌ Error creating:', err);
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
        return 'Recurso no encontrado.';
      case 422:
        return 'Error de validación: ' + (err.error?.message || 'Verifica los datos ingresados');
      case 500:
        return 'Error del servidor. Intenta nuevamente.';
      default:
        return err.message || 'Error desconocido';
    }
  }

  edit(item: WIP) {
    this.editingId = item.id;
    this.form = {
      ordenId: item.ordenId,
      productoId: item.productoId,
      productoNombre: item.productoNombre,
      workCenterId: item.workCenterId || '',
      workCenterNombre: item.workCenterNombre || '',
      cantidadActual: item.cantidadActual,
      unidadMedida: item.unidadMedida,
      lote: item.lote || '',
      ubicacion: item.ubicacion || '',
      fechaEntrada: item.fechaEntrada,
      movimientos: item.movimientos ? JSON.stringify(item.movimientos, null, 2) : '[]',
    };
    this.error = null;
    this.cdr.detectChanges();
  }

  remove(id: string) {
    if (!confirm('¿Eliminar este registro de WIP?')) return;

    this.loading = true;
    this.wipService.delete(id).subscribe({
      next: () => {
        console.log('WIP deleted');
        this.loadWIP();
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
      ordenId: '',
      productoId: '',
      productoNombre: '',
      workCenterId: '',
      workCenterNombre: '',
      cantidadActual: 0,
      unidadMedida: 'KG',
      lote: '',
      ubicacion: '',
      fechaEntrada: '',
      movimientos: '[]',
    };
    this.error = null;
    this.loading = false;
    this.cdr.detectChanges();
  }

  getOrdenInfo(ordenId: string): string {
    const orden = this.ordenes.find(o => o.id === ordenId);
    return orden ? `${orden.numeroOrden}` : ordenId.slice(0, 8) + '...';
  }
}
