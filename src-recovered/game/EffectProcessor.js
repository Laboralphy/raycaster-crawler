O2.createObject('EffectProcessor', class EffectProcessor extends GC.EffectProcessor {
    __construct() {
        this.buildTables()
    }

    buildTables() {
        var f1, f2, fLog10 = Math.log(10);
        this.BUFF_FACTOR = [];
        this.VULNER_FACTOR = [];
        this.RESIST_FACTOR = [];
        this.DEBUFF_FACTOR = [];
        for (var i = 0; i <= this.MAX_LEVEL; i++) {
            f1 = i * 0.1 + 1;
            f2 = 1 - (Math.log(i + 1) / (2 * fLog10));
            this.BUFF_FACTOR.push(f1);
            this.VULNER_FACTOR.push(f1);
            this.RESIST_FACTOR.push(f2);
            this.DEBUFF_FACTOR.push(f2)
        }
    }

    getLevelFromEffects(aEffects) {
        var n = aEffects.length;
        var nLevel = 0;
        for (var i = 0; i < n; i++) {
            nLevel = Math.max(nLevel, this.getEffectLevel(aEffects[i]))
        }
        return nLevel
    }

    checkCreatureAlive(oCreature) {
        if (oCreature.getAttribute('hp') >= oCreature.getAttribute('vitality')) {
            oCreature.setBaseAttribute('dead', 1);
            return false
        } else {
            oCreature.setBaseAttribute('dead', 0);
            return true
        }
    }

    getResistProcessedValue(oCreature, nAmount, sResAttr, sVulAttr) {
        var fResist = 1;
        var nAttr = oCreature.getAttribute(sResAttr) - oCreature.getAttribute(sVulAttr);
        if (nAttr >= 0) {
            fResist = this.RESIST_FACTOR[Math.min(this.MAX_LEVEL, nAttr)]
        } else {
            fResist = this.VULNER_FACTOR[Math.min(this.MAX_LEVEL, -nAttr)]
        }
        if (fResist != 1) {
            nAmount = nAmount * fResist | 0
        }
        return nAmount
    }

    getBuffProcessedValue(oCreature, nAmount, sBuffAttr, sDebuffAttr) {
        var fBuff = 1;
        var nAttr = oCreature.getAttribute(sBuffAttr);
        if (sDebuffAttr !== undefined) {
            nAttr -= oCreature.getAttribute(sDebuffAttr)
        }
        if (nAttr >= 0) {
            fBuff = this.BUFF_FACTOR[Math.min(this.MAX_LEVEL, nAttr)]
        } else {
            fBuff = this.DEBUFF_FACTOR[Math.min(this.MAX_LEVEL, -nAttr)]
        }
        if (fBuff != 1) {
            nAmount = nAmount * fBuff | 0
        }
        return nAmount
    }

    getLuckBalance(fProb, nLuck, nJinx) {
        nLuck -= nJinx;
        if (nLuck >= 0) {
            fProb *= this.BUFF_FACTOR[Math.min(this.MAX_LEVEL, nLuck)]
        } else {
            fProb *= this.DEBUFF_FACTOR[Math.min(this.MAX_LEVEL, -nLuck)]
        }
        return fProb
    }

    damageCreature(oCreature, nAmount, sAttribute) {
        if (oCreature.getAttribute('invulnerable') <= 0) {
            oCreature.modifyAttribute('hp', this.getResistProcessedValue(oCreature, Math.max(0, nAmount), sAttribute, 'vulnerable'))
        }
        this.checkCreatureAlive(oCreature)
    }

    depleteCreatureEnergy(oCreature, nAmount) {
        oCreature.modifyAttribute('mp', Math.max(0, nAmount))
    }

    starveCreature(oCreature, nAmount) {
        nAmount = Math.max(0, nAmount);
        var nFoodPoints = oCreature.getAttribute('foodp');
        if (nFoodPoints < nAmount) {
            nAmount = nFoodPoints
        }
        oCreature.modifyAttribute('foodp', -nAmount)
    }

    healCreature(oCreature, nAmount) {
        oCreature.modifyAttribute('hp', -Math.min(oCreature.getAttribute('hp'), this.getResistProcessedValue(oCreature, Math.max(0, nAmount), 'disease', 'pharma')))
    }

    restoreCreatureEnergy(oCreature, nAmount) {
        oCreature.modifyAttribute('mp', -this.getResistProcessedValue(oCreature, Math.max(0, nAmount), 'disease', 'pharma'));
        var nMP = oCreature.getAttribute('mp');
        if (nMP < 0) {
            oCreature.modifyAttribute('mp', -nMP)
        }
    }

    feedCreature(oCreature, nAmount) {
        if (oCreature.getAttribute('foodp') < oCreature.getAttribute('foodmax')) {
            oCreature.modifyAttribute('foodp', Math.max(0, nAmount))
        }
    }

    bestowEffect(oCreature, sEffect, nDuration) {
        var sType = this.getEffectType(sEffect);
        if (this.EFFECT_NON_STACKABLE.indexOf(sType) >= 0) {
            var oEffects = oCreature.oEffects;
            var nEffCount = oEffects.length;
            var oEffect;
            for (var iEff = 0; iEff < nEffCount; iEff += 1) {
                oEffect = oEffects[iEff];
                if (oEffect.sEffect == sEffect) {
                    this.killEffect(oCreature, oEffect);
                    break
                }
            }
        }
        super.bestowEffect(oCreature, sEffect, nDuration)
    }

    selectEffects_poison(oEffect) {
        return this.getEffectType(oEffect.sEffect) == this.EFFECT_TYPE_POISON
    }

    selectEffects_evilCharm(oEffect) {
        return this.getEffectType(oEffect.sEffect) == this.EFFECT_TYPE_CHARM && this.getEffectType(oEffect.sEffect).charAt(0) == 'a'
    }

    selectEffects_curse(oEffect) {
        return this.getEffectType(oEffect.sEffect) == this.EFFECT_TYPE_CURSE
    }

    selectEffects_moveAilment(oEffect) {
        ('-ahld-aroo-asnr').indexOf(this.getEffectSubType(oEffect.sEffect))
    }

    selectEffects_ahld(oEffect) {
        return this.getEffectSubType(oEffect.sEffect) == 'ahld'
    }

    selectEffects_aroo(oEffect) {
        return this.getEffectSubType(oEffect.sEffect) == 'aroo'
    }

    selectEffects_asnr(oEffect) {
        return this.getEffectSubType(oEffect.sEffect) == 'asnr'
    }

    selectEffects_bodyAilment(oEffect) {
        return ('-avul-awea-aill').indexOf(this.getEffectSubType(oEffect.sEffect))
    }

    selectEffects_avul(oEffect) {
        return this.getEffectSubType(oEffect.sEffect) == 'avul'
    }

    selectEffects_awea(oEffect) {
        return this.getEffectSubType(oEffect.sEffect) == 'awea'
    }

    selectEffects_aill(oEffect) {
        return this.getEffectSubType(oEffect.sEffect) == 'aill'
    }

    selectEffects_mindAilment(oEffect) {
        return ('-abld-acnf').indexOf(this.getEffectSubType(oEffect.sEffect))
    }

    selectEffects_abld(oEffect) {
        return this.getEffectSubType(oEffect.sEffect) == 'abld'
    }

    selectEffects_acnf(oEffect) {
        return this.getEffectSubType(oEffect.sEffect) == 'acnf'
    }

    selectEffects_expirable(oEffect) {
        return oEffect.bExpirable
    }

    filterEffect_p(oCreature, sEffect) {
        if (oCreature.getAttribute('antidote') > 0) {
            return this.EFFECT_NULL
        } else {
            return sEffect
        }
    }

    addEffectManager(sEffect, pApply, pRun, pExpire) {
        if (pApply) {
            this['applyEffect_' + sEffect] = pApply
        }
        if (pRun) {
            this['runEffect_' + sEffect] = pRun
        }
        if (pExpire) {
            this['expireEffect_' + sEffect] = pExpire
        }
    }

    applyEffect_xphy(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        var nAmount = MathTools.rollDice(this.DAMAGE_FACTOR_PHYSICAL, nLevel);
        this.damageCreature(oCreature, nAmount, 'drphysical')
    }

    applyEffect_xmag(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        var nAmount = MathTools.rollDice(this.DAMAGE_FACTOR_MAGICAL, nLevel);
        this.damageCreature(oCreature, nAmount, 'drmagical')
    }

    applyEffect_xcld(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        var nAmount = MathTools.rollDice(this.DAMAGE_FACTOR_COLD, nLevel);
        this.damageCreature(oCreature, nAmount, 'drcold')
    }

    applyEffect_xfir(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        var nAmount = MathTools.rollDice(this.DAMAGE_FACTOR_FIRE, nLevel);
        this.damageCreature(oCreature, nAmount, 'drfire')
    }

    applyEffect_xele(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        var nAmount = MathTools.rollDice(this.DAMAGE_FACTOR_ELECTRICITY, nLevel);
        this.damageCreature(oCreature, nAmount, 'drelectricity')
    }

    applyEffect_xtox(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        var nAmount = MathTools.rollDice(this.DAMAGE_FACTOR_TOXIC, nLevel);
        this.damageCreature(oCreature, nAmount, 'drtoxic')
    }

    applyEffect_xdth(oCreature, sEffect) {
        if (this.getEffectDuration(sEffect) === 0) {
            this.expireEffect_xdth(oCreature, sEffect)
        }
    }

    applyEffect_xene(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        var nAmount = MathTools.rollDice(this.DAMAGE_FACTOR_MAGICAL, nLevel);
        this.depleteCreatureEnergy(oCreature, nAmount)
    }

    applyEffect_xfdp(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        var nAmount = this.FOOD_FACTOR * nLevel;
        this.starveCreature(oCreature, nAmount)
    }

    applyEffect_vfir(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('drfire', -nLevel)
    }

    applyEffect_vcld(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('drcold', -nLevel)
    }

    applyEffect_vele(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('drelectricity', -nLevel)
    }

    applyEffect_vtox(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('drtoxic', -nLevel)
    }

    applyEffect_vphy(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('drphysical', -nLevel)
    }

    applyEffect_vmag(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('drmagical', -nLevel)
    }

    applyEffect_asnr(oCreature, sEffect) {
        if (oCreature.getAttribute('freedom') > 0) {
            return
        }
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('snared', nLevel)
    }

    applyEffect_aroo(oCreature, sEffect) {
        if (oCreature.getAttribute('freedom') > 0) {
            return
        }
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('rooted', nLevel)
    }

    applyEffect_avul(oCreature, sEffect) {
        if (oCreature.getAttribute('health') > 0) {
            return
        }
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('vulnerable', nLevel)
    }

    applyEffect_awea(oCreature, sEffect) {
        if (oCreature.getAttribute('health') > 0) {
            return
        }
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('power', -nLevel)
    }

    applyEffect_aill(oCreature, sEffect) {
        if (oCreature.getAttribute('health') > 0) {
            return
        }
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('disease', nLevel)
    }

    applyEffect_acnf(oCreature, sEffect) {
        if (oCreature.getAttribute('clearmind') > 0) {
            return
        }
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('confused', nLevel)
    }

    applyEffect_abld(oCreature, sEffect) {
        if (oCreature.getAttribute('clearmind') > 0) {
            return
        }
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('blind', nLevel)
    }

    applyEffect_ahld(oCreature, sEffect) {
        if (oCreature.getAttribute('freedom') > 0) {
            return
        }
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('held', nLevel)
    }

    applyEffect_adhp(oCreature, sEffect) {
        if (oCreature.getAttribute('invulnerable') > 0) {
            return
        }
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('vitality', 0 - (nLevel * this.VITALITY_FACTOR));
        this.checkCreatureAlive(oCreature)
    }

    applyEffect_ajnx(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('luck', -nLevel)
    }

    applyEffect_admp(oCreature, sEffect) {
        oCreature.modifyAttribute('energy', -this.getEffectLevel(sEffect) * this.ENERGY_FACTOR)
    }

    applyEffect_ahun(oCreature, sEffect) {
        oCreature.modifyAttribute('foodc', this.getEffectLevel(sEffect) * this.ENERGY_FACTOR)
    }

    applyEffect_rphy(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('drphysical', nLevel)
    }

    applyEffect_rmag(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('drmagical', nLevel)
    }

    applyEffect_rfir(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('drfire', nLevel)
    }

    applyEffect_rcld(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('drcold', nLevel)
    }

    applyEffect_rele(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('drelectricity', nLevel)
    }

    applyEffect_rtox(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('drtoxic', nLevel)
    }

    applyEffect_rdth(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('drdeath', nLevel)
    }

    applyEffect_rhea(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        var nAmount = this.HEAL_FACTOR * nLevel;
        this.healCreature(oCreature, nAmount)
    }

    applyEffect_rant(oCreature, sEffect) {
        this.dispellEffects(oCreature, this.selectEffects_poison);
        if (this.getEffectDuration(sEffect)) {
            oCreature.modifyAttribute('antidote', this.getEffectLevel(sEffect))
        }
    }

    applyEffect_rbod(oCreature, sEffect) {
        this.dispellEffects(oCreature, this.selectEffects_bodyAilment);
        if (this.getEffectDuration(sEffect)) {
            oCreature.modifyAttribute('health', this.getEffectLevel(sEffect))
        }
    }

    applyEffect_rmin(oCreature, sEffect) {
        this.dispellEffects(oCreature, this.selectEffects_mindAilment);
        if (this.getEffectDuration(sEffect)) {
            oCreature.modifyAttribute('clearmind', this.getEffectLevel(sEffect))
        }
    }

    applyEffect_rmov(oCreature, sEffect) {
        this.dispellEffects(oCreature, this.selectEffects_moveAilment);
        if (this.getEffectDuration(sEffect)) {
            oCreature.modifyAttribute('freedom', this.getEffectLevel(sEffect))
        }
    }

    applyEffect_rene(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        var nAmount = this.ENERGY_FACTOR * nLevel;
        this.restoreCreatureEnergy(oCreature, nAmount)
    }

    applyEffect_rfdp(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        var nAmount = this.FOOD_FACTOR * nLevel;
        this.feedCreature(oCreature, nAmount)
    }

    applyEffect_bpha(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('pharma', nLevel)
    }

    applyEffect_bhst(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('hasted', nLevel)
    }

    applyEffect_binv(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('invulnerable', nLevel)
    }

    applyEffect_bpow(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('power', nLevel)
    }

    applyEffect_bclk(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('invisible', nLevel)
    }

    applyEffect_besp(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('esp', nLevel)
    }

    applyEffect_bxhp(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('vitality', nLevel * this.VITALITY_FACTOR)
    }

    applyEffect_blck(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('luck', nLevel)
    }

    applyEffect_bxmp(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('energy', nLevel * this.ENERGY_FACTOR)
    }

    applyEffect_bsfc(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('foodc', -nLevel)
    }

    applyEffect_bref(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('reflect', nLevel)
    }

    applyEffect_disp(oCreature, sEffect) {
        var aEffects = this.selectEffects(oCreature, this.selectEffects_expirable);
        var nLevel = this.getEffectLevel(sEffect);
        var iEffect, oEffToDisp;
        while (nLevel > 0 && aEffects.length > 0) {
            iEffect = MathTools.rnd(0, aEffects.length - 1);
            oEffToDisp = aEffects[iEffect];
            ArrayTools.removeItem(aEffects, i);
            oEffToDisp.expire();
            nLevel--
        }
    }

    applyEffect_sdrn(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('vampyre', nLevel)
    }

    runEffect_xphy(oCreature, sEffect) {
        this.damageCreature(oCreature, this.getEffectLevel(sEffect), 'drphysical')
    }

    runEffect_xmag(oCreature, sEffect) {
        this.damageCreature(oCreature, this.getEffectLevel(sEffect), 'drmagical')
    }

    runEffect_xfir(oCreature, sEffect) {
        this.damageCreature(oCreature, this.getEffectLevel(sEffect), 'drfire')
    }

    runEffect_xcld(oCreature, sEffect) {
        this.damageCreature(oCreature, this.getEffectLevel(sEffect), 'drcold')
    }

    runEffect_xele(oCreature, sEffect) {
        this.damageCreature(oCreature, this.getEffectLevel(sEffect), 'drelectricity')
    }

    runEffect_xtox(oCreature, sEffect) {
        this.damageCreature(oCreature, this.getEffectLevel(sEffect), 'drtoxic')
    }

    runEffect_xene(oCreature, sEffect) {
        this.depleteCreatureEnergy(oCreature, this.getEffectLevel(sEffect))
    }

    runEffect_xfdp(oCreature, sEffect) {
        this.starveCreature(oCreature, this.getEffectLevel(sEffect))
    }

    runEffect_rhea(oCreature, sEffect) {
        this.healCreature(oCreature, this.getEffectLevel(sEffect))
    }

    runEffect_rene(oCreature, sEffect) {
        this.restoreCreatureEnergy(oCreature, this.getEffectLevel(sEffect))
    }

    runEffect_rfdp(oCreature, sEffect) {
        this.feedCreature(oCreature, this.getEffectLevel(sEffect))
    }

    expireEffect_asnr(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('snared', -nLevel)
    }

    expireEffect_aroo(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('rooted', -nLevel)
    }

    expireEffect_avul(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('vulnerable', -nLevel)
    }

    expireEffect_aill(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('disease', -nLevel)
    }

    expireEffect_acnf(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('confused', -nLevel)
    }

    expireEffect_abld(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('blind', -nLevel)
    }

    expireEffect_ahld(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('held', -nLevel)
    }

    expireEffect_awea(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('power', nLevel)
    }

    expireEffect_adhp(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('vitality', nLevel)
    }

    expireEffect_admp(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('energy', nLevel)
    }

    expireEffect_ahun(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('foodc', -nLevel)
    }

    expireEffect_rphy(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('drphysical', -nLevel)
    }

    expireEffect_rmag(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('drmagical', -nLevel)
    }

    expireEffect_rfir(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('drfire', -nLevel)
    }

    expireEffect_rcld(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('drcold', -nLevel)
    }

    expireEffect_rele(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('drelectricity', -nLevel)
    }

    expireEffect_rtox(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('drtoxic', -nLevel)
    }

    exprireEffect_rdth(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('drdeath', -nLevel)
    }

    expireEffect_bpha(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('pharma', -nLevel)
    }

    expireEffect_bhst(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('hasted', -nLevel)
    }

    expireEffect_binv(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('invulnerable', -nLevel)
    }

    expireEffect_bpow(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('power', -nLevel)
    }

    expireEffect_bclk(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('invisible', -nLevel)
    }

    expireEffect_besp(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('esp', -nLevel)
    }

    expireEffect_bxhp(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('vitality', 0 - (nLevel * this.VITALITY_FACTOR));
        this.checkCreatureAlive(oCreature)
    }

    expireEffect_blck(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('luck', -nLevel)
    }

    expireEffect_bxmp(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('energy', 0 - (nLevel * this.ENERGY_FACTOR))
    }

    expireEffect_bsfc(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('foodc', nLevel)
    }

    expireEffect_bref(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('reflect', -nLevel)
    }

    expireEffect_rant(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('antidote', -nLevel)
    }

    exprireEffect_rbod(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('health', -nLevel)
    }

    exprireEffect_rmin(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('clearmind', -nLevel)
    }

    exprireEffect_rmov(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('freedom', -nLevel)
    }

    expireEffect_xdth(oCreature, sEffect) {
        this.damageCreature(oCreature, oCreature.getAttribute('vitality'), 'drdeath')
    }

    expireEffect_vfir(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('drfire', nLevel)
    }

    expireEffect_vcld(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('drcold', nLevel)
    }

    expireEffect_vele(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('drelectricity', nLevel)
    }

    expireEffect_vtox(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('drtoxic', nLevel)
    }

    expireEffect_vphy(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('drphysical', nLevel)
    }

    expireEffect_vmag(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('drmagical', nLevel)
    }

    expireEffect_sdrn(oCreature, sEffect) {
        var nLevel = this.getEffectLevel(sEffect);
        oCreature.modifyAttribute('vampyre', -nLevel)
    }
});
Object.assign(EffectProcessor.prototype, {
    DAMAGE_FACTOR_PHYSICAL: 6,
    DAMAGE_FACTOR_MAGICAL: 6,
    DAMAGE_FACTOR_COLD: 6,
    DAMAGE_FACTOR_FIRE: 6,
    DAMAGE_FACTOR_ELECTRICITY: 6,
    DAMAGE_FACTOR_TOXIC: 6,
    HEAL_FACTOR: 6,
    ENERGY_FACTOR: 10,
    VITALITY_FACTOR: 10,
    FOOD_FACTOR: 100,
    MAX_LEVEL: 63,
    BUFF_FACTOR: null,
    VULNER_FACTOR: null,
    DEBUFF_FACTOR: null,
    RESIST_FACTOR: null,
    EFFECT_NULL: 'snullAA',
    EFFECT_TYPE_POTION: 'b',
    EFFECT_TYPE_CHARM: 'h',
    EFFECT_TYPE_MISSILE: 'm',
    EFFECT_TYPE_ATTACK: 'x',
    EFFECT_TYPE_POISON: 'p',
    EFFECT_TYPE_CURSE: 'c',
    EFFECT_TYPE_ITEM: 'i',
    EFFECT_TYPE_NATURAL: 'n',
    EFFECT_NON_STACKABLE: 'bhmx'
});
