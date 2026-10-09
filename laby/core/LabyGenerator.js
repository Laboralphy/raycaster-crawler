const Grid = require('./Grid');
const { RangeException } = require('./errors');

/**
 * Labyrinthe "abstrait" : une cellule par pièce, chaque cellule portant
 * deux murs (bit 1 : haut, bit 2 : gauche).
 */
class LabyGenerator extends Grid {
    constructor(oRnd) {
        super();
        this.oRnd = oRnd;
        this.oLaby = null; // cellules visitées
        this.oMapKm = null; // distance depuis l'entrée
        this.aLongestRoad = null; // [xExit, yExit, km, xEntrance, yEntrance]
    }

    getExit() {
        return { x: this.aLongestRoad[0], y: this.aLongestRoad[1], km: this.aLongestRoad[2] };
    }

    getEntrance() {
        return { x: this.aLongestRoad[3], y: this.aLongestRoad[4] };
    }

    isExit(x, y) {
        const a = this.getExit();
        return x == a.x && y == a.y;
    }

    isEntrance(x, y) {
        const a = this.getEntrance();
        return x == a.x && y == a.y;
    }

    setSize(x, y) {
        super.setSize(x, y);
        if (this.oLaby === null) {
            this.oLaby = new Grid();
        }
        if (this.oMapKm === null) {
            this.oMapKm = new Grid();
        }
        this.oLaby.setSize(x, y);
        this.oMapKm.setSize(x, y);
        for (let iy = 0; iy < y; iy++) {
            for (let ix = 0; ix < x; ix++) {
                this.setCell(ix, iy, 3);
            }
        }
    }

    getCellVisited(x, y) {
        try {
            return this.oLaby.getCell(x, y) != 0;
        } catch (e) {
            if (e instanceof RangeException) return true;
            throw e;
        }
    }

    openDoor(x, y, nDoor) {
        try {
            const c = this.getCell(x, y);
            switch (nDoor) {
                case 0: // haut
                    if (y > 0) {
                        this.setCell(x, y, c & 2);
                    }
                    break;
                case 1: // droite
                    this.openDoor(x + 1, y, 3);
                    break;
                case 2: // bas
                    this.openDoor(x, y + 1, 0);
                    break;
                case 3: // gauche
                    if (x > 0) {
                        this.setCell(x, y, c & 1);
                    }
                    break;
            }
        } catch (e) {
            if (!(e instanceof RangeException)) throw e;
        }
    }

    isOpen(x, y, nDoor) {
        try {
            this.getCell(x, y);
            switch (nDoor) {
                case 0:
                    return y > 0 && (this.getCell(x, y) & 1) === 0;
                case 1:
                    return this.isOpen(x + 1, y, 3);
                case 2:
                    return this.isOpen(x, y + 1, 0);
                case 3:
                    return x > 0 && (this.getCell(x, y) & 2) === 0;
            }
        } catch (e) {
            if (e instanceof RangeException) return false;
            throw e;
        }
        return false;
    }

    getDoorMask(x, y) {
        let nMask = 0;
        for (let i = 0; i < 4; i++) {
            if (this.isOpen(x, y, i)) {
                nMask |= 1 << i;
            }
        }
        return nMask;
    }

    /** Algorithme 0 : exploration récursive (chemin unique) */
    exploration(x, y, nKm = 0) {
        if (this.aLongestRoad === null) {
            this.aLongestRoad = [x, y, nKm, x, y];
        }
        if (nKm > this.aLongestRoad[2]) {
            this.aLongestRoad[0] = x;
            this.aLongestRoad[1] = y;
            this.aLongestRoad[2] = nKm;
        }
        this.oLaby.setCell(x, y, 1);
        this.oMapKm.setCell(x, y, nKm);
        const aIndices = [
            [0, -1, 0],
            [1, 0, 1],
            [0, 1, 2],
            [-1, 0, 3],
        ];
        const aPossibilities = aIndices.filter((a) => !this.getCellVisited(x + a[0], y + a[1]));
        if (aPossibilities.length) {
            const nSide = this.oRnd.getRandom(0, aPossibilities.length - 1);
            this.openDoor(x, y, aPossibilities[nSide][2]);
            this.exploration(x + aPossibilities[nSide][0], y + aPossibilities[nSide][1], nKm + 1);
            this.exploration(x, y, nKm);
        }
    }

    /** Algorithme 1 : fusion aléatoire de zones */
    fusion(xStart, yStart) {
        let n = 0;
        const aMap = [];
        for (let y = 0; y < this.getHeight(); y++) {
            aMap.push([]);
            for (let x = 0; x < this.getWidth(); x++) {
                aMap[y].push(n++);
            }
        }

        let aWalls;
        while ((aWalls = this.fusionGetOpenableWalls(aMap)).length) {
            const nWall = this.oRnd.getRandom(0, aWalls.length - 1);
            const [x, y, nDoor, id1, id2] = aWalls[nWall];
            const idMin = Math.min(id1, id2);
            const idMax = Math.max(id1, id2);
            this.openDoor(x, y, nDoor ? 2 : 1);
            for (let iy = 0; iy < this.getHeight(); iy++) {
                for (let ix = 0; ix < this.getWidth(); ix++) {
                    if (aMap[iy][ix] == idMax) {
                        aMap[iy][ix] = idMin;
                    }
                }
            }
        }
        const aNewEntrance = this.checkFusionEntrance(xStart, yStart);
        this.fusionCalcLongestRoad(aNewEntrance.x, aNewEntrance.y);
    }

    checkFusionEntrance(xStart, yStart) {
        if (!this.isDeadEnd(xStart, yStart)) {
            const aDE = this.getDeadEnds();
            if (aDE.length === 0) {
                throw new RangeException('laby has no dead ends');
            }
            return aDE[this.oRnd.getRandom(0, aDE.length - 1)];
        }
        return { x: xStart, y: yStart };
    }

    isDeadEnd(x, y) {
        switch (this.getDoorMask(x, y)) {
            case 1:
            case 2:
            case 4:
            case 8:
                return true;
            default:
                return false;
        }
    }

    getDeadEnds() {
        const aDeadEnds = [];
        for (let y = 0; y < this.getHeight(); y++) {
            for (let x = 0; x < this.getWidth(); x++) {
                if (this.isDeadEnd(x, y)) {
                    aDeadEnds.push({ x, y });
                }
            }
        }
        return aDeadEnds;
    }

    fusionGetOpenableWalls(aMap) {
        const aWalls = [];
        const h = aMap.length;
        const w = h ? aMap[0].length : 0;
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                if (y < h - 1 && aMap[y][x] != aMap[y + 1][x]) {
                    aWalls.push([x, y, 1, aMap[y][x], aMap[y + 1][x]]);
                }
                if (x < w - 1 && aMap[y][x] != aMap[y][x + 1]) {
                    aWalls.push([x, y, 0, aMap[y][x], aMap[y][x + 1]]);
                }
            }
        }
        return aWalls;
    }

    fusionCalcLongestRoad(x, y, nKm = 0) {
        if (this.getCellVisited(x, y)) {
            return;
        }
        if (this.aLongestRoad === null) {
            this.aLongestRoad = [x, y, nKm, x, y];
        }
        if (nKm > this.aLongestRoad[2]) {
            this.aLongestRoad[0] = x;
            this.aLongestRoad[1] = y;
            this.aLongestRoad[2] = nKm;
        }
        this.oLaby.setCell(x, y, 1);
        this.oMapKm.setCell(x, y, nKm);
        if (x > 0 && this.isOpen(x, y, 3)) {
            this.fusionCalcLongestRoad(x - 1, y, nKm + 1);
        }
        if (y > 0 && this.isOpen(x, y, 0)) {
            this.fusionCalcLongestRoad(x, y - 1, nKm + 1);
        }
        if (x < this.getWidth() - 1 && this.isOpen(x, y, 1)) {
            this.fusionCalcLongestRoad(x + 1, y, nKm + 1);
        }
        if (y < this.getHeight() - 1 && this.isOpen(x, y, 2)) {
            this.fusionCalcLongestRoad(x, y + 1, nKm + 1);
        }
    }

    getCellKm(x, y) {
        return this.oMapKm.getCell(x, y);
    }

    /** Pourcentage du trajet, sans compter la dernière pièce */
    getCellKm101(x, y) {
        const nDiv = Math.max(1, this.aLongestRoad[2] - 1);
        return Math.floor(this.getCellKm(x, y) * 100 / nDiv);
    }
}

module.exports = LabyGenerator;
