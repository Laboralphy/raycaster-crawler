const Grid = require('./Grid');

/**
 * Grille dotée de primitives de dessin (segments, pavés, coins, couloirs...).
 */
class RoomGenerator extends Grid {
    /** Trace un segment horizontal (vers la gauche si la longueur est négative) */
    segmentX(n, x, y, nLength) {
        if (nLength < 0) {
            this.segmentX(n, x + nLength, y, -nLength);
        } else {
            for (let i = 0; i < nLength; i++) {
                this.setCell(x + i, y, n);
            }
        }
    }

    /** Trace un segment vertical */
    segmentY(n, x, y, nLength) {
        if (nLength < 0) {
            this.segmentY(n, x, y + nLength, -nLength);
        } else {
            for (let i = 0; i < nLength; i++) {
                this.setCell(x, y + i, n);
            }
        }
    }

    /** Dessine un pavé de blocs (coin sup gauche + taille) */
    block(n, x, y, w, h) {
        if (h < 0) {
            this.block(n, x, y + h, w, -h);
        } else {
            for (let i = 0; i < h; i++) {
                this.segmentX(n, x, y + i, w);
            }
        }
    }

    /** Dessine la bordure d'un pavé */
    frame(n, x, y, w, h) {
        this.segmentX(n, x, y, w);
        this.segmentX(n, x, y + h - 1, w);
        this.segmentY(n, x, y, h);
        this.segmentY(n, x + w - 1, y, h);
    }

    /** Comme block() mais avec deux coins opposés */
    blockAbs(n, x1, y1, x2, y2) {
        if (x2 < x1) {
            this.blockAbs(n, x2, y1, x1, y2);
        } else if (y2 < y1) {
            this.blockAbs(n, x1, y2, x2, y1);
        } else {
            this.block(n, x1, y1, x2 - x1 + 1, y2 - y1 + 1);
        }
    }

    /** Copie la disposition des blocs d'une autre grille en (x, y) */
    copy(oLaby, x, y) {
        const h = oLaby.getHeight();
        const w = oLaby.getWidth();
        for (let iy = 0; iy < h; iy++) {
            for (let ix = 0; ix < w; ix++) {
                this.setCell(x + ix, y + iy, oLaby.getCell(ix, iy));
            }
        }
    }

    /** Comme copy() mais n'écrase que les cellules à 0 */
    copyZero(oLaby, x, y) {
        const h = oLaby.getHeight();
        const w = oLaby.getWidth();
        for (let iy = 0; iy < h; iy++) {
            for (let ix = 0; ix < w; ix++) {
                const n = oLaby.getCell(ix, iy);
                if (this.getCell(x + ix, y + iy) == 0) {
                    this.setCell(x + ix, y + iy, n);
                }
            }
        }
    }

    fillRoom(n) {
        this.block(n, 0, 0, this.getWidth(), this.getHeight());
    }

    /** Génère un pilier central */
    generateCentralPillar(nWall, w, h) {
        this.block(nWall, (this.getWidth() - w) >> 1, (this.getHeight() - h) >> 1, w, h);
    }

    /**
     * Renvoie les cellules voisines : [nord, est, sud, ouest], null hors grille
     */
    getCellNeighborhood(x, y) {
        const aResult = [null, null, null, null];
        if (y > 0) {
            aResult[0] = this.getCell(x, y - 1);
        }
        if (x < this.getWidth() - 1) {
            aResult[1] = this.getCell(x + 1, y);
        }
        if (y < this.getHeight() - 1) {
            aResult[2] = this.getCell(x, y + 1);
        }
        if (x > 0) {
            aResult[3] = this.getCell(x - 1, y);
        }
        return aResult;
    }

    /**
     * Génère un coin
     * @param nCorner 0:haut-gauche 1:haut-droite 2:bas-droite 3:bas-gauche
     */
    generateCorner(nWall, nCorner, w, h) {
        switch (nCorner) {
            case 0:
                this.block(nWall, 0, 0, w, h);
                break;
            case 1:
                this.block(nWall, this.getWidth() - w, 0, w, h);
                break;
            case 2:
                this.block(nWall, this.getWidth() - w, this.getHeight() - h, w, h);
                break;
            case 3:
                this.block(nWall, 0, this.getHeight() - h, w, h);
                break;
        }
    }

    /**
     * Génère un ensemble de piliers
     * @param aWalls code (ou liste de codes utilisés à tour de rôle)
     */
    generatePillarForest(aWalls, w, h, x, y, xn, yn) {
        let iWall = 0;
        let nWall = Array.isArray(aWalls) ? undefined : aWalls;
        for (let iy = 0; iy < h; iy += yn) {
            for (let ix = 0; ix < w; ix += xn) {
                if (Array.isArray(aWalls)) {
                    nWall = aWalls[iWall];
                    iWall = (iWall + 1) % aWalls.length;
                }
                this.setCell(x + ix, y + iy, nWall);
            }
        }
    }

    generateChestboard(aWalls, x, y, w, h) {
        let iWall = 0;
        for (let iy = 0; iy < h; iy++) {
            for (let ix = 0; ix < w; ix++) {
                this.setCell(x + ix, y + iy, aWalls[iWall]);
                iWall = (iWall + 1) % aWalls.length;
            }
        }
    }

    /** Remplit la pièce puis creuse un réseau de couloirs (position 0 = pas d'issue) */
    generateCrossRoads(nWall, nPosNorth, nWidthNorth, nPosEast, nWidthEast, nPosSouth, nWidthSouth, nPosWest, nWidthWest) {
        this.block(nWall, 0, 0, this.getWidth(), this.getHeight());
        this.generateCrossTunnel(nPosNorth, nWidthNorth, nPosEast, nWidthEast, nPosSouth, nWidthSouth, nPosWest, nWidthWest);
    }

    generateCrossTunnel(nPosNorth, nWidthNorth, nPosEast, nWidthEast, nPosSouth, nWidthSouth, nPosWest, nWidthWest) {
        const w = this.getWidth();
        const h = this.getHeight();
        const w2 = w >> 1;
        const w2c = w - w2;
        const h2 = h >> 1;
        const h2c = h - h2;

        let nMask = 0;
        if (nPosNorth) nMask |= 1;
        if (nPosEast) nMask |= 2;
        if (nPosSouth) nMask |= 4;
        if (nPosWest) nMask |= 8;

        switch (nMask) {
            case 1: // N
                this.block(0, nPosNorth, 0, nWidthNorth, h2);
                break;

            case 2: // E
                this.block(0, w2, nPosEast, w2c, nWidthEast);
                break;

            case 3: // N E
                this.block(0, nPosNorth, 0, nWidthNorth, nPosEast + nWidthEast);
                this.block(0, nPosNorth, nPosEast, w - nPosNorth, nWidthEast);
                break;

            case 4: // S
                this.block(0, nPosSouth, h2, nWidthSouth, h2c);
                break;

            case 5: // N S
                this.block(0, nPosNorth, 0, nWidthNorth, h2);
                this.block(0, nPosSouth, h2, nWidthSouth, h2c);
                this.blockAbs(0, Math.min(nPosNorth, nPosSouth), h2, Math.max(nPosNorth + nWidthNorth - 1, nPosSouth + nWidthSouth - 1), h2);
                break;

            case 6: // E S
                this.block(0, nPosSouth, nPosEast, w - nPosSouth, nWidthEast);
                this.block(0, nPosSouth, nPosEast, nWidthSouth, h - nPosEast);
                break;

            case 7: // N E S
                this.block(0, nPosNorth, 0, nWidthNorth, nPosEast + nWidthEast);
                this.block(0, nPosNorth, nPosEast, w - nPosNorth, nWidthEast);
                this.block(0, nPosSouth, nPosEast, w - nPosSouth, nWidthEast);
                this.block(0, nPosSouth, nPosEast, nWidthSouth, h - nPosEast);
                break;

            case 8: // W
                this.block(0, 0, nPosWest, w2, nWidthWest);
                break;

            case 9: // N W
                this.block(0, 0, nPosWest, nPosNorth + nWidthNorth, nWidthWest);
                this.block(0, nPosNorth, 0, nWidthNorth, nPosWest);
                break;

            case 10: // E W
                this.block(0, 0, nPosWest, w2, nWidthWest);
                this.block(0, w2, nPosEast, w2c, nWidthEast);
                this.blockAbs(0, w2, Math.min(nPosEast, nPosWest), w2, Math.max(nPosEast + nWidthEast - 1, nPosWest + nWidthWest - 1));
                break;

            case 11: // N E W
                this.block(0, nPosNorth, 0, nWidthNorth, nPosEast + nWidthEast);
                this.block(0, nPosNorth, nPosEast, w - nPosNorth, nWidthEast);
                this.block(0, 0, nPosWest, nPosNorth + nWidthNorth, nWidthWest);
                this.block(0, nPosNorth, 0, nWidthNorth, nPosWest);
                break;

            case 12: // S W
                this.block(0, 0, nPosWest, nPosSouth + nWidthSouth, nWidthWest);
                this.block(0, nPosSouth, nPosWest, nWidthSouth, h - nPosWest);
                break;

            case 13: // N S W
                this.block(0, 0, nPosWest, nPosSouth + nWidthSouth, nWidthWest);
                this.block(0, nPosSouth, nPosWest, nWidthSouth, h - nPosWest);
                this.block(0, 0, nPosWest, nPosNorth + nWidthNorth, nWidthWest);
                this.block(0, nPosNorth, 0, nWidthNorth, nPosWest);
                break;

            case 14: // S E W
                this.block(0, nPosSouth, nPosEast, w - nPosSouth, nWidthEast);
                this.block(0, nPosSouth, nPosEast, nWidthSouth, h - nPosEast);
                this.block(0, 0, nPosWest, nPosSouth + nWidthSouth, nWidthWest);
                this.block(0, nPosSouth, nPosWest, nWidthSouth, h - nPosWest);
                break;

            case 15: // N E S W
                this.block(0, nPosNorth, 0, nWidthNorth, nPosEast + nWidthEast);
                this.block(0, nPosNorth, nPosEast, w - nPosNorth, nWidthEast);
                this.block(0, nPosSouth, nPosEast, w - nPosSouth, nWidthEast);
                this.block(0, nPosSouth, nPosEast, nWidthSouth, h - nPosEast);
                this.block(0, 0, nPosWest, nPosSouth + nWidthSouth, nWidthWest);
                this.block(0, nPosSouth, nPosWest, nWidthSouth, h - nPosWest);
                break;
        }
    }

    /**
     * Croisement centré défini par le masque des issues
     * @param nExitMask 1: nord 2: est 4: sud 8: ouest
     * @param nWidth épaisseur du couloir
     */
    generateDunHallway(nWall, nExitMask, nWidth) {
        const w = this.getWidth();
        const h = this.getHeight();
        const a = [0, 0, 0, 0];
        for (let i = 0; i < 4; i++) {
            if (nExitMask & (1 << i)) {
                a[i] = (i & 1) === 0 ? (w - nWidth) >> 1 : (h - nWidth) >> 1;
            }
        }
        this.generateCrossRoads(nWall, a[0], nWidth, a[1], nWidth, a[2], nWidth, a[3], nWidth);
    }

    /**
     * Recherche des cellules dont le motif (cellule + 4 voisines, traduites
     * par aTr) figure dans aValid.
     * @param {object} aTr code de bloc -> symbole ; clés spéciales 'null' et 'default'
     * @param {string[]} aValid motifs recherchés
     * @return {Array} liste de [x, y, motif]
     */
    searchPattern(aTr, aValid) {
        const rw = this.getWidth();
        const rh = this.getHeight();
        const aFound = [];
        for (let y = 0; y < rh; ++y) {
            for (let x = 0; x < rw; ++x) {
                const a = this.getCellNeighborhood(x, y);
                a.unshift(this.getCell(x, y));
                let s = '';
                for (const v of a) {
                    if (v === null) {
                        s += aTr['null'];
                    } else if (Object.prototype.hasOwnProperty.call(aTr, v)) {
                        s += aTr[v];
                    } else {
                        s += aTr['default'];
                    }
                }
                if (aValid.includes(s)) {
                    aFound.push([x, y, s]);
                }
            }
        }
        return aFound;
    }

    /** Remplace un code par un autre dans toute la pièce */
    replace(a, b) {
        const rw = this.getWidth();
        const rh = this.getHeight();
        for (let y = 0; y < rh; ++y) {
            for (let x = 0; x < rw; ++x) {
                if (this.getCell(x, y) == a) {
                    this.setCell(x, y, b);
                }
            }
        }
    }
}

module.exports = RoomGenerator;
