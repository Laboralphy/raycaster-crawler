O2.createObject('Dungeon', class Dungeon {
    constructor(...aArgs) {
        this.__construct(...aArgs);
    }

    __construct() {
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
        var oCreature = new GC.Creature();
        oCreature.setEffectProcessor(this.oEffectProcessor);
        if (nLevel === undefined) {
            nLevel = 1
        }
        oCreature.oExtraData = {
            retrigger: 0,
            inventory: new GC.Inventory(),
            level: nLevel,
            magic: {
                cooldown: {},
                book: ['DrainLife', 'Teleport', 'Knock', 'DeathSpell', 'MagicMapping', 'SummonFood', 'Reflect', 'Light', 'TimeStop']
            }
        };
        return oCreature
    }

    setupPlayerCreature(oCreature) {
        var c = oCreature;
        var i = c.oExtraData.inventory;
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
        this.aStartingStuff = ['wand_yce_1', 'dag_steel', 'pot_heal_3', 'pot_heal_3', 'pot_heal_3', 'pot_ether_3', 'pot_ether_3', 'pot_ether_3', 'ccc_herb0', 'ccc_herb1', 'ccc_h2o', 'ccc_vegs', 'ccc_meat'];
        var oItem = null;
        for (var iStuff = 0; iStuff < this.aStartingStuff.length; iStuff++) {
            oItem = new Item(this.aStartingStuff[iStuff]);
            this.pickupItem(c, oItem);
            if (oItem.slot && i.oEquipSlots[oItem.slot] === null) {
                this.equipItem(c, oItem)
            }
        }
        c.oExtraData.craft = ['pot_heal_1', 'pot_ether_1', 'ccc_meal'];
        return oCreature
    }

    learnCraft(oCreature, sCraftRecipe) {
        if (oCreature.oExtraData.craft.indexOf(sCraftRecipe) < 0) {
            oCreature.oExtraData.craft.push(sCraftRecipe)
        }
    }

    getItemLevel(oItem) {
        var aProperties = oItem.getProperties();
        return this.oEffectProcessor.getLevelFromEffects(aProperties)
    }

    setupMobCreature(oCreature, oMobile) {
        var sWeapon = oMobile.getData('weapon');
        var oWeapon = new Item(sWeapon);
        var oInv = oCreature.oExtraData.inventory;
        oInv.setSize(this.INVENTORY_SIZE_CREATURE);
        oInv.defineEquipSlot('hand');
        oInv.addItem(oWeapon);
        oInv.equipItem(oWeapon, 'hand');
        var nLevel = oCreature.oExtraData.level;
        var aProp = oMobile.getData('properties');
        if (aProp) {
            var nPropCount = aProp.length;
            var sProp;
            var ep = this.oEffectProcessor;
            for (var iProp = 0; iProp < nPropCount; iProp++) {
                sProp = aProp[iProp];
                sProp = ep.setEffectLevel(sProp, ep.getEffectLevel(sProp) + nLevel);
                this.oEffectProcessor.applyEffect(oCreature, sProp, null)
            }
        }
        var iFlag;
        var sFlags = oMobile.getData('flags');
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
        var sArea = this.getPlayerLocationArea();
        var nFloor = this.getPlayerLocationFloor();
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
        var sArea = this.getPlayerLocationArea();
        var nFloor = this.getPlayerLocationFloor();
        if (!(sArea in this.oData.hordes)) {
            return null
        }
        if (this.oData.hordes[sArea][nFloor] === undefined) {
            return null
        }
        return this.oData.hordes[sArea][nFloor]
    }

    setHorde(h) {
        var sArea = this.getPlayerLocationArea();
        var nFloor = this.getPlayerLocationFloor();
        if (!(sArea in this.oData.hordes)) {
            this.oData.hordes[sArea] = []
        }
        this.oData.hordes[sArea][nFloor] = h
    }

    getObjects() {
        var sArea = this.getPlayerLocationArea();
        var nFloor = this.getPlayerLocationFloor();
        if (!(sArea in this.oData.objects)) {
            this.oData.objects[sArea] = []
        }
        return this.oData.objects[sArea][nFloor]
    }

    setObjects(o) {
        var sArea = this.getPlayerLocationArea();
        var nFloor = this.getPlayerLocationFloor();
        if (!(sArea in this.oData.objects)) {
            this.oData.objects[sArea] = []
        }
        this.oData.objects[sArea][nFloor] = o
    }

    getOpenDoors() {
        var sArea = this.getPlayerLocationArea();
        var nFloor = this.getPlayerLocationFloor();
        if (!(sArea in this.oData.opendoors)) {
            this.oData.opendoors[sArea] = []
        }
        if (this.oData.opendoors[sArea][nFloor] === undefined) {
            this.oData.opendoors[sArea][nFloor] = []
        }
        return this.oData.opendoors[sArea][nFloor]
    }

    setOpenDoors(oRegister) {
        var sArea = this.getPlayerLocationArea();
        var nFloor = this.getPlayerLocationFloor();
        if (!(sArea in this.oData.opendoors)) {
            this.oData.opendoors[sArea] = []
        }
        this.oData.opendoors[sArea][nFloor] = oRegister
    }

    getDropStack(x, y) {
        var sArea = this.getPlayerLocationArea();
        var nFloor = this.getPlayerLocationFloor();
        if (!(sArea in this.oData.drops)) {
            this.oData.drops[sArea] = []
        }
        if (this.oData.drops[sArea][nFloor] === undefined) {
            this.oData.drops[sArea][nFloor] = Marker.create()
        }
        return Marker.getMarkXY(this.oData.drops[sArea][nFloor], x, y)
    }

    getDropStacks() {
        var sArea = this.getPlayerLocationArea();
        var nFloor = this.getPlayerLocationFloor();
        if (!(sArea in this.oData.drops)) {
            this.oData.drops[sArea] = []
        }
        if (this.oData.drops[sArea][nFloor] === undefined) {
            this.oData.drops[sArea][nFloor] = []
        }
        return this.oData.drops[sArea][nFloor]
    }

    setDropStacks(oData) {
        var sArea = this.getPlayerLocationArea();
        var nFloor = this.getPlayerLocationFloor();
        if (!(sArea in this.oData.drops)) {
            this.oData.drops[sArea] = []
        }
        this.oData.drops[sArea][nFloor] = oData
    }

    isDropStack(x, y) {
        var sArea = this.getPlayerLocationArea();
        var nFloor = this.getPlayerLocationFloor();
        if (!(sArea in this.oData.drops)) {
            return false
        }
        if (this.oData.drops[sArea][nFloor] === undefined) {
            return false
        }
        return Marker.isMarked(this.oData.drops[sArea][nFloor], x, y)
    }

    addDrop(x, y, oItem) {
        if (typeof oItem == 'string') {
            oItem = new Item(oItem)
        }
        var sArea = this.getPlayerLocationArea();
        var nFloor = this.getPlayerLocationFloor();
        var oDrops = this.getDropStack(x, y);
        if (!oDrops) {
            oDrops = [];
            Marker.markXY(this.oData.drops[sArea][nFloor], x, y, oDrops)
        }
        oDrops.push(oItem)
    }

    peekDrop(x, y) {
        var aDrops = this.getDropStack(x, y);
        if (!aDrops) {
            return null
        }
        if (aDrops.length) {
            return aDrops[0]
        }
        return null
    }

    pickupDrop(oCreature, x, y) {
        var aDrops = this.getDropStack(x, y);
        if (!aDrops) {
            return null
        }
        if (aDrops.length) {
            var oItem = aDrops[0];
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
        var iEff, nEffCount, oEffect;
        var oRemovedItem = this.getCreatureInventory(oCreature).equipItem(oItem, oItem.slot);
        if (oRemovedItem) {
            nEffCount = oRemovedItem.effects.length;
            for (iEff = 0; iEff < nEffCount; iEff++) {
                oRemovedItem.effects[iEff].expire()
            }
            oRemovedItem.effects = [];
            this.oEffectProcessor.removeExpiredEffects(oCreature)
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

    dropItem(oCreature, oItem) {
        this.getCreatureInventory(oCreature).removeItem(oItem)
    }

    pickupAreaKey(nKey) {
        var sArea = this.getPlayerLocationArea();
        var nFloor = this.getPlayerLocationFloor();
        if (!(sArea in this.oData.player.keys.special)) {
            this.oData.player.keys.special[sArea] = []
        }
        var nKeyMask = 1 << nKey;
        this.oData.player.keys.special[sArea][nFloor] |= nKeyMask
    }

    getPossessedKeys() {
        var sArea = this.getPlayerLocationArea();
        var nFloor = this.getPlayerLocationFloor();
        if (sArea in this.oData.player.keys.special && nFloor < this.oData.player.keys.special[sArea].length) {
            return this.oData.player.keys.special[sArea][nFloor]
        } else {
            return 0
        }
    }

    hasKey(nKey) {
        var nPossessedKeys = this.getPossessedKeys();
        var nKeyMask = 1 << nKey;
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
        var oItem, aDigest = [oInv.oEquipSlots.hand];
        for (var iSlot = 0; iSlot < oInv.getSize(); iSlot++) {
            oItem = oInv.aBagSlots[iSlot];
            if (oItem) {
                aDigest.push(oItem)
            }
        }
        return aDigest
    }

    getCreatureEquippedWeapon(oCreature) {
        var aWeapons = this.getCreatureInventory(oCreature).oEquipSlots.hand;
        return aWeapons
    }

    getWeaponMissileDefinition(oDef) {
        if ('missiles' in oDef) {
            return oDef.missiles
        }
        var m = [];
        var sBP = oDef.blueprint;
        var s2 = oDef.options.substr(0, 2);
        var sOptions = oDef.options.substr(2);
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
        var fSpeed = oCreature.getAttribute('speed');
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
        var oWeapon = this.getCreatureEquippedWeapon(oCreature);
        if (oWeapon === null) {
            return 'no_weapon'
        }
        var iSpell = 0;
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
        var oSpell = SPELLS_DATA[oWeapon.spells[iSpell].ref];
        if (oSpell.cost <= (oCreature.getAttribute('energy') - oCreature.getAttribute('mp'))) {
            oCreature.modifyAttribute('mp', oSpell.cost)
        } else {
            oCreature.oExtraData.retrigger += oWeapon.speed;
            return 'no_energy'
        }
        return this.getWeaponMissileDefinition(oSpell)
    }
});
Object.assign(Dungeon.prototype, {
    INVENTORY_SIZE_PLAYER: 32,
    INVENTORY_SIZE_CREATURE: 4,
    oData: null,
    oArea: null,
    oWeapons: null,
    oEffectProcessor: null,
    oSpawnPoint: null,
    aStartingStuff: null
});
