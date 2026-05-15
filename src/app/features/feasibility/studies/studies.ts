import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  FeasibilityService,
  FeasibilityStudy,
  FeasibilityStatus,
  Priority,
  RouteStep,
  MaterialLine,
} from '../feasibility.service';
import { EmpresasService, EmpresaSelectItem } from '../../master-data/empresas/empresas.service';
import { ProductsService, ProductSelectItem } from '../../master-data/products/products.service';

@Component({
  standalone: true,
  selector: 'app-feasibility-studies',
  imports: [CommonModule, FormsModule],
  templateUrl: './studies.html',
})
export class FeasibilityStudiesComponent implements OnInit {
  items: FeasibilityStudy[] = [];
  loading = false;
  error: string | null = null;
  q = '';
  filterStatus = '';
  filterPriority = '';

  // Detail / form
  showForm = false;
  editingId: string | null = null;
  formTab: string = 'request';
  routeViewMode: 'list' | 'graph' = 'list';
  editingStepIndex: number | null = null;

  statuses: { value: FeasibilityStatus; label: string; color: string }[] = [
    { value: 'DRAFT', label: 'Borrador', color: 'text-slate-400' },
    { value: 'EVALUATING', label: 'En evaluación', color: 'text-blue-400' },
    { value: 'FEASIBLE', label: 'Factible', color: 'text-emerald-400' },
    { value: 'NOT_FEASIBLE', label: 'No factible', color: 'text-rose-400' },
    { value: 'QUOTED', label: 'Cotizado', color: 'text-amber-400' },
    { value: 'APPROVED', label: 'Aprobado', color: 'text-emerald-400' },
    { value: 'REJECTED', label: 'Rechazado', color: 'text-rose-400' },
  ];

  priorities: { value: Priority; label: string }[] = [
    { value: 'LOW', label: 'Baja' },
    { value: 'MEDIUM', label: 'Media' },
    { value: 'HIGH', label: 'Alta' },
    { value: 'URGENT', label: 'Urgente' },
  ];

  form: any = this.emptyForm();
  empresas: EmpresaSelectItem[] = [];
  products: ProductSelectItem[] = [];

  constructor(
    private svc: FeasibilityService,
    private empresasSvc: EmpresasService,
    private productsSvc: ProductsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.load();
    this.loadEmpresas();
    this.loadProducts();
  }

  loadEmpresas() {
    this.empresasSvc.getSelectList().subscribe({
      next: (list) => { this.empresas = list; this.cdr.detectChanges(); },
      error: () => { this.empresas = []; }
    });
  }

  loadProducts() {
    this.productsSvc.getSelectList().subscribe({
      next: (list) => { this.products = list; this.cdr.detectChanges(); },
      error: () => { this.products = []; }
    });
  }

  onEmpresaChange(id: string) {
    const found = this.empresas.find(e => e.id === id);
    if (found) { this.form.clientName = found.name; }
  }

  onProductChange(id: string) {
    const found = this.products.find(p => p.id === id);
    if (found) {
      this.form.productName = found.name;
      this.form.productCode = found.code;
      if (found.unitOfMeasure) { this.form.uom = found.unitOfMeasure; }
    }
  }

  emptyForm(): any {
    return {
      code: '',
      clientName: '',
      empresaId: '',
      clientContact: '',
      requestDate: new Date().toISOString().substring(0, 10),
      requiredDate: '',
      productName: '',
      productCode: '',
      productId: '',
      description: '',
      quantity: null,
      uom: 'piezas',
      priority: 'MEDIUM' as Priority,
      status: 'DRAFT' as FeasibilityStatus,
      // Técnico
      technicalNotes: '',
      hasMachineCapacity: false,
      hasTooling: false,
      hasMaterials: false,
      hasLabor: false,
      qualityRequirements: '',
      specialConditions: '',
      // Ruta
      routeSteps: [] as RouteStep[],
      // Materiales
      materials: [] as MaterialLine[],
      // Tiempos
      estimatedSetupHours: null,
      estimatedProductionHours: null,
      estimatedTotalDays: null,
      proposedDeliveryDate: '',
      // Costos
      materialCost: null,
      laborCost: null,
      overheadCost: null,
      totalCost: null,
      margin: 20,
      quotePrice: null,
      currency: 'USD',
      // Resultado
      feasible: null,
      rejectionReason: '',
      approvedBy: '',
    };
  }

  load() {
    this.loading = true;
    this.error = null;
    this.svc.getAll().subscribe({
      next: (data) => {
        this.items = data && data.length ? data : this.seedFakeData();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.items = this.seedFakeData();
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private seedFakeData(): FeasibilityStudy[] {
    return [
      {
        id: '1', code: 'FAC-0001', clientName: 'Textiles del Pacífico S.A.', clientContact: 'carlos.mendez@texpac.com',
        requestDate: '2026-04-01', requiredDate: '2026-05-15', productName: 'Tela Jersey 30/1 algodón',
        productCode: 'PROD-TJ301', description: 'Tela jersey 100% algodón peinado, ancho tubular 90cm, peso 160 g/m²',
        quantity: 5000, uom: 'metros', priority: 'HIGH' as Priority, status: 'APPROVED' as FeasibilityStatus,
        hasMachineCapacity: true, hasTooling: true, hasMaterials: true, hasLabor: true,
        technicalNotes: 'Se requieren 2 telares circulares disponibles en turno A y B',
        qualityRequirements: 'Norma AATCC, tolerancia de peso ±5%', specialConditions: '',
        routeSteps: [
          { seq: 1, workCenter: 'CT-TEJ', machineCode: 'TEJ-001', machineName: 'Telar circular #1', operation: 'Tejido', setupTimeMin: 45, cycleTimeSec: 12, estimatedHours: 40, notes: '' },
          { seq: 2, workCenter: 'CT-TIN', machineCode: 'TIN-002', machineName: 'Máquina de teñido', operation: 'Teñido', setupTimeMin: 30, cycleTimeSec: 0, estimatedHours: 16, notes: 'Color azul marino' },
          { seq: 3, workCenter: 'CT-ACA', machineCode: 'ACA-001', machineName: 'Rama acabados', operation: 'Acabado', setupTimeMin: 20, cycleTimeSec: 8, estimatedHours: 8, notes: '' },
        ],
        materials: [
          { materialCode: 'MAT-ALG01', materialName: 'Hilo algodón 30/1', qty: 850, uom: 'kg', unitCost: 4.5, available: true, leadTimeDays: 0 },
          { materialCode: 'MAT-TINT03', materialName: 'Tinte reactivo azul', qty: 25, uom: 'kg', unitCost: 18.0, available: true, leadTimeDays: 3 },
        ],
        estimatedSetupHours: 1.58, estimatedProductionHours: 64, estimatedTotalDays: 9,
        proposedDeliveryDate: '2026-05-12', materialCost: 4275, laborCost: 1640, overheadCost: 800,
        totalCost: 6715, margin: 25, quotePrice: 8393.75, currency: 'USD',
        feasible: true, rejectionReason: '', approvedBy: 'Ing. Martínez',
        createdAt: '2026-04-01', updatedAt: '2026-04-05',
      },
      {
        id: '2', code: 'FAC-0002', clientName: 'Confecciones Aurora Ltda.', clientContact: 'laura.rios@aurora.co',
        requestDate: '2026-04-03', requiredDate: '2026-06-01', productName: 'Tela Rib 1x1 poliéster',
        productCode: 'PROD-RB11', description: 'Rib 1x1 poliéster reciclado, ancho 60cm, gramaje 220 g/m²',
        quantity: 3000, uom: 'metros', priority: 'MEDIUM' as Priority, status: 'EVALUATING' as FeasibilityStatus,
        hasMachineCapacity: true, hasTooling: true, hasMaterials: false, hasLabor: true,
        technicalNotes: 'Pendiente confirmar stock de hilo poliéster reciclado con proveedor',
        qualityRequirements: 'Certificación GRS (Global Recycled Standard)', specialConditions: 'Empaque en rollos de 50m',
        routeSteps: [
          { seq: 1, workCenter: 'CT-TEJ', machineCode: 'TEJ-003', machineName: 'Telar circular Rib', operation: 'Tejido Rib', setupTimeMin: 60, cycleTimeSec: 15, estimatedHours: 30, notes: '' },
          { seq: 2, workCenter: 'CT-TIN', machineCode: 'TIN-001', machineName: 'Autoclave teñido', operation: 'Teñido', setupTimeMin: 40, cycleTimeSec: 0, estimatedHours: 12, notes: 'Varios colores' },
        ],
        materials: [
          { materialCode: 'MAT-PES02', materialName: 'Hilo poliéster reciclado 150D', qty: 700, uom: 'kg', unitCost: 5.2, available: false, leadTimeDays: 12 },
        ],
        estimatedSetupHours: 1.67, estimatedProductionHours: 42, estimatedTotalDays: 6,
        proposedDeliveryDate: '2026-05-28', materialCost: 3640, laborCost: 1090, overheadCost: 550,
        totalCost: 5280, margin: 20, quotePrice: 6336, currency: 'USD',
        feasible: null, rejectionReason: '', approvedBy: '',
        createdAt: '2026-04-03', updatedAt: '2026-04-10',
      },
      {
        id: '3', code: 'FAC-0003', clientName: 'Deportivos ProFit S.A.S.', clientContact: 'ventas@profitdeport.com',
        requestDate: '2026-04-07', requiredDate: '2026-05-20', productName: 'Malla deportiva dry-fit',
        productCode: 'PROD-MDF01', description: 'Malla deportiva 100% poliéster micro, secado rápido, 140 g/m²',
        quantity: 8000, uom: 'metros', priority: 'URGENT' as Priority, status: 'QUOTED' as FeasibilityStatus,
        hasMachineCapacity: true, hasTooling: true, hasMaterials: true, hasLabor: true,
        technicalNotes: 'Alta demanda, se necesita turno extra para cumplir fecha',
        qualityRequirements: 'Test de absorción < 5 min, pilling grado 4+', specialConditions: 'Entrega parcial 4000m a los 10 días',
        routeSteps: [
          { seq: 1, workCenter: 'CT-TEJ', machineCode: 'TEJ-005', machineName: 'Telar Jacquard', operation: 'Tejido malla', setupTimeMin: 90, cycleTimeSec: 10, estimatedHours: 55, notes: '' },
          { seq: 2, workCenter: 'CT-TIN', machineCode: 'TIN-002', machineName: 'Máquina de teñido', operation: 'Teñido sublimación', setupTimeMin: 25, cycleTimeSec: 0, estimatedHours: 20, notes: '' },
          { seq: 3, workCenter: 'CT-ACA', machineCode: 'ACA-002', machineName: 'Calandra', operation: 'Calandrado', setupTimeMin: 15, cycleTimeSec: 5, estimatedHours: 10, notes: '' },
        ],
        materials: [
          { materialCode: 'MAT-PES01', materialName: 'Hilo micro poliéster 75D', qty: 1200, uom: 'kg', unitCost: 3.8, available: true, leadTimeDays: 0 },
          { materialCode: 'MAT-SUBL01', materialName: 'Tinta sublimación', qty: 15, uom: 'lt', unitCost: 45.0, available: true, leadTimeDays: 0 },
        ],
        estimatedSetupHours: 2.17, estimatedProductionHours: 85, estimatedTotalDays: 11,
        proposedDeliveryDate: '2026-05-18', materialCost: 5235, laborCost: 2180, overheadCost: 1100,
        totalCost: 8515, margin: 30, quotePrice: 11069.5, currency: 'USD',
        feasible: true, rejectionReason: '', approvedBy: 'Ing. Rodríguez',
        createdAt: '2026-04-07', updatedAt: '2026-04-12',
      },
      {
        id: '4', code: 'FAC-0004', clientName: 'Uniformes Nacionales S.A.', clientContact: 'compras@uninac.com.co',
        requestDate: '2026-04-10', requiredDate: '2026-07-01', productName: 'Dril industrial 16 oz',
        productCode: 'PROD-DRI16', description: 'Dril algodón/poliéster 65/35, peso 16 oz, ancho 1.50m, para uniformes industriales',
        quantity: 2000, uom: 'metros', priority: 'LOW' as Priority, status: 'NOT_FEASIBLE' as FeasibilityStatus,
        hasMachineCapacity: false, hasTooling: false, hasMaterials: true, hasLabor: true,
        technicalNotes: 'No se cuenta con telares planos para tejido dril. Se requeriría inversión en maquinaria.',
        qualityRequirements: 'Resistencia al desgarro > 40N, solidez al lavado grado 4', specialConditions: '',
        routeSteps: [],
        materials: [],
        estimatedSetupHours: null, estimatedProductionHours: null, estimatedTotalDays: null,
        proposedDeliveryDate: '', materialCost: null, laborCost: null, overheadCost: null,
        totalCost: null, margin: 20, quotePrice: null, currency: 'USD',
        feasible: false, rejectionReason: 'No se dispone de telares planos para tejido dril pesado. Se recomienda tercerizar o evaluar inversión.', approvedBy: '',
        createdAt: '2026-04-10', updatedAt: '2026-04-11',
      },
      {
        id: '5', code: 'FAC-0005', clientName: 'Moda Express Internacional', clientContact: 'andrea.luna@modaexpress.com',
        requestDate: '2026-04-14', requiredDate: '2026-06-15', productName: 'Interlock algodón/spandex',
        productCode: 'PROD-INT02', description: 'Interlock 95% algodón 5% spandex, gramaje 200 g/m², ancho 1.60m',
        quantity: 4500, uom: 'metros', priority: 'HIGH' as Priority, status: 'DRAFT' as FeasibilityStatus,
        hasMachineCapacity: false, hasTooling: false, hasMaterials: false, hasLabor: false,
        technicalNotes: '', qualityRequirements: '', specialConditions: '',
        routeSteps: [],
        materials: [],
        estimatedSetupHours: null, estimatedProductionHours: null, estimatedTotalDays: null,
        proposedDeliveryDate: '', materialCost: null, laborCost: null, overheadCost: null,
        totalCost: null, margin: 20, quotePrice: null, currency: 'USD',
        feasible: null, rejectionReason: '', approvedBy: '',
        createdAt: '2026-04-14', updatedAt: '2026-04-14',
      },
    ] as any[];
  }

  get filtered() {
    let list = this.items || [];
    if (this.filterStatus) list = list.filter((x) => x.status === this.filterStatus);
    if (this.filterPriority) list = list.filter((x) => x.priority === this.filterPriority);
    const t = this.q.trim().toLowerCase();
    if (t) {
      list = list.filter((x) =>
        [x.code, x.clientName, x.productName, x.productCode, x.description, x.status]
          .some((v) => String(v || '').toLowerCase().includes(t))
      );
    }
    return list;
  }

  statusLabel(val: string): string {
    return this.statuses.find((s) => s.value === val)?.label || val;
  }

  statusColor(val: string): string {
    return this.statuses.find((s) => s.value === val)?.color || 'text-slate-400';
  }

  priorityLabel(val: string): string {
    return this.priorities.find((p) => p.value === val)?.label || val;
  }

  // ── Route steps ──
  addRouteStep() {
    this.form.routeSteps.push({
      seq: this.form.routeSteps.length + 1,
      workCenter: '',
      machineCode: '',
      machineName: '',
      operation: '',
      setupTimeMin: 0,
      cycleTimeSec: 0,
      estimatedHours: 0,
      notes: '',
    });
    if (this.routeViewMode === 'graph') {
      this.editingStepIndex = this.form.routeSteps.length - 1;
    }
  }

  removeRouteStep(i: number) {
    this.form.routeSteps.splice(i, 1);
    this.form.routeSteps.forEach((s: RouteStep, idx: number) => (s.seq = idx + 1));
    if (this.editingStepIndex === i) this.editingStepIndex = null;
    else if (this.editingStepIndex !== null && this.editingStepIndex > i) this.editingStepIndex--;
  }

  // ── Materials ──
  addMaterial() {
    this.form.materials.push({
      materialCode: '',
      materialName: '',
      qty: 0,
      uom: '',
      unitCost: 0,
      available: true,
      leadTimeDays: 0,
    });
  }

  removeMaterial(i: number) {
    this.form.materials.splice(i, 1);
  }

  // ── Cálculos ──
  recalcCosts() {
    const matCost = (this.form.materials || []).reduce(
      (sum: number, m: MaterialLine) => sum + (m.qty || 0) * (m.unitCost || 0), 0
    );
    this.form.materialCost = Math.round(matCost * 100) / 100;

    const totalHours =
      (this.form.estimatedSetupHours || 0) + (this.form.estimatedProductionHours || 0);
    this.form.laborCost = Math.round(totalHours * 25 * 100) / 100; // $25/hr default

    this.form.totalCost =
      Math.round(
        ((this.form.materialCost || 0) +
          (this.form.laborCost || 0) +
          (this.form.overheadCost || 0)) *
          100
      ) / 100;

    const margin = (this.form.margin || 0) / 100;
    this.form.quotePrice =
      Math.round(this.form.totalCost * (1 + margin) * 100) / 100;
  }

  recalcTimes() {
    let setupH = 0;
    let prodH = 0;
    (this.form.routeSteps || []).forEach((s: RouteStep) => {
      setupH += (s.setupTimeMin || 0) / 60;
      prodH += s.estimatedHours || 0;
    });
    this.form.estimatedSetupHours = Math.round(setupH * 100) / 100;
    this.form.estimatedProductionHours = Math.round(prodH * 100) / 100;
    const totalH = setupH + prodH;
    this.form.estimatedTotalDays = Math.ceil(totalH / 8); // 8h/day
  }

  generateCode(): string {
    const now = new Date();
    const year = now.getFullYear();
    const startOfYear = new Date(year, 0, 0);
    const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86_400_000);
    const ms = now.getMilliseconds().toString().padStart(3, '0');
    return `FAC-${year}-${String(dayOfYear).padStart(3, '0')}-${ms}`;
  }

  // ── CRUD ──
  openNew() {
    this.form = this.emptyForm();
    this.form.code = this.generateCode();
    this.editingId = null;
    this.formTab = 'request';
    this.showForm = true;
  }

  edit(item: FeasibilityStudy) {
    this.editingId = item.id;
    this.form = { ...item,
      routeSteps: item.routeSteps ? [...item.routeSteps] : [],
      materials: item.materials ? [...item.materials] : [],
      requestDate: item.requestDate ? item.requestDate.substring(0, 10) : '',
      requiredDate: item.requiredDate ? item.requiredDate.substring(0, 10) : '',
      proposedDeliveryDate: item.proposedDeliveryDate ? item.proposedDeliveryDate.substring(0, 10) : '',
    };
    this.formTab = 'request';
    this.showForm = true;
  }

  cancel() {
    this.showForm = false;
    this.editingId = null;
    this.form = this.emptyForm();
  }

  submit() {
    if (!this.form.code || !this.form.clientName || !this.form.productName) {
      this.error = 'Código, cliente y producto son requeridos.';
      return;
    }
    this.loading = true;
    this.error = null;

    if (this.editingId) {
      this.svc.update(this.editingId, this.form).subscribe({
        next: () => { this.load(); this.cancel(); },
        error: (err) => {
          this.error = 'Error al actualizar: ' + (err.error?.message || err.message || 'Error');
          this.loading = false;
        },
      });
    } else {
      this.svc.create(this.form).subscribe({
        next: () => { this.load(); this.cancel(); },
        error: (err) => {
          this.error = 'Error al crear: ' + (err.error?.message || err.message || 'Error');
          this.loading = false;
        },
      });
    }
  }

  remove(id: string) {
    if (!confirm('¿Eliminar este estudio de factibilidad?')) return;
    this.loading = true;
    this.svc.delete(id).subscribe({
      next: () => this.load(),
      error: (err) => {
        this.error = 'Error al eliminar: ' + (err.error?.message || err.message || 'Error');
        this.loading = false;
      },
    });
  }
}
