import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ErpConnection {
  id: number;
  name: string;
  type: 'SAP' | 'Odoo' | 'Oracle' | 'Other';
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  url: string;
  lastSync: string;
  autoSync: boolean;
}

interface SyncLog {
  id: number;
  timestamp: string;
  type: 'PUSH' | 'PULL';
  entity: string;
  records: number;
  status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
  duration: number;
  errors?: string;
}

interface MappingRule {
  id: number;
  mesField: string;
  erpField: string;
  direction: 'BIDIRECTIONAL' | 'MES_TO_ERP' | 'ERP_TO_MES';
  transform?: string;
  active: boolean;
}

@Component({
  selector: 'app-erp-integration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './erp-integration.html',
})
export class ErpIntegrationComponent {
  activeTab: 'CONNECTIONS' | 'SYNC' | 'MAPPING' = 'CONNECTIONS';

  // Conexiones ERP
  connections: ErpConnection[] = [
    { id: 1, name: 'SAP Production', type: 'SAP', status: 'CONNECTED', url: 'https://sap.company.com:8000', lastSync: '2025-01-13 12:30:00', autoSync: true },
    { id: 2, name: 'Odoo Inventory', type: 'Odoo', status: 'CONNECTED', url: 'https://odoo.company.com', lastSync: '2025-01-13 12:25:00', autoSync: true },
    { id: 3, name: 'SAP Quality', type: 'SAP', status: 'DISCONNECTED', url: 'https://sap-qm.company.com:8000', lastSync: '2025-01-12 18:00:00', autoSync: false },
  ];

  editingConnection: ErpConnection | null = null;
  connectionForm: Partial<ErpConnection> = {};

  // Logs de sincronización
  syncLogs: SyncLog[] = [
    { id: 1, timestamp: '2025-01-13 12:30:00', type: 'PUSH', entity: 'Production Orders', records: 15, status: 'SUCCESS', duration: 2.5 },
    { id: 2, timestamp: '2025-01-13 12:25:00', type: 'PULL', entity: 'Materials', records: 120, status: 'SUCCESS', duration: 5.2 },
    { id: 3, timestamp: '2025-01-13 12:20:00', type: 'PUSH', entity: 'Quality Results', records: 8, status: 'PARTIAL', duration: 3.1, errors: '2 registros fallaron por validación' },
    { id: 4, timestamp: '2025-01-13 12:15:00', type: 'PULL', entity: 'Work Centers', records: 25, status: 'SUCCESS', duration: 1.8 },
    { id: 5, timestamp: '2025-01-13 12:10:00', type: 'PUSH', entity: 'Production Confirmations', records: 45, status: 'FAILED', duration: 0.5, errors: 'Connection timeout' },
  ];

  filterSyncType: string = 'ALL';
  filterSyncStatus: string = 'ALL';

  // Reglas de mapeo
  mappingRules: MappingRule[] = [
    { id: 1, mesField: 'production_order.id', erpField: 'AUFNR', direction: 'BIDIRECTIONAL', active: true },
    { id: 2, mesField: 'production_order.quantity', erpField: 'GAMNG', direction: 'BIDIRECTIONAL', active: true },
    { id: 3, mesField: 'material.code', erpField: 'MATNR', direction: 'ERP_TO_MES', active: true },
    { id: 4, mesField: 'material.description', erpField: 'MAKTX', direction: 'ERP_TO_MES', active: true },
    { id: 5, mesField: 'quality_result.value', erpField: 'QM_RESULT', direction: 'MES_TO_ERP', transform: 'toUpperCase', active: true },
  ];

  editingMapping: MappingRule | null = null;
  mappingForm: Partial<MappingRule> = {};

  // Connections methods
  newConnection() {
    this.editingConnection = { id: 0, name: '', type: 'SAP', status: 'DISCONNECTED', url: '', lastSync: '', autoSync: false };
    this.connectionForm = { ...this.editingConnection };
  }

  editConnection(conn: ErpConnection) {
    this.editingConnection = conn;
    this.connectionForm = { ...conn };
  }

  saveConnection() {
    if (!this.connectionForm.name || !this.connectionForm.url) return;

    if (this.editingConnection?.id === 0) {
      const newId = Math.max(...this.connections.map(c => c.id), 0) + 1;
      this.connections.push({ ...this.connectionForm as ErpConnection, id: newId });
    } else {
      const idx = this.connections.findIndex(c => c.id === this.editingConnection?.id);
      if (idx !== -1) this.connections[idx] = { ...this.connectionForm as ErpConnection };
    }
    this.cancelConnection();
  }

  cancelConnection() {
    this.editingConnection = null;
    this.connectionForm = {};
  }

  deleteConnection(id: number) {
    this.connections = this.connections.filter(c => c.id !== id);
  }

  testConnection(conn: ErpConnection) {
    console.log('Testing connection:', conn.name);
    // Simular test de conexión
  }

  // Sync methods
  get filteredSyncLogs() {
    return this.syncLogs.filter(log => {
      const matchType = this.filterSyncType === 'ALL' || log.type === this.filterSyncType;
      const matchStatus = this.filterSyncStatus === 'ALL' || log.status === this.filterSyncStatus;
      return matchType && matchStatus;
    });
  }

  triggerSync(type: 'PUSH' | 'PULL', entity: string) {
    console.log(`Triggering ${type} sync for ${entity}`);
    // Simular sincronización
  }

  // Mapping methods
  newMapping() {
    this.editingMapping = { id: 0, mesField: '', erpField: '', direction: 'BIDIRECTIONAL', active: true };
    this.mappingForm = { ...this.editingMapping };
  }

  editMapping(mapping: MappingRule) {
    this.editingMapping = mapping;
    this.mappingForm = { ...mapping };
  }

  saveMapping() {
    if (!this.mappingForm.mesField || !this.mappingForm.erpField) return;

    if (this.editingMapping?.id === 0) {
      const newId = Math.max(...this.mappingRules.map(m => m.id), 0) + 1;
      this.mappingRules.push({ ...this.mappingForm as MappingRule, id: newId });
    } else {
      const idx = this.mappingRules.findIndex(m => m.id === this.editingMapping?.id);
      if (idx !== -1) this.mappingRules[idx] = { ...this.mappingForm as MappingRule };
    }
    this.cancelMapping();
  }

  cancelMapping() {
    this.editingMapping = null;
    this.mappingForm = {};
  }

  deleteMapping(id: number) {
    this.mappingRules = this.mappingRules.filter(m => m.id !== id);
  }

  // Helper methods
  getStatusClass(status: string) {
    const map: Record<string, string> = {
      CONNECTED: 'ui-badge text-green-300 bg-green-500/10 border-green-500/20',
      DISCONNECTED: 'ui-badge text-slate-300 bg-slate-500/10 border-slate-500/20',
      ERROR: 'ui-badge text-red-300 bg-red-500/10 border-red-500/20',
      SUCCESS: 'ui-badge text-green-300 bg-green-500/10 border-green-500/20',
      FAILED: 'ui-badge text-red-300 bg-red-500/10 border-red-500/20',
      PARTIAL: 'ui-badge text-yellow-300 bg-yellow-500/10 border-yellow-500/20'
    };
    return map[status] || 'ui-badge';
  }

  getTypeIcon(type: string) {
    const map: Record<string, string> = {
      SAP: 'pi-database',
      Odoo: 'pi-box',
      Oracle: 'pi-server',
      Other: 'pi-link'
    };
    return map[type] || 'pi-link';
  }
}
