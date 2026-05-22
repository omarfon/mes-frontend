import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
}

interface ConfirmState {
  open: boolean;
  options: ConfirmOptions;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly state = signal<ConfirmState>({
    open: false,
    options: { title: '', message: '' },
  });

  private resolveCallback?: (value: boolean) => void;

  open(options: ConfirmOptions): Observable<boolean> {
    return new Observable(observer => {
      this.state.set({ open: true, options });
      this.resolveCallback = (value: boolean) => {
        this.state.set({ open: false, options: { title: '', message: '' } });
        observer.next(value);
        observer.complete();
      };
    });
  }

  confirm(): void {
    this.resolveCallback?.(true);
  }

  dismiss(): void {
    this.resolveCallback?.(false);
  }
}
