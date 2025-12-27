import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ScadaDevice {
  id: number;
  name: string;
  type: 'PLC' | 'HMI' | 'Sensor' | 'Controller';
  protocol: 'OPC-UA' | 'Modbus' | 'MQTT' | 'S7';
  ip: string;
  status: 'ONLINE' | 'OFFLINE' | 'ERROR';
  lastUpdate: string;
}

interface ScadaTag {
  id: number;
  name: string;
  device: string;
  address: string;
  dataType: 'INT' | 'FLOAT' | 'BOOL' | 'STRING';
  value: any;
  quality: 'GOOD' | 'BAD' | 'UNCERTAIN';
  timestamp: string;
}

interface AlarmRule {
  id: number;
  tagName: string;
  condition: string;
  threshold: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  active: boolean;
}

@Component({
  selector: 'app-scada-integration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './scada-integration.html',
})
export class ScadaIntegrationComponent {
  activeTab: 'DEVICES' | 'TAGS' | 'ALARMS' = 'DEVICES';

  // Dispositivos SCADA
  devices: ScadaDevice[] = [
    { id: 1, name: 'PLC-Line-01', type: 'PLC', protocol: 'S7', ip: '192.168.1.10', status: 'ONLINE', lastUpdate: '2025-01-13 12:45:23' },
    { id: 2, name: 'HMI-Station-A', type: 'HMI', protocol: 'OPC-UA', ip: '192.168.1.15', status: 'ONLINE', lastUpdate: '2025-01-13 12:45:20' },
    { id: 3, name: 'Temp-Sensor-001', type: 'Sensor', protocol: 'Modbus', ip: '192.168.1.20', status: 'ONLINE', lastUpdate: '2025-01-13 12:45:18' },
    { id: 4, name: 'PLC-Line-02', type: 'PLC', protocol: 'S7', ip: '192.168.1.11', status: 'OFFLINE', lastUpdate: '2025-01-13 10:30:00' },
  ];

  editingDevice: ScadaDevice | null = null;
  deviceForm: Partial<ScadaDevice> = {};

  // Tags SCADA
  tags: ScadaTag[] = [
    { id: 1, name: 'Machine_Speed', device: 'PLC-Line-01', address: 'DB1.DBD0', dataType: 'FLOAT', value: 1250.5, quality: 'GOOD', timestamp: '2025-01-13 12:45:23' },
    { id: 2, name: 'Temperature', device: 'Temp-Sensor-001', address: '40001', dataType: 'FLOAT', value: 75.3, quality: 'GOOD', timestamp: '2025-01-13 12:45:23' },
    { id: 3, name: 'Production_Count', device: 'PLC-Line-01', address: 'DB1.DBD4', dataType: 'INT', value: 1245, quality: 'GOOD', timestamp: '2025-01-13 12:45:23' },
    { id: 4, name: 'Emergency_Stop', device: 'PLC-Line-01', address: 'M0.0', dataType: 'BOOL', value: false, quality: 'GOOD', timestamp: '2025-01-13 12:45:23' },
    { id: 5, name: 'Pressure', device: 'PLC-Line-01', address: 'DB1.DBD8', dataType: 'FLOAT', value: 5.2, quality: 'UNCERTAIN', timestamp: '2025-01-13 12:45:20' },
  ];

  editingTag: ScadaTag | null = null;
  tagForm: Partial<ScadaTag> = {};
  filterTagDevice: string = 'ALL';

  // Reglas de alarma
  alarmRules: AlarmRule[] = [
    { id: 1, tagName: 'Temperature', condition: '>', threshold: 80, severity: 'HIGH', active: true },
    { id: 2, tagName: 'Pressure', condition: '<', threshold: 3, severity: 'MEDIUM', active: true },
    { id: 3, tagName: 'Machine_Speed', condition: '>', threshold: 1500, severity: 'LOW', active: true },
    { id: 4, tagName: 'Temperature', condition: '>', threshold: 90, severity: 'CRITICAL', active: true },
  ];

  editingAlarm: AlarmRule | null = null;
  alarmForm: Partial<AlarmRule> = {};

  // Device methods
  newDevice() {
    this.editingDevice = { id: 0, name: '', type: 'PLC', protocol: 'OPC-UA', ip: '', status: 'OFFLINE', lastUpdate: '' };
    this.deviceForm = { ...this.editingDevice };
  }

  editDevice(device: ScadaDevice) {
    this.editingDevice = device;
    this.deviceForm = { ...device };
  }

  saveDevice() {
    if (!this.deviceForm.name || !this.deviceForm.ip) return;

    if (this.editingDevice?.id === 0) {
      const newId = Math.max(...this.devices.map(d => d.id), 0) + 1;
      this.devices.push({ ...this.deviceForm as ScadaDevice, id: newId });
    } else {
      const idx = this.devices.findIndex(d => d.id === this.editingDevice?.id);
      if (idx !== -1) this.devices[idx] = { ...this.deviceForm as ScadaDevice };
    }
    this.cancelDevice();
  }

  cancelDevice() {
    this.editingDevice = null;
    this.deviceForm = {};
  }

  deleteDevice(id: number) {
    this.devices = this.devices.filter(d => d.id !== id);
  }

  // Tag methods
  get filteredTags() {
    if (this.filterTagDevice === 'ALL') return this.tags;
    return this.tags.filter(t => t.device === this.filterTagDevice);
  }

  newTag() {
    this.editingTag = { id: 0, name: '', device: '', address: '', dataType: 'INT', value: null, quality: 'GOOD', timestamp: '' };
    this.tagForm = { ...this.editingTag };
  }

  editTag(tag: ScadaTag) {
    this.editingTag = tag;
    this.tagForm = { ...tag };
  }

  saveTag() {
    if (!this.tagForm.name || !this.tagForm.device || !this.tagForm.address) return;

    if (this.editingTag?.id === 0) {
      const newId = Math.max(...this.tags.map(t => t.id), 0) + 1;
      this.tags.push({ ...this.tagForm as ScadaTag, id: newId });
    } else {
      const idx = this.tags.findIndex(t => t.id === this.editingTag?.id);
      if (idx !== -1) this.tags[idx] = { ...this.tagForm as ScadaTag };
    }
    this.cancelTag();
  }

  cancelTag() {
    this.editingTag = null;
    this.tagForm = {};
  }

  deleteTag(id: number) {
    this.tags = this.tags.filter(t => t.id !== id);
  }

  // Alarm methods
  newAlarm() {
    this.editingAlarm = { id: 0, tagName: '', condition: '>', threshold: 0, severity: 'MEDIUM', active: true };
    this.alarmForm = { ...this.editingAlarm };
  }

  editAlarm(alarm: AlarmRule) {
    this.editingAlarm = alarm;
    this.alarmForm = { ...alarm };
  }

  saveAlarm() {
    if (!this.alarmForm.tagName) return;

    if (this.editingAlarm?.id === 0) {
      const newId = Math.max(...this.alarmRules.map(a => a.id), 0) + 1;
      this.alarmRules.push({ ...this.alarmForm as AlarmRule, id: newId });
    } else {
      const idx = this.alarmRules.findIndex(a => a.id === this.editingAlarm?.id);
      if (idx !== -1) this.alarmRules[idx] = { ...this.alarmForm as AlarmRule };
    }
    this.cancelAlarm();
  }

  cancelAlarm() {
    this.editingAlarm = null;
    this.alarmForm = {};
  }

  deleteAlarm(id: number) {
    this.alarmRules = this.alarmRules.filter(a => a.id !== id);
  }

  // Helper methods
  getStatusClass(status: string) {
    const map: Record<string, string> = {
      ONLINE: 'ui-badge text-green-300 bg-green-500/10 border-green-500/20',
      OFFLINE: 'ui-badge text-slate-300 bg-slate-500/10 border-slate-500/20',
      ERROR: 'ui-badge text-red-300 bg-red-500/10 border-red-500/20'
    };
    return map[status] || 'ui-badge';
  }

  getQualityClass(quality: string) {
    const map: Record<string, string> = {
      GOOD: 'ui-badge text-green-300 bg-green-500/10 border-green-500/20',
      BAD: 'ui-badge text-red-300 bg-red-500/10 border-red-500/20',
      UNCERTAIN: 'ui-badge text-yellow-300 bg-yellow-500/10 border-yellow-500/20'
    };
    return map[quality] || 'ui-badge';
  }

  getSeverityClass(severity: string) {
    const map: Record<string, string> = {
      LOW: 'ui-badge text-blue-300 bg-blue-500/10 border-blue-500/20',
      MEDIUM: 'ui-badge text-yellow-300 bg-yellow-500/10 border-yellow-500/20',
      HIGH: 'ui-badge text-orange-300 bg-orange-500/10 border-orange-500/20',
      CRITICAL: 'ui-badge text-red-300 bg-red-500/10 border-red-500/20'
    };
    return map[severity] || 'ui-badge';
  }
}
