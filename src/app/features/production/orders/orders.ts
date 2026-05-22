import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdenesService, Orden, EstadoOrden, PrioridadOrden, CreateOrdenDto } from './orders.service';
import { RoutingsService, Routing } from '../../master-data/routings/routings.service';
import { DynamicFormComponent } from '../../../shared/components/dynamic-form/dynamic-form';
import { FormTemplateService } from '../../../core/services/form-template.service';
import { FormTemplate } from '../../../shared/models/form-template.model';

export interface OrderRouteStep {
  seq: number;
  workCenter: string;
  machineCode: string;
  machineName: string;
  operation: string;
  setupTimeMin: number;
  estimatedHours: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  startedAt?: string;
  completedAt?: string;
}

@Component({
  standalone: true,
  selector: 'app-orders',
  imports: [CommonModule, FormsModule, DynamicFormComponent],
  templateUrl: './orders.html',
})
export class OrdersComponent implements OnInit {
  form = {
    numeroOrden: '',
    productoId: '',
    productoCodigo: '',
    productoNombre: '',
    cantidadPlanificada: 0,
    unidadMedida: 'UND',
    estado: EstadoOrden.PENDIENTE,
    prioridad: PrioridadOrden.NORMAL,
    fechaInicioPlanificada: '',
    fechaFinPlanificada: '',
    rutaId: '',
    lote: '',
    cliente: '',
    pedidoCliente: '',
    notas: '',
  };

  items: Orden[] = [];
  editingId: string | null = null;
  formPanelOpen = false;
  q = '';
  page = 1;
  pageSize = 10;
  readonly pageSizeOptions = [5, 10, 20, 50];
  loading = false;
  error: string | null = null;
  routings: Routing[] = [];
  routesLoading = false;

  // Exponer enums para el template
  estados = Object.values(EstadoOrden);
  prioridades = Object.values(PrioridadOrden);

  // Route visualization
  selectedOrderRoute: Orden | null = null;
  routeSteps: OrderRouteStep[] = [];

  // Vista detalle
  viewingOrder: Orden | null = null;

  // Reprogramación
  reprogrammingOrder: Orden | null = null;
  reprogramForm = {
    fechaInicioPlanificada: '',
    fechaFinPlanificada: '',
  };
  reprogramError: string | null = null;

  productionTemplate: FormTemplate | null = null;
  dynamicFormValues: Record<string, any> = {};
  dynamicFormValid = true;

  private fakeRoutes: Record<string, OrderRouteStep[]> = {};

  constructor(
    private ordenesService: OrdenesService,
    private cdr: ChangeDetectorRef,
    private formTemplateService: FormTemplateService,
    private routingsService: RoutingsService
  ) {}

  ngOnInit() {
    this.productionTemplate = this.formTemplateService.getTemplateByCode('PRODUCTION_RECORD') ?? null;
    this.loadRoutings();
    this.loadOrdenes();
  }

  loadRoutings() {
    this.routesLoading = true;

    this.routingsService.getAll().subscribe({
      next: (data) => {
        this.routings = (data || []).filter(route => route.active !== false);
        this.routesLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.routings = [];
        this.routesLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadOrdenes() {
    this.loading = true;
    this.error = null;
    
    this.ordenesService.getAll().subscribe({
      next: (data) => {
        console.log('✅ Ordenes loaded:', data);
        this.items = data || [];
        this.ensurePageInRange();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error loading ordenes:', err);
        this.items = [];
        this.error = err?.error?.message || err?.message || 'No fue posible cargar las órdenes desde el backend';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filtered() {
    const t = this.q.trim().toLowerCase();
    if (!t) return this.items || [];
    
    return (this.items || []).filter(x =>
      [x.numeroOrden, x.productoCodigo, x.productoNombre, x.estado, x.cliente, x.lote]
        .some(v => String(v || '').toLowerCase().includes(t))
    );
  }

  get pagedOrders() {
    const start = (this.page - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  get visibleOrders() {
    if (!this.selectedOrderRoute) {
      return this.pagedOrders;
    }

    const selected = this.filtered.find(order => order.id === this.selectedOrderRoute?.id)
      ?? this.items.find(order => order.id === this.selectedOrderRoute?.id);

    return selected ? [selected] : [];
  }

  get visibleRecordsCount() {
    return this.selectedOrderRoute ? this.visibleOrders.length : this.filtered.length;
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
    if (!this.form.numeroOrden) {
      this.error = 'Número de orden es requerido';
      return;
    }

    if (!this.form.productoId && !this.form.productoCodigo) {
      this.error = 'Debe proporcionar Producto ID o Código de Producto';
      return;
    }

    this.loading = true;
    this.error = null;

    const dto: CreateOrdenDto = {
      numeroOrden: this.form.numeroOrden,
      productoId: this.form.productoId || undefined,
      productoCodigo: this.form.productoCodigo || undefined,
      productoNombre: this.form.productoNombre || undefined,
      cantidadPlanificada: this.form.cantidadPlanificada,
      unidadMedida: this.form.unidadMedida,
      estado: this.form.estado || undefined,
      prioridad: this.form.prioridad || undefined,
      fechaInicioPlanificada: this.form.fechaInicioPlanificada || undefined,
      fechaFinPlanificada: this.form.fechaFinPlanificada || undefined,
      rutaId: this.form.rutaId || undefined,
      lote: this.form.lote || undefined,
      cliente: this.form.cliente || undefined,
      pedidoCliente: this.form.pedidoCliente || undefined,
      notas: this.form.notas || undefined,
      parametros: this.dynamicFormValues,
    };

    if (!this.dynamicFormValid) {
      this.error = 'Completa los campos dinamicos requeridos del registro de produccion.';
      this.loading = false;
      return;
    }

    if (this.editingId) {
      this.ordenesService.update(this.editingId, dto).subscribe({
        next: (updated) => {
          console.log('Orden updated:', updated);
          this.q = '';
          this.loadOrdenes();
          this.cancelEdit();
        },
        error: (err) => {
          console.error('Error updating:', err);
          this.error = this.extractErrorMessage(err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.ordenesService.create(dto).subscribe({
        next: (created) => {
          console.log('Orden created:', created);
          this.q = '';
          this.loadOrdenes();
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
        return 'Ya existe una orden con este número.';
      case 422:
        return 'Error de validación: ' + (err.error?.message || 'Verifica los datos ingresados');
      case 500:
        return 'Error del servidor. Intenta nuevamente.';
      default:
        return err.message || 'Error desconocido';
    }
  }

  edit(item: Orden) {
    this.formPanelOpen = true;
    this.editingId = item.id;
    this.form = {
      numeroOrden: item.numeroOrden,
      productoId: item.productoId,
      productoCodigo: item.productoCodigo || '',
      productoNombre: item.productoNombre || '',
      cantidadPlanificada: item.cantidadPlanificada,
      unidadMedida: item.unidadMedida,
      estado: item.estado,
      prioridad: item.prioridad || PrioridadOrden.NORMAL,
      fechaInicioPlanificada: item.fechaInicioPlanificada || '',
      fechaFinPlanificada: item.fechaFinPlanificada || '',
      rutaId: item.rutaId || '',
      lote: item.lote || '',
      cliente: item.cliente || '',
      pedidoCliente: item.pedidoCliente || '',
      notas: item.notas || '',
    };
    this.error = null;
    this.dynamicFormValues = { ...(item.parametros ?? {}) };
    this.cdr.detectChanges();
  }

  private isApprovedOrder(order: Orden): boolean {
    const status = String(order.estado || '').toUpperCase();
    return status === EstadoOrden.LIBERADA || status === 'APROBADA';
  }

  remove(order: Orden) {
    if (this.isApprovedOrder(order)) {
      alert('Es imposible eliminar una orden ya aprobada. Solo se pueden anular o inhabilitar.');
      return;
    }

    if (!confirm('¿Eliminar esta orden?')) return;

    this.loading = true;
    this.ordenesService.delete(order.id).subscribe({
      next: () => {
        console.log('Orden deleted');
        this.loadOrdenes();
        this.ensurePageInRange();
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
    this.formPanelOpen = false;
  }

  openCreatePanel() {
    this.editingId = null;
    this.resetForm();
    this.formPanelOpen = true;
  }

  resetForm() {
    this.form = {
      numeroOrden: '',
      productoId: '',
      productoCodigo: '',
      productoNombre: '',
      cantidadPlanificada: 0,
      unidadMedida: 'UND',
      estado: EstadoOrden.PENDIENTE,
      prioridad: PrioridadOrden.NORMAL,
      fechaInicioPlanificada: '',
      fechaFinPlanificada: '',
      rutaId: '',
      lote: '',
      cliente: '',
      pedidoCliente: '',
      notas: '',
    };
    this.error = null;
    this.dynamicFormValues = {};
    this.dynamicFormValid = true;
    this.loading = false;
    this.cdr.detectChanges();
  }

  onDynamicFormValueChange(values: Record<string, any>) {
    this.dynamicFormValues = values;
  }

  onDynamicFormValidityChange(valid: boolean) {
    this.dynamicFormValid = valid;
  }

  badgeClass(estado: EstadoOrden) {
    switch (estado) {
      case EstadoOrden.LIBERADA: return 'ui-badge-warn';
      case EstadoOrden.EN_PROCESO: return 'ui-badge';
      case EstadoOrden.COMPLETADA: return 'ui-badge-ok';
      case EstadoOrden.CANCELADA: return 'ui-badge-bad';
      case EstadoOrden.PAUSADA: return 'ui-badge-warn';
      default: return 'ui-badge';
    }
  }

  prioridadClass(prioridad?: PrioridadOrden) {
    switch (prioridad) {
      case PrioridadOrden.URGENTE: return 'text-red-600 font-bold';
      case PrioridadOrden.ALTA: return 'text-orange-600 font-semibold';
      case PrioridadOrden.NORMAL: return 'text-slate-600';
      case PrioridadOrden.BAJA: return 'text-slate-400';
      default: return 'text-slate-600';
    }
  }

  // ── Route visualization ──
  showRoute(order: Orden) {
    if (this.selectedOrderRoute?.id === order.id) {
      this.closeRouteView();
      return;
    }
    this.selectedOrderRoute = order;
    this.routeSteps = this.getRouteForOrder(order);
  }

  closeRouteView() {
    this.selectedOrderRoute = null;
    this.routeSteps = [];
  }

  private getRouteForOrder(order: Orden): OrderRouteStep[] {
    if (this.fakeRoutes[order.id]) return this.fakeRoutes[order.id];

    const templates: OrderRouteStep[][] = [
      [
        { seq: 1, workCenter: 'CT-COR', machineCode: 'COR-001', machineName: 'Cortadora CNC', operation: 'Corte', setupTimeMin: 30, estimatedHours: 4, status: 'COMPLETED', startedAt: '2026-04-10 08:00', completedAt: '2026-04-10 12:30' },
        { seq: 2, workCenter: 'CT-TEJ', machineCode: 'TEJ-003', machineName: 'Telar circular', operation: 'Tejido', setupTimeMin: 45, estimatedHours: 16, status: 'COMPLETED', startedAt: '2026-04-10 13:00', completedAt: '2026-04-11 14:00' },
        { seq: 3, workCenter: 'CT-TIN', machineCode: 'TIN-001', machineName: 'Autoclave teñido', operation: 'Teñido', setupTimeMin: 25, estimatedHours: 8, status: 'IN_PROGRESS', startedAt: '2026-04-11 15:00' },
        { seq: 4, workCenter: 'CT-ACA', machineCode: 'ACA-001', machineName: 'Rama acabados', operation: 'Acabado', setupTimeMin: 20, estimatedHours: 6, status: 'PENDING' },
        { seq: 5, workCenter: 'CT-INS', machineCode: 'INS-001', machineName: 'Mesa inspección', operation: 'Inspección final', setupTimeMin: 10, estimatedHours: 3, status: 'PENDING' },
      ],
      [
        { seq: 1, workCenter: 'CT-PREP', machineCode: 'PREP-01', machineName: 'Urdidora', operation: 'Preparación urdimbre', setupTimeMin: 60, estimatedHours: 8, status: 'COMPLETED', startedAt: '2026-04-08 07:00', completedAt: '2026-04-08 16:00' },
        { seq: 2, workCenter: 'CT-TEJ', machineCode: 'TEJ-005', machineName: 'Telar Jacquard', operation: 'Tejido', setupTimeMin: 90, estimatedHours: 24, status: 'IN_PROGRESS', startedAt: '2026-04-09 07:00' },
        { seq: 3, workCenter: 'CT-TIN', machineCode: 'TIN-002', machineName: 'Máquina teñido', operation: 'Teñido', setupTimeMin: 30, estimatedHours: 10, status: 'PENDING' },
        { seq: 4, workCenter: 'CT-ACA', machineCode: 'ACA-002', machineName: 'Calandra', operation: 'Calandrado', setupTimeMin: 15, estimatedHours: 4, status: 'PENDING' },
      ],
      [
        { seq: 1, workCenter: 'CT-COR', machineCode: 'COR-002', machineName: 'Cortadora láser', operation: 'Corte', setupTimeMin: 20, estimatedHours: 3, status: 'COMPLETED', startedAt: '2026-04-12 08:00', completedAt: '2026-04-12 11:30' },
        { seq: 2, workCenter: 'CT-ENS', machineCode: 'ENS-001', machineName: 'Línea ensamble', operation: 'Ensamblaje', setupTimeMin: 15, estimatedHours: 12, status: 'COMPLETED', startedAt: '2026-04-12 12:00', completedAt: '2026-04-13 10:00' },
        { seq: 3, workCenter: 'CT-CAL', machineCode: 'CAL-001', machineName: 'Estación calidad', operation: 'Control de calidad', setupTimeMin: 10, estimatedHours: 4, status: 'COMPLETED', startedAt: '2026-04-13 10:30', completedAt: '2026-04-13 15:00' },
        { seq: 4, workCenter: 'CT-EMP', machineCode: 'EMP-001', machineName: 'Empacadora', operation: 'Empaque', setupTimeMin: 10, estimatedHours: 2, status: 'COMPLETED', startedAt: '2026-04-13 15:30', completedAt: '2026-04-13 17:30' },
      ],
    ];

    // Hash using last char of id for better distribution across templates
    const hash = order.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const idx = hash % templates.length;
    let steps = templates[idx].map(s => ({ ...s }));

    // Adjust based on order status
    if (order.estado === EstadoOrden.PENDIENTE || order.estado === EstadoOrden.LIBERADA) {
      steps = steps.map(s => ({ ...s, status: 'PENDING' as const, startedAt: undefined, completedAt: undefined }));
    } else if (order.estado === EstadoOrden.COMPLETADA) {
      steps = steps.map(s => ({ ...s, status: 'COMPLETED' as const, startedAt: s.startedAt || '2026-04-10 08:00', completedAt: s.completedAt || '2026-04-13 17:00' }));
    }

    this.fakeRoutes[order.id] = steps;
    return steps;
  }

  routeProgress(): number {
    if (!this.routeSteps.length) return 0;
    const completed = this.routeSteps.filter(s => s.status === 'COMPLETED').length;
    return Math.round((completed / this.routeSteps.length) * 100);
  }

  currentStepIndex(): number {
    const idx = this.routeSteps.findIndex(s => s.status === 'IN_PROGRESS');
    return idx >= 0 ? idx : -1;
  }

  stepNodeClass(step: OrderRouteStep): string {
    switch (step.status) {
      case 'COMPLETED': return 'border-emerald-500/60 bg-emerald-500/5';
      case 'IN_PROGRESS': return 'border-blue-500/60 bg-blue-500/5 ring-2 ring-blue-500/20';
      case 'PENDING': return 'border-slate-700/80 bg-slate-900/30';
      default: return 'border-slate-700/80';
    }
  }

  stepIconClass(step: OrderRouteStep): string {
    switch (step.status) {
      case 'COMPLETED': return 'pi-check-circle text-emerald-400';
      case 'IN_PROGRESS': return 'pi-spin pi-spinner text-blue-400';
      case 'PENDING': return 'pi-circle text-slate-500';
      default: return 'pi-circle text-slate-500';
    }
  }

  stepStatusLabel(step: OrderRouteStep): string {
    switch (step.status) {
      case 'COMPLETED': return 'Completado';
      case 'IN_PROGRESS': return 'En proceso';
      case 'PENDING': return 'Pendiente';
      default: return step.status;
    }
  }

  stepConnectorClass(step: OrderRouteStep): string {
    return step.status === 'COMPLETED' ? 'from-emerald-500/60 to-emerald-500/40' : 'from-slate-600 to-slate-500';
  }

  // ── Reprogramación ──
  openRescheduleModal(order: Orden) {
    this.reprogrammingOrder = order;
    this.reprogramForm = {
      fechaInicioPlanificada: order.fechaInicioPlanificada || '',
      fechaFinPlanificada: order.fechaFinPlanificada || '',
    };
    this.reprogramError = null;
  }

  closeRescheduleModal() {
    this.reprogrammingOrder = null;
    this.reprogramForm = { fechaInicioPlanificada: '', fechaFinPlanificada: '' };
    this.reprogramError = null;
  }

  view(order: Orden) {
    this.viewingOrder = order;
  }

  closeView() {
    this.viewingOrder = null;
  }

  areReprogramDatesValid(): boolean {
    const start = this.reprogramForm.fechaInicioPlanificada;
    const end = this.reprogramForm.fechaFinPlanificada;
    if (!start || !end) return false;
    return new Date(start) < new Date(end);
  }

  isValidReschedule(): boolean {
    const start = this.reprogramForm.fechaInicioPlanificada;
    const end = this.reprogramForm.fechaFinPlanificada;

    if (!start || !end) {
      this.reprogramError = 'Ambas fechas son requeridas';
      return false;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (startDate >= endDate) {
      this.reprogramError = 'La fecha de inicio debe ser anterior a la fecha de fin';
      return false;
    }

    this.reprogramError = null;
    return true;
  }

  calculateDurationHours(): number {
    const start = new Date(this.reprogramForm.fechaInicioPlanificada);
    const end = new Date(this.reprogramForm.fechaFinPlanificada);
    return (end.getTime() - start.getTime()) / 3600000;
  }

  saveReschedule() {
    if (!this.reprogrammingOrder || !this.isValidReschedule()) return;

    this.loading = true;
    const updateDto: CreateOrdenDto = {
      numeroOrden: this.reprogrammingOrder.numeroOrden,
      cantidadPlanificada: this.reprogrammingOrder.cantidadPlanificada,
      unidadMedida: this.reprogrammingOrder.unidadMedida,
      fechaInicioPlanificada: this.reprogramForm.fechaInicioPlanificada,
      fechaFinPlanificada: this.reprogramForm.fechaFinPlanificada,
      productoId: this.reprogrammingOrder.productoId,
      productoCodigo: this.reprogrammingOrder.productoCodigo,
      productoNombre: this.reprogrammingOrder.productoNombre,
      estado: this.reprogrammingOrder.estado,
      prioridad: this.reprogrammingOrder.prioridad,
      lote: this.reprogrammingOrder.lote,
      cliente: this.reprogrammingOrder.cliente,
      pedidoCliente: this.reprogrammingOrder.pedidoCliente,
      notas: this.reprogrammingOrder.notas,
    };

    this.ordenesService.update(this.reprogrammingOrder.id, updateDto).subscribe({
      next: (updated) => {
        console.log('✅ Orden reprogramada:', updated);
        this.loadOrdenes();
        this.closeRescheduleModal();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error al reprogramar:', err);
        this.reprogramError = this.extractErrorMessage(err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}

