export class MouseDevice {
    constructor() {
        this.nButtons = 0;
        this.aEvents = [];
        this.nKeyBufferSize = 16;
        this.bUseBuffer = true;
        this.nSecurityDelay = 0;
        this.oElement = null
    }

    clearBuffer() {
        this.aEvents = []
    }

    eventMouseUp(e) {
        const oEvent = window.event ? window.event : e;
        const oDev = window.__mouseDevice;
        oDev.nButtons = oEvent.buttons;
        if (oDev.bUseBuffer && oDev.aEvents.length < oDev.nKeyBufferSize) {
            oDev.aEvents.push([0, oEvent.clientX, oEvent.clientY, oEvent.button])
        }
        return false
    }

    eventMouseDown(e) {
        const oEvent = window.event ? window.event : e;
        const oDev = window.__mouseDevice;
        oDev.nButtons = oEvent.buttons;
        if (oDev.bUseBuffer && oDev.aEvents.length < oDev.nKeyBufferSize) {
            oDev.aEvents.push([1, oEvent.clientX, oEvent.clientY, oEvent.button])
        }
        if (oEvent.button === 2) {
            if (oEvent.stopPropagation) {
                oEvent.stopPropagation()
            }
            oEvent.cancelBubble = true
        }
        return false
    }

    eventMouseClick(e) {
        const oEvent = window.event ? window.event : e;
        if (oEvent.button === 2) {
            if (oEvent.stopPropagation) {
                oEvent.stopPropagation()
            }
            oEvent.cancelBubble = true
        }
        return false
    }

    inputMouse() {
        if (this.nSecurityDelay > 0) {
            --this.nSecurityDelay;
            this.clearBuffer();
            return null
        } else {
            return this.aEvents.shift()
        }
    }

    mouseWheel(e) {
        const oEvent = window.event ? window.event : e;
        const oDev = window.__mouseDevice;
        let nDelta = 0;
        if (oEvent.wheelDelta) {
            nDelta = oEvent.wheelDelta
        } else {
            nDelta = -40 * oEvent.detail
        }
        if (oDev.bUseBuffer && oDev.aEvents.length < oDev.nKeyBufferSize) {
            if (e.wheelDelta) {
                nDelta = oEvent.wheelDelta > 0 ? 3 : -3;
                oDev.aEvents.push([nDelta, 0, 0, 3])
            } else {
                nDelta = oEvent.detail > 0 ? -3 : 3;
                oDev.aEvents.push([nDelta, 0, 0, 3])
            }
        }
    }

    plugEvents(oElement) {
        window.__mouseDevice = this;
        oElement.addEventListener('mousedown', this.eventMouseDown, false);
        oElement.addEventListener('click', this.eventMouseClick, false);
        oElement.addEventListener('mouseup', this.eventMouseUp, false);
        oElement.addEventListener('mousewheel', this.mouseWheel, false);
        oElement.addEventListener('DOMMouseScroll', this.mouseWheel, false);
        this.oElement = oElement
    }

    unplugEvents() {
        const oElement = this.oElement;
        oElement.removeEventListener('mousedown', this.eventMouseDown, false);
        oElement.removeEventListener('click', this.eventMouseClick, false);
        oElement.removeEventListener('mouseup', this.eventMouseUp, false);
        oElement.removeEventListener('mousewheel', this.mouseWheel, false);
        oElement.removeEventListener('DOMMouseScroll', this.mouseWheel, false)
    }

    clearEvents() {
        this.aEvents = []
    }
}
