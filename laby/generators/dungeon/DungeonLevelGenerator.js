const LevelGenerator = require('../../core/LevelGenerator');
const LevelToolKit = require('../../core/LevelToolKit');
const rooms = require('./rooms');

const ROOM_HELPERS = [
    'dungeon/Corners',
    'dungeon/Corners',
    'dungeon/Corners',
    'dungeon/Corners',
    'dungeon/Library',
    'dungeon/Living',
    'dungeon/Jail',
    'dungeon/Watch',
    'dungeon/Labo',
    'dungeon/Kitchen',
    'dungeon/Forge',
    'dungeon/Church',
    'dungeon/Storage',
];

/**
 * Donjon : pièces aménagées et couloirs, portes, clés de couleur,
 * passages secrets, magasins et monstres.
 *
 * Options :
 * -rs taille des pièces
 * -ls taille du labyrinthe
 * -t type d'algo 0=explo 1=fusion
 * -s nombre de magasins
 * -p présence d'un portail
 * -rl -10% de pièces par unité
 * -rm +10% de pièces par unité
 */
class DungeonLevelGenerator extends LevelGenerator {
    constructor(oRnd) {
        super(oRnd);
        this.aDeadends = [];
        this.nRoomProb = 50;
    }

    generate(nSeed = null) {
        this.oRnd.setRandomSeed(nSeed);

        const rs = this.getOption('rs') * 2 + 9;
        const ls = this.getOption('ls') + 4;
        const nAlgo = this.getOption('t');
        this.nRoomProb -= this.getOption('rl') * 10;
        this.nRoomProb += this.getOption('rm') * 10;

        this.setSize(ls, ls, rs, rs);
        this.setMap(this.buildLaby(nAlgo));
        this.processRooms();

        // mélanger les impasses afin de créer les pièces spéciales
        this.aDeadends = this.oRnd.shuffle(this.aDeadends);

        this.spawnPortal();

        const nShopCount = LevelToolKit.spawnShops(this.aDeadends, this.getOption('s'));

        this.postProcessRooms();

        for (const r1 of this.aRooms) {
            for (const oRoom of r1) {
                LevelToolKit.spawnDoors(this, oRoom);
            }
        }

        this.processLevel();

        LevelToolKit.spawnWindows(this);
        LevelToolKit.spawnLockedDoorsAndKeys(this);
        LevelToolKit.spawnSecretPlaces(this);
        LevelToolKit.spawnLastShops(this, nShopCount);
        LevelToolKit.makeFancyWalls(this);
        LevelToolKit.removeNoSpawn(this);
        LevelToolKit.spawnMobs(this);
        LevelToolKit.spawnTorches(this);
    }

    processRoom(x, y, oRoom) {
        let sHelper = '';
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
                if (this.oRnd.roll100(this.nRoomProb)) {
                    sHelper = this.oRnd.choose(ROOM_HELPERS);
                    oRoom.setRoomData('type', 'room');
                } else {
                    this.spawnIntersection(oRoom, this.oRnd.getRandom(0, 3));
                    oRoom.setRoomData('type', 'corridor');
                }
                break;
        }
        if (sHelper) {
            oRoom.setRoomData('helper', sHelper);
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

    /**
     * Fabrique une intersection de couloirs
     * @param nType 0: large, 1: étroite, 2: large avec piliers, 3: large avec alcôves
     */
    spawnIntersection(oRoom, nType) {
        const BLOCK_WALL = this.B.BLOCK_WALL;
        const nDoors = oRoom.getRoomData('doormask');
        const oPeri = oRoom.getPeri();
        switch (nType) {
            case 0:
                oRoom.generateDunHallway(BLOCK_WALL, nDoors, 3);
                oPeri.generateDunHallway(BLOCK_WALL, nDoors, 3);
                break;
            case 1:
                oRoom.generateDunHallway(BLOCK_WALL, nDoors, 1);
                oPeri.generateDunHallway(BLOCK_WALL, nDoors, 3);
                break;
            case 2:
                oRoom.generateDunHallway(BLOCK_WALL, nDoors, 3);
                oPeri.generateDunHallway(BLOCK_WALL, nDoors, 3);
                oRoom.generatePillarForest(BLOCK_WALL, oRoom.getWidth() - 1, oRoom.getHeight() - 1, 1, 1, 2, 2);
                break;
            case 3:
                oRoom.generateDunHallway(BLOCK_WALL, nDoors, 3);
                oPeri.generateDunHallway(BLOCK_WALL, nDoors, 3);
                oRoom.generatePillarForest(BLOCK_WALL, oRoom.getWidth() - 3, oRoom.getHeight() - 3, 2, 2, 2, 2);
                break;
        }
    }
}

DungeonLevelGenerator.blocks = require('./blocks');
DungeonLevelGenerator.helpers = {
    'dungeon/Church': rooms.Church,
    'dungeon/Corners': rooms.Corners,
    'dungeon/Elevator': rooms.Elevator,
    'dungeon/Forge': rooms.Forge,
    'dungeon/Jail': rooms.Jail,
    'dungeon/Kitchen': rooms.Kitchen,
    'dungeon/Labo': rooms.Labo,
    'dungeon/Library': rooms.Library,
    'dungeon/Living': rooms.Living,
    'dungeon/Shop': rooms.Shop,
    'dungeon/Storage': rooms.Storage,
    'dungeon/Watch': rooms.Watch,
};

module.exports = DungeonLevelGenerator;
