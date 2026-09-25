import { describe, it, expect } from 'vitest';
import { buildPageWindow } from './pagination';

describe('buildPageWindow', () => {
    it('devuelve una sola página cuando hay una página', () => {
        expect(buildPageWindow(1, 1)).toEqual([1]);
    });

    it('devuelve [] para entradas inválidas', () => {
        expect(buildPageWindow(NaN, 5)).toEqual([]);
        expect(buildPageWindow(1, 0)).toEqual([]);
        expect(buildPageWindow(1, -2)).toEqual([]);
    });

    it('muestra todas las páginas cuando caben en la ventana', () => {
        expect(buildPageWindow(1, 5)).toEqual([1, 2, 3, '…', 5]);
        expect(buildPageWindow(3, 5)).toEqual([1, 2, 3, 4, 5]);
        expect(buildPageWindow(5, 5)).toEqual([1, '…', 3, 4, 5]);
    });

    it('acota la ventana y usa elipsis cuando hay muchas páginas', () => {
        expect(buildPageWindow(1, 20)).toEqual([1, 2, 3, '…', 20]);
        expect(buildPageWindow(2, 20)).toEqual([1, 2, 3, 4, '…', 20]);
        expect(buildPageWindow(10, 20)).toEqual([1, '…', 8, 9, 10, 11, 12, '…', 20]);
        expect(buildPageWindow(20, 20)).toEqual([1, '…', 18, 19, 20]);
    });

    it('normaliza la página actual fuera de rango', () => {
        expect(buildPageWindow(99, 20)).toEqual([1, '…', 18, 19, 20]);
        expect(buildPageWindow(-5, 20)).toEqual([1, 2, 3, '…', 20]);
    });
});
