import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  DowntimeReasonsService, 
  DowntimeReason, 
  CategoriaParada, 
  TipoParada,
  CreateDowntimeReasonDto 
} from './downtimes-reasons.service';
import { AuthService } from '../../../core/auth/auth.service';
import { AuditHistoryComponent } from '../../../shared/components/audit-history/audit-history';
import { ConfirmService } from '../../../shared/components/confirm-modal/confirm.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  standalone: true,
  selector: 'app-downtime-reasons',
  imports: [CommonModule, FormsModule, AuditHistoryComponent],
  templateUrl: './downtimes-reasons.html',
})
export class DowntimeReasonsComponent implements OnInit {
  form = {
    codigo: '',
    nombre: '',
    descripcion: '',
    categoria: CategoriaParada.MATERIALES,
    tipo: TipoParada.CORTA,
    requiereAprobacion: false,
    requiereComentario: false,
    requiereEvidencia: false,
    color: '#e74c3c',
    icono: '⚠️',
    tiempoEstandardMinutos: 0,
    prioridad: 3,
    impactaOEE: true,
    departamentoResponsable: '',
    activo: true,
  };

  items: DowntimeReason[] = [];
  editingId: string | null = null;
  currentItem: DowntimeReason | null = null;
  formPanelOpen = false;
  viewOnly = false;
  q = '';
  loading = false;
  error: string | null = null;

  // Exponer enums para el template
  categorias = Object.values(CategoriaParada);
  tipos = Object.values(TipoParada);

  constructor(
    private downtimeReasonsService: DowntimeReasonsService,
    private cdr: ChangeDetectorRef,
    private authSvc: AuthService,
    private confirmSvc: ConfirmService,
    private toast: ToastService
  ) {}

  openCreatePanel() { this.editingId = null; this.currentItem = null; this.resetForm(); this.viewOnly = false; this.formPanelOpen = true; }

  ngOnInit() {
    this.loadReasons();
  }

  loadReasons() {
    this.loading = true;
    this.error = null;
    
    this.downtimeReasonsService.getAll().subscribe({
      next: (data) => {
        console.log('✅ Downtime reasons loaded:', data);
        this.items = data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error loading downtime reasons:', err);
        this.error = 'No se pudieron cargar los motivos de parada.';
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
      [x.codigo, x.nombre, x.descripcion, x.categoria, x.departamentoResponsable]
        .some(v => String(v || '').toLowerCase().includes(t))
    );
  }

submit() {
    if (!this.form.codigo || !this.form.nombre) {
      this.error = 'Código y nombre son requeridos';
      return;
    }

    this.loading = true;
    this.error = null;

    const dto: CreateDowntimeReasonDto = {
      codigo: this.form.codigo,
      nombre: this.form.nombre,
      descripcion: this.form.descripcion || undefined,
      categoria: this.form.categoria,
      tipo: this.form.tipo || undefined,
      requiereAprobacion: this.form.requiereAprobacion,
      requiereComentario: this.form.requiereComentario,
      requiereEvidencia: this.form.requiereEvidencia,
      color: this.form.color || undefined,
      icono: this.form.icono || undefined,
      tiempoEstandardMinutos: this.form.tiempoEstandardMinutos || undefined,
      prioridad: this.form.prioridad || undefined,
      impactaOEE: this.form.impactaOEE,
      departamentoResponsable: this.form.departamentoResponsable || undefined,
      activo: this.form.activo,
    };

    const payload = dto as any;
    const username = this.authSvc.getCurrentUsername();
    if (!this.editingId) {
      payload.createdBy = username;
    } else {
      payload.updatedBy = username;
    }

    if (this.editingId) {
      this.downtimeReasonsService.update(this.editingId, payload).subscribe({
        next: (updated) => {
          console.log('Downtime reason updated:', updated);
          this.toast.show('Motivo actualizado');
          this.loadReasons();
          this.cancelEdit();
          this.formPanelOpen = false;
        },
        error: (err) => {
          console.error('Error updating:', err);
          this.error = this.extractErrorMessage(err);
          this.loading = false;
        }
      });
    } else {
      this.downtimeReasonsService.create(payload).subscribe({
        next: (created) => {
          console.log('Downtime reason created:', created);
          this.toast.show('Motivo creado');
          this.loadReasons();
          this.resetForm();
          this.formPanelOpen = false;
        },
        error: (err) => {
          console.error('Error creating:', err);
          this.error = this.extractErrorMessage(err);
          this.loading = false;
        }
      });
    }
  }

  private extractErrorMessage(err: any): string {
    // Si el error tiene un mensaje directo del backend
    if (typeof err.error?.message === 'string') {
      return err.error.message;
    }
    
    // Si el mensaje es un array de validaciones
    if (Array.isArray(err.error?.message)) {
      return err.error.message.join(', ');
    }
    
    // Si hay un error genérico
    if (err.error?.error) {
      return err.error.error;
    }
    
    // Mensajes por código de estado
    switch (err.status) {
      case 400:
        return 'Datos inválidos. Verifica el formulario.';
      case 409:
        return 'Ya existe un registro con este código.';
      case 422:
        return 'Error de validación: ' + (err.error?.message || 'Verifica los datos ingresados');
      case 500:
        return 'Error del servidor. Intenta nuevamente.';
      default:
        return err.message || 'Error desconocido';
    }
  }

  edit(it: DowntimeReason) {
    this.editingId = it.id;
    this.currentItem = it;
    this.form = {
      codigo: it.codigo,
      nombre: it.nombre,
      descripcion: it.descripcion || '',
      categoria: it.categoria,
      tipo: it.tipo || TipoParada.CORTA,
      requiereAprobacion: it.requiereAprobacion || false,
      requiereComentario: it.requiereComentario || false,
      requiereEvidencia: it.requiereEvidencia || false,
      color: it.color || '#e74c3c',
      icono: it.icono || '⚠️',
      tiempoEstandardMinutos: it.tiempoEstandardMinutos || 0,
      prioridad: it.prioridad || 3,
      impactaOEE: it.impactaOEE !== false,
      departamentoResponsable: it.departamentoResponsable || '',
      activo: it.activo !== false,
    };
    this.viewOnly = false;
    this.formPanelOpen = true;
  }

  view(it: DowntimeReason) {
    this.editingId = it.id;
    this.currentItem = it;
    this.form = {
      codigo: it.codigo,
      nombre: it.nombre,
      descripcion: it.descripcion || '',
      categoria: it.categoria,
      tipo: it.tipo || TipoParada.CORTA,
      requiereAprobacion: it.requiereAprobacion || false,
      requiereComentario: it.requiereComentario || false,
      requiereEvidencia: it.requiereEvidencia || false,
      color: it.color || '#e74c3c',
      icono: it.icono || '⚠️',
      tiempoEstandardMinutos: it.tiempoEstandardMinutos || 0,
      prioridad: it.prioridad || 3,
      impactaOEE: it.impactaOEE !== false,
      departamentoResponsable: it.departamentoResponsable || '',
      activo: it.activo !== false,
    };
    this.viewOnly = true;
    this.formPanelOpen = true;
  }

  remove(id: string) {
    this.confirmSvc.open({ title: 'Eliminar motivo de parada', message: '¿Estás seguro? Esta acción no se puede deshacer.' })
      .subscribe(ok => {
        if (!ok) return;
        this.loading = true;
        this.error = null;
        this.downtimeReasonsService.delete(id).subscribe({
          next: () => {
            this.toast.show('Motivo de parada eliminado');
            this.loadReasons();
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
    this.viewOnly = false;
    this.resetForm();
    this.formPanelOpen = false;
  }

  resetForm() {
    this.form = {
      codigo: '',
      nombre: '',
      descripcion: '',
      categoria: CategoriaParada.MATERIALES,
      tipo: TipoParada.CORTA,
      requiereAprobacion: false,
      requiereComentario: false,
      requiereEvidencia: false,
      color: '#e74c3c',
      icono: '⚠️',
      tiempoEstandardMinutos: 0,
      prioridad: 3,
      impactaOEE: true,
      departamentoResponsable: '',
      activo: true,
    };
    this.error = null;
  }
}