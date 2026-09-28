import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonAvatar,
  IonLabel, IonBadge, IonNote, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { chatbubblesOutline } from 'ionicons/icons';
import { ChatService, Conversacion } from '../services/chat.service';
import { ItemService } from '../services/items.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.page.html',
  styleUrls: ['./chats.page.scss'],
  standalone: true,
  imports: [RouterLink, DatePipe, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
    IonAvatar, IonLabel, IonBadge, IonNote, IonIcon]
})
export class ChatsPage {
  private chatService = inject(ChatService);
  private itemService = inject(ItemService);
  private auth = inject(AuthService);

  conversaciones = this.chatService.misConversaciones;

  constructor() {
    addIcons({ chatbubblesOutline });
  }

  otro(c: Conversacion) {
    return this.chatService.otroParticipante(c);
  }

  nombreItem(c: Conversacion): string | undefined {
    return c.itemId === undefined ? undefined : this.itemService.obtener(String(c.itemId))?.nombre;
  }

  ultimo(c: Conversacion) {
    return this.chatService.ultimoMensaje(c);
  }

  esMio(autorId: string): boolean {
    return this.auth.usuario()?.id === autorId;
  }

  noLeidos(c: Conversacion): number {
    return this.chatService.noLeidos(c);
  }

  // Mensajes de hoy muestran la hora; los anteriores, la fecha
  formatoFecha(fecha: number): string {
    return new Date(fecha).toDateString() === new Date().toDateString() ? 'HH:mm' : 'dd/MM';
  }
}
