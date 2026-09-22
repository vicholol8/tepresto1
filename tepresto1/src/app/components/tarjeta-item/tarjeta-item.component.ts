import { Component, Input } from '@angular/core';
import { IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { Items } from '../../services/items.service';

@Component({
  selector: 'app-tarjeta-item',
  templateUrl: 'tarjeta-item.component.html',
  styleUrls: ['tarjeta-item.component.scss'],
  standalone: true,
  imports: [IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, RouterLink],
})
export class TarjetaItem {
  @Input() item!: Items;
}