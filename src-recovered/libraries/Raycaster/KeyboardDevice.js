export class KeyboardDevice {
    constructor() {
        this.nKeyBufferSize = 16;
        this.bUseBuffer = true;
        this.aKeys = [];
        this.aAliases = {};
        for (let i = 0; i < 256; i++) {
            this.aKeys.push(0)
        }
        this.aKeyBuffer = []
    }

    setAliases(a) {
        this.aAliases = a
    }

    keyAction(k, n) {
        this.aKeys[k] = n
    }

    keyBufferPush(nKey) {
        if (this.bUseBuffer && nKey && this.aKeyBuffer.length < this.nKeyBufferSize) {
            this.aKeyBuffer.push(nKey)
        }
    }

    eventKeyUp(e) {
        const oEvent = window.event ? window.event : e;
        let nCode = oEvent.charCode ? oEvent.charCode : oEvent.keyCode;
        const oDev = window.__keyboardDevice;
        if (nCode in oDev.aAliases) {
            nCode = oDev.aAliases[nCode]
        }
        oDev.keyBufferPush(-nCode);
        oDev.keyAction(nCode, 2);
        return false
    }

    eventKeyDown(e) {
        const oEvent = window.event ? window.event : e;
        let nCode = oEvent.charCode ? oEvent.charCode : oEvent.keyCode;
        const oDev = window.__keyboardDevice;
        if (nCode in oDev.aAliases) {
            nCode = oDev.aAliases[nCode]
        }
        oDev.keyBufferPush(nCode);
        oDev.keyAction(nCode, 1);
        return false
    }

    inputKey() {
        if (this.aKeyBuffer.length) {
            return this.aKeyBuffer.shift()
        } else {
            return 0
        }
    }

    plugEvents() {
        window.__keyboardDevice = this;
        document.onkeyup = this.eventKeyUp;
        document.onkeydown = this.eventKeyDown
    }

    unplugEvents() {
        window.__keyboardDevice = null;
        document.onkeyup = undefined;
        document.onkeydown = undefined
    }
}
