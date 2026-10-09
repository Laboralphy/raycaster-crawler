import { UI } from './UI.js';
import { Text } from '../../libraries/H5UI/Text.js';
import { WinControl } from '../../libraries/H5UI/WinControl.js';

export class Icon extends WinControl {
    setImage(oImage) {
        this.oImage = oImage;
        this.invalidate()
    }

    selected(b) {
        this._set('_bSelected', b)
    }

    drawImage() {
        this._oContext.drawImage(this.oImage, this.xStart, this.yStart, this._nWidth, this._nHeight, 0, 0, this._nWidth * this.fZoom | 0, this._nHeight * this.fZoom | 0)
    }

    setStackCounter(n) {
        const bStackable = n >= 1;
        const bHasCounter = this.getControlCount() > 0;
        const nMask = (bStackable ? 2 : 0) | (bHasCounter ? 1 : 0);
        let oBoxStackCounter;
        switch (nMask) {
            case 0:
                break;
            case 1:
                this.clear();
                break;
            case 2:
                oBoxStackCounter = this.linkControl(new Text());
                oBoxStackCounter.font.setFont('monospace');
                oBoxStackCounter.font.setSize(16);
                oBoxStackCounter.font.setStyle('bold');
                oBoxStackCounter.font.setColor('rgb(255, 255, 255)', 'rgb(0, 0, 0)');
                oBoxStackCounter.moveTo(4, 30);
            case 3:
                oBoxStackCounter = this.getControl(0);
                oBoxStackCounter.setCaption(n);
                oBoxStackCounter.render();
                break
        }
    }

    renderSelf() {
        const c = this._oContext;
        const w = this.getWidth();
        const h = this.getHeight();
        c.clearRect(0, 0, this.getWidth(), this.getHeight());
        this.drawImage();
        if (this._bSelected) {
            const sGCO = c.globalCompositeOperation;
            const fGA = c.globalAlpha;
            c.globalCompositeOperation = 'lighter';
            c.globalAlpha = 0.5;
            this.drawImage();
            c.globalCompositeOperation = sGCO;
            c.globalAlpha = fGA;
            c.strokeStyle = UI.clSELECT_BORDER;
            c.lineWidth = 4;
            c.strokeRect(0, 0, w, h)
        }
        if (this._bRedCross) {
            const w4 = w >> 3;
            const h4 = h >> 3;
            const w3 = w - w4;
            const h3 = h - h4;
            c.strokeStyle = '#FF0000', c.lineWidth = 4;
            c.beginPath();
            c.moveTo(w4, h4);
            c.lineTo(w3, h3);
            c.stroke();
            c.beginPath();
            c.moveTo(w3, h4);
            c.lineTo(w4, h3);
            c.stroke()
        }
    }
}
Object.assign(Icon.prototype, {
    _sClass: 'UI.Icon',
    oImage: null,
    xStart: 0,
    yStart: 0,
    fZoom: 1,
    _bSelected: false,
    _bRedCross: false
});
