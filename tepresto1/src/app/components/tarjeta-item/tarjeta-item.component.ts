import { Component, Input, inject } from '@angular/core';
import { IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, 
  IonButton, IonIcon } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { ItemService, Items } from '../../services/items.service';

@Component({
  selector: 'app-tarjeta-item',
  templateUrl: 'tarjeta-item.component.html',
  styleUrls: ['tarjeta-item.component.scss'],
  standalone: true,
  imports: [IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, 
    IonButton, IonIcon, RouterLink],
})
export class TarjetaItem {
  @Input() item!: Items;

  private itemService = inject(ItemService);

  toggleFav(event: Event) {
    event.stopPropagation();
    this.itemService.toggleFavorito(this.item.id);
  }

  dueno() {
    return this.itemService.dueno(this.item);
  }

  esFav(): boolean {
    return this.itemService.esFavorito(this.item.id);
  }
}