import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, 
  IonImg, IonChip, IonLabel, IonButton, IonIcon, IonSpinner, IonText } from '@ionic/angular';
import { ItemService } from '../services/items.service';
import { AuthService } from '../services/auth.service';
import { ChatService } from '../services/chat.service';
import { ArriendoPanel } from '../components/arriendo-panel/arriendo-panel.component';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { chatbubblesOutline } from 'ionicons/icons';

@Component({
  selector: 'app-detalle',
  templateUrl: 'detalle.page.html',
  styleUrls: ['detalle.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, RouterLink, FormsModule, CommonModule, 
    IonContent, IonButtons, IonBackButton, IonImg, IonChip, IonLabel, IonButton, IonIcon, IonSpinner, IonText, ArriendoPanel]
})
export class DetallePage {
  private route = inject(ActivatedRoute);
  private itemService = inject(ItemService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private chatService = inject(ChatService);

  private id = this.route.snapshot.paramMap.get('id');

  item = computed(() => {
    return this.id ? this.itemService.obtener(this.id) : undefined;
  });

    constructor() {
    addIcons({ chatbubblesOutline });
    }
  dueno = computed(() => {
    const producto = this.item();
    return producto ? this.itemService.dueno(producto) : undefined;
  });

  // true solo si hay sesión y el usuario logueado es el dueño del producto
  esDueno = computed(() => {
    const producto = this.item();
    return producto ? this.auth.esDueno(producto.duenoId) : false;
  });

  cargado = this.itemService.cargado;
  // Signals: se actualizan después de un await y la app es zoneless
  error = signal('');
  ocupado = signal(false);

  async hablarConDueno() {
    const producto = this.item();
    if (!producto) return;
    this.ocupado.set(true);
    const conversacionId = await this.chatService.abrirCon(producto.duenoId, producto.id);
    this.ocupado.set(false);
    if (conversacionId !== undefined) {
      this.router.navigate(['/chat', conversacionId]);
    } else {
      this.error.set('No se pudo abrir el chat, intenta de nuevo.');
    }
  }

  confirmacion = false;

  async eliminar() {
    const producto = this.item();
    if (!producto || !this.esDueno()) return;
    this.ocupado.set(true);
    const r = await this.itemService.eliminar(producto.id);
    this.ocupado.set(false);
    if (r.exito) {
      this.router.navigate(['/home']);
    } else {
      this.error.set(r.mensaje);
    }
  }
}