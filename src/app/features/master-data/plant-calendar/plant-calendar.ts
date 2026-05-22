import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlantCalendarService, CalEntry, CalEntryType, CreateCalEntryDto } from './plant-calendar.service';
import { AuthService } from '../../../core/auth/auth.service';
import { AuditHistoryComponent } from '../../../shared/components/audit-history/audit-history';
import { ConfirmService } from '../../../shared/components/confirm-modal/confirm.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  standalone: true,
  selector: 'app-plant-calendar',
  imports: [CommonModule, FormsModule, AuditHistoryComponent],
  templateUrl: './plant-calendar.html',
})
export class PlantCalendarComponent implements OnInit {
  workDays: { day: string; label: string; active: boolean }[] = [
    { day: 'MON', label: 'Lun', active: true },
    { day: 'TUE', label: 'Mar', active: true },
    { day: 'WED', label: 'Mié', active: true },
    { day: 'THU', label: 'Jue', active: true },
    { day: 'FRI', label: 'Vie', active: true },
    { day: 'SAT', label: 'Sáb', active: false },
    { day: 'SUN', label: 'Dom', active: false },
  ];

  form: CreateCalEntryDto = {
    date: '', type: 'HOLIDAY', name: '', plantCode: 'PLT-01', affectsAll: true, notes: '',
  };

  items: CalEntry[] = [];
  editingId: string | null = null;
  currentItem: CalEntry | null = null;
  q = '';
  filterType: CalEntryType | 'ALL' = 'ALL';
  loading = false;
  error: string | null = null;

  readonly entryTypes: { value: CalEntryType; label: string }[] = [
    { value: 'HOLIDAY', label: 'Festivo' },
    { value: 'PLANNED_STOP', label: 'Parada programada' },
    { value: 'EXTRA_SHIFT', label: 'Turno extra' },
    { value: 'MAINTENANCE_WINDOW', label: 'Ventana de mantenimiento' },
  ];

  constructor(private svc: PlantCalendarService, private cdr: ChangeDetectorRef, private authSvc: AuthService, private confirmSvc: ConfirmService, private toast: ToastService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.error = null;
    this.svc.getAll().subscribe({
      next: data => { this.items = data; this.loading = false; this.cdr.detectChanges(); },
      error: err => { this.error = this.extractError(err); this.loading = false; this.cdr.detectChanges(); },
    });
  }

  get filtered() {
    let list = this.items;
    if (this.filterType !== 'ALL') list = list.filter(x => x.type === this.filterType);
    const t = this.q.trim().toLowerCase();
    if (t) list = list.filter(x => [x.name, x.date, x.plantCode, x.notes].some(v => v.toLowerCase().includes(t)));
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }

  typeLabel(type: CalEntryType): string {
    return this.entryTypes.find(t => t.value === type)?.label ?? type;
  }

  typeBadge(type: CalEntryType): string {
    const map: Record<string, string> = {
      HOLIDAY: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
      PLANNED_STOP: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
      EXTRA_SHIFT: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
      MAINTENANCE_WINDOW: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    };
    return 'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ' + (map[type] ?? '');
  }

  isPast(date: string): boolean {
    return new Date(date) < new Date(new Date().toDateString());
  }

  submit() {
    if (!this.form.date || !this.form.name) return;
    this.loading = true;
    const payload = { ...this.form } as any;
    const username = this.authSvc.getCurrentUsername();
    if (!this.editingId) {
      payload.createdBy = username;
    } else {
      payload.updatedBy = username;
    }
    const obs = this.editingId
      ? this.svc.update(this.editingId, payload)
      : this.svc.create(payload);
    obs.subscribe({
      next: () => { this.toast.show(this.editingId ? 'Registro actualizado' : 'Registro creado'); this.load(); this.editingId ? this.cancelEdit() : this.resetForm(); },
      error: err => { this.error = this.extractError(err); this.loading = false; },
    });
  }

  edit(it: CalEntry) {
    this.editingId = it.id;
    this.currentItem = it;
    this.form = { date: it.date, type: it.type, name: it.name, plantCode: it.plantCode, affectsAll: it.affectsAll, notes: it.notes };
  }

  remove(id: string) {
    this.confirmSvc.open({ title: 'Eliminar entrada', message: '¿Estás seguro? Esta acción no se puede deshacer.' })
      .subscribe(ok => {
        if (!ok) return;
        this.svc.delete(id).subscribe({
          next: () => { this.toast.show('Entrada eliminada'); this.load(); if (this.editingId === id) this.cancelEdit(); },
          error: err => { this.error = this.extractError(err); },
        });
      });
  }

  cancelEdit() { this.editingId = null; this.currentItem = null; this.resetForm(); }

  resetForm() {
    this.form = { date: '', type: 'HOLIDAY', name: '', plantCode: 'PLT-01', affectsAll: true, notes: '' };
  }

  fmtDate(iso: string): string {
    if (!iso) return '-';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  private extractError(err: any): string {
    if (typeof err.error?.message === 'string') return err.error.message;
    if (Array.isArray(err.error?.message)) return err.error.message.join(', ');
    if (err.error?.error) return err.error.error;
    const map: Record<number, string> = { 400: 'Datos inválidos.', 409: 'Conflicto de datos.', 500: 'Error del servidor.' };
    return map[err.status] || err.message || 'Error desconocido';
  }
}

