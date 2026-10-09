const LevelGenerator = require('../../core/LevelGenerator');
const LevelToolKit = require('../../core/LevelToolKit');
const LabyRoomHelper = require('../../core/LabyRoomHelper');
const Grid = require('../../core/Grid');
const { spawnDecorum } = require('../cave/CaveLevelGenerator');

/** Ascenseur compact (entrée / sortie / portail), partagé avec special */
class Elevator extends LabyRoomHelper {
    get nExitDoorCode() {
        return this.B.BLOCK_ELEVATOR_DOOR_NEXT_SEALED;
    }

    generate(oRoom) {
        const B = this.B;
        let nDoorCode = null, nSwitchCode = null, nPillarCode = null;
        switch (oRoom.getRoomData('type')) {
            case 'entrance':
                nDoorCode = B.BLOCK_ELEVATOR_DOOR_PREV;
                nSwitchCode = B.BLOCK_ELEVATOR_SWITCH_PREV;
                nPillarCode = B.BLOCK_ELEVATOR_ENTRANCE;
                break;
            case 'exit':
                nDoorCode = this.nExitDoorCode;
                nSwitchCode = B.BLOCK_ELEVATOR_SWITCH_NEXT;
                nPillarCode = B.BLOCK_ELEVATOR_EXIT;
                break;
            case 'portal':
                nDoorCode = B.BLOCK_VOID;
                nSwitchCode = B.BLOCK_ELEVATOR_SWITCH_PORTAL;
                nPillarCode = B.BLOCK_ELEVATOR_PORTAL;
                break;
        }
        const nDoors = oRoom.getRoomData('doormask');
        const w2 = oRoom.getWidth() >> 1;
        const h2 = oRoom.getHeight() >> 1;
        const w21 = w2 + 1;
        const h21 = h2 + 1;
        let xDir = 0, yDir = 0, nSideBlock = null;
        if (nDoors & 1) {
            xDir = 0;
            yDir = 1;
            nSideBlock = B.BLOCK_ELEVATOR_DOORWAY_X;
            oRoom.generateCorner(B.BLOCK_WALL, 2, w21, h21);
            oRoom.generateCorner(B.BLOCK_WALL, 3, w21, h21);
        }
        if (nDoors & 2) {
            xDir = -1;
            yDir = 0;
            nSideBlock = B.BLOCK_ELEVATOR_DOORWAY_Y;
            oRoom.generateCorner(B.BLOCK_WALL, 0, w21, h21);
            oRoom.generateCorner(B.BLOCK_WALL, 3, w21, h21);
        }
        if (nDoors & 4) {
            xDir = 0;
            yDir = -1;
            nSideBlock = B.BLOCK_ELEVATOR_DOORWAY_X;
            oRoom.generateCorner(B.BLOCK_WALL, 0, w21, h21);
            oRoom.generateCorner(B.BLOCK_WALL, 1, w21, h21);
        }
        if (nDoors & 8) {
            xDir = 1;
            yDir = 0;
            nSideBlock = B.BLOCK_ELEVATOR_DOORWAY_Y;
            oRoom.generateCorner(B.BLOCK_WALL, 1, w21, h21);
            oRoom.generateCorner(B.BLOCK_WALL, 2, w21, h21);
        }
        oRoom.setCell(w2 + xDir, h2 + yDir, nPillarCode);
        oRoom.setCell(w2 + 2 * xDir, h2 + 2 * yDir, nSwitchCode);
        oRoom.setCell(w2, h2, nDoorCode);
        oRoom.setCell(w2 + yDir, h2 + xDir, nSideBlock);
        oRoom.setCell(w2 - yDir, h2 - xDir, nSideBlock);
        oRoom.setCell(w2 + yDir + xDir, h2 + xDir + yDir, B.BLOCK_ELEVATOR_WALL);
        oRoom.setCell(w2 - yDir + xDir, h2 - xDir + yDir, B.BLOCK_ELEVATOR_WALL);
    }
}

/** Pièce ordinaire, avec ou sans pilier central */
class Normal extends LabyRoomHelper {
    generate(oRoom) {
        const B = this.B;
        oRoom.getPeri().generateDunHallway(B.BLOCK_WALL, oRoom.getRoomData('doormask'), 3);
        if (this.oRnd.getRandom(0, 1) === 1) {
            oRoom.generateCentralPillar(B.BLOCK_WALL, (oRoom.getWidth() >> 1) | 1, (oRoom.getHeight() >> 1) | 1);
        }
    }
}

/**
 * Antre du boss : un bloc de 2x2 pièces ouvert, le boss au centre
 * entouré de ses sbires.
 * -rsX : taille des pièces
 * -lsX : taille du labyrinthe
 * -tX : type de labyrinthe 0:exploration 1:fusion
 * -d1 : décor
 */
class BossLevelGenerator extends LevelGenerator {
    generate(nSeed = null) {
        this.oRnd.setRandomSeed(nSeed);
        const rs = this.getOption('rs') * 2 + 7;
        const ls = this.getOption('ls') + 4;
        const nAlgo = this.getOption('t');
        this.setSize(ls, ls, rs, rs);
        this.setMap(this.buildLaby(nAlgo));
        const [xBossRoom, yBossRoom, wBossRoom, hBossRoom] = this.openBossRoom();
        this.processRooms();
        if (this.getOption('d')) {
            spawnDecorum(this);
        }
        this.postProcessRooms();
        this.processLevel();
        this.buildBossRoom(
            xBossRoom * (this.nRoomWidth - 1) + 1,
            yBossRoom * (this.nRoomHeight - 1) + 1,
            wBossRoom * (this.nRoomWidth - 1) - 1,
            hBossRoom * (this.nRoomHeight - 1) - 1
        );
        LevelToolKit.makeFancyWalls(this);
        LevelToolKit.removeNoSpawn(this);
    }

    processRoom(x, y, oRoom) {
        switch (oRoom.getRoomData('type')) {
            case 'entrance':
            case 'exit':
                oRoom.setRoomData('helper', 'boss/Elevator');
                break;
            default:
                oRoom.setRoomData('helper', 'boss/Normal');
                break;
        }
    }

    buildBossRoom(x, y, w, h) {
        const B = this.B;
        this.block(0, x, y, w, h);
        this.setCell(x + (w >> 1), y + (h >> 1), B.BLOCK_MOB_LEVEL_X);
        const aMinions = [
            { x: 0, y: -1, n: 9 },
            { x: 1, y: -1, n: 8 },
            { x: 1, y: 0, n: 9 },
            { x: 1, y: 1, n: 8 },
            { x: 0, y: 1, n: 9 },
            { x: -1, y: 1, n: 8 },
            { x: -1, y: 0, n: 9 },
            { x: -1, y: -1, n: 8 },
        ];
        for (const m of aMinions) {
            this.setCell(x + (m.x << 1) + (w >> 1), y + (m.y << 1) + (h >> 1), B.BLOCK_MOB_LEVEL_0 + m.n);
        }
        if (this.getOption('d')) {
            this.setCell(x + (w >> 1), y, B.BLOCK_SOB_TYPE_1);
            this.setCell(x + (w >> 1), y + h - 1, B.BLOCK_SOB_TYPE_1);
            this.setCell(x, y + (h >> 1), B.BLOCK_SOB_TYPE_1);
            this.setCell(x + w - 1, y + (h >> 1), B.BLOCK_SOB_TYPE_1);
        }
    }

    /** Choisit un bloc de 2x2 pièces loin de l'entrée et de la sortie, et l'ouvre */
    openBossRoom() {
        const oLaby = this.oMap;
        const wBossRoom = 2;
        const hBossRoom = 2;
        const w = oLaby.getWidth();
        const h = oLaby.getHeight();

        const oXY = new Grid();
        oXY.setSize(w, h);
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                oXY.setCell(x, y, 0);
                if (oLaby.isExit(x, y) || oLaby.isEntrance(x, y)) {
                    oXY.setCell(x, y, 1);
                    if (x > 0) oXY.setCell(x - 1, y, 1);
                    if (y > 0) oXY.setCell(x, y - 1, 1);
                    if (x > 0 && y > 0) oXY.setCell(x - 1, y - 1, 1);
                }
            }
        }

        const aXYBossRoom = [];
        for (let y = 0; y <= h - hBossRoom; y++) {
            for (let x = 0; x <= w - wBossRoom; x++) {
                if (oXY.getCell(x, y) === 0) {
                    aXYBossRoom.push([x, y]);
                }
            }
        }

        const [xBossRoom, yBossRoom] = this.oRnd.choose(aXYBossRoom);
        oLaby.openDoor(xBossRoom, yBossRoom, 1);
        oLaby.openDoor(xBossRoom, yBossRoom, 2);
        oLaby.openDoor(xBossRoom + 1, yBossRoom + 1, 0);
        oLaby.openDoor(xBossRoom + 1, yBossRoom + 1, 3);
        return [xBossRoom, yBossRoom, wBossRoom, hBossRoom];
    }
}

BossLevelGenerator.blocks = require('../dungeon/blocks');
BossLevelGenerator.helpers = {
    'boss/Elevator': Elevator,
    'boss/Normal': Normal,
};
BossLevelGenerator.Elevator = Elevator;

module.exports = BossLevelGenerator;
