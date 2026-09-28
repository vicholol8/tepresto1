import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonSegment,
  IonSegmentButton, IonLabel, IonList, IonItem, IonThumbnail, IonChip, IonButton, IonBadge, IonIcon,
  IonText } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { swapHorizontalOutline } from 'ionicons/icons';
import { PrestamoService, Prestamo, EstadoPrestamo, Resultado } from '../services/prestamo.service';
import { ItemService } from '../services/items.service';
import { AuthService } from '../services/auth.service';
import { formatearDia } from '../utils/tiempo';

const ESTADOS: Record<EstadoPrestamo, { etiqueta: string; color: string }> = {
  pendiente: { etiqueta: 'Pendiente', color: 'warning' },
  aceptado: { etiqueta: 'En curso', color: 'success' },
  rechazado: { etiqueta: 'Rechazado', color: 'danger' },
  cancelado: { etiqueta: 'Cancelado', color: 'medium' },
  devuelto: { etiqueta: 'Devuelto', color: 'primary' },
};

@Component({
  selector: 'app-prestamos',
  templateUrl: './prestamos.page.html',
  styleUrls: ['./prestamos.page.scss'],
  standalone: true,
  imports: [RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonSegment,
    IonSegmentButton, IonLabel, IonList, IonItem, IonThumbnail, IonChip, IonButton, IonBadge, IonIcon, IonText]
})
export class PrestamosPage {
  private prestamoService = inject(PrestamoService);
  private itemService = inject(ItemService);
  private auth = inject(AuthService);

  readonly estados = ESTADOS;

  vista = signal<'pedidos' | 'prestados'>('pedidos');
  lista = computed(() => this.vista() === 'pedidos' ? this.prestamoService.pedidos() : this.prestamoService.prestados());
  porResponder = this.prestamoService.solicitudesPorResponder;

  resultado = signal<Resultado | null>(null);

  constructor() {
    addIcons({ swapHorizontalOutline });
  }

  item(p: Prestamo) {
    return this.itemService.obtener(String(p.itemId));
  }

  // La otra persona: el dueño si yo pedí, el solicitante si yo presté
  otro(p: Prestamo) {
    return this.auth.obtenerUsuario(this.vista() === 'pedidos' ? p.duenoId : p.solicitanteId);
  }

  dia(iso: string): string {
    return formatearDia(iso);
  }

  cambiarVista(v: 'pedidos' | 'prestados') {
    this.vista.set(v);
    this.resultado.set(null);
  }

  ocupado = signal(false);

  cancelar(id: number) { this.ejecutar(() => this.prestamoService.cancelar(id)); }
  aceptar(id: number) { this.ejecutar(() => this.prestamoService.aceptar(id)); }
  rechazar(id: number) { this.ejecutar(() => this.prestamoService.rechazar(id)); }
  devuelto(id: number) { this.ejecutar(() => this.prestamoService.marcarDevuelto(id)); }

  // Deshabilita los botones mientras responde la base, para no enviar dos veces
  private async ejecutar(accion: () => Promise<Resultado>) {
    this.ocupado.set(true);
    this.resultado.set(await accion());
    this.ocupado.set(false);
  }
}
