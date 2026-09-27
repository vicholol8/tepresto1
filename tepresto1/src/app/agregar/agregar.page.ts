import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonButtons, 
  IonBackButton, IonButton, IonTextarea } from '@ionic/angular';
import { ItemService } from '../services/items.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-agregar',
  templateUrl: './agregar.page.html',
  styleUrls: ['./agregar.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonButtons, 
    IonBackButton, IonButton, FormsModule, IonTextarea]
})
export class AgregarPage {
  private itemService = inject(ItemService);
  private auth = inject(AuthService);
  private router = inject(Router);

  nuevoItem: any = {
    id: 0, foto: '', nombre: '', tipo: '', precio: '', depto: '',
    descripcion: '', arrendado: false
  };

  guardar() {
    const usuario = this.auth.usuario();
    if (!usuario) return; // el guard ya debería impedir llegar aquí sin sesión
    this.nuevoItem.dueno = usuario.nombre;
    this.itemService.agregar(this.nuevoItem);
    this.router.navigate(['/']);
  }
}