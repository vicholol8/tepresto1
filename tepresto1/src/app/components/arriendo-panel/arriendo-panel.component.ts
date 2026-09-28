import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonButton, IonIcon, IonInput, IonTextarea, IonText, IonAvatar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { calendarOutline, checkmarkOutline, closeOutline, returnDownBackOutline, timeOutline } from 'ionicons/icons';
import { Items } from '../../services/items.service';
import { AuthService } from '../../services/auth.service';
import { PrestamoService, Resultado } from '../../services/prestamo.service';
import { diaISO, formatearDia } from '../../utils/tiempo';

@Component({
  selector: 'app-arriendo-panel',
  templateUrl: './arriendo-panel.component.html',
  styleUrls: ['./arriendo-panel.component.scss'],
  standalone: true,
  imports: [FormsModule, IonButton, IonIcon, IonInput, IonTextarea, IonText, IonAvatar],
})
export class ArriendoPanel {
  item = input.required<Items>();

  private auth = inject(AuthService);
  private prestamoService = inject(PrestamoService);

  esDueno = computed(() => this.auth.esDueno(this.item().duenoId));
  activo = computed(() => this.prestamoService.activoDeItem(this.item().id));
  esMiArriendo = computed(() => this.activo()?.solicitanteId === this.auth.usuario()?.id);
  miPendiente = computed(() => this.prestamoService.miSolicitudPendiente(this.item().id));
  pendientes = computed(() => this.prestamoService.pendientesDeItem(this.item().id));

  // Formulario de solicitud
  formAbierto = signal(false);
  desde = signal(diaISO());
  hasta = signal(diaISO(1));
  mensaje = signal('');
  readonly hoy = diaISO();

  resultado = signal<Resultado | null>(null);
  ocupado = signal(false);

  constructor() {
    addIcons({ calendarOutline, checkmarkOutline, closeOutline, returnDownBackOutline, timeOutline });
  }

  usuario(id: string) {
    return this.auth.obtenerUsuario(id);
  }

  dia(iso: string): string {
    return formatearDia(iso);
  }

  abrirFormulario() {
    this.desde.set(diaISO());
    this.hasta.set(diaISO(1));
    this.mensaje.set('');
    this.resultado.set(null);
    this.formAbierto.set(true);
  }

  async enviarSolicitud() {
    const r = await this.ejecutar(() =>
      this.prestamoService.solicitar(this.item().id, this.desde(), this.hasta(), this.mensaje()));
    if (r.exito) this.formAbierto.set(false);
  }

  cancelar(id: number) { this.ejecutar(() => this.prestamoService.cancelar(id)); }
  aceptar(id: number) { this.ejecutar(() => this.prestamoService.aceptar(id)); }
  rechazar(id: number) { this.ejecutar(() => this.prestamoService.rechazar(id)); }
  devuelto(id: number) { this.ejecutar(() => this.prestamoService.marcarDevuelto(id)); }

  // Deshabilita los botones mientras responde la base, para no enviar dos veces
  private async ejecutar(accion: () => Promise<Resultado>): Promise<Resultado> {
    this.ocupado.set(true);
    const r = await accion();
    this.ocupado.set(false);
    this.resultado.set(r);
    return r;
  }
}
