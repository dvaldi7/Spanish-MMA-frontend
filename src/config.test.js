import { describe, it, expect, vi, beforeEach } from 'vitest';

// getImageUrl se importa de forma dinámica para poder cambiar VITE_BACKEND_URL
// entre casos y re-evaluar el módulo (config.js lee la env en tiempo de carga).
async function loadConfig() {
  vi.resetModules();
  const mod = await import('./config');
  return mod;
}

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

  it('devuelve tal cual las URLs absolutas http/https y los blob:', async () => {
    const { getImageUrl } = await loadConfig();
    const cdn = 'https://res.cloudinary.com/x/image/upload/v1/a.jpg';
    expect(getImageUrl(cdn, '/images/avatar.jpg')).toBe(cdn);
    expect(getImageUrl('http://example.com/a.jpg', '/images/avatar.jpg')).toBe('http://example.com/a.jpg');
    expect(getImageUrl('blob:http://localhost/abc', '/images/avatar.jpg')).toBe('blob:http://localhost/abc');
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
});
