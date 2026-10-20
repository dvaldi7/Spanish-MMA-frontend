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

// Resuelve una URL de imagen devuelta por la API.
// - null/undefined/vacío -> fallback (asset local del frontend).
// - http(s)/blob -> se devuelve tal cual (Cloudinary o previews locales).
// - relativa (p.ej. 'images/companies/x.jpg') -> ruta absoluta:
//     * con BACKEND_URL definido: 'https://host/images/companies/x.jpg'
//     * en preview (same-origin): '/backend-images/images/companies/x.jpg',
//       que Vite reescribe al '/images' del backend (:3101) sin chocar con los
//       assets estáticos del frontend que viven bajo '/images'.
export function getImageUrl(url, fallback) {
  if (!url) return fallback;
  if (/^(https?:|blob:)/i.test(url)) return url;
  const path = url.startsWith('/') ? url : `/${url}`;
  return BACKEND_URL ? `${BACKEND_URL}${path}` : `/backend-images${path}`;
}

export default BACKEND_URL;
