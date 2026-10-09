import { H5UI } from './H5UI.js';

export class WinControl {
    constructor(...aArgs) {
        this.__construct(...aArgs);
    }

    __construct() {
        this._nHandle = ++H5UI.handle;
        this._aControls = [];
        this._aInvalidControls = [];
        this._aAlignedControls = {
            center: []
        };
        this._aHideControls = [];
        this.buildSurface();
        this.invalidate()
    }

    __destruct() {
        let i;
        H5UI.recycleCanvas(this._oCanvas);
        this.clear();
        let aProps = [];
        for (i in this) {
            this[i] = null;
            aProps.push(i)
        }
        for (i = 0; i < aProps.length; i++) {
            delete this[aProps[i]]
        }
        aProps = null;
        H5UI.data.destroyedCanvases++
    }

    clear() {
        while (this._aControls.length) {
            this.unlinkControl(0)
        }
    }

    buildSurface() {
        this._oCanvas = H5UI.getCanvas();
        H5UI.data.buildCanvases++;
        this._oContext = this._oCanvas.getContext('2d')
    }

    _set(sProperty, xValue) {
        if (sProperty in this && this[sProperty] != xValue) {
            this[sProperty] = xValue;
            this.invalidate()
        }
    }

    realignControls() {
        let n, a, sDokoMethod;
        for (const sDoko in this._aAlignedControls) {
            sDokoMethod = 'moveTo' + sDoko.substr(0, 1).toUpperCase() + sDoko.substr(1).toLowerCase();
            a = this._aAlignedControls[sDoko];
            for (n = 0; n < a.length; n++) {
                a[n][sDokoMethod]()
            }
        }
    }

    registerAlignedControl(oControl, sDoko) {
        oControl.render();
        this.unregisterAlignedControl(oControl);
        this.pushArrayItem(this._aAlignedControls[sDoko], oControl);
        this.realignControls()
    }

    unregisterAlignedControl(oControl) {
        for (const sDoko in this._aAlignedControls) {
            this.removeArrayItem(this._aAlignedControls[sDoko], oControl)
        }
    }

    removeArrayItem(oArray, xItem, sIndex) {
        let nItem;
        if (typeof xItem == 'object') {
            nItem = oArray.indexOf(xItem);
            if (nItem < 0) {
                return
            }
        } else {
            nItem = xItem
        }
        if (nItem == (oArray.length - 1)) {
            oArray.pop()
        } else {
            oArray[nItem] = oArray.pop();
            if (sIndex !== undefined) {
                oArray[nItem][sIndex] = nItem
            }
        }
    }

    pushArrayItem(oArray, oItem, sIndex) {
        let nLen;
        const nItem = oArray.indexOf(oItem);
        if (nItem < 0) {
            nLen = oArray.length;
            if (sIndex !== undefined) {
                oItem[sIndex] = nLen
            }
            oArray.push(oItem);
            return nLen
        } else {
            return nItem
        }
    }

    hideControl(oControl) {
        this.pushArrayItem(this._aHideControls, oControl)
    }

    showControl(oControl) {
        this.removeArrayItem(this._aHideControls, oControl)
    }

    doMouseEvent(sEvent, x, y, nButton, oClicked) {
        if (this._oDraggedControl !== null) {
            this.doDragDropEvent(sEvent, x, y, nButton);
            return
        }
        if (oClicked === undefined) {
            oClicked = this.getControlAt(x, y)
        }
        if (oClicked != this._oPointedControl) {
            if (this._oPointedControl !== null) {
                this.doMouseEvent('MouseOut', x, y, nButton, this._oPointedControl)
            }
            this._oPointedControl = oClicked;
            this.doMouseEvent('MouseIn', x, y, nButton, oClicked)
        }
        const sMouseEventMethod = 'on' + sEvent;
        let pMouseEventMethod;
        if (oClicked !== null) {
            if (sMouseEventMethod in oClicked) {
                pMouseEventMethod = oClicked[sMouseEventMethod];
                pMouseEventMethod.apply(oClicked, [x - oClicked._x, y - oClicked._y, nButton])
            }
            oClicked.doMouseEvent(sEvent, x - oClicked._x, y - oClicked._y, nButton)
        }
    }

    getControlRelativePosition(oControl) {
        const oPos = {
            x: 0,
            y: 0
        };
        while (oControl != this && oControl !== null) {
            oPos.x += oControl._x;
            oPos.y += oControl._y;
            oControl = oControl._oParent
        }
        return oPos
    }

    doDragDropEvent(sEvent, x, y, nButton) {
        const oPos = this.getControlRelativePosition(this._oDraggedControl);
        switch (sEvent) {
            case 'MouseMove':
                this._oDraggedControl.callEvent('onDragging', x - oPos.x, y - oPos.y, nButton);
                break;
            case 'MouseUp':
                this._oDraggedControl.callEvent('onEndDragging', x - oPos.x, y - oPos.y, nButton);
                this._oDraggedControl = null;
                break
        }
    }

    startDragObject(oTarget, x, y, b) {
        if (this._bDragHandler) {
            this._oDraggedControl = oTarget;
            oTarget.callEvent('onStartDragging', x, y, b)
        } else {
            this.callParentMethod('startDragObject', oTarget, x, y, b)
        }
    }

    argObjectToArray(a) {
        let i = '';
        const aArgs = [];
        if ('length' in a) {
            for (i = 0; i < a.length; i++) {
                aArgs.push(a[i])
            }
            return aArgs
        }
        for (i in a) {
            aArgs.push(a[i])
        }
        return aArgs
    }

    callParentMethod() {
        if (this._oParent === null) {
            return null
        }
        const aArgs = this.argObjectToArray(arguments);
        const sMethod = aArgs.shift();
        if (sMethod in this._oParent) {
            return this._oParent[sMethod].apply(this._oParent, aArgs)
        }
    }

    callEvent() {
        const aArgs = this.argObjectToArray(arguments);
        const sMethod = aArgs.shift();
        if (sMethod in this) {
            return this[sMethod].apply(this, aArgs)
        }
    }

    invalidateControl(o) {
        if (this._aInvalidControls.indexOf(o) < 0) {
            this._aInvalidControls.push(o)
        }
    }

    renderControls() {
        let o;
        while (this._aInvalidControls.length) {
            o = this._aInvalidControls.shift();
            if (o._nHandle) {
                o.render()
            }
        }
    }

    hideControls() {
        let o;
        while (this._aHideControls.length) {
            o = this._aHideControls.shift();
            this._oContext.clearRect(o._x, o._y, o.getWidth(), o.getHeight())
        }
    }

    renderSelf() {}

    needRender() {
        return this._bVisible && (this._nWidth * this._nHeight) !== 0
    }

    render() {
        let o;
        if (this._bInvalid) {
            this.hideControls();
            this.renderSelf();
            this.renderControls();
            for (let i = 0; i < this._aControls.length; i++) {
                o = this._aControls[i];
                if (o.needRender()) {
                    this._oContext.drawImage(o._oCanvas, o._x, o._y)
                }
            }
            this._bInvalid = false
        }
    }

    getClass() {
        return this._sClass
    }

    getWidth() {
        return this._nWidth
    }

    getHeight() {
        return this._nHeight
    }

    getParent() {
        return this._oParent
    }

    linkControl(o) {
        o._nIndex = this._aControls.length;
        this._aControls.push(o);
        o._oParent = this;
        o.invalidate();
        return o
    }

    setTopControl(o) {
        let i;
        const nIndex = this._aControls.indexOf(o);
        const nCount = this.getControlCount();
        if (nIndex >= 0) {
            for (i = nIndex; i < (nCount - 1); i++) {
                this._aControls[i] = this._aControls[i + 1];
                this._aControls[i]._set('_nIndex', i)
            }
            this._aControls[nCount - 1] = o;
            o._set('_nIndex', i)
        }
    }

    top() {
        this.callParentMethod('setTopControl', this)
    }

    unlinkControl(n) {
        let oControl;
        if (n >= this._aControls.length) {
            throw new Error('out of bounds: ' + n.toString() + ' - range is 0 to ' + this._aControls.length)
        }
        oControl = this._aControls[n];
        this.removeArrayItem(this._aControls, n, '_nIndex');
        this.removeArrayItem(this._aInvalidControls, oControl);
        for (const sAlign in this._aAlignedControls) {
            this.removeArrayItem(this._aAlignedControls[sAlign], oControl)
        }
        this.removeArrayItem(this._aHideControls, oControl);
        oControl.__destruct();
        this.invalidate()
    }

    free() {
        this.callParentMethod('unlinkControl', this._nIndex)
    }

    getControl(n) {
        if (n >= this._aControls.length) {
            throw new Error('out of bounds: ' + n.toString() + ' - range is 0 to ' + this._aControls.length)
        }
        return this._aControls[n]
    }

    getControlCount() {
        if (this._aControls) {
            return this._aControls.length
        } else {
            return 0
        }
    }

    align(sDoko) {
        if (sDoko === undefined) {
            this.callParentMethod('unregisterAlignedControl', this)
        } else {
            this.callParentMethod('registerAlignedControl', this, sDoko)
        }
    }

    setSize(w, h) {
        if (w != this.getWidth() || h != this.getHeight()) {
            this._nWidth = this._oCanvas.width = w;
            this._nHeight = this._oCanvas.height = h;
            this.realignControls();
            this.invalidate()
        }
    }

    moveTo(x, y) {
        if (x != this._x || y != this._y) {
            this._x = x;
            this._y = y;
            this.realignControls();
            this.invalidate()
        }
    }

    moveToCenter() {
        const p = this.getParent();
        if (p) {
            this.moveTo(((p.getWidth() - this.getWidth()) >> 1), ((p.getHeight() - this.getHeight()) >> 1))
        }
    }

    hide() {
        if (this._bVisible) {
            this._bVisible = false;
            this.callParentMethod('hideControl', this);
            this.invalidate()
        }
    }

    show() {
        if (!this._bVisible) {
            this._bVisible = true;
            this.invalidate()
        }
    }

    getSurface() {
        if (this._oContext === null) {
            this._oContext = this._oCanvas.getContext('2d')
        }
        return this._oContext
    }

    getParentSurface() {
        return this.callParentMethod('getSurface')
    }

    getControlAt(x, y) {
        let o, ox, oy, w, h;
        if (this._aControls) {
            for (let i = this._aControls.length - 1; i >= 0; i--) {
                o = this._aControls[i];
                ox = o._x;
                oy = o._y;
                w = o.getWidth();
                h = o.getHeight();
                if (x >= ox && y >= oy && x < (ox + w) && y < (oy + h) && o._bVisible) {
                    return o
                }
            }
        }
        return null
    }

    dragStart(x, y, b) {
        this.callParentMethod('startDragObject', this, x, y, b)
    }

    invalidate() {
        this._bInvalid = true;
        this.callParentMethod('invalidate');
        this.callParentMethod('invalidateControl', this)
    }

    hasControls() {
        return this._aControls !== null && this._aControls.length > 0
    }
}
Object.assign(WinControl.prototype, {
    _sClass: 'WinControl',
    _sName: '',
    _nHandle: 0,
    _nIndex: 0,
    _oParent: null,
    _oCanvas: null,
    _oContext: null,
    _nWidth: 0,
    _nHeight: 0,
    _x: 0,
    _y: 0,
    _bInvalid: true,
    _bVisible: true,
    _aControls: null,
    _aInvalidControls: null,
    _aAlignedControls: null,
    _aHideControls: null,
    _oPointedControl: null,
    _oDraggedControl: null,
    _bDragHandler: false
});
