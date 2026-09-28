import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Rutas de la app: requieren sesión y pertenecer a una comunidad
export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.listo;

  if (!auth.estaLogueado()) return router.createUrlTree(['/login']);
  if (!auth.tieneComunidad()) return router.createUrlTree(['/completar-perfil']);
  return true;
};

// Completar perfil: requiere sesión, y solo tiene sentido si aún no hay comunidad
export const sinComunidadGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.listo;

  if (!auth.estaLogueado()) return router.createUrlTree(['/login']);
  if (auth.tieneComunidad()) return router.createUrlTree(['/home']);
  return true;
};

// Login y registro: si ya hay sesión se va directo a la app
export const invitadoGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.listo;

  return auth.estaLogueado() ? router.createUrlTree(['/home']) : true;
};
