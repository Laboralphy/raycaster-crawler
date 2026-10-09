O2.createObject('Item', class Item extends GC.Item {
    __construct(sResRef, nStack) {
        super.__construct(sResRef);
        if (!(sResRef in ITEMS_DATA)) {
            throw new Error('item blueprint not found: ' + sResRef)
        }
        var oRef = ITEMS_DATA[sResRef];
        this.name = STRINGS._(oRef.name);
        this.type = oRef.type;
        this.icon = oRef.icon;
        this.effects = [];
        this.properties = [];
        switch (oRef.type) {
            case 'dagger':
            case 'wand':
                this.model = oRef.model;
                this.speed = oRef.speed;
                this.spells = oRef.spells;
                this.slot = oRef.slot;
                break;
            case 'potion':
            case 'ccc':
                this.properties = oRef.properties;
                this.stacksize = oRef.stack;
                break;
            case 'earings':
            case 'amulet':
            case 'ring':
                this.properties = oRef.properties;
                this.slot = oRef.slot;
                break;
            case 'misc':
                this.stacksize = oRef.stack;
                break
        }
        if (nStack !== undefined && !isNaN(nStack) && nStack > 1) {
            this.setStackCount(nStack)
        }
    }

    getSpellProperties() {
        var aProperties = [];
        var i, n, oSpell;
        if (this.spells) {
            n = this.spells.length;
            for (i = 0; i < n; i++) {
                oSpell = SPELLS_DATA[this.spells[i].ref];
                aProperties = aProperties.concat(oSpell.effects)
            }
        }
        return aProperties
    }

    getProperties() {
        var aProperties = this.getSpellProperties();
        return aProperties.concat(this.properties)
    }

    getName(nStack) {
        if (this.identified) {
            return this.name + this.getStackString(nStack)
        } else {
            return this.uname + this.getStackString(nStack)
        }
    }

    getStackString(x) {
        if (!this.isStackable()) {
            return ''
        }
        if (x !== undefined) {
            return ' x ' + x.toString()
        } else if (this.stackcount) {
            return ' x ' + this.stackcount.toString()
        } else {
            return ''
        }
    }

    isEquippable() {
        return this.slot !== ''
    }
});
Object.assign(Item.prototype, {
    name: '',
    uname: '',
    slot: '',
    type: '',
    icon: '',
    speed: 0,
    level: 0,
    properties: null,
    effects: null,
    spells: null,
    identified: true
});
