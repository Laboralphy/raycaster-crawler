const LabyRoomHelper = require('../../core/LabyRoomHelper');
const CellularRoomHelper = require('../../core/CellularRoomHelper');

/** Demi-dimensions de la pièce, bornées inférieurement */
function halfSize(oRoom, nMin) {
    const cx = Math.floor(oRoom.getWidth() / 2);
    const cy = Math.floor(oRoom.getHeight() / 2);
    return { cx, cy, cxy: [Math.max(nMin, cx), Math.max(nMin, cy)] };
}

/** Église : vitraux dans les coins, idoles et runes */
class Church extends LabyRoomHelper {
    generate(oRoom) {
        const B = this.B;
        const { cxy } = halfSize(oRoom, 1);
        const aWalls = [];
        for (let c = 0; c < 4; c++) {
            if (this.oRnd.roll100(77)) {
                oRoom.generateCorner(B.BLOCK_CHURCH_STAINED_GLASS, c, this.oRnd.getRandom(2, cxy[c & 1]), this.oRnd.getRandom(2, cxy[(c + 1) & 1]));
            } else {
                aWalls.push(c);
            }
        }
        oRoom.frame(B.BLOCK_VOID, 0, 0, oRoom.getWidth(), oRoom.getHeight());
        for (const c of aWalls) {
            oRoom.generateCorner(B.BLOCK_CHURCH_STAINED_GLASS, c, 1, cxy[(c + 1) & 1]);
            oRoom.generateCorner(B.BLOCK_CHURCH_STAINED_GLASS, c, cxy[c & 1], 1);
        }
        const w = oRoom.getWidth() - 1;
        const h = oRoom.getHeight() - 1;
        const isGlass = (x, y) => oRoom.getCell(x, y) == B.BLOCK_CHURCH_STAINED_GLASS;
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const bCellLeft = x > 0 ? isGlass(x - 1, y) : true;
                const bCellTop = y > 0 ? isGlass(x, y - 1) : true;
                const bCellRight = x < w ? isGlass(x + 1, y) : true;
                const bCellBottom = y < h ? isGlass(x, y + 1) : true;
                if (isGlass(x, y) && ((bCellRight && bCellLeft) || (bCellTop && bCellBottom))) {
                    oRoom.setCell(x, y, this.oRnd.roll100(50) ? B.BLOCK_CHURCH_DEATH_IDOL : B.BLOCK_CHURCH_RUNES);
                }
            }
        }
    }
}

/** Pièce à coins et piliers ; la palette de la forêt de piliers est surchargeable */
class Corners extends LabyRoomHelper {
    typeCorners(oRoom) {
        const { cxy } = halfSize(oRoom, 0);
        for (let c = 0; c < 4; c++) {
            if (this.oRnd.roll100(50)) {
                oRoom.generateCorner(this.B.BLOCK_WALL, c, this.oRnd.getRandom(1, cxy[c & 1]), this.oRnd.getRandom(1, cxy[(c + 1) & 1]));
            }
        }
    }

    typeHorn(oRoom) {
        const { cx, cy, cxy } = halfSize(oRoom, 0);
        const c = this.oRnd.getRandom(0, 3);
        oRoom.generateCorner(this.B.BLOCK_WALL, c, this.oRnd.getRandom(1, cxy[c & 1]), this.oRnd.getRandom(1, cxy[(c + 1) & 1]));
        oRoom.generateCentralPillar(this.B.BLOCK_WALL, this.oRnd.getRandom(1, cx), this.oRnd.getRandom(1, cy));
    }

    typeCornersAndPillar(oRoom) {
        const { cx, cy } = halfSize(oRoom, 0);
        this.typeCorners(oRoom);
        const xSize = this.oRnd.getRandom(cx >> 1, cx);
        const ySize = this.oRnd.getRandom(cy >> 1, cy);
        oRoom.generateCentralPillar(this.B.BLOCK_VOID, xSize + 2, ySize + 2);
        oRoom.generateCentralPillar(this.B.BLOCK_WALL, xSize, ySize);
    }

    typePillar(oRoom) {
        const cx = Math.floor(oRoom.getWidth() * 0.75);
        const cy = Math.floor(oRoom.getHeight() * 0.75);
        const xSize = this.oRnd.getRandom(cx >> 1, cx);
        const ySize = this.oRnd.getRandom(cy >> 1, cy);
        oRoom.generateCentralPillar(this.B.BLOCK_WALL, xSize, ySize);
    }

    typeRiggedPillar(oRoom) {
        const xSize = oRoom.getWidth() - 2;
        const ySize = oRoom.getHeight() - 2;
        oRoom.generateCentralPillar(this.B.BLOCK_WALL, xSize, ySize);
        oRoom.generatePillarForest(this.B.BLOCK_VOID, xSize, ySize, 1, 1, 2, 2);
        oRoom.generateCentralPillar(this.B.BLOCK_WALL, xSize - 2, ySize - 2);
    }

    getPillarPalette() {
        const B = this.B;
        const a = [B.BLOCK_WALL, B.BLOCK_LIVING_WALL, B.BLOCK_LIVING_TAPESTRY, B.BLOCK_LIVING_TAPESTRY, B.BLOCK_LIVING_PICTURE];
        return [...a, ...a, ...a];
    }

    typeForestOfPillars(oRoom) {
        const aWalls = this.oRnd.shuffle(this.getPillarPalette());
        oRoom.generatePillarForest(aWalls, oRoom.getWidth() - 2, oRoom.getHeight() - 2, 1, 1, 2, 2);
    }

    generate(oRoom) {
        switch (this.oRnd.getRandom(0, 5)) {
            case 0:
                this.typeCorners(oRoom);
                break;
            case 1:
                this.typeCornersAndPillar(oRoom);
                break;
            case 2:
                this.typeHorn(oRoom);
                break;
            case 3:
                this.typePillar(oRoom);
                break;
            case 4:
                this.typeForestOfPillars(oRoom);
                break;
            case 5:
                this.typeRiggedPillar(oRoom);
                break;
        }
    }
}

/** Ascenseur d'entrée / de sortie, ou portail */
class Elevator extends LabyRoomHelper {
    generate(oRoom) {
        const B = this.B;
        let nDoorCode, nSwitchCode, nPillarCode;
        switch (oRoom.getRoomData('type')) {
            case 'entrance':
                nDoorCode = B.BLOCK_ELEVATOR_DOOR_PREV;
                nSwitchCode = B.BLOCK_ELEVATOR_SWITCH_PREV;
                nPillarCode = B.BLOCK_ELEVATOR_ENTRANCE;
                break;
            case 'exit':
                nDoorCode = B.BLOCK_ELEVATOR_DOOR_NEXT_UNSEALED;
                nSwitchCode = B.BLOCK_ELEVATOR_SWITCH_NEXT;
                nPillarCode = B.BLOCK_ELEVATOR_EXIT;
                break;
            case 'portal':
                nDoorCode = B.BLOCK_VOID;
                nSwitchCode = B.BLOCK_ELEVATOR_SWITCH_PORTAL;
                nPillarCode = B.BLOCK_ELEVATOR_PORTAL;
                break;
            default:
                nDoorCode = nSwitchCode = nPillarCode = null;
        }
        const nDoors = oRoom.getRoomData('doormask');
        const w2 = oRoom.getWidth() >> 1;
        const h2 = oRoom.getHeight() >> 1;
        oRoom.generateCentralPillar(B.BLOCK_WALL, 3, 3);
        if (nDoors & 1) {
            oRoom.generateCorner(B.BLOCK_WALL, 2, w2 + 1, h2);
            oRoom.generateCorner(B.BLOCK_WALL, 3, w2, h2);
            oRoom.setCell(w2, h2 - 1, nDoorCode);
            oRoom.setCell(w2 - 1, h2 - 1, B.BLOCK_ELEVATOR_DOORWAY_X);
            oRoom.setCell(w2 + 1, h2 - 1, B.BLOCK_ELEVATOR_DOORWAY_X);
            oRoom.setCell(w2 - 2, h2, B.BLOCK_WALL);
            oRoom.setCell(w2 + 2, h2, B.BLOCK_WALL);
            oRoom.setCell(w2, h2 + 1, nSwitchCode);
            oRoom.setCell(w2 - 1, h2, B.BLOCK_ELEVATOR_WALL);
            oRoom.setCell(w2 + 1, h2, B.BLOCK_ELEVATOR_WALL);
            oRoom.setCell(w2, h2 + 2, B.BLOCK_WALL);
        }
        if (nDoors & 2) {
            oRoom.generateCorner(B.BLOCK_WALL, 0, w2, h2 + 1);
            oRoom.generateCorner(B.BLOCK_WALL, 3, w2, h2);
            oRoom.setCell(w2 + 1, h2, nDoorCode);
            oRoom.setCell(w2 + 1, h2 - 1, B.BLOCK_ELEVATOR_DOORWAY_Y);
            oRoom.setCell(w2 + 1, h2 + 1, B.BLOCK_ELEVATOR_DOORWAY_Y);
            oRoom.setCell(w2, h2 - 2, B.BLOCK_WALL);
            oRoom.setCell(w2, h2 + 2, B.BLOCK_WALL);
            oRoom.setCell(w2 - 1, h2, nSwitchCode);
            oRoom.setCell(w2, h2 - 1, B.BLOCK_ELEVATOR_WALL);
            oRoom.setCell(w2, h2 + 1, B.BLOCK_ELEVATOR_WALL);
            oRoom.setCell(w2 - 2, h2, B.BLOCK_WALL);
        }
        if (nDoors & 4) {
            oRoom.generateCorner(B.BLOCK_WALL, 1, w2 + 1, h2);
            oRoom.generateCorner(B.BLOCK_WALL, 0, w2, h2);
            oRoom.setCell(w2, h2 + 1, nDoorCode);
            oRoom.setCell(w2 - 1, h2 + 1, B.BLOCK_ELEVATOR_DOORWAY_X);
            oRoom.setCell(w2 + 1, h2 + 1, B.BLOCK_ELEVATOR_DOORWAY_X);
            oRoom.setCell(w2 - 2, h2, B.BLOCK_WALL);
            oRoom.setCell(w2 + 2, h2, B.BLOCK_WALL);
            oRoom.setCell(w2, h2 - 1, nSwitchCode);
            oRoom.setCell(w2 - 1, h2, B.BLOCK_ELEVATOR_WALL);
            oRoom.setCell(w2 + 1, h2, B.BLOCK_ELEVATOR_WALL);
            oRoom.setCell(w2, h2 - 2, B.BLOCK_WALL);
        }
        if (nDoors & 8) {
            oRoom.generateCorner(B.BLOCK_WALL, 1, w2, h2 + 1);
            oRoom.generateCorner(B.BLOCK_WALL, 2, w2, h2);
            oRoom.setCell(w2 - 1, h2, nDoorCode);
            oRoom.setCell(w2 - 1, h2 + 1, B.BLOCK_ELEVATOR_DOORWAY_Y);
            oRoom.setCell(w2 - 1, h2 - 1, B.BLOCK_ELEVATOR_DOORWAY_Y);
            oRoom.setCell(w2, h2 - 2, B.BLOCK_WALL);
            oRoom.setCell(w2, h2 + 2, B.BLOCK_WALL);
            oRoom.setCell(w2 + 1, h2, nSwitchCode);
            oRoom.setCell(w2, h2 - 1, B.BLOCK_ELEVATOR_WALL);
            oRoom.setCell(w2, h2 + 1, B.BLOCK_ELEVATOR_WALL);
            oRoom.setCell(w2 + 2, h2, B.BLOCK_WALL);
        }
        oRoom.generateCentralPillar(nPillarCode, 1, 1);
    }
}

/**
 * Atelier : trois murs garnis (le quatrième, tiré au sort, reste nu),
 * mobilier dans les coins.
 * Les sous-classes définissent decorateWalls(c, cxy) et nCornerCode.
 */
class Workshop extends LabyRoomHelper {
    generate(oRoom) {
        const { cxy } = halfSize(oRoom, 1);
        const aWalls = [0, 1, 2, 3];
        aWalls.splice(this.oRnd.getRandom(0, aWalls.length - 1), 1);
        for (const c of aWalls) {
            this.decorateWalls(oRoom, c, cxy);
            switch (this.oRnd.getRandom(0, 3)) {
                case 1:
                    oRoom.generateCorner(this.nCornerCode, c, 1, 2);
                    break;
                case 2:
                    oRoom.generateCorner(this.nCornerCode, c, 2, 1);
                    break;
                case 3:
                    oRoom.generateCorner(this.nCornerCode, c, 1, 2);
                    oRoom.generateCorner(this.nCornerCode, c, 2, 1);
                    break;
            }
            oRoom.generateCorner(this.B.BLOCK_WALL, c, 1, 1);
        }
        this.decorateCenter(oRoom);
    }

    /** Pilier central 3x3 dont les quatre faces sont tirées dans aCorr */
    decorateCenterPillar(oRoom, nPillarCode, aCorr) {
        const aPillar = [[0, -1], [1, 0], [0, 1], [-1, 0]].map(([x, y]) => ({
            tile: this.oRnd.getRandom(0, aCorr.length - 1),
            x,
            y,
        }));
        const xc = oRoom.getWidth() >> 1;
        const yc = oRoom.getHeight() >> 1;
        oRoom.generateCentralPillar(nPillarCode, 3, 3);
        for (const oPillar of aPillar) {
            oRoom.setCell(xc + oPillar.x, yc + oPillar.y, aCorr[oPillar.tile]);
        }
    }
}

/** Forge */
class Forge extends Workshop {
    get nCornerCode() {
        return this.B.BLOCK_FORGE_ANVIL;
    }

    decorateWalls(oRoom, c, cxy) {
        oRoom.generateCorner(this.B.BLOCK_FORGE_TOOLS, c, 1, cxy[(c + 1) & 1]);
        oRoom.generateCorner(this.B.BLOCK_FORGE_TOOLS, c, cxy[c & 1], 1);
    }

    decorateCenter(oRoom) {
        oRoom.generateCentralPillar(this.B.BLOCK_LIVING_FIREPLACE, 1, 1);
    }
}

/** Cuisine */
class Kitchen extends Workshop {
    get nCornerCode() {
        return this.B.BLOCK_KITCHEN_TABLE;
    }

    decorateWalls(oRoom, c, cxy) {
        const B = this.B;
        oRoom.generateCorner(this.oRnd.roll100(33) ? B.BLOCK_LABO_CLOSET_Y : B.BLOCK_KITCHEN_FOOD, c, 1, cxy[(c + 1) & 1]);
        oRoom.generateCorner(this.oRnd.roll100(33) ? B.BLOCK_LABO_CLOSET_X : B.BLOCK_KITCHEN_FOOD, c, cxy[c & 1], 1);
    }

    decorateCenter(oRoom) {
        this.decorateCenterPillar(oRoom, this.B.BLOCK_WALL, [this.B.BLOCK_KITCHEN_FOOD, this.B.BLOCK_LIVING_FIREPLACE]);
    }
}

/** Laboratoire */
class Labo extends Workshop {
    get nCornerCode() {
        return this.B.BLOCK_LABO_ALCHEMY;
    }

    decorateWalls(oRoom, c, cxy) {
        const B = this.B;
        oRoom.generateCorner(this.oRnd.roll100(50) ? B.BLOCK_LABO_CLOSET_Y : B.BLOCK_LABO_WALL, c, 1, cxy[(c + 1) & 1]);
        oRoom.generateCorner(this.oRnd.roll100(50) ? B.BLOCK_LABO_CLOSET_X : B.BLOCK_LABO_WALL, c, cxy[c & 1], 1);
    }

    decorateCenter(oRoom) {
        const B = this.B;
        this.decorateCenterPillar(oRoom, B.BLOCK_LABO_WALL, [B.BLOCK_LABO_WALL, B.BLOCK_LABO_ALCHEMY, B.BLOCK_LABO_BOOK]);
    }
}

/** Prison : quatre cellules dans les coins */
class Jail extends LabyRoomHelper {
    generate(oRoom) {
        const B = this.B;
        const { cxy } = halfSize(oRoom, 0);
        const W = oRoom.getWidth();
        const H = oRoom.getHeight();
        for (let c = 0; c < 4; c++) {
            const cx = this.oRnd.getRandom(2, cxy[c & 1]);
            const cy = this.oRnd.getRandom(2, cxy[(c + 1) & 1]);
            const cx2 = (cx - 1) >> 1;
            const cy2 = (cy - 1) >> 1;
            oRoom.generateCorner(B.BLOCK_WALL, c, cx, cy);
            oRoom.generateCorner(B.BLOCK_VOID, c, cx - 1, cy - 1);
            switch (c) {
                case 0:
                    oRoom.setCell(cx - 1, cy2, B.BLOCK_JAIL_BARS);
                    oRoom.setCell(cx2, cy - 1, B.BLOCK_JAIL_DOOR);
                    break;
                case 1:
                    oRoom.setCell(W - cx, cy2, B.BLOCK_JAIL_BARS);
                    oRoom.setCell(W - cx2 - 1, cy - 1, B.BLOCK_JAIL_DOOR);
                    break;
                case 2:
                    oRoom.setCell(W - cx, H - cy2 - 1, B.BLOCK_JAIL_BARS);
                    oRoom.setCell(W - cx2 - 1, H - cy, B.BLOCK_JAIL_DOOR);
                    break;
                case 3:
                    oRoom.setCell(cx - 1, H - cy2 - 1, B.BLOCK_JAIL_BARS);
                    oRoom.setCell(cx2, H - cy, B.BLOCK_JAIL_DOOR);
                    break;
            }
        }
        this.putShacklesOnWalls(oRoom);
    }

    putShacklesOnWalls(oRoom) {
        const B = this.B;
        for (let y = 0; y < oRoom.getHeight(); y++) {
            for (let x = 0; x < oRoom.getWidth(); x++) {
                if (oRoom.getCell(x, y) == B.BLOCK_WALL) {
                    if (this.isShackable(oRoom, x - 1, y) && this.isShackable(oRoom, x + 1, y)) {
                        oRoom.setCell(x, y, B.BLOCK_JAIL_WALL_SHACKLES_Y);
                    }
                    if (this.isShackable(oRoom, x, y - 1) && this.isShackable(oRoom, x, y + 1)) {
                        oRoom.setCell(x, y, B.BLOCK_JAIL_WALL_SHACKLES_X);
                    }
                }
            }
        }
    }

    isShackable(oRoom, x, y) {
        if (x < 0 || y < 0 || x >= oRoom.getWidth() || y >= oRoom.getHeight()) {
            return true;
        }
        return oRoom.getCell(x, y) == this.B.BLOCK_VOID;
    }
}

/** Bibliothèque : rayonnages dans les coins */
class Library extends LabyRoomHelper {
    generate(oRoom) {
        const B = this.B;
        const { cxy } = halfSize(oRoom, 1);
        const aWalls = [];
        for (let c = 0; c < 4; c++) {
            if (this.oRnd.roll100(77)) {
                oRoom.generateCorner(B.BLOCK_LIBRARY_BOOK, c, this.oRnd.getRandom(2, cxy[c & 1]), this.oRnd.getRandom(2, cxy[(c + 1) & 1]));
            } else {
                aWalls.push(c);
            }
        }
        oRoom.frame(B.BLOCK_VOID, 0, 0, oRoom.getWidth(), oRoom.getHeight());
        for (const c of aWalls) {
            oRoom.generateCorner(B.BLOCK_LIBRARY_BOOK, c, 1, cxy[(c + 1) & 1]);
            oRoom.generateCorner(B.BLOCK_LIBRARY_BOOK, c, cxy[c & 1], 1);
        }
    }
}

/**
 * Salon : murs décorés au hasard (une seule cheminée).
 * Les sous-classes peuvent redéfinir getTiles() et nFloorCode.
 */
class Living extends LabyRoomHelper {
    getTiles() {
        const B = this.B;
        return [
            B.BLOCK_LIVING_FIREPLACE,
            B.BLOCK_LIVING_WALL,
            B.BLOCK_LIVING_WALL,
            B.BLOCK_LIVING_TAPESTRY,
            B.BLOCK_LIVING_TAPESTRY,
            B.BLOCK_LIVING_PICTURE,
            B.BLOCK_LIVING_BOOK,
            B.BLOCK_VOID,
            B.BLOCK_VOID,
        ];
    }

    /** Code des cases vides (null : laissées telles quelles) */
    get nFloorCode() {
        return null;
    }

    generate(oRoom) {
        const B = this.B;
        const { cxy } = halfSize(oRoom, 1);
        for (const c of [0, 1, 2, 3]) {
            oRoom.generateCorner(B.BLOCK_LIVING_WALL, c, 1, cxy[(c + 1) & 1]);
            oRoom.generateCorner(B.BLOCK_LIVING_WALL, c, cxy[c & 1], 1);
        }
        const aTiles = this.getTiles();
        let bFireplace = false;
        for (let y = 0; y < oRoom.getHeight(); y++) {
            for (let x = 0; x < oRoom.getWidth(); x++) {
                if (oRoom.getCell(x, y) != B.BLOCK_VOID) {
                    let iTile = this.oRnd.getRandom(0, aTiles.length - 1);
                    if (iTile == 0) {
                        if (bFireplace) {
                            iTile += this.oRnd.getRandom(1, aTiles.length - 1);
                        } else {
                            bFireplace = true;
                        }
                    }
                    oRoom.setCell(x, y, aTiles[iTile]);
                } else if (this.nFloorCode !== null) {
                    oRoom.setCell(x, y, this.nFloorCode);
                }
            }
        }
        for (let c = 0; c < 4; ++c) {
            oRoom.generateCorner(B.BLOCK_LIVING_WALL, c, 1, 1);
        }
    }
}

/** Magasin (en impasse) */
class Shop extends LabyRoomHelper {
    generate(oRoom) {
        const B = this.B;
        const { cx, cy } = halfSize(oRoom, 1);
        const nDoors = oRoom.getRoomData('doormask');
        oRoom.generateDunHallway(B.BLOCK_WALL, nDoors, 3);
        oRoom.generateCentralPillar(B.BLOCK_WATCH_WALL, 5, 5);
        oRoom.generateCentralPillar(B.BLOCK_VOID, 3, 3);
        oRoom.generateCentralPillar(B.BLOCK_VOID, 1, 5);
        oRoom.generateCentralPillar(B.BLOCK_VOID, 5, 1);
        switch (nDoors) {
            case 1:
                oRoom.setCell(cx, cy + 2, B.BLOCK_SHOP);
                break;
            case 2:
                oRoom.setCell(cx - 2, cy, B.BLOCK_SHOP);
                break;
            case 4:
                oRoom.setCell(cx, cy - 2, B.BLOCK_SHOP);
                break;
            case 8:
                oRoom.setCell(cx + 2, cy, B.BLOCK_SHOP);
                break;
        }
    }
}

/** Entrepôt : caisses disposées en grotte */
class Storage extends CellularRoomHelper {
    constructor(oRnd, B) {
        super(oRnd, B);
        this._nHoleDensity = 50;
        this.nHallwayCode = B.BLOCK_WALL;
        this.nFillCode = B.BLOCK_WATCH_WALL;
    }

    generate(oRoom) {
        this.generateCellular(oRoom);
    }
}

/** Poste de garde : cabane centrale fermée, trésor et fenêtres */
class Watch extends LabyRoomHelper {
    setWallThing(c, n, nOffset = 0, nInsideOffset = 0) {
        const oRoom = this.oRoom;
        const w2 = oRoom.getWidth() - 2;
        const h2 = oRoom.getHeight() - 2;
        switch (c % 4) {
            case 0:
                oRoom.setCell(3 + nOffset, 1 + nInsideOffset, n);
                break;
            case 1:
                oRoom.setCell(w2 - nInsideOffset, 3 + nOffset, n);
                break;
            case 2:
                oRoom.setCell(oRoom.getWidth() - 1 - 3 + nOffset, h2 - nInsideOffset, n);
                break;
            case 3:
                oRoom.setCell(1 + nInsideOffset, oRoom.getHeight() - 1 - 3 + nOffset, n);
                break;
        }
    }

    generate(oRoom) {
        const B = this.B;
        this.oRoom = oRoom;
        oRoom.generateCentralPillar(B.BLOCK_WATCH_WALL, oRoom.getWidth() - 2, oRoom.getHeight() - 2);
        oRoom.generateCentralPillar(B.BLOCK_NO_SPAWN, oRoom.getWidth() - 4, oRoom.getHeight() - 4);
        const c = this.oRnd.getRandom(0, 3);
        const nDoorway = (c & 1) == 0 ? B.BLOCK_WATCH_DOORWAY_X : B.BLOCK_WATCH_DOORWAY_Y;
        const nWall2 = (c & 1) == 0 ? B.BLOCK_WATCH_WALL_2_X : B.BLOCK_WATCH_WALL_2_Y;
        this.setWallThing(c, B.BLOCK_WATCH_DOOR_LOCKED);
        this.setWallThing(c, nDoorway, -1);
        this.setWallThing(c, nDoorway, 1);
        this.setWallThing(c + 1, B.BLOCK_WATCH_WINDOW);
        switch (this.oRnd.getRandom(0, 1)) {
            case 0:
                this.setWallThing(c + 2, B.BLOCK_WATCH_TREASURE, 0, 1);
                this.setWallThing(c + 2, nWall2, 1, 1);
                this.setWallThing(c + 2, nWall2, -1, 1);
                break;
            case 1:
                this.setWallThing(c + 2, nWall2, 0, 1);
                this.setWallThing(c + 2, B.BLOCK_WATCH_TREASURE, 1, 1);
                this.setWallThing(c + 2, B.BLOCK_WATCH_WALL, 0, 1);
                this.setWallThing(c + 2, B.BLOCK_WATCH_TREASURE, -1, 1);
                this.setWallThing(c + 2, B.BLOCK_WATCH_WALL, -2, 1);
                this.setWallThing(c + 2, B.BLOCK_WATCH_WALL, 2, 1);
                break;
        }
        this.setWallThing(c + 3, B.BLOCK_WATCH_WINDOW);
    }
}

module.exports = { Church, Corners, Elevator, Forge, Jail, Kitchen, Labo, Library, Living, Shop, Storage, Watch };
