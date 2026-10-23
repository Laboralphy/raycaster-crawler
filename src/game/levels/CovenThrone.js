import { LevelProcessor } from './LevelProcessor.js';

/**
 * coven[1] : la salle du trône de la reine des sorcières.
 */
export class CovenThrone extends LevelProcessor {
    // texture du mur transparent posé à l'étage, autour du ciel ouvert
    static UPPER_TEXTURE = 61;

    run() {
        // second étage, vide pour l'instant
        this.createStorey();
        super.run()
    }

    defineBlocks() {
        // case où l'on marche, sans plafond : le ciel se voit
        this.BLOCK_OPEN_SKY = this.addBlock({
            ceil: -1
        });
        // mur transparent, texture UPPER_TEXTURE
        this.BLOCK_GLASS = this.addBlock({
            walls: [this.constructor.UPPER_TEXTURE],
            phys: LevelProcessor.PHYS_TRANSPARENT_BLOCK
        })
    }

    /**
     * Grille G2S, de la taille du niveau : 0 sur les cases où l'on ne marche
     * pas librement (phys différent de PHYS_NONE), puis, passe après passe,
     * chaque case encore à -1 qui touche (côté ou coin) une case déjà fixée
     * prend la plus grande valeur voisine + 1. Une case vaut donc sa distance
     * au mur le plus proche, comptée en cases (diagonales comprises).
     */
    buildG2S() {
        const w = this.width;
        const h = this.height;
        let g = this.data.map.map(aRow => aRow.map(
            nCell => LevelProcessor.physOf(nCell) === LevelProcessor.PHYS_NONE ? -1 : 0
        ));
        let bChanged = true;
        while (bChanged) {
            bChanged = false;
            // on lit la passe précédente, on écrit la suivante
            const gNext = g.map(aRow => aRow.slice());
            for (let y = 0; y < h; ++y) {
                for (let x = 0; x < w; ++x) {
                    if (g[y][x] !== -1) {
                        continue
                    }
                    let nMax = -1;
                    for (let dy = -1; dy <= 1; ++dy) {
                        for (let dx = -1; dx <= 1; ++dx) {
                            const yy = y + dy;
                            const xx = x + dx;
                            if ((dx || dy) && yy >= 0 && yy < h && xx >= 0 && xx < w) {
                                nMax = Math.max(nMax, g[yy][xx])
                            }
                        }
                    }
                    if (nMax >= 0) {
                        gNext[y][x] = nMax + 1;
                        bChanged = true
                    }
                }
            }
            g = gNext
        }
        return this.removeIsolatedSky(g)
    }

    /**
     * Après la dernière passe : une case de ciel (valeur > 2) qu'aucune case
     * de ciel ne touche par un côté est un trou de 1 x 1 dans le plafond ;
     * elle repasse à 2, comme les cases qui l'entourent. Toutes les cases
     * sont jugées sur la grille d'avant ce nettoyage.
     */
    removeIsolatedSky(g) {
        const w = this.width;
        const h = this.height;
        const isSky = (x, y) => x >= 0 && x < w && y >= 0 && y < h && g[y][x] > 2;
        return g.map((aRow, y) => aRow.map((v, x) => {
            if (v > 2 && !isSky(x - 1, y) && !isSky(x + 1, y) && !isSky(x, y - 1) && !isSky(x, y + 1)) {
                return 2
            }
            return v
        }))
    }

    process() {
        const g = this.buildG2S();
        this.G2S = g;
        const nSkyMaterial = LevelProcessor.materialOf(this.BLOCK_OPEN_SKY);
        this.forEachCell((x, y, nCell) => {
            const v = g[y][x];
            if (v > 2) {
                // au milieu des grandes salles : pas de plafond (on garde
                // le comportement et le décalage de la case)
                this.setCell(x, y, (nCell & ~0xFF) | nSkyMaterial)
            }
            if (v === 2) {
                this.setUpperCell(x, y, this.BLOCK_GLASS)
            }
        })
    }
}
