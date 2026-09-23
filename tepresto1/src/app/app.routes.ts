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
  {
    path: 'agregar',
    loadComponent: () => import('./agregar/agregar.page').then( m => m.AgregarPage)
  },
  {
    path: 'buscar',
    loadComponent: () => import('./buscar/buscar.page').then( m => m.BuscarPage)
  },
  {
    path: 'favoritos',
    loadComponent: () => import('./favoritos/favoritos.page').then( m => m.FavoritosPage)
  },
  {
    path: 'perfil',
    loadComponent: () => import('./perfil/perfil.page').then( m => m.PerfilPage)
  },
];
