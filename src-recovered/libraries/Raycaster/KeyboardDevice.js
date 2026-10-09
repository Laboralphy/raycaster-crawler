O2.createObject('O876_Raycaster.KeyboardDevice', class KeyboardDevice {
    constructor(...aArgs) {
        this.__construct(...aArgs);
    }

    __construct() {
        this.aKeys = [];
        this.aAliases = {};
        for (var i = 0; i < 256; i++) {
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
        var oEvent = window.event ? window.event : e;
        var nCode = oEvent.charCode ? oEvent.charCode : oEvent.keyCode;
        var oDev = window.__keyboardDevice;
        if (nCode in oDev.aAliases) {
            nCode = oDev.aAliases[nCode]
        }
        oDev.keyBufferPush(-nCode);
        oDev.keyAction(nCode, 2);
        return false
    }

    eventKeyDown(e) {
        var oEvent = window.event ? window.event : e;
        var nCode = oEvent.charCode ? oEvent.charCode : oEvent.keyCode;
        var oDev = window.__keyboardDevice;
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
});
Object.assign(O876_Raycaster.KeyboardDevice.prototype, {
    aKeys: null,
    aKeyBuffer: null,
    nKeyBufferSize: 16,
    bUseBuffer: true,
    aAliases: null
});
