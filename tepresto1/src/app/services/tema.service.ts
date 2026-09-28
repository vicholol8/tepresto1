import { Injectable, effect, signal } from '@angular/core';

const CLAVE = 'tepresto-modo-oscuro';

// Modo claro/oscuro. Si el usuario nunca lo ha cambiado, sigue al sistema; al elegirlo se recuerda
// en este dispositivo. Ionic aplica la paleta oscura con la clase ion-palette-dark en <html>.
@Injectable({ providedIn: 'root' })
export class TemaService {
  private sistema = window.matchMedia('(prefers-color-scheme: dark)');
  readonly oscuro = signal(this.leerGuardado() ?? this.sistema.matches);

  constructor() {
    this.sistema.addEventListener('change', e => {
      if (this.leerGuardado() === null) this.oscuro.set(e.matches);
    });
    effect(() => {
      const oscuro = this.oscuro();
      document.documentElement.classList.toggle('ion-palette-dark', oscuro);
      document.documentElement.style.colorScheme = oscuro ? 'dark' : 'light';
    });
  }

  cambiar(oscuro: boolean) {
    this.oscuro.set(oscuro);
    try {
      localStorage.setItem(CLAVE, String(oscuro));
    } catch {
      // Sin almacenamiento (p. ej. navegación privada) solo dura esta sesión
    }
  }

  private leerGuardado(): boolean | null {
    try {
      const valor = localStorage.getItem(CLAVE);
      return valor === null ? null : valor === 'true';
    } catch {
      return null;
    }
  }
}
