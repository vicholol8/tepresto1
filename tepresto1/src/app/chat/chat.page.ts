import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonFooter, IonInput, IonButton, IonIcon, IonButtons, IonBackButton } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { send } from 'ionicons/icons';
import { ItemService } from '../services/items.service';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonFooter, IonInput, IonButton, IonIcon, IonButtons, IonBackButton ]
})
export class ChatPage {
  private route = inject(ActivatedRoute);
  private itemService = inject(ItemService);
  private auth = inject(AuthService);

  private id = this.route.snapshot.paramMap.get('id');

  producto = computed(() => {
    return this.id ? this.itemService.obtener(this.id) : undefined;
  });

  nuevoMensaje = '';
  mensajes = signal<any[]>([]);

  constructor() {
    addIcons({ send });
  }

  enviar(){
    if (this.nuevoMensaje.trim() === '') return;
    this.mensajes.update(lista => [...lista, {id: Date.now(), texto: this.nuevoMensaje, esMio: true, hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}]);
    this.nuevoMensaje = '';
  }
}
