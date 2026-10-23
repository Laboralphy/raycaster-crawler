import { EffectProcessor } from './EffectProcessor.js';
import { Creature } from './GC/Creature.js';
import { Inventory } from './GC/Inventory.js';
import { Item } from './Item.js';
import { SPELLS_DATA } from './data/SPELLS_DATA.js';
import { Marker } from '../libraries/O876/Marker.js';

export class Dungeon {
    constructor() {
        this.INVENTORY_SIZE_PLAYER = 32;
        this.INVENTORY_SIZE_CREATURE = 4;
        this.oData = null;
        this.oArea = null;
        this.oEffectProcessor = null;
        this.aStartingStuff = null;
        this.oWeapons = {};
        this.resetData();
        this.oData.player.creature = this.setupPlayerCreature(this.newCreature(1));
        this.oSpawnPoint = {
            x: 0,
            y: 0,
            angle: 0
        }
    }

    resetData() {
        this.oData = {
            player: {
                location: {
                    area: '',
                    floor: 0,
                    startpoint: 0
                },
                keys: {
                    generic: 0,
                    special: {}
                },
                creature: null
            },
            world: {},
            hordes: {},
            objects: {},
            opendoors: {},
            drops: {}
        };
        this.oEffectProcessor = new EffectProcessor()
    }

    newCreature(nLevel) {
        const oCreature = new Creature();
        oCreature.setEffectProcessor(this.oEffectProcessor);
        if (nLevel === undefined) {
            nLevel = 1
        }
        oCreature.oExtraData = {
            retrigger: 0,
            inventory: new Inventory(),
            level: nLevel,
            magic: {
                cooldown: {},
                // sorts appris dans les bibliothèques (BookPlugin.readShelf)
                book: []
            }
        };
        return oCreature
    }

    setupPlayerCreature(oCreature) {
        const c = oCreature;
        const i = c.oExtraData.inventory;
        c.setBaseAttribute('vitality', 100);
        c.setBaseAttribute('energy', 100);
        c.setBaseAttribute('speed', 160);
        c.setBaseAttribute('foodmax', 1000);
        c.setBaseAttribute('foodc', 10);
        c.modifyAttribute('foodp', 1000);
        i.setSize(this.INVENTORY_SIZE_PLAYER);
        i.defineEquipSlot('hand');
        i.defineEquipSlot('neck');
        i.defineEquipSlot('finger');
        i.defineEquipSlot('ears');
        this.aStartingStuff = ['wand_yce_1', 'dag_steel', 'pot_heal_2', 'pot_heal_2', 'pot_ether_2', 'ccc_h2o', 'ccc_h2o'];
        let oItem = null;
        for (let iStuff = 0; iStuff < this.aStartingStuff.length; iStuff++) {
            oItem = new Item(this.aStartingStuff[iStuff]);
            this.pickupItem(c, oItem);
            if (oItem.slot && i.oEquipSlots[oItem.slot] === null) {
                this.equipItem(c, oItem)
            }
        }
        c.oExtraData.craft = ['pot_heal_1', 'pot_ether_1', 'ccc_meal'];
        // bibliothèques déjà étudiées : clé 'zone-étage-x-y'
        c.oExtraData.shelves = {};
        return oCreature
    }

    learnCraft(oCreature, sCraftRecipe) {
        if (oCreature.oExtraData.craft.indexOf(sCraftRecipe) < 0) {
            oCreature.oExtraData.craft.push(sCraftRecipe)
        }
    }

    getItemLevel(oItem) {
        const aProperties = oItem.getProperties();
        return this.oEffectProcessor.getLevelFromEffects(aProperties)
    }

    setupMobCreature(oCreature, oMobile) {
        const sWeapon = oMobile.getData('weapon');
        const oWeapon = new Item(sWeapon);
        const oInv = oCreature.oExtraData.inventory;
        oInv.setSize(this.INVENTORY_SIZE_CREATURE);
        oInv.defineEquipSlot('hand');
        oInv.addItem(oWeapon);
        oInv.equipItem(oWeapon, 'hand');
        const nLevel = oCreature.oExtraData.level;
        const aProp = oMobile.getData('properties');
        if (aProp) {
            const nPropCount = aProp.length;
            let sProp;
            const ep = this.oEffectProcessor;
            for (let iProp = 0; iProp < nPropCount; iProp++) {
                sProp = aProp[iProp];
                sProp = ep.setEffectLevel(sProp, ep.getEffectLevel(sProp) + nLevel);
                this.oEffectProcessor.applyEffect(oCreature, sProp, null)
            }
        }
        let iFlag;
        const sFlags = oMobile.getData('flags');
        for (iFlag = 0; iFlag < sFlags.length; iFlag++) {
            switch (sFlags[iFlag]) {
                case 'B':
                    oCreature.setBaseAttribute('f_boss', 1);
                    break
            }
        }
        oCreature.setBaseAttribute('vitality', nLevel * oMobile.getData('vitality'));
        oCreature.setBaseAttribute('power', nLevel * oMobile.getData('power'));
        oCreature.setBaseAttribute('speed', oMobile.getData('speed'));
        oCreature.setBaseAttribute('hp', 0);
        return oCreature
    }

    defineArea(aMap) {
        const sArea = this.getPlayerLocationArea();
        const nFloor = this.getPlayerLocationFloor();
        this.oArea = this.oData.world[sArea][nFloor] = aMap
    }

    getAreaBlockProperty(x, y) {
        return this.oArea[y][x]
    }

    setAreaBlockProperty(x, y, nProperty) {
        this.oArea[y][x] = nProperty
    }

    getArea() {
        return this.oArea
    }

    getHorde() {
        const sArea = this.getPlayerLocationArea();
        const nFloor = this.getPlayerLocationFloor();
        if (!(sArea in this.oData.hordes)) {
            return null
        }
        if (this.oData.hordes[sArea][nFloor] === undefined) {
            return null
        }
        return this.oData.hordes[sArea][nFloor]
    }

    setHorde(h) {
        const sArea = this.getPlayerLocationArea();
        const nFloor = this.getPlayerLocationFloor();
        if (!(sArea in this.oData.hordes)) {
            this.oData.hordes[sArea] = []
        }
        this.oData.hordes[sArea][nFloor] = h
    }

    getObjects() {
        const sArea = this.getPlayerLocationArea();
        const nFloor = this.getPlayerLocationFloor();
        if (!(sArea in this.oData.objects)) {
            this.oData.objects[sArea] = []
        }
        return this.oData.objects[sArea][nFloor]
    }

    setObjects(o) {
        const sArea = this.getPlayerLocationArea();
        const nFloor = this.getPlayerLocationFloor();
        if (!(sArea in this.oData.objects)) {
            this.oData.objects[sArea] = []
        }
        this.oData.objects[sArea][nFloor] = o
    }

    getOpenDoors() {
        const sArea = this.getPlayerLocationArea();
        const nFloor = this.getPlayerLocationFloor();
        if (!(sArea in this.oData.opendoors)) {
            this.oData.opendoors[sArea] = []
        }
        if (this.oData.opendoors[sArea][nFloor] === undefined) {
            this.oData.opendoors[sArea][nFloor] = []
        }
        return this.oData.opendoors[sArea][nFloor]
    }

    setOpenDoors(oRegister) {
        const sArea = this.getPlayerLocationArea();
        const nFloor = this.getPlayerLocationFloor();
        if (!(sArea in this.oData.opendoors)) {
            this.oData.opendoors[sArea] = []
        }
        this.oData.opendoors[sArea][nFloor] = oRegister
    }

    getDropStack(x, y) {
        const sArea = this.getPlayerLocationArea();
        const nFloor = this.getPlayerLocationFloor();
        if (!(sArea in this.oData.drops)) {
            this.oData.drops[sArea] = []
        }
        if (this.oData.drops[sArea][nFloor] === undefined) {
            this.oData.drops[sArea][nFloor] = Marker.create()
        }
        return Marker.getMarkXY(this.oData.drops[sArea][nFloor], x, y)
    }

    getDropStacks() {
        const sArea = this.getPlayerLocationArea();
        const nFloor = this.getPlayerLocationFloor();
        if (!(sArea in this.oData.drops)) {
            this.oData.drops[sArea] = []
        }
        if (this.oData.drops[sArea][nFloor] === undefined) {
            this.oData.drops[sArea][nFloor] = []
        }
        return this.oData.drops[sArea][nFloor]
    }

    setDropStacks(oData) {
        const sArea = this.getPlayerLocationArea();
        const nFloor = this.getPlayerLocationFloor();
        if (!(sArea in this.oData.drops)) {
            this.oData.drops[sArea] = []
        }
        this.oData.drops[sArea][nFloor] = oData
    }

    addDrop(x, y, oItem) {
        if (typeof oItem == 'string') {
            oItem = new Item(oItem)
        }
        const sArea = this.getPlayerLocationArea();
        const nFloor = this.getPlayerLocationFloor();
        let oDrops = this.getDropStack(x, y);
        if (!oDrops) {
            oDrops = [];
            Marker.markXY(this.oData.drops[sArea][nFloor], x, y, oDrops)
        }
        oDrops.push(oItem)
    }

    peekDrop(x, y) {
        const aDrops = this.getDropStack(x, y);
        if (!aDrops) {
            return null
        }
        if (aDrops.length) {
            return aDrops[0]
        }
        return null
    }

    pickupDrop(oCreature, x, y) {
        const aDrops = this.getDropStack(x, y);
        if (!aDrops) {
            return null
        }
        if (aDrops.length) {
            const oItem = aDrops[0];
            if (this.pickupItem(oCreature, oItem)) {
                aDrops.shift();
                return oItem
            }
        }
        return null
    }

    setPlayerLocation(sArea, nFloor, nStartPoint) {
        this.oData.player.location.area = sArea;
        this.oData.player.location.floor = nFloor;
        this.oData.player.location.startpoint = nStartPoint;
        if (!(sArea in this.oData.world)) {
            this.oData.world[sArea] = []
        }
        if (nFloor < this.oData.world[sArea].length && nFloor >= 0) {
            this.oArea = this.oData.world[sArea][nFloor]
        } else {
            this.oArea = null
        }
    }

    setPlayerSpawnPoint(x, y, fAngle) {
        this.oSpawnPoint.x = x;
        this.oSpawnPoint.y = y;
        this.oSpawnPoint.angle = fAngle
    }

    getPlayerSpawnPoint() {
        return this.oSpawnPoint
    }

    getPlayerLocationArea() {
        return this.oData.player.location.area
    }

    getPlayerLocationFloor() {
        return this.oData.player.location.floor
    }

    getPlayerLocationStartPoint() {
        return this.oData.player.location.startpoint
    }

    pickupItem(oCreature, oItem) {
        return this.getCreatureInventory(oCreature).addItem(oItem)
    }

    equipItem(oCreature, oItem) {
        let iEff, nEffCount, oEffect;
        const oRemovedItem = this.getCreatureInventory(oCreature).equipItem(oItem, oItem.slot);
        if (oRemovedItem) {
            this.removeItemEffects(oCreature, oRemovedItem)
        }
        if (oItem) {
            if (oItem.properties) {
                nEffCount = oItem.properties.length;
                for (iEff = 0; iEff < nEffCount; iEff++) {
                    oEffect = this.oEffectProcessor.applyEffect(oCreature, oItem.properties[iEff], null);
                    if (oEffect) {
                        oItem.effects.push(oEffect)
                    }
                }
            }
        }
    }

    /**
     * Range dans le sac l'objet porté à cet emplacement et retire ses effets.
     * Renvoie l'objet, ou null si l'emplacement est vide ou le sac plein.
     */
    unequipItem(oCreature, sSlot) {
        const oInv = this.getCreatureInventory(oCreature);
        const oItem = oInv.oEquipSlots[sSlot];
        if (!oItem || oInv.getFreeBagSlot() < 0) {
            return null
        }
        oInv.oEquipSlots[sSlot] = null;
        oInv.addItem(oItem);
        this.removeItemEffects(oCreature, oItem);
        return oItem
    }

    removeItemEffects(oCreature, oItem) {
        const nEffCount = oItem.effects.length;
        for (let iEff = 0; iEff < nEffCount; iEff++) {
            oItem.effects[iEff].expire()
        }
        oItem.effects = [];
        this.oEffectProcessor.removeExpiredEffects(oCreature)
    }

    dropItem(oCreature, oItem) {
        this.getCreatureInventory(oCreature).removeItem(oItem)
    }

    pickupAreaKey(nKey) {
        const sArea = this.getPlayerLocationArea();
        const nFloor = this.getPlayerLocationFloor();
        if (!(sArea in this.oData.player.keys.special)) {
            this.oData.player.keys.special[sArea] = []
        }
        const nKeyMask = 1 << nKey;
        this.oData.player.keys.special[sArea][nFloor] |= nKeyMask
    }

    getPossessedKeys() {
        const sArea = this.getPlayerLocationArea();
        const nFloor = this.getPlayerLocationFloor();
        if (sArea in this.oData.player.keys.special && nFloor < this.oData.player.keys.special[sArea].length) {
            return this.oData.player.keys.special[sArea][nFloor]
        } else {
            return 0
        }
    }

    hasKey(nKey) {
        const nPossessedKeys = this.getPossessedKeys();
        const nKeyMask = 1 << nKey;
        return (nPossessedKeys & nKeyMask) !== 0
    }

    getGenericKeyCount() {
        return this.oData.player.keys.generic
    }

    addGenericKey(n) {
        if (n === undefined) {
            n = 1
        }
        this.oData.player.keys.generic += n
    }

    hasGenericKey() {
        return this.oData.player.keys.generic > 0
    }

    useGenericKey() {
        if (this.oData.player.keys.generic > 0) {
            this.oData.player.keys.generic--;
            return true
        } else {
            return false
        }
    }

    getCreatureInventory(oCreature) {
        return oCreature.oExtraData.inventory
    }

    getPlayerCreature() {
        return this.oData.player.creature
    }

    getInventoryDigest(oInv) {
        let oItem;
        const aDigest = [oInv.oEquipSlots.hand];
        for (let iSlot = 0; iSlot < oInv.getSize(); iSlot++) {
            oItem = oInv.aBagSlots[iSlot];
            if (oItem) {
                aDigest.push(oItem)
            }
        }
        return aDigest
    }

    getCreatureEquippedWeapon(oCreature) {
        const aWeapons = this.getCreatureInventory(oCreature).oEquipSlots.hand;
        return aWeapons
    }

    getWeaponMissileDefinition(oDef) {
        if ('missiles' in oDef) {
            return oDef.missiles
        }
        const m = [];
        const sBP = oDef.blueprint;
        const s2 = oDef.options.substr(0, 2);
        const sOptions = oDef.options.substr(2);
        switch (s2) {
            case 'l5':
                m.push({
                    blueprint: sBP,
                    angle: 0.4,
                    options: sOptions,
                    effects: oDef.effects,
                    chances: oDef.chances
                });
                m.push({
                    blueprint: sBP,
                    angle: -0.4,
                    options: sOptions,
                    effects: oDef.effects,
                    chances: oDef.chances
                });
            case 'l3':
                m.push({
                    blueprint: sBP,
                    angle: 0.2,
                    options: sOptions,
                    effects: oDef.effects,
                    chances: oDef.chances
                });
                m.push({
                    blueprint: sBP,
                    angle: -0.2,
                    options: sOptions,
                    effects: oDef.effects,
                    chances: oDef.chances
                });
            case 'l1':
                m.push({
                    blueprint: sBP,
                    angle: 0,
                    options: sOptions,
                    effects: oDef.effects,
                    chances: oDef.chances
                });
                break;
            case 'w2':
                m.push({
                    blueprint: sBP,
                    angle: 0,
                    options: 's' + sOptions,
                    effects: oDef.effects,
                    chances: oDef.chances
                });
                m.push({
                    blueprint: sBP,
                    angle: 0,
                    options: 'c' + sOptions,
                    effects: oDef.effects,
                    chances: oDef.chances
                });
                break;
            case 'w3':
                m.push({
                    blueprint: sBP,
                    angle: 0,
                    options: 's' + sOptions,
                    effects: oDef.effects,
                    chances: oDef.chances
                });
                m.push({
                    blueprint: sBP,
                    angle: 0,
                    options: 'c' + sOptions,
                    effects: oDef.effects,
                    chances: oDef.chances
                });
                m.push({
                    blueprint: sBP,
                    angle: 0,
                    options: sOptions,
                    effects: oDef.effects,
                    chances: oDef.chances
                });
                break;
            case 'w1':
                m.push({
                    blueprint: sBP,
                    angle: 0,
                    options: 's' + sOptions,
                    effects: oDef.effects,
                    chances: oDef.chances
                });
                break
        }
        oDef.missiles = m;
        return m
    }

    getCreatureMoveSpeed(oCreature) {
        let fSpeed = oCreature.getAttribute('speed');
        if (oCreature.getAttribute('rooted') > 0) {
            fSpeed = 0
        } else {
            fSpeed = this.oEffectProcessor.getBuffProcessedValue(oCreature, oCreature.getAttribute('speed'), 'hasted', 'snared')
        }
        return fSpeed
    }

    actionEat(oCreature, nPoints) {
        if (oCreature.getAttribute('foodp') < oCreature.getAttribute('foodmax')) {
            oCreature.modifyAttribute('foodp', nPoints);
            return true
        } else {
            return false
        }
    }

    actionStarve(oCreature) {
        if (oCreature.getAttribute('dead')) {
            return
        }
        if (oCreature.getAttribute('foodp') <= 0) {
            oCreature.modifyAttribute('hp', oCreature.getAttribute('foodc'));
            this.oEffectProcessor.checkCreatureAlive(oCreature)
        } else {
            oCreature.modifyAttribute('foodp', -oCreature.getAttribute('foodc'))
        }
    }

    actionAttack(oCreature, nChargeTime, nTime) {
        if (nChargeTime === 0 && oCreature.oExtraData.retrigger >= nTime) {
            return null
        }
        const oWeapon = this.getCreatureEquippedWeapon(oCreature);
        if (oWeapon === null) {
            return 'no_weapon'
        }
        let iSpell = 0;
        if (nChargeTime > 0) {
            iSpell = oWeapon.spells.length - 1;
            while (iSpell > 0) {
                if (oWeapon.spells[iSpell].time < nChargeTime) {
                    break
                }
                iSpell--
            }
            if (iSpell === 0) {
                return null
            }
        }
        oCreature.oExtraData.retrigger = nTime + oWeapon.speed;
        const oSpell = SPELLS_DATA[oWeapon.spells[iSpell].ref];
        if (oSpell.cost <= (oCreature.getAttribute('energy') - oCreature.getAttribute('mp'))) {
            oCreature.modifyAttribute('mp', oSpell.cost)
        } else {
            oCreature.oExtraData.retrigger += oWeapon.speed;
            return 'no_energy'
        }
        return this.getWeaponMissileDefinition(oSpell)
    }
}
