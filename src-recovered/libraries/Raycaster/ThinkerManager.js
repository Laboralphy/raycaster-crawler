// classes de thinkers par nom (ex. 'Rusher', 'O876_Raycaster.Linear'),
// remplies par ThinkerManager.registerThinkers
const THINKERS = {};

export class ThinkerManager {
    constructor(...aArgs) {
        this.__construct(...aArgs);
    }

    __construct() {}

    static registerThinkers(oThinkers) {
        Object.assign(THINKERS, oThinkers)
    }

    createThinker(sThinker) {
        if (sThinker === undefined || sThinker === null) {
            return null
        }
        if (sThinker in THINKERS) {
            const oThinker = new THINKERS[sThinker]();
            oThinker.oGame = this.oGameInstance;
            return oThinker
        } else {
            throw new Error('ThinkerManager : ' + sThinker + 'Thinker class not found.')
        }
    }
}
Object.assign(ThinkerManager.prototype, {
    oGameInstance: null
});
