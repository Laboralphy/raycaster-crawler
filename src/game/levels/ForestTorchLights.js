import { LevelProcessor } from './LevelProcessor.js';
import { LABY } from '../data/LABY.js';
import { CONFIG } from '../config.js';

/**
 * forest[0] et forest[1] : les murs à torche (BLOCK_WALL_TORCH) éclairent,
 * une source de lumière au centre de chaque case vide voisine.
 */
export class ForestTorchLights extends LevelProcessor {
    process() {
        const aDirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];
        // une case entre deux torches n'a qu'une lumière
        const oLit = new Set();
        this.forEachCell((x, y, nCell, nBlock) => {
            if (nBlock !== LABY.BLOCK_WALL_TORCH) {
                return
            }
            for (const [dx, dy] of aDirs) {
                const xn = x + dx;
                const yn = y + dy;
                if (xn >= 0 && yn >= 0 && xn < this.width && yn < this.height &&
                    LevelProcessor.physOf(this.getCell(xn, yn)) === LevelProcessor.PHYS_NONE &&
                    !oLit.has(yn * this.width + xn)) {
                    oLit.add(yn * this.width + xn);
                    this.addLight(xn, yn, CONFIG.raycaster.wallTorchLight)
                }
            }
        })
    }
}
