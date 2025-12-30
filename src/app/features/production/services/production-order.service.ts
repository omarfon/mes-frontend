import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environmets/environments';
import {
  ProductionOrder,
  CreateProductionOrderDto,
  UpdateProductionOrderDto,
  ProductionOrderFilters,
  ProductionOrderStatus,
  UpdateProductionOrderStatusDto
} from '../../../shared/models/production-order.model';
import { PaginatedResponse } from '../../../shared/models/common.model';

@Injectable({
  providedIn: 'root'
})
export class ProductionOrderService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/production-orders`;

  // Signals para estado reactivo
  currentOrder = signal<ProductionOrder | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  /**
   * Obtener todas las órdenes con filtros y paginación
   */
  getAll(filters: ProductionOrderFilters = {}): Observable<PaginatedResponse<ProductionOrder>> {
    let params = new HttpParams();
    
    // Agregar filtros a los parámetros
    Object.keys(filters).forEach(key => {
      const value = (filters as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    this.loading.set(true);
    this.error.set(null);

    return this.http.get<PaginatedResponse<ProductionOrder>>(this.apiUrl, { params }).pipe(
      tap({
        next: () => {
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.message || 'Error al cargar órdenes');
        }
      })
    );
  }

  /**
   * Obtener una orden por ID
   */
  getOne(id: string): Observable<ProductionOrder> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<ProductionOrder>(`${this.apiUrl}/${id}`).pipe(
      tap({
        next: (order) => {
          this.currentOrder.set(order);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.message || 'Error al cargar orden');
        }
      })
    );
  }

  /**
   * Crear nueva orden de producción
   */
  create(dto: CreateProductionOrderDto): Observable<ProductionOrder> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<ProductionOrder>(this.apiUrl, dto).pipe(
      tap({
        next: (order) => {
          this.currentOrder.set(order);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.message || 'Error al crear orden');
        }
      })
    );
  }

  /**
   * Actualizar orden de producción
   */
  update(id: string, dto: UpdateProductionOrderDto): Observable<ProductionOrder> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.patch<ProductionOrder>(`${this.apiUrl}/${id}`, dto).pipe(
      tap({
        next: (order) => {
          this.currentOrder.set(order);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.message || 'Error al actualizar orden');
        }
      })
    );
  }

  /**
   * Cambiar estado de la orden
   */
  updateStatus(id: string, status: ProductionOrderStatus): Observable<ProductionOrder> {
    this.loading.set(true);
    this.error.set(null);

    const dto: UpdateProductionOrderStatusDto = { status };

    return this.http.patch<ProductionOrder>(`${this.apiUrl}/${id}/status`, dto).pipe(
      tap({
        next: (order) => {
          this.currentOrder.set(order);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.message || 'Error al cambiar estado');
        }
      })
    );
  }

  /**
   * Eliminar orden (soft delete)
   */
  delete(id: string): Observable<void> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap({
        next: () => {
          this.loading.set(false);
          if (this.currentOrder()?.id === id) {
            this.currentOrder.set(null);
          }
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.message || 'Error al eliminar orden');
        }
      })
    );
  }

  /**
   * Limpiar estado
   */
  clearCurrentOrder(): void {
    this.currentOrder.set(null);
  }

  /**
   * Limpiar error
   */
  clearError(): void {
    this.error.set(null);
  }

  /**
   * Obtener órdenes por estado
   */
  getByStatus(status: ProductionOrderStatus, page: number = 1, limit: number = 20): Observable<PaginatedResponse<ProductionOrder>> {
    return this.getAll({ status, page, limit });
  }

  /**
   * Buscar órdenes por texto
   */
  search(searchText: string, page: number = 1, limit: number = 20): Observable<PaginatedResponse<ProductionOrder>> {
    return this.getAll({ search: searchText, page, limit });
  }

  /**
   * Obtener órdenes activas (IN_PROGRESS)
   */
  getActive(page: number = 1, limit: number = 20): Observable<PaginatedResponse<ProductionOrder>> {
    return this.getByStatus(ProductionOrderStatus.IN_PROGRESS, page, limit);
  }

  /**
   * Obtener órdenes planificadas
   */
  getPlanned(page: number = 1, limit: number = 20): Observable<PaginatedResponse<ProductionOrder>> {
    return this.getByStatus(ProductionOrderStatus.PLANNED, page, limit);
  }
}
