const Grid = require('./Grid');
const { RangeException } = require('./errors');

const NEIGHBOURS = [
    [-1, -1], [0, -1], [1, -1],
    [-1, 0], [1, 0],
    [-1, 1], [0, 1], [1, 1],
];

/**
 * Automate cellulaire (variante du jeu de la vie) pour sculpter les grottes.
 */
class LifeGame extends Grid {
    /**
     * @param aBirth nombres de voisines vivantes faisant naître une cellule
     * @param aDeath nombres de voisines vivantes faisant mourir une cellule
     */
    setRules(aBirth, aDeath) {
        this._aBirth = aBirth;
        this._aDeath = aDeath;
    }

    /** Effectue une génération (les bords comptent comme vivants) */
    process() {
        const w = this.getWidth();
        const h = this.getHeight();
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                let nSum = 0;
                for (const xy of NEIGHBOURS) {
                    let n;
                    try {
                        n = this.getCell(x + xy[0], y + xy[1]) & 1;
                    } catch (e) {
                        if (!(e instanceof RangeException)) throw e;
                        n = 1;
                    }
                    nSum += n;
                }
                const nCell = this.getCell(x, y) & 1;
                if (this._aBirth.includes(nSum) && nCell === 0) {
                    this.setCell(x, y, 2);
                }
                if (this._aDeath.includes(nSum) && nCell === 1) {
                    this.setCell(x, y, 5);
                }
            }
        }
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const nCell = this.getCell(x, y);
                switch (nCell) {
                    case 2:
                        this.setCell(x, y, 1);
                        break;
                    case 5:
                        this.setCell(x, y, 0);
                        break;
                    default:
                        this.setCell(x, y, nCell & 1);
                        break;
                }
            }
        }
    }
}

module.exports = LifeGame;
