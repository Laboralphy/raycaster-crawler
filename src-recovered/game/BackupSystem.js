import { ArrayTools } from '../libraries/O876/ArrayTools.js';
import { LZW } from '../libraries/O876/LZW.js';

export class BackupSystem {
    constructor(...aArgs) {
        this.__construct(...aArgs);
    }

    __construct() {
        this.aRatio = {};
        if (!this.hasLocalStorage()) {
            throw new Error('no localstorage available')
        }
    }

    hasLocalStorage() {
        return 'localStorage' in window && localStorage !== null
    }

    init(sNameSpace) {
        this.sNameSpace = sNameSpace + this.SEPARATOR
    }

    registerData(sKey) {
        if (sKey == this.DATA_KEY) {
            return
        }
        const f = this.loadData(this.DATA_KEY);
        if (f === null) {
            this.storeData(this.DATA_KEY, [sKey])
        } else if (f.indexOf(sKey) < 0) {
            f.push(sKey);
            this.storeData(this.DATA_KEY, f)
        }
    }

    unregisterData(sKey) {
        if (sKey == this.DATA_KEY) {
            return
        }
        const f = this.loadData(this.DATA_KEY);
        if (f === null) {
            return
        } else if (f.indexOf(sKey) >= 0) {
            ArrayTools.removeItem(f, f.indexOf(sKey));
            this.storeData(this.DATA_KEY, f)
        }
    }

    isStoredData(sKey) {
        const sNSKey = this.sNameSpace + sKey;
        return sNSKey in localStorage
    }

    storeData(sKey, xData) {
        const sNSKey = this.sNameSpace + sKey;
        if (xData === null) {
            this.unregisterData(sKey);
            localStorage.removeItem(sNSKey)
        } else {
            this.registerData(sKey);
            localStorage[sNSKey] = LZW.encode(JSON.stringify(xData));
            this.aRatio[sKey] = LZW.nLastRatio
        }
    }

    loadData(sKey) {
        const sNSKey = this.sNameSpace + sKey;
        if (sNSKey in localStorage) {
            return JSON.parse(LZW.decode(localStorage[sNSKey]))
        } else {
            return null
        }
    }

    clear() {
        let i;
        let f;
        try {
            f = this.loadData(this.DATA_KEY);
            if (f === null) {
                return
            }
            for (i = 0; i < f.length; i++) {
                localStorage.removeItem(this.sNameSpace + f[i])
            }
            localStorage.removeItem(this.sNameSpace + this.DATA_KEY)
        } catch (e) {
            const aToBeRemoved = [];
            for (i in localStorage) {
                if (i.substr(0, this.sNameSpace.length) == this.sNameSpace) {
                    aToBeRemoved.push(i)
                }
            }
            for (i = 0; i < aToBeRemoved.length; i++) {
                localStorage.removeItem(aToBeRemoved[i])
            }
        }
    }

    exportData() {
        const oExport = {};
        const f = this.loadData(this.DATA_KEY);
        if (f === null) {
            return null
        }
        for (let i = 0; i < f.length; i++) {
            oExport[f[i]] = this.loadData(f[i])
        }
        return oExport
    }
}
Object.assign(BackupSystem.prototype, {
    nBackupFormat: 1,
    sNameSpace: '',
    SEPARATOR: '__',
    DATA_KEY: 'data',
    aFiles: null,
    aRatio: null
});
