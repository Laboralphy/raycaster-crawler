export class Blueprint {
    constructor(...aArgs) {
        this.__construct(...aArgs);
    }

    __construct(oData) {
        if (oData !== undefined) {
            this.nPhysWidth = oData.width;
            this.nPhysHeight = oData.height;
            this.sThinker = oData.thinker;
            this.nFx = oData.fx;
            this.nType = oData.type;
            if ('data' in oData) {
                this.oXData = oData.data
            } else {
                this.oXData = {}
            }
        }
    }

    getData(sData) {
        if (sData in this.oXData) {
            return this.oXData[sData]
        } else {
            return null
        }
    }
}
Object.assign(Blueprint.prototype, {
    sId: '',
    nType: 0,
    oTile: null,
    nPhysWidth: 0,
    nPhysHeight: 0,
    sThinker: '',
    nFx: 0,
    oXData: null
});
