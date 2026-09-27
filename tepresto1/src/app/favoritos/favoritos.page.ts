import { Component, inject } from '@angular/core';
import { IonList, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonThumbnail, IonFab, IonFooter, IonFabButton, IonSegment, IonSegmentButton, IonLabel, IonGrid, IonRow, IonCol, IonButton, IonButtons, IonTab, IonTabBar, IonIcon, IonTabButton, IonTabs } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { ItemService } from '../services/items.service';
import { FormsModule } from '@angular/forms';
import { TarjetaItem } from '../components/tarjeta-item/tarjeta-item.component';
import { addIcons } from 'ionicons';
import { homeOutline, searchOutline, heartOutline, personOutline, add } from 'ionicons/icons';

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
    IonIcon
  ]
})
export class FavoritosPage {
  private itemService = inject(ItemService);
  
  misFavoritos = this.itemService.misFavoritos;
  
  quitarFavorito(id: number) {
    this.itemService.toggleFavorito(id);
  }

    constructor() {
    addIcons({ homeOutline, searchOutline, heartOutline, personOutline, add });
  }


}
