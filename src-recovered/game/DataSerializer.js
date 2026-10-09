import { Creature } from './GC/Creature.js';
import { Effect } from './GC/Effect.js';
import { Inventory } from './GC/Inventory.js';
import { Item } from './Item.js';
import { Marker } from '../libraries/O876/Marker.js';

export class DataSerializer {
    save(oGame) {
        oGame.buildDungeonData();
        const oData = {};
        const oPlayer = oGame.oDungeon.oData.player;
        const oPlayerMobile = oGame.oRaycaster.oHorde.getMobile(0);
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
        let x = '', y = '', oGX;
        const aDoors = [];
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
        let x = '', y = '', aItems, iStack, aStack;
        const aData = [], aNullEffects = [];
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
        let x, y, iItem, aItems, oItem, aStack;
        const aNullEffects = [], oRegister = Marker.create();
        for (let iStack = 0; iStack < aData.length; iStack++) {
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
        const oData = {};
        for (const i in oHorde) {
            oData[i] = this.saveCreature(oHorde[i])
        }
        return oData
    }

    restoreCreatures(oData, oGame) {
        if (oData === null) {
            return null
        }
        const oHorde = {};
        for (const i in oData) {
            oHorde[i] = this.restoreCreature(oData[i], oGame)
        }
        return oHorde
    }

    saveCreature(oCreature) {
        if (oCreature === null) {
            return null
        }
        const oData = {
            attrb: oCreature.oBaseAttributes,
            attrm: oCreature.oAttributes,
            retrigger: oCreature.oExtraData.retrigger,
            level: oCreature.oExtraData.level,
            craft: oCreature.oExtraData.craft,
            magic: oCreature.oExtraData.magic
        };
        const aCreaEff = [];
        for (let iEff = 0; iEff < oCreature.oEffects.length; iEff++) {
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
        const oCreature = new Creature();
        oCreature.setEffectProcessor(oGame.oDungeon.oEffectProcessor);
        oCreature.oBaseAttributes = oData.attrb;
        oCreature.oAttributes = oData.attrm;
        for (let iEff = 0; iEff < oData.effects.length; iEff++) {
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
        const oEffect = new Effect();
        oEffect.sEffect = oData[0];
        oEffect.nTimeOut = oData[1];
        oEffect.bExpirable = oData[2];
        return oEffect
    }

    saveInventory(oInventory, aEffects) {
        const nSize = oInventory.getSize();
        const aEquip = [];
        const aBag = [];
        for (const sSlot in oInventory.oEquipSlots) {
            aEquip.push(sSlot);
            aEquip.push(this.saveItem(oInventory.oEquipSlots[sSlot], aEffects))
        }
        for (let iSlot = 0; iSlot < nSize; iSlot++) {
            if (oInventory.aBagSlots[iSlot] !== null) {
                aBag.push(this.saveItem(oInventory.aBagSlots[iSlot], aEffects))
            } else {
                aBag.push(null)
            }
        }
        return [nSize, aEquip, aBag]
    }

    restoreInventory(oData, aEffects) {
        const oInventory = new Inventory();
        const nSize = oData[0];
        const aEquip = oData[1];
        const aBag = oData[2];
        let i;
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
        const aDataEffects = [];
        let nEffectRank;
        for (let i = 0; i < oItem.effects.length; i++) {
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
        const sResRef = oData[0];
        const bIdentified = oData[1];
        const nStackCount = oData[2];
        const aDataEffects = oData[3];
        const oItem = new Item(sResRef, nStackCount);
        oItem.identified = bIdentified;
        let oItemEffect;
        for (let i = 0; i < aDataEffects.length; i++) {
            oItemEffect = aEffects[aDataEffects[i]];
            oItem.effects.push(oItemEffect)
        }
        return oItem
    }
}
