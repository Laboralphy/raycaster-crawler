import { MobThinker } from './MobThinker.js';
import { MAGIC_DATA } from '../data/MAGIC_DATA.js';
import { MAGIC_DATA_PARAMS } from '../data/MAGIC_DATA_PARAMS.js';
import { SOUNDS } from '../data/SOUNDS.js';
import { MathTools } from '../../libraries/Raycaster/Tools/MathTools.js';

/**
 * Lanceur de sorts : garde ses distances (recule, tourne autour de la cible)
 * et lance ses sorts.
 *
 * Sorts de baguette : 40 % emplacement 0 (attaque immédiate), 30 % emplacement
 * 1, 20 % emplacement 2, 10 % emplacement 3 ; un emplacement absent de la
 * baguette se rabat sur l'attaque.
 *
 * Sorts de magie (MagicPlugin.spell<Nom>(oMobile), qui agissent sur celui qui
 * les lance) : dans MONSTERS_BLUEPRINTS, data.casts = [{ spell: 'Teleport',
 * chance: 25, cooldown: 'MEDIUM', time: 500 }]. À chaque sort, chacun est
 * tenté avant la baguette : chance en %, cooldown un nom de
 * MAGIC_DATA_PARAMS.COOLDOWN ou des millisecondes (par défaut la recharge du
 * sort), time l'incantation en millisecondes (par défaut 0).
 */
export class CasterThinker extends MobThinker {
    constructor() {
        super();
        this.nDodging = 3;
        this.nProbAttackStraf = 40;
        this.nProbAttackDodge = 33;
        this.sMagicCast = null;
        this.oMagicCastTimes = {}
    }

    castSpell() {
        this.sMagicCast = null;
        if (this.castMagic()) {
            return
        }
        const n = MathTools.rnd(0, 9);
        let iSlot = n < 4 ? 0 : n < 7 ? 1 : n < 9 ? 2 : 3;
        if (iSlot >= this.aCastTimes.length) {
            iSlot = 0
        }
        if (iSlot === 0) {
            this.setAttackMode()
        } else {
            this.setCastMode(iSlot)
        }
    }

    castMagic() {
        const aCasts = this.oMobile.getData('casts');
        if (!aCasts) {
            return false
        }
        const nTime = this.oGame.nTimeMs;
        for (const oCast of aCasts) {
            const nLast = this.oMagicCastTimes[oCast.spell];
            if (nLast !== undefined && nTime < nLast + this.getMagicCooldown(oCast)) {
                continue
            }
            if (MathTools.rnd(0, 99) >= oCast.chance) {
                continue
            }
            this.oMagicCastTimes[oCast.spell] = nTime;
            this.sMagicCast = oCast.spell;
            this.bAttacking = false;
            this.nCastingTime = (oCast.time | 0) + 1;
            this.setNextActionTime(this.nCastingTime);
            this.think = this.thinkCast;
            return true
        }
        return false
    }

    getMagicCooldown(oCast) {
        const x = oCast.cooldown;
        if (typeof x === 'string') {
            return MAGIC_DATA_PARAMS.COOLDOWN[x]
        }
        return typeof x === 'number' ? x : MAGIC_DATA[oCast.spell].cooldown
    }

    _follow(nTime) {
        let nCT = null;
        if (this.nDodging < 4) {
            nCT = this.move(this.nDodging)
        }
        if ((nTime % this.TIME_REACTIVITY) === 0) {
            this.chaseTarget(this.getTarget());
            const d = (this.distanceToTarget() | 0) >> 7;
            switch (d) {
                case 0:
                    this.nDodging = 3;
                    if (MathTools.rnd(0, 100) < this.nProbAttackDodge) {
                        this.castSpell()
                    }
                    break;
                case 1:
                case 2:
                    if (this.nDodging != 1 && this.nDodging != 2) {
                        this.nDodging = MathTools.rnd(1, 2)
                    }
                    if (MathTools.rnd(0, 100) < this.nProbAttackStraf) {
                        this.castSpell()
                    }
                    break;
                default:
                    this.nDodging = 0;
                    break
            }
            switch (nCT) {
                case this.COLLISION_WALL_X:
                case this.COLLISION_WALL_Y:
                    if (this.nDodging == 1) {
                        this.nDodging = 2
                    } else if (this.nDodging == 2) {
                        this.nDodging = 1
                    }
            }
        }
    }

    _cast(nTime) {
        this.chaseTarget(this.getTarget());
        if (this.sMagicCast !== null) {
            const sSpell = this.sMagicCast;
            this.sMagicCast = null;
            const m = this.oMobile;
            if (this.oGame.oMagicSystem['spell' + sSpell](m)) {
                this.oGame.sys_playSound(SOUNDS[MAGIC_DATA[sSpell].sound], m.x, m.y)
            }
            this.setPursuitMode();
            return
        }
        this.oGame.gc_attack(this.oMobile, this.nCastingTime);
        this.setSearchMode()
    }

    _attack(nTime) {
        this.oGame.gc_attack(this.oMobile, 0)
    }
}
