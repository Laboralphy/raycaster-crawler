/**
 * Classe de base des "helpers" qui aménagent l'intérieur d'une pièce.
 * B : table des codes de blocs du générateur en cours.
 */
class LabyRoomHelper {
    constructor(oRnd, B) {
        this.oRnd = oRnd;
        this.B = B;
    }

    generate(oRoom) {
        throw new Error('LabyRoomHelper.generate is abstract');
    }
}

module.exports = LabyRoomHelper;
