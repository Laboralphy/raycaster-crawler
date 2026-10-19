export class Font {
    constructor(oControl) {
        this._sStyle = '';
        this._sFont = 'monospace';
        this._nFontSize = 10;
        this._sColor = 'rgb(255, 255, 255)';
        this._oControl = null;
        this._sOutlineColor = 'rgb(0, 0, 0)';
        this._bOutline = false;
        if (oControl === undefined) {
            throw new Error('h5ui.font: no specified control')
        }
        this.setControl(oControl)
    }

    setControl(oControl) {
        this._oControl = oControl;
        this.invalidate()
    }

    invalidate() {
        if (this._oControl) {
            this.update();
            this._oControl.invalidate()
        }
    }

    setFont(sFont) {
        if (this._sFont != sFont) {
            this._sFont = sFont;
            this.invalidate()
        }
    }

    setStyle(sStyle) {
        if (this._sStyle != sStyle) {
            this._sStyle = sStyle;
            this.invalidate()
        }
    }

    setSize(nSize) {
        if (this._nFontSize != nSize) {
            this._nFontSize = nSize;
            this.invalidate()
        }
    }

    setColor(sColor, sOutline) {
        let bInvalid = false;
        if (this._sColor != sColor) {
            this._sColor = sColor;
            bInvalid = true
        }
        if (this._sOutlineColor != sOutline) {
            this._sOutlineColor = sOutline;
            bInvalid = true
        }
        this._bOutline = this._sOutlineColor !== undefined;
        if (bInvalid) {
            this.invalidate()
        }
    }

    getFontString() {
        return (this._sStyle ? this._sStyle + ' ' : '') + this._nFontSize.toString() + 'px ' + this._sFont
    }

    update() {
        const oContext = this._oControl.getSurface();
        oContext.font = this.getFontString();
        oContext.fillStyle = this._sColor;
        if (this._bOutline) {
            oContext.strokeStyle = this._sOutlineColor
        }
    }
}
