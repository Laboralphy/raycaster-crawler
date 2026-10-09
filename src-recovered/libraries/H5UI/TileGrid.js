import { WinControl } from './WinControl.js';

export class TileGrid extends WinControl {
    setGridSize(w, h, nPadding) {
        this._nCellPadding = nPadding | 0;
        this._aCells = [];
        let x, y, aRow;
        for (y = 0; y < h; y++) {
            aRow = [];
            for (x = 0; x < w; x++) {
                aRow.push(-1)
            }
            this._aCells.push(aRow)
        }
        this._aInvalidCells = {};
        const wTotal = (this._nCellWidth + this._nCellPadding) * w;
        const hTotal = (this._nCellHeight + this._nCellPadding) * h;
        this.setSize(wTotal, hTotal)
    }

    getCellKey(x, y) {
        return x.toString() + ':' + y.toString()
    }

    setCell(x, y, n) {
        if (this._aCells[y][x] !== n) {
            this._aCells[y][x] = n;
            const sKey = this.getCellKey(x, y);
            if (!(sKey in this._aInvalidCells)) {
                this._aInvalidCells[sKey] = [x, y];
                this.invalidate()
            }
        }
    }

    renderCell(x, y, n) {
        this.getSurface().drawImage(this._oTexture, n * this._nCellWidth, 0, this._nCellWidth, this._nCellHeight, x * (this._nCellWidth + this._nCellPadding), y * (this._nCellHeight + this._nCellPadding), this._nCellWidth, this._nCellHeight)
    }

    renderSelf() {
        const h = this._aCells.length;
        if (h === 0) {
            return
        }
        const w = this._aCells[0].length;
        if (w === 0) {
            return
        }
        if (this._nCellWidth * this._nCellHeight === 0) {
            return
        }
        if (this._oTexture === null) {
            return
        }
        let oCell, n, x, y;
        const s = this.getSurface();
        let b = false;
        for (const sKeyCell in this._aInvalidCells) {
            b = true;
            oCell = this._aInvalidCells[sKeyCell];
            x = oCell[0];
            y = oCell[1];
            n = this._aCells[y][x];
            if (this._bTransparent) {
                s.clearRect(x * (this._nCellWidth + this._nCellPadding), y * (this._nCellHeight + this._nCellPadding), this._nCellWidth + this._nCellPadding, this._nCellHeight + this._nCellPadding)
            }
            this.renderCell(x, y, n)
        }
        if (b) {
            this._aInvalidCells = {}
        }
    }
}
Object.assign(TileGrid.prototype, {
    _oTexture: null,
    _nCellWidth: 8,
    _nCellHeight: 8,
    _nCellPadding: 0,
    _aCells: null,
    _aInvalidCells: null,
    _bTransparent: true
});
