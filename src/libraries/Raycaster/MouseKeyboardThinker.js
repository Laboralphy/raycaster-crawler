import { Thinker } from './Thinker.js';

export class MouseKeyboardThinker extends Thinker {
    constructor() {
        super();
        this.oKeyboard = null;
        this.oMouse = null;
        this.aKeys = null;
        this.aCommands = null
    }

    defineKeys(a) {
        this.aKeys = {};
        this.aCommands = {};
        for (const k in a) {
            this.aKeys[k] = [a[k], 0];
            this.aCommands[a[k]] = false
        }
    }

    getCommandStatus(sKey) {
        return this.aCommands[sKey]
    }

    updateKeys() {
        let sKey = '',
            nKey, sProc, pProc, aButton;
        for (sKey in this.aKeys) {
            nKey = this.aKeys[sKey][0];
            sProc = '';
            switch (this.oKeyboard.aKeys[nKey]) {
                case 1:
                    if (this.aKeys[sKey][1] === 0) {
                        sProc = sKey + 'Down';
                        this.aCommands[sKey] = true;
                        this.aKeys[sKey][1] = 1
                    }
                    break;
                case 2:
                    if (this.aKeys[sKey][1] == 1) {
                        sProc = sKey + 'Up';
                        this.aCommands[sKey] = false;
                        this.aKeys[sKey][1] = 0
                    }
                    break;
                default:
                    sProc = '';
                    break
            }
            if (sProc in this) {
                pProc = this[sProc];
                pProc.apply(this, [])
            }
        }
        while (aButton = this.oMouse.inputMouse()) {
            nKey = aButton[3];
            sKey = 'button' + nKey;
            switch (aButton[0]) {
                case 1:
                    sProc = sKey + 'Down';
                    this.aCommands[sKey] = true;
                    break;
                case 0:
                    sProc = sKey + 'Up';
                    this.aCommands[sKey] = false;
                    break;
                case 3:
                    sProc = 'wheelUp';
                    break;
                case -3:
                    sProc = 'wheelDown';
                    break;
                default:
                    sProc = '';
                    break
            }
            if (sProc in this) {
                pProc = this[sProc];
                pProc.apply(this, [])
            }
        }
        for (sKey in this.aCommands) {
            if (this.aCommands[sKey]) {
                sProc = sKey + 'Command';
                if (sProc in this) {
                    pProc = this[sProc];
                    pProc.apply(this, [])
                }
            }
        }
    }
}
