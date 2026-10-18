const LevelGenerator = require('../../core/LevelGenerator');
const LevelToolKit = require('../../core/LevelToolKit');
const LabyRoomHelper = require('../../core/LabyRoomHelper');
const BossLevelGenerator = require('../boss/BossLevelGenerator');

/** Ascenseur compact, dont la porte de sortie est descellée */
class Elevator extends BossLevelGenerator.Elevator {
    get nExitDoorCode() {
        return this.B.BLOCK_ELEVATOR_DOOR_NEXT_UNSEALED;
    }
}

/** Salle au trésor : damier de coffres, relique dans la dernière pièce */
class Treasure extends LabyRoomHelper {
    generate(oRoom) {
        const nDoors = oRoom.getRoomData('doormask');
        switch (oRoom.getRoomData('type')) {
            case 'deadend':
                this.digNormal(oRoom);
                this.fillDEChest(oRoom, nDoors);
                break;
            case 'exit':
                this.digFinal(oRoom, nDoors);
                break;
            default:
                this.digNormal(oRoom);
                this.fillNormChest(oRoom, nDoors);
                break;
        }
    }

    /** Damier de coffres en bordure de pièce, motif tiré au hasard */
    fillChestboard(oRoom) {
        const B = this.B;
        let a;
        switch (this.oRnd.getRandom(1, 3)) {
            case 1:
                a = [B.BLOCK_WALL, B.BLOCK_TREASURE, B.BLOCK_WALL, B.BLOCK_VOID, B.BLOCK_WALL, B.BLOCK_VOID];
                break;
            case 2:
                a = [B.BLOCK_WALL, B.BLOCK_TREASURE, B.BLOCK_WALL, B.BLOCK_VOID];
                break;
            case 3:
                a = [B.BLOCK_WALL, B.BLOCK_TREASURE];
                break;
        }
        oRoom.generateChestboard(a, 0, 0, oRoom.getWidth(), oRoom.getHeight());
        oRoom.generateCentralPillar(B.BLOCK_VOID, oRoom.getWidth() - 2, oRoom.getHeight() - 2);
    }

    fillNormChest(oRoom, nDoors) {
        const BLOCK_VOID = this.B.BLOCK_VOID;
        this.fillChestboard(oRoom);
        const w2 = oRoom.getWidth() >> 1;
        const h2 = oRoom.getHeight() >> 1;
        // dégager chaque issue
        for (const [nMask, xDir, yDir] of [[1, 0, -1], [2, 1, 0], [4, 0, 1], [8, -1, 0]]) {
            if (nDoors & nMask) {
                oRoom.setCell(w2 + xDir * w2, h2 + yDir * h2, BLOCK_VOID);
                oRoom.setCell(w2 + xDir * w2 + yDir * 2, h2 + yDir * h2 + xDir * 2, BLOCK_VOID);
                oRoom.setCell(w2 + xDir * w2 - yDir * 2, h2 + yDir * h2 - xDir * 2, BLOCK_VOID);
            }
        }
    }

    fillDEChest(oRoom, nDoors) {
        this.fillChestboard(oRoom);
        let xDir = 0, yDir = 0;
        for (const [nMask, x, y] of [[1, 0, -1], [2, 1, 0], [4, 0, 1], [8, -1, 0]]) {
            if (nDoors & nMask) {
                xDir = x;
                yDir = y;
            }
        }
        const w2 = oRoom.getWidth() >> 1;
        const h2 = oRoom.getHeight() >> 1;
        oRoom.setCell(w2 + xDir * w2, h2 + yDir * h2, this.B.BLOCK_VOID);
    }

    digNormal(oRoom) {
        oRoom.generatePillarForest(this.B.BLOCK_WALL, oRoom.getWidth(), oRoom.getHeight(), 0, 0, 2, 2);
        oRoom.generateCentralPillar(this.B.BLOCK_VOID, 3, 3);
    }

    digFinal(oRoom, nDoors) {
        const B = this.B;
        oRoom.generatePillarForest(B.BLOCK_WALL, oRoom.getWidth(), oRoom.getHeight(), 0, 0, 2, 2);
        oRoom.generateCentralPillar(B.BLOCK_VOID, oRoom.getWidth() - 4, oRoom.getHeight() - 4);
        let xDir = 0, yDir = 0;
        if (nDoors & 1) {
            xDir = 0;
            yDir = 1;
            oRoom.generateCorner(B.BLOCK_WALL, 2, 2, 2);
            oRoom.generateCorner(B.BLOCK_WALL, 3, 2, 2);
            oRoom.generateCorner(B.BLOCK_WALL, 2, 3, 1);
            oRoom.generateCorner(B.BLOCK_WALL, 3, 3, 1);
        }
        if (nDoors & 2) {
            xDir = -1;
            yDir = 0;
            oRoom.generateCorner(B.BLOCK_WALL, 0, 2, 2);
            oRoom.generateCorner(B.BLOCK_WALL, 3, 2, 2);
            oRoom.generateCorner(B.BLOCK_WALL, 0, 1, 3);
            oRoom.generateCorner(B.BLOCK_WALL, 3, 1, 3);
        }
        if (nDoors & 4) {
            xDir = 0;
            yDir = -1;
            oRoom.generateCorner(B.BLOCK_WALL, 0, 2, 2);
            oRoom.generateCorner(B.BLOCK_WALL, 1, 2, 2);
            oRoom.generateCorner(B.BLOCK_WALL, 0, 3, 1);
            oRoom.generateCorner(B.BLOCK_WALL, 1, 3, 1);
        }
        if (nDoors & 8) {
            xDir = 1;
            yDir = 0;
            oRoom.generateCorner(B.BLOCK_WALL, 1, 2, 2);
            oRoom.generateCorner(B.BLOCK_WALL, 2, 2, 2);
            oRoom.generateCorner(B.BLOCK_WALL, 1, 1, 3);
            oRoom.generateCorner(B.BLOCK_WALL, 2, 1, 3);
        }
        const w2 = oRoom.getWidth() >> 1;
        const h2 = oRoom.getHeight() >> 1;
        // grand coffre
        oRoom.setCell(w2 + xDir * w2, h2 + yDir * h2, B.BLOCK_RELIC_CHEST);
        // coffres normaux
        oRoom.setCell(w2 + yDir * w2, h2 + xDir * h2, B.BLOCK_TREASURE);
        oRoom.setCell(w2 - yDir * w2, h2 - xDir * h2, B.BLOCK_TREASURE);
        oRoom.setCell(w2 + yDir * w2 - 2 * xDir, h2 + xDir * h2 - 2 * yDir, B.BLOCK_TREASURE);
        oRoom.setCell(w2 - yDir * w2 - 2 * xDir, h2 - xDir * h2 - 2 * yDir, B.BLOCK_TREASURE);
        oRoom.setCell(w2 + yDir * (w2 - 1) - 3 * xDir, h2 + xDir * (h2 - 1) - 3 * yDir, B.BLOCK_TREASURE);
        oRoom.setCell(w2 - yDir * (w2 - 1) - 3 * xDir, h2 - xDir * (h2 - 1) - 3 * yDir, B.BLOCK_TREASURE);
        if (oRoom.getRoomData('portal')) {
            this.digPortal(oRoom, -xDir, -yDir);
        }
    }

    /**
     * Portail au centre de la pièce de la relique, ouvert vers la porte de la
     * pièce (xDoor, yDoor) : cabine (BLOCK_ELEVATOR_PORTAL), levier au fond.
     * Murs sur les côtés et aux deux coins avant ; les coins arrière restent
     * libres pour contourner la cabine jusqu'à la relique, placée derrière.
     * Le jeu place le point d'arrivée devant l'ouverture (Game.rld_loadLevel).
     */
    digPortal(oRoom, xDoor, yDoor) {
        const B = this.B;
        const w2 = oRoom.getWidth() >> 1;
        const h2 = oRoom.getHeight() >> 1;
        const xSide = yDoor, ySide = xDoor;
        for (const n of [-1, 1]) {
            oRoom.setCell(w2 + n * xSide, h2 + n * ySide, B.BLOCK_WALL);
            oRoom.setCell(w2 + xDoor + n * xSide, h2 + yDoor + n * ySide, B.BLOCK_WALL);
        }
        oRoom.setCell(w2 + xDoor, h2 + yDoor, B.BLOCK_VOID);
        oRoom.setCell(w2 - xDoor, h2 - yDoor, B.BLOCK_ELEVATOR_SWITCH_PORTAL);
        oRoom.setCell(w2, h2, B.BLOCK_ELEVATOR_PORTAL);
    }
}

/**
 * Niveau spécial : salles au trésor.
 * -rsX : taille des pièces
 * -lsX : taille du labyrinthe
 * -tX : type de labyrinthe 0:exploration 1:fusion
 * -p1 : portail au centre de la pièce de la relique
 */
class SpecialLevelGenerator extends LevelGenerator {
    generate(nSeed = null) {
        this.oRnd.setRandomSeed(nSeed);

        const rs = this.getOption('rs') * 2 + 9;
        const ls = this.getOption('ls') + 4;
        const nAlgo = this.getOption('t');

        this.setSize(ls, ls, rs, rs);
        this.setMap(this.buildLaby(nAlgo));
        this.processRooms();
        this.postProcessRooms();
        this.processLevel();
        LevelToolKit.removeNoSpawn(this);
    }

    processRoom(x, y, oRoom) {
        oRoom.setRoomData('helper', oRoom.getRoomData('type') === 'entrance' ? 'dungeon/Elevator' : 'special/Treasure');
        // -p1 : un portail dans la pièce de la relique
        if (oRoom.getRoomData('type') === 'exit' && this.getOption('p')) {
            oRoom.setRoomData('portal', true);
        }
    }
}

SpecialLevelGenerator.blocks = require('../dungeon/blocks');
SpecialLevelGenerator.helpers = {
    // l'entrée utilise l'ascenseur compact à porte descellée
    'dungeon/Elevator': Elevator,
    'special/Treasure': Treasure,
};

module.exports = SpecialLevelGenerator;
