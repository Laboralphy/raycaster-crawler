import { Thinker } from './Thinker.js';

export class KeyboardThinker extends Thinker {
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
            nKey, sProc, pProc;
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
Object.assign(KeyboardThinker.prototype, {
    oKeyboard: null,
    aKeys: null,
    aCommands: null
});
