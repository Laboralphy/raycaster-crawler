import { WinControl } from './WinControl.js';

export class Box extends WinControl {
    constructor() {
        super();
        this._sClass = 'Box';
        this._sColor = '#FFFFFF';
        this._sColorOutside = '#FF6666';
        this._sColorInside = '#FFBBBB';
        this._sColorBorder = '#000000';
        this._sColorBorderOutside = '#000000';
        this._sColorBorderInside = '#000000';
        this._nBorderWidth = 8;
        this._xGradStart = 0;
        this._yGradStart = 0;
        this._xGradEnd = 0;
        this._yGradEnd = 0;
        this._nGradOrientation = 0
    }

    setColor(sNormal, sHighlight) {
        if (sHighlight === undefined) {
            sHighlight = sNormal
        }
        this._sColorInside = sHighlight;
        this._set('_sColor', this._sColorOutside = sNormal)
    }

    setBorder(n, sOut, sIn) {
        if (sOut === undefined) {
            sOut = '#000000'
        }
        if (sIn === undefined) {
            sIn = sOut
        }
        if (n) {
            this._set('_sColorBorderOutside', sOut);
            this._set('_sColorBorderInside', sIn);
            this._set('_sColorBorder', sOut)
        }
        this._set('_nBorderWidth', n)
    }

    onMouseIn(x, y, b) {
        this._set('_sColorBorder', this._sColorBorderInside);
        this._set('_sColor', this._sColorInside)
    }

    onMouseOut(x, y, b) {
        this._set('_sColorBorder', this._sColorBorderOutside);
        this._set('_sColor', this._sColorOutside)
    }

    computeGradientOrientation() {
        switch (this._nGradOrientation) {
            case 1:
                this._xGradStart = 0;
                this._yGradStart = 0;
                this._xGradEnd = 0;
                this._yGradEnd = this.getHeight() - 1;
                break;
            case 2:
                this._xGradStart = 0;
                this._yGradStart = 0;
                this._xGradEnd = this.getWidth() - 1;
                this._yGradEnd = 0;
                break;
            case 3:
                this._xGradStart = 0;
                this._yGradStart = 0;
                this._xGradEnd = this.getWidth() - 1;
                this._yGradEnd = this.getHeight() - 1;
                break;
            case 4:
                this._xGradStart = this.getWidth() - 1;
                this._yGradStart = 0;
                this._xGradEnd = 0;
                this._yGradEnd = this.getHeight() - 1;
                break
        }
    }

    getFillStyle() {
        const s = this.getSurface();
        const aGrad = this._sColor.split(' ');
        let xFillStyle;
        if (aGrad.length === 1) {
            xFillStyle = this._sColor
        } else {
            switch (aGrad[0]) {
                case 'hgrad':
                    this._nGradOrientation = 2;
                    break;
                case 'vgrad':
                    this._nGradOrientation = 1;
                    break;
                case 'd1grad':
                    this._nGradOrientation = 3;
                    break;
                case 'd2grad':
                    this._nGradOrientation = 4;
                    break;
                default:
                    this._nGradOrientation = 0;
                    break
            }
            if (this._nGradOrientation) {
                aGrad.shift()
            }
            this.computeGradientOrientation();
            const oGrad = s.createLinearGradient(this._xGradStart, this._yGradStart, this._xGradEnd, this._yGradEnd);
            for (let iGrad = 0; iGrad < aGrad.length; iGrad++) {
                oGrad.addColorStop(iGrad / (aGrad.length - 1), aGrad[iGrad])
            }
            xFillStyle = oGrad
        }
        return xFillStyle
    }

    renderSelf() {
        this._oContext.fillStyle = this.getFillStyle();
        this._oContext.fillRect(0, 0, this.getWidth(), this.getHeight());
        if (this._nBorderWidth) {
            this._oContext.strokeStyle = this._sColorBorder;
            this._oContext.lineWidth = this._nBorderWidth;
            this._oContext.strokeRect(0, 0, this.getWidth(), this.getHeight())
        }
    }
}
