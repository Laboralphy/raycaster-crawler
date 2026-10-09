export class Thinker {
    constructor(...aArgs) {
        if ('__construct' in this) {
            this.__construct(...aArgs);
        }
    }

    think() {}
}
Object.assign(Thinker.prototype, {
    oMobile: null,
    oGame: null
});
