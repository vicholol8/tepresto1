import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonFooter, IonLabel, IonTabBar, IonIcon, IonTabButton, IonSearchbar, IonList, IonItem, IonThumbnail, IonButton, IonText  } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { ItemService } from '../services/items.service';
import { FormsModule } from '@angular/forms';
import { TarjetaItem } from '../components/tarjeta-item/tarjeta-item.component';
import { addIcons } from 'ionicons';
import { homeOutline, searchOutline, heartOutline, personOutline, add } from 'ionicons/icons';

@Component({
  selector: 'app-buscar',
  templateUrl: './buscar.page.html',
  styleUrls: ['./buscar.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonFooter, IonLabel, TarjetaItem, RouterLink, FormsModule, IonTabBar, IonIcon, IonTabButton, IonSearchbar, IonList, IonItem, IonThumbnail, IonButton, IonText]
})
export class BuscarPage {
  private itemService = inject(ItemService);
  private router = inject(Router);

  textoBusqueda = signal<string>('');

  itemsFiltrados = computed(() => {
    const busqueda = this.textoBusqueda().toLowerCase().trim();
    const todos = this.itemService.todas();
    if (!busqueda) return todos;
    return todos.filter(item =>
      item.nombre.toLowerCase().includes(busqueda) ||
      item.tipo.toLowerCase().includes(busqueda) ||
      item.descripcion.toLowerCase().includes(busqueda)
    );
  });
  
  constructor() { 
    addIcons({ homeOutline, searchOutline, heartOutline, personOutline, add });
  }

  irADetalle(id: number) {
    this.router.navigate(['/detalle', id]);
  }

  toggleFav(id: number) {
    this.itemService.toggleFavorito(id);
  }

  esFav(id: number): boolean {
    return this.itemService.esFavorito(id);
  }

  onSearch(event: any) {
    this.textoBusqueda.set(event.detail.value || '');
}
}
