const LabyRoomHelper = require('../../core/LabyRoomHelper');
const CellularRoomHelper = require('../../core/CellularRoomHelper');
const dungeonRooms = require('../dungeon/rooms');

/** Coffre-fort : compartiments à barreaux et coffres */
class Bank extends LabyRoomHelper {
    generate(oRoom) {
        const B = this.B;
        oRoom.generateDunHallway(B.BLOCK_LIVING_WALL, oRoom.getRoomData('doormask'), 1);
        const w = oRoom.getWidth();
        const h = oRoom.getHeight();
        const w2 = w >> 1;
        const h2 = h >> 1;
        const d = oRoom.getRoomData('doormask');
        if ((d & 1) == 0) {
            oRoom.generateCorner(B.BLOCK_VOID, 0, w, h2 - 1);
            oRoom.setCell(w2, h2 - 1, B.BLOCK_DOOR_JAIL);
            oRoom.setCell(w2, h2, B.BLOCK_VOID);
        }
        if ((d & 2) == 0) {
            oRoom.generateCorner(B.BLOCK_VOID, 1, w2 - 1, h);
            oRoom.setCell(w2 + 1, h2, B.BLOCK_DOOR_JAIL);
            oRoom.setCell(w2, h2, B.BLOCK_VOID);
        }
        if ((d & 4) == 0) {
            oRoom.generateCorner(B.BLOCK_VOID, 3, w, h2 - 1);
            oRoom.setCell(w2, h2 + 1, B.BLOCK_DOOR_JAIL);
            oRoom.setCell(w2, h2, B.BLOCK_VOID);
        }
        if ((d & 8) == 0) {
            oRoom.generateCorner(B.BLOCK_VOID, 0, w2 - 1, h);
            oRoom.setCell(w2 - 1, h2, B.BLOCK_DOOR_JAIL);
            oRoom.setCell(w2, h2, B.BLOCK_VOID);
        }

        let i = 0;
        let aBars;
        do {
            aBars = oRoom.searchPattern({
                null: '_',
                default: '?',
                [B.BLOCK_WALL]: 'X',
                [B.BLOCK_LIVING_WALL]: 'X',
                [B.BLOCK_VOID]: '.',
            }, ['.....', 'X.X.X', 'XX.X.']);
            if (aBars.length) {
                const [x, y, s] = aBars[0];
                if (s == '.....') {
                    oRoom.setCell(x, y, x % 2 == 1 && y % 2 == 1 ? B.BLOCK_BANK_CHEST : 1000);
                } else {
                    oRoom.setCell(x, y, B.BLOCK_BANK_HALFBAR);
                }
            }
        } while (aBars.length && ++i <= 30);

        oRoom.replace(1000, B.BLOCK_VOID);

        const aChests = this.oRnd.shuffle(oRoom.searchPattern({
            null: '_',
            default: '?',
            [B.BLOCK_BANK_CHEST]: 'X',
            [B.BLOCK_VOID]: '.',
        }, ['.X.X.', '..X.X']));
        let n = this.oRnd.getRandom(2, 4);
        for (const v of aChests) {
            oRoom.setCell(v[0], v[1], B.BLOCK_CHEST);
            if (--n <= 0) {
                break;
            }
        }
    }
}

/** Taverne : comptoir dans un coin, tables dans les autres */
class Bar extends LabyRoomHelper {
    generate(oRoom) {
        const B = this.B;
        const cxy = [Math.max(1, Math.floor(oRoom.getWidth() / 2)), Math.max(1, Math.floor(oRoom.getHeight() / 2))];
        const nBarCorner = this.oRnd.getRandom(0, 3);
        oRoom.frame(B.BLOCK_VOID, 0, 0, oRoom.getWidth(), oRoom.getHeight());
        for (const c of [0, 1, 2, 3]) {
            if (c == nBarCorner) {
                oRoom.generateCorner(B.BLOCK_BAR_DESK, c, cxy[c & 1], 2);
                oRoom.generateCorner(B.BLOCK_BAR_WALL, c, 1, cxy[(c + 1) & 1]);
                oRoom.generateCorner(B.BLOCK_BAR_C2H4OH_X, c, cxy[c & 1], 1);
                oRoom.generateCorner(B.BLOCK_BAR_C2H4OH_Y, c, 1, 2);
            } else {
                oRoom.generateCorner(B.BLOCK_BAR_TABLE, c, 3, 3);
                oRoom.generateCorner(B.BLOCK_BAR_FLOOR, c, 3, 2);
                oRoom.generateCorner(B.BLOCK_BAR_FLOOR, c, 2, 3);
                oRoom.generateCorner(B.BLOCK_BAR_WALL, c, 1, cxy[(c + 1) & 1]);
                oRoom.generateCorner(B.BLOCK_BAR_WALL, c, cxy[c & 1], 1);
            }
        }
        oRoom.replace(B.BLOCK_VOID, B.BLOCK_BAR_FLOOR);
    }
}

/** Coins et piliers, palette de la tour */
class Corners extends dungeonRooms.Corners {
    getPillarPalette() {
        const B = this.B;
        const a = [B.BLOCK_WALL, B.BLOCK_LIVING_WALL, B.BLOCK_LIVING_DECO, B.BLOCK_LIVING_DECO];
        return [...a, ...a, ...a];
    }

    typeForestOfPillars(oRoom) {
        super.typeForestOfPillars(oRoom);
        switch (this.oRnd.getRandom(0, 2)) {
            case 1:
                oRoom.generateCentralPillar(this.B.BLOCK_VOID, 3, 3);
                break;
            case 2:
                oRoom.generateCentralPillar(this.B.BLOCK_WALL, 3, 3);
                break;
        }
    }
}

/** Couloir ; fenêtre lorsqu'il longe la façade */
class Corridor extends LabyRoomHelper {
    generate(oRoom) {
        const B = this.B;
        const oPeri = oRoom.getPeri();
        const nDoors = oRoom.getRoomData('doormask');
        oRoom.generateDunHallway(B.BLOCK_WALL, nDoors, 3);
        oPeri.generateDunHallway(B.BLOCK_WALL, nDoors, 3);
        if (oRoom.getRoomData('y') == 0) {
            oRoom.generateCrossTunnel(oRoom.getWidth() >> 1, 1, 0, 0, 0, 0, 0, 0);
            oPeri.setCell(oPeri.getWidth() >> 1, 0, B.BLOCK_WINDOW);
        }
        if (oRoom.getRoomData('x') == 0) {
            oRoom.generateCrossTunnel(0, 0, 0, 0, 0, 0, oRoom.getHeight() >> 1, 1);
            oPeri.setCell(0, oPeri.getHeight() >> 1, B.BLOCK_WINDOW);
        }
        if (oRoom.getRoomData('y') == oRoom.getRoomData('ymax') - 1) {
            oRoom.generateCrossTunnel(0, 0, 0, 0, oRoom.getWidth() >> 1, 1, 0, 0);
            oPeri.setCell(oPeri.getWidth() >> 1, oPeri.getHeight() - 1, B.BLOCK_WINDOW);
        }
        if (oRoom.getRoomData('x') == oRoom.getRoomData('xmax') - 1) {
            oRoom.generateCrossTunnel(0, 0, oRoom.getHeight() >> 1, 1, 0, 0, 0, 0);
            oPeri.setCell(oPeri.getWidth() - 1, oPeri.getHeight() >> 1, B.BLOCK_WINDOW);
        }
    }
}

/** Bibliothèque, au sol de bois */
class Library extends LabyRoomHelper {
    generate(oRoom) {
        const B = this.B;
        const cxy = [Math.max(1, Math.floor(oRoom.getWidth() / 2)), Math.max(1, Math.floor(oRoom.getHeight() / 2))];
        const aWalls = [];
        for (let c = 0; c < 4; c++) {
            if (this.oRnd.roll100(77)) {
                oRoom.generateCorner(B.BLOCK_LIBRARY_BOOK, c, this.oRnd.getRandom(2, cxy[c & 1]), this.oRnd.getRandom(2, cxy[(c + 1) & 1]));
            } else {
                aWalls.push(c);
            }
        }
        oRoom.frame(B.BLOCK_BAR_FLOOR, 0, 0, oRoom.getWidth(), oRoom.getHeight());
        for (const c of aWalls) {
            oRoom.generateCorner(B.BLOCK_LIBRARY_BOOK, c, 1, cxy[(c + 1) & 1]);
            oRoom.generateCorner(B.BLOCK_LIBRARY_BOOK, c, cxy[c & 1], 1);
        }
        switch (this.oRnd.getRandom(0, 3)) {
            case 1:
                oRoom.generateCentralPillar(B.BLOCK_VOID, 4, 4);
                oRoom.generateCentralPillar(B.BLOCK_LIBRARY_BOOK, 3, 3);
                break;
            case 2:
                oRoom.generateCentralPillar(B.BLOCK_VOID, 4, 4);
                oRoom.generateCentralPillar(B.BLOCK_LIBRARY_BOOK, 1, 3);
                oRoom.generateCentralPillar(B.BLOCK_LIBRARY_BOOK, 3, 1);
                break;
            case 3:
                oRoom.generateCentralPillar(B.BLOCK_VOID, 4, 4);
                oRoom.generateCentralPillar(B.BLOCK_WALL, 3, 3);
                oRoom.generateCentralPillar(B.BLOCK_LIBRARY_BOOK, 1, 3);
                oRoom.generateCentralPillar(B.BLOCK_LIBRARY_BOOK, 3, 1);
                break;
        }
        oRoom.replace(B.BLOCK_VOID, B.BLOCK_BAR_FLOOR);
    }
}

/** Salon, palette de la tour, au sol habillé */
class Living extends dungeonRooms.Living {
    getTiles() {
        const B = this.B;
        return [
            B.BLOCK_LIVING_FIRE,
            B.BLOCK_LIVING_WALL,
            B.BLOCK_LIVING_WALL,
            B.BLOCK_LIVING_DECO,
            B.BLOCK_LIVING_DECO,
            B.BLOCK_LIVING_BOOKS,
            B.BLOCK_LIVING_FLOOR,
        ];
    }

    get nFloorCode() {
        return this.B.BLOCK_LIVING_FLOOR;
    }
}

/** Réserve : caisses pleines, entamées, planches */
class Storage extends CellularRoomHelper {
    constructor(oRnd, B) {
        super(oRnd, B);
        this._nHoleDensity = 50;
        this.nHallwayCode = 1; // marqueur interne, remplacé ensuite
        this.nFillCode = B.BLOCK_STORE_FULLCRATE;
    }

    generate(oRoom) {
        const B = this.B;
        const aHalf = [B.BLOCK_STORE_FULLCRATE, B.BLOCK_STORE_HALFCRATE, B.BLOCK_STORE_WOOD, B.BLOCK_STORE_HALFCRATE];
        this.generateCellular(oRoom);
        const aFound = oRoom.searchPattern({
            null: '_',
            default: '?',
            [B.BLOCK_STORE_FULLCRATE]: 'X',
            [B.BLOCK_VOID]: '.',
        }, ['X.XXX', 'XX.XX', 'XXX.X', 'XXXX.', 'X..XX', 'XX..X', 'XXX..', 'X.XX.']);
        for (const v of aFound) {
            oRoom.setCell(v[0], v[1], this.oRnd.choose(aHalf));
        }
    }
}

/** Carrefour, éventuellement élargi en salle décorée */
class TXCorridor extends LabyRoomHelper {
    generate(oRoom) {
        const BLOCK_WALL = this.B.BLOCK_WALL;
        let nWidth = 3;
        let nHeight = 3;
        let bRoom = false;
        if (this.oRnd.roll100(50)) {
            bRoom = true;
            nWidth = (oRoom.getWidth() - 2) | 1;
            nHeight = (oRoom.getHeight() - 2) | 1;
        }
        oRoom.generateDunHallway(BLOCK_WALL, oRoom.getRoomData('doormask'), nWidth);
        oRoom.getPeri().generateDunHallway(BLOCK_WALL, oRoom.getRoomData('doormask'), nHeight);
        if (bRoom) {
            switch (this.oRnd.getRandom(1, 4)) {
                case 1:
                    oRoom.generateCentralPillar(BLOCK_WALL, 1, 1);
                    break;
                case 2:
                    oRoom.generateCentralPillar(BLOCK_WALL, 1, 3);
                    oRoom.generateCentralPillar(BLOCK_WALL, 3, 1);
                    break;
                case 3:
                    oRoom.generatePillarForest(BLOCK_WALL, oRoom.getWidth() - 4, oRoom.getHeight() - 4, 2, 2, 2, 2);
                    break;
                case 4:
                    oRoom.generateCentralPillar(BLOCK_WALL, oRoom.getWidth() - 6, oRoom.getHeight() - 6);
                    oRoom.generatePillarForest(BLOCK_WALL, oRoom.getWidth() - 4, oRoom.getHeight() - 4, 2, 2, 2, 2);
                    break;
            }
        }
    }
}

module.exports = { Bank, Bar, Corners, Corridor, Library, Living, Storage, TXCorridor };
