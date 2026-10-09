O2.createObject('UI.System', class System {
    constructor(...aArgs) {
        this.__construct(...aArgs);
    }

    __construct() {
        this.oScreen = new UI.Screen();
        this.oPlugins = UI.oPlugins
    }

    clear() {
        while (this.oScreen.getControlCount()) {
            this.oScreen.unlinkControl(0)
        }
        this.oWidget = null
    }

    centerWidget(w) {
        w.moveTo((this.oScreen._nWidth - w._nWidth) >> 1, (this.oScreen._nHeight - w._nHeight) >> 1)
    }

    cornerWidget(w, nCorner, nMargin) {
        var xLeft = nMargin;
        var yTop = nMargin;
        var xCenter = (this.oScreen._nWidth - w._nWidth) >> 1;
        var yCenter = (this.oScreen._nHeight - w._nHeight) >> 1;
        var xRight = this.oScreen._nWidth - w._nWidth - nMargin;
        var yBottom = this.oScreen._nHeight - w._nHeight - nMargin;
        switch (nCorner) {
            case 1:
                w.moveTo(xLeft, yBottom);
                break;
            case 2:
                w.moveTo(xCenter, yBottom);
                break;
            case 3:
                w.moveTo(xRight, yBottom);
                break;
            case 4:
                w.moveTo(xLeft, yCenter);
                break;
            case 5:
                w.moveTo(xCenter, yCenter);
                break;
            case 6:
                w.moveTo(xRight, yCenter);
                break;
            case 7:
                w.moveTo(xLeft, yTop);
                break;
            case 8:
                w.moveTo(xCenter, yTop);
                break;
            case 9:
                w.moveTo(xRight, yTop);
                break
        }
    }

    declareWidget(w) {
        if (this.oWidget) {
            this.clear()
        }
        this.oWidget = w;
        this.oScreen.linkControl(w);
        this.oScreen.show();
        return w
    }

    getWidget() {
        return this.oWidget
    }

    setRenderCanvas(oCanvas) {
        this.oRenderCanvas = oCanvas;
        this.oRenderContext = oCanvas.getContext('2d');
        if (!('__ratio' in this.oRenderCanvas)) {
            this.oRenderCanvas.__ratio = 1
        }
        this.oScreen.setSize(oCanvas.width, oCanvas.height);
        this.oScreen.hide()
    }

    eventScreenClick(e) {
        var oThis = this.__this;
        var x = e.offsetX || e.clientX - this.__x;
        var y = e.offsetY || e.clientY - this.__y;
        x = x / this.__ratio | 0;
        y = y / this.__ratio | 0;
        oThis.doMouseEvent('Click', x - oThis._x, y - oThis._y, e.which)
    }

    eventScreenDblClick(e) {
        var oThis = this.__this;
        var x = e.offsetX || e.clientX - this.__x;
        var y = e.offsetY || e.clientY - this.__y;
        x = x / this.__ratio | 0;
        y = y / this.__ratio | 0;
        oThis.doMouseEvent('Dblclick', x - oThis._x, y - oThis._y, e.which)
    }

    eventScreenMouseMove(e) {
        var oThis = this.__this;
        var x = e.offsetX || e.clientX - this.__x;
        var y = e.offsetY || e.clientY - this.__y;
        x = x / this.__ratio | 0;
        y = y / this.__ratio | 0;
        oThis.doMouseEvent('MouseMove', x - oThis._x, y - oThis._y, e.which)
    }

    eventScreenMouseDown(e) {
        var oThis = this.__this;
        var x = e.offsetX || e.clientX - this.__x;
        var y = e.offsetY || e.clientY - this.__y;
        x = x / this.__ratio | 0;
        y = y / this.__ratio | 0;
        oThis.doMouseEvent('MouseDown', x - oThis._x, y - oThis._y, e.which)
    }

    eventScreenMouseUp(e) {
        var oThis = this.__this;
        var x = e.offsetX || e.clientX - this.__x;
        var y = e.offsetY || e.clientY - this.__y;
        x = x / this.__ratio | 0;
        y = y / this.__ratio | 0;
        oThis.doMouseEvent('MouseUp', x - oThis._x, y - oThis._y, e.which)
    }

    eventScreenDOMMouseScroll(e) {
        var oThis = this.__this;
        var x = e.offsetX || e.clientX - this.__x;
        var y = e.offsetY || e.clientY - this.__y;
        x = x / this.__ratio | 0;
        y = y / this.__ratio | 0;
        var nDelta = 0;
        if (e.wheelDelta) {
            nDelta = e.wheelDelta
        } else {
            nDelta = -40 * e.detail
        }
        if (nDelta > 0) {
            oThis.doMouseEvent('MouseWheelUp', x - oThis._x, y - oThis._y, e.which)
        } else {
            oThis.doMouseEvent('MouseWheelDown', x - oThis._x, y - oThis._y, e.which)
        }
    }

    listenToMouseEvents(oCanvas) {
        if (this.bEventsDefined) {
            return
        }
        oCanvas.__this = this.oScreen;
        oCanvas.oncontextmenu = function(e) {
            return false
        };
        oCanvas.addEventListener('click', this.eventScreenClick, false);
        oCanvas.addEventListener('dblclick', this.eventScreenDblClick, false);
        oCanvas.addEventListener('mousemove', this.eventScreenMouseMove, false);
        oCanvas.addEventListener('mousedown', this.eventScreenMouseDown, false);
        oCanvas.addEventListener('mouseup', this.eventScreenMouseUp, false);
        oCanvas.addEventListener('DOMMouseScroll', this.eventScreenDOMMouseScroll, false);
        oCanvas.addEventListener('mousewheel', this.eventScreenDOMMouseScroll, false);
        this.bEventsDefined = true
    }

    deafToMouseEvents(oCanvas) {
        if (!this.bEventsDefined) {
            return
        }
        oCanvas.removeEventListener('click', this.eventScreenClick, false);
        oCanvas.removeEventListener('dblclick', this.eventScreenDblClick, false);
        oCanvas.removeEventListener('mousemove', this.eventScreenMouseMove, false);
        oCanvas.removeEventListener('mousedown', this.eventScreenMouseDown, false);
        oCanvas.removeEventListener('mouseup', this.eventScreenMouseUp, false);
        oCanvas.removeEventListener('DOMMouseScroll', this.eventScreenDOMMouseScroll, false);
        oCanvas.removeEventListener('mousewheel', this.eventScreenDOMMouseScroll, false);
        oCanvas.oncontextmenu = null;
        delete oCanvas.__this;
        this.bEventsDefined = false
    }

    render() {
        if (this.oScreen.needRender()) {
            this.oScreen.render();
            this.oRenderContext.drawImage(this.oScreen._oCanvas, 0, 0)
        }
    }

    setScreen(sScreen) {
        this.sScreen = sScreen;
        var sCmdProc = 'cmd' + sScreen;
        if (sCmdProc in this) {
            this.commandProc = this[sCmdProc]
        } else {
            throw new Error('Unknown UI Command')
        }
    }

    command(sScreen, sCommand, oParams) {
        if (sScreen !== '' && sScreen != this.sScreen) {
            this.setScreen(sScreen)
        }
        if (this.commandProc) {
            return this.commandProc(sCommand, oParams)
        }
    }

    cmdLoading(sCommand, xParams) {
        if (this.getWidget() === null) {
            this.centerWidget(this.declareWidget(new UI.LoadingWindow()))
        }
        this.oScreen.fAlpha = 0.2;
        var w = this.getWidget().getProgressBar();
        switch (sCommand) {
            case 'set':
                w.setMax(xParams.max);
                w.setCaption(xParams.caption);
                w.setProgress(xParams.n);
                break
        }
    }

    cmdMainmenu(sCommand, xParams) {
        var i;
        switch (sCommand) {
            case 'on':
                this.clear();
                this.cornerWidget(this.declareWidget(new UI.MainMenuWindow(xParams)), 2, 32);
                this.oScreen.fAlpha = 0;
                this.oScreen.show();
                break;
            case 'select':
                i = this.getWidget().iSelect;
                this.getWidget().iSelect = -1;
                return i
        }
    }

    cmdConfig(sCommand, xParams) {
        switch (sCommand) {
            case 'on':
                this.clear();
                this.cornerWidget(this.declareWidget(new UI.ConfigWindow(xParams)), 2, 16);
                this.oScreen.fAlpha = 0;
                this.oScreen.show();
                break
        }
    }
});
Object.assign(UI.System.prototype, {
    oScreen: null,
    oRenderContext: null,
    oRenderCanvas: null,
    oWidgets: null,
    oWidget: null,
    sScreen: 0,
    oPlugins: null,
    bEventsDefined: false,
    commandProc: null
});
