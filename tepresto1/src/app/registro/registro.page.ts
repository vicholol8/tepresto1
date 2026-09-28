import { Component, inject } from '@angular/core';
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
  error = '';

  crearCuenta() {
    if (!this.nombre || !this.email || !this.password || !this.codigo || !this.depto) {
      this.error = 'Por favor, completa todos los campos.'
      return;
    }

    const resultado = this.auth.registrar(
      { nombre: this.nombre, email: this.email, password: this.password, depto: this.depto },
      this.codigo
    );

    if (resultado.exito) {
      this.error = '';
      this.router.navigate(['/home']);
    } else {
      this.error = resultado.mensaje;
    }
  }
}
