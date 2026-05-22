import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DespachosService, Despacho, TipoDespacho, EstadoDespacho, CreateDespachoDto } from './dispatch.service';
import { ConfirmService } from '../../../shared/components/confirm-modal/confirm.service';

@Component({
  standalone: true,
  selector: 'app-dispatch',
  imports: [CommonModule, FormsModule],
  templateUrl: './dispatch.html',
})
export class DispatchComponent implements OnInit {
  form = {
    numeroDespacho: '',
    ordenId: '',
    tipo: TipoDespacho.CLIENTE,
    estado: EstadoDespacho.PENDIENTE,
    destino: '',
    direccion: '',
    contacto: '',
    telefono: '',
    fechaProgramada: '',
    items: '[]', // JSON string para el formulario
    pesoTotal: 0,
    volumenTotal: 0,
    transportista: '',
    numeroGuia: '',
    vehiculo: '',
    conductor: '',
    observaciones: '',
  };

  items: Despacho[] = [];
  editingId: string | null = null;
  formPanelOpen = false;
  q = '';
  page = 1;
  pageSize = 10;
  readonly pageSizeOptions = [5, 10, 20, 50];
  loading = false;
  error: string | null = null;

  // Exponer enums para el template
  tipos = Object.values(TipoDespacho);
  estados = Object.values(EstadoDespacho);

  // Vista detalle
  viewingDespacho: Despacho | null = null;

  constructor(
    private despachosService: DespachosService,
    private cdr: ChangeDetectorRef,
    private confirmSvc: ConfirmService
  ) {}

  ngOnInit() {
    this.loadDespachos();
  }

  loadDespachos() {
    this.loading = true;
    this.error = null;
    
    this.despachosService.getAll().subscribe({
      next: (data) => {
        console.log('✅ Despachos loaded:', data);
        this.items = data || [];
        this.ensurePageInRange();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error loading despachos:', err);
        this.error = 'No se pudieron cargar los despachos.';
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
      [x.numeroDespacho, x.destino, x.transportista, x.numeroGuia, x.estado, x.tipo]
        .some(v => String(v || '').toLowerCase().includes(t))
    );
  }

  get pagedItems() {
    const start = (this.page - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
  }

  get pageStart() {
    if (!this.filtered.length) return 0;
    return (this.page - 1) * this.pageSize + 1;
  }

  get pageEnd() {
    return Math.min(this.page * this.pageSize, this.filtered.length);
  }

  onSearchChange() {
    this.page = 1;
  }

  setPageSize(size: number) {
    this.pageSize = Number(size);
    this.page = 1;
  }

  changePage(delta: number) {
    this.page = Math.min(this.totalPages, Math.max(1, this.page + delta));
  }

  private ensurePageInRange() {
    if (this.page > this.totalPages) {
      this.page = this.totalPages;
    }
    if (this.page < 1) {
      this.page = 1;
    }
  }

  submit() {
    if (!this.form.numeroDespacho || !this.form.destino) {
      this.error = 'Número de despacho y destino son requeridos';
      return;
    }

    // Parsear items JSON
    let itemsArray: any[] = [];
    try {
      itemsArray = this.form.items ? JSON.parse(this.form.items) : [];
      if (!Array.isArray(itemsArray)) {
        this.error = 'Items debe ser un array JSON válido';
        return;
      }
    } catch (e) {
      this.error = 'Items debe ser un JSON válido. Ejemplo: [{"producto":"PRD-001","cantidad":100}]';
      return;
    }

    this.loading = true;
    this.error = null;

    const dto: CreateDespachoDto = {
      numeroDespacho: this.form.numeroDespacho,
      ordenId: this.form.ordenId || undefined,
      tipo: this.form.tipo || undefined,
      estado: this.form.estado || undefined,
      destino: this.form.destino,
      direccion: this.form.direccion || undefined,
      contacto: this.form.contacto || undefined,
      telefono: this.form.telefono || undefined,
      fechaProgramada: this.form.fechaProgramada || undefined,
      items: itemsArray,
      pesoTotal: this.form.pesoTotal || undefined,
      volumenTotal: this.form.volumenTotal || undefined,
      transportista: this.form.transportista || undefined,
      numeroGuia: this.form.numeroGuia || undefined,
      vehiculo: this.form.vehiculo || undefined,
      conductor: this.form.conductor || undefined,
      observaciones: this.form.observaciones || undefined,
    };

    if (this.editingId) {
      this.despachosService.update(this.editingId, dto).subscribe({
        next: (updated) => {
          console.log('Despacho updated:', updated);
          this.q = '';
          this.loadDespachos();
          this.cancelEdit();
          this.formPanelOpen = false;
        },
        error: (err) => {
          console.error('Error updating:', err);
          this.error = this.extractErrorMessage(err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.despachosService.create(dto).subscribe({
        next: (created) => {
          console.log('Despacho created:', created);
          this.q = '';
          this.loadDespachos();
          this.resetForm();
          this.formPanelOpen = false;
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
        return 'Ya existe un despacho con este número.';
      case 422:
        return 'Error de validación: ' + (err.error?.message || 'Verifica los datos ingresados');
      case 500:
        return 'Error del servidor. Intenta nuevamente.';
      default:
        return err.message || 'Error desconocido';
    }
  }

  edit(item: Despacho) {
    this.formPanelOpen = true;
    this.editingId = item.id;
    this.form = {
      numeroDespacho: item.numeroDespacho,
      ordenId: item.ordenId || '',
      tipo: item.tipo || TipoDespacho.CLIENTE,
      estado: item.estado,
      destino: item.destino,
      direccion: item.direccion || '',
      contacto: item.contacto || '',
      telefono: item.telefono || '',
      fechaProgramada: item.fechaProgramada || '',
      items: JSON.stringify(item.items || [], null, 2),
      pesoTotal: item.pesoTotal || 0,
      volumenTotal: item.volumenTotal || 0,
      transportista: item.transportista || '',
      numeroGuia: item.numeroGuia || '',
      vehiculo: item.vehiculo || '',
      conductor: item.conductor || '',
      observaciones: item.observaciones || '',
    };
    this.error = null;
    this.cdr.detectChanges();
  }

  remove(id: string) {
    this.confirmSvc.open({ title: 'Eliminar despacho', message: '¿Estás seguro? Esta acción no se puede deshacer.' })
      .subscribe(ok => {
        if (!ok) return;
        this.loading = true;
        this.despachosService.delete(id).subscribe({
          next: () => {
            console.log('Despacho deleted');
            this.loadDespachos();
            this.ensurePageInRange();
          },
          error: (err) => {
            console.error('Error deleting:', err);
            this.error = this.extractErrorMessage(err);
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
      });
  }

  cancelEdit() {
    this.editingId = null;
    this.resetForm();
    this.formPanelOpen = false;
  }

  view(d: Despacho) {
    this.viewingDespacho = d;
  }

  closeView() {
    this.viewingDespacho = null;
  }

  openCreatePanel() {
    this.editingId = null;
    this.resetForm();
    this.formPanelOpen = true;
  }

  resetForm() {
    this.form = {
      numeroDespacho: '',
      ordenId: '',
      tipo: TipoDespacho.CLIENTE,
      estado: EstadoDespacho.PENDIENTE,
      destino: '',
      direccion: '',
      contacto: '',
      telefono: '',
      fechaProgramada: '',
      items: '[]',
      pesoTotal: 0,
      volumenTotal: 0,
      transportista: '',
      numeroGuia: '',
      vehiculo: '',
      conductor: '',
      observaciones: '',
    };
    this.error = null;
    this.loading = false;
    this.cdr.detectChanges();
  }

  badgeClass(estado: EstadoDespacho) {
    switch (estado) {
      case EstadoDespacho.LISTO: return 'ui-badge-warn';
      case EstadoDespacho.EN_TRANSITO: return 'ui-badge';
      case EstadoDespacho.ENTREGADO: return 'ui-badge-ok';
      case EstadoDespacho.CANCELADO: return 'ui-badge-bad';
      case EstadoDespacho.PREPARANDO: return 'ui-badge-warn';
      default: return 'ui-badge';
    }
  }
}
