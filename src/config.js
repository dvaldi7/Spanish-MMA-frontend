// Fuente única de verdad para la resolución de URLs de API e imágenes.
//
// VITE_BACKEND_URL:
//   - vacío (''): modo preview vía proxy de Vite (same-origin). preview.sh lo exporta así.
//   - 'https://spanish-mma.duckdns.org': producción (Vercel/nginx).
//   - indefinido: desarrollo local directo contra el backend en :3001.
//
// Se usa '??' (no '||') para que la cadena vacía NO caiga al fallback: en preview las
// peticiones e imágenes deben resolverse same-origin y pasar por el proxy de Vite.
const RAW_BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3001';

export const BACKEND_URL = RAW_BACKEND_URL.replace(/\/+$/, '');

// Base para axios/fetch: en same-origin devuelve '/api' (proxiada por Vite al backend).
export const apiBaseUrl = `${BACKEND_URL}/api`;

const CLOUDINARY_UPLOAD = '/image/upload/';
const CLOUDINARY_URL = /^https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//;

// Inyecta transformaciones de entrega en URLs de Cloudinary sin alterar el original:
// f_auto (formato negociado WebP/AVIF), q_auto (compresión adaptativa) y, opcionalmente,
// w_<px> con c_limit (redimensiona SOLO si el original es mayor: nunca hace upscale).
const injectCloudinaryTransform = (url, width) => {
  if (!CLOUDINARY_URL.test(url)) return url;
  const parts = ['f_auto', 'q_auto'];
  if (width) parts.push(`w_${width}`, 'c_limit');
  const transform = parts.join(',');
  return url.replace(CLOUDINARY_UPLOAD, `${CLOUDINARY_UPLOAD}${transform}/`);
};

// Resuelve una URL de imagen devuelta por la API.
// - null/undefined/vacío -> fallback (asset local del frontend).
// - blob -> tal cual (previews locales).
// - Cloudinary -> URL original con f_auto,q_auto (+ w_,c_limit si se pide ancho).
// - relativa (p.ej. 'images/companies/x.jpg' legacy) -> ruta absoluta:
//     * con BACKEND_URL definido: 'https://host/images/companies/x.jpg'
//     * en preview (same-origin): '/backend-images/images/companies/x.jpg',
//       que Vite reescribe al '/images' del backend (:3101) sin chocar con los
//       assets estáticos del frontend que viven bajo '/images'.
export function getImageUrl(url, fallback, options = {}) {
  if (!url) return fallback;
  if (/^(blob:|https?:\/\/)/i.test(url) && !CLOUDINARY_URL.test(url)) return url;
  const { width } = options;

  if (CLOUDINARY_URL.test(url)) {
    return injectCloudinaryTransform(url, width);
  }

  const path = url.startsWith('/') ? url : `/${url}`;
  return BACKEND_URL ? `${BACKEND_URL}${path}` : `/backend-images${path}`;
}

// Genera atributo srcSet a partir de una URL de Cloudinary y una lista de anchos.
// Devuelve cadena vacía si la URL no procede de Cloudinary (legacy/externas no se
// pueden transformar, así que el src único se queda tal cual).
export function getCloudinarySrcSet(url, widths = []) {
  if (!url || !CLOUDINARY_URL.test(url) || widths.length === 0) return '';
  return widths.map((w) => `${injectCloudinaryTransform(url, w)} ${w}w`).join(', ');
}

export default BACKEND_URL;
