import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { SOUNDS, soundNames } from '../../../../src-recovered/game/data/SOUNDS.js';
import { MONSTERS_BLUEPRINTS } from '../../../../src-recovered/game/data/MONSTERS_BLUEPRINTS.js';

describe('SOUNDS', () => {
    it('soundNames : un nom, une liste ou une table de listes, sans les vides', () => {
        expect(soundNames('a')).toEqual(['a']);
        expect(soundNames(['a', '', 'b'])).toEqual(['a', 'b']);
        expect(soundNames({ x: ['a', 'b'], y: ['c'] })).toEqual(['a', 'b', 'c']);
    });

    it('chaque son existe dans resources/snd/ogg', () => {
        for (const sKey in SOUNDS) {
            soundNames(SOUNDS[sKey]).forEach((s) => expect(existsSync('resources/snd/ogg/' + s + '.ogg'), s).toBe(true));
        }
    });

    it('chaque monstre a un cri de mort connu', () => {
        for (const sMob in MONSTERS_BLUEPRINTS) {
            const sDeath = MONSTERS_BLUEPRINTS[sMob].data.death;
            expect(SOUNDS.DEATH, sMob + ' : ' + sDeath).toHaveProperty([sDeath]);
        }
    });
});
