import { Component, ElementRef, OnInit, effect, input, model, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonInput, IonTextarea, IonButton, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { cameraOutline, imageOutline } from 'ionicons/icons';
import { DatosItem } from '../../services/items.service';

// Campos de un producto (foto, nombre, tipo, precio, descripción). Edita `datos` directamente;
// la foto elegida queda en `foto` y la sube el ItemService al guardar.
@Component({
  selector: 'app-form-producto',
  templateUrl: './form-producto.component.html',
  styleUrls: ['./form-producto.component.scss'],
  standalone: true,
  imports: [FormsModule, IonInput, IonTextarea, IonButton, IonIcon],
})
export class FormProducto implements OnInit {
  datos = input.required<DatosItem>();
  foto = model<File | null>(null);

  private selector = viewChild.required<ElementRef<HTMLInputElement>>('selector');
  // Lo que se muestra: la foto recién elegida (URL local) o la que ya tenía el producto
  vista = signal('');

  constructor() {
    addIcons({ cameraOutline, imageOutline });
    effect(onCleanup => {
      const archivo = this.foto();
      if (!archivo) return;
      const url = URL.createObjectURL(archivo);
      this.vista.set(url);
      onCleanup(() => URL.revokeObjectURL(url));
    });
  }

  ngOnInit() {
    this.vista.set(this.datos().foto);
  }

  elegir() {
    this.selector().nativeElement.click();
  }

  alElegir(evento: Event) {
    const campo = evento.target as HTMLInputElement;
    const archivo = campo.files?.[0];
    campo.value = ''; // permite volver a elegir el mismo archivo
    if (archivo) this.foto.set(archivo);
  }

  quitar() {
    this.foto.set(null);
    this.datos().foto = '';
    this.vista.set('');
  }
}
