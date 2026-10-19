import { WinControl } from '../../libraries/H5UI/WinControl.js';

export class Screen extends WinControl {
    constructor() {
        super();
        this._sClass = 'UI.Screen';
        this.fAlpha = 0.333
    }

    renderSelf() {
        this._oContext.clearRect(0, 0, this._nWidth, this._nHeight);
        if (this.fAlpha > 0) {
            this._oContext.fillStyle = 'rgba(0, 0, 0, ' + this.fAlpha.toString() + ')';
            this._oContext.fillRect(0, 0, this._nWidth, this._nHeight)
        }
    }
}
