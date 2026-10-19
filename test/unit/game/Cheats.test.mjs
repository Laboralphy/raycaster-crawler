import { describe, it, expect, vi } from 'vitest';

// config.js (importé par Cheats) interroge le navigateur au chargement
vi.stubGlobal('location', { search: '' });
vi.stubGlobal('document', {});
const { Cheats } = await import('../../../src-recovered/game/Cheats.js');

describe('cheat learn', () => {
    function context(aBook) {
        const magic = { book: aBook };
        const oGame = {
            oDungeon: { getPlayerCreature: () => ({ oExtraData: { magic } }) },
            oMagicSystem: { invalidateDisplay: vi.fn() }
        };
        return { magic, oGame, learn: (s) => Cheats.DEBUG.learn.run.call({ oGame }, s) };
    }

    it('liste les sorts, leur niveau et ceux déjà connus', () => {
        const aLines = context(['Light']).learn();
        expect(aLines).toContain('Light (level 1) known');
        expect(aLines).toContain('TimeStop (level 5)');
    });

    it('apprend un sort sans tenir compte de la casse', () => {
        const c = context(['Light']);
        expect(c.learn('timestop')).toBe('learned: TimeStop');
        expect(c.magic.book).toEqual(['Light', 'TimeStop']);
        expect(c.oGame.oMagicSystem.invalidateDisplay).toHaveBeenCalledOnce();
        expect(c.learn('TimeStop')).toBe('already known');
        expect(c.magic.book.length).toBe(2);
    });

    it('learn all apprend tous les sorts manquants', () => {
        const c = context(['Light']);
        c.learn('all');
        expect(c.magic.book[0]).toBe('Light');
        expect(new Set(c.magic.book).size).toBe(c.magic.book.length);
        expect(c.learn().every(s => s.endsWith(' known'))).toBe(true);
    });

    it('refuse un sort inconnu', () => {
        expect(context([]).learn('fireball')).toBe('unknown spell "fireball" (learn)');
    });

    it('n\'existe qu\'en mode débogage', () => {
        expect(Cheats.PLAYER.learn).toBeUndefined();
        expect(Cheats.DEBUG.learn.ingame).toBe(true);
    });
});

describe('cheat affect', async () => {
    const { EffectProcessor } = await import('../../../src-recovered/game/EffectProcessor.js');
    const { Creature } = await import('../../../src-recovered/game/GC/Creature.js');

    function context() {
        const ep = new EffectProcessor();
        ep.setTime(100);
        const oPlayer = new Creature();
        oPlayer.setEffectProcessor(ep);
        const oGame = { oDungeon: { oEffectProcessor: ep, getPlayerCreature: () => oPlayer } };
        return { ep, oPlayer, affect: (...a) => Cheats.DEBUG.affect.run.call({ oGame }, ...a) };
    }

    it('liste les alias', () => {
        expect(context().affect()).toContain('blind: abld');
    });

    it('aveugle le joueur 5 secondes par défaut, puis l\'effet s\'arrête', () => {
        const c = context();
        expect(c.affect('blind')).toBe('mabldBF: abld level 1 for 5 s');
        expect(c.oPlayer.getAttribute('blind')).toBe(1);
        c.ep.setTime(104);
        c.oPlayer.processEffects();
        expect(c.oPlayer.getAttribute('blind')).toBe(1);
        c.ep.setTime(105);
        c.oPlayer.processEffects();
        expect(c.oPlayer.getAttribute('blind')).toBe(0);
        expect(c.oPlayer.oEffects).toEqual([]);
    });

    it('accepte un code à 4 lettres, une durée et un niveau', () => {
        const c = context();
        expect(c.affect('asnr', '10', '3')).toBe('masnrDK: asnr level 3 for 10 s');
        expect(c.oPlayer.getAttribute('snared')).toBe(3);
    });

    it('borne la durée à 60 s pour éviter les codes spéciaux', () => {
        expect(context().affect('held', '999')).toMatch(/for 60 s$/);
    });

    it('refuse un effet inconnu', () => {
        expect(context().affect('zzzz')).toBe('unknown effect "zzzz" (affect)');
        expect(context().affect('fireball')).toBe('unknown effect "fireball" (affect)');
    });
});
