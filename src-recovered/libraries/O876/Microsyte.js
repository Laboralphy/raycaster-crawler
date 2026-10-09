O2.createObject('O876.Microsyte', class Microsyte {
    constructor(...aArgs) {
        this.__construct(...aArgs);
    }

    __construct(sId) {
        if (sId) {
            this.setHome(sId)
        }
    }

    setHome(xId) {
        if (typeof xId === 'string') {
            this.setHome(document.getElementById(this._sBlockId = xId))
        } else {
            this._oHome = xId
        }
    }

    getHome() {
        if (!this._oHome) {
            throw new Error('home not defined')
        }
        return this._oHome
    }

    setSize(w, h) {
        var oHome = this.getHome();
        this._nWidth = w;
        this._nHeight = h;
        oHome.style.width = w.toString() + 'px';
        oHome.style.height = h.toString() + 'px'
    }

    getPxValue(s) {
        var r = s.match(/^([0-9]+)px$/i);
        if (r) {
            return r[1] | 0
        } else {
            return 0
        }
    }

    center() {
        var oHome = this.getHome();
        var p = this.getPxValue(window.getComputedStyle(oHome).padding);
        var w = -((this._nWidth + p) >> 1);
        var h = -((this._nHeight + p) >> 1);
        oHome.style.left = '50%';
        oHome.style.top = '50%';
        oHome.style.marginTop = h.toString() + 'px';
        oHome.style.marginLeft = w.toString() + 'px'
    }

    getSubItem(sSubItem) {
        var oTarget = this.getHome();
        if (sSubItem !== undefined && sSubItem !== null && sSubItem !== '') {
            oTarget = document.getElementById(sSubItem)
        }
        if (!oTarget) {
            throw new Error('target item not defined')
        }
        return oTarget
    }

    setHtml(sHtml, sSubItem) {
        this.getSubItem(sSubItem).innerHTML = sHtml
    }

    load(sUrl, sSubItem) {
        XHR.get(sUrl, (function(data) {
            this.setHtml(data, sSubItem)
        }).bind(this))
    }

    hide() {
        this.getHome().style.display = 'none'
    }

    show() {
        this.getHome().style.display = 'block'
    }

    clear(sSubItem) {
        this.getSubItem(sSubItem).innerHTML = ''
    }

    setLinkOrientation(x, y) {
        if (x === 'left' || x === 'right') {
            this._xOrientation = x
        }
        if (y === 'top' || y === 'bottom') {
            this._xOrientation = y
        }
    }

    linkDiv(sHtml, x, y, w, h, sSubItem) {
        var oDiv = this.getSubItem(sSubItem).appendChild(document.createElement('div'));
        oDiv.style.position = 'absolute';
        oDiv.style[this._xOrientation] = x.toString() + 'px';
        oDiv.style[this._yOrientation] = y.toString() + 'px';
        if (w !== undefined && w !== null) {
            oDiv.style.width = w.toString() + 'px'
        }
        if (h !== undefined && h !== null) {
            oDiv.style.height = h.toString() + 'px'
        }
        oDiv.innerHTML = sHtml;
        return oDiv
    }
});
Object.assign(O876.Microsyte.prototype, {
    _sBlockId: '',
    _oHome: null,
    _oXHR: null,
    _nWidth: 0,
    _nHeight: 0,
    _xOrientation: 'left',
    _yOrientation: 'top'
});
