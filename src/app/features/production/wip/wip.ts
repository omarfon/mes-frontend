import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WIPService, WIP, CreateWIPDto } from './wip.service';
import { OrdenesService } from '../orders/orders.service';

export interface WipProcessStep {
  seq: number;
  workCenter: string;
  operation: string;
  machineCode: string;
  machineName: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'STOPPED';
  quantityIn: number;
  quantityOut: number;
  scrap: number;
  uom: string;
  efficiency: number; // %
  estimatedHours: number;
  actualHours: number;
  startedAt?: string;
  completedAt?: string;
  stops: WipStop[];
}

export interface WipStop {
  reason: string;
  category: 'MECHANICAL' | 'ELECTRICAL' | 'MATERIAL' | 'QUALITY' | 'OPERATOR' | 'OTHER';
  durationMin: number;
  startedAt: string;
  resolved: boolean;
}
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environmets/environments';

@Component({
  standalone: true,
  selector: 'app-wip',
  imports: [CommonModule, FormsModule],
  templateUrl: './wip.html',
})
export class WipComponent implements OnInit {
  form = {
    ordenId: '',
    productoId: '',
    productoNombre: '',
    workCenterId: '',
    workCenterNombre: '',
    cantidadActual: 0,
    unidadMedida: 'KG',
    lote: '',
    ubicacion: '',
    fechaEntrada: '',
    movimientos: '[]', // JSON string
  };

  items: WIP[] = [];
  editingId: string | null = null;
  formPanelOpen = false;
  q = '';
  loading = false;
  error: string | null = null;

  // Listas para selects
  ordenes: any[] = [];
  productos: any[] = [];

  // Process visualization
  selectedWip: WIP | null = null;
  processSteps: WipProcessStep[] = [];
  private fakeProcesses: Record<string, WipProcessStep[]> = {};

  constructor(
    private wipService: WIPService,
    private ordenesService: OrdenesService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadWIP();
    this.loadOrdenes();
    this.loadProductos();
  }

  loadWIP() {
    this.loading = true;
    this.error = null;
    
    this.wipService.getAll().subscribe({
      next: (data) => {
        console.log('✅ WIP loaded:', data);
        const fakes = this.seedFakeWip();
        this.items = [...(data || []), ...fakes];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error loading WIP:', err);
        this.items = this.seedFakeWip();
        this.error = null;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadOrdenes() {
    this.ordenesService.getAll().subscribe({
      next: (data) => {
        this.ordenes = data || [];
      },
      error: (err) => console.error('Error cargando órdenes:', err)
    });
  }

  loadProductos() {
    this.http.get<any>(`${environment.apiUrl}/master-data/products`).subscribe({
      next: (response) => {
        this.productos = response.data || response || [];
      },
      error: (err) => console.error('Error cargando productos:', err)
    });
  }

  get filtered() {
    const t = this.q.trim().toLowerCase();
    if (!t) return this.items || [];
    
    return (this.items || []).filter(x =>
      [x.ordenId, x.productoNombre, x.lote, x.ubicacion, x.unidadMedida]
        .some(v => String(v || '').toLowerCase().includes(t))
    );
  }

  submit() {
    if (!this.form.ordenId || !this.form.productoId || !this.form.productoNombre || !this.form.unidadMedida || !this.form.fechaEntrada) {
      this.error = 'Orden, producto, nombre de producto, unidad de medida y fecha de entrada son requeridos';
      return;
    }

    // Parsear movimientos JSON
    let movimientosObj: any = null;
    try {
      if (this.form.movimientos && this.form.movimientos.trim()) {
        movimientosObj = JSON.parse(this.form.movimientos);
      }
    } catch (e) {
      this.error = 'Movimientos debe ser un JSON válido. Ejemplo: [{"fecha":"2025-12-31","cantidad":50,"tipo":"entrada"}]';
      return;
    }

    this.loading = true;
    this.error = null;

    const dto: any = {
      ordenId: this.form.ordenId,
      productoId: this.form.productoId,
      productoNombre: this.form.productoNombre,
      cantidadActual: Number(this.form.cantidadActual),
      unidadMedida: this.form.unidadMedida,
      fechaEntrada: this.form.fechaEntrada,
    };

    // Agregar campos opcionales
    if (this.form.workCenterId) dto.workCenterId = this.form.workCenterId;
    if (this.form.workCenterNombre) dto.workCenterNombre = this.form.workCenterNombre;
    if (this.form.lote) dto.lote = this.form.lote;
    if (this.form.ubicacion) dto.ubicacion = this.form.ubicacion;
    if (movimientosObj) dto.movimientos = movimientosObj;

    console.log('📤 Enviando WIP:', JSON.stringify(dto, null, 2));

    if (this.editingId) {
      this.wipService.update(this.editingId, dto).subscribe({
        next: (updated) => {
          console.log('WIP updated:', updated);
          this.q = '';
          this.loadWIP();
          this.cancelEdit();
        },
        error: (err) => {
          console.error('❌ Error updating:', err);
          console.error('📋 Error details:', err.error);
          this.error = this.extractErrorMessage(err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.wipService.create(dto).subscribe({
        next: (created) => {
          console.log('WIP created:', created);
          this.q = '';
          this.loadWIP();
          this.resetForm();
          this.formPanelOpen = false;
        },
        error: (err) => {
          console.error('❌ Error creating:', err);
          console.error('📋 Error details:', err.error);
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
      case 404:
        return 'Recurso no encontrado.';
      case 422:
        return 'Error de validación: ' + (err.error?.message || 'Verifica los datos ingresados');
      case 500:
        return 'Error del servidor. Intenta nuevamente.';
      default:
        return err.message || 'Error desconocido';
    }
  }

  edit(item: WIP) {
    this.formPanelOpen = true;
    this.editingId = item.id;
    this.form = {
      ordenId: item.ordenId,
      productoId: item.productoId,
      productoNombre: item.productoNombre,
      workCenterId: item.workCenterId || '',
      workCenterNombre: item.workCenterNombre || '',
      cantidadActual: item.cantidadActual,
      unidadMedida: item.unidadMedida,
      lote: item.lote || '',
      ubicacion: item.ubicacion || '',
      fechaEntrada: item.fechaEntrada,
      movimientos: item.movimientos ? JSON.stringify(item.movimientos, null, 2) : '[]',
    };
    this.error = null;
    this.cdr.detectChanges();
  }

  remove(id: string) {
    if (!confirm('¿Eliminar este registro de WIP?')) return;

    this.loading = true;
    this.wipService.delete(id).subscribe({
      next: () => {
        console.log('WIP deleted');
        this.loadWIP();
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
      ordenId: '',
      productoId: '',
      productoNombre: '',
      workCenterId: '',
      workCenterNombre: '',
      cantidadActual: 0,
      unidadMedida: 'KG',
      lote: '',
      ubicacion: '',
      fechaEntrada: '',
      movimientos: '[]',
    };
    this.error = null;
    this.loading = false;
    this.cdr.detectChanges();
  }

  getOrdenInfo(ordenId: string): string {
    const orden = this.ordenes.find(o => o.id === ordenId);
    return orden ? `${orden.numeroOrden}` : ordenId.slice(0, 8) + '...';
  }

  // ══ Seed fake WIP data ══
  private seedFakeWip(): WIP[] {
    return [
      {
        id: 'wip-001', ordenId: 'ord-001', productoId: 'prod-101',
        productoNombre: 'Tela Polyester 150cm Blanco', workCenterId: 'wc-tin',
        workCenterNombre: 'CT-TIN Teñido', cantidadActual: 820, unidadMedida: 'MT',
        lote: 'L-2026-0451', ubicacion: 'Planta 1 - Nave B',
        fechaEntrada: '2026-04-10T08:00:00Z', activo: true,
        createdAt: '2026-04-10T08:00:00Z', updatedAt: '2026-04-16T14:00:00Z',
      },
      {
        id: 'wip-002', ordenId: 'ord-002', productoId: 'prod-102',
        productoNombre: 'Tela Algodón 180cm Azul Marino', workCenterId: 'wc-prep',
        workCenterNombre: 'CT-PREP Preparación', cantidadActual: 0, unidadMedida: 'MT',
        lote: 'L-2026-0452', ubicacion: 'Planta 1 - Nave A',
        fechaEntrada: '2026-04-18T07:00:00Z', activo: true,
        createdAt: '2026-04-18T07:00:00Z', updatedAt: '2026-04-18T07:00:00Z',
      },
      {
        id: 'wip-003', ordenId: 'ord-005', productoId: 'prod-105',
        productoNombre: 'Tela Mezclilla 12oz 160cm', workCenterId: 'wc-tej',
        workCenterNombre: 'CT-TEJ Tejido', cantidadActual: 2100, unidadMedida: 'MT',
        lote: 'L-2026-0449', ubicacion: 'Planta 2 - Nave C',
        fechaEntrada: '2026-04-07T07:30:00Z', activo: true,
        createdAt: '2026-04-07T07:30:00Z', updatedAt: '2026-04-14T09:10:00Z',
      },
      {
        id: 'wip-004', ordenId: 'ord-001', productoId: 'prod-101',
        productoNombre: 'Tela Polyester 150cm Blanco', workCenterId: 'wc-aca',
        workCenterNombre: 'CT-ACA Acabados', cantidadActual: 380, unidadMedida: 'MT',
        lote: 'L-2026-0451-B', ubicacion: 'Planta 1 - Nave C',
        fechaEntrada: '2026-04-12T06:00:00Z', activo: true,
        createdAt: '2026-04-12T06:00:00Z', updatedAt: '2026-04-15T18:00:00Z',
      },
      {
        id: 'wip-005', ordenId: 'ord-003', productoId: 'prod-103',
        productoNombre: 'Hilo Nylon 40/2 Negro', workCenterId: 'wc-emp',
        workCenterNombre: 'CT-EMP Empaque', cantidadActual: 500, unidadMedida: 'KG',
        lote: 'L-2026-0448', ubicacion: 'Planta 1 - Zona Despacho',
        fechaEntrada: '2026-04-05T08:00:00Z', activo: true,
        createdAt: '2026-04-05T08:00:00Z', updatedAt: '2026-04-11T17:00:00Z',
      },
    ];
  }

  // ══ Process visualization ══
  showProcess(wip: WIP) {
    if (this.selectedWip?.id === wip.id) {
      this.selectedWip = null;
      this.processSteps = [];
      return;
    }
    this.selectedWip = wip;
    this.processSteps = this.getProcessForWip(wip);
  }

  private getProcessForWip(wip: WIP): WipProcessStep[] {
    if (this.fakeProcesses[wip.id]) return this.fakeProcesses[wip.id];

    const templates: WipProcessStep[][] = [
      // Template 0: Textile full route – currently at Teñido
      [
        { seq: 1, workCenter: 'CT-COR', operation: 'Corte de tela', machineCode: 'COR-001', machineName: 'Cortadora CNC',
          status: 'COMPLETED', quantityIn: 2500, quantityOut: 2480, scrap: 20, uom: 'MT', efficiency: 96.2,
          estimatedHours: 4, actualHours: 4.5, startedAt: '2026-04-10 08:00', completedAt: '2026-04-10 12:30',
          stops: [{ reason: 'Cambio de cuchilla', category: 'MECHANICAL', durationMin: 18, startedAt: '2026-04-10 10:15', resolved: true }]
        },
        { seq: 2, workCenter: 'CT-TEJ', operation: 'Tejido', machineCode: 'TEJ-003', machineName: 'Telar circular',
          status: 'COMPLETED', quantityIn: 2480, quantityOut: 2450, scrap: 30, uom: 'MT', efficiency: 93.8,
          estimatedHours: 16, actualHours: 17.2, startedAt: '2026-04-10 13:00', completedAt: '2026-04-11 14:00',
          stops: [
            { reason: 'Rotura de hilo', category: 'MATERIAL', durationMin: 25, startedAt: '2026-04-10 18:30', resolved: true },
            { reason: 'Ajuste de tensión', category: 'MECHANICAL', durationMin: 12, startedAt: '2026-04-11 09:00', resolved: true },
          ]
        },
        { seq: 3, workCenter: 'CT-TIN', operation: 'Teñido', machineCode: 'TIN-001', machineName: 'Autoclave teñido',
          status: 'IN_PROGRESS', quantityIn: 2450, quantityOut: 820, scrap: 5, uom: 'MT', efficiency: 88.4,
          estimatedHours: 8, actualHours: 5.5, startedAt: '2026-04-11 15:00',
          stops: [{ reason: 'Temperatura fuera de rango', category: 'MECHANICAL', durationMin: 35, startedAt: '2026-04-12 02:00', resolved: true }]
        },
        { seq: 4, workCenter: 'CT-ACA', operation: 'Acabado', machineCode: 'ACA-001', machineName: 'Rama acabados',
          status: 'PENDING', quantityIn: 0, quantityOut: 0, scrap: 0, uom: 'MT', efficiency: 0,
          estimatedHours: 6, actualHours: 0, stops: []
        },
        { seq: 5, workCenter: 'CT-INS', operation: 'Inspección final', machineCode: 'INS-001', machineName: 'Mesa inspección',
          status: 'PENDING', quantityIn: 0, quantityOut: 0, scrap: 0, uom: 'MT', efficiency: 0,
          estimatedHours: 3, actualHours: 0, stops: []
        },
      ],
      // Template 1: Preparation stage – just starting
      [
        { seq: 1, workCenter: 'CT-PREP', operation: 'Preparación urdimbre', machineCode: 'PREP-01', machineName: 'Urdidora',
          status: 'IN_PROGRESS', quantityIn: 1800, quantityOut: 0, scrap: 0, uom: 'MT', efficiency: 0,
          estimatedHours: 8, actualHours: 1.5, startedAt: '2026-04-18 07:00',
          stops: []
        },
        { seq: 2, workCenter: 'CT-TEJ', operation: 'Tejido Jacquard', machineCode: 'TEJ-005', machineName: 'Telar Jacquard',
          status: 'PENDING', quantityIn: 0, quantityOut: 0, scrap: 0, uom: 'MT', efficiency: 0,
          estimatedHours: 24, actualHours: 0, stops: []
        },
        { seq: 3, workCenter: 'CT-TIN', operation: 'Teñido reactivo', machineCode: 'TIN-002', machineName: 'Máquina teñido',
          status: 'PENDING', quantityIn: 0, quantityOut: 0, scrap: 0, uom: 'MT', efficiency: 0,
          estimatedHours: 10, actualHours: 0, stops: []
        },
        { seq: 4, workCenter: 'CT-ACA', operation: 'Calandrado', machineCode: 'ACA-002', machineName: 'Calandra',
          status: 'PENDING', quantityIn: 0, quantityOut: 0, scrap: 0, uom: 'MT', efficiency: 0,
          estimatedHours: 4, actualHours: 0, stops: []
        },
      ],
      // Template 2: Denim – stopped at weaving
      [
        { seq: 1, workCenter: 'CT-PREP', operation: 'Preparación índigo', machineCode: 'PREP-02', machineName: 'Tina índigo',
          status: 'COMPLETED', quantityIn: 4000, quantityOut: 3950, scrap: 50, uom: 'MT', efficiency: 94.5,
          estimatedHours: 6, actualHours: 6.8, startedAt: '2026-04-07 07:30', completedAt: '2026-04-07 15:00',
          stops: [{ reason: 'Reposición de colorante', category: 'MATERIAL', durationMin: 22, startedAt: '2026-04-07 11:00', resolved: true }]
        },
        { seq: 2, workCenter: 'CT-TEJ', operation: 'Tejido denim', machineCode: 'TEJ-008', machineName: 'Telar lanzadera',
          status: 'STOPPED', quantityIn: 3950, quantityOut: 2100, scrap: 45, uom: 'MT', efficiency: 78.3,
          estimatedHours: 32, actualHours: 22, startedAt: '2026-04-08 06:00',
          stops: [
            { reason: 'Rotura de trama', category: 'MATERIAL', durationMin: 40, startedAt: '2026-04-09 14:00', resolved: true },
            { reason: 'Fallo motor principal', category: 'ELECTRICAL', durationMin: 120, startedAt: '2026-04-12 09:00', resolved: true },
            { reason: 'Sin insumo índigo - esperando proveedor', category: 'MATERIAL', durationMin: 0, startedAt: '2026-04-14 09:00', resolved: false },
          ]
        },
        { seq: 3, workCenter: 'CT-ACA', operation: 'Sanforizado', machineCode: 'SAN-001', machineName: 'Sanforizadora',
          status: 'PENDING', quantityIn: 0, quantityOut: 0, scrap: 0, uom: 'MT', efficiency: 0,
          estimatedHours: 8, actualHours: 0, stops: []
        },
        { seq: 4, workCenter: 'CT-INS', operation: 'Inspección final', machineCode: 'INS-002', machineName: 'Mesa inspección 2',
          status: 'PENDING', quantityIn: 0, quantityOut: 0, scrap: 0, uom: 'MT', efficiency: 0,
          estimatedHours: 4, actualHours: 0, stops: []
        },
      ],
      // Template 3: Acabado – mostly done
      [
        { seq: 1, workCenter: 'CT-COR', operation: 'Corte', machineCode: 'COR-001', machineName: 'Cortadora CNC',
          status: 'COMPLETED', quantityIn: 2500, quantityOut: 2480, scrap: 20, uom: 'MT', efficiency: 97.1,
          estimatedHours: 3, actualHours: 3.2, startedAt: '2026-04-12 06:00', completedAt: '2026-04-12 09:30',
          stops: []
        },
        { seq: 2, workCenter: 'CT-TEJ', operation: 'Tejido', machineCode: 'TEJ-003', machineName: 'Telar circular',
          status: 'COMPLETED', quantityIn: 2480, quantityOut: 2440, scrap: 40, uom: 'MT', efficiency: 91.5,
          estimatedHours: 14, actualHours: 15.5, startedAt: '2026-04-12 10:00', completedAt: '2026-04-13 12:00',
          stops: [{ reason: 'Ajuste de densidad', category: 'QUALITY', durationMin: 30, startedAt: '2026-04-12 22:00', resolved: true }]
        },
        { seq: 3, workCenter: 'CT-ACA', operation: 'Acabado térmico', machineCode: 'ACA-001', machineName: 'Rama acabados',
          status: 'IN_PROGRESS', quantityIn: 2440, quantityOut: 380, scrap: 8, uom: 'MT', efficiency: 85.2,
          estimatedHours: 6, actualHours: 4, startedAt: '2026-04-13 13:00',
          stops: [{ reason: 'Parada por turno operador', category: 'OPERATOR', durationMin: 45, startedAt: '2026-04-14 06:00', resolved: true }]
        },
        { seq: 4, workCenter: 'CT-INS', operation: 'Inspección calidad', machineCode: 'INS-001', machineName: 'Mesa inspección',
          status: 'PENDING', quantityIn: 0, quantityOut: 0, scrap: 0, uom: 'MT', efficiency: 0,
          estimatedHours: 3, actualHours: 0, stops: []
        },
      ],
      // Template 4: All done
      [
        { seq: 1, workCenter: 'CT-EXT', operation: 'Extrusión', machineCode: 'EXT-001', machineName: 'Extrusora',
          status: 'COMPLETED', quantityIn: 520, quantityOut: 510, scrap: 10, uom: 'KG', efficiency: 97.8,
          estimatedHours: 4, actualHours: 3.8, startedAt: '2026-04-05 08:00', completedAt: '2026-04-05 12:00',
          stops: []
        },
        { seq: 2, workCenter: 'CT-BOB', operation: 'Bobinado', machineCode: 'BOB-003', machineName: 'Bobinadora auto',
          status: 'COMPLETED', quantityIn: 510, quantityOut: 505, scrap: 5, uom: 'KG', efficiency: 98.2,
          estimatedHours: 6, actualHours: 5.5, startedAt: '2026-04-05 13:00', completedAt: '2026-04-06 10:00',
          stops: [{ reason: 'Cambio de cono', category: 'MECHANICAL', durationMin: 10, startedAt: '2026-04-05 18:00', resolved: true }]
        },
        { seq: 3, workCenter: 'CT-CAL', operation: 'Control calidad', machineCode: 'CAL-001', machineName: 'Estación calidad',
          status: 'COMPLETED', quantityIn: 505, quantityOut: 500, scrap: 5, uom: 'KG', efficiency: 99.0,
          estimatedHours: 3, actualHours: 2.5, startedAt: '2026-04-06 11:00', completedAt: '2026-04-06 14:00',
          stops: []
        },
        { seq: 4, workCenter: 'CT-EMP', operation: 'Empaque', machineCode: 'EMP-001', machineName: 'Empacadora',
          status: 'COMPLETED', quantityIn: 500, quantityOut: 500, scrap: 0, uom: 'KG', efficiency: 100,
          estimatedHours: 2, actualHours: 1.8, startedAt: '2026-04-06 14:30', completedAt: '2026-04-06 16:30',
          stops: []
        },
      ],
    ];

    const hash = wip.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const idx = hash % templates.length;
    this.fakeProcesses[wip.id] = templates[idx];
    return templates[idx];
  }

  processProgress(): number {
    if (!this.processSteps.length) return 0;
    const done = this.processSteps.filter(s => s.status === 'COMPLETED').length;
    return Math.round((done / this.processSteps.length) * 100);
  }

  overallEfficiency(): number {
    const active = this.processSteps.filter(s => s.efficiency > 0);
    if (!active.length) return 0;
    return Math.round(active.reduce((sum, s) => sum + s.efficiency, 0) / active.length * 10) / 10;
  }

  totalStops(): number {
    return this.processSteps.reduce((sum, s) => sum + s.stops.length, 0);
  }

  totalStopMinutes(): number {
    return this.processSteps.reduce((sum, s) => sum + s.stops.reduce((a, st) => a + st.durationMin, 0), 0);
  }

  unresolvedStops(): number {
    return this.processSteps.reduce((sum, s) => sum + s.stops.filter(st => !st.resolved).length, 0);
  }

  stepNodeClass(step: WipProcessStep): string {
    switch (step.status) {
      case 'COMPLETED': return 'border-emerald-500/60 bg-emerald-500/5';
      case 'IN_PROGRESS': return 'border-blue-500/60 bg-blue-500/5 ring-2 ring-blue-500/20';
      case 'STOPPED': return 'border-red-500/60 bg-red-500/5 ring-2 ring-red-500/20';
      case 'PENDING': return 'border-slate-700/80 bg-slate-900/30';
      default: return 'border-slate-700/80';
    }
  }

  stepIconClass(step: WipProcessStep): string {
    switch (step.status) {
      case 'COMPLETED': return 'pi-check-circle text-emerald-400';
      case 'IN_PROGRESS': return 'pi-spin pi-spinner text-blue-400';
      case 'STOPPED': return 'pi-exclamation-triangle text-red-400';
      case 'PENDING': return 'pi-circle text-slate-500';
      default: return 'pi-circle text-slate-500';
    }
  }

  stepStatusLabel(step: WipProcessStep): string {
    switch (step.status) {
      case 'COMPLETED': return 'Completado';
      case 'IN_PROGRESS': return 'En proceso';
      case 'STOPPED': return 'Detenido';
      case 'PENDING': return 'Pendiente';
      default: return step.status;
    }
  }

  stepConnectorClass(step: WipProcessStep): string {
    if (step.status === 'COMPLETED') return 'from-emerald-500/60 to-emerald-500/40';
    if (step.status === 'STOPPED') return 'from-red-500/60 to-red-500/40';
    return 'from-slate-600 to-slate-500';
  }

  efficiencyColor(eff: number): string {
    if (eff >= 95) return 'text-emerald-400';
    if (eff >= 85) return 'text-blue-400';
    if (eff >= 70) return 'text-amber-400';
    return 'text-red-400';
  }

  efficiencyBarColor(eff: number): string {
    if (eff >= 95) return 'bg-emerald-500';
    if (eff >= 85) return 'bg-blue-500';
    if (eff >= 70) return 'bg-amber-500';
    return 'bg-red-500';
  }

  stopCategoryLabel(cat: string): string {
    const labels: Record<string, string> = {
      MECHANICAL: 'Mecánica', ELECTRICAL: 'Eléctrica', MATERIAL: 'Material',
      QUALITY: 'Calidad', OPERATOR: 'Operador', OTHER: 'Otra',
    };
    return labels[cat] || cat;
  }

  stopCategoryBadge(cat: string): string {
    const classes: Record<string, string> = {
      MECHANICAL: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      ELECTRICAL: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
      MATERIAL: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      QUALITY: 'bg-red-500/10 text-red-400 border-red-500/30',
      OPERATOR: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      OTHER: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    };
    return classes[cat] || 'bg-slate-500/10 text-slate-400';
  }

  hasUnresolvedStop(step: WipProcessStep): boolean {
    return step.stops.some(s => !s.resolved);
  }
}
