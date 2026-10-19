import { MobThinker } from './MobThinker.js';
import { STRINGS } from '../data/STRINGS.js';
import { MathTools } from '../../libraries/Raycaster/Tools/MathTools.js';

// chances relatives de chaque catégorie volée
const STEAL_WEIGHTS = {
    misc: 7,
    ring: 2,
    earings: 1
};

export class StealerThinker extends MobThinker {
    constructor() {
        super();
        this.nStealCount = 1
    }

    _follow(nTime) {
        // comme le Rusher : se réoriente vers sa cible à chaque réaction
        if ((nTime % this.TIME_REACTIVITY) === 0) {
            this.chaseTarget(this.getTarget())
        }
        for (let i = 0; i < 3; i++) {
            switch (this.move()) {
                case this.COLLISION_TARGET:
                    if (this.getTarget() == this.oMobile.oMobileCollision) {
                        this.steal(this.oMobile.oMobileCollision)
                    }
                    this.oGame.gc_attack(this.oMobile, 0);
                    this.setAttackMode();
                    break;
                case this.COLLISION_WALL_X:
                case this.COLLISION_WALL_Y:
                case this.COLLISION_MOBILE:
                    this.setWanderMode();
                    break
            }
        }
    }

    _attack(nTime) {
        this.oGame.gc_attack(this.oMobile, 0);
        this.steal(this.oMobile.oMobileCollision);
        this.setWanderMode()
    }

    steal(oMobile) {
        if (this.nStealCount <= 0) {
            return
        }
        this.nStealCount--;
        const oCreature = oMobile.getData('creature');
        if (!('inventory' in oCreature.oExtraData)) {
            return
        }
        const oInv = oCreature.oExtraData.inventory;
        // objets du sac (pas l'équipement) par catégorie ; les amulettes sont
        // de type « ring », comme les anneaux
        const oWanted = {
            misc: [],
            ring: [],
            earings: []
        };
        let oItem;
        for (let iItem = 0; iItem < oInv.getSize(); iItem++) {
            oItem = oInv.aBagSlots[iItem];
            if (oItem && oItem.type in oWanted) {
                oWanted[oItem.type].push(oItem)
            }
        }
        // tirage pondéré parmi les catégories que la victime possède : on ne
        // gâche pas l'unique tentative sur une catégorie vide
        const aTypes = Object.keys(oWanted).filter((s) => oWanted[s].length > 0);
        if (aTypes.length === 0) {
            return
        }
        const nTotal = aTypes.reduce((n, s) => n + STEAL_WEIGHTS[s], 0);
        let nPick = MathTools.rnd(1, nTotal);
        const sChosenType = aTypes.find((s) => (nPick -= STEAL_WEIGHTS[s]) <= 0);
        oItem = MathTools.rndChoose(oWanted[sChosenType]);
        // une pile (l'or) : 10 à 25 % de la pile, au moins 1
        const nStolen = oItem.isStackable()
            ? Math.max(1, oItem.stackcount * MathTools.rnd(10, 25) / 100 | 0)
            : 1;
        oInv.removeItem(oItem, nStolen);
        if (oItem.isEquippable()) {
            this.oCreature.oExtraData.inventory.defineEquipSlot(oItem.slot);
            this.oGame.gc_equipItem(this.oMobile, oItem)
        }
        if (oCreature == this.oGame.oDungeon.getPlayerCreature()) {
            // « Un corbeau vous a volé Or x 20. »
            this.oGame.sys_notify('item_steal', [this.getThiefName(), oItem.identified ? oItem.name : oItem.uname, String(nStolen)])
        }
    }

    // clé du nom du voleur, traduite par sys_notify
    getThiefName() {
        const sKey = 'mob_' + this.oMobile.oSprite.oBlueprint.sId;
        return '~' + (sKey in STRINGS.l ? sKey : 'mob_thief')
    }
}
