import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UomsService, UnidadMedida, TipoUnidadMedida, CreateUnidadMedidaDto } from './uoms.service';
import { AuthService } from '../../../core/auth/auth.service';
import { AuditHistoryComponent } from '../../../shared/components/audit-history/audit-history';
import { ConfirmService } from '../../../shared/components/confirm-modal/confirm.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  standalone: true,
  selector: 'app-uoms',
  imports: [CommonModule, FormsModule, AuditHistoryComponent],
  templateUrl: './uoms.html',
})
export class UomsComponent implements OnInit {
  form = {
    codigo: '',
    nombre: '',
    simbolo: '',
    tipo: TipoUnidadMedida.CANTIDAD,
    descripcion: '',
    factorConversion: 1,
    esSI: false,
    activo: true,
    decimales: 2,
  };

  items: UnidadMedida[] = [];
  editingId: string | null = null;
  currentItem: UnidadMedida | null = null;
  formPanelOpen = false;
  viewOnly = false;
  q = '';
  loading = false;
  error: string | null = null;

  // Exponer enum para el template
  tipos = Object.values(TipoUnidadMedida);

  constructor(
    private uomsService: UomsService,
    private cdr: ChangeDetectorRef,
    private authSvc: AuthService,
    private confirmSvc: ConfirmService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadUoms();
  }

  loadUoms() {
    this.loading = true;
    this.error = null;
    
    this.uomsService.getAll().subscribe({
      next: (data) => {
        console.log('✅ UoMs loaded:', data);
        this.items = data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error loading UoMs:', err);
        const msg = err?.error?.message || err?.message || 'Error desconocido';
        this.error = `No se pudieron cargar las unidades de medida. (${msg})`;
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
      [x.codigo, x.nombre, x.simbolo, x.descripcion, x.tipo]
        .some(v => String(v || '').toLowerCase().includes(t))
    );
  }

  submit() {
    if (!this.form.codigo || !this.form.nombre || !this.form.simbolo) {
      this.error = 'Código, nombre y símbolo son requeridos';
      return;
    }

    this.loading = true;
    this.error = null;

    const dto: CreateUnidadMedidaDto = {
      codigo: this.form.codigo,
      nombre: this.form.nombre,
      simbolo: this.form.simbolo,
      tipo: this.form.tipo,
      descripcion: this.form.descripcion || undefined,
      factorConversion: this.form.factorConversion || undefined,
      esSI: this.form.esSI,
      activo: this.form.activo,
      decimales: this.form.decimales || undefined,
    };

    const payload = dto as any;
    const username = this.authSvc.getCurrentUsername();
    if (!this.editingId) {
      payload.createdBy = username;
    } else {
      payload.updatedBy = username;
    }

    if (this.editingId) {
      this.uomsService.update(this.editingId, payload).subscribe({
        next: (updated) => {
          console.log('UoM updated:', updated);
          this.toast.show('Unidad actualizada');
          this.loadUoms();
          this.cancelEdit();
        },
        error: (err) => {
          console.error('Error updating:', err);
          this.error = this.extractErrorMessage(err);
          this.loading = false;
        }
      });
    } else {
      this.uomsService.create(payload).subscribe({
        next: (created) => {
          console.log('UoM created:', created);
          this.toast.show('Unidad creada');
          this.loadUoms();
          this.resetForm();
          this.formPanelOpen = false;
        },
        error: (err) => {
          console.error('Error creating:', err);
          console.error('Full error response:', err.error);
          console.error('Error status:', err.status);
          this.error = this.extractErrorMessage(err);
          this.loading = false;
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
        return 'Ya existe una unidad con este código.';
      case 422:
        return 'Error de validación: ' + (err.error?.message || 'Verifica los datos ingresados');
      case 500:
        return 'Error del servidor. Intenta nuevamente.';
      default:
        return err.message || 'Error desconocido';
    }
  }

  edit(it: UnidadMedida) {
    this.formPanelOpen = true;
    this.editingId = it.id;
    this.currentItem = it;
    this.form = {
      codigo: it.codigo,
      nombre: it.nombre,
      simbolo: it.simbolo,
      tipo: it.tipo,
      descripcion: it.descripcion || '',
      factorConversion: it.factorConversion || 1,
      esSI: it.esSI || false,
      activo: it.activo !== false,
      decimales: it.decimales || 2,
    };
    this.viewOnly = false;
  }

  view(it: UnidadMedida) {
    this.formPanelOpen = true;
    this.editingId = it.id;
    this.currentItem = it;
    this.form = {
      codigo: it.codigo,
      nombre: it.nombre,
      simbolo: it.simbolo,
      tipo: it.tipo,
      descripcion: it.descripcion || '',
      factorConversion: it.factorConversion || 1,
      esSI: it.esSI || false,
      activo: it.activo !== false,
      decimales: it.decimales || 2,
    };
    this.viewOnly = true;
  }

  remove(id: string) {
    this.confirmSvc.open({ title: 'Eliminar unidad de medida', message: '¿Estás seguro? Esta acción no se puede deshacer.' })
      .subscribe(ok => {
        if (!ok) return;
        this.loading = true;
        this.error = null;
        this.uomsService.delete(id).subscribe({
          next: () => {
            this.toast.show('Unidad de medida eliminada');
            this.loadUoms();
            if (this.editingId === id) this.cancelEdit();
          },
          error: (err) => {
            console.error('Error deleting:', err);
            this.error = this.extractErrorMessage(err);
            this.loading = false;
          }
        });
      });
  }

  cancelEdit() {
    this.editingId = null;
    this.currentItem = null;
    this.resetForm();
    this.viewOnly = false;
    this.formPanelOpen = false;
  }

  openCreatePanel() {
    this.editingId = null;
    this.currentItem = null;
    this.resetForm();
    this.viewOnly = false;
    this.formPanelOpen = true;
  }

  resetForm() {
    this.form = {
      codigo: '',
      nombre: '',
      simbolo: '',
      tipo: TipoUnidadMedida.CANTIDAD,
      descripcion: '',
      factorConversion: 1,
      esSI: false,
      activo: true,
      decimales: 2,
    };
    this.error = null;
  }
}
