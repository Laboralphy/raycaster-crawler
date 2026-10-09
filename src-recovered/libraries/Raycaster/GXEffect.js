export class GXEffect {
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
}
Object.assign(GXEffect.prototype, {
    sClass: 'Effect',
    oRaycaster: null
});
