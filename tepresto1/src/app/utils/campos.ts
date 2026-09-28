import { IonInput, IonTextarea } from '@ionic/angular';

// La app es zoneless: si se envía (Enter) justo después de escribir, Angular puede no haber
// registrado aún el texto en la vista, y al volver el modelo a '' no detecta cambio y el
// campo queda con el texto. Por eso, además de limpiar el modelo, se limpia el campo directo.
export function limpiar(campo: IonInput | IonTextarea | undefined) {
  if (campo) campo.value = '';
}
