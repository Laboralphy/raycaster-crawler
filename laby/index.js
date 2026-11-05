const RandomGenerator = require('./core/RandomGenerator');

/**
 * Générateurs disponibles (nom -> classe). Des require statiques, pour que
 * esbuild les embarque dans crawler.js : le jeu génère ses niveaux dans le
 * navigateur (src/game/labyGenerator.js).
 */
const GENERATORS = {
    boss: require('./generators/boss/BossLevelGenerator'),
    cave: require('./generators/cave/CaveLevelGenerator'),
    dungeon: require('./generators/dungeon/DungeonLevelGenerator'),
    forest: require('./generators/forest/ForestLevelGenerator'),
    magetower: require('./generators/magetower/MagetowerLevelGenerator'),
    mines: require('./generators/mines/MinesLevelGenerator'),
    special: require('./generators/special/SpecialLevelGenerator'),
    trivial: require('./generators/trivial/TrivialLevelGenerator'),
};

/**
 * Convertit une graine à la manière du (int) de PHP : entier en tête de chaîne,
 * borné à 64 bits, 0 à défaut.
 */
function parseSeed(s) {
    const m = /^\s*([+-]?\d+)/.exec(String(s ?? ''));
    if (!m) {
        return 0n;
    }
    const n = BigInt(m[1]);
    const MAX = (1n << 63n) - 1n;
    const MIN = -(1n << 63n);
    return n > MAX ? MAX : n < MIN ? MIN : n;
}

/**
 * Génère un niveau.
 * @param {string} sGenerator nom du générateur (voir GENERATORS)
 * @param {number|string|bigint} seed graine
 * @param {string} sOptions options, ex. "-rs1-ls2"
 * @return {LevelGenerator} le niveau généré (toArray(), renderJSON()...)
 */
function generateLaby(sGenerator, seed = 0, sOptions = '') {
    if (!Object.prototype.hasOwnProperty.call(GENERATORS, sGenerator)) {
        throw new Error(`unknown generator: ${sGenerator}`);
    }
    const oLevel = new GENERATORS[sGenerator](new RandomGenerator());
    oLevel.setOptions(sOptions);
    oLevel.generate(parseSeed(seed));
    return oLevel;
}

module.exports = { generateLaby, GENERATORS: Object.keys(GENERATORS) };
