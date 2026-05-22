import { Component, Input, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditHttpService, AuditRecord, AUDIT_ACTION_LABELS, AUDIT_ACTION_CLASSES } from '../../../core/services/audit-http.service';

@Component({
  standalone: true,
  selector: 'app-audit-history',
  imports: [CommonModule],
  templateUrl: './audit-history.html',
})
export class AuditHistoryComponent implements OnChanges {
  @Input() entityType!: string;
  @Input() entityId!: string;
  @Input() titulo = 'Historial de cambios';

  records: AuditRecord[] = [];
  loading = false;
  error: string | null = null;
  expandedId: string | null = null;

  readonly actionLabels = AUDIT_ACTION_LABELS;
  readonly actionClasses = AUDIT_ACTION_CLASSES;

  constructor(private auditSvc: AuditHttpService, private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['entityId'] || changes['entityType']) && this.entityId && this.entityType) {
      this.load();
    }
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.records = [];
    this.auditSvc.getByEntity(this.entityType, this.entityId).subscribe({
      next: data => {
        this.records = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No se pudo cargar el historial.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  toggle(id: string): void {
    this.expandedId = this.expandedId === id ? null : id;
  }

  camposModificados(record: AuditRecord): { campo: string; anterior: any; nuevo: any }[] {
    if (!record.oldValues || !record.newValues) return [];
    const SKIP = ['fechaEdicion', 'updatedAt', 'usuEdicion'];
    return Object.keys(record.newValues)
      .filter(k => !SKIP.includes(k) && JSON.stringify(record.oldValues![k]) !== JSON.stringify(record.newValues![k]))
      .map(k => ({ campo: k, anterior: record.oldValues![k], nuevo: record.newValues![k] }));
  }

  actionLabel(action: string): string {
    return this.actionLabels[action] ?? action;
  }

  actionClass(action: string): string {
    return this.actionClasses[action] ?? 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString('es', { dateStyle: 'short', timeStyle: 'short' });
  }
}
