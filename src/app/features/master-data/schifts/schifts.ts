import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShiftsService, Shift, CreateShiftDto } from './schifts.service';
import { AuthService } from '../../../core/auth/auth.service';
import { AuditHistoryComponent } from '../../../shared/components/audit-history/audit-history';
import { ConfirmService } from '../../../shared/components/confirm-modal/confirm.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  standalone: true,
  selector: 'app-shifts',
  imports: [CommonModule, FormsModule, AuditHistoryComponent],
  templateUrl: './schifts.html',
})
export class ShiftsComponent implements OnInit {
  form = {
    code: '',
    name: '',
    description: '',
    startTime: '07:00',
    endTime: '15:00',
    crossesMidnight: false,
    breakMinutes: 30,
  };

  items: Shift[] = [];
  editingId: string | null = null;
  currentItem: Shift | null = null;
  formPanelOpen = false;
  viewOnly = false;
  q = '';
  loading = false;
  error: string | null = null;

  constructor(
    private shiftsService: ShiftsService,
    private cdr: ChangeDetectorRef,
    private authSvc: AuthService,
    private confirmSvc: ConfirmService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadShifts();
  }

  loadShifts() {
    this.loading = true;
    this.error = null;
    
    this.shiftsService.getAll().subscribe({
      next: (data) => {
        console.log('✅ Shifts loaded:', data);
        this.items = data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error loading shifts:', err);
        this.error = 'No se pudieron cargar los turnos.';
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
      [x.code, x.name, x.description, x.startTime, x.endTime]
        .some(v => String(v || '').toLowerCase().includes(t))
    );
  }

  submit() {
    if (!this.form.code || !this.form.name || !this.form.startTime || !this.form.endTime) {
      this.error = 'Código, nombre, hora inicio y hora fin son requeridos';
      return;
    }

    this.loading = true;
    this.error = null;

    const dto: CreateShiftDto = {
      code: this.form.code,
      name: this.form.name,
      description: this.form.description || undefined,
      startTime: this.form.startTime,
      endTime: this.form.endTime,
      crossesMidnight: this.form.crossesMidnight,
      breakMinutes: this.form.breakMinutes || undefined,
    };

    const payload = dto as any;
    const username = this.authSvc.getCurrentUsername();
    if (!this.editingId) {
      payload.createdBy = username;
    } else {
      payload.updatedBy = username;
    }

    if (this.editingId) {
      this.shiftsService.update(this.editingId, payload).subscribe({
        next: (updated) => {
          console.log('Shift updated:', updated);
          this.toast.show('Turno actualizado');
          this.loadShifts();
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
      this.shiftsService.create(payload).subscribe({
        next: (created) => {
          console.log('Shift created:', created);
          this.toast.show('Turno creado');
          this.loadShifts();
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
        return 'Ya existe un turno con este código.';
      case 422:
        return 'Error de validación: ' + (err.error?.message || 'Verifica los datos ingresados');
      case 500:
        return 'Error del servidor. Intenta nuevamente.';
      default:
        return err.message || 'Error desconocido';
    }
  }

  edit(it: Shift) {
    this.editingId = it.id;
    this.currentItem = it;
    this.form = {
      code: it.code,
      name: it.name,
      description: it.description || '',
      startTime: it.startTime,
      endTime: it.endTime,
      crossesMidnight: it.crossesMidnight || false,
      breakMinutes: it.breakMinutes || 30,
    };
    this.viewOnly = false;
    this.formPanelOpen = true;
  }

  view(it: Shift) {
    this.editingId = it.id;
    this.currentItem = it;
    this.form = {
      code: it.code,
      name: it.name,
      description: it.description || '',
      startTime: it.startTime,
      endTime: it.endTime,
      crossesMidnight: it.crossesMidnight || false,
      breakMinutes: it.breakMinutes || 30,
    };
    this.viewOnly = true;
    this.formPanelOpen = true;
  }

  remove(id: string) {
    this.confirmSvc.open({ title: 'Eliminar turno', message: '¿Estás seguro? Esta acción no se puede deshacer.' })
      .subscribe(ok => {
        if (!ok) return;
        this.loading = true;
        this.error = null;
        this.shiftsService.delete(id).subscribe({
          next: () => {
            this.toast.show('Turno eliminado');
            this.loadShifts();
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

  openCreatePanel() {
    this.editingId = null;
    this.currentItem = null;
    this.resetForm();
    this.viewOnly = false;
    this.formPanelOpen = true;
  }

  resetForm() {
    this.form = {
      code: '',
      name: '',
      description: '',
      startTime: '07:00',
      endTime: '15:00',
      crossesMidnight: false,
      breakMinutes: 30,
    };
    this.error = null;
  }
}
