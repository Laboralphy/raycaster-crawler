O2.createObject('GC.Creature', class Creature {
    constructor(...aArgs) {
        this.__construct(...aArgs);
    }

    __construct() {
        this.oExtraData = {};
        this.oBaseAttributes = {};
        this.oAttributes = {};
        this.oEffects = []
    }

    setEffectProcessor(ep) {
        this.oEffectProcessor = ep
    }

    processEffects() {
        if (this.oEffectProcessor) {
            this.oEffectProcessor.processEffects(this)
        } else {
            throw new Error('effect processor is not defined')
        }
    }

    getAttribute(sAttribute) {
        var nBonus;
        if (sAttribute in this.oAttributes) {
            nBonus = this.oAttributes[sAttribute]
        } else {
            nBonus = 0
        }
        if (sAttribute in this.oBaseAttributes) {
            return this.oBaseAttributes[sAttribute] + nBonus
        } else {
            return nBonus
        }
    }

    getAttributes() {
        var sAttr = '',
            oResult = {};
        for (sAttr in this.oBaseAttributes) {
            oResult[sAttr] = [0, 0]
        }
        for (sAttr in this.oAttributes) {
            if (!(sAttr in oResult)) {
                oResult[sAttr] = [0, 0]
            }
        }
        for (sAttr in oResult) {
            if (sAttr in this.oBaseAttributes) {
                oResult[sAttr][0] = this.oBaseAttributes[sAttr]
            }
            if (sAttr in this.oAttributes) {
                oResult[sAttr][1] = this.oAttributes[sAttr]
            }
        }
        return oResult
    }

    getBaseAttribute(sAttribute) {
        if (sAttribute in this.oBaseAttributes) {
            return this.oBaseAttributes[sAttribute]
        } else {
            return 0
        }
    }

    setBaseAttribute(sAttribute, nValue) {
        var nPreviousValue = 0;
        var bAttrPresent = sAttribute in this.oBaseAttributes;
        if (bAttrPresent) {
            nPreviousValue = this.oBaseAttributes[sAttribute]
        }
        if (nValue) {
            this.oBaseAttributes[sAttribute] = nValue
        } else {
            if (bAttrPresent) {
                delete this.oBaseAttributes[sAttribute]
            }
        }
        this.doAttributeChanged(sAttribute, nValue, nPreviousValue)
    }

    modifyAttribute(sAttribute, nValue) {
        var nNewValue = 0;
        var nPreviousValue = 0;
        if (nValue === 0) {
            return
        }
        if (sAttribute in this.oAttributes) {
            nPreviousValue = this.oAttributes[sAttribute];
            nNewValue = nPreviousValue + nValue;
            if (nNewValue === 0) {
                delete this.oAttributes[sAttribute]
            } else {
                this.oAttributes[sAttribute] = nNewValue
            }
        } else {
            this.oAttributes[sAttribute] = nNewValue = nValue
        }
        this.doAttributeChanged(sAttribute, nNewValue, nPreviousValue)
    }

    setOnAttributeChanged(oFunc) {
        this.onAttributeChanged = oFunc;
        var sAttr = '',
            oAttr = {};
        for (sAttr in this.oBaseAttributes) {
            oAttr[sAttr] = true
        }
        for (sAttr in this.oAttributes) {
            oAttr[sAttr] = true
        }
        for (sAttr in oAttr) {
            this.doAttributeChanged(sAttr, this.getAttribute(sAttr), 0)
        }
    }

    doAttributeChanged(sAttribute, nNewValue, nPreviousValue) {
        if (this.onAttributeChanged && nNewValue != nPreviousValue) {
            this.onAttributeChanged(this, sAttribute, nNewValue, nPreviousValue)
        }
    }
});
Object.assign(GC.Creature.prototype, {
    oBaseAttributes: null,
    oAttributes: null,
    oEffects: null,
    oEffectProcessor: null,
    onAttributeChanged: null,
    oExtraData: null
});
