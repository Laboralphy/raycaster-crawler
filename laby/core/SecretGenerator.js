const { RangeException } = require('./errors');

/**
 * Motifs de pièces secrètes par taille. (x, y) : position de l'entrée,
 * relative au coin haut-gauche de la pièce.
 * Symboles : ' ' vide, '*' mur, '?' passage secret, '!' mur secret,
 * '$' trésor, '+' fenêtre, 'd' porte, 'c' rideau.
 */
const SECRET_ROOMS = {
    3: [
        { x: 1, y: -1, map: [
            '*$*',
            '***',
            '***',
        ] },
        { x: 1, y: -1, map: [
            '* *',
            '*$*',
            '***',
        ] },
        { x: 1, y: -1, map: [
            '*c*',
            '*$*',
            '***',
        ] },
    ],
    4: [
        { x: 1, y: -1, map: [
            '* **',
            '* $*',
            '*$**',
            '****',
        ] },
        { x: 1, y: -1, map: [
            '* **',
            '* $*',
            '* **',
            '****',
        ] },
        { x: 1, y: -1, map: [
            '*c**',
            '* $*',
            '*$**',
            '****',
        ] },
        { x: 1, y: -1, map: [
            '*?**',
            '*? *',
            '*!$*',
            '****',
        ] },
        { x: 1, y: -1, map: [
            '*?**',
            '*?$*',
            '*!**',
            '****',
        ] },
        { x: 2, y: -1, map: [
            '**?*',
            '* ?*',
            '*$!*',
            '****',
        ] },
        { x: 2, y: -1, map: [
            '**?*',
            '*$?*',
            '**!*',
            '****',
        ] },
    ],
    5: [
        { x: 2, y: -1, map: [
            '** **',
            '*   *',
            '*   *',
            '*$*$*',
            '*****',
        ] },
        { x: 2, y: -1, map: [
            '**c**',
            '*   *',
            '*   *',
            '*$*$*',
            '*****',
        ] },
        { x: 2, y: -1, map: [
            '**?**',
            '* ? *',
            '* ! *',
            '*$*$*',
            '*****',
        ] },
        { x: 2, y: -1, map: [
            '**?**',
            '* ? *',
            '*$! *',
            '***$*',
            '*****',
        ] },
        { x: 2, y: -1, map: [
            '**?**',
            '* ? *',
            '* !$*',
            '*$***',
            '*****',
        ] },
        { x: 2, y: -1, map: [
            '**?**',
            '* ? *',
            '*$!$*',
            '*****',
            '*****',
        ] },
        { x: 1, y: -1, map: [
            '*?***',
            '*? $*',
            '*! **',
            '*$ $*',
            '*****',
        ] },
        { x: 1, y: -1, map: [
            '*?***',
            '*?  *',
            '*! **',
            '*$ $*',
            '*****',
        ] },
        { x: 1, y: -1, map: [
            '*?***',
            '*? $*',
            '*! **',
            '** $*',
            '*****',
        ] },
        { x: 1, y: -1, map: [
            '*?***',
            '*? $*',
            '*! **',
            '**$**',
            '*****',
        ] },
    ],
    6: [
        { x: 1, y: -1, map: [
            '*?**+*',
            '*? * *',
            '*! *$*',
            '*$   *',
            '**$*$*',
            '******',
        ] },
        { x: 1, y: -1, map: [
            '*?**+*',
            '*? * *',
            '*! *$*',
            '*$   +',
            '**$*$*',
            '******',
        ] },
        { x: 1, y: -1, map: [
            '*?****',
            '*?  $+',
            '*!  **',
            '**  $+',
            '*$  **',
            '******',
        ] },
        { x: 1, y: -1, map: [
            '*?****',
            '*?  $*',
            '*!  **',
            '+   $*',
            '*$*$**',
            '******',
        ] },
        { x: 1, y: -1, map: [
            '*?****',
            '*?   *',
            '*!**?*',
            '*   ?*',
            '*$*$!*',
            '******',
        ] },
        { x: 1, y: -1, map: [
            '*?****',
            '*?   *',
            '*!** *',
            '*$   *',
            '**$*$*',
            '******',
        ] },
    ],
    7: [
        { x: 1, y: -1, map: [
            '*?*****',
            '*? **$*',
            '*! *$ *',
            '* ??! *',
            '*     *',
            '*$*$*$*',
            '*******',
        ] },
        { x: 1, y: -1, map: [
            '*?*****',
            '*?    *',
            '*!    *',
            '*     *',
            '*     *',
            '*$*$*$*',
            '*******',
        ] },
        { x: 1, y: -1, map: [
            '*?*****',
            '*?    *',
            '*! ****',
            '*  *  *',
            '*     *',
            '*$*$*$*',
            '*******',
        ] },
        { x: 1, y: -1, map: [
            '*?*****',
            '*?    *',
            '*!  ***',
            '*   *$*',
            '*     *',
            '*$*$*$*',
            '*******',
        ] },
        { x: 1, y: -1, map: [
            '*?*****',
            '*?    *',
            '*!* ***',
            '*$* *$*',
            '*     *',
            '*$*$*$*',
            '*******',
        ] },
        { x: 1, y: -1, map: [
            '*?*****',
            '*?   $*',
            '*!* ***',
            '*$* *$*',
            '*     *',
            '*$*$*$*',
            '*******',
        ] },
        { x: 1, y: -1, map: [
            '*?*****',
            '*?   **',
            '*!   $*',
            '**   **',
            '*$   $*',
            '**$*$**',
            '*******',
        ] },
        { x: 1, y: -1, map: [
            '*?*****',
            '*?   **',
            '*! * $*',
            '** * **',
            '*$   $*',
            '**$*$**',
            '*******',
        ] },
        { x: 1, y: -1, map: [
            '*?*****',
            '*? ??!*',
            '*!$* $*',
            '**** **',
            '*$   $*',
            '**$*$**',
            '*******',
        ] },
        { x: 1, y: -1, map: [
            '*?*****',
            '*?   **',
            '*!$* $*',
            '****c**',
            '*$   $*',
            '**$*$**',
            '*******',
        ] },
    ],
};

/** Cases d'entrée après une rotation de 90° */
function rotateXY(x, y, nSize) {
    return [nSize - 1 - y, x];
}

function rotateMap(aMap) {
    const aRotate = [];
    const ySize = aMap.length;
    const xSize = aMap[0].length;
    for (let y = 0; y < ySize; y++) {
        let sRow = '';
        for (let x = 0; x < xSize; x++) {
            sRow += aMap[ySize - 1 - x][y];
        }
        aRotate.push(sRow);
    }
    return aRotate;
}

function rotateData(aData) {
    const [x, y] = rotateXY(aData.x, aData.y, aData.map.length);
    return { x, y, map: rotateMap(aData.map) };
}

/**
 * Génération de pièces secrètes à partir de motifs, orientables dans les
 * quatre directions.
 */
class SecretGenerator {
    /** @param B table des codes de blocs */
    constructor(B) {
        this.B = B;
        this.aCorr = {
            ' ': B.BLOCK_VOID,
            '*': B.BLOCK_WALL,
            '?': B.BLOCK_SECRET,
            '!': B.BLOCK_SECRET_WALL,
            '$': B.BLOCK_TREASURE,
            '+': B.BLOCK_WINDOW,
            'd': B.BLOCK_DOOR,
            'c': B.BLOCK_CURTAIN,
        };
        this.aData = SECRET_ROOMS;
        this.aCurrentData = null;
    }

    setCorr(a) {
        this.aCorr = a;
    }

    setData(a) {
        this.aData = a;
    }

    /** Nombre de motifs de la taille spécifiée (ou nombre de tailles si 0) */
    getMapCount(nSize = 0) {
        if (nSize) {
            return this.aData[nSize] ? this.aData[nSize].length : 0;
        }
        return Object.keys(this.aData).length;
    }

    rotateCurrentData(n = 1) {
        while (n > 0) {
            this.aCurrentData = rotateData(this.aCurrentData);
            n--;
        }
    }

    generate(nSize, nIndex) {
        if (this.aData[nSize] && this.aData[nSize][nIndex]) {
            this.aCurrentData = this.aData[nSize][nIndex];
            return true;
        }
        return false;
    }

    render(oRoom) {
        const aMap = this.aCurrentData.map;
        for (let y = 0; y < oRoom.getHeight(); y++) {
            for (let x = 0; x < oRoom.getWidth(); x++) {
                const sMap = aMap[y][x];
                if (sMap && sMap !== '0') {
                    oRoom.setCell(x, y, this.aCorr[sMap] ?? null);
                }
            }
        }
    }

    isValidExit(oRoom, x, y) {
        try {
            return oRoom.getCell(x + this.aCurrentData.x, y + this.aCurrentData.y) == this.B.BLOCK_VOID;
        } catch (e) {
            if (e instanceof RangeException) return false;
            throw e;
        }
    }

    rotateUntilValidExit(oRoom, x, y) {
        for (let i = 0; i < 4; i++) {
            if (this.isValidExit(oRoom, x, y)) {
                return true;
            }
            this.rotateCurrentData();
        }
        return false;
    }
}

module.exports = SecretGenerator;
