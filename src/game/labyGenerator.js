// Générateur de labyrinthe, dans le navigateur : le module laby/ (CommonJS)
// est embarqué dans crawler.js par esbuild ; plus d'appel au serveur.
import labyModule from '../../laby/index.js';

const { generateLaby } = labyModule;

/**
 * Génère la carte d'un étage.
 * @param {string} sGenerator nom du générateur (dungeon, cave, boss...)
 * @param {number} nSeed graine
 * @param {string} sOptions options, ex. "-ls1-s0"
 * @return {number[][]} la grille du niveau
 */
export function generateLevelMap(sGenerator, nSeed, sOptions) {
    return generateLaby(sGenerator, nSeed || 0, sOptions || '').toArray();
}
