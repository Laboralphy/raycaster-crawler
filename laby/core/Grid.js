const { RangeException } = require('./errors');

/**
 * Classe de gestion d'une grille.
 */
class Grid {
    constructor() {
        this._aGrid = [];
        this._nWidth = 0;
        this._nHeight = 0;
    }

    /** Copie le contenu d'une autre grille (copie profonde) */
    assign(g) {
        this._nWidth = g._nWidth;
        this._nHeight = g._nHeight;
        this._aGrid = g._aGrid.map((row) => row.slice());
    }

    /**
     * Défini la taille de la grille (toutes les cellules à 0)
     * @param {number} x largeur
     * @param {number} y hauteur
     */
    setSize(x, y) {
        this._nHeight = y;
        this._nWidth = x;
        this._aGrid = [];
        for (let iy = 0; iy < y; iy++) {
            this._aGrid.push(new Array(x).fill(0));
        }
    }

    getWidth() {
        return this._nWidth;
    }

    getHeight() {
        return this._nHeight;
    }

    /** @throws {RangeException} hors limite */
    setCell(x, y, n) {
        if (x < 0 || x >= this._nWidth) {
            throw new RangeException(`out of range x: ${x} ; range is 0-${this._nWidth - 1}`);
        }
        if (y < 0 || y >= this._nHeight) {
            throw new RangeException(`out of range y: ${y} ; range is 0-${this._nHeight - 1}`);
        }
        this._aGrid[y][x] = n;
    }

    /** @throws {RangeException} hors limite */
    getCell(x, y) {
        if (x < 0 || y < 0 || x >= this._nWidth || y >= this._nHeight) {
            throw new RangeException(`out of range: ${x}, ${y} : range is [0, 0, ${this._nWidth}, ${this._nHeight}]`);
        }
        return this._aGrid[y][x];
    }
}

module.exports = Grid;
