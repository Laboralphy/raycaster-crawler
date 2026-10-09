O2.createObject('UI.Screen', class Screen extends H5UI.WinControl {
    renderSelf() {
        this._oContext.clearRect(0, 0, this._nWidth, this._nHeight);
        if (this.fAlpha > 0) {
            this._oContext.fillStyle = 'rgba(0, 0, 0, ' + this.fAlpha.toString() + ')';
            this._oContext.fillRect(0, 0, this._nWidth, this._nHeight)
        }
    }
});
Object.assign(UI.Screen.prototype, {
    _sClass: 'UI.Screen',
    fAlpha: 0.333
});
