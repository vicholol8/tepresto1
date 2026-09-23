import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonButtons, IonBackButton, IonButton, IonSegment, IonSegmentButton, IonLabel, IonToggle, IonItem, IonTextarea } from '@ionic/angular';
import { ItemService } from '../services/items.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-agregar',
  templateUrl: './agregar.page.html',
  styleUrls: ['./agregar.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonButtons, IonBackButton, IonButton, IonSegment, IonSegmentButton, IonLabel, FormsModule, IonToggle, IonItem, IonTextarea]
})
export class AgregarPage {
  private itemService = inject(ItemService);
  private router = inject(Router);

  nuevoItem: any = {
    id: 0,
    foto: '',
    nombre: '',
    tipo: '',
    precio: '',
    depto: '',
    dueno: '',
    descripcion: '',
    arrendado: false
  };

  guardar() {
    this.itemService.agregar(this.nuevoItem);
    this.router.navigate(['/']);
  }
}
