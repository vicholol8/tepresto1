import { Component, inject } from '@angular/core';
import { 
  IonTabs, 
  IonTabBar, 
  IonTabButton, 
  IonIcon, 
  IonLabel,
  IonBadge
} from '@ionic/angular';
import { ChatService } from './services/chat.service';
import { PrestamoService } from './services/prestamo.service';

import { addIcons } from 'ionicons';
import { homeOutline, searchOutline, personOutline, add, chatbubblesOutline } from 'ionicons/icons';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [
    IonTabs, 
    IonTabBar, 
    IonTabButton, 
    IonIcon, 
    IonLabel,
    IonBadge
  ],
})
export class AppComponent {
  noLeidos = inject(ChatService).totalNoLeidos;
  porResponder = inject(PrestamoService).solicitudesPorResponder;

  constructor() {
    addIcons({ homeOutline, searchOutline, personOutline, add, chatbubblesOutline });
  }
}