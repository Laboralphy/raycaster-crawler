const LevelGenerator = require('../../core/LevelGenerator');
const LevelToolKit = require('../../core/LevelToolKit');
const SecretGenerator = require('../../core/SecretGenerator');
const dungeonRooms = require('../dungeon/rooms');
const rooms = require('./rooms');

/**
 * Tour de mage : labyrinthe à plusieurs chemins, pièces à thème,
 * coffres, points d'apparition et passages secrets.
 * -rs taille des pièces
 * -ls taille du labyrinthe
 * -lc nombre de passes de réouverture de murs
 */
class MagetowerLevelGenerator extends LevelGenerator {
    constructor(oRnd) {
        super(oRnd);
        this._aRoomPalette = [
            'magetower/Library',
            'magetower/Living',
            'dungeon/Jail',
            'magetower/Corners',
            'magetower/Bank',
            'magetower/Storage',
            'magetower/Bar',
        ];
        this._iRoomPalette = 0;
    }

    generate(nSeed = null) {
        const B = this.B;
        this.oRnd.setRandomSeed(nSeed);
        this._aRoomPalette = this.oRnd.shuffle(this._aRoomPalette);
        this.nDefaultVoid = B.BLOCK_VOID;
        this.nDefaultWall = B.BLOCK_WALL;

        const rs = this.getOption('rs') * 2 + 9;
        const ls = this.getOption('ls') + 3;
        const nLabyCurse = this.getOption('lc');

        this.setSize(ls, ls, rs, rs);

        const oLaby = this.buildLaby(1);
        const w = this.nMapWidth;
        const h = this.nMapHeight;

        // réouverture de murs : le labyrinthe ne doit pas être à chemin unique
        for (let l = 0; l < nLabyCurse; ++l) {
            const oLaby2 = this.buildLaby(1);
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    if (this.oRnd.roll100(25)) {
                        oLaby.setCell(x, y, oLaby.getCell(x, y) & oLaby2.getCell(x, y));
                    }
                }
            }
        }

        this.setMap(oLaby);
        this.processRooms();
        this.postProcessRooms();
        this.processRooms('prDoorsSpawnPointsChests');
        this.processLevel();

        LevelToolKit.spawnWindows(this);
        const oSecret = new SecretGenerator(B);
        oSecret.setCorr({
            ' ': B.BLOCK_SECRET_CHECK,
            '*': B.BLOCK_WALL,
            '?': B.BLOCK_DOOR_SECRET,
            '!': B.BLOCK_WALL_SECRET,
            '$': B.BLOCK_CHEST,
            '+': B.BLOCK_WINDOW,
            'd': B.BLOCK_DOOR,
            'c': B.BLOCK_CURTAIN,
        });
        LevelToolKit.spawnSecretPlaces(this, oSecret);

        for (let y = 0; y < this.getHeight(); ++y) {
            for (let x = 0; x < this.getWidth(); ++x) {
                if (this.getCell(x, y) == B.BLOCK_WALL && this.oRnd.roll100(75)) {
                    this.setCell(x, y, this.oRnd.getRandom(0xA1, 0xA3));
                }
            }
        }
    }

    prDoorsSpawnPointsChests(rx, ry, oRoom) {
        this.prDoors(rx, ry, oRoom);
        this.prChests(rx, ry, oRoom);
        this.prSpawnPoints(rx, ry, oRoom);
    }

    prDoors(rx, ry, oRoom) {
        if (oRoom.getRoomData('type') !== '') {
            LevelToolKit.spawnDoors(this, oRoom);
        }
    }

    /** Un point d'apparition sur une case de sol */
    prSpawnPoints(rx, ry, oRoom) {
        const B = this.B;
        const rw = oRoom.getWidth();
        const rh = oRoom.getHeight();
        let x, y, nCellCode;
        do {
            x = this.oRnd.getRandom(0, rw - 1);
            y = this.oRnd.getRandom(0, rh - 1);
            nCellCode = oRoom.getCell(x, y);
        } while (nCellCode != B.BLOCK_VOID && nCellCode != B.BLOCK_LIVING_FLOOR && nCellCode != B.BLOCK_BAR_FLOOR);
        oRoom.setCell(x, y, oRoom.getCell(x, y) | B.BLOCK_SPAWN_POINT);
    }

    /** Un coffre dans un recoin */
    prChests(rx, ry, oRoom) {
        const B = this.B;
        const aChests = oRoom.searchPattern({
            null: '_',
            default: '?',
            [B.BLOCK_WALL]: 'X',
            [B.BLOCK_LIVING_WALL]: 'X',
            [B.BLOCK_LIVING_DECO]: 'X',
            [B.BLOCK_JAIL_WALL]: 'X',
            [B.BLOCK_VOID]: '.',
        }, ['X.XXX', 'XX.XX', 'XXX.X', 'XXXX.', '..XXX', '.X.XX', '.XX.X', '.XXX.']);
        if (aChests.length) {
            const [x, y] = this.oRnd.choose(aChests);
            oRoom.setCell(x, y, B.BLOCK_CHEST);
        }
    }

    /** Pièce suivante de la palette (cyclique) */
    chooseRoom() {
        const sRoom = this._aRoomPalette[this._iRoomPalette];
        this._iRoomPalette = (this._iRoomPalette + 1) % this._aRoomPalette.length;
        return sRoom;
    }

    /** Fusionne la pièce avec sa voisine précédente si celle-ci est une pièce */
    mergeWithPrevious(oRoom, oLastRoom, nLastDoor, nDoor) {
        const sType = oLastRoom.getRoomData('type');
        if (sType == 'deadend' || sType == 'exit' || sType == 'entrance' || sType == 'room') {
            oLastRoom.setRoomData('doormask', oLastRoom.getRoomData('doormask') | nLastDoor);
            oRoom.setRoomData('doormask', oRoom.getRoomData('doormask') | nDoor);
            oLastRoom.setRoomData('type', 'room');
            oLastRoom.setRoomData('helper', this.chooseRoom());
            oRoom.setRoomData('type', 'room');
            oRoom.setRoomData('helper', this.chooseRoom());
        }
    }

    processRoom(x, y, oRoom) {
        switch (oRoom.getRoomData('type')) {
            case 'deadend':
            case 'exit':
            case 'entrance':
                oRoom.setRoomData('helper', this.chooseRoom());
                // les pièces en façade s'ouvrent sur leur voisine
                if (y == 0 || y == this.nMapHeight - 1) {
                    if (x > 0) {
                        this.mergeWithPrevious(oRoom, this.aRooms[y][x - 1], 2, 8);
                    }
                } else if (x == 0 || x == this.nMapWidth - 1) {
                    if (y > 0) {
                        this.mergeWithPrevious(oRoom, this.aRooms[y - 1][x], 4, 1);
                    }
                }
                break;

            case 'room':
                oRoom.setRoomData('helper', this.chooseRoom());
                break;

            default:
                oRoom.setRoomData('helper', 'magetower/Corridor');
                switch (oRoom.getRoomData('doormask')) {
                    case 15:
                        oRoom.setRoomData('helper', 'magetower/TXCorridor');
                        break;
                    case 7:
                    case 11:
                    case 13:
                    case 14:
                        if (this.oRnd.roll100(50)) {
                            oRoom.setRoomData('helper', this.chooseRoom());
                            oRoom.setRoomData('type', 'room');
                        } else {
                            oRoom.setRoomData('helper', 'magetower/TXCorridor');
                        }
                        break;
                    case 5:
                    case 10:
                        break;
                    default:
                        if (this.oRnd.roll100(30)) {
                            oRoom.setRoomData('helper', 'magetower/Corners');
                        }
                        break;
                }
                break;
        }
    }
}

MagetowerLevelGenerator.blocks = require('./blocks');
MagetowerLevelGenerator.helpers = {
    'dungeon/Jail': dungeonRooms.Jail,
    'magetower/Bank': rooms.Bank,
    'magetower/Bar': rooms.Bar,
    'magetower/Corners': rooms.Corners,
    'magetower/Corridor': rooms.Corridor,
    'magetower/Library': rooms.Library,
    'magetower/Living': rooms.Living,
    'magetower/Storage': rooms.Storage,
    'magetower/TXCorridor': rooms.TXCorridor,
};

module.exports = MagetowerLevelGenerator;
