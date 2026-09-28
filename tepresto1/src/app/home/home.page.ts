import { Component, inject, signal, computed, viewChild } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonFabButton, IonGrid, IonRow, IonCol,
  IonIcon, IonSegment, IonSegmentButton, IonLabel, IonCard, IonCardContent, IonTextarea, IonButton,
  IonChip, IonSpinner, IonText } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ItemService } from '../services/items.service';
import { MuroService, TipoPost } from '../services/muro.service';
import { AuthService } from '../services/auth.service';
import { TarjetaItem } from '../components/tarjeta-item/tarjeta-item.component';
import { PostCard, TIPOS_POST } from '../components/post-card/post-card.component';
import { limpiar } from '../utils/campos';
import { addIcons } from 'ionicons';
import { add, sendOutline } from 'ionicons/icons';

type TipoPublicable = Exclude<TipoPost, 'producto'>;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonFabButton, TarjetaItem, PostCard,
    RouterLink, FormsModule, IonGrid, IonRow, IonCol, IonIcon, IonSegment, IonSegmentButton, IonLabel,
    IonCard, IonCardContent, IonTextarea, IonButton, IonChip, IonSpinner, IonText],
})
export class HomePage {
  private itemService = inject(ItemService);
  private muroService = inject(MuroService);
  private auth = inject(AuthService);

  vista = signal<'muro' | 'productos'>('muro');
  comunidad = this.auth.comunidad;
  muroCargado = this.muroService.cargado;
  itemsCargados = this.itemService.cargado;

  // Muro
  readonly tipos = TIPOS_POST;
  readonly tiposPublicables: TipoPublicable[] = ['busco', 'ofrezco', 'aviso'];
  readonly filtros: (TipoPost | 'todos')[] = ['todos', 'producto', 'busco', 'ofrezco', 'aviso'];

  filtroMuro = signal<TipoPost | 'todos'>('todos');
  tipoNuevo = signal<TipoPublicable>('busco');
  textoNuevo = signal('');
  private campo = viewChild(IonTextarea);

  posts = computed(() => {
    const filtro = this.filtroMuro();
    const lista = this.muroService.deMiComunidad();
    return filtro === 'todos' ? lista : lista.filter(p => p.tipo === filtro);
  });

  // Productos
  items = this.itemService.deMiComunidad;

  constructor() {
    addIcons({ add, sendOutline });
  }

  etiquetaFiltro(f: TipoPost | 'todos'): string {
    if (f === 'todos') return 'Todos';
    if (f === 'producto') return 'Productos';
    return this.tipos[f].etiqueta;
  }

  placeholder = computed(() => ({
    busco: '¿Qué necesitas que te presten?',
    ofrezco: '¿Qué quieres ofrecer a tus vecinos?',
    aviso: '¿Qué quieres avisarle al edificio?',
  })[this.tipoNuevo()]);

  // Signals: se actualizan después de un await y la app es zoneless
  publicando = signal(false);
  errorPublicar = signal('');

  async publicar() {
    this.publicando.set(true);
    const r = await this.muroService.publicar(this.tipoNuevo(), this.textoNuevo());
    this.publicando.set(false);
    if (!r.exito) {
      this.errorPublicar.set(r.mensaje);
      return;
    }
    this.errorPublicar.set('');
    this.textoNuevo.set('');
    limpiar(this.campo());
    this.filtroMuro.set('todos');
  }
}
