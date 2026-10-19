import { Font } from './Font.js';
import { WinControl } from './WinControl.js';
import { CanvasFactory } from '../O876/CanvasFactory.js';

export class Text extends WinControl {
    constructor() {
        super();
        this._sClass = 'Text';
        this._sCaption = '';
        this._bAutosize = true;
        this._bWordWrap = false;
        this._nTextWidth = 0;
        this._nLineHeight = 0;
        this._yLastWritten = 0;
        CanvasFactory.setImageSmoothing(this.getSurface(), true);
        this.font = new Font(this)
    }

    setCaption(s) {
        this._set('_sCaption', s);
        if (this._bAutosize && this._bInvalid) {
            this.font.update();
            const oMetrics = this.getSurface().measureText(this._sCaption);
            this.setSize(oMetrics.width, this.font._nFontSize + 1)
        }
    }

    setAutosize(b) {
        this._set('_bAutosize', b)
    }

    setWordWrap(b) {
        this._set('_bWordWrap', b)
    }

    renderSelf() {
        const oSurface = this.getSurface();
        let oMetrics;
        oSurface.clearRect(0, 0, this.getWidth(), this.getHeight());
        if (this._bWordWrap) {
            this.font.update();
            let aWords;
            let sLine = '',
                sWord, x = 0,
                y = 0;
            let sSpace;
            oSurface.textBaseline = 'top';
            const aParas = this._sCaption.split('\n');
            for (let iPara = 0; iPara < aParas.length; iPara++) {
                aWords = aParas[iPara].split(' ');
                while (aWords.length) {
                    sWord = aWords.shift();
                    sSpace = sLine ? ' ' : '';
                    oMetrics = oSurface.measureText(sLine + sSpace + sWord);
                    if (oMetrics.width >= this.getWidth()) {
                        x = 0;
                        if (this.font._bOutline) {
                            oSurface.strokeText(sLine, x, y)
                        }
                        oSurface.fillText(sLine, x, y);
                        y += this.font._nFontSize + this._nLineHeight;
                        sLine = sWord
                    } else {
                        sLine += sSpace + sWord;
                        x += oMetrics.width
                    }
                }
                x = 0;
                if (this.font._bOutline) {
                    oSurface.strokeText(sLine, x, y)
                }
                oSurface.fillText(sLine, x, y);
                y += this.font._nFontSize + this._nLineHeight;
                sLine = '';
                this._yLastWritten = y
            }
        } else {
            if (this._bAutosize) {
                this.font.update();
                oMetrics = oSurface.measureText(this._sCaption);
                this.setSize(oMetrics.width, this.font._nFontSize + 1)
            } else {}
            oSurface.textBaseline = 'middle';
            if (this.font._bOutline) {
                oSurface.strokeText(this._sCaption, 0, this.getHeight() >> 1)
            }
            oSurface.fillText(this._sCaption, 0, this.getHeight() >> 1)
        }
    }
}
