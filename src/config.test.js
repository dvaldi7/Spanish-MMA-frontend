import { describe, it, expect, vi, beforeEach } from 'vitest';

// getImageUrl/getCloudinarySrcSet se importan de forma dinámica para poder cambiar
// VITE_BACKEND_URL entre casos y re-evaluar el módulo (config.js lee la env en carga).
async function loadConfig() {
  vi.resetModules();
  const mod = await import('./config');
  return mod;
}

const CDN = 'https://res.cloudinary.com/dygmatgy1/image/upload/v1770144234/spanish-mma/fighters/foto.jpg';

describe('config.getImageUrl', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('devuelve el fallback para valores vacíos', async () => {
    const { getImageUrl } = await loadConfig();
    expect(getImageUrl(null, '/images/avatar.jpg')).toBe('/images/avatar.jpg');
    expect(getImageUrl('', '/images/avatar.jpg')).toBe('/images/avatar.jpg');
    expect(getImageUrl(undefined, '/images/avatar.jpg')).toBe('/images/avatar.jpg');
  });

  it('devuelve tal cual los blob: y las http/https ajenas a Cloudinary', async () => {
    const { getImageUrl } = await loadConfig();
    expect(getImageUrl('blob:http://localhost/abc', '/images/avatar.jpg')).toBe('blob:http://localhost/abc');
    expect(getImageUrl('http://example.com/a.jpg', '/images/avatar.jpg')).toBe('http://example.com/a.jpg');
  });

  it('resuelve rutas relativas contra el backend por defecto (dev local)', async () => {
    const { getImageUrl } = await loadConfig();
    expect(getImageUrl('images/companies/a.jpg', '/images/avatar.jpg'))
      .toBe('http://localhost:3001/images/companies/a.jpg');
    expect(getImageUrl('/images/events/a.jpg', '/images/avatar.jpg'))
      .toBe('http://localhost:3001/images/events/a.jpg');
  });

  it('en preview (VITE_BACKEND_URL="") usa la ruta proxied /backend-images', async () => {
    vi.stubEnv('VITE_BACKEND_URL', '');
    const { getImageUrl } = await loadConfig();
    expect(getImageUrl('images/companies/a.jpg', '/images/avatar.jpg'))
      .toBe('/backend-images/images/companies/a.jpg');
  });

  it('en producción (VITE_BACKEND_URL absoluto) conserva la base absoluta', async () => {
    vi.stubEnv('VITE_BACKEND_URL', 'https://spanish-mma.duckdns.org/');
    const { getImageUrl } = await loadConfig();
    expect(getImageUrl('images/companies/a.jpg', '/images/avatar.jpg'))
      .toBe('https://spanish-mma.duckdns.org/images/companies/a.jpg');
  });

  it('URLs de Cloudinary reciben f_auto,q_auto sin tocar el resto (legacy/externas intactas)', async () => {
    const { getImageUrl } = await loadConfig();
    expect(getImageUrl(CDN, '/images/avatar.jpg'))
      .toBe('https://res.cloudinary.com/dygmatgy1/image/upload/f_auto,q_auto/v1770144234/spanish-mma/fighters/foto.jpg');
  });

  it('con width añade w_ y c_limit: nunca agranda originales más pequeños', async () => {
    const { getImageUrl } = await loadConfig();
    expect(getImageUrl(CDN, '/images/avatar.jpg', { width: 320 }))
      .toBe('https://res.cloudinary.com/dygmatgy1/image/upload/f_auto,q_auto,w_320,c_limit/v1770144234/spanish-mma/fighters/foto.jpg');
  });

  it('quality best usa q_auto:best (LCP/fichas) y por defecto q_auto (tarjetas)', async () => {
    const { getImageUrl } = await loadConfig();
    expect(getImageUrl(CDN, '/images/avatar.jpg', { quality: 'best' }))
      .toBe('https://res.cloudinary.com/dygmatgy1/image/upload/f_auto,q_auto:best/v1770144234/spanish-mma/fighters/foto.jpg');
    expect(getImageUrl(CDN, '/images/avatar.jpg', { width: 384, quality: 'best' }))
      .toBe('https://res.cloudinary.com/dygmatgy1/image/upload/f_auto,q_auto:best,w_384,c_limit/v1770144234/spanish-mma/fighters/foto.jpg');
  });

  it('con width+height recorta con c_fill y gravedad facial SOLO si el original es mayor (sin upscale)', async () => {
    const { getImageUrl } = await loadConfig();
    expect(getImageUrl(CDN, '/images/avatar.jpg', { width: 640, height: 384, gravity: 'auto:face' }))
      .toBe('https://res.cloudinary.com/dygmatgy1/image/upload/f_auto,q_auto,if_w_gt_640_and_h_gt_384,w_640,h_384,c_fill,g_auto:face/if_else,c_limit,w_640/v1770144234/spanish-mma/fighters/foto.jpg');
  });

  it('el recorte con gravedad solo se aplica a Cloudinary; legacy/externas quedan intactas', async () => {
    vi.stubEnv('VITE_BACKEND_URL', '');
    const { getImageUrl } = await loadConfig();
    expect(getImageUrl('images/news/vertical.png.png', '/x.webp', { width: 640, height: 384, gravity: 'auto:face' }))
      .toBe('/backend-images/images/news/vertical.png.png');
    expect(getImageUrl('http://example.com/a.jpg', '/x.webp', { width: 640, height: 384, gravity: 'auto:face' }))
      .toBe('http://example.com/a.jpg');
  });

  it('las rutas legacy no reciben transformaciones (se sirven tal cual)', async () => {
    vi.stubEnv('VITE_BACKEND_URL', '');
    const { getImageUrl } = await loadConfig();
    expect(getImageUrl('images/companies/afl.jpg.jpg', '/images/avatar.jpg'))
      .toBe('/backend-images/images/companies/afl.jpg.jpg');
  });
});

describe('config.getCloudinarySrcSet', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('construye el srcSet con los anchos solicitados', async () => {
    const { getCloudinarySrcSet } = await loadConfig();
    expect(getCloudinarySrcSet(CDN, [200, 400])).toBe(
      'https://res.cloudinary.com/dygmatgy1/image/upload/f_auto,q_auto,w_200,c_limit/v1770144234/spanish-mma/fighters/foto.jpg 200w, ' +
      'https://res.cloudinary.com/dygmatgy1/image/upload/f_auto,q_auto,w_400,c_limit/v1770144234/spanish-mma/fighters/foto.jpg 400w'
    );
  });

  it('devuelve vacío para URLs no-Cloudinary o sin anchos (no rompe el src único)', async () => {
    const { getCloudinarySrcSet } = await loadConfig();
    expect(getCloudinarySrcSet('images/legacy/x.jpg', [200])).toBe('');
    expect(getCloudinarySrcSet(CDN, [])).toBe('');
    expect(getCloudinarySrcSet(null, [200])).toBe('');
  });
});
