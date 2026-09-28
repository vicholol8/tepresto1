import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonFooter, IonLabel, IonTabBar, IonIcon, IonTabButton, IonSearchbar, IonList, IonItem, IonThumbnail, IonButton, IonText, IonAvatar } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { ItemService, Items } from '../services/items.service';
import { MuroService } from '../services/muro.service';
import { AuthService } from '../services/auth.service';
import { TIPOS_POST } from '../components/post-card/post-card.component';
import { FormsModule } from '@angular/forms';
import { TarjetaItem } from '../components/tarjeta-item/tarjeta-item.component';
import { addIcons } from 'ionicons';
import { homeOutline, searchOutline, heartOutline, personOutline, add } from 'ionicons/icons';

@Component({
  selector: 'app-buscar',
  templateUrl: './buscar.page.html',
  styleUrls: ['./buscar.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonFooter, IonLabel, TarjetaItem, RouterLink, FormsModule, IonTabBar, IonIcon, IonTabButton, IonSearchbar, IonList, IonItem, IonThumbnail, IonButton, IonText, IonAvatar]
})
export class BuscarPage {
  private itemService = inject(ItemService);
  private router = inject(Router);
  private muroService = inject(MuroService);
  private auth = inject(AuthService);

  readonly tipos = TIPOS_POST;

  textoBusqueda = signal<string>('');

  itemsFiltrados = computed(() => {
    const busqueda = this.textoBusqueda().toLowerCase().trim();
    const todos = this.itemService.deMiComunidad();
    if (!busqueda) return todos;
    return todos.filter(item =>
      item.nombre.toLowerCase().includes(busqueda) ||
      item.tipo.toLowerCase().includes(busqueda) ||
      item.descripcion.toLowerCase().includes(busqueda)
    );
  });
  
  // Publicaciones del muro: solo se muestran cuando hay algo escrito
  postsFiltrados = computed(() => {
    const busqueda = this.textoBusqueda().toLowerCase().trim();
    if (!busqueda) return [];
    return this.muroService.deMiComunidad().filter(post => {
      const autor = this.auth.obtenerUsuario(post.autorId)?.nombre ?? '';
      return post.texto.toLowerCase().includes(busqueda) || autor.toLowerCase().includes(busqueda);
    });
  });

  autor(autorId: string) {
    return this.auth.obtenerUsuario(autorId);
  }

  constructor() { 
    addIcons({ homeOutline, searchOutline, heartOutline, personOutline, add });
  }

  dueno(item: Items) {
    return this.itemService.dueno(item);
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
