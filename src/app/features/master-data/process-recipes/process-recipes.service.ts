import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environmets/environments';

export interface RecipeParam {
  id?: string;
  paramName: string;
  setpoint: string;
  minValue: string;
  maxValue: string;
  unit: string;
  critical: boolean;
  notes: string;
}

export interface ProcessRecipe {
  id: string;
  code: string;
  name: string;
  productCode: string;
  operationCode: string;
  version: string;
  approvedBy: string;
  approvedAt: string;
  active: boolean;
  params: RecipeParam[];
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface CreateProcessRecipeDto {
  code: string;
  name: string;
  productCode: string;
  operationCode: string;
  version?: string;
  approvedBy?: string;
  approvedAt?: string;
  active?: boolean;
}

export interface UpdateProcessRecipeDto extends Partial<CreateProcessRecipeDto> {}

export interface CreateRecipeParamDto {
  paramName: string;
  setpoint?: string;
  minValue?: string;
  maxValue?: string;
  unit?: string;
  critical?: boolean;
  notes?: string;
}

interface Paginated<T> { data: T[]; meta?: any; }

@Injectable({ providedIn: 'root' })
export class ProcessRecipesService {
  private url = `${environment.apiUrl}${environment.endpoints.masterData}/process-recipes`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ProcessRecipe[]> {
    return this.http.get<Paginated<ProcessRecipe>>(this.url).pipe(map(r => r.data || []));
  }

  getById(id: string): Observable<ProcessRecipe> {
    return this.http.get<ProcessRecipe>(`${this.url}/${id}`);
  }

  create(dto: CreateProcessRecipeDto): Observable<ProcessRecipe> {
    return this.http.post<ProcessRecipe>(this.url, dto);
  }

  update(id: string, dto: UpdateProcessRecipeDto): Observable<ProcessRecipe> {
    return this.http.patch<ProcessRecipe>(`${this.url}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  // Sub-resource: params
  getParams(recipeId: string): Observable<RecipeParam[]> {
    return this.http.get<RecipeParam[]>(`${this.url}/${recipeId}/params`);
  }

  addParam(recipeId: string, dto: CreateRecipeParamDto): Observable<RecipeParam> {
    return this.http.post<RecipeParam>(`${this.url}/${recipeId}/params`, dto);
  }

  updateParam(recipeId: string, paramId: string, dto: Partial<CreateRecipeParamDto>): Observable<RecipeParam> {
    return this.http.patch<RecipeParam>(`${this.url}/${recipeId}/params/${paramId}`, dto);
  }

  deleteParam(recipeId: string, paramId: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${recipeId}/params/${paramId}`);
  }
}
