// Filet pour la migration des thinkers : chaque thinker neuf doit exposer
// exactement les mêmes champs (propres ou hérités du prototype, vus par
// for…in) et le même état initial (think) qu'avant. Le snapshot a été
// enregistré sur le code d'avant la migration.
import { describe, it, expect } from 'vitest';
import { THINKERS } from '../../../../src/game/thinkers/THINKERS.js';
import { Thinker } from '../../../../src/libraries/Raycaster/Thinker.js';
import { MissileThinker } from '../../../../src/libraries/Raycaster/MissileThinker.js';
import { MouseKeyboardThinker } from '../../../../src/libraries/Raycaster/MouseKeyboardThinker.js';
import { ThinkerManager } from '../../../../src/libraries/Raycaster/ThinkerManager.js';
import { assertNotShared } from '../../helpers.mjs';

const ALL = {
    ...THINKERS,
    Thinker,
    Missile: MissileThinker,
    MouseKeyboard: MouseKeyboardThinker
};

// valeur lisible et stable : les fonctions par leur nom
function describeValue(v) {
    if (typeof v === 'function') {
        return '[Function ' + v.name + ']';
    }
    if (Array.isArray(v)) {
        return v.map(describeValue);
    }
    if (v !== null && typeof v === 'object') {
        const o = {};
        for (const k of Object.keys(v).sort()) {
            o[k] = describeValue(v[k]);
        }
        return o;
    }
    return v;
}

function fields(oThinker) {
    const aKeys = [];
    for (const k in oThinker) {
        aKeys.push(k);
    }
    const o = {};
    for (const k of aKeys.sort()) {
        o[k] = describeValue(oThinker[k]);
    }
    return o;
}

describe('construction des thinkers', () => {
    it.each(Object.keys(ALL))('%s', (sName) => {
        const oThinker = new ALL[sName]();
        expect(oThinker).toBeInstanceOf(Thinker);
        expect(oThinker.oMobile).toBe(null);
        expect(oThinker.oGame).toBe(null);
        expect(fields(oThinker)).toMatchSnapshot();
    });

    it('chaque instance a ses propres tableaux et objets', () => {
        for (const sName of Object.keys(THINKERS)) {
            const C = THINKERS[sName];
            const a = new C(), b = new C();
            const aKeys = Object.keys(fields(a)).filter(k => a[k] !== null && typeof a[k] === 'object'
                && !k.startsWith('EFFECT_'));
            assertNotShared(a, b, aKeys);
        }
    });

    it('ThinkerManager crée chaque thinker du registre et lui donne le jeu', () => {
        ThinkerManager.registerThinkers(THINKERS);
        const tm = new ThinkerManager();
        tm.oGameInstance = { name: 'game' };
        for (const [sName, C] of Object.entries(THINKERS)) {
            const t = tm.createThinker(sName);
            expect(t).toBeInstanceOf(C);
            expect(t.oGame).toBe(tm.oGameInstance);
        }
    });
});
