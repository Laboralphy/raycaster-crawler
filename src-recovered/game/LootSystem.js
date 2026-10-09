O2.createObject('LootSystem', class LootSystem {
    constructor(...aArgs) {
        this.__construct(...aArgs);
    }

    __construct() {
        this._oTable = {}
    }

    getLoot(sType) {
        var aLoot = [];
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
        var oData = this._oTable[sType];
        var nItemCount = MathTools.rndChoose(oData.chances);
        while (nItemCount > 0) {
            aLoot.push(MathTools.rndChoose(oData.items));
            nItemCount--
        }
        return aLoot
    }

    generateDistribution(oData) {
        var x, a = [];
        var t = oData;
        for (var i in t) {
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
        var oItems = {};
        var aLoot, iLoot;
        for (var i = 0; i < n; i++) {
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
        var oItems = {};
        var sItem = '',
            o;
        for (sItem in LOOT_DATA[sType].items) {
            oItems[sItem] = []
        }
        for (var iTest = 0; iTest < 10000; iTest++) {
            o = this.test(sType);
            for (sItem in o) {
                oItems[sItem].push(o[sItem])
            }
        }
        var oResult = {};
        var avg = function(aTab) {
            var n = 0;
            for (var i = 0; i < aTab.length; i++) {
                n += aTab[i]
            }
            return n / aTab.length
        };
        for (sItem in oItems) {
            oResult[sItem] = avg(oItems[sItem])
        }
        var aResult = [];
        for (sItem in oResult) {
            aResult.push([sItem, oResult[sItem]])
        }
        aResult.sort(function(a, b) {
            return b[1] - a[1]
        });
        return aResult
    }

    runDungeonTest(oTypes) {
        var oItems = {},
            sItem = '',
            o;
        for (var sType in oTypes) {
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
});
Object.assign(LootSystem.prototype, {
    _oTable: null
});
