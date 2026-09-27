import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, 
  IonButton, IonText } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, 
    IonInput, IonButton, IonText],
})
export class LoginPage {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  error = '';

  ingresar() {
    const ok = this.auth.login(this.email, this.password);
    if (ok) {
      this.error = '';
      this.router.navigate(['/home']);
    } else {
      this.error = 'Correo o contraseña incorrectos.';
    }
  }
}