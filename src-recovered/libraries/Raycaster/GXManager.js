O2.createObject('O876_Raycaster.GXManager', class GXManager {
    constructor(...aArgs) {
        this.__construct(...aArgs);
    }

    __construct() {
        this.aEffects = []
    }

    count() {
        return this.aEffects.length
    }

    addEffect(oEffect) {
        this.aEffects.push(oEffect);
        return oEffect
    }

    clear() {
        for (var i = 0; i < this.aEffects.length; ++i) {
            this.aEffects[i].terminate();
            this.aEffects[i].done()
        }
        this.aEffects = []
    }

    process() {
        var i = this.aEffects.length - 1;
        while (i >= 0) {
            this.aEffects[i].process();
            if (this.aEffects[i].isOver()) {
                this.aEffects[i].done();
                ArrayTools.removeItem(this.aEffects, i)
            }
            i--
        }
    }

    render() {
        var nLen = this.aEffects.length;
        for (var i = nLen - 1; i >= 0; i--) {
            this.aEffects[i].render()
        }
    }
});
Object.assign(O876_Raycaster.GXManager.prototype, {
    aEffects: null
});
