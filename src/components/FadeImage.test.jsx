import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import FadeImage from './FadeImage';

describe('FadeImage', () => {
  it('arranca oculta (img-fade sin img-fade-loaded) y se hace visible al cargar', () => {
    const { container } = render(<FadeImage src="https://res.cloudinary.com/x/a.jpg" alt="test" />);
    const img = container.querySelector('img');

    expect(img.className).toContain('img-fade');
    expect(img.className).not.toContain('img-fade-loaded');

    fireEvent.load(img);
    expect(img.className).toContain('img-fade-loaded');
  });

  it('nunca queda invisible: una imagen rota también se marca como lista', () => {
    const { container } = render(<FadeImage src="https://res.cloudinary.com/x/rota.jpg" alt="rota" />);
    const img = container.querySelector('img');

    fireEvent.error(img);
    expect(img.className).toContain('img-fade-loaded');
  });
});
