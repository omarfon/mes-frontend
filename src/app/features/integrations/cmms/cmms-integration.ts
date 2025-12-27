import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface CmmsConnection {
  id: number;
  name: string;
  system: 'Maximo' | 'Infor' | 'SAP PM' | 'Other';
  url: string;
  status: 'CONNECTED' | 'DISCONNECTED';
  lastSync: string;
}

interface SyncMapping {
  id: number;
  entity: string;
  mesEntity: string;
  cmmsEntity: string;
  syncDirection: 'PULL' | 'PUSH' | 'BIDIRECTIONAL';
  active: boolean;
}

@Component({
  selector: 'app-cmms-integration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cmms-integration.html',
})
export class CmmsIntegrationComponent {
  activeTab: 'CONNECTIONS' | 'MAPPING' = 'CONNECTIONS';

  connections: CmmsConnection[] = [
    { id: 1, name: 'IBM Maximo', system: 'Maximo', url: 'https://maximo.company.com', status: 'CONNECTED', lastSync: '2025-01-13 11:30:00' },
    { id: 2, name: 'SAP PM QA', system: 'SAP PM', url: 'https://sap-pm.company.com', status: 'DISCONNECTED', lastSync: '2025-01-12 16:00:00' },
  ];

  mappings: SyncMapping[] = [
    { id: 1, entity: 'Work Orders', mesEntity: 'maintenance.work_orders', cmmsEntity: 'WORKORDER', syncDirection: 'BIDIRECTIONAL', active: true },
    { id: 2, entity: 'Assets', mesEntity: 'maintenance.assets', cmmsEntity: 'ASSET', syncDirection: 'PULL', active: true },
    { id: 3, entity: 'PM Plans', mesEntity: 'maintenance.preventive_plans', cmmsEntity: 'PMPLAN', syncDirection: 'PULL', active: true },
    { id: 4, entity: 'Parts', mesEntity: 'maintenance.spare_parts', cmmsEntity: 'ITEM', syncDirection: 'BIDIRECTIONAL', active: false },
  ];

  editingConn: CmmsConnection | null = null;
  connForm: Partial<CmmsConnection> = {};
  editingMapping: SyncMapping | null = null;
  mappingForm: Partial<SyncMapping> = {};

  newConnection() {
    this.editingConn = { id: 0, name: '', system: 'Maximo', url: '', status: 'DISCONNECTED', lastSync: '' };
    this.connForm = { ...this.editingConn };
  }

  editConnection(conn: CmmsConnection) {
    this.editingConn = conn;
    this.connForm = { ...conn };
  }

  saveConnection() {
    if (!this.connForm.name || !this.connForm.url) return;
    if (this.editingConn?.id === 0) {
      const newId = Math.max(...this.connections.map(c => c.id), 0) + 1;
      this.connections.push({ ...this.connForm as CmmsConnection, id: newId });
    } else {
      const idx = this.connections.findIndex(c => c.id === this.editingConn?.id);
      if (idx !== -1) this.connections[idx] = { ...this.connForm as CmmsConnection };
    }
    this.cancelConnection();
  }

  cancelConnection() {
    this.editingConn = null;
    this.connForm = {};
  }

  deleteConnection(id: number) {
    this.connections = this.connections.filter(c => c.id !== id);
  }

  newMapping() {
    this.editingMapping = { id: 0, entity: '', mesEntity: '', cmmsEntity: '', syncDirection: 'BIDIRECTIONAL', active: true };
    this.mappingForm = { ...this.editingMapping };
  }

  editMapping(mapping: SyncMapping) {
    this.editingMapping = mapping;
    this.mappingForm = { ...mapping };
  }

  saveMapping() {
    if (!this.mappingForm.entity || !this.mappingForm.mesEntity || !this.mappingForm.cmmsEntity) return;
    if (this.editingMapping?.id === 0) {
      const newId = Math.max(...this.mappings.map(m => m.id), 0) + 1;
      this.mappings.push({ ...this.mappingForm as SyncMapping, id: newId });
    } else {
      const idx = this.mappings.findIndex(m => m.id === this.editingMapping?.id);
      if (idx !== -1) this.mappings[idx] = { ...this.mappingForm as SyncMapping };
    }
    this.cancelMapping();
  }

  cancelMapping() {
    this.editingMapping = null;
    this.mappingForm = {};
  }

  deleteMapping(id: number) {
    this.mappings = this.mappings.filter(m => m.id !== id);
  }

  getStatusClass(status: string) {
    return status === 'CONNECTED' ? 'ui-badge text-green-300 bg-green-500/10 border-green-500/20' : 'ui-badge text-slate-300 bg-slate-500/10 border-slate-500/20';
  }
}
