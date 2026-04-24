import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/** Tipos genéricos de producto (aplican a cualquier industria) */
type ProductType =
  | 'RAW_MATERIAL'
  | 'SEMI_FINISHED'
  | 'FINISHED'
  | 'CONSUMABLE'
  | 'SPARE_PART'
  | 'PACKAGING'
  | 'BYPRODUCT'
  | 'SERVICE'
  | 'OTHER';

interface Product {
  id: string;
  /* ── Identificación ── */
  code: string;
  name: string;
  description: string;
  type: ProductType;
  /* ── Clasificación ── */
  family: string;
  subfamily: string;
  /* ── Unidades y medidas ── */
  uom: string;
  netWeight: number | null;
  weightUnit: string;
  /* ── Integración ── */
  erpCode: string;
  barcode: string;
  /* ── Inventario ── */
  minStock: number | null;
  maxStock: number | null;
  reorderPoint: number | null;
  leadTimeDays: number | null;
  /* ── Costos ── */
  costPrice: number | null;
  currency: string;
  /* ── Trazabilidad y calidad ── */
  batchManaged: boolean;
  serialManaged: boolean;
  qualityInspection: boolean;
  shelfLifeDays: number | null;
  storageConditions: string;
  /* ── Especificación técnica ── */
  spec: string;
  /* ── Estado ── */
  active: boolean;
}

type ProductForm = Omit<Product, 'id'>;

const EMPTY_FORM: ProductForm = {
  code: '',
  name: '',
  description: '',
  type: 'FINISHED',
  family: '',
  subfamily: '',
  uom: 'un',
  netWeight: null,
  weightUnit: 'kg',
  erpCode: '',
  barcode: '',
  minStock: null,
  maxStock: null,
  reorderPoint: null,
  leadTimeDays: null,
  costPrice: null,
  currency: 'USD',
  batchManaged: false,
  serialManaged: false,
  qualityInspection: false,
  shelfLifeDays: null,
  storageConditions: '',
  spec: '',
  active: true,
};

@Component({
  standalone: true,
  selector: 'app-products',
  imports: [CommonModule, FormsModule],
  templateUrl: './products.html',
})
export class ProductsComponent {
  form: ProductForm = { ...EMPTY_FORM };

  /** Sección activa del formulario */
  formTab: 'general' | 'inventory' | 'traceability' = 'general';

  items: Product[] = [
    {
      id: '1', code: 'PRD-001', name: 'Tornillo M8x30', description: 'Tornillo hex acero zincado',
      type: 'FINISHED', family: 'Ferretería', subfamily: 'Tornillería',
      uom: 'un', netWeight: 0.025, weightUnit: 'kg',
      erpCode: 'FER-T-001', barcode: '7501000001',
      minStock: 500, maxStock: 5000, reorderPoint: 1000, leadTimeDays: 7,
      costPrice: 0.12, currency: 'USD',
      batchManaged: true, serialManaged: false, qualityInspection: true,
      shelfLifeDays: null, storageConditions: '', spec: 'Acero SAE 1018, zincado', active: true,
    },
    {
      id: '2', code: 'MP-002', name: 'Resina PET', description: 'Polietileno tereftalato grado botella',
      type: 'RAW_MATERIAL', family: 'Polímeros', subfamily: 'PET',
      uom: 'kg', netWeight: 25, weightUnit: 'kg',
      erpCode: 'POL-R-002', barcode: '7501000002',
      minStock: 200, maxStock: 2000, reorderPoint: 500, leadTimeDays: 14,
      costPrice: 1.85, currency: 'USD',
      batchManaged: true, serialManaged: false, qualityInspection: true,
      shelfLifeDays: 365, storageConditions: 'Ambiente seco, <30°C', spec: 'IV 0.80 ± 0.02', active: true,
    },
  ];

  productTypes: { value: ProductType; label: string }[] = [
    { value: 'RAW_MATERIAL', label: 'Materia prima' },
    { value: 'SEMI_FINISHED', label: 'Semielaborado' },
    { value: 'FINISHED', label: 'Producto terminado' },
    { value: 'CONSUMABLE', label: 'Consumible' },
    { value: 'SPARE_PART', label: 'Repuesto' },
    { value: 'PACKAGING', label: 'Empaque' },
    { value: 'BYPRODUCT', label: 'Subproducto' },
    { value: 'SERVICE', label: 'Servicio' },
    { value: 'OTHER', label: 'Otro' },
  ];

  editingId: string | null = null;
  q = '';

  /* ── Carga masiva ── */
  showBulkUpload = false;
  bulkFile: File | null = null;
  bulkFileName = '';
  bulkPreview: Record<string, string>[] = [];
  bulkErrors: string[] = [];
  bulkImported = 0;

  private readonly CSV_HEADERS: (keyof ProductForm)[] = [
    'code', 'name', 'description', 'type', 'family', 'subfamily',
    'uom', 'netWeight', 'weightUnit', 'erpCode', 'barcode',
    'minStock', 'maxStock', 'reorderPoint', 'leadTimeDays',
    'costPrice', 'currency', 'batchManaged', 'serialManaged',
    'qualityInspection', 'shelfLifeDays', 'storageConditions', 'spec', 'active',
  ];

  private readonly VALID_TYPES: string[] = [
    'RAW_MATERIAL', 'SEMI_FINISHED', 'FINISHED', 'CONSUMABLE',
    'SPARE_PART', 'PACKAGING', 'BYPRODUCT', 'SERVICE', 'OTHER',
  ];

  get filtered() {
    const t = this.q.trim().toLowerCase();
    if (!t) return this.items;
    return this.items.filter(x =>
      [x.code, x.name, x.type, x.family, x.subfamily, x.erpCode, x.barcode, x.spec]
        .some(v => (v ?? '').toLowerCase().includes(t)),
    );
  }

  typeLabel(type: ProductType): string {
    return this.productTypes.find(t => t.value === type)?.label ?? type;
  }

  submit() {
    if (!this.form.code || !this.form.name) return;

    if (this.editingId) {
      const idx = this.items.findIndex(x => x.id === this.editingId);
      if (idx >= 0) this.items[idx] = { ...this.items[idx], ...this.form };
      this.cancelEdit();
      return;
    }

    const id = crypto.randomUUID?.() ?? String(Date.now());
    this.items.unshift({ id, ...this.form });
    this.resetForm();
  }

  edit(it: Product) {
    this.editingId = it.id;
    this.form = { ...it } as ProductForm;
  }

  remove(id: string) {
    this.items = this.items.filter(x => x.id !== id);
    if (this.editingId === id) this.cancelEdit();
  }

  cancelEdit() {
    this.editingId = null;
    this.resetForm();
  }

  resetForm() {
    this.form = { ...EMPTY_FORM };
    this.formTab = 'general';
  }

  /* ══════════ CARGA MASIVA ══════════ */

  toggleBulkUpload() {
    this.showBulkUpload = !this.showBulkUpload;
    this.resetBulk();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'csv' && ext !== 'xlsx' && ext !== 'xls') {
      this.bulkErrors = ['Solo se aceptan archivos .csv, .xlsx o .xls'];
      return;
    }

    this.bulkFile = file;
    this.bulkFileName = file.name;
    this.bulkErrors = [];
    this.bulkPreview = [];
    this.bulkImported = 0;

    if (ext === 'csv') {
      this.parseCSV(file);
    } else {
      this.parseExcel(file);
    }
  }

  private parseCSV(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      if (lines.length < 2) {
        this.bulkErrors = ['El archivo está vacío o no tiene filas de datos.'];
        return;
      }
      const headers = this.splitCSVLine(lines[0]).map(h => h.trim().toLowerCase());
      const rows: Record<string, string>[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = this.splitCSVLine(lines[i]);
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => row[h] = (cols[idx] ?? '').trim());
        rows.push(row);
      }
      this.bulkPreview = rows;
    };
    reader.readAsText(file);
  }

  private splitCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if ((ch === ',' || ch === ';') && !inQuotes) { result.push(current); current = ''; continue; }
      current += ch;
    }
    result.push(current);
    return result;
  }

  private async parseExcel(file: File) {
    try {
      const buffer = await file.arrayBuffer();
      // Importación dinámica de SheetJS (xlsx)
      const XLSX = await import('xlsx');
      const wb = XLSX.read(buffer, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
      // Normalizar keys a lowercase
      this.bulkPreview = rows.map(r => {
        const normalized: Record<string, string> = {};
        Object.keys(r).forEach(k => normalized[k.trim().toLowerCase()] = String(r[k]).trim());
        return normalized;
      });
    } catch {
      this.bulkErrors = ['Error al leer el archivo Excel. Verifique que sea un .xlsx válido.'];
    }
  }

  confirmBulkImport() {
    this.bulkErrors = [];
    let imported = 0;

    for (let i = 0; i < this.bulkPreview.length; i++) {
      const row = this.bulkPreview[i];
      const rowNum = i + 2; // +2 = header + 0-index

      const code = row['code'] ?? row['codigo'] ?? '';
      const name = row['name'] ?? row['nombre'] ?? '';

      if (!code || !name) {
        this.bulkErrors.push(`Fila ${rowNum}: código y nombre son obligatorios.`);
        continue;
      }

      if (this.items.some(x => x.code === code)) {
        this.bulkErrors.push(`Fila ${rowNum}: código "${code}" ya existe, se omitió.`);
        continue;
      }

      const rawType = (row['type'] ?? row['tipo'] ?? 'FINISHED').toUpperCase();
      const type: ProductType = this.VALID_TYPES.includes(rawType) ? rawType as ProductType : 'OTHER';

      const product: Product = {
        id: crypto.randomUUID?.() ?? String(Date.now() + i),
        code,
        name,
        description: row['description'] ?? row['descripcion'] ?? '',
        type,
        family: row['family'] ?? row['familia'] ?? '',
        subfamily: row['subfamily'] ?? row['subfamilia'] ?? '',
        uom: row['uom'] ?? row['unidad'] ?? 'un',
        netWeight: this.parseNum(row['netweight'] ?? row['peso']),
        weightUnit: row['weightunit'] ?? row['unidadpeso'] ?? 'kg',
        erpCode: row['erpcode'] ?? row['codigoerp'] ?? '',
        barcode: row['barcode'] ?? row['codigobarras'] ?? '',
        minStock: this.parseNum(row['minstock'] ?? row['stockmin']),
        maxStock: this.parseNum(row['maxstock'] ?? row['stockmax']),
        reorderPoint: this.parseNum(row['reorderpoint'] ?? row['puntoreorden']),
        leadTimeDays: this.parseNum(row['leadtimedays'] ?? row['leadtime']),
        costPrice: this.parseNum(row['costprice'] ?? row['costo']),
        currency: row['currency'] ?? row['moneda'] ?? 'USD',
        batchManaged: this.parseBool(row['batchmanaged'] ?? row['lote']),
        serialManaged: this.parseBool(row['serialmanaged'] ?? row['serie']),
        qualityInspection: this.parseBool(row['qualityinspection'] ?? row['inspeccion']),
        shelfLifeDays: this.parseNum(row['shelflifedays'] ?? row['vidautil']),
        storageConditions: row['storageconditions'] ?? row['almacenamiento'] ?? '',
        spec: row['spec'] ?? row['especificacion'] ?? '',
        active: this.parseBool(row['active'] ?? row['activo'] ?? 'true'),
      };

      this.items.unshift(product);
      imported++;
    }

    this.bulkImported = imported;
    if (imported > 0 && this.bulkErrors.length === 0) {
      // Cerrar panel después de 2s si todo OK
      setTimeout(() => this.resetBulk(), 2000);
    }
  }

  async downloadTemplate() {
    const XLSX = await import('xlsx');

    const headerRow = [
      'code', 'name', 'description', 'type', 'family', 'subfamily',
      'uom', 'netWeight', 'weightUnit', 'erpCode', 'barcode',
      'minStock', 'maxStock', 'reorderPoint', 'leadTimeDays',
      'costPrice', 'currency', 'batchManaged', 'serialManaged',
      'qualityInspection', 'shelfLifeDays', 'storageConditions', 'spec', 'active',
    ];

    const descRow = [
      'Código único *', 'Nombre *', 'Descripción', 'Tipo (ver hoja Referencia)', 'Familia', 'Subfamilia',
      'Unidad medida (kg, m, un, lt)', 'Peso neto', 'Unid. peso (kg, g, lb)', 'Código ERP', 'Código barras / SKU',
      'Stock mínimo', 'Stock máximo', 'Punto reorden', 'Lead time (días)',
      'Costo estándar', 'Moneda (USD, EUR, MXN...)', 'Gestión lote (true/false)', 'Gestión serie (true/false)',
      'Inspección calidad (true/false)', 'Vida útil (días)', 'Condiciones almacenamiento', 'Especificación técnica', 'Activo (true/false)',
    ];

    const exampleRows = [
      ['PRD-001', 'Tornillo M8x30', 'Tornillo hexagonal acero zincado', 'FINISHED', 'Ferretería', 'Tornillería',
        'un', 0.025, 'kg', 'FER-T-001', '7501000001',
        500, 5000, 1000, 7,
        0.12, 'USD', 'true', 'false',
        'true', '', '', 'Acero SAE 1018', 'true'],
      ['MP-002', 'Resina PET', 'Polietileno tereftalato grado botella', 'RAW_MATERIAL', 'Polímeros', 'PET',
        'kg', 25, 'kg', 'POL-R-002', '7501000002',
        200, 2000, 500, 14,
        1.85, 'USD', 'true', 'false',
        'true', 365, 'Ambiente seco, <30°C', 'IV 0.80 ± 0.02', 'true'],
      ['SE-003', 'Caja cartón 40x30', 'Caja corrugada para empaque', 'PACKAGING', 'Empaques', 'Cartón',
        'un', 0.35, 'kg', 'EMP-C-003', '7501000003',
        100, 1000, 300, 5,
        0.45, 'USD', 'true', 'false',
        'false', '', 'Proteger de humedad', 'Flauta C, kraft', 'true'],
    ];

    // Hoja principal: Productos
    const wsData = [descRow, headerRow, ...exampleRows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Ancho de columnas
    ws['!cols'] = headerRow.map((_h, i) => ({ wch: Math.max(descRow[i].length, 16) }));

    // Hoja de referencia
    const refData = [
      ['Campo', 'Valores válidos', 'Descripción'],
      ['type', 'RAW_MATERIAL', 'Materia prima'],
      ['', 'SEMI_FINISHED', 'Producto semielaborado'],
      ['', 'FINISHED', 'Producto terminado'],
      ['', 'CONSUMABLE', 'Consumible / insumo'],
      ['', 'SPARE_PART', 'Repuesto'],
      ['', 'PACKAGING', 'Material de empaque'],
      ['', 'BYPRODUCT', 'Subproducto / residuo aprovechable'],
      ['', 'SERVICE', 'Servicio'],
      ['', 'OTHER', 'Otro'],
      [],
      ['currency', 'USD, EUR, MXN, COP, PEN, BRL, ARS', 'Moneda del costo'],
      ['weightUnit', 'kg, g, lb, oz, ton', 'Unidad de peso'],
      ['uom', 'kg, g, m, cm, un, lt, ml, m², m³, gal, ton', 'Unidad de medida del producto'],
      [],
      ['Booleanos', 'true / false / 1 / 0 / si / no', 'Para batchManaged, serialManaged, qualityInspection, active'],
      [],
      ['NOTA', 'La fila 1 (descripciones) debe eliminarse antes de importar.', 'Solo se procesan las columnas de la fila 2 (headers).'],
    ];
    const wsRef = XLSX.utils.aoa_to_sheet(refData);
    wsRef['!cols'] = [{ wch: 20 }, { wch: 45 }, { wch: 45 }];

    // Crear libro
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Productos');
    XLSX.utils.book_append_sheet(wb, wsRef, 'Referencia');

    XLSX.writeFile(wb, 'plantilla_productos.xlsx');
  }

  resetBulk() {
    this.bulkFile = null;
    this.bulkFileName = '';
    this.bulkPreview = [];
    this.bulkErrors = [];
    this.bulkImported = 0;
  }

  private parseNum(val: string | undefined): number | null {
    if (!val || val === '') return null;
    const n = Number(val.replace(',', '.'));
    return isNaN(n) ? null : n;
  }

  private parseBool(val: string | undefined): boolean {
    if (!val) return false;
    return ['true', '1', 'si', 'sí', 'yes', 'x'].includes(val.toLowerCase());
  }
}

