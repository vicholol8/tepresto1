import { Component, inject, signal, computed } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonFooter, IonFabButton, IonSegment, IonSegmentButton, IonLabel, IonGrid, IonRow, IonCol, IonButton, IonButtons, IonTab, IonTabBar, IonIcon, IonTabButton, IonTabs } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { ItemService } from '../services/items.service';
import { FormsModule } from '@angular/forms';
import { TarjetaItem } from '../components/tarjeta-item/tarjeta-item.component';
import { addIcons } from 'ionicons';
import { homeOutline, searchOutline, heartOutline, personOutline, add } from 'ionicons/icons';
// import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonFabButton, IonFooter, TarjetaItem, IonSegment, RouterLink, FormsModule, IonSegmentButton, IonLabel, IonGrid, IonRow, IonCol, IonButton, IonButtons, IonTab, IonTabBar, IonIcon, IonTabButton, IonTabs],
})
export class HomePage {
  private itemService = inject(ItemService);
  // private router = inject(Router);
  filtro = signal('todos');

  constructor() {
    addIcons({ homeOutline, searchOutline, heartOutline, personOutline, add });
  }

  itemFil = computed(() => {
    const lista = this.itemService.todas();
    const estado = this.filtro();

    if (estado == 'disponibles') return lista.filter(p => !p.arrendado);
    if (estado == 'adoptados') return lista.filter(p => p.arrendado);
    return lista;
  });
}
