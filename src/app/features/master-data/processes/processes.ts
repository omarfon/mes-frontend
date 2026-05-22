import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProcessesService, Proceso, TipoProceso, EstadoProceso, CreateProcesoDto } from './processes.service';
import { AuthService } from '../../../core/auth/auth.service';
import { AuditHistoryComponent } from '../../../shared/components/audit-history/audit-history';
import { ConfirmService } from '../../../shared/components/confirm-modal/confirm.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  standalone: true,
  selector: 'app-processes',
  imports: [CommonModule, FormsModule, AuditHistoryComponent],
  templateUrl: './processes.html',
})
export class ProcessesComponent implements OnInit {
  form = {
    codigo: '',
    nombre: '',
    descripcion: '',
    tipo: TipoProceso.MANUFACTURA,
    estado: EstadoProceso.ACTIVO,
    version: '1.0',
    tiempoEstandarMinutos: 0,
    tiempoSetupMinutos: 0,
    instrucciones: '',
    requisitosCalidad: '',
    secuencia: 1,
    eficienciaEsperada: 85,
    costoEstandar: 0,
    notas: '',
  };

  items: Proceso[] = [];
  editingId: string | null = null;
  currentItem: Proceso | null = null;
  formPanelOpen = false;
  viewOnly = false;
  q = '';
  loading = false;
  error: string | null = null;

  // Exponer enums para el template
  tipos = Object.values(TipoProceso);
  estados = Object.values(EstadoProceso);

  constructor(
    private processesService: ProcessesService,
    private cdr: ChangeDetectorRef,
    private authSvc: AuthService,
    private confirmSvc: ConfirmService,
    private toast: ToastService
  ) {}

  openCreatePanel() { this.editingId = null; this.currentItem = null; this.resetForm(); this.viewOnly = false; this.formPanelOpen = true; }

  ngOnInit() {
    this.loadProcesses();
  }

  loadProcesses() {
    this.loading = true;
    this.error = null;
    
    this.processesService.getAll().subscribe({
      next: (data) => {
        console.log('✅ Processes loaded:', data);
        this.items = data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error loading processes:', err);
        this.error = 'No se pudieron cargar los procesos.';
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
      [x.codigo, x.nombre, x.descripcion, x.tipo, x.estado]
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

    const dto: CreateProcesoDto = {
      codigo: this.form.codigo,
      nombre: this.form.nombre,
      descripcion: this.form.descripcion || undefined,
      tipo: this.form.tipo,
      estado: this.form.estado || undefined,
      version: this.form.version || undefined,
      tiempoEstandarMinutos: this.form.tiempoEstandarMinutos || undefined,
      tiempoSetupMinutos: this.form.tiempoSetupMinutos || undefined,
      instrucciones: this.form.instrucciones || undefined,
      requisitosCalidad: this.form.requisitosCalidad || undefined,
      secuencia: this.form.secuencia || undefined,
      eficienciaEsperada: this.form.eficienciaEsperada || undefined,
      costoEstandar: this.form.costoEstandar || undefined,
      notas: this.form.notas || undefined,
    };

    const payload = dto as any;
    const username = this.authSvc.getCurrentUsername();
    if (!this.editingId) {
      payload.createdBy = username;
    } else {
      payload.updatedBy = username;
    }

    if (this.editingId) {
      this.processesService.update(this.editingId, payload).subscribe({
        next: (updated) => {
          console.log('Process updated:', updated);
          this.toast.show('Proceso actualizado');
          this.q = '';
          this.loadProcesses();
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
      this.processesService.create(payload).subscribe({
        next: (created) => {
          console.log('Process created:', created);
          this.toast.show('Proceso creado');
          this.q = '';
          this.loadProcesses();
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
        return 'Ya existe un proceso con este código.';
      case 422:
        return 'Error de validación: ' + (err.error?.message || 'Verifica los datos ingresados');
      case 500:
        return 'Error del servidor. Intenta nuevamente.';
      default:
        return err.message || 'Error desconocido';
    }
  }

  edit(it: Proceso) {
    this.editingId = it.id;
    this.currentItem = it;
    this.form = {
      codigo: it.codigo,
      nombre: it.nombre,
      descripcion: it.descripcion || '',
      tipo: it.tipo,
      estado: it.estado || EstadoProceso.ACTIVO,
      version: it.version || '1.0',
      tiempoEstandarMinutos: it.tiempoEstandarMinutos || 0,
      tiempoSetupMinutos: it.tiempoSetupMinutos || 0,
      instrucciones: it.instrucciones || '',
      requisitosCalidad: it.requisitosCalidad || '',
      secuencia: it.secuencia || 1,
      eficienciaEsperada: it.eficienciaEsperada || 85,
      costoEstandar: it.costoEstandar || 0,
      notas: it.notas || '',
    };
    this.viewOnly = false;
    this.formPanelOpen = true;
  }

  view(it: Proceso) {
    this.editingId = it.id;
    this.currentItem = it;
    this.form = {
      codigo: it.codigo,
      nombre: it.nombre,
      descripcion: it.descripcion || '',
      tipo: it.tipo,
      estado: it.estado || EstadoProceso.ACTIVO,
      version: it.version || '1.0',
      tiempoEstandarMinutos: it.tiempoEstandarMinutos || 0,
      tiempoSetupMinutos: it.tiempoSetupMinutos || 0,
      instrucciones: it.instrucciones || '',
      requisitosCalidad: it.requisitosCalidad || '',
      secuencia: it.secuencia || 1,
      eficienciaEsperada: it.eficienciaEsperada || 85,
      costoEstandar: it.costoEstandar || 0,
      notas: it.notas || '',
    };
    this.viewOnly = true;
    this.formPanelOpen = true;
  }

  remove(id: string) {
    this.confirmSvc.open({ title: 'Eliminar proceso', message: '¿Estás seguro? Esta acción no se puede deshacer.' })
      .subscribe(ok => {
        if (!ok) return;
        this.loading = true;
        this.error = null;
        this.processesService.delete(id).subscribe({
          next: () => {
            this.toast.show('Proceso eliminado');
            this.loadProcesses();
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
      tipo: TipoProceso.MANUFACTURA,
      estado: EstadoProceso.ACTIVO,
      version: '1.0',
      tiempoEstandarMinutos: 0,
      tiempoSetupMinutos: 0,
      instrucciones: '',
      requisitosCalidad: '',
      secuencia: 1,
      eficienciaEsperada: 85,
      costoEstandar: 0,
      notas: '',
    };
    this.error = null;
  }
}
