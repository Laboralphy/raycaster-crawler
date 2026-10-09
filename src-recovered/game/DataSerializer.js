O2.createObject('DataSerializer', class DataSerializer {
    save(oGame) {
        oGame.buildDungeonData();
        var oData = {};
        var oPlayer = oGame.oDungeon.oData.player;
        var oPlayerMobile = oGame.oRaycaster.oHorde.getMobile(0);
        oData.p = {
            l: {
                a: oPlayer.location.area,
                f: oPlayer.location.floor
            },
            c: this.saveCreature(oPlayer.creature),
            k: oPlayer.keys,
            p: {
                x: oPlayerMobile.x,
                y: oPlayerMobile.y,
                angle: oPlayerMobile.fTheta
            },
            v: oGame.oAdventure.oVariables,
            t: oGame.nTime
        };
        oData.w = {
            c: this.saveCreatures(oGame.oDungeon.getHorde()),
            o: oGame.oDungeon.getObjects(),
            a: oGame.oDungeon.getArea(),
            d: this.saveOpenDoors(oGame.oRaycaster.oDoors),
            r: this.saveDropStacks(oGame.oDungeon.getDropStacks())
        };
        return oData
    }

    restore(oGame, oData) {
        if ('p' in oData) {
            oGame.oDungeon.resetData();
            oGame.oDungeon.oData.player.creature = this.restoreCreature(oData.p.c, oGame);
            oGame.oDungeon.setPlayerLocation(oData.p.l.a, oData.p.l.f, 0);
            oGame.oDungeon.oData.player.keys = oData.p.k;
            oGame.oWeaponInUse = oGame.oDungeon.getCreatureEquippedWeapon(oGame.oDungeon.oData.player.creature);
            oGame.nTime = oData.p.t;
            oGame.nTimeMs = oData.p.t * oGame.TIME_FACTOR;
            oGame.oAdventure.oVariables = oData.p.v
        }
        if ('w' in oData) {
            oGame.oDungeon.setHorde(this.restoreCreatures(oData.w.c, oGame));
            oGame.oDungeon.setObjects(oData.w.o);
            oGame.oDungeon.defineArea(oData.w.a);
            oGame.oDungeon.setOpenDoors(oData.w.d);
            oGame.oDungeon.setDropStacks(this.restoreDropStacks(oData.w.r))
        }
    }

    saveOpenDoors(oRegister) {
        var x = '',
            y = '',
            oGX, aDoors = [];
        for (x in oRegister) {
            for (y in oRegister[x]) {
                oGX = oRegister[x][y];
                if (typeof oGX == 'object' && oGX !== null && oGX.sClass == 'Door') {
                    aDoors.push({
                        x: x | 0,
                        y: y | 0,
                        t: oGX.nTime | 0,
                        p: oGX.nPhase | 0
                    })
                }
            }
        }
        return aDoors
    }

    saveDropStacks(oRegister) {
        var x = '',
            y = '',
            aItems, iStack, aStack, aData = [],
            aNullEffects = [];
        for (x in oRegister) {
            for (y in oRegister[x]) {
                aStack = oRegister[x][y];
                aItems = [];
                for (iStack = 0; iStack < aStack.length; iStack++) {
                    aItems.push(this.saveItem(aStack[iStack], aNullEffects))
                }
                aData.push([x, y, aItems])
            }
        }
        return aData
    }

    restoreDropStacks(aData) {
        var x, y, iItem, aItems, oItem, aStack, aNullEffects = [],
            oRegister = Marker.create();
        for (var iStack = 0; iStack < aData.length; iStack++) {
            x = aData[iStack][0];
            y = aData[iStack][1];
            aItems = aData[iStack][2];
            aStack = [];
            for (iItem = 0; iItem < aItems.length; iItem++) {
                oItem = this.restoreItem(aItems[iItem], aNullEffects);
                aStack.push(oItem)
            }
            Marker.markXY(oRegister, x, y, aStack)
        }
        return oRegister
    }

    saveCreatures(oHorde) {
        if (oHorde === null) {
            return null
        }
        var oData = {};
        for (var i in oHorde) {
            oData[i] = this.saveCreature(oHorde[i])
        }
        return oData
    }

    restoreCreatures(oData, oGame) {
        if (oData === null) {
            return null
        }
        var oHorde = {};
        for (var i in oData) {
            oHorde[i] = this.restoreCreature(oData[i], oGame)
        }
        return oHorde
    }

    saveCreature(oCreature) {
        if (oCreature === null) {
            return null
        }
        var oData = {
            attrb: oCreature.oBaseAttributes,
            attrm: oCreature.oAttributes,
            retrigger: oCreature.oExtraData.retrigger,
            level: oCreature.oExtraData.level,
            craft: oCreature.oExtraData.craft,
            magic: oCreature.oExtraData.magic
        };
        var aCreaEff = [];
        for (var iEff = 0; iEff < oCreature.oEffects.length; iEff++) {
            aCreaEff.push(this.saveEffect(oCreature.oEffects[iEff]))
        }
        oData.effects = aCreaEff;
        oData.inventory = this.saveInventory(oCreature.oExtraData.inventory, oCreature.oEffects);
        return oData
    }

    restoreCreature(oData, oGame) {
        if (oData === null) {
            return null
        }
        var oCreature = new GC.Creature();
        oCreature.setEffectProcessor(oGame.oDungeon.oEffectProcessor);
        oCreature.oBaseAttributes = oData.attrb;
        oCreature.oAttributes = oData.attrm;
        for (var iEff = 0; iEff < oData.effects.length; iEff++) {
            oCreature.oEffects.push(this.restoreEffect(oData.effects[iEff]))
        }
        oCreature.oExtraData.craft = oData.craft;
        oCreature.oExtraData.level = oData.level;
        oCreature.oExtraData.retrigger = oData.retrigger;
        oCreature.oExtraData.magic = oData.magic;
        oCreature.oExtraData.inventory = this.restoreInventory(oData.inventory, oCreature.oEffects);
        return oCreature
    }

    saveEffect(oEffect) {
        return [oEffect.sEffect, oEffect.nTimeOut, oEffect.bExpirable]
    }

    restoreEffect(oData) {
        var oEffect = new GC.Effect();
        oEffect.sEffect = oData[0];
        oEffect.nTimeOut = oData[1];
        oEffect.bExpirable = oData[2];
        return oEffect
    }

    saveInventory(oInventory, aEffects) {
        var nSize = oInventory.getSize();
        var aEquip = [];
        var aBag = [];
        for (var sSlot in oInventory.oEquipSlots) {
            aEquip.push(sSlot);
            aEquip.push(this.saveItem(oInventory.oEquipSlots[sSlot], aEffects))
        }
        for (var iSlot = 0; iSlot < nSize; iSlot++) {
            if (oInventory.aBagSlots[iSlot] !== null) {
                aBag.push(this.saveItem(oInventory.aBagSlots[iSlot], aEffects))
            } else {
                aBag.push(null)
            }
        }
        return [nSize, aEquip, aBag]
    }

    restoreInventory(oData, aEffects) {
        var oInventory = new GC.Inventory();
        var nSize = oData[0];
        var aEquip = oData[1];
        var aBag = oData[2];
        var i;
        oInventory.setSize(nSize);
        for (i = 0; i < aEquip.length; i += 2) {
            oInventory.oEquipSlots[aEquip[i]] = this.restoreItem(aEquip[i + 1], aEffects)
        }
        for (i = 0; i < aBag.length; i++) {
            oInventory.aBagSlots[i] = this.restoreItem(aBag[i], aEffects)
        }
        return oInventory
    }

    saveItem(oItem, aEffects) {
        if (oItem === null) {
            return null
        }
        var aDataEffects = [];
        var nEffectRank;
        for (var i = 0; i < oItem.effects.length; i++) {
            nEffectRank = aEffects.indexOf(oItem.effects[i]);
            if (nEffectRank < 0) {
                throw new Error('serializer::saveItem: error in item effect loop')
            }
            aDataEffects.push(nEffectRank)
        }
        return [oItem.resref, oItem.identified, oItem.stackcount, aDataEffects]
    }

    restoreItem(oData, aEffects) {
        if (oData === null) {
            return null
        }
        var sResRef = oData[0];
        var bIdentified = oData[1];
        var nStackCount = oData[2];
        var aDataEffects = oData[3];
        var oItem = new Item(sResRef, nStackCount);
        oItem.identified = bIdentified;
        var oItemEffect;
        for (var i = 0; i < aDataEffects.length; i++) {
            oItemEffect = aEffects[aDataEffects[i]];
            oItem.effects.push(oItemEffect)
        }
        return oItem
    }
});
