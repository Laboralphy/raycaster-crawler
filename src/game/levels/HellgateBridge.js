import { LevelProcessor } from './LevelProcessor.js';
import { LABY } from '../data/LABY.js';

/**
 * hellgate[0] : le pont au-dessus du vide.
 *
 * Sur la carte fixe (data/dungeons/hellgate.js), les cases « ~ »
 * (BLOCK_ABYSS) deviennent le vide : on ne peut pas y aller, mais on voit à
 * travers, sans sol ni plafond (le ciel de l'étage apparaît). Les cases du pont
 * qui longent le vide perdent leur plafond. Les cases « / »
 * (BLOCK_HELL_FENCE) sont le garde-fou du pont : texture 78 au nord et au sud,
 * rien à l'est et à l'ouest, et le vide dessous et dessus.
 *
 * Second étage : au-dessus de chaque mur, porte ou fenêtre, un bloc
 * transparent de texture 61 (un parapet crénelé : on voit le ciel et la
 * scène entre les créneaux).
 */
export class HellgateBridge extends LevelProcessor {
    run() {
        this.createStorey();
        super.run()
    }

    defineBlocks() {
        // vide : mur invisible, ni sol ni plafond
        this.BLOCK_ABYSS = this.addBlock({
            floor: -1,
            ceil: -1,
            phys: LevelProcessor.PHYS_INVISIBLE_BLOCK
        });
        // garde-fou : faces nord et sud seulement, au-dessus du vide
        this.BLOCK_FENCE = this.addBlock({
            walls: [78, -1],
            floor: -1,
            ceil: -1,
            phys: LevelProcessor.PHYS_TRANSPARENT_BLOCK
        });
        // pont : on y marche, à ciel ouvert
        this.BLOCK_BRIDGE = this.addBlock({
            ceil: -1
        });
        // second étage
        this.BLOCK_UPPER_WALL = this.addBlock({
            walls: [61],
            phys: LevelProcessor.PHYS_TRANSPARENT_BLOCK
        })
    }

    /** murs, portes (2 à 8), passages secrets, fenêtres : tout sauf le sol et le vide */
    static hasUpperWall(nPhys) {
        return (nPhys >= LevelProcessor.PHYS_WALL && nPhys <= LevelProcessor.PHYS_SECRET_BLOCK) ||
            nPhys === LevelProcessor.PHYS_TRANSPARENT_BLOCK
    }

    /** vide ou garde-fou : le pont qui les longe est à ciel ouvert */
    isOpen(x, y) {
        if (y < 0 || y >= this.height || x < 0 || x >= this.width) {
            return false
        }
        const nBlock = this.getBlock(x, y);
        return nBlock === LABY.BLOCK_ABYSS || nBlock === LABY.BLOCK_HELL_FENCE
    }

    process() {
        const nBridgeMaterial = LevelProcessor.materialOf(this.BLOCK_BRIDGE);
        this.forEachCell((x, y, nCell, nBlock) => {
            if (nBlock === LABY.BLOCK_ABYSS) {
                this.setCell(x, y, this.BLOCK_ABYSS)
            } else if (nBlock === LABY.BLOCK_HELL_FENCE) {
                this.setCell(x, y, this.BLOCK_FENCE)
            } else if (nBlock === LABY.BLOCK_VOID &&
                (this.isOpen(x - 1, y) || this.isOpen(x + 1, y) || this.isOpen(x, y - 1) || this.isOpen(x, y + 1))) {
                this.setCell(x, y, (nCell & ~0xFF) | nBridgeMaterial)
            }
        });
        // second étage, d'après les cases du rez-de-chaussée (rien au-dessus
        // du vide, mur invisible, ni du garde-fou)
        this.forEachCell((x, y, nCell, nBlock) => {
            if (nBlock !== LABY.BLOCK_HELL_FENCE && HellgateBridge.hasUpperWall(LevelProcessor.physOf(nCell))) {
                this.setUpperCell(x, y, this.BLOCK_UPPER_WALL)
            }
        })
    }
}
