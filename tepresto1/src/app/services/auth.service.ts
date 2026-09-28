import { Injectable, signal, computed } from '@angular/core';

export interface Usuario {
  email: string;
  password: string;
  nombre: string;
  depto: string;
  foto: string;
  comunidad: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private codigosComunidades: Record<string, string> = {
    'EdifiCio-A': 'Edificio A',
    'EdifiCio-B': 'Edificio B'
  }
  // Usuarios de prueba — reemplazar por backend real cuando exista
  private usuarios: Usuario[] = [
    { email: 'carlos@correo.com', password: '1234', nombre: 'Carlos P.', depto: 'dpto 203', 
      foto: 'https://ui-avatars.com/api/?name=Carlos+P&background=random', comunidad: 'Edificio A' },
    { email: 'maria@correo.com', password: '1234', nombre: 'María G.', depto: 'dpto 401', 
      foto: 'https://ui-avatars.com/api/?name=Maria+G&background=random', comunidad: 'Edificio B' },
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

  registrar(datos: Omit<Usuario, 'comunidad' | 'foto'>, codigoEdificio: string): { exito: boolean; mensaje: string} {
    const nombreComunidad = this.codigosComunidades[codigoEdificio.toUpperCase()];
    if (!nombreComunidad) {
      return { exito: false, mensaje: 'El código de edidicio no existe.'};
    }

    if (!this.usuarios.find(u => u.email === datos.email)) {
      return { exito: false, mensaje: 'Este correo ya está registrado.'};
    }

    const nuevoUsuario: Usuario = {...datos, foto: `https://ui-avatars.com/api/?name=${datos.nombre.replace(' ', '+')}&background=random`, comunidad: nombreComunidad};

    this.usuarios.push(nuevoUsuario);
    this.usuarioActual.set(nuevoUsuario);
    return{ exito: true, mensaje: 'Cuenta creada con éxito.'}
  }
}