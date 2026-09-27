import { Injectable, signal, computed } from '@angular/core';

export interface Usuario {
  email: string;
  password: string;
  nombre: string;
  depto: string;
  foto: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Usuarios de prueba — reemplazar por backend real cuando exista
  private usuarios: Usuario[] = [
    { email: 'carlos@correo.com', password: '1234', nombre: 'Carlos P.', depto: 'dpto 203', 
      foto: 'https://ui-avatars.com/api/?name=Carlos+P&background=random' },
    { email: 'maria@correo.com', password: '1234', nombre: 'María G.', depto: 'dpto 401', 
      foto: 'https://ui-avatars.com/api/?name=Maria+G&background=random' },
  ];

  private usuarioActual = signal<Usuario | null>(null);

  readonly estaLogueado = computed(() => this.usuarioActual() !== null);
  readonly usuario = computed(() => this.usuarioActual());

  login(email: string, password: string): boolean {
    const user = this.usuarios.find(u => u.email === email && u.password === password);
    if (user) {
      this.usuarioActual.set(user);
      return true;
    }
    return false;
  }

  logout() {
    this.usuarioActual.set(null);
  }

  esDueno(nombreDueno: string): boolean {
    return this.usuarioActual()?.nombre === nombreDueno;
  }
    actualizarPerfil(datos: Partial<Pick<Usuario, 'nombre' | 'depto' | 'foto'>>) {
    const actual = this.usuarioActual();
    if (!actual) return;

    const actualizado: Usuario = { ...actual, ...datos };
    this.usuarioActual.set(actualizado);

    // También actualiza la copia en el arreglo de usuarios, para que persista 
    // mientras dure la sesión de la app (no hay backend real)
    const idx = this.usuarios.findIndex(u => u.email === actual.email);
    if (idx !== -1) {
      this.usuarios[idx] = actualizado;
    }
  }
}