import { Component, inject, computed, signal } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonAvatar, IonList, IonItem, 
  IonThumbnail, IonLabel, IonButton, IonIcon, IonText, IonInput } from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ItemService } from '../services/items.service';
import { AuthService } from '../services/auth.service';
import { addIcons } from 'ionicons';
import { locationOutline, mailOutline, logOutOutline, createOutline, 
  checkmarkOutline, closeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [RouterLink, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, 
    IonAvatar, IonList, IonItem, IonThumbnail, IonLabel, IonButton, IonIcon, IonText, IonInput]
})
export class PerfilPage {
  private itemService = inject(ItemService);
  private auth = inject(AuthService);
  private router = inject(Router);

  usuario = computed(() => this.auth.usuario());

  misItems = computed(() => {
    const u = this.usuario();
    if (!u) return [];
    return this.itemService.todas().filter(item => item.dueno === u.nombre);
  });

  editando = signal(false);

  // Borrador editable, separado del signal real hasta que se guarde
  form = { nombre: '', depto: '', foto: '' };

  constructor() {
    addIcons({ locationOutline, mailOutline, logOutOutline, createOutline, checkmarkOutline, closeOutline });
  }

  activarEdicion() {
    const u = this.usuario();
    if (!u) return;
    this.form = { nombre: u.nombre, depto: u.depto, foto: u.foto };
    this.editando.set(true);
  }

  guardarEdicion() {
    this.auth.actualizarPerfil(this.form);
    this.editando.set(false);
  }

  cancelarEdicion() {
    this.editando.set(false);
  }

  cerrarSesion() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}