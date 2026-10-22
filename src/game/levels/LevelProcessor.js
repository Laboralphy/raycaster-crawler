/**
 * Retouche d'un niveau après sa construction, avant la création du rendu.
 *
 * Game.rld_loadLevel lance l'évènement « buildLevel » ; Adventure y répond en
 * créant le LevelProcessor défini pour l'étage (defineLevelProcessor) et en
 * appelant run(). Une sous-classe définit ses blocs dans defineBlocks() et
 * modifie la carte dans process().
 *
 * Rien de tout ça n'est sauvegardé : le traitement est refait à chaque
 * chargement de l'étage. process() doit donc donner toujours le même résultat :
 * utiliser this.seed ou this.hash(x, y), jamais Math.random().
 *
 * Une case de carte : matériau (bits 0-7), phys (bits 8-15), décalage
 * (bits 16-23) ; voir cell().
 */
export class LevelProcessor {
    static PHYS_NONE = 0x00;
    static PHYS_WALL = 0x01;
    static PHYS_SECRET_BLOCK = 0x09;
    static PHYS_TRANSPARENT_BLOCK = 0x0A;
    static PHYS_INVISIBLE_BLOCK = 0x0B;
    static PHYS_OFFSET_BLOCK = 0x0C;

    /**
     * @param oLevel {object}
     *   area {string}, floor {number}, seed {number} : l'étage
     *   blocks {number[][]} : la sortie brute du générateur (LABY.BLOCK_*)
     *   data {object} : les données du niveau (map, walls, flats...) que le
     *   rendu va recevoir
     */
    constructor(oLevel) {
        this.area = oLevel.area;
        this.floor = oLevel.floor;
        this.seed = oLevel.seed;
        this.blocks = oLevel.blocks;
        this.data = oLevel.data;
        this.bOwnCodes = false
    }

    run() {
        this.defineBlocks();
        this.process()
    }

    /**
     * Ajoute ici les blocs propres au niveau (addBlock).
     */
    defineBlocks() {}

    /**
     * Le traitement du niveau.
     */
    process() {}

    get width() {
        return this.data.map[0].length
    }

    get height() {
        return this.data.map.length
    }

    /**
     * Code de case : matériau, comportement (PHYS_*), décalage.
     */
    static cell(nMaterial, nPhys = LevelProcessor.PHYS_NONE, nOffset = 0) {
        return (nOffset << 16) | (nPhys << 8) | nMaterial
    }

    static materialOf(nCell) {
        return nCell & 0xFF
    }

    static physOf(nCell) {
        return (nCell >> 8) & 0xFF
    }

    static offsetOf(nCell) {
        return (nCell >> 16) & 0xFF
    }

    /**
     * Nombre pseudo-aléatoire stable pour une case (0 à 0xFFFF), qui dépend
     * aussi de la graine de l'étage.
     */
    hash(x, y) {
        return (Math.imul(x * 73856093 ^ y * 19349663 ^ this.seed, 0x9E3779B1) >>> 16) & 0xFFFF
    }

    /**
     * Ajoute un matériau au niveau et renvoie le code de case prêt à poser.
     * @param o {object}
     *   walls {number[]} : textures murales [nord-sud, est-ouest] (une seule
     *   valeur : les quatre faces) ; par défaut celles de la case vide
     *   floor, ceil {number} : textures du sol et du plafond, -1 pour rien
     *   (le ciel se voit) ; par défaut celles de la case vide
     *   phys {number} : PHYS_*, PHYS_NONE par défaut
     *   offset {number} : décalage, 0 par défaut
     */
    addBlock(o = {}) {
        const d = this.data;
        if (!this.bOwnCodes) {
            // les codes viennent de GFX_DATA, partagés par tous les étages qui
            // ont les mêmes textures : on travaille sur une copie
            d.walls.codes = d.walls.codes.slice();
            if (d.flats) {
                d.flats.codes = d.flats.codes.slice()
            }
            this.bOwnCodes = true
        }
        const nMaterial = d.walls.codes.length;
        if (nMaterial > 0xFF) {
            throw new Error('LevelProcessor: plus de 256 matériaux');
        }
        const aWalls = o.walls ? (o.walls.length === 1 ? [o.walls[0], o.walls[0]] : o.walls.slice(0, 2)) : d.walls.codes[0].slice(0, 2);
        d.walls.codes.push(aWalls);
        if (d.flats) {
            const aVoid = d.flats.codes[0] || [0, 1];
            d.flats.codes.push([
                o.floor === undefined ? aVoid[0] : o.floor,
                o.ceil === undefined ? aVoid[1] : o.ceil
            ])
        }
        return LevelProcessor.cell(nMaterial, o.phys || LevelProcessor.PHYS_NONE, o.offset || 0)
    }

    /**
     * Bloc du générateur (LABY.BLOCK_*), avant traduction en case.
     */
    getBlock(x, y) {
        return this.blocks[y][x]
    }

    getCell(x, y) {
        return this.data.map[y][x]
    }

    setCell(x, y, nCell) {
        this.data.map[y][x] = nCell
    }

    /**
     * Crée le second étage s'il n'existe pas (vide).
     */
    createStorey() {
        if (!this.data.uppermap) {
            this.data.uppermap = this.data.map.map(aRow => aRow.map(() => 0))
        }
        return this.data.uppermap
    }

    getUpperCell(x, y) {
        return this.data.uppermap ? this.data.uppermap[y][x] : 0
    }

    setUpperCell(x, y, nCell) {
        this.createStorey()[y][x] = nCell
    }

    /**
     * Source de lumière au centre de la case (x, y), posée à la création du
     * rendu (Game.rld_addLevelLights).
     * @param oLight {object} r0, r1 (en pixels), v : pleine intensité v
     * jusqu'à r0, nulle à r1
     */
    addLight(x, y, oLight) {
        if (!this.data.lights) {
            this.data.lights = []
        }
        this.data.lights.push({ x, y, r0: oLight.r0, r1: oLight.r1, v: oLight.v })
    }

    /**
     * Parcourt toutes les cases : f(x, y, nCell, nBlock).
     */
    forEachCell(f) {
        const h = this.height;
        const w = this.width;
        for (let y = 0; y < h; ++y) {
            for (let x = 0; x < w; ++x) {
                f(x, y, this.data.map[y][x], this.blocks[y][x])
            }
        }
    }
}
