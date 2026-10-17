/**
 * Second étage : un bloc par-dessus chaque bloc plein dont la texture
 * figure dans une règle de aStorey ({ textures, codes }), choisi parmi les
 * codes de la règle (toujours le même pour une case donnée).
 * Sert au jeu (Game.rld_loadLevel) et aux cinématiques (Cutscene.defineData).
 */
export function buildUpperMap(aMap, aCodes, aStorey) {
    return aMap.map((aRow, y) => aRow.map((nCode, x) => {
        if (((nCode >> 8) & 0xFF) !== 1) {
            return 0
        }
        const nTexture = aCodes[nCode & 0xFF][0];
        const oRule = aStorey.find(r => r.textures.includes(nTexture));
        if (!oRule) {
            return 0
        }
        const nHash = Math.imul(x * 73856093 ^ y * 19349663, 0x9E3779B1) >>> 0;
        return 0x100 | oRule.codes[(nHash >>> 16) % oRule.codes.length]
    }))
}
