const LabyRoomHelper = require('./LabyRoomHelper');
const LifeGame = require('./LifeGame');
const Painter = require('./Painter');

/**
 * Base des pièces "organiques" (grottes, entrepôts) : trous aléatoires
 * lissés par un automate cellulaire, en recommençant tant que la zone
 * vide n'est pas d'un seul tenant (6 essais, puis pièce vide).
 *
 * Les sous-classes définissent _nHoleDensity, nHallwayCode (code du
 * couloir de départ) et nFillCode (code des blocs conservés).
 */
class CellularRoomHelper extends LabyRoomHelper {
    generateCellular(oRoom) {
        let nRec = 6;
        do {
            this.generateRoom(oRoom);
            --nRec;
            if (nRec <= 0) {
                oRoom.block(this.B.BLOCK_VOID, 0, 0, oRoom.getWidth(), oRoom.getHeight());
            }
        } while (!this.checkRoom(oRoom) && nRec > 0);
    }

    generateRoom(oRoom) {
        const B = this.B;
        const w = oRoom.getWidth();
        const h = oRoom.getHeight();
        const nDoors = oRoom.getRoomData('doormask');
        oRoom.generateDunHallway(this.nHallwayCode, nDoors, 1);
        for (let y = 0; y < h; ++y) {
            for (let x = 0; x < w; ++x) {
                if (this.oRnd.roll100(this._nHoleDensity)) {
                    oRoom.setCell(x, y, B.BLOCK_VOID);
                }
            }
        }

        const oLG = new LifeGame();
        oLG.setSize(w, h);
        oLG.assign(oRoom);
        oLG.setRules([5, 6, 7, 8], [0, 1, 2, 3]);
        for (let i = 0; i < 2; i++) {
            oLG.process();
        }
        oRoom.generateDunHallway(this.nHallwayCode, nDoors, 1);
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const bLGWall = oLG.getCell(x, y) !== 0;
                const bPrevWall = oRoom.getCell(x, y) == this.nHallwayCode;
                oRoom.setCell(x, y, bLGWall && bPrevWall ? this.nFillCode : B.BLOCK_VOID);
            }
        }
    }

    /** La zone vide est-elle d'un seul tenant ? */
    checkRoom(oRoom) {
        const BLOCK_VOID = this.B.BLOCK_VOID;
        const oPainter = new Painter();
        oPainter.assign(oRoom);
        const w = oRoom.getWidth();
        const h = oRoom.getHeight();
        search: for (let y = 0; y < h; ++y) {
            for (let x = 0; x < w; ++x) {
                if (oRoom.getCell(x, y) == BLOCK_VOID) {
                    oPainter.paint(x, y, BLOCK_VOID, 1000);
                    break search;
                }
            }
        }
        for (let y = 0; y < h; ++y) {
            for (let x = 0; x < w; ++x) {
                if (oPainter.getCell(x, y) == BLOCK_VOID) {
                    return false;
                }
            }
        }
        return true;
    }
}

module.exports = CellularRoomHelper;
