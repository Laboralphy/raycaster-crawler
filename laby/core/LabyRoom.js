const RoomGenerator = require('./RoomGenerator');

/**
 * Pièce du niveau : une grille intérieure (taille - 2) et un périmètre
 * (taille complète, murs et issues compris), plus des données associées.
 */
class LabyRoom extends RoomGenerator {
    constructor() {
        super();
        this.oPeri = new RoomGenerator();
        this.aData = {};
    }

    setSize(w, h) {
        super.setSize(w - 2, h - 2);
        this.oPeri.setSize(w, h);
    }

    setRoomData(a, v = null) {
        if (typeof a === 'object' && a !== null) {
            this.aData = a;
        } else {
            this.aData[a] = v;
        }
    }

    /** Renvoie une donnée (null si absente) ou toutes les données */
    getRoomData(s = null) {
        if (s) {
            return s in this.aData ? this.aData[s] : null;
        }
        return this.aData;
    }

    getPeri() {
        return this.oPeri;
    }
}

module.exports = LabyRoom;
