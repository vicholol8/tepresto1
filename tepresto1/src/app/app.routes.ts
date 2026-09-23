import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'detalle/:id',
    loadComponent: () => import('./detalle/detalle.page').then( m => m.DetallePage)
  },
  {
    path: 'editar/:id',
    loadComponent: () => import('./editar/editar.page').then( m => m.EditarPage)
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./nuevo/nuevo.page').then( m => m.NuevoPage)
  },
];
