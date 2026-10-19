import { ArrayTools } from '../O876/ArrayTools.js';
import { Blueprint } from './Blueprint.js';
import { Mobile } from './Mobile.js';
import { MobileDispenser } from './MobileDispenser.js';
import { Sprite } from './Sprite.js';
import { Tile } from './Tile.js';

// décalages des 9 secteurs voisins (le secteur lui-même compris), en lecture seule
const X_TONARI = [0, 0, 1, 1, 1, 0, -1, -1, -1];
const Y_TONARI = [0, -1, -1, 0, 1, 1, 1, 0, -1];

export class Horde {
    constructor(r) {
        this.oThinkerManager = null;
        this.nTileCount = 0;
        this.xTonari = X_TONARI;
        this.yTonari = Y_TONARI;
        this.oRaycaster = r;
        this.oImageLoader = this.oRaycaster.oImages;
        this.oMobileDispenser = new MobileDispenser();
        this.aMobiles = [];
        this.aStatics = [];
        this.aSprites = [];
        this.oBlueprints = {};
        this.oTiles = {}
    }

    think() {
        let oMobile;
        let i = 0;
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
        const oTile = new Tile(aData);
        oTile.oImage = this.oImageLoader.load(oTile.sSource);
        this.oTiles[sId] = oTile;
        return oTile
    }

    defineBlueprint(sId, aData) {
        const oBP = new Blueprint(aData);
        oBP.oTile = this.oTiles[aData.tile];
        oBP.sId = sId;
        this.oBlueprints[sId] = oBP;
        this.oMobileDispenser.registerBlueprint(sId)
    }

    defineSprite(aData) {
        const oSprite = new Sprite();
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
        const nHordeRank = this.aMobiles.indexOf(oMobile);
        if (nHordeRank < 0) {
            this.unlinkStatic(oMobile);
            return
        }
        ArrayTools.removeItem(this.aMobiles, nHordeRank)
    }

    unlinkStatic(oMobile) {
        const nHordeRank = this.aStatics.indexOf(oMobile);
        if (nHordeRank < 0) {
            return
        }
        ArrayTools.removeItem(this.aStatics, nHordeRank);
        this.oRaycaster.oMobileSectors.unregister(oMobile);
        oMobile.xSector = -1;
        oMobile.ySector = -1
    }

    defineMobile(aData) {
        const oMobile = new Mobile();
        oMobile.oRaycaster = this.oRaycaster;
        oMobile.oSprite = this.defineSprite(aData);
        let oThinker = null;
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
        const oMobile = this.oMobileDispenser.popMobile(sBlueprint);
        if (oMobile === null) {
            const aData = {
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
        const xTonari = this.xTonari;
        const yTonari = this.yTonari;
        const oRegister = this.oRaycaster.oMobileSectors;
        let oSector;
        let i;
        let oOther, iOther, nSectorLength;
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
        let nRes = 0,
            oTile;
        for (const s in this.oTiles) {
            oTile = this.oTiles[s];
            nRes += oTile.oImage.width * oTile.oImage.height * 4
        }
        return nRes
    }
}
