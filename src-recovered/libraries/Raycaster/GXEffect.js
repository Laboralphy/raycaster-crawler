O2.createObject('O876_Raycaster.GXEffect', class GXEffect {
    constructor(...aArgs) {
        this.__construct(...aArgs);
    }

    __construct(oRaycaster) {
        this.oRaycaster = oRaycaster
    }

    isOver() {
        return true
    }

    process() {}

    render() {}

    done() {}

    terminate() {}
});
Object.assign(O876_Raycaster.GXEffect.prototype, {
    sClass: 'Effect',
    oRaycaster: null
});
