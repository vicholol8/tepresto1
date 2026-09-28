import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton, IonText } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [FormsModule, IonHeader, IonToolbar, RouterLink, IonTitle, IonContent, IonItem, IonInput, IonButton, IonText],
})
export class LoginPage {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  // Signals: se actualizan después de un await y la app es zoneless
  error = signal('');
  cargando = signal(false);

  async ingresar() {
    if (!this.email.trim() || !this.password) {
      this.error.set('Ingresa tu correo y contraseña.');
      return;
    }
    this.cargando.set(true);
    const r = await this.auth.login(this.email, this.password);
    this.cargando.set(false);
    if (!r.exito) {
      this.error.set(r.mensaje);
      return;
    }
    this.error.set('');
    // Si aún no tiene comunidad, el guard lo manda a completar su perfil
    this.router.navigate(['/home']);
  }
}