O2.createObject('O876_Raycaster.Horde', class Horde {
    constructor(...aArgs) {
        this.__construct(...aArgs);
    }

    __construct(r) {
        this.oRaycaster = r;
        this.oImageLoader = this.oRaycaster.oImages;
        this.oMobileDispenser = new O876_Raycaster.MobileDispenser();
        this.aMobiles = [];
        this.aStatics = [];
        this.aSprites = [];
        this.oBlueprints = {};
        this.oTiles = {}
    }

    think() {
        var oMobile;
        var i = 0;
        while (i < this.aMobiles.length) {
            oMobile = this.aMobiles[i];
            oMobile.think();
            if (oMobile.bActive) {
                i++
            } else {
                this.unlinkMobile(oMobile);
                this.oMobileDispenser.pushMobile(oMobile.oSprite.oBlueprint.sId, oMobile)
            }
        }
    }

    defineTile(sId, aData) {
        this.nTileCount++;
        var oTile = new O876_Raycaster.Tile(aData);
        oTile.oImage = this.oImageLoader.load(oTile.sSource);
        this.oTiles[sId] = oTile;
        return oTile
    }

    defineBlueprint(sId, aData) {
        var oBP = new O876_Raycaster.Blueprint(aData);
        oBP.oTile = this.oTiles[aData.tile];
        oBP.sId = sId;
        this.oBlueprints[sId] = oBP;
        this.oMobileDispenser.registerBlueprint(sId)
    }

    defineSprite(aData) {
        var oSprite = new O876_Raycaster.Sprite();
        oSprite.oBlueprint = this.oBlueprints[aData.blueprint];
        this.aSprites.push(oSprite);
        return oSprite
    }

    linkMobile(oMobile) {
        oMobile.bActive = true;
        this.aMobiles.push(oMobile);
        return oMobile
    }

    unlinkMobile(oMobile) {
        var nHordeRank = this.aMobiles.indexOf(oMobile);
        if (nHordeRank < 0) {
            this.unlinkStatic(oMobile);
            return
        }
        ArrayTools.removeItem(this.aMobiles, nHordeRank)
    }

    unlinkStatic(oMobile) {
        var nHordeRank = this.aStatics.indexOf(oMobile);
        if (nHordeRank < 0) {
            return
        }
        ArrayTools.removeItem(this.aStatics, nHordeRank);
        this.oRaycaster.oMobileSectors.unregister(oMobile);
        oMobile.xSector = -1;
        oMobile.ySector = -1
    }

    defineMobile(aData) {
        var oMobile = new O876_Raycaster.Mobile();
        oMobile.oRaycaster = this.oRaycaster;
        oMobile.oSprite = this.defineSprite(aData);
        var oThinker = null;
        if (oMobile.oSprite.oBlueprint.sThinker !== null) {
            oThinker = this.oThinkerManager.createThinker(oMobile.oSprite.oBlueprint.sThinker)
        }
        oMobile.setThinker(oThinker);
        oMobile.fTheta = aData.angle;
        oMobile.nSize = oMobile.oSprite.oBlueprint.nPhysWidth >> 1;
        oMobile.setXY(aData.x, aData.y);
        if (oThinker) {
            this.linkMobile(oMobile)
        } else {
            this.aStatics.push(oMobile);
            oMobile.bVisible = true;
            oMobile.bEthereal = true;
            oMobile.bActive = true
        }
        return oMobile
    }

    spawnMobile(sBlueprint, x, y, fTheta) {
        var oMobile = this.oMobileDispenser.popMobile(sBlueprint);
        if (oMobile === null) {
            var aData = {
                blueprint: sBlueprint,
                x: x,
                y: y,
                angle: fTheta
            };
            return this.defineMobile(aData)
        } else {
            this.linkMobile(oMobile);
            oMobile.fTheta = fTheta;
            oMobile.setXY(x, y);
            return oMobile
        }
    }

    getMobile(n) {
        return this.aMobiles[n]
    }

    getMobileCount() {
        return this.aMobiles.length
    }

    computeCollision(oMobile) {
        var xTonari = this.xTonari;
        var yTonari = this.yTonari;
        var oRegister = this.oRaycaster.oMobileSectors;
        var oSector;
        var i;
        var oOther, iOther, nSectorLength;
        for (i = 0; i < 9; i++) {
            oSector = oRegister.get(oMobile.xSector + xTonari[i], oMobile.ySector + yTonari[i]);
            if (oSector !== null) {
                nSectorLength = oSector.length;
                for (iOther = 0; iOther < nSectorLength; ++iOther) {
                    oOther = oSector[iOther];
                    if (oOther != oMobile) {
                        if (oMobile.hits(oOther)) {
                            oMobile.oMobileCollision = oOther;
                            return
                        }
                    }
                }
            }
        }
        oMobile.oMobileCollision = null
    }

    getAllocatedMemory() {
        var nRes = 0,
            oTile;
        for (var s in this.oTiles) {
            oTile = this.oTiles[s];
            nRes += oTile.oImage.width * oTile.oImage.height * 4
        }
        return nRes
    }
});
Object.assign(O876_Raycaster.Horde.prototype, {
    oRaycaster: null,
    oThinkerManager: null,
    aMobiles: null,
    aStatics: null,
    aSprites: null,
    oBlueprints: null,
    oTiles: null,
    nTileCount: 0,
    oImageLoader: null,
    oMobileDispenser: null,
    xTonari: [0, 0, 1, 1, 1, 0, -1, -1, -1],
    yTonari: [0, -1, -1, 0, 1, 1, 1, 0, -1]
});
