import { Component, inject, signal } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonBackButton, IonButton, IonText } from '@ionic/angular';
import { ItemService, DatosItem } from '../services/items.service';
import { FormProducto } from '../components/form-producto/form-producto.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-agregar',
  templateUrl: './agregar.page.html',
  styleUrls: ['./agregar.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonBackButton, IonButton, IonText, FormProducto]
})
export class AgregarPage {
  private itemService = inject(ItemService);
  private router = inject(Router);

  // El dueño y la comunidad los pone la base a partir de la sesión
  nuevoItem: DatosItem = { foto: '', nombre: '', tipo: '', precio: '', descripcion: '' };
  foto = signal<File | null>(null);

  // Signals: se actualizan después de un await y la app es zoneless
  error = signal('');
  guardando = signal(false);

  async guardar() {
    const invalido = this.itemService.validar(this.nuevoItem);
    if (invalido) {
      this.error.set(invalido);
      return;
    }
    this.guardando.set(true);
    const r = await this.itemService.agregar(this.nuevoItem, this.foto());
    this.guardando.set(false);
    if (!r.exito) {
      this.error.set(r.mensaje);
      return;
    }
    this.router.navigate(['/home']);
  }
}
