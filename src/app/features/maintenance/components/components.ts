import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type ComponentStatus = 'OPERATIONAL' | 'DEGRADED' | 'FAILED' | 'REPLACED';
type ComponentCriticality = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface AssetComponent {
  id: string;
  code: string;
  name: string;
  assetCode: string;
  assetName: string;
  category: string; // Motor, Rodamiento, Correa, Sensor, etc.
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  status: ComponentStatus;
  criticality: ComponentCriticality;
  installDate: string;
  expectedLifeHours?: number;
  currentHours?: number;
  lastInspection?: string;
  nextInspection?: string;
  notes?: string;
}

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
export class ComponentsComponent {
  q = '';
  filterAsset = 'ALL';
  filterStatus: 'ALL' | ComponentStatus = 'ALL';
  selectedComponent: AssetComponent | null = null;
  editingId: string | null = null;

  // Form
  form: Omit<AssetComponent, 'id'> = {
    code: '',
    name: '',
    assetCode: 'MAQ-001',
    assetName: 'Hiladora 01',
    category: 'Motor',
    manufacturer: '',
    model: '',
    serialNumber: '',
    status: 'OPERATIONAL',
    criticality: 'MEDIUM',
    installDate: new Date().toISOString().split('T')[0],
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

  // Mock assets
  assets = [
    { code: 'MAQ-001', name: 'Hiladora 01' },
    { code: 'MAQ-002', name: 'Carda 02' },
    { code: 'COMP-A1', name: 'Compresor A1' },
    { code: 'TEL-05', name: 'Telar 05' }
  ];

  components: AssetComponent[] = [
    {
      id: '1',
      code: 'COMP-M001-MOT',
      name: 'Motor Principal',
      assetCode: 'MAQ-001',
      assetName: 'Hiladora 01',
      category: 'Motor',
      manufacturer: 'Siemens',
      model: 'IE3-100L',
      serialNumber: 'SN-2024-001',
      status: 'OPERATIONAL',
      criticality: 'CRITICAL',
      installDate: '2024-01-15',
      expectedLifeHours: 15000,
      currentHours: 3250,
      lastInspection: '2025-12-01',
      nextInspection: '2026-01-01',
      notes: 'Requiere inspección mensual'
    },
    {
      id: '2',
      code: 'COMP-M001-ROD1',
      name: 'Rodamiento Eje Principal',
      assetCode: 'MAQ-001',
      assetName: 'Hiladora 01',
      category: 'Rodamiento',
      manufacturer: 'SKF',
      model: '6206-2RS',
      serialNumber: 'SKF-2024-445',
      status: 'DEGRADED',
      criticality: 'HIGH',
      installDate: '2024-06-20',
      expectedLifeHours: 8000,
      currentHours: 6500,
      lastInspection: '2025-12-10',
      nextInspection: '2025-12-30',
      notes: 'Presenta vibración anormal, programar reemplazo'
    },
    {
      id: '3',
      code: 'COMP-C001-VALV',
      name: 'Válvula de Seguridad',
      assetCode: 'COMP-A1',
      assetName: 'Compresor A1',
      category: 'Válvula',
      manufacturer: 'Parker',
      model: 'PSV-200',
      status: 'OPERATIONAL',
      criticality: 'CRITICAL',
      installDate: '2023-11-10',
      lastInspection: '2025-11-15',
      nextInspection: '2026-02-15'
    }
  ];

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
  }

  submit() {
    if (!this.form.code || !this.form.name) return;

    const asset = this.assets.find(a => a.code === this.form.assetCode);
    if (!asset) return;

    if (this.editingId) {
      const idx = this.components.findIndex(c => c.id === this.editingId);
      if (idx >= 0) {
        this.components[idx] = {
          ...this.components[idx],
          ...this.form,
          assetName: asset.name
        };
      }
      this.cancelEdit();
      return;
    }

    const newComponent: AssetComponent = {
      id: crypto.randomUUID?.() ?? String(Date.now()),
      ...this.form,
      assetName: asset.name
    };

    this.components.unshift(newComponent);
    this.resetForm();
    this.selectComponent(newComponent);
  }

  remove(id: string) {
    if (!confirm('¿Eliminar este componente?')) return;
    this.components = this.components.filter(c => c.id !== id);
    if (this.selectedComponent?.id === id) this.selectedComponent = null;
  }

  cancelEdit() {
    this.editingId = null;
    this.resetForm();
  }

  resetForm() {
    this.form = {
      code: '',
      name: '',
      assetCode: 'MAQ-001',
      assetName: 'Hiladora 01',
      category: 'Motor',
      manufacturer: '',
      model: '',
      serialNumber: '',
      status: 'OPERATIONAL',
      criticality: 'MEDIUM',
      installDate: new Date().toISOString().split('T')[0],
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
    this.selectedComponent.lastInspection = newRecord.date;

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

  getStatusBadge(status: ComponentStatus): string {
    const badges: Record<ComponentStatus, string> = {
      'OPERATIONAL': 'ui-badge-ok',
      'DEGRADED': 'ui-badge-warn',
      'FAILED': 'ui-badge-bad',
      'REPLACED': 'ui-badge bg-slate-500/15 border-slate-500/25 text-slate-200'
    };
    return badges[status] || 'ui-badge';
  }

  getCriticalityBadge(criticality: ComponentCriticality): string {
    const badges: Record<ComponentCriticality, string> = {
      'LOW': 'ui-badge bg-slate-500/15 border-slate-500/25 text-slate-200',
      'MEDIUM': 'ui-badge-warn',
      'HIGH': 'ui-badge bg-orange-500/15 border-orange-500/25 text-orange-200',
      'CRITICAL': 'ui-badge-bad'
    };
    return badges[criticality] || 'ui-badge';
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
