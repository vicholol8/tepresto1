import { Component, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonFooter, IonFabButton, IonSegment, IonSegmentButton, IonLabel, IonGrid, IonRow, IonCol, IonButton, IonButtons, IonTab, IonTabBar, IonIcon, IonTabButton, IonTabs } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { ItemService } from '../services/items.service';
import { FormsModule } from '@angular/forms';
import { TarjetaItem } from '../components/tarjeta-item/tarjeta-item.component';
import { addIcons } from 'ionicons';
import { homeOutline, searchOutline, heartOutline, personOutline, add } from 'ionicons/icons';
@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonFooter, TarjetaItem, RouterLink, FormsModule, IonLabel, IonTabBar, IonIcon, IonTabButton]
})
export class PerfilPage {

  constructor() { }

  ngOnInit() {
  }

}
