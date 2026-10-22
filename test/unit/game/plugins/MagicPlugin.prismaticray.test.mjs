// Rayon prismatique (remplace le sort de mort) : sept éclairs en éventail.
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { stubDocument } from '../../canvas.mjs';

stubDocument();

const { MagicPlugin } = await import('../../../../src/game/plugins/MagicPlugin.js');
const { SPELLS_DATA } = await import('../../../../src/game/data/SPELLS_DATA.js');
const { MAGIC_DATA } = await import('../../../../src/game/data/MAGIC_DATA.js');
const { BLUEPRINTS_DATA } = await import('../../../../src/game/data/BLUEPRINTS_DATA.js');
const { GFX_DATA } = await import('../../../../src/game/data/GFX_DATA.js');
const { ICONS } = await import('../../../../src/game/data/ICONS.js');
const { STRINGS } = await import('../../../../src/game/data/STRINGS.js');
const { EffectProcessor } = await import('../../../../src/game/EffectProcessor.js');
const { DataSerializer } = await import('../../../../src/game/DataSerializer.js');
const { Dungeon } = await import('../../../../src/game/Dungeon.js');
const { MathTools } = await import('../../../../src/libraries/Raycaster/Tools/MathTools.js');

beforeAll(() => STRINGS.setLanguage('en'));

const COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'magenta'];
const ray = () => SPELLS_DATA.mis_prismaticray_1.missiles;

// lance le sort depuis un lanceur qui regarde vers fTheta = 1 ; renvoie les éclairs
function cast(nConfused = 0) {
    const aFired = [];
    const p = new MagicPlugin();
    p.oGame = {
        TIME_FACTOR: 40,
        nTime: 100,
        sys_playSound: vi.fn(),
        spawnMobile: vi.fn((sBlueprint, x, y, fTheta) => {
            const m = {
                sBlueprint, x, y, fTheta,
                getData: (s) => BLUEPRINTS_DATA[sBlueprint].data[s],
                oThinker: { setOptions: vi.fn(), setEffects: vi.fn(), fire: vi.fn() }
            };
            aFired.push(m);
            return m;
        })
    };
    const oCaster = {
        x: 96, y: 160, fTheta: 1,
        getData: () => ({ getAttribute: (s) => ({ confused: nConfused, power: 2 })[s] || 0 })
    };
    expect(p.spellPrismaticRay(oCaster)).toBe(true);
    return { p, aFired, oCaster };
}

describe('rayon prismatique : données', () => {
    it('remplace le sort de mort, au niveau 5, avec sa propre icône', () => {
        expect('DeathSpell' in MAGIC_DATA).toBe(false);
        expect(MAGIC_DATA.PrismaticRay).toMatchObject({ level: 5, mp: 10, icon: 'spl_prisma', target: true });
        expect(ICONS.spl_prisma).toBe(176);
        expect(STRINGS._('~spell_PrismaticRay')).toBe('Prismatic Ray');
        expect(Object.keys(MAGIC_DATA)).toEqual(['DrainLife', 'Teleport', 'Knock', 'PrismaticRay', 'MagicMapping', 'SummonFood', 'Reflect', 'Light', 'TimeStop']);
    });

    it('sept éclairs, du rouge au magenta, en éventail de -30° à +30°', () => {
        expect(ray().map((m) => m.blueprint)).toEqual(COLORS.map((c) => 'p_prisma_' + c));
        expect(ray().map((m) => Math.round(m.angle * 180 / Math.PI))).toEqual([-30, -20, -10, 0, 10, 20, 30]);
    });

    it('chaque éclair a l\'animation et le comportement de p_magbolt', () => {
        COLORS.forEach((c) => {
            const s = 'p_prisma_' + c;
            expect({ ...BLUEPRINTS_DATA[s], tile: 'x' }).toEqual({ ...BLUEPRINTS_DATA.p_magbolt, tile: 'x' });
            expect(BLUEPRINTS_DATA[s].tile).toBe(s);
            expect({ ...GFX_DATA.tiles[s], src: 'x' }).toEqual({ ...GFX_DATA.tiles.p_magbolt, src: 'x' });
            expect(GFX_DATA.tiles[s].src).toBe('resources/gfx/sprites/' + s + '.png');
        });
    });

    it('les codes d\'effet disent bien ce qui est demandé', () => {
        const ep = new EffectProcessor();
        const describe = (s) => [ep.getEffectType(s), ep.getEffectSubType(s), ep.getEffectLevel(s), ep.getEffectDuration(s)].join(' ');
        const o = {};
        ray().forEach((m, i) => {
            o[COLORS[i]] = m.effects.map(describe).concat(m.random ? ['random ' + m.random.count + ': ' + m.random.effects.map(describe).join(', ')] : []);
        });
        expect(o).toEqual({
            red: ['m xmag 4 0', 'm acnf 1 60'],
            orange: ['m xfir 4 0', 'm abld 1 60'],
            yellow: ['m xmag 4 0', 'random 2: m abld 1 60, m acnf 1 60, m asnr 7 60, m ahld 1 60'],
            green: ['m xcld 4 0', 'm asnr 7 60'],
            blue: ['m xele 4 0', 'm ahld 1 60'],
            purple: ['p xtox 2 30'],
            magenta: ['m xmag 10 0']
        });
        ray().forEach((m) => expect(m.chances).toEqual(m.effects.map(() => 1)));
    });
});

describe('rayon prismatique : lancer', () => {
    it('tire les sept éclairs dans l\'axe du lanceur, avec sa puissance', () => {
        const { aFired } = cast();
        expect(aFired.map((m) => m.sBlueprint)).toEqual(COLORS.map((c) => 'p_prisma_' + c));
        expect(aFired.map((m) => +(m.fTheta - 1).toFixed(4))).toEqual(ray().map((m) => m.angle));
        aFired.forEach((m, i) => {
            expect([m.x, m.y]).toEqual([96, 160]);
            expect(m.oOwner).toBeDefined();
            expect(m.fSpeed).toBe(40 * 180 / 1000);
            expect(m.oThinker.setOptions).toHaveBeenCalledWith('');
            expect(m.oThinker.setEffects.mock.calls[0][2]).toBe(2);
            expect(m.oThinker.fire).toHaveBeenCalled();
            if (COLORS[i] !== 'yellow') {
                expect(m.oThinker.setEffects).toHaveBeenCalledWith(ray()[i].effects, ray()[i].chances, 2);
            }
        });
    });

    it('le jaune reçoit deux effets différents tirés au hasard, sans toucher aux données', () => {
        const aBefore = JSON.stringify(ray());
        const oSeen = new Set();
        for (let i = 0; i < 40; i++) {
            const { aFired } = cast();
            const [aEffects, aChances] = aFired[2].oThinker.setEffects.mock.calls[0];
            expect(aEffects[0]).toBe('mxmagEA');
            expect(aEffects).toHaveLength(3);
            expect(new Set(aEffects).size).toBe(3);
            expect(ray()[2].random.effects).toEqual(expect.arrayContaining(aEffects.slice(1)));
            expect(aChances).toEqual([1, 1, 1]);
            aEffects.slice(1).forEach((s) => oSeen.add(s));
        }
        expect(oSeen.size).toBe(4);
        expect(JSON.stringify(ray())).toBe(aBefore);
    });

    it('tirage du jaune : deux tirages successifs dans la liste qui rétrécit', () => {
        vi.spyOn(MathTools, 'rnd').mockReturnValueOnce(3).mockReturnValueOnce(0);
        const o = new MagicPlugin().rollMissileEffects(ray()[2]);
        expect(o.effects).toEqual(['mxmagEA', 'mahldB8', 'mabldB8']);
    });

    it('lanceur confus : les éclairs partent au hasard', () => {
        const { aFired } = cast(1);
        aFired.forEach((m) => expect(m.oThinker.setOptions).toHaveBeenCalledWith('r'));
    });
});

describe('anciennes sauvegardes', () => {
    it('le sort de mort appris devient le rayon prismatique, à la même place', () => {
        const d = new Dungeon();
        const ds = new DataSerializer();
        const c = d.getPlayerCreature();
        c.oExtraData.magic = { book: ['Light', 'DeathSpell', 'TimeStop'], cooldown: { DeathSpell: 1234, Light: 5 } };
        const c2 = ds.restoreCreature(JSON.parse(JSON.stringify(ds.saveCreature(c))), { oDungeon: d });
        expect(c2.oExtraData.magic).toEqual({ book: ['Light', 'PrismaticRay', 'TimeStop'], cooldown: { Light: 5, PrismaticRay: 1234 } });
    });
});
