import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonSearchbar, 
  IonContent, 
  IonList, 
  IonItem, 
  IonThumbnail, 
  IonLabel, 
  IonButton, 
  IonIcon, 
  IonText 
} from '@ionic/angular';
import { ItemService, Items } from '../services/items.service';

@Component({
  selector: 'app-buscar',
  templateUrl: './buscar.page.html',
  styleUrls: ['./buscar.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonSearchbar,
    IonContent,
    IonList,
    IonItem,
    IonThumbnail,
    IonLabel,
    IonButton,
    IonIcon,
    IonText
  ]
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

  onSearch(event: any) {
    this.textoBusqueda.set(event.detail.value || '');
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
}
