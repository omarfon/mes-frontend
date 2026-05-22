import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../../environmets/environments';

export interface WipTickPayload {
  wipId: string;
  stepSeq: number;
  operation: string;
  machineName: string;
  countPerSecond: number;
  totalCount: number;
  targetQty: number;
  progressPct: number;
  efficiency: number;
  elapsedSec: number;
  rpm?: number;
  temperature?: number;
  status: 'RUNNING' | 'PAUSED' | 'ALERT';
}

export interface WipSubscribeOptions {
  wipId: string;
  stepSeq: number;
  operation: string;
  machineName: string;
  targetQty: number;
  baseRate?: number;
  baseEfficiency?: number;
}

@Injectable({ providedIn: 'root' })
export class WipRealtimeService implements OnDestroy {
  private socket: Socket | null = null;

  private tickSubject   = new Subject<WipTickPayload>();
  private completedSubject = new Subject<{ wipId: string; stepSeq: number }>();

  /** Último tick recibido */
  tick$      = this.tickSubject.asObservable();
  completed$ = this.completedSubject.asObservable();

  private connect() {
    if (this.socket?.connected) return;

    const wsUrl = environment.apiUrl.replace('/api', '');   // ws://localhost:3000
    this.socket = io(`${wsUrl}/wip`, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('wip:tick', (data: WipTickPayload) => {
      this.tickSubject.next(data);
    });

    this.socket.on('wip:completed', (data: { wipId: string; stepSeq: number }) => {
      this.completedSubject.next(data);
    });
  }

  subscribe(opts: WipSubscribeOptions) {
    this.connect();
    this.socket!.emit('wip:subscribe', opts);
  }

  unsubscribe() {
    this.socket?.emit('wip:unsubscribe');
  }

  disconnect() {
    this.unsubscribe();
    this.socket?.disconnect();
    this.socket = null;
  }

  ngOnDestroy() {
    this.disconnect();
  }
}
