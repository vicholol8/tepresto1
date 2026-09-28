import { Routes } from '@angular/router';
import { authGuard, invitadoGuard, sinComunidadGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'detalle/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./detalle/detalle.page').then( m => m.DetallePage)
  },
  {
    path: 'editar/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./editar/editar.page').then( m => m.EditarPage)
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./nuevo/nuevo.page').then( m => m.NuevoPage)
  },
  {
    path: 'agregar',
    canActivate: [authGuard],
    loadComponent: () => import('./agregar/agregar.page').then( m => m.AgregarPage)
  },
  {
    path: 'buscar',
    canActivate: [authGuard],
    loadComponent: () => import('./buscar/buscar.page').then( m => m.BuscarPage)
  },
  {
    path: 'favoritos',
    canActivate: [authGuard],
    loadComponent: () => import('./favoritos/favoritos.page').then( m => m.FavoritosPage)
  },
  {
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () => import('./perfil/perfil.page').then( m => m.PerfilPage)
  },
  {
    path: 'completar-perfil',
    canActivate: [sinComunidadGuard],
    loadComponent: () => import('./completar-perfil/completar-perfil.page').then( m => m.CompletarPerfilPage)
  },
  {
    path: 'chats',
    canActivate: [authGuard],
    loadComponent: () => import('./chats/chats.page').then( m => m.ChatsPage)
  },
  {
    path: 'chat/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./chat/chat.page').then( m => m.ChatPage)
  },
  {
    path: 'registro',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./registro/registro.page').then( m => m.RegistroPage)
  },
];
