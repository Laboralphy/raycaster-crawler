const RoomGenerator = require('./RoomGenerator');
const LabyGenerator = require('./LabyGenerator');
const LabyRoom = require('./LabyRoom');

/** Table de codes de blocs dont la lecture d'un code inconnu lève une erreur */
function strictBlocks(oBlocks) {
    return new Proxy(oBlocks, {
        get(target, sName) {
            if (typeof sName === 'string' && !(sName in target)) {
                throw new Error(`Undefined constant "${sName}"`);
            }
            return target[sName];
        },
    });
}

/**
 * Classe de base des générateurs de niveau.
 * Le niveau est une grille de pièces (nMapWidth x nMapHeight) de
 * nRoomWidth x nRoomHeight blocs, les murs mitoyens étant partagés.
 *
 * Les sous-classes définissent :
 * - generate(nSeed) et processRoom(x, y, oRoom)
 * - static blocks : table des codes de blocs
 * - static helpers : { 'chemin/Nom': classe LabyRoomHelper }
 */
class LevelGenerator extends RoomGenerator {
    constructor(oRnd) {
        super();
        this.oRnd = oRnd;
        this.B = strictBlocks(this.constructor.blocks);
        this.nRoomWidth = 11;
        this.nRoomHeight = 11;
        this.nMapWidth = 4;
        this.nMapHeight = 4;
        this.oMap = null;
        this.aRooms = [];
        this.nDefaultVoid = 0;
        this.nDefaultWall = 1;
        this.aOptions = {};
    }

    getRoomWidth() {
        return this.nRoomWidth;
    }

    getRoomHeight() {
        return this.nRoomHeight;
    }

    getMapWidth() {
        return this.nMapWidth;
    }

    getMapHeight() {
        return this.nMapHeight;
    }

    getRooms() {
        return this.aRooms;
    }

    /**
     * Modifie la taille de la carte du niveau
     * @param x, y nombre de pièces
     * @param rw, rh taille des pièces
     */
    setSize(x, y, rw = null, rh = null) {
        this.nMapWidth = x;
        this.nMapHeight = y;
        this.nRoomWidth = rw ?? this.nRoomWidth;
        this.nRoomHeight = rh ?? this.nRoomHeight;
        super.setSize(x * (this.nRoomWidth - 1) + 1, y * (this.nRoomHeight - 1) + 1);
    }

    /** Appelle un helper d'aménagement de pièce ('chemin/Nom') */
    runLabyRoomHelper(sHelper, oRoom) {
        const Helper = this.constructor.helpers[sHelper];
        if (!Helper) {
            throw new Error(`unknown room helper: ${sHelper}`);
        }
        return new Helper(this.oRnd, this.B).generate(oRoom);
    }

    /** Lit les options sous la forme "-rs2-ls1" */
    setOptions(s) {
        for (const m of String(s || '').matchAll(/-([a-zA-Z]+)([0-9]+)/g)) {
            this.aOptions[m[1]] = parseInt(m[2], 10);
        }
    }

    /** Renvoie la valeur de l'option, ou 0 si elle est absente */
    getOption(x) {
        return Object.prototype.hasOwnProperty.call(this.aOptions, x) ? this.aOptions[x] : 0;
    }

    /**
     * Construction d'un labyrinthe
     * @param nAlgo 0: exploration, 1: fusion (toute autre valeur : aucun passage)
     */
    buildLaby(nAlgo, xStart = null, yStart = null) {
        const oLaby = new LabyGenerator(this.oRnd);
        const w = this.nMapWidth;
        const h = this.nMapHeight;
        oLaby.setSize(w, h);
        xStart = xStart ? xStart : this.oRnd.getRandom(0, w - 1);
        yStart = yStart ? yStart : this.oRnd.getRandom(0, h - 1);
        switch (nAlgo) {
            case 0:
                oLaby.exploration(xStart, yStart);
                break;
            case 1:
                oLaby.fusion(xStart, yStart);
                break;
        }
        return oLaby;
    }

    /** Création des pièces (au premier appel), puis appel de sProc sur chacune */
    processRooms(sProc = 'processRoom') {
        const w = this.nMapWidth;
        const h = this.nMapHeight;
        const oLaby = this.getMap();
        const nDW = this.nDefaultWall;
        const nDV = this.nDefaultVoid;
        if (this.aRooms.length === 0) {
            for (let y = 0; y < h; ++y) {
                const aRoomRow = [];
                for (let x = 0; x < w; ++x) {
                    const oRoom = new LabyRoom();
                    oRoom.setSize(this.nRoomWidth, this.nRoomHeight);
                    oRoom.block(nDV, 0, 0, this.nRoomWidth - 2, this.nRoomHeight - 2);

                    const nDoorMask = oLaby.getDoorMask(x, y);
                    const aRoomData = { doormask: nDoorMask };
                    const oPeri = oRoom.getPeri();
                    oPeri.block(nDW, 0, 0, this.nRoomWidth, this.nRoomHeight);
                    oPeri.generateDunHallway(nDW, nDoorMask, 1);

                    if (oLaby.isExit(x, y)) {
                        aRoomData.type = 'exit';
                    } else if (oLaby.isEntrance(x, y)) {
                        aRoomData.type = 'entrance';
                    } else if (nDoorMask === 1 || nDoorMask === 2 || nDoorMask === 4 || nDoorMask === 8) {
                        aRoomData.type = 'deadend';
                    } else {
                        aRoomData.type = '';
                    }
                    aRoomData.x = x;
                    aRoomData.y = y;
                    aRoomData.xmax = w;
                    aRoomData.ymax = h;

                    oRoom.setRoomData(aRoomData);
                    aRoomRow.push(oRoom);
                }
                this.aRooms.push(aRoomRow);
            }
        }

        for (let y = 0; y < h; ++y) {
            for (let x = 0; x < w; ++x) {
                this[sProc](x, y, this.aRooms[y][x]);
            }
        }
    }

    setMap(a) {
        this.oMap = a;
    }

    /** @return {LabyGenerator} */
    getMap() {
        return this.oMap;
    }

    generate(nSeed) {
        throw new Error('LevelGenerator.generate is abstract');
    }

    processRoom(x, y, oRoom) {
        throw new Error('LevelGenerator.processRoom is abstract');
    }

    /** Exécution des helpers d'aménagement des pièces */
    postProcessRooms() {
        for (let y = 0; y < this.nMapHeight; ++y) {
            for (let x = 0; x < this.nMapWidth; ++x) {
                const oRoom = this.aRooms[y][x];
                const sHelper = oRoom.getRoomData('helper');
                if (sHelper !== null) {
                    this.runLabyRoomHelper(sHelper, oRoom);
                }
            }
        }
    }

    /** Écriture effective des pièces dans le niveau */
    processLevel() {
        for (let y = 0; y < this.nMapHeight; ++y) {
            for (let x = 0; x < this.nMapWidth; ++x) {
                const oRoom = this.aRooms[y][x];
                const oPeri = oRoom.getPeri();
                oPeri.copy(oRoom, 1, 1);
                this.copyZero(oPeri, x * (this.nRoomWidth - 1), y * (this.nRoomHeight - 1));
            }
        }
    }

    /** Carte du niveau : tableau de lignes de codes de blocs */
    toArray() {
        return this._aGrid.map((row) => row.slice());
    }

    /** Carte du niveau en JSON, une ligne par rangée */
    renderJSON() {
        return JSON.stringify(this.toArray()).split('],[').join('],\n[');
    }
}

module.exports = LevelGenerator;
