import { MAGIC_DATA } from '../data/MAGIC_DATA.js';
import { MAGIC_DATA_PARAMS } from '../data/MAGIC_DATA_PARAMS.js';
import { SOUNDS } from '../data/SOUNDS.js';

/**
 * Réaction d'un monstre blessé : un sort qu'il se lance à lui-même.
 *
 * Dans MONSTERS_BLUEPRINTS, data.onWound = { spell: 'Reflect' } : quand le
 * monstre perd de la santé (signal « damage »), il lance le sort, qui doit
 * agir sur celui qui le lance (MagicPlugin.spell<Nom>(oMobile), par exemple
 * Reflect ou DrainLife). Il attend ensuite la recharge avant de recommencer :
 * onWound.cooldown, un nom de MAGIC_DATA_PARAMS.COOLDOWN (SHORT, MEDIUM...)
 * ou un nombre de millisecondes ; par défaut, la recharge du sort (MAGIC_DATA).
 */
export class WoundPlugin {
    setGame(g) {
        this.oGame = g;
        this.oGame.registerPluginSignal('damage', this)
    }

    damage(oAttacker, oVictim, nAmount) {
        const oReaction = oVictim.getData('onWound');
        if (!oReaction) {
            return false
        }
        const oCreature = oVictim.getData('creature');
        if (!oCreature || oCreature.getAttribute('dead')) {
            return false
        }
        const sSpell = oReaction.spell;
        const md = MAGIC_DATA[sSpell];
        const nTime = this.oGame.nTimeMs;
        const oData = oCreature.oExtraData;
        const nCooldown = this.getCooldown(oReaction.cooldown, md.cooldown);
        if (oData.woundCast !== undefined && nTime < oData.woundCast + nCooldown) {
            return false
        }
        if (this.oGame.oMagicSystem['spell' + sSpell](oVictim)) {
            oData.woundCast = nTime;
            this.oGame.sys_playSound(SOUNDS[md.sound], oVictim.x, oVictim.y)
        }
        return false
    }

    getCooldown(xCooldown, nDefault) {
        if (typeof xCooldown === 'string') {
            return MAGIC_DATA_PARAMS.COOLDOWN[xCooldown]
        }
        return typeof xCooldown === 'number' ? xCooldown : nDefault
    }
}
Object.assign(WoundPlugin.prototype, {
    oGame: null
});
