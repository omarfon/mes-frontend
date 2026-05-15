import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditService, Audit, CreateAuditDto, AuditAction } from './audit.service';

@Component({
  standalone: true,
  selector: 'app-audit',
  imports: [CommonModule, FormsModule],
  templateUrl: './audit.html',
  styleUrl: './audit.css',
})
export class AuditComponent implements OnInit {
  form: CreateAuditDto = {
    action: AuditAction.CREATE,
    entityType: '',
    entityId: '',
    description: '',
  };

  items: Audit[] = [];
  formPanelOpen = false;
  q = '';
  loading = false;
  error: string | null = null;
  success: string | null = null;

  // Filtros
  filterEntityType = '';
  filterAction = '';
  filterModule = '';

  // Enum para template
  AuditAction = AuditAction;
  actions = Object.values(AuditAction);

  // Tipos de entidad comunes
  entityTypes = [
    'lot',
    'serial',
    'movement',
    'product',
    'order',
    'inspection',
    'genealogy',
    'quarantine',
    'user',
    'machine',
    'material',
  ];

  // Módulos del sistema
  modules = [
    'traceability',
    'production',
    'quality',
    'maintenance',
    'inventory',
    'admin',
  ];

  constructor(
    private auditService: AuditService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadAudits();
  }

  loadAudits() {
    this.loading = true;
    this.error = null;
    this.auditService.getAll().subscribe({
      next: (data) => {
        this.items = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando auditorías:', err);
        if (err.status !== 401) {
          this.error = this.extractErrorMessage(err);
        } else {
          console.log('ℹ️ Endpoint requiere autenticación');
          this.items = [];
        }
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filtered() {
    const t = this.q.trim().toLowerCase();
    let result = this.items || [];

    // Filtro de búsqueda
    if (t) {
      result = result.filter(x =>
        [x.action, x.entityType, x.entityId, x.description, x.userName, x.module]
          .some(v => String(v || '').toLowerCase().includes(t))
      );
    }

    // Filtro por tipo de entidad
    if (this.filterEntityType) {
      result = result.filter(x => x.entityType === this.filterEntityType);
    }

    // Filtro por acción
    if (this.filterAction) {
      result = result.filter(x => x.action === this.filterAction);
    }

    // Filtro por módulo
    if (this.filterModule) {
      result = result.filter(x => x.module === this.filterModule);
    }

    return result;
  }

  submit() {
    // Validaciones
    if (!this.form.action) {
      this.error = 'La acción es requerida';
      this.success = null;
      return;
    }

    if (!this.form.entityType || this.form.entityType.trim() === '') {
      this.error = 'El tipo de entidad es requerido';
      this.success = null;
      return;
    }

    if (!this.form.entityId || this.form.entityId.trim() === '') {
      this.error = 'El ID de entidad es requerido';
      this.success = null;
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    // Generar UUID automáticamente
    const entityId = crypto.randomUUID();

    const dto: CreateAuditDto = {
      action: this.form.action,
      entityType: this.form.entityType.trim(),
      entityId: entityId,
    };

    if (this.form.description && this.form.description.trim()) {
      dto.description = this.form.description.trim();
    }
    
    if (this.form.module && this.form.module.trim()) {
      dto.module = this.form.module.trim();
    }

    console.log('📤 Enviando auditoría:', JSON.stringify(dto, null, 2));

    this.auditService.create(dto).subscribe({
      next: (created) => {
        console.log('✅ Auditoría creada exitosamente:', created);
        this.success = `Auditoría registrada: ${this.getActionLabel(created.action)} en ${created.entityType}`;
        this.error = null;
        this.loadAudits();
        this.resetForm();
        this.formPanelOpen = false;
      },
      error: (err) => {
        console.error('❌ Error creando auditoría:', err);
        console.error('📋 Detalles del error:', err.error);
        
        if (err.status === 401) {
          // Modo simulado para desarrollo
          console.log('ℹ️ Endpoint /audit requiere autenticación - simulando registro para desarrollo');
          this.success = `✓ Auditoría simulada: ${this.getActionLabel(dto.action)} en ${dto.entityType} (ID: ${dto.entityId.slice(0, 8)}...)`;
          this.error = null;
          this.resetForm();
          this.formPanelOpen = false;
        } else {
          this.error = this.extractErrorMessage(err);
          this.success = null;
        }
        
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  resetForm() {
    this.form = {
      action: AuditAction.CREATE,
      entityType: '',
      entityId: '',
      description: '',
    };
    this.loading = false;
    this.cdr.detectChanges();
  }

  openCreatePanel() {
    this.resetForm();
    this.success = null;
    this.error = null;
    this.formPanelOpen = true;
  }

  closeCreatePanel() {
    this.formPanelOpen = false;
  }

  clearFilters() {
    this.filterEntityType = '';
    this.filterAction = '';
    this.filterModule = '';
  }

  getActionLabel(action: AuditAction): string {
    const labels: Record<AuditAction, string> = {
      [AuditAction.CREATE]: 'Crear',
      [AuditAction.READ]: 'Leer',
      [AuditAction.UPDATE]: 'Actualizar',
      [AuditAction.DELETE]: 'Eliminar',
      [AuditAction.LOGIN]: 'Inicio de sesión',
      [AuditAction.LOGOUT]: 'Cierre de sesión',
      [AuditAction.APPROVE]: 'Aprobar',
      [AuditAction.REJECT]: 'Rechazar',
      [AuditAction.COMPLETE]: 'Completar',
      [AuditAction.CANCEL]: 'Cancelar',
      [AuditAction.EXPORT]: 'Exportar',
      [AuditAction.IMPORT]: 'Importar',
      [AuditAction.PRINT]: 'Imprimir',
      [AuditAction.SEND]: 'Enviar',
      [AuditAction.RECEIVE]: 'Recibir',
    };
    return labels[action] || action;
  }

  getActionBadge(action: AuditAction): string {
    const badges: Record<AuditAction, string> = {
      [AuditAction.CREATE]: 'ui-badge-ok',
      [AuditAction.READ]: 'ui-badge',
      [AuditAction.UPDATE]: 'ui-badge-info',
      [AuditAction.DELETE]: 'ui-badge-bad',
      [AuditAction.LOGIN]: 'ui-badge-ok',
      [AuditAction.LOGOUT]: 'ui-badge',
      [AuditAction.APPROVE]: 'ui-badge-ok',
      [AuditAction.REJECT]: 'ui-badge-bad',
      [AuditAction.COMPLETE]: 'ui-badge-ok',
      [AuditAction.CANCEL]: 'ui-badge-warn',
      [AuditAction.EXPORT]: 'ui-badge-info',
      [AuditAction.IMPORT]: 'ui-badge-info',
      [AuditAction.PRINT]: 'ui-badge',
      [AuditAction.SEND]: 'ui-badge-info',
      [AuditAction.RECEIVE]: 'ui-badge-ok',
    };
    return badges[action] || 'ui-badge';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString('es-ES');
  }

  extractErrorMessage(err: any): string {
    if (err.status === 401) {
      return 'No autorizado: Inicia sesión para registrar auditorías en el servidor.';
    }
    if (err.status === 404) {
      return 'Endpoint no implementado - el backend necesita implementar /audit';
    }
    if (err.status === 0) {
      return 'Error de red - verificar conexión al backend';
    }
    if (err.error?.message) {
      if (Array.isArray(err.error.message)) {
        return err.error.message.join(', ');
      }
      return err.error.message;
    }
    return err.message || 'Error desconocido';
  }
}