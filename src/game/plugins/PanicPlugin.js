import { UI } from '../UI/UI.js';
import { KEYS } from '../../libraries/Raycaster/KEYS.js';

/**
 * Bouton panique (touche H) : dans l'ordre,
 * 1) un antidote si le joueur est empoisonné ;
 * 2) la potion de soin la mieux adaptée aux points de vie perdus ;
 * 3) la potion d'énergie la mieux adaptée à l'énergie dépensée ;
 * 4) un repas complet si la nourriture est à 0.
 * Un seul objet de chaque sorte ; un message résume ce qui a été pris.
 */
export class PanicPlugin {
    oGame = null;

    key(nKey) {
        if (this.oGame.nIntfMode != UI.INTFMODE_NONE || nKey != KEYS._INT_PANIC) {
            return false
        }
        this.panic();
        return true
    }

    panic() {
        const oPlayer = this.oGame.getPlayer();
        const oCreature = this.oGame.oDungeon.getPlayerCreature();
        if (oCreature.getAttribute('dead') > 0) {
            return
        }
        const ep = this.oGame.oDungeon.oEffectProcessor;
        const aBag = this.oGame.oDungeon.getCreatureInventory(oCreature).aBagSlots.filter((oItem) => oItem !== null);
        const aUsed = [];
        const use = (oItem) => {
            if (oItem) {
                aUsed.push(oItem);
                this.oGame.gc_useItem(oPlayer, oItem)
            }
        };
        // 1) antidote
        const bPoisoned = oCreature.oEffects.some((oEffect) =>
            !oEffect.hasExpired() && ep.getEffectType(oEffect.sEffect) === ep.EFFECT_TYPE_POISON);
        if (bPoisoned) {
            use(aBag.find((oItem) => oItem.type === 'potion' && this.hasProperty(oItem, 'rant')))
        }
        // 2) soin : l'attribut hp compte les points de vie perdus
        use(this.choosePotion(aBag, 'rhea', ep.HEAL_FACTOR, oCreature.getAttribute('hp')));
        // 3) énergie : l'attribut mp compte l'énergie dépensée
        use(this.choosePotion(aBag, 'rene', ep.ENERGY_FACTOR, oCreature.getAttribute('mp')));
        // 4) repas, si la jauge affichée (foodp / 10) est à 0
        if ((oCreature.getAttribute('foodp') / 10 | 0) === 0) {
            use(aBag.find((oItem) => oItem.resref === 'ccc_meal'))
        }
        if (aUsed.length) {
            this.oGame.sys_notify('panic_used', [aUsed.map((oItem) => oItem.name).join(', ')], aUsed[0].icon)
        } else {
            this.oGame.sys_notify('panic_nothing')
        }
    }

    hasProperty(oItem, sSubType) {
        return (oItem.properties || []).some((sProp) => sProp.substr(1, 4) === sSubType)
    }

    /** points rendus d'un coup (durée nulle) par une potion, pour un effet donné */
    instantAmount(oItem, sSubType, nFactor) {
        const ep = this.oGame.oDungeon.oEffectProcessor;
        return (oItem.properties || [])
            .filter((sProp) => ep.getEffectSubType(sProp) === sSubType && ep.getEffectDuration(sProp) === 0)
            .reduce((n, sProp) => n + ep.getEffectLevel(sProp) * nFactor, 0)
    }

    /**
     * La plus forte potion qui ne dépasse pas les points perdus ; à défaut, la
     * plus faible, si les points perdus en valent au moins la moitié (sinon
     * on garde la potion).
     */
    choosePotion(aBag, sSubType, nFactor, nMissing) {
        if (nMissing <= 0) {
            return null
        }
        const aPotions = aBag
            .filter((oItem) => oItem.type === 'potion')
            .map((oItem) => ({ item: oItem, amount: this.instantAmount(oItem, sSubType, nFactor) }))
            .filter((o) => o.amount > 0)
            .sort((a, b) => a.amount - b.amount);
        if (!aPotions.length) {
            return null
        }
        const aFitting = aPotions.filter((o) => o.amount <= nMissing);
        if (aFitting.length) {
            return aFitting[aFitting.length - 1].item
        }
        return nMissing * 2 >= aPotions[0].amount ? aPotions[0].item : null
    }

    setGame(g) {
        this.oGame = g;
        this.oGame.registerPluginSignal('key', this)
    }
}
