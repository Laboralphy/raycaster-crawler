const LevelGenerator = require('../../core/LevelGenerator');
const LevelToolKit = require('../../core/LevelToolKit');
const LabyRoomHelper = require('../../core/LabyRoomHelper');
const LabyRoom = require('../../core/LabyRoom');
const dungeonRooms = require('../dungeon/rooms');

const ROOM_HELPERS = [
    'dungeon/Corners',
    'dungeon/Jail',
    'dungeon/Labo',
    'dungeon/Forge',
    'dungeon/Storage',
];

/** Tunnel de mine, simple ou à grilles */
class Minetunnel extends LabyRoomHelper {
    generate(oRoom) {
        if (oRoom.getRoomData('type') !== '') {
            oRoom.generateCentralPillar(this.B.BLOCK_WALL, oRoom.getWidth() - 6, oRoom.getHeight() - 6);
        } else {
            switch (this.oRnd.getRandom(0, 1)) {
                case 0:
                    this.generateTunnelNormal(oRoom);
                    break;
                case 1:
                    this.generateTunnelGrate(oRoom);
                    break;
            }
        }
    }

    generateTunnelNormal(oRoom) {
        oRoom.generateDunHallway(this.B.BLOCK_WALL, oRoom.getRoomData('doormask'), 3);
        oRoom.getPeri().generateDunHallway(this.B.BLOCK_WALL, oRoom.getRoomData('doormask'), 1);
    }

    generateTunnelGrate(oRoom) {
        const B = this.B;
        const w = oRoom.getWidth();
        const h = oRoom.getHeight();
        this.generateTunnelNormal(oRoom);
        oRoom.generatePillarForest(B.BLOCK_WALL_GRATE, w, h, 0, 0, 2, 2);
        for (let c = 0; c < 4; c++) {
            oRoom.generateCorner(B.BLOCK_WALL, c, (w >> 1) - 2, (h >> 1) - 2);
        }
    }
}

/**
 * Mines : grandes pièces de tunnels, salles fermées à clé entre quatre pièces.
 * -rs taille des pièces
 * -ls taille du labyrinthe
 * -s nombre de magasins
 */
class MinesLevelGenerator extends LevelGenerator {
    constructor(oRnd) {
        super(oRnd);
        this.aDeadends = [];
    }

    generate(nSeed = null) {
        this.oRnd.setRandomSeed(nSeed);

        const rs = this.getOption('rs') * 4 + 13;
        const ls = this.getOption('ls') + 4;

        this.setSize(ls, ls, rs, rs);
        this.setMap(this.buildLaby(0));
        this.processRooms();
        this.aDeadends = [];
        const nShopCount = LevelToolKit.spawnShops(this.aDeadends, this.getOption('s'));

        this.postProcessRooms();

        for (const r1 of this.aRooms) {
            for (const oRoom of r1) {
                LevelToolKit.spawnDoors(this, oRoom);
            }
        }

        this.processLevel();

        this.spawnMineKeysAndLocks(this.buildMineRooms());

        LevelToolKit.spawnSecretPlaces(this);
        LevelToolKit.spawnLastShops(this, nShopCount);
        LevelToolKit.makeFancyWalls(this);
        LevelToolKit.removeNoSpawn(this);
        LevelToolKit.spawnMobs(this);
    }

    processRoom(x, y, oRoom) {
        let sHelper;
        switch (oRoom.getRoomData('type')) {
            case 'entrance':
            case 'exit':
                sHelper = 'dungeon/Elevator';
                break;
            case 'deadend':
                this.aDeadends.push(oRoom);
                sHelper = this.oRnd.choose(ROOM_HELPERS);
                break;
            default:
                sHelper = 'mines/Minetunnel';
        }
        oRoom.setRoomData('helper', sHelper);
    }

    /**
     * Une clé par tranche de taille du niveau ; chaque clé verrouille une
     * salle centrale. Les clés sont posées hors des salles (une clé ne peut
     * pas être enfermée), une salle dont la clé n'a pas pu être posée reste
     * ouverte, et une clé sans salle laisse un support vide.
     * @param {Array} aMineRooms salles construites par buildMineRooms()
     */
    spawnMineKeysAndLocks(aMineRooms) {
        const B = this.B;
        const w = this.nMapWidth;
        const h = this.nMapHeight;
        const isOutsideRooms = (x, y) => aMineRooms.every((r) => x < r.x1 || x > r.x2 || y < r.y1 || y > r.y2);
        // une salle sans porte (aucun tunnel adjacent) ne peut pas être verrouillée
        const aRooms = this.oRnd.shuffle(aMineRooms.filter((r) => r.doors.length));
        for (const [nKey, nMinArea] of [[0, 0], [1, 9], [2, 16], [3, 25]]) {
            if (w * h <= nMinArea) {
                continue;
            }
            let aKey = false;
            for (let nTry = 0; nTry < 10 && !aKey; nTry++) {
                const x = this.oRnd.getRandom(0, w - 1);
                const y = this.oRnd.getRandom(0, h - 1);
                aKey = LevelToolKit.buildKeyHolder(this, x, y, nKey, isOutsideRooms);
            }
            if (!aKey) {
                continue;
            }
            const oRoom = aRooms.shift();
            if (oRoom) {
                for (const [xDoor, yDoor] of oRoom.doors) {
                    this.setCell(xDoor, yDoor, B.BLOCK_LOCKEDDOOR_0 + nKey);
                }
            } else {
                this.setCell(aKey[0], aKey[1], B.BLOCK_EMPTY_KEY);
            }
        }
    }

    /**
     * Construit une salle au centre de chaque carré de 2x2 tunnels.
     * @return {Array} salles { doors: [[x, y]...], x1, y1, x2, y2 (emprise, murs compris) }
     */
    buildMineRooms() {
        const B = this.B;
        const w = this.nMapWidth;
        const h = this.nMapHeight;
        const rw = this.nRoomWidth;
        const rh = this.nRoomHeight;
        const rw2 = rw >> 1;
        const rh2 = rh >> 1;
        const xDIR = [0, 1, 0, -1];
        const yDIR = [-1, 0, 1, 0];
        const aRooms = this.getRooms();
        const isTunnel = (x, y) => aRooms[y][x].getRoomData('type') === '';
        const aDoors = [];
        for (let y = 0; y < h - 1; y++) {
            for (let x = 0; x < w - 1; x++) {
                if (isTunnel(x, y) && isTunnel(x + 1, y) && isTunnel(x, y + 1) && isTunnel(x + 1, y + 1)) {
                    const aRoomDoors = [];
                    let nMask = 0;
                    const wDir = rw2;
                    const hDir = rh2;
                    const xBase = x * (rw - 1) + rw2 + wDir;
                    const yBase = y * (rh - 1) + rh2 + hDir;
                    xDIR.forEach((xDir, nDir) => {
                        const yDir = yDIR[nDir];
                        const nCode = this.getCell(xBase + xDir * wDir, yBase + yDir * hDir);
                        if (nCode === B.BLOCK_DOOR || nCode === B.BLOCK_VOID) {
                            nMask |= 1 << nDir;
                            const xd = xBase + xDir * (wDir - 2);
                            const yd = yBase + yDir * (hDir - 2);
                            const nDoorway = xDir === 0 ? B.BLOCK_DOORWAY_X : B.BLOCK_DOORWAY_Y;
                            this.setCell(xBase + xDir * wDir, yBase + yDir * hDir, B.BLOCK_VOID);
                            this.setCell(xBase + xDir * (wDir + 1), yBase + yDir * (hDir + 1), B.BLOCK_VOID);
                            this.setCell(xBase + xDir * (wDir - 1), yBase + yDir * (hDir - 1), B.BLOCK_VOID);
                            this.setCell(xd, yd, B.BLOCK_DOOR);
                            aRoomDoors.push([xd, yd]);
                            this.setCell(xd + yDir, yd + xDir, nDoorway);
                            this.setCell(xd - yDir, yd - xDir, nDoorway);
                        }
                    });
                    const oRoom = new LabyRoom();
                    oRoom.setSize(rw - 4, rh - 4);
                    oRoom.setRoomData('doormask', nMask);
                    this.block(B.BLOCK_VOID, x * (rw - 1) + rw2 + 3, y * (rh - 1) + rh2 + 3, rw - 6, rh - 6);
                    this.runLabyRoomHelper(this.oRnd.choose(ROOM_HELPERS), oRoom);
                    const x1 = x * (rw - 1) + rw2 + 3;
                    const y1 = y * (rh - 1) + rh2 + 3;
                    this.copy(oRoom, x1, y1);
                    aDoors.push({ doors: aRoomDoors, x1: x1 - 1, y1: y1 - 1, x2: x1 + rw - 6, y2: y1 + rh - 6 });
                }
            }
        }
        return aDoors;
    }
}

MinesLevelGenerator.blocks = require('../dungeon/blocks');
MinesLevelGenerator.helpers = {
    'dungeon/Corners': dungeonRooms.Corners,
    'dungeon/Elevator': dungeonRooms.Elevator,
    'dungeon/Forge': dungeonRooms.Forge,
    'dungeon/Jail': dungeonRooms.Jail,
    'dungeon/Labo': dungeonRooms.Labo,
    'dungeon/Shop': dungeonRooms.Shop,
    'dungeon/Storage': dungeonRooms.Storage,
    'mines/Minetunnel': Minetunnel,
};

module.exports = MinesLevelGenerator;
