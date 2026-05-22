import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
  standalone: true,
  selector: 'app-toast',
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-[9997] flex flex-col gap-2 pointer-events-none" aria-live="polite">
      @for (t of svc.toasts(); track t.id) {
        <div
          class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm min-w-[280px] max-w-sm"
          [class]="toastClass(t.type)"
          style="animation: toastIn 0.2s ease-out both;"
        >
          <span class="pi shrink-0 text-sm" [class]="iconClass(t.type)"></span>
          <span class="flex-1 leading-snug">{{ t.message }}</span>
          <button
            type="button"
            (click)="svc.remove(t.id)"
            class="shrink-0 opacity-60 hover:opacity-100 transition ml-1"
            aria-label="Cerrar"
          >
            <span class="pi pi-times text-xs"></span>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes toastIn {
      from { opacity: 0; transform: translateX(24px) scale(0.97); }
      to   { opacity: 1; transform: translateX(0) scale(1); }
    }
  `],
})
export class ToastComponent {
  constructor(public svc: ToastService) {}

  toastClass(type: string): string {
    switch (type) {
      case 'success': return 'bg-emerald-950/95 border-emerald-700/50 text-emerald-100 backdrop-blur-sm';
      case 'error':   return 'bg-red-950/95 border-red-700/50 text-red-100 backdrop-blur-sm';
      default:        return 'bg-blue-950/95 border-blue-700/50 text-blue-100 backdrop-blur-sm';
    }
  }

  iconClass(type: string): string {
    switch (type) {
      case 'success': return 'pi-check-circle text-emerald-400';
      case 'error':   return 'pi-times-circle text-red-400';
      default:        return 'pi-info-circle text-blue-400';
    }
  }
}
