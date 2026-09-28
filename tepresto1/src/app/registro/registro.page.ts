import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton, IonText, IonButtons, IonBackButton } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, RouterLink, IonItem, IonInput, IonButton, IonText, IonButtons, IonBackButton]
})
export class RegistroPage {
  private router = inject(Router);
  private auth = inject(AuthService);

  nombre = '';
  depto = '';
  email = '';
  password = '';
  codigo = '';
  // Signals: se actualizan después de un await y la app es zoneless
  error = signal('');
  // Si Supabase pide confirmar el correo, se muestra este aviso en vez de entrar
  confirmacion = signal('');
  cargando = signal(false);

  async crearCuenta() {
    if (!this.nombre.trim() || !this.email.trim() || !this.password || !this.codigo.trim() || !this.depto.trim()) {
      this.error.set('Por favor, completa todos los campos.');
      return;
    }

    this.cargando.set(true);
    const resultado = await this.auth.registrar(
      { nombre: this.nombre, email: this.email, password: this.password, depto: this.depto },
      this.codigo
    );
    this.cargando.set(false);

    if (!resultado.exito) {
      this.error.set(resultado.mensaje);
      return;
    }
    this.error.set('');
    if (resultado.requiereConfirmacion) {
      this.confirmacion.set(resultado.mensaje);
    } else {
      this.router.navigate(['/home']);
    }
  }
}
