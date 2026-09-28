import { Component, inject, signal, computed, viewChild } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonFabButton, IonGrid, IonRow, IonCol,
  IonIcon, IonSegment, IonSegmentButton, IonLabel, IonCard, IonCardContent, IonTextarea, IonButton,
  IonChip, IonSpinner, IonText, IonThumbnail } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ItemService, DatosItem } from '../services/items.service';
import { Resultado } from '../services/supabase.service';
import { MuroService, TipoPost } from '../services/muro.service';
import { AuthService } from '../services/auth.service';
import { TarjetaItem } from '../components/tarjeta-item/tarjeta-item.component';
import { PostCard, TIPOS_POST } from '../components/post-card/post-card.component';
import { FormProducto } from '../components/form-producto/form-producto.component';
import { limpiar } from '../utils/campos';
import { addIcons } from 'ionicons';
import { add, sendOutline, checkmarkCircle, handRightOutline, giftOutline, megaphoneOutline } from 'ionicons/icons';

type TipoPublicable = Exclude<TipoPost, 'producto'>;

function productoVacio(): DatosItem {
  return { foto: '', nombre: '', tipo: '', precio: '', descripcion: '' };
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonFabButton, TarjetaItem, PostCard,
    RouterLink, FormsModule, IonGrid, IonRow, IonCol, IonIcon, IonSegment, IonSegmentButton, IonLabel,
    IonCard, IonCardContent, IonTextarea, IonButton, IonChip, IonSpinner, IonText, IonThumbnail, FormProducto],
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

  // Ofrezco: publicar un producto nuevo o uno de los que ya tengo
  modoOferta = signal<'nuevo' | 'mio'>('nuevo');
  productoNuevo = signal<DatosItem>(productoVacio());
  fotoNueva = signal<File | null>(null);
  productoElegido = signal<number | undefined>(undefined);
  misProductos = this.itemService.misProductos;

  puedePublicar = computed(() => {
    if (this.tipoNuevo() !== 'ofrezco') return !!this.textoNuevo().trim();
    // El producto nuevo se valida al publicar para poder mostrar qué falta
    return this.modoOferta() === 'nuevo' || this.productoElegido() !== undefined;
  });

  posts = computed(() => {
    const filtro = this.filtroMuro();
    const lista = this.muroService.deMiComunidad();
    return filtro === 'todos' ? lista : lista.filter(p => p.tipo === filtro);
  });

  // Productos
  items = this.itemService.deMiComunidad;

  constructor() {
    // Los de los tipos también: los chips del formulario se muestran aunque el muro no tenga posts
    addIcons({ add, sendOutline, checkmarkCircle, handRightOutline, giftOutline, megaphoneOutline });
  }

  etiquetaFiltro(f: TipoPost | 'todos'): string {
    if (f === 'todos') return 'Todos';
    if (f === 'producto') return 'Productos';
    return this.tipos[f].etiqueta;
  }

  placeholder = computed(() => ({
    busco: '¿Qué necesitas que te presten?',
    ofrezco: 'Agrega un mensaje para tus vecinos (opcional)',
    aviso: '¿Qué quieres avisarle al edificio?',
  })[this.tipoNuevo()]);

  // Signals: se actualizan después de un await y la app es zoneless
  publicando = signal(false);
  errorPublicar = signal('');

  async publicar() {
    const tipo = this.tipoNuevo();
    let r: Resultado;
    this.publicando.set(true);
    if (tipo === 'ofrezco' && this.modoOferta() === 'nuevo') {
      r = await this.ofrecerNuevo();
    } else if (tipo === 'ofrezco') {
      r = await this.muroService.publicar(tipo, this.textoNuevo(), this.productoElegido());
    } else {
      r = await this.muroService.publicar(tipo, this.textoNuevo());
    }
    this.publicando.set(false);
    if (!r.exito) {
      this.errorPublicar.set(r.mensaje);
      return;
    }
    this.errorPublicar.set('');
    this.textoNuevo.set('');
    limpiar(this.campo());
    this.productoNuevo.set(productoVacio());
    this.fotoNueva.set(null);
    this.productoElegido.set(undefined);
    this.filtroMuro.set('todos');
  }

  private async ofrecerNuevo(): Promise<Resultado> {
    const datos = this.productoNuevo();
    const invalido = this.itemService.validar(datos);
    if (invalido) return { exito: false, mensaje: invalido };
    const r = await this.itemService.ofrecerNuevo(datos, this.fotoNueva(), this.textoNuevo());
    if (r.exito) await this.muroService.cargar();
    return r;
  }
}
