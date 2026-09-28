// Texto relativo para fechas del muro: "ahora", "hace 5 min", "hace 2 h", "hace 3 d"
export function haceCuanto(fecha: number): string {
  const minutos = Math.floor((Date.now() - fecha) / 60_000);
  if (minutos < 1) return 'ahora';
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;
  return `hace ${Math.floor(horas / 24)} d`;
}

// Fechas de préstamos como 'YYYY-MM-DD' en hora local. No se usa DatePipe con estos strings
// porque los interpreta como UTC y en Chile mostraría el día anterior.
export function diaISO(desplazamientoDias = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + desplazamientoDias);
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

// '2026-10-05' -> '05/10'
export function formatearDia(iso: string): string {
  const [, mes, dia] = iso.split('-');
  return `${dia}/${mes}`;
}
