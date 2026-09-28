import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonButtons,
  IonBackButton, IonButton, IonTextarea, IonText } from '@ionic/angular';
import { ItemService, DatosItem } from '../services/items.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-agregar',
  templateUrl: './agregar.page.html',
  styleUrls: ['./agregar.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonButtons,
    IonBackButton, IonButton, FormsModule, IonTextarea, IonText]
})
export class AgregarPage {
  private itemService = inject(ItemService);
  private router = inject(Router);

  // El dueño y la comunidad los pone la base a partir de la sesión
  nuevoItem: DatosItem = { foto: '', nombre: '', tipo: '', precio: '', descripcion: '' };

  // Signals: se actualizan después de un await y la app es zoneless
  error = signal('');
  guardando = signal(false);

  async guardar() {
    if (!this.nuevoItem.nombre.trim() || !this.nuevoItem.tipo.trim() || !this.nuevoItem.precio.trim()) {
      this.error.set('Nombre, tipo y precio son obligatorios.');
      return;
    }
    this.guardando.set(true);
    const r = await this.itemService.agregar(this.nuevoItem);
    this.guardando.set(false);
    if (!r.exito) {
      this.error.set(r.mensaje);
      return;
    }
    this.router.navigate(['/home']);
  }
}
