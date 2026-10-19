import { Effect } from './Effect.js';

export class EffectProcessor {
    constructor() {
        this.nTime = 0;
        this.BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    }

    getEffectType(sEffect) {
        return sEffect.charAt(0)
    }

    getEffectSubType(sEffect) {
        return sEffect.substr(1, 4)
    }

    getEffectLevel(sEffect) {
        return this.BASE64.indexOf(sEffect.charAt(5))
    }

    getEffectDuration(sEffect) {
        return this.BASE64.indexOf(sEffect.charAt(6))
    }

    setEffectLevel(sEffect, nLevel) {
        // un seul caractère base 64 : 0 à 63 (au-delà, le code serait cassé)
        nLevel = Math.max(0, Math.min(63, nLevel));
        return sEffect.substr(0, 5) + this.BASE64.charAt(nLevel) + sEffect.charAt(6)
    }

    setEffectDuration(sEffect, nDuration) {
        return sEffect.substr(0, 6) + this.BASE64.charAt(nDuration)
    }

    makeEffectStr(sType, sSubType, nLevel, nDuration) {
        return sType + sSubType + this.BASE64.charAt(nLevel) + this.BASE64.charAt(nDuration)
    }

    setTime(nTime) {
        this.nTime = nTime
    }

    processEffects(oCreature) {
        let oEffect;
        let sMeth;
        let sSubType;
        let i = oCreature.oEffects.length - 1;
        while (i >= 0) {
            oEffect = oCreature.oEffects[i];
            sSubType = this.getEffectSubType(oEffect.sEffect);
            sMeth = 'runEffect_' + sSubType;
            if (sMeth in this) {
                this[sMeth](oCreature, oEffect.sEffect)
            }
            if (oEffect.isExpired(this.nTime)) {
                sMeth = 'expireEffect_' + sSubType;
                if (sMeth in this) {
                    this[sMeth](oCreature, oEffect.sEffect)
                }
                oCreature.oEffects.splice(i, 1)
            }
            i--
        }
    }

    removeExpiredEffects(oCreature) {
        let oEffect;
        let i = oCreature.oEffects.length - 1;
        while (i >= 0) {
            oEffect = oCreature.oEffects[i--];
            if (oEffect.hasExpired()) {
                this.killEffect(oCreature, oEffect)
            }
        }
    }

    killEffect(oCreature, oEffect) {
        let sMeth;
        const sSubType = this.getEffectSubType(oEffect.sEffect);
        sMeth = 'expireEffect_' + sSubType;
        if (sMeth in this) {
            this[sMeth](oCreature, oEffect.sEffect)
        }
        oCreature.oEffects.splice(oCreature.oEffects.indexOf(oEffect), 1)
    }

    applyEffect(oCreature, sEffect) {
        let sEff2, sAttr, sMeth;
        sAttr = this.getEffectType(sEffect);
        sMeth = 'filterEffect_' + sAttr;
        if (sMeth in this) {
            sEff2 = this[sMeth](oCreature, sEffect);
            if (sEff2) {
                sEffect = sEff2
            }
        }
        sAttr = this.getEffectSubType(sEffect);
        sMeth = 'applyEffect_' + sAttr;
        if (sMeth in this) {
            sEff2 = this[sMeth](oCreature, sEffect);
            if (sEff2) {
                sEffect = sEff2
            }
        }
        const nDur = this.getEffectDuration(sEffect);
        if (nDur) {
            return this.bestowEffect(oCreature, sEffect, nDur)
        }
        return null
    }

    bestowEffect(oCreature, sEffect, nDuration) {
        const oEffect = new Effect();
        switch (nDuration) {
            case 63:
                oEffect.bExpirable = false;
                break;
            case 62:
                oEffect.setTimeOut(180 + this.nTime);
                break;
            case 61:
                oEffect.setTimeOut(120 + this.nTime);
                break;
            default:
                oEffect.setTimeOut(nDuration + this.nTime);
                break
        }
        oEffect.sEffect = sEffect;
        oCreature.oEffects.push(oEffect);
        return oEffect
    }

    dispellEffect(oCreature, nEffect) {
        oCreature.oEffects[nEffect].expire()
    }

    selectEffects(oCreature, f) {
        const aEffects = [];
        for (let i = 0; i < oCreature.oEffects.length; i++) {
            if (f.apply(this, [oCreature.oEffects[i]])) {
                aEffects.push(oCreature.oEffects[i])
            }
        }
        return aEffects
    }

    dispellEffects(oCreature, f) {
        for (let i = 0; i < oCreature.oEffects.length; i++) {
            if (f.apply(this, [oCreature.oEffects[i]])) {
                oCreature.oEffects[i].expire()
            }
        }
    }

    selectorAll(oEffect) {
        return true
    }

    selectorExpired(oEffect) {
        return oEffect.isExpired(this.nTime)
    }
}
