O2.createObject('StealerThinker', class StealerThinker extends MobThinker {
    _follow(nTime) {
        if ((nTime % this.TIME_REACTIVITY) === 0) {}
        for (var i = 0; i < 3; i++) {
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
        var oCreature = oMobile.getData('creature');
        if ('inventory' in oCreature.oExtraData) {
            var nLevel = this.oCreature.oExtraData.level;
            var oInv = oCreature.oExtraData.inventory;
            var nSize = oInv.getSize();
            var oItem;
            var oWantedTypes = {
                ring: [],
                earings: [],
                amulet: [],
                misc: []
            };
            for (var iItem = 0; iItem < nSize; iItem++) {
                oItem = oInv.aBagSlots[iItem];
                if (oItem) {
                    if (oItem.type in oWantedTypes) {
                        oWantedTypes[oItem.type].push(oItem)
                    }
                }
            }
            var nChoice = MathTools.rnd(0, 9);
            var sChosenType;
            switch (nChoice) {
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                    sChosenType = 'misc';
                    break;
                case 7:
                    sChosenType = 'ring';
                    break;
                case 8:
                    sChosenType = 'earings';
                    break;
                case 9:
                    sChosenType = 'amulet';
                    break;
                default:
                    sChosenType = ''
            }
            oItem = MathTools.rndChoose(oWantedTypes[sChosenType]);
            if (oItem) {
                var nStolen = MathTools.rnd(1, nLevel);
                oInv.removeItem(oItem, nStolen);
                if (oItem.isEquippable()) {
                    this.oCreature.oExtraData.inventory.defineEquipSlot(oItem.slot);
                    this.oGame.gc_equipItem(this.oMobile, oItem)
                }
                if (oCreature == G.oDungeon.getPlayerCreature()) {
                    var sItem = oItem.getName(nStolen);
                    this.oGame.sys_notify('item_steal', [sItem])
                }
            }
        }
    }
});
Object.assign(StealerThinker.prototype, {
    nStealCount: 1
});
