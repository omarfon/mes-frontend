import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaintenanceStoreService, CalendarItem, PmFrequency } from '../services/maintenance-store.service';

@Component({
  standalone: true,
  selector: 'app-calendar',
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar.html',
})
export class CalendarComponent {
  // semana actual
  anchor = new Date(); // hoy
  error = '';
  success = '';

  // crear plan rápido
  form = {
    assetCode: 'MAQ-001',
    name: 'PM semanal: inspección + limpieza',
    frequency: 'WEEKLY' as PmFrequency,
    estimatedMinutes: 45,
    nextAt: '',
    active: true,
  };

  selectedDayIso: string | null = null;
new: Date | undefined;

  constructor(public ms: MaintenanceStoreService) {}

  startOfWeek(d: Date) {
    const x = new Date(d);
    const day = x.getDay(); // 0 domingo
    const diff = (day === 0 ? -6 : 1) - day; // lunes como inicio
    x.setDate(x.getDate() + diff);
    x.setHours(0,0,0,0);
    return x;
  }

  addDays(d: Date, n: number) {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
  }

  fmtDay(d: Date) {
    return d.toISOString().slice(0,10);
  }

  weekDays() {
    const start = this.startOfWeek(this.anchor);
    return Array.from({ length: 7 }).map((_, i) => this.addDays(start, i));
  }

  rangeIso() {
    const days = this.weekDays();
    const from = new Date(days[0]); from.setHours(0,0,0,0);
    const to = new Date(days[6]); to.setHours(23,59,59,999);
    return { from: from.toISOString(), to: to.toISOString() };
  }

  itemsForDay(day: Date):  CalendarItem[] {
    const dayStart = new Date(day); dayStart.setHours(0,0,0,0);
    const dayEnd = new Date(day); dayEnd.setHours(23,59,59,999);
    return this.ms.calendarItemsBetween(dayStart.toISOString(), dayEnd.toISOString());
  }

  itemsWeek() {
    const { from, to } = this.rangeIso();
    return this.ms.calendarItemsBetween(from, to);
  }

  prevWeek() { this.anchor = this.addDays(this.anchor, -7); }
  nextWeek() { this.anchor = this.addDays(this.anchor, 7); }
  today() { this.anchor = new Date(); }

  pickDay(day: Date) {
    this.selectedDayIso = this.fmtDay(day);
  }

  createPlan() {
    this.error = '';
    this.success = '';
    try {
      const nextAt = this.form.nextAt ? new Date(this.form.nextAt).toISOString() : new Date().toISOString();
      const plan = this.ms.addPlan({
        name: this.form.name.trim(),
        assetCode: this.form.assetCode,
        frequency: this.form.frequency,
        estimatedMinutes: Number(this.form.estimatedMinutes || 0),
        nextAt,
        active: !!this.form.active,
        checklist: [
          { id: 't1', task: 'Inspección general', mandatory: true },
          { id: 't2', task: 'Limpieza', mandatory: false },
        ],
      });
      this.success = `Plan creado: ${plan.code}`;
    } catch (e: any) {
      this.error = e?.message ?? 'Error creando plan';
    }
  }

  badgeType(t: CalendarItem['type']) {
    return t === 'PM'
      ? 'bg-blue-500/10 text-blue-200 border border-blue-500/20 rounded-full px-2 py-1 text-[11px]'
      : 'bg-amber-500/10 text-amber-200 border border-amber-500/20 rounded-full px-2 py-1 text-[11px]';
  }
}
