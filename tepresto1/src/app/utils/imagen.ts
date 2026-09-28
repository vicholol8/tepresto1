// Las fotos del celular pesan varios MB: se achican a lo más LADO_MAX px y se pasan a JPEG antes de subir.
// Los GIF se dejan tal cual (el canvas perdería la animación).
const LADO_MAX = 1280;

export async function reducirImagen(archivo: File): Promise<Blob> {
  if (archivo.type === 'image/gif') return archivo;
  const bitmap = await createImageBitmap(archivo);
  const escala = Math.min(1, LADO_MAX / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob(b => b ? resolve(b) : reject(new Error('No se pudo procesar la imagen.')), 'image/jpeg', 0.85));
}
