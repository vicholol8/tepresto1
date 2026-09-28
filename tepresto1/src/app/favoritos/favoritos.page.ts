import { Component, inject } from '@angular/core';
import { IonList, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonThumbnail, IonLabel, IonButton,
  IonButtons, IonBackButton, IonIcon } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { ItemService, Items } from '../services/items.service';
import { addIcons } from 'ionicons';
import { heart, heartDislikeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.page.html',
  styleUrls: ['./favoritos.page.scss'],
  imports: [
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonThumbnail,
    IonLabel,
    IonButton,
    IonButtons,
    IonBackButton,
    IonIcon
  ]
})
export class FavoritosPage {
  private itemService = inject(ItemService);
  
  misFavoritos = this.itemService.misFavoritos;
  
  dueno(item: Items) {
    return this.itemService.dueno(item);
  }

  quitarFavorito(id: number) {
    this.itemService.toggleFavorito(id);
  }

  constructor() {
    addIcons({ heart, heartDislikeOutline });
  }

}
