// Canvas 2D factice : enregistre les appels de dessin, assez pour faire
// tourner les effets graphiques (GX*) hors navigateur.
import { vi } from 'vitest';

export function fakeContext(oCanvas) {
    return {
        canvas: oCanvas,
        globalAlpha: 1,
        globalCompositeOperation: 'source-over',
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
        font: '',
        textAlign: 'start',
        fillRect: vi.fn(),
        strokeRect: vi.fn(),
        clearRect: vi.fn(),
        drawImage: vi.fn(),
        fillText: vi.fn(),
        beginPath: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        putImageData: vi.fn(),
        measureText: vi.fn(s => ({ width: s.length * 7 })),
        createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
        getImageData: vi.fn((x, y, w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }))
    };
}

export function fakeCanvas(width = 320, height = 200) {
    const oCanvas = { width, height };
    const oContext = fakeContext(oCanvas);
    oCanvas.getContext = () => oContext;
    return oCanvas;
}

// document.createElement('canvas'), utilisé par CanvasFactory
export function stubDocument() {
    vi.stubGlobal('document', { createElement: () => fakeCanvas(0, 0) });
}

// raycaster minimal pour les effets plein écran
export function fakeRaycaster(oExtra = {}) {
    return { oCanvas: fakeCanvas(), TIME_FACTOR: 50, ...oExtra };
}
