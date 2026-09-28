import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonCard, IonCardContent, IonAvatar, IonChip, IonLabel, IonButton, IonIcon, IonThumbnail } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { chatbubbleOutline, paperPlaneOutline, trashOutline, handRightOutline, megaphoneOutline,
  giftOutline, cubeOutline } from 'ionicons/icons';
import { MuroService, Post, TipoPost } from '../../services/muro.service';
import { ItemService } from '../../services/items.service';
import { AuthService } from '../../services/auth.service';
import { ChatService } from '../../services/chat.service';
import { haceCuanto } from '../../utils/tiempo';

export const TIPOS_POST: Record<TipoPost, { etiqueta: string; color: string; icono: string }> = {
  producto: { etiqueta: 'Publicó un producto', color: 'primary', icono: 'cube-outline' },
  busco: { etiqueta: 'Busco', color: 'warning', icono: 'hand-right-outline' },
  ofrezco: { etiqueta: 'Ofrezco', color: 'success', icono: 'gift-outline' },
  aviso: { etiqueta: 'Aviso', color: 'tertiary', icono: 'megaphone-outline' },
};

@Component({
  selector: 'app-post-card',
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.scss'],
  standalone: true,
  imports: [RouterLink, IonCard, IonCardContent, IonAvatar, IonChip, IonLabel, IonButton, IonIcon, IonThumbnail],
})
export class PostCard {
  post = input.required<Post>();
  // En la pantalla del post no se enlaza a sí mismo
  enDetalle = input(false);

  private muroService = inject(MuroService);
  private itemService = inject(ItemService);
  private auth = inject(AuthService);
  private chatService = inject(ChatService);
  private router = inject(Router);

  autor = computed(() => this.auth.obtenerUsuario(this.post().autorId));
  item = computed(() => {
    const itemId = this.post().itemId;
    return itemId === undefined ? undefined : this.itemService.obtener(String(itemId));
  });
  tipo = computed(() => TIPOS_POST[this.post().tipo]);
  esMio = computed(() => this.auth.esDueno(this.post().autorId));
  hace = computed(() => haceCuanto(this.post().fecha));

  confirmando = signal(false);
  ocupado = signal(false);

  constructor() {
    addIcons({ chatbubbleOutline, paperPlaneOutline, trashOutline, handRightOutline, megaphoneOutline,
      giftOutline, cubeOutline });
  }

  // Abre el chat privado con el autor; si es un producto, la conversación queda asociada a él
  async contactar() {
    this.ocupado.set(true);
    const conversacionId = await this.chatService.abrirCon(this.post().autorId, this.post().itemId);
    this.ocupado.set(false);
    if (conversacionId !== undefined) {
      this.router.navigate(['/chat', conversacionId]);
    }
  }

  async eliminar() {
    this.ocupado.set(true);
    const r = await this.muroService.eliminar(this.post().id);
    this.ocupado.set(false);
    if (r.exito && this.enDetalle()) {
      this.router.navigate(['/home']);
    }
  }
}
