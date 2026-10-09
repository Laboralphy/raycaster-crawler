import { Nood } from './Nood.js';
import { NoodList } from './NoodList.js';
import { Point } from './Point.js';
import { MathTools } from '../../Raycaster/Tools/MathTools.js';

export class Land {
    init(a) {
        this.aTab = a;
        this.nHeight = a.length;
        this.nWidth = a[0].length
    }

    reset() {
        this.oOpList = new NoodList();
        this.oClList = new NoodList();
        this.aPath = [];
        this.aMoves = [];
        this.nIterations = 0
    }

    distance(x1, y1, x2, y2) {
        return MathTools.distance(x1 - x2, y1 - y2)
    }

    setCell(x, y, n) {
        if (this.aTab[y] !== undefined && this.aTab[y][x] !== undefined) {
            this.aTab[y][x] = n
        } else {
            throw new Error('Astar: Land.badCell: writing tile out of land: ' + x + ', ' + y)
        }
    }

    getCell(x, y) {
        if (this.aTab[y]) {
            if (x < this.aTab[y].length) {
                return this.aTab[y][x]
            }
        }
        throw new Error('Astar: Land.badTile: read tile out of land: ' + x + ', ' + y)
    }

    isCellWalkable(x, y) {
        try {
            return this.getCell(x, y) == this.LAND_BLOCK_WALKABLE
        } catch (e) {
            return false
        }
    }

    closeNood(x, y) {
        const n = this.oOpList.get(x, y);
        if (n) {
            this.oClList.set(x, y, n);
            this.oOpList.del(x, y)
        }
    }

    addAdjacent(x, y, xArrivee, yArrivee) {
        let i, j;
        let i0, j0;
        let oTmp;
        for (i0 = -1; i0 <= 1; i0++) {
            i = x + i0;
            if ((i < 0) || (i >= this.nWidth)) {
                continue
            }
            for (j0 = -1; j0 <= 1; j0++) {
                if (!this.bUseDiagonals && (j0 * i0) !== 0) {
                    continue
                }
                j = y + j0;
                if ((j < 0) || (j >= this.nHeight)) {
                    continue
                }
                if ((i == x) && (j == y)) {
                    continue
                }
                if (!this.isCellWalkable(i, j)) {
                    continue
                }
                if (!this.oClList.exists(i, j)) {
                    oTmp = new Nood();
                    oTmp.fGCost = this.oClList.get(x, y).fGCost + this.distance(i, j, x, y);
                    oTmp.fHCost = this.distance(i, j, xArrivee, yArrivee);
                    oTmp.fFCost = oTmp.fGCost + oTmp.fHCost;
                    oTmp.oPos = new Point(i, j);
                    oTmp.oParent = new Point(x, y);
                    if (this.oOpList.exists(i, j)) {
                        if (oTmp.fFCost < this.oOpList.get(i, j).fFCost) {
                            this.oOpList.set(i, j, oTmp)
                        }
                    } else {
                        this.oOpList.set(i, j, oTmp)
                    }
                }
            }
        }
    }

    bestNood(oList) {
        let oBest = null;
        let oNood;
        let iNood = '';
        for (iNood in oList.aList) {
            oNood = oList.aList[iNood];
            if (oBest === null) {
                oBest = oNood
            } else if (oNood.fFCost < oBest.fFCost) {
                oBest = oNood
            }
        }
        return oBest
    }

    findPath(xFrom, yFrom, xTo, yTo) {
        this.reset();
        let oBest;
        const oDepart = new Nood();
        oDepart.oPos = new Point(xFrom, yFrom);
        oDepart.oParent = new Point(xFrom, yFrom);
        let xCurrent = xFrom;
        let yCurrent = yFrom;
        this.oOpList.add(oDepart);
        this.closeNood(xCurrent, yCurrent);
        this.addAdjacent(xCurrent, yCurrent, xTo, yTo);
        let iIter = 0;
        while (!((xCurrent == xTo) && (yCurrent == yTo)) && (!this.oOpList.empty())) {
            oBest = this.bestNood(this.oOpList);
            xCurrent = oBest.oPos.x;
            yCurrent = oBest.oPos.y;
            this.closeNood(xCurrent, yCurrent);
            this.addAdjacent(oBest.oPos.x, oBest.oPos.y, xTo, yTo);
            if (++iIter > this.MAX_ITERATIONS) {
                throw new Error('Astar: Land.badPath: pathfinder, too much iterations')
            }
        }
        if (this.oOpList.empty()) {
            throw new Error('Astar: Land.badDest: pathfinder, no path to destination')
        }
        this.nIterations = iIter;
        this.buildPath(xTo, yTo);
        this.transformPath(xFrom, yFrom)
    }

    buildPath(xTo, yTo) {
        let oCursor = this.oClList.get(xTo, yTo);
        if (oCursor !== null) {
            while (!oCursor.isRoot()) {
                this.aPath.unshift(new Point(oCursor.oPos.x, oCursor.oPos.y));
                oCursor = this.oClList.get(oCursor.oParent.x, oCursor.oParent.y)
            }
        }
    }

    getDirFromXY(xFrom, yFrom, x, y) {
        if (xFrom == x) {
            if ((yFrom - 1) == y) {
                return 0
            }
            if ((yFrom + 1) == y) {
                return 2
            }
        }
        if (yFrom == y) {
            if ((xFrom - 1) == x) {
                return 3
            }
            if ((xFrom + 1) == x) {
                return 1
            }
        }
    }

    transformPath(xFrom, yFrom) {
        let i;
        if (this.aPath.length === 0) {
            return
        }
        this.xLast = this.aPath[0].x;
        this.yLast = this.aPath[0].y;
        this.nLastDir = this.getDirFromXY(xFrom, yFrom, this.xLast, this.yLast);
        let d;
        let n = 1;
        const nLen = this.aPath.length;
        for (i = 1; i < nLen; i++) {
            d = this.getDirFromXY(this.xLast, this.yLast, this.aPath[i].x, this.aPath[i].y);
            this.xLast = this.aPath[i].x;
            this.yLast = this.aPath[i].y;
            if (d == this.nLastDir) {
                n++
            } else {
                this.aMoves.push(this.nLastDir);
                this.aMoves.push(n);
                this.nLastDir = d;
                n = 1
            }
        }
        this.aMoves.push(this.nLastDir);
        this.aMoves.push(n)
    }
}
Object.assign(Land.prototype, {
    bUseDiagonals: false,
    MAX_ITERATIONS: 2048,
    nIterations: 0,
    aTab: null,
    nWidth: 0,
    nHeight: 0,
    oOpList: null,
    oClList: null,
    aPath: null,
    aMoves: null,
    xLast: 0,
    yLast: 0,
    nLastDir: 0,
    LAND_BLOCK_WALKABLE: 0
});
