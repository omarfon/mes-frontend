import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  ComponentsService, 
  AssetComponent, 
  ComponentStatus, 
  ComponentCriticality,
  CreateComponentDto 
} from '../services/components.service';

interface MaintenanceRecord {
  id: string;
  date: string;
  type: 'INSPECTION' | 'REPAIR' | 'REPLACEMENT' | 'LUBRICATION';
  technician: string;
  notes: string;
  hoursAtMaintenance?: number;
}

@Component({
  standalone: true,
  selector: 'app-components',
  imports: [CommonModule, FormsModule],
  templateUrl: './components.html',
  styleUrl: './components.css',
})
export class ComponentsComponent implements OnInit {
  private componentsService = inject(ComponentsService);
  
  q = '';
  filterAsset = 'ALL';
  filterStatus: 'ALL' | ComponentStatus = 'ALL';
  selectedComponent: AssetComponent | null = null;
  editingId: string | null = null;
  formPanelOpen = false;

  components$ = this.componentsService.components$;
  components: AssetComponent[] = [];

  // Form
  form: Partial<AssetComponent> = {
    code: '',
    name: '',
    assetCode: '',
    assetName: '',
    category: '',
    manufacturer: '',
    model: '',
    serialNumber: '',
    status: ComponentStatus.OPERATIONAL,
    criticality: ComponentCriticality.MEDIUM,
    installDate: new Date(),
    expectedLifeHours: 10000,
    currentHours: 0,
    notes: ''
  };

  // Maintenance record form
  recordForm = {
    type: 'INSPECTION' as 'INSPECTION' | 'REPAIR' | 'REPLACEMENT' | 'LUBRICATION',
    technician: '',
    notes: '',
    hoursAtMaintenance: 0
  };

  // Mock assets (could be loaded from assets service)
  assets = [
    { code: 'MAQ-001', name: 'Hiladora 01' },
    { code: 'MAQ-002', name: 'Carda 02' },
    { code: 'COMP-A1', name: 'Compresor A1' },
    { code: 'TEL-05', name: 'Telar 05' }
  ];

  ngOnInit(): void {
    this.componentsService.loadComponents();
    this.components$.subscribe(components => {
      this.components = components;
    });
  }

  maintenanceRecords: Map<string, MaintenanceRecord[]> = new Map([
    ['1', [
      {
        id: 'r1',
        date: '2025-12-01',
        type: 'INSPECTION',
        technician: 'Juan Pérez',
        notes: 'Inspección rutinaria, todo OK',
        hoursAtMaintenance: 3250
      },
      {
        id: 'r2',
        date: '2025-11-01',
        type: 'LUBRICATION',
        technician: 'Carlos Ruiz',
        notes: 'Lubricación preventiva',
        hoursAtMaintenance: 2980
      }
    ]],
    ['2', [
      {
        id: 'r3',
        date: '2025-12-10',
        type: 'INSPECTION',
        technician: 'María Torres',
        notes: 'Detectada vibración anormal, requiere monitoreo',
        hoursAtMaintenance: 6500
      }
    ]]
  ]);

  get filtered() {
    const t = this.q.trim().toLowerCase();
    return this.components.filter(c => {
      if (this.filterAsset !== 'ALL' && c.assetCode !== this.filterAsset) return false;
      if (this.filterStatus !== 'ALL' && c.status !== this.filterStatus) return false;
      if (!t) return true;
      const searchStr = [
        c.code,
        c.name,
        c.assetCode,
        c.assetName,
        c.category,
        c.manufacturer || '',
        c.model || ''
      ].join(' ').toLowerCase();
      return searchStr.includes(t);
    });
  }

  get uniqueAssets() {
    return Array.from(new Set(this.components.map(c => c.assetCode)));
  }

  selectComponent(component: AssetComponent) {
    this.selectedComponent = component;
    this.editingId = null;
  }

  editComponent(component: AssetComponent) {
    this.editingId = component.id;
    this.form = { ...component };
    this.selectedComponent = component;
    this.formPanelOpen = true;
  }

  openCreatePanel() {
    this.cancelEdit();
    this.formPanelOpen = true;
  }

  closeFormPanel() {
    this.formPanelOpen = false;
  }

  submit() {
    if (!this.form.code || !this.form.name) return;

    const dto: CreateComponentDto = {
      code: this.form.code,
      name: this.form.name,
      assetCode: this.form.assetCode,
      assetName: this.form.assetName,
      category: this.form.category,
      status: this.form.status,
      manufacturer: this.form.manufacturer,
      model: this.form.model,
      serialNumber: this.form.serialNumber,
      criticality: this.form.criticality,
      installDate: this.form.installDate,
      expectedLifeHours: this.form.expectedLifeHours,
      currentHours: this.form.currentHours,
      notes: this.form.notes,
      lastInspection: this.form.lastInspection,
      nextInspection: this.form.nextInspection
    };

    if (this.editingId) {
      this.componentsService.updateComponent(this.editingId, dto)
        .subscribe({
          next: (updated) => {
            this.selectedComponent = updated;
            this.cancelEdit();
            this.formPanelOpen = false;
          },
          error: (err) => console.error('Error updating component:', err)
        });
      return;
    }

    this.componentsService.createComponent(dto)
      .subscribe({
        next: (created) => {
          this.resetForm();
          this.selectComponent(created);
          this.formPanelOpen = false;
        },
        error: (err) => console.error('Error creating component:', err)
      });
  }

  remove(id: string) {
    if (!confirm('¿Eliminar este componente?')) return;
    this.componentsService.deleteComponent(id)
      .subscribe({
        next: () => {
          if (this.selectedComponent?.id === id) {
            this.selectedComponent = null;
          }
        },
        error: (err) => console.error('Error deleting component:', err)
      });
  }

  cancelEdit() {
    this.editingId = null;
    this.resetForm();
  }

  resetForm() {
    this.form = {
      code: '',
      name: '',
      assetCode: '',
      assetName: '',
      category: '',
      manufacturer: '',
      model: '',
      serialNumber: '',
      status: ComponentStatus.OPERATIONAL,
      criticality: ComponentCriticality.MEDIUM,
      installDate: new Date(),
      expectedLifeHours: 10000,
      currentHours: 0,
      notes: ''
    };
  }

  addMaintenanceRecord() {
    if (!this.selectedComponent || !this.recordForm.technician || !this.recordForm.notes) return;

    const newRecord: MaintenanceRecord = {
      id: crypto.randomUUID?.() ?? String(Date.now()),
      date: new Date().toISOString().split('T')[0],
      type: this.recordForm.type,
      technician: this.recordForm.technician,
      notes: this.recordForm.notes,
      hoursAtMaintenance: this.recordForm.hoursAtMaintenance || this.selectedComponent.currentHours
    };

    const records = this.maintenanceRecords.get(this.selectedComponent.id) || [];
    records.unshift(newRecord);
    this.maintenanceRecords.set(this.selectedComponent.id, records);

    // Update last inspection
    this.selectedComponent.lastInspection = new Date(newRecord.date);

    this.resetRecordForm();
  }

  resetRecordForm() {
    this.recordForm = {
      type: 'INSPECTION',
      technician: '',
      notes: '',
      hoursAtMaintenance: 0
    };
  }

  getRecords(componentId: string): MaintenanceRecord[] {
    return this.maintenanceRecords.get(componentId) || [];
  }

  getStatusBadge(status: ComponentStatus | undefined): string {
    if (!status) return 'ui-badge';
    const badges: Record<ComponentStatus, string> = {
      [ComponentStatus.OPERATIONAL]: 'ui-badge-ok',
      [ComponentStatus.DEGRADED]: 'ui-badge-warn',
      [ComponentStatus.FAILED]: 'ui-badge-bad',
      [ComponentStatus.REPLACED]: 'ui-badge bg-slate-500/15 border-slate-500/25 text-slate-200'
    };
    return badges[status] || 'ui-badge';
  }

  getCriticalityBadge(criticality: ComponentCriticality | undefined): string {
    if (!criticality) return 'ui-badge';
    const badges: Record<ComponentCriticality, string> = {
      [ComponentCriticality.LOW]: 'ui-badge bg-slate-500/15 border-slate-500/25 text-slate-200',
      [ComponentCriticality.MEDIUM]: 'ui-badge-warn',
      [ComponentCriticality.HIGH]: 'ui-badge bg-orange-500/15 border-orange-500/25 text-orange-200',
      [ComponentCriticality.CRITICAL]: 'ui-badge-bad'
    };
    return badges[criticality] || 'ui-badge';
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES');
  }

  getLifePercentage(component: AssetComponent): number {
    if (!component.expectedLifeHours || !component.currentHours) return 0;
    return Math.min(100, (component.currentHours / component.expectedLifeHours) * 100);
  }

  getLifeBarColor(percentage: number): string {
    if (percentage < 60) return 'bg-emerald-500';
    if (percentage < 85) return 'bg-amber-500';
    return 'bg-rose-500';
  }

  getRecordTypeBadge(type: string): string {
    const badges: Record<string, string> = {
      'INSPECTION': 'ui-badge bg-blue-500/15 border-blue-500/25 text-blue-200',
      'REPAIR': 'ui-badge-warn',
      'REPLACEMENT': 'ui-badge bg-purple-500/15 border-purple-500/25 text-purple-200',
      'LUBRICATION': 'ui-badge-ok'
    };
    return badges[type] || 'ui-badge';
  }
}
