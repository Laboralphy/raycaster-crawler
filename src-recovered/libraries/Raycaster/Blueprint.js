export class Blueprint {
    constructor(oData) {
        this.sId = '';
        this.nType = 0;
        this.oTile = null;
        this.nPhysWidth = 0;
        this.nPhysHeight = 0;
        this.sThinker = '';
        this.nFx = 0;
        this.oXData = null;
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
