import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonButtons,
  IonBackButton, IonButton, IonTextarea, IonText, NavController } from '@ionic/angular';
import { ItemService, DatosItem } from '../services/items.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.page.html',
  styleUrls: ['./editar.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonButtons,
    IonBackButton, IonButton, IonTextarea, IonText, FormsModule]
})
export class EditarPage {
  private route = inject(ActivatedRoute);
  private itemService = inject(ItemService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private navCtrl = inject(NavController);

  id = this.route.snapshot.paramMap.get('id') ?? '';

  // Borrador editable; null mientras se cargan los datos. Signals porque se llenan después de
  // un await y la app es zoneless.
  form = signal<DatosItem | null>(null);
  error = signal('');
  guardando = signal(false);

  constructor() {
    this.iniciar();
  }

  // Al entrar directo por URL los items aún no están cargados: se espera antes de validar
  private async iniciar() {
    await this.itemService.esperarCarga();
    const original = this.itemService.obtener(this.id);
    // Solo el dueño puede editar; cualquier otro vuelve al detalle
    if (!original || !this.auth.esDueno(original.duenoId)) {
      this.router.navigate(['/detalle', this.id], { replaceUrl: true });
      return;
    }
    const { foto, nombre, tipo, precio, descripcion } = original;
    this.form.set({ foto, nombre, tipo, precio, descripcion });
  }

  async guardar() {
    const datos = this.form();
    if (!datos) return;

    if (!datos.nombre.trim() || !datos.tipo.trim() || !datos.precio.trim()) {
      this.error.set('Nombre, tipo y precio son obligatorios.');
      return;
    }

    this.guardando.set(true);
    const r = await this.itemService.editar(Number(this.id), datos);
    this.guardando.set(false);
    if (!r.exito) {
      this.error.set(r.mensaje);
      return;
    }
    this.navCtrl.navigateBack(['/detalle', this.id]);
  }
}
