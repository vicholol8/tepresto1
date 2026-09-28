import { Component, inject, computed, signal } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonAvatar, IonList, IonItem, 
  IonThumbnail, IonLabel, IonButton, IonIcon, IonText, IonInput, IonBadge, IonToggle } from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ItemService } from '../services/items.service';
import { AuthService } from '../services/auth.service';
import { PrestamoService } from '../services/prestamo.service';
import { TemaService } from '../services/tema.service';
import { addIcons } from 'ionicons';
import { locationOutline, mailOutline, logOutOutline, createOutline, 
  checkmarkOutline, closeOutline, swapHorizontalOutline, heartOutline, moonOutline, sunnyOutline } from 'ionicons/icons';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [RouterLink, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, 
    IonAvatar, IonList, IonItem, IonThumbnail, IonLabel, IonButton, IonIcon, IonText, IonInput, IonBadge, IonToggle]
})
export class PerfilPage {
  private itemService = inject(ItemService);
  private auth = inject(AuthService);
  private router = inject(Router);

  usuario = computed(() => this.auth.usuario());
  porResponder = inject(PrestamoService).solicitudesPorResponder;
  tema = inject(TemaService);
  oscuro = this.tema.oscuro;
  cantidadFavoritos = computed(() => this.itemService.misFavoritos().length);

  misItems = computed(() => {
    const u = this.usuario();
    if (!u) return [];
    return this.itemService.deMiComunidad().filter(item => item.duenoId === u.id);
  });

  editando = signal(false);

  // Borrador editable, separado del signal real hasta que se guarde
  form = { nombre: '', depto: '', foto: '' };

  constructor() {
    addIcons({ locationOutline, mailOutline, logOutOutline, createOutline, checkmarkOutline, closeOutline, swapHorizontalOutline, heartOutline, moonOutline, sunnyOutline });
  }

  activarEdicion() {
    const u = this.usuario();
    if (!u) return;
    this.form = { nombre: u.nombre, depto: u.depto, foto: u.foto };
    this.editando.set(true);
  }

  // Signals: se actualizan después de un await y la app es zoneless
  guardando = signal(false);
  error = signal('');
  comunidad = this.auth.comunidad;

  async guardarEdicion() {
    if (!this.form.nombre.trim()) {
      this.error.set('El nombre no puede quedar vacío.');
      return;
    }
    this.guardando.set(true);
    const r = await this.auth.actualizarPerfil(this.form);
    this.guardando.set(false);
    if (!r.exito) {
      this.error.set(r.mensaje);
      return;
    }
    this.error.set('');
    this.editando.set(false);
  }

  cancelarEdicion() {
    this.editando.set(false);
  }

  async cerrarSesion() {
    await this.auth.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}