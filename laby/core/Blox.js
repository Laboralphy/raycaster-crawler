const Grid = require('./Grid');
const RoomGenerator = require('./RoomGenerator');
const SecretGenerator = require('./SecretGenerator');
const { RangeException } = require('./errors');

/**
 * Repère les zones de murs pleins ("blox") assez grandes pour y loger
 * des pièces secrètes, puis les y construit.
 */
class Blox {
    constructor() {
        this.oLevel = null;
        this.oBlox = null;
        this.aBloxIndex = new Map(); // taille -> [[x, y], ...] (ordre d'insertion)
        this.nBloxMaxSize = 8;
        this.nBloxInc = 5;
    }

    /** Calcule, pour chaque bloc de mur, la taille du carré de murs qu'il débute */
    buildBlox(l) {
        this.oLevel = l;
        const BLOCK_WALL = l.B.BLOCK_WALL;
        const B = new Grid();
        const w = l.getWidth();
        const h = l.getHeight();
        B.setSize(w, h);
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                B.setCell(x, y, l.getCell(x, y) == BLOCK_WALL ? 1 : 0);
            }
        }
        let nIter = 0;
        let bChanged;
        do {
            bChanged = false;
            for (let y = 0; y < h - 1; y++) {
                for (let x = 0; x < w - 1; x++) {
                    const xy = B.getCell(x, y);
                    if (xy > 0) {
                        const nMin = Math.min(B.getCell(x + 1, y), B.getCell(x, y + 1), B.getCell(x + 1, y + 1));
                        if (xy <= nMin) {
                            B.setCell(x, y, nMin + 1);
                            bChanged = true;
                        }
                    }
                }
            }
            nIter++;
        } while (bChanged && nIter < 10);
        for (let y = 0; y < h - 1; y++) {
            for (let x = 0; x < w - 1; x++) {
                const nMin = B.getCell(x, y);
                if (nMin > 2) {
                    if (!this.aBloxIndex.has(nMin)) {
                        this.aBloxIndex.set(nMin, []);
                    }
                    this.aBloxIndex.get(nMin).push([x, y]);
                }
            }
        }
        this.oBlox = B;
    }

    /** Construction d'une pièce secrète sur le blox nBlox de taille nSize */
    buildSecretRoom(nSize, nBlox, oSecret = null) {
        const aBlox = this.aBloxIndex.get(nSize);
        if (aBlox && aBlox[nBlox] && this.checkBlox(this.oLevel, aBlox[nBlox][0], aBlox[nBlox][1], nSize, nSize)) {
            const [x, y] = aBlox[nBlox];
            if (oSecret === null) {
                oSecret = new SecretGenerator(this.oLevel.B);
            }
            if (oSecret.getMapCount(nSize)) {
                oSecret.generate(nSize, this.oLevel.oRnd.getRandom(0, oSecret.getMapCount(nSize) - 1));
                if (oSecret.rotateUntilValidExit(this.oLevel, x, y)) {
                    const oRG = new RoomGenerator();
                    oRG.setSize(nSize, nSize);
                    oSecret.render(oRG);
                    this.oLevel.copy(oRG, x, y);
                    this.eraseBlox(x, y, nSize);
                }
            }
        }
    }

    buildSecretRoomSystem(oSecret = null) {
        if (oSecret === null) {
            oSecret = new SecretGenerator(this.oLevel.B);
        }
        if (this.aBloxIndex.size === 0) {
            return;
        }
        for (let nSize = Math.max(...this.aBloxIndex.keys()); nSize > 2; nSize--) {
            const nInc = (this.nBloxMaxSize - nSize) * this.nBloxInc;
            if (nInc < 1) {
                continue;
            }
            const count = () => (this.aBloxIndex.get(nSize) || []).length;
            for (let nBlox = 0; nBlox < count(); nBlox += nInc) {
                this.buildSecretRoom(nSize, this.oLevel.oRnd.getRandom(0, count() - 1), oSecret);
            }
        }
    }

    /** Le blox est-il toujours entièrement constitué de murs ? */
    checkBlox(oLaby, x, y, xSize, ySize) {
        try {
            for (let iy = 0; iy < ySize; iy++) {
                for (let ix = 0; ix < xSize; ix++) {
                    if (oLaby.getCell(x + ix, y + iy) != oLaby.B.BLOCK_WALL) {
                        return false;
                    }
                }
            }
        } catch (e) {
            if (e instanceof RangeException) return false;
            throw e;
        }
        return true;
    }

    /** Retire de l'index les blox recouverts par la pièce construite en (x, y) */
    eraseBlox(x, y, nSize) {
        const aToErase = new Map(); // taille -> Set d'indices
        if (nSize) {
            for (let iy = 0; iy < nSize; iy++) {
                for (let ix = 0; ix < nSize; ix++) {
                    for (const [nKey, aBlox] of this.aBloxIndex) {
                        aBlox.forEach((b, i) => {
                            if (b[0] + nSize - 1 == x + ix && b[1] + nSize - 1 == y + iy) {
                                if (!aToErase.has(nKey)) aToErase.set(nKey, new Set());
                                aToErase.get(nKey).add(i);
                            }
                        });
                    }
                }
            }
        }
        for (const [nKey, oSet] of aToErase) {
            this.aBloxIndex.set(nKey, this.aBloxIndex.get(nKey).filter((b, i) => !oSet.has(i)));
        }
    }
}

module.exports = Blox;
