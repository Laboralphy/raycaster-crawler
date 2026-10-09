const Grid = require('./Grid');
const { RangeException } = require('./errors');

/**
 * Grille avec remplissage par diffusion ("pot de peinture").
 */
class Painter extends Grid {
    /** Remplace par nCodeRep la zone connexe de code nCodeCible contenant (x, y) */
    paint(x, y, nCodeCible, nCodeRep) {
        const tryGet = (px, py) => {
            try {
                return this.getCell(px, py);
            } catch (e) {
                if (e instanceof RangeException) return undefined;
                throw e;
            }
        };
        const n = tryGet(x, y);
        if (n === undefined || n != nCodeCible) {
            return;
        }
        const p = [[x, y]];
        while (p.length) {
            const [x0, y0] = p.pop();
            this.setCell(x0, y0, nCodeRep);
            for (const [dx, dy] of [[0, -1], [0, 1], [1, 0], [-1, 0]]) {
                const c = tryGet(x0 + dx, y0 + dy);
                if (c !== undefined && c == nCodeCible) {
                    p.push([x0 + dx, y0 + dy]);
                }
            }
        }
    }
}

module.exports = Painter;
