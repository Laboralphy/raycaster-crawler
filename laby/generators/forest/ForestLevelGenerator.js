const LevelGenerator = require('../../core/LevelGenerator');
const LevelToolKit = require('../../core/LevelToolKit');
const LabyRoomHelper = require('../../core/LabyRoomHelper');
const { RangeException, looseEq } = require('../../core/errors');

/** Clairière : rangées d'arbres autour d'un espace dégagé */
class Glade extends LabyRoomHelper {
    generate(oRoom) {
        const B = this.B;
        const w = oRoom.getWidth();
        const h = oRoom.getHeight();
        oRoom.generatePillarForest(B.BLOCK_FOREST_TREE, w - 1, h, 1, 0, 2, 2);
        oRoom.generateCentralPillar(B.BLOCK_VOID, w, h - 4);
        oRoom.getPeri().generateDunHallway(B.BLOCK_FOREST_TREE, oRoom.getRoomData('doormask'), w);
    }
}

/** Sentier : clairière avec un bosquet central */
class Track extends Glade {
    generate(oRoom) {
        super.generate(oRoom);
        const B = this.B;
        const w = oRoom.getWidth();
        const h = oRoom.getHeight();
        oRoom.generateCentralPillar(B.BLOCK_FOREST_TREE, 1, 1);
        if (w === 5) {
            return;
        }
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                if (x !== 1 && y !== 1 && (x & 1) == (y & 1)) {
                    oRoom.setCell((w >> 1) - 1 + x, (h >> 1) - 1 + y, B.BLOCK_FOREST_TREE);
                }
            }
        }
    }
}

/** Bosquet : objets (buissons) semés au hasard */
class Grove extends LabyRoomHelper {
    generate(oRoom) {
        const B = this.B;
        const w = oRoom.getWidth();
        const h = oRoom.getHeight();
        for (let x = 0; x < w; ++x) {
            oRoom.setCell(this.oRnd.getRandom(0, w - 1), this.oRnd.getRandom(0, h - 1), B.BLOCK_SOB_TYPE_1);
        }
        oRoom.getPeri().generateDunHallway(B.BLOCK_FOREST_TREE, oRoom.getRoomData('doormask'), w);
    }
}

/** Entrée ou sortie du niveau, orientée selon l'unique issue */
class Entrance extends Glade {
    generate(oRoom) {
        const B = this.B;
        const nDoor = oRoom.getRoomData('doormask');
        const bExit = oRoom.getRoomData('type') == 'exit';
        const w = oRoom.getWidth();
        const h = oRoom.getHeight();
        const w2 = w >> 1;
        const h2 = h >> 1;
        let x = 0, y = 0;
        switch (nDoor) {
            case 1:
                x = 0;
                y = 1;
                oRoom.generateCorner(B.BLOCK_FOREST_TREE, 3, 2, 2);
                oRoom.generateCorner(B.BLOCK_FOREST_TREE, 2, 2, 2);
                break;
            case 2:
                x = -1;
                y = 0;
                oRoom.generateCorner(B.BLOCK_FOREST_TREE, 3, 2, 2);
                oRoom.generateCorner(B.BLOCK_FOREST_TREE, 0, 2, 2);
                break;
            case 4:
                x = 0;
                y = -1;
                oRoom.generateCorner(B.BLOCK_FOREST_TREE, 0, 2, 2);
                oRoom.generateCorner(B.BLOCK_FOREST_TREE, 1, 2, 2);
                break;
            case 8:
                x = 1;
                y = 0;
                oRoom.generateCorner(B.BLOCK_FOREST_TREE, 1, 2, 2);
                oRoom.generateCorner(B.BLOCK_FOREST_TREE, 2, 2, 2);
                break;
        }
        oRoom.setCell(w2 + x, h2 + y, bExit ? B.BLOCK_ELEVATOR_EXIT : B.BLOCK_ELEVATOR_ENTRANCE);
        oRoom.setCell(w2 + 2 * x, h2 + 2 * y, bExit ? B.BLOCK_ELEVATOR_SWITCH_NEXT : B.BLOCK_ELEVATOR_SWITCH_PREV);
        oRoom.setCell(w2 + 2 * x + y, h2 + 2 * y + x, B.BLOCK_FOREST_TREE);
        oRoom.setCell(w2 + 2 * x - y, h2 + 2 * y - x, B.BLOCK_FOREST_TREE);
        if (bExit) {
            oRoom.setCell(w2 + x + 2 * y, h2 + y + 2 * x, B.BLOCK_WALL_TORCH);
            oRoom.setCell(w2 + x - 2 * y, h2 + y - 2 * x, B.BLOCK_WALL_TORCH);
        }
        try {
            oRoom.setCell(w2 + 3 * x - y, h2 + 3 * y - x, B.BLOCK_FOREST_TREE);
            oRoom.setCell(w2 + 3 * x + y, h2 + 3 * y + x, B.BLOCK_FOREST_TREE);
            oRoom.setCell(w2 + 3 * x, h2 + 3 * y, B.BLOCK_FOREST_TREE);
        } catch (e) {
            if (!(e instanceof RangeException)) throw e;
        }
        oRoom.getPeri().generateDunHallway(B.BLOCK_FOREST_TREE, oRoom.getRoomData('doormask'), w);
    }
}

/**
 * Forêt : clairières et sentiers, avec éventuellement un donjon (-w1)
 * en bordure nord en guise de sortie.
 * -rs taille des pièces
 * -ls taille du labyrinthe
 * -w donjon
 */
class ForestLevelGenerator extends LevelGenerator {
    generate(nSeed = null) {
        this.oRnd.setRandomSeed(nSeed);
        const rs = this.getOption('rs') * 2 + 7;
        const ls = this.getOption('ls') + 3;
        this.setSize(ls, ls, rs, rs);
        this.setMap(this.buildLaby(0, null, ls - 1));
        this.processRooms();
        this.postProcessRooms();
        this.processLevel();
        this.fillGroove();
        LevelToolKit.removeNoSpawn(this);
        if (this.getOption('w')) {
            this.spawnKeep();
        } else {
            LevelToolKit.spawnMobs(this, -3);
        }
    }

    /** Façade du donjon le long du bord nord */
    spawnKeep() {
        const B = this.B;
        const w2 = this.getWidth() >> 1;
        for (let x = 2; x < w2; ++x) {
            const nWall = x % 3 == 1 ? B.BLOCK_FOREST_SHADOW_WINDOW : B.BLOCK_FOREST_SHADOW_WALL;
            const nIvy = x % 3 == 1 ? B.BLOCK_WINDOW : B.BLOCK_FOREST_WALL_IVY;
            this.setCell(x + w2, 0, nWall);
            this.setCell(x + w2, 1, B.BLOCK_VOID);
            this.setCell(x + w2, 2, nIvy);
            this.setCell(w2 - x, 0, nWall);
            this.setCell(w2 - x, 1, B.BLOCK_VOID);
            this.setCell(w2 - x, 2, nIvy);
        }
        this.block(B.BLOCK_WALL, w2 - 1, 0, 3, 3);
        this.setCell(w2, 1, B.BLOCK_ELEVATOR_SWITCH_NEXT);
        this.setCell(w2, 2, B.BLOCK_ELEVATOR_EXIT);
        this.block(B.BLOCK_VOID, w2 - 1, 3, 3, 3);
        this.setCell(w2 - 1, 3, B.BLOCK_WALL_TORCH);
        this.setCell(w2 + 1, 3, B.BLOCK_WALL_TORCH);
    }

    processRoom(x, y, oRoom) {
        if (this.oMap.isEntrance(x, y) || (this.oMap.isExit(x, y) && !this.getOption('w'))) {
            oRoom.setRoomData('helper', 'forest/Entrance');
        } else {
            oRoom.setRoomData('helper', this.oRnd.choose(['forest/Track', 'forest/Glade', 'forest/Grove']));
        }
    }

    /** Masque des voisines (nord, est, sud, ouest) égales à nCode (hors carte = vide) */
    neighbourMask(x, y, nCode) {
        let n = 0;
        this.getCellNeighborhood(x, y).forEach((c, k) => {
            n |= (looseEq(c, nCode) ? 1 : 0) << k;
        });
        return n;
    }

    /** Comble les creux entre les arbres, et transforme les arbres isolés en objets */
    fillGroove() {
        const B = this.B;
        const w = this.getWidth();
        const h = this.getHeight();
        const aCreux = [B.BLOCK_FOREST_BUSH, B.BLOCK_FOREST_FENCE];
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const n = this.neighbourMask(x, y, B.BLOCK_FOREST_TREE);
                if (this.getCell(x, y) === B.BLOCK_VOID) {
                    switch (n) {
                        case 7:
                        case 11:
                        case 13:
                        case 14:
                            this.setCell(x, y, this.oRnd.choose(aCreux));
                            break;
                    }
                }
            }
        }
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const n = this.neighbourMask(x, y, B.BLOCK_VOID);
                if (this.getCell(x, y) === B.BLOCK_FOREST_TREE && n === 15) {
                    this.setCell(x, y, B.BLOCK_SOB_TYPE_1);
                }
            }
        }
    }
}

ForestLevelGenerator.blocks = require('./blocks');
ForestLevelGenerator.helpers = {
    'forest/Entrance': Entrance,
    'forest/Glade': Glade,
    'forest/Grove': Grove,
    'forest/Track': Track,
};

module.exports = ForestLevelGenerator;
