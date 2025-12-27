import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaintenanceStoreService } from '../services/maintenance-store.service';

export type AssetStatus = 'OPERATIONAL' | 'MAINTENANCE' | 'DOWN' | 'RETIRED';

export interface Asset {
  id: string;
  code: string;
  name: string;
  category: string;
  manufacturer: string;
  model: string;
  serialNumber?: string;
  location: string;
  status: AssetStatus;
  installDate: string;
  warrantyEndDate?: string;
  criticality: string;
  specifications?: Record<string, string>;
  documents?: Array<{ name: string; url: string; uploadedAt: string }>;
  createdAt: string;
}

@Component({
  standalone: true,
  selector: 'app-assets',
  imports: [CommonModule, FormsModule],
  templateUrl: './assets.html',
  styleUrl: './assets.css',
})
export class AssetsComponent {
  q = '';
  filterStatus: 'ALL' | AssetStatus = 'ALL';
  selected: Asset | null = null;
  editingId: string | null = null;

  form: Omit<Asset, 'id' | 'createdAt'> = {
    code: '',
    name: '',
    category: 'MACHINERY',
    manufacturer: '',
    model: '',
    serialNumber: '',
    location: '',
    status: 'OPERATIONAL',
    installDate: '',
    warrantyEndDate: '',
    criticality: 'MEDIUM',
    specifications: {},
    documents: []
  };

  // Specifications form
  specKey = '';
  specValue = '';

  // Documents form
  docName = '';
  docUrl = '';

  constructor(public ms: MaintenanceStoreService) {}

  get filtered() {
    const t = this.q.trim().toLowerCase();
    return this.ms.assets.filter((a: Asset) => {
      if (this.filterStatus !== 'ALL' && a.status !== this.filterStatus) return false;
      if (!t) return true;
      const searchStr = [
        a.code,
        a.name,
        a.category,
        a.manufacturer,
        a.model,
        a.location,
        a.serialNumber || ''
      ].join(' ').toLowerCase();
      return searchStr.includes(t);
    });
  }

  select(asset: Asset) {
    this.selected = asset;
    this.editingId = null;
  }

  edit(asset: Asset) {
    this.editingId = asset.id;
    this.form = { ...asset };
    this.selected = asset;
  }

  submit() {
    if (!this.form.code || !this.form.name) return;

    if (this.editingId) {
      const idx = this.ms.assets.findIndex(a => a.id === this.editingId);
      if (idx >= 0) {
        this.ms.assets[idx] = {
          ...this.ms.assets[idx],
          ...this.form
        };
      }
      this.cancelEdit();
      return;
    }

    const id = crypto.randomUUID?.() ?? String(Date.now());
    const newAsset: Asset = {
      id,
      ...this.form,
      createdAt: new Date().toISOString()
    };
    this.ms.assets.unshift(newAsset);
    this.resetForm();
    this.select(newAsset);
  }

  remove(id: string) {
    if (!confirm('¿Eliminar este activo?')) return;
    this.ms.assets = this.ms.assets.filter(a => a.id !== id);
    if (this.selected?.id === id) this.selected = null;
  }

  cancelEdit() {
    this.editingId = null;
    this.resetForm();
  }

  resetForm() {
    this.form = {
      code: '',
      name: '',
      category: 'MACHINERY',
      manufacturer: '',
      model: '',
      serialNumber: '',
      location: '',
      status: 'OPERATIONAL',
      installDate: '',
      warrantyEndDate: '',
      criticality: 'MEDIUM',
      specifications: {},
      documents: []
    };
  }

  addSpecification() {
    if (!this.selected || !this.specKey.trim()) return;
    if (!this.selected.specifications) this.selected.specifications = {};
    this.selected.specifications[this.specKey.trim()] = this.specValue.trim();
    this.specKey = '';
    this.specValue = '';
  }

  removeSpec(key: string) {
    if (!this.selected?.specifications) return;
    delete this.selected.specifications[key];
  }

  addDocument() {
    if (!this.selected || !this.docName.trim() || !this.docUrl.trim()) return;
    if (!this.selected.documents) this.selected.documents = [];
    this.selected.documents.push({
      name: this.docName.trim(),
      url: this.docUrl.trim(),
      uploadedAt: new Date().toISOString()
    });
    this.docName = '';
    this.docUrl = '';
  }

  removeDocument(index: number) {
    if (!this.selected?.documents) return;
    this.selected.documents.splice(index, 1);
  }

  getStatusBadge(status: AssetStatus): string {
    const badges: Record<AssetStatus, string> = {
      'OPERATIONAL': 'ui-badge-ok',
      'MAINTENANCE': 'ui-badge-warn',
      'DOWN': 'ui-badge-bad',
      'RETIRED': 'ui-badge bg-slate-500/15 border-slate-500/25 text-slate-200'
    };
    return badges[status] || 'ui-badge';
  }

  getCriticalityBadge(criticality: string): string {
    const badges: Record<string, string> = {
      'LOW': 'ui-badge bg-slate-500/15 border-slate-500/25 text-slate-200',
      'MEDIUM': 'ui-badge-warn',
      'HIGH': 'ui-badge bg-orange-500/15 border-orange-500/25 text-orange-200',
      'CRITICAL': 'ui-badge-bad'
    };
    return badges[criticality] || 'ui-badge';
  }

  getSpecKeys(specs: Record<string, string> | undefined): string[] {
    return specs ? Object.keys(specs) : [];
  }
}
