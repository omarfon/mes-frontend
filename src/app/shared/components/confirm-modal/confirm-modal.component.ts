import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService } from './confirm.service';

@Component({
  standalone: true,
  selector: 'app-confirm-modal',
  imports: [CommonModule],
  template: `
    @if (svc.state().open) {
      <!-- Backdrop -->
      <div
        class="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
        (click)="svc.dismiss()"
      ></div>

      <!-- Modal card -->
      <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div
          class="pointer-events-auto w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in"
          style="animation: confirmIn 0.15s ease-out both;"
        >
          <!-- Body -->
          <div class="px-6 pt-6 pb-5">
            <div class="flex items-start gap-4">
              <div class="shrink-0 w-11 h-11 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center">
                <span class="pi pi-exclamation-triangle text-red-400 text-base"></span>
              </div>
              <div class="min-w-0">
                <p class="text-sm font-semibold text-slate-100">{{ svc.state().options.title }}</p>
                <p class="text-xs text-slate-400 mt-1 leading-relaxed">{{ svc.state().options.message }}</p>
              </div>
            </div>
          </div>

          <!-- Divider -->
          <div class="border-t border-slate-800"></div>

          <!-- Buttons -->
          <div class="px-6 py-4 flex gap-2 justify-end">
            <button
              type="button"
              (click)="svc.dismiss()"
              class="px-4 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              (click)="svc.confirm()"
              class="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600/80 hover:bg-red-600 text-white border border-red-500/50 transition"
            >
              {{ svc.state().options.confirmLabel ?? 'Eliminar' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes confirmIn {
      from { opacity: 0; transform: scale(0.94) translateY(-8px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }
  `],
})
export class ConfirmModalComponent {
  constructor(public svc: ConfirmService) {}
}
