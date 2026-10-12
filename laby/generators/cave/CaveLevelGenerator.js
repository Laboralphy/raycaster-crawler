const LevelGenerator = require('../../core/LevelGenerator');
const LevelToolKit = require('../../core/LevelToolKit');
const CellularRoomHelper = require('../../core/CellularRoomHelper');
const dungeonRooms = require('../dungeon/rooms');

/** Grotte à densité de roche aléatoire */
class Cave extends CellularRoomHelper {
    constructor(oRnd, B) {
        super(oRnd, B);
        this._nHoleDensity = 80;
        this.nHallwayCode = B.BLOCK_WALL;
        this.nFillCode = B.BLOCK_WALL;
    }

    generate(oRoom) {
        this._nHoleDensity = this.oRnd.choose([20, 30, 40, 50, 60, 70, 80, 90]);
        this.generateCellular(oRoom);
    }
}

/**
 * Grottes
 * -rsX : taille des pièces
 * -lsX : taille du labyrinthe
 * -tX : type de labyrinthe 0:exploration 1:fusion
 * -sX : nombre de magasins
 * -d1 : décor (bulles)
 * -p1 : portail
 */
class CaveLevelGenerator extends LevelGenerator {
    constructor(oRnd) {
        super(oRnd);
        this.aDeadends = [];
    }

    generate(nSeed = null) {
        this.oRnd.setRandomSeed(nSeed);

        const rs = this.getOption('rs') * 2 + 7;
        const ls = this.getOption('ls') + 4;
        const nAlgo = this.getOption('t');
        this.setSize(ls, ls, rs, rs);
        this.setMap(this.buildLaby(nAlgo));
        this.processRooms();
        this.spawnPortal();
        const nShopCount = LevelToolKit.spawnShops(this.aDeadends, this.getOption('s'));

        this.postProcessRooms();
        if (this.getOption('d')) {
            this.spawnDecorum();
        }
        this.processLevel();

        LevelToolKit.spawnSecretPlaces(this);
        LevelToolKit.spawnLastShops(this, nShopCount);
        LevelToolKit.makeFancyWalls(this);
        LevelToolKit.spawnMobs(this);
        LevelToolKit.removeNoSpawn(this);
        LevelToolKit.spawnTorches(this);
    }

    processRoom(x, y, oRoom) {
        switch (oRoom.getRoomData('type')) {
            case 'entrance':
            case 'exit':
                oRoom.setRoomData('helper', 'dungeon/Elevator');
                break;

            case 'deadend':
                this.aDeadends.push(oRoom);
            // fallthrough
            default:
                oRoom.setRoomData('helper', 'cave/Cave');
        }
    }

    /** Place un portail (un seul au maximum) */
    spawnPortal() {
        if (this.getOption('p') && this.aDeadends.length) {
            const oRoom = this.aDeadends.shift();
            oRoom.setRoomData('type', 'portal');
            oRoom.setRoomData('helper', 'dungeon/Elevator');
        }
    }

    /** Une bulle (objet décoratif) par pièce */
    spawnDecorum() {
        spawnDecorum(this);
    }
}

/** Place un objet décoratif au hasard dans chaque pièce (partagé avec boss) */
function spawnDecorum(oLevel) {
    const B = oLevel.B;
    for (const r of oLevel.aRooms) {
        for (const oRoom of r) {
            const aVoids = [];
            for (let y = 0; y < oRoom.getHeight(); ++y) {
                for (let x = 0; x < oRoom.getWidth(); ++x) {
                    if (oRoom.getCell(x, y) == B.BLOCK_VOID) {
                        aVoids.push([x, y]);
                    }
                }
            }
            const aXY = oLevel.oRnd.choose(aVoids);
            const nSob = oLevel.oRnd.getRandom(B.BLOCK_SOB_TYPE_1, B.BLOCK_SOB_TYPE_5);
            if (aXY) {
                oRoom.setCell(aXY[0], aXY[1], nSob);
            }
        }
    }
}

CaveLevelGenerator.blocks = require('../dungeon/blocks');
CaveLevelGenerator.helpers = {
    'cave/Cave': Cave,
    'dungeon/Elevator': dungeonRooms.Elevator,
    'dungeon/Shop': dungeonRooms.Shop,
};
CaveLevelGenerator.spawnDecorum = spawnDecorum;

module.exports = CaveLevelGenerator;
