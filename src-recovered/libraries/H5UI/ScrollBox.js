import { WinControl } from './WinControl.js';

export class ScrollBox extends WinControl {
    constructor() {
        super();
        this._sClass = 'ScrollBox';
        this._oContainer = null;
        this._xScroll = 0;
        this._yScroll = 0
    }

    linkControl(o, bParent) {
        if (bParent === undefined) {
            bParent = false
        }
        if (bParent) {
            super.linkControl(o)
        } else {
            this.getContainer().linkControl(o)
        }
        return o
    }

    getContainer() {
        if (this._oContainer === null) {
            this._oContainer = this.linkControl(new WinControl(), true);
            this._oContainer._sClass = 'ScrollBoxContainer'
        }
        return this._oContainer
    }

    scrollTo(x, y) {
        if (x != this._xScroll || y != this._yScroll) {
            this._xScroll = x;
            this._yScroll = y;
            this.getContainer().moveTo(-x, -y);
            this.invalidate()
        }
    }

    getScrollX() {
        return this._xScroll
    }

    getScrollY() {
        return this._yScroll
    }

    renderSelf() {
        let w = 0,
            h = 0,
            o;
        const c = this.getContainer();
        for (let i = 0; i < c._aControls.length; i++) {
            o = c.getControl(i);
            w = Math.max(w, o._x + o.getWidth());
            h = Math.max(h, o._y + o.getHeight())
        }
        c.setSize(w, h)
    }
}
