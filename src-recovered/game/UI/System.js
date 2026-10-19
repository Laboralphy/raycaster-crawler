import { LoadingWindow } from './LoadingWindow.js';
import { MainMenuWindow } from './MainMenuWindow.js';
import { Screen } from './Screen.js';
import { UI } from './UI.js';

export class System {
    constructor() {
        this.oRenderContext = null;
        this.oRenderCanvas = null;
        this.oWidgets = null;
        this.oWidget = null;
        this.sScreen = 0;
        this.bEventsDefined = false;
        this.commandProc = null;
        this.oScreen = new Screen();
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
        const xLeft = nMargin;
        const yTop = nMargin;
        const xCenter = (this.oScreen._nWidth - w._nWidth) >> 1;
        const yCenter = (this.oScreen._nHeight - w._nHeight) >> 1;
        const xRight = this.oScreen._nWidth - w._nWidth - nMargin;
        const yBottom = this.oScreen._nHeight - w._nHeight - nMargin;
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
        const oThis = this.__this;
        let x = e.offsetX || e.clientX - this.__x;
        let y = e.offsetY || e.clientY - this.__y;
        x = x / this.__ratio | 0;
        y = y / this.__ratio | 0;
        oThis.doMouseEvent('Click', x - oThis._x, y - oThis._y, e.which)
    }

    eventScreenDblClick(e) {
        const oThis = this.__this;
        let x = e.offsetX || e.clientX - this.__x;
        let y = e.offsetY || e.clientY - this.__y;
        x = x / this.__ratio | 0;
        y = y / this.__ratio | 0;
        oThis.doMouseEvent('Dblclick', x - oThis._x, y - oThis._y, e.which)
    }

    eventScreenMouseMove(e) {
        const oThis = this.__this;
        let x = e.offsetX || e.clientX - this.__x;
        let y = e.offsetY || e.clientY - this.__y;
        x = x / this.__ratio | 0;
        y = y / this.__ratio | 0;
        oThis.doMouseEvent('MouseMove', x - oThis._x, y - oThis._y, e.which)
    }

    eventScreenMouseDown(e) {
        const oThis = this.__this;
        let x = e.offsetX || e.clientX - this.__x;
        let y = e.offsetY || e.clientY - this.__y;
        x = x / this.__ratio | 0;
        y = y / this.__ratio | 0;
        oThis.doMouseEvent('MouseDown', x - oThis._x, y - oThis._y, e.which)
    }

    eventScreenMouseUp(e) {
        const oThis = this.__this;
        let x = e.offsetX || e.clientX - this.__x;
        let y = e.offsetY || e.clientY - this.__y;
        x = x / this.__ratio | 0;
        y = y / this.__ratio | 0;
        oThis.doMouseEvent('MouseUp', x - oThis._x, y - oThis._y, e.which)
    }

    eventScreenDOMMouseScroll(e) {
        const oThis = this.__this;
        let x = e.offsetX || e.clientX - this.__x;
        let y = e.offsetY || e.clientY - this.__y;
        x = x / this.__ratio | 0;
        y = y / this.__ratio | 0;
        let nDelta = 0;
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
        // écran intégré (cmdLoading...) ou greffon déclaré par UI.addUIPlugin ;
        // le contrôleur du greffon tourne avec this = System (this.commandProc)
        const sCmdProc = 'cmd' + sScreen;
        if (sCmdProc in this) {
            this.commandProc = this[sCmdProc]
        } else if (sScreen in UI.oPlugins) {
            this.commandProc = UI.oPlugins[sScreen].uiController
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
            this.centerWidget(this.declareWidget(new LoadingWindow()))
        }
        this.oScreen.fAlpha = 0.2;
        const w = this.getWidget().getProgressBar();
        switch (sCommand) {
            case 'set':
                w.setMax(xParams.max);
                w.setCaption(xParams.caption);
                w.setProgress(xParams.n);
                break
        }
    }

    cmdMainmenu(sCommand, xParams) {
        let i;
        switch (sCommand) {
            case 'on':
                this.clear();
                this.cornerWidget(this.declareWidget(new MainMenuWindow(xParams)), 2, 32);
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
}
