O2.createObject('O876_Raycaster.MobileDispenser', class MobileDispenser {
    constructor(...aArgs) {
        this.__construct(...aArgs);
    }

    __construct() {
        this.aBlueprints = {}
    }

    registerBlueprint(sId) {
        this.aBlueprints[sId] = []
    }

    pushMobile(sBlueprint, oMobile) {
        this.aBlueprints[sBlueprint].push(oMobile)
    }

    popMobile(sBlueprint) {
        if (this.aBlueprints[sBlueprint].length) {
            return this.aBlueprints[sBlueprint].pop()
        } else {
            return null
        }
    }

    render() {
        var sRender = '';
        for (var sBlueprint in this.aBlueprints) {
            if (this.aBlueprints[sBlueprint].length) {
                sRender += '[' + sBlueprint + ': ' + this.aBlueprints[sBlueprint].length.toString() + ']'
            }
        }
        return sRender
    }
});
Object.assign(O876_Raycaster.MobileDispenser.prototype, {
    aBlueprints: null
});
