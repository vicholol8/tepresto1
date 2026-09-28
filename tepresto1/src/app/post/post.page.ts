import { Component, inject, signal, computed, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonFooter, IonInput, IonButton, IonIcon,
  IonButtons, IonBackButton, IonAvatar, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { send } from 'ionicons/icons';
import { MuroService } from '../services/muro.service';
import { AuthService } from '../services/auth.service';
import { PostCard } from '../components/post-card/post-card.component';
import { haceCuanto } from '../utils/tiempo';
import { limpiar } from '../utils/campos';

@Component({
  selector: 'app-post',
  templateUrl: './post.page.html',
  styleUrls: ['./post.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonFooter, IonInput, IonButton, IonIcon,
    IonButtons, IonBackButton, IonAvatar, IonSpinner, FormsModule, PostCard]
})
export class PostPage {
  private route = inject(ActivatedRoute);
  private muroService = inject(MuroService);
  private auth = inject(AuthService);

  private content = viewChild(IonContent);
  private campo = viewChild(IonInput);
  private id = this.route.snapshot.paramMap.get('id') ?? '';

  post = computed(() => this.muroService.obtener(this.id));
  nuevoComentario = signal('');

  constructor() {
    addIcons({ send });
  }

  autor(autorId: string) {
    return this.auth.obtenerUsuario(autorId);
  }

  esMio(autorId: string): boolean {
    return this.auth.esDueno(autorId);
  }

  hace(fecha: number): string {
    return haceCuanto(fecha);
  }

  cargado = this.muroService.cargado;
  enviando = signal(false);

  async comentar() {
    const p = this.post();
    const texto = this.nuevoComentario();
    if (!p || !texto.trim() || this.enviando()) return;
    // Se limpia antes de enviar para que se pueda seguir escribiendo; si falla se restaura
    this.nuevoComentario.set('');
    limpiar(this.campo());
    this.enviando.set(true);
    const r = await this.muroService.comentar(p.id, texto);
    this.enviando.set(false);
    if (!r.exito) {
      this.nuevoComentario.set(texto);
      const campo = this.campo();
      if (campo) campo.value = texto;
      return;
    }
    setTimeout(() => this.content()?.scrollToBottom(200));
  }
}
