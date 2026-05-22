import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environmets/environments';

export interface ActivityLogEntry {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  module: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName: string;
  description: string;
  ipAddress: string;
  userAgent: string | null;
  oldValues: Record<string, any> | null;
  newValues: Record<string, any> | null;
  metadata: Record<string, any> | null;
  fechaCreacion: string;
  createdAt: string;
}

export interface ActivityDashboard {
  recent: ActivityLogEntry[];
  byAction: { action: string; count: number }[];
  byUser: { userEmail: string; userName: string; count: number }[];
  totalToday: number;
}

export interface UserActivitySummary {
  userId: string;
  userEmail: string;
  userName: string;
  total: number;
  creates: number;
  updates: number;
  deletes: number;
  lastActivity: string;
}

@Injectable({ providedIn: 'root' })
export class ActivityLogHttpService {
  private readonly base = `${environment.apiUrl}/activity-log`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<ActivityDashboard> {
    return this.http.get<ActivityDashboard>(`${this.base}/dashboard`);
  }

  getRecent(limit = 20, userEmail?: string): Observable<ActivityLogEntry[]> {
    let params = new HttpParams().set('limit', limit);
    if (userEmail) params = params.set('userEmail', userEmail);
    return this.http.get<ActivityLogEntry[]>(`${this.base}/recent`, { params });
  }

  getByUser(days = 30): Observable<UserActivitySummary[]> {
    const params = new HttpParams().set('days', days);
    return this.http.get<UserActivitySummary[]>(`${this.base}/by-user`, { params });
  }

  getAll(filter: Record<string, string | number> = {}): Observable<any> {
    let params = new HttpParams();
    Object.entries(filter).forEach(([k, v]) => params = params.set(k, String(v)));
    return this.http.get<any>(this.base, { params });
  }
}
