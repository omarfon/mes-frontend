import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SerialsService, Serial, CreateSerialDto, SerialStatus } from './serials.service';
import { LotsService } from '../lots/lots.service';

@Component({
  standalone: true,
  selector: 'app-serials',
  imports: [CommonModule, FormsModule],
  templateUrl: './serials.html',
})
export class SerialsComponent implements OnInit {
  form: CreateSerialDto = {
    serialNumber: '',
    lotId: '',
    productId: '',
    status: SerialStatus.CREATED,
    macAddress: '',
    imei: '',
    firmwareVersion: '',
    hardwareRevision: '',
    warrantyMonths: undefined,
    notes: '',
  };

  items: Serial[] = [];
  editingId: string | null = null;
  q = '';
  loading = false;
  error: string | null = null;

  // Listas para selects
  lots: any[] = [];
  products: any[] = [];

  // Enum para template
  SerialStatus = SerialStatus;
  statusList = Object.values(SerialStatus);

  constructor(
    private serialsService: SerialsService,
    private lotsService: LotsService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadSerials();
    this.loadLots();
    this.loadProducts();
  }

  loadSerials() {
    this.loading = true;
    this.serialsService.getAll().subscribe({
      next: (data) => {
        this.items = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando seriales:', err);
        // Si es 401, no mostrar error - el endpoint requiere autenticación
        if (err.status !== 401) {
          this.error = this.extractErrorMessage(err);
        } else {
          console.log('ℹ️ Endpoint requiere autenticación o no implementado');
          this.items = [];
        }
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadLots() {
    this.lotsService.getAll().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.lots = data;
          console.log('✅ Lotes cargados:', data.length);
        } else {
          this.lots = [
            { id: '2bc417bc-95ec-4363-8269-f45bd765845c', lotNumber: 'LOT-MP-001', productName: 'Hilo 29/1' },
            { id: 'e084523e-4fdf-49f6-8096-c034b1d99803', lotNumber: 'LOT-MP-002', productName: 'Hilo 29/1' },
          ];
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('ℹ️ Error cargando lotes');
        this.lots = [
          { id: '2bc417bc-95ec-4363-8269-f45bd765845c', lotNumber: 'LOT-MP-001', productName: 'Hilo 29/1' },
          { id: 'e084523e-4fdf-49f6-8096-c034b1d99803', lotNumber: 'LOT-MP-002', productName: 'Hilo 29/1' },
        ];
        this.cdr.detectChanges();
      }
    });
  }

  loadProducts() {
    this.http.get<any>(`http://localhost:3000/api/master-data/products`).subscribe({
      next: (response) => {
        this.products = response.data || response || [];
        console.log('✅ Productos cargados:', this.products.length);
      },
      error: (err) => {
        console.log('ℹ️ Error cargando productos');
        this.products = [
          { id: 'dddd66eb-2ce8-42eb-b1e0-2d71e8bb0b7b', code: 'PRD-001', name: 'Hilo 29/1' },
        ];
        this.cdr.detectChanges();
      }
    });
  }

  get filtered() {
    const t = this.q.trim().toLowerCase();
    if (!t) return this.items || [];
    
    return (this.items || []).filter(x =>
      [x.serialNumber, x.status, x.macAddress, x.imei, x.notes]
        .some(v => String(v || '').toLowerCase().includes(t))
    );
  }

  submit() {
    if (!this.form.serialNumber || !this.form.lotId || !this.form.productId) {
      this.error = 'Número de serie, lote y producto son requeridos';
      return;
    }

    this.loading = true;
    this.error = null;

    const dto: any = {
      serialNumber: this.form.serialNumber,
      lotId: this.form.lotId,
      productId: this.form.productId,
    };

    // Agregar campos opcionales
    if (this.form.status) dto.status = this.form.status;
    if (this.form.macAddress) dto.macAddress = this.form.macAddress;
    if (this.form.imei) dto.imei = this.form.imei;
    if (this.form.firmwareVersion) dto.firmwareVersion = this.form.firmwareVersion;
    if (this.form.hardwareRevision) dto.hardwareRevision = this.form.hardwareRevision;
    if (this.form.warrantyMonths) dto.warrantyMonths = Number(this.form.warrantyMonths);
    if (this.form.notes) dto.notes = this.form.notes;

    console.log('📤 Enviando serial:', JSON.stringify(dto, null, 2));

    if (this.editingId) {
      this.serialsService.update(this.editingId, dto).subscribe({
        next: () => {
          console.log('Serial actualizado');
          this.loadSerials();
          this.resetForm();
        },
        error: (err) => {
          console.error('❌ Error actualizando:', err);
          this.error = this.extractErrorMessage(err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.serialsService.create(dto).subscribe({
        next: () => {
          console.log('Serial creado');
          this.loadSerials();
          this.resetForm();
        },
        error: (err) => {
          console.error('❌ Error creando:', err);
          this.error = this.extractErrorMessage(err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  edit(item: Serial) {
    this.editingId = item.id;
    this.form = {
      serialNumber: item.serialNumber,
      lotId: item.lotId,
      productId: item.productId,
      status: item.status,
      macAddress: item.macAddress || '',
      imei: item.imei || '',
      firmwareVersion: item.firmwareVersion || '',
      hardwareRevision: item.hardwareRevision || '',
      warrantyMonths: item.warrantyMonths,
      notes: item.notes || '',
    };
    this.error = null;
    this.cdr.detectChanges();
  }

  remove(id: string) {
    if (!confirm('¿Eliminar este serial?')) return;
    
    this.loading = true;
    this.serialsService.delete(id).subscribe({
      next: () => {
        console.log('Serial eliminado');
        this.loadSerials();
      },
      error: (err) => {
        console.error('Error eliminando:', err);
        this.error = this.extractErrorMessage(err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancelEdit() {
    this.editingId = null;
    this.resetForm();
  }

  resetForm() {
    this.form = {
      serialNumber: '',
      lotId: '',
      productId: '',
      status: SerialStatus.CREATED,
      macAddress: '',
      imei: '',
      firmwareVersion: '',
      hardwareRevision: '',
      warrantyMonths: undefined,
      notes: '',
    };
    this.error = null;
    this.loading = false;
    this.cdr.detectChanges();
  }

  getLotInfo(lotId: string): string {
    const lot = this.lots.find(l => l.id === lotId);
    return lot ? `${lot.lotNumber || lot.code}` : lotId.slice(0, 8) + '...';
  }

  getProductInfo(productId: string): string {
    const product = this.products.find(p => p.id === productId);
    return product ? `${product.code} - ${product.name}` : productId.slice(0, 8) + '...';
  }

  getStatusLabel(status: SerialStatus): string {
    const labels: Record<SerialStatus, string> = {
      [SerialStatus.CREATED]: 'Creado',
      [SerialStatus.IN_PRODUCTION]: 'En Producción',
      [SerialStatus.COMPLETED]: 'Completado',
      [SerialStatus.IN_QUARANTINE]: 'En Cuarentena',
      [SerialStatus.RELEASED]: 'Liberado',
      [SerialStatus.BLOCKED]: 'Bloqueado',
      [SerialStatus.SHIPPED]: 'Enviado',
      [SerialStatus.SOLD]: 'Vendido',
      [SerialStatus.RETURNED]: 'Devuelto',
      [SerialStatus.SCRAPPED]: 'Desechado',
    };
    return labels[status] || status;
  }

  getStatusBadge(status: SerialStatus): string {
    const badges: Record<SerialStatus, string> = {
      [SerialStatus.CREATED]: 'ui-badge',
      [SerialStatus.IN_PRODUCTION]: 'ui-badge-info',
      [SerialStatus.COMPLETED]: 'ui-badge-ok',
      [SerialStatus.IN_QUARANTINE]: 'ui-badge-warn',
      [SerialStatus.RELEASED]: 'ui-badge-ok',
      [SerialStatus.BLOCKED]: 'ui-badge-bad',
      [SerialStatus.SHIPPED]: 'ui-badge-info',
      [SerialStatus.SOLD]: 'ui-badge-ok',
      [SerialStatus.RETURNED]: 'ui-badge-warn',
      [SerialStatus.SCRAPPED]: 'ui-badge-bad',
    };
    return badges[status] || 'ui-badge';
  }

  extractErrorMessage(err: any): string {
    if (err.status === 404) {
      return 'Endpoint no implementado - el backend necesita implementar /traceability/serials';
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
