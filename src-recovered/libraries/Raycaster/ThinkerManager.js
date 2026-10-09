O2.createObject('O876_Raycaster.ThinkerManager', class ThinkerManager {
    constructor(...aArgs) {
        this.__construct(...aArgs);
    }

    __construct() {
        this.oLoader = new O876.ClassLoader()
    }

    createThinker(sThinker) {
        if (sThinker === undefined || sThinker === null) {
            return null
        }
        var pThinker = this.oLoader.loadClass(sThinker + 'Thinker');
        if (pThinker !== null) {
            var oThinker = new pThinker();
            oThinker.oGame = this.oGameInstance;
            return oThinker
        } else {
            throw new Error('ThinkerManager : ' + sThinker + ' class not found.')
        }
    }
});
Object.assign(O876_Raycaster.ThinkerManager.prototype, {
    oGameInstance: null,
    oLoader: null
});
