import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonImg, IonChip, IonLabel, IonButton } from '@ionic/angular';
import { ItemService } from '../services/items.service';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-detalle',
  templateUrl: 'detalle.page.html',
  styleUrls: ['detalle.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, RouterLink, FormsModule, CommonModule, IonContent, IonButtons, IonBackButton, IonImg, IonChip, IonLabel, IonButton]
})
export class DetallePage {
  private route = inject(ActivatedRoute);
  private itemService = inject(ItemService)
  private router = inject(Router)

  private id = this.route.snapshot.paramMap.get('id');
  item = computed(() => {
    return this.id ? this.itemService.obtener(this.id) : undefined;
});

  arrendar() {
    if (this.id) {
      this.itemService.arrendar(this.id);
    }
  }

  confirmacion = false;

  eliminar(){
    if (this.id) {
      this.itemService.eliminar(this.id);
      this.router.navigate(['/']);
    }
  }
}