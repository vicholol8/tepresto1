import { Component, inject, signal, computed, effect, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonFooter, IonInput, IonButton, IonIcon,
  IonButtons, IonBackButton, IonAvatar, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { send, cubeOutline } from 'ionicons/icons';
import { ChatService } from '../services/chat.service';
import { ItemService } from '../services/items.service';
import { AuthService } from '../services/auth.service';
import { limpiar } from '../utils/campos';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonFooter, IonInput, IonButton, IonIcon,
    IonButtons, IonBackButton, IonAvatar, IonSpinner, FormsModule, DatePipe, RouterLink]
})
export class ChatPage {
  private route = inject(ActivatedRoute);
  private chatService = inject(ChatService);
  private itemService = inject(ItemService);
  private auth = inject(AuthService);

  private content = viewChild(IonContent);
  private campo = viewChild(IonInput);
  private id = this.route.snapshot.paramMap.get('id') ?? '';

  // Ionic mantiene la página viva al navegar; solo se marca como leído mientras está en pantalla
  private visible = signal(false);

  conversacion = computed(() => this.chatService.obtener(this.id));
  otro = computed(() => {
    const c = this.conversacion();
    return c ? this.chatService.otroParticipante(c) : undefined;
  });
  producto = computed(() => {
    const itemId = this.conversacion()?.itemId;
    return itemId === undefined ? undefined : this.itemService.obtener(String(itemId));
  });
  mensajes = computed(() => this.conversacion()?.mensajes ?? []);

  nuevoMensaje = signal('');

  constructor() {
    addIcons({ send, cubeOutline });

    effect(() => {
      const c = this.conversacion();
      if (!c || !this.visible()) return;
      // La condición evita un ciclo: marcarLeida modifica la misma señal que lee este effect
      if (this.chatService.noLeidos(c) > 0) this.chatService.marcarLeida(c.id);
    });

    effect(() => {
      this.mensajes(); // re-ejecuta al llegar un mensaje nuevo
      setTimeout(() => this.content()?.scrollToBottom(200));
    });
  }

  ionViewWillEnter() {
    this.visible.set(true);
  }

  ionViewDidLeave() {
    this.visible.set(false);
  }

  esMio(autorId: string): boolean {
    return this.auth.usuario()?.id === autorId;
  }

  cargado = this.chatService.cargado;

  async enviar() {
    const c = this.conversacion();
    const texto = this.nuevoMensaje();
    if (!c || texto.trim() === '') return;
    // Se limpia antes de enviar para que se pueda seguir escribiendo; si falla se restaura
    this.nuevoMensaje.set('');
    limpiar(this.campo());
    const r = await this.chatService.enviar(c.id, texto);
    if (!r.exito) {
      this.nuevoMensaje.set(texto);
      const campo = this.campo();
      if (campo) campo.value = texto;
    }
  }
}
