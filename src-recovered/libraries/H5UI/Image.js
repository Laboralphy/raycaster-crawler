O2.createObject('H5UI.Image', class Image extends H5UI.WinControl {
    _loadEvent(oEvent) {
        var i = oEvent.target.__image;
        oEvent.target.__image = null;
        if (i.onLoad) {
            i.onLoad()
        } else {
            i.invalidate()
        }
    }

    setSource(sSrc) {
        if (!this._oTexture) {
            this._oTexture = new Image()
        }
        this._oTexture.src = sSrc;
        this._oTexture.__image = this;
        this._oTexture.addEventListener('load', this._loadEvent, true);
        this.invalidate()
    }

    setImage(oImage) {
        if (this._oTexture != oImage) {
            this._oTexture = oImage;
            this._oTexture.__image = this;
            this._oTexture.addEventListener('load', this._loadEvent, true);
            this.invalidate()
        }
    }

    renderSelf() {
        var s = this.getSurface();
        if (this._oTexture && this._oTexture.complete) {
            if (this._bAutosize) {
                this.setSize(this._oTexture.width, this._oTexture.height);
                s.drawImage(this._oTexture, 0, 0)
            } else {
                s.clearRect(0, 0, this.getWidth(), this.getHeight());
                s.drawImage(this._oTexture, 0, 0, this._oTexture.width, this._oTexture.height, 0, 0, this.getWidth(), this.getHeight())
            }
        }
    }
});
Object.assign(H5UI.Image.prototype, {
    _oTexture: null,
    _bAutosize: true,
    onLoad: null
});
