O2.createObject('O876_Raycaster.Thinker', class Thinker {
    constructor(...aArgs) {
        if ('__construct' in this) {
            this.__construct(...aArgs);
        }
    }

    think() {}
});
Object.assign(O876_Raycaster.Thinker.prototype, {
    oMobile: null,
    oGame: null
});
