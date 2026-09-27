import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, 
  IonImg, IonChip, IonLabel, IonButton, IonIcon } from '@ionic/angular';
import { ItemService } from '../services/items.service';
import { AuthService } from '../services/auth.service';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { chatbubblesOutline } from 'ionicons/icons';

@Component({
  selector: 'app-detalle',
  templateUrl: 'detalle.page.html',
  styleUrls: ['detalle.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, RouterLink, FormsModule, CommonModule, 
    IonContent, IonButtons, IonBackButton, IonImg, IonChip, IonLabel, IonButton, IonIcon]
})
export class DetallePage {
  private route = inject(ActivatedRoute);
  private itemService = inject(ItemService);
  private auth = inject(AuthService);
  private router = inject(Router);

  private id = this.route.snapshot.paramMap.get('id');

  item = computed(() => {
    return this.id ? this.itemService.obtener(this.id) : undefined;
  });

    constructor() {
    addIcons({ chatbubblesOutline });
    }
  // true solo si hay sesión y el usuario logueado es el dueño del producto
  esDueno = computed(() => {
    const producto = this.item();
    return producto ? this.auth.esDueno(producto.dueno) : false;
  });

  arrendar() {
    if (this.id) {
      this.itemService.arrendar(this.id);
    }
  }

  confirmacion = false;

  eliminar() {
    if (this.id && this.esDueno()) {
      this.itemService.eliminar(this.id);
      this.router.navigate(['/']);
    }
  }
}