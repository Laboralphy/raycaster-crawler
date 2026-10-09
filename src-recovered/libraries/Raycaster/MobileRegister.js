export class MobileRegister {
    constructor(...aArgs) {
        this.__construct(...aArgs);
    }

    __construct(n) {
        let x, y;
        this.nSize = n;
        this.aSectors = {};
        for (x = 0; x < n; x++) {
            this.aSectors[x] = {};
            for (y = 0; y < n; y++) {
                this.aSectors[x][y] = []
            }
        }
    }

    get(x, y) {
        if (x >= 0 && y >= 0 && y < this.nSize && x < this.nSize) {
            return this.aSectors[x][y]
        } else {
            return null
        }
    }

    unregister(oMobile) {
        if (oMobile.xSector < 0 || oMobile.ySector < 0 || oMobile.xSector >= this.nSize || oMobile.ySector >= this.nSize) {
            return
        }
        const aSector = this.aSectors[oMobile.xSector][oMobile.ySector];
        const n = oMobile.nSectorRank;
        if (n == (aSector.length - 1)) {
            aSector.pop();
            oMobile.nSectorRank = -1
        } else {
            aSector[n] = aSector.pop();
            aSector[n].nSectorRank = n
        }
    }

    register(oMobile) {
        if (oMobile.xSector < 0 || oMobile.ySector < 0 || oMobile.xSector >= this.nSize || oMobile.ySector >= this.nSize) {
            return
        }
        const aSector = this.aSectors[oMobile.xSector][oMobile.ySector];
        const n = aSector.length;
        aSector.push(oMobile);
        oMobile.nSectorRank = n
    }
}
Object.assign(MobileRegister.prototype, {
    aSectors: null,
    nSize: 0
});
