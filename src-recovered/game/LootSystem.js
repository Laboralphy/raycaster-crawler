import { LOOT_DATA } from './data/LOOT_DATA.js';
import { ArrayTools } from '../libraries/O876/ArrayTools.js';
import { MathTools } from '../libraries/Raycaster/Tools/MathTools.js';

export class LootSystem {
    constructor(...aArgs) {
        this.__construct(...aArgs);
    }

    __construct() {
        this._oTable = {}
    }

    getLoot(sType) {
        const aLoot = [];
        if (!(sType in this._oTable)) {
            if (sType in LOOT_DATA) {
                this._oTable[sType] = {
                    chances: this.generateDistribution(LOOT_DATA[sType].chances),
                    items: this.generateDistribution(LOOT_DATA[sType].items)
                }
            } else {
                return aLoot
            }
        }
        const oData = this._oTable[sType];
        let nItemCount = MathTools.rndChoose(oData.chances);
        while (nItemCount > 0) {
            aLoot.push(MathTools.rndChoose(oData.items));
            nItemCount--
        }
        return aLoot
    }

    generateDistribution(oData) {
        let x;
        const a = [];
        const t = oData;
        for (const i in t) {
            for (x = 0; x < t[i]; x++) {
                a.push(i)
            }
        }
        return ArrayTools.shuffle(a)
    }

    test(sType, n) {
        if (n === undefined) {
            n = 100
        }
        const oItems = {};
        let aLoot, iLoot;
        for (let i = 0; i < n; i++) {
            aLoot = this.getLoot(sType);
            for (iLoot = 0; iLoot < aLoot.length; iLoot++) {
                if (!(aLoot[iLoot] in oItems)) {
                    oItems[aLoot[iLoot]] = 0
                }
                oItems[aLoot[iLoot]]++
            }
        }
        return oItems
    }

    runTests(sType) {
        const oItems = {};
        let sItem = '',
            o;
        for (sItem in LOOT_DATA[sType].items) {
            oItems[sItem] = []
        }
        for (let iTest = 0; iTest < 10000; iTest++) {
            o = this.test(sType);
            for (sItem in o) {
                oItems[sItem].push(o[sItem])
            }
        }
        const oResult = {};
        const avg = function(aTab) {
            let n = 0;
            for (let i = 0; i < aTab.length; i++) {
                n += aTab[i]
            }
            return n / aTab.length
        };
        for (sItem in oItems) {
            oResult[sItem] = avg(oItems[sItem])
        }
        const aResult = [];
        for (sItem in oResult) {
            aResult.push([sItem, oResult[sItem]])
        }
        aResult.sort(function(a, b) {
            return b[1] - a[1]
        });
        return aResult
    }

    runDungeonTest(oTypes) {
        const oItems = {};
        let sItem = '', o;
        for (const sType in oTypes) {
            o = this.test(sType, oTypes[sType]);
            for (sItem in o) {
                if (!(sItem in oItems)) {
                    oItems[sItem] = o[sItem]
                } else {
                    oItems[sItem] += o[sItem]
                }
            }
        }
        return oItems
    }
}
Object.assign(LootSystem.prototype, {
    _oTable: null
});
