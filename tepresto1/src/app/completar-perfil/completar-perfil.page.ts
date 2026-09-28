import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton, IonText } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

// Para cuentas que existen pero aún no pertenecen a un edificio
@Component({
  selector: 'app-completar-perfil',
  templateUrl: './completar-perfil.page.html',
  styleUrls: ['./completar-perfil.page.scss'],
  standalone: true,
  imports: [FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton, IonText],
})
export class CompletarPerfilPage {
  private auth = inject(AuthService);
  private router = inject(Router);

  usuario = this.auth.usuario;
  codigo = '';
  depto = this.auth.usuario()?.depto ?? '';

  // Signals: se actualizan después de un await y la app es zoneless
  error = signal('');
  cargando = signal(false);

  async unirse() {
    if (!this.codigo.trim() || !this.depto.trim()) {
      this.error.set('Completa el código del edificio y tu departamento.');
      return;
    }
    this.cargando.set(true);
    const r = await this.auth.unirseComunidad(this.codigo, this.depto);
    this.cargando.set(false);
    if (!r.exito) {
      this.error.set(r.mensaje);
      return;
    }
    this.router.navigate(['/home'], { replaceUrl: true });
  }

  async salir() {
    await this.auth.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
