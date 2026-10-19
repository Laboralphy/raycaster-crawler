// Filet de sécurité des cinématiques (Cutscene, CutsceneIntro, CutsceneEnd,
// MenuSystem) : un faux Raycaster note ce que chaque cinématique lui demande
// (taille du canvas, configuration, monde construit, caméra) ; l'instantané
// garde ces demandes et les champs de la cinématique construite.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fakeCanvas } from '../../canvas.mjs';

vi.mock('../../../../src-recovered/libraries/Raycaster/Raycaster.js', async () => {
    const { fakeCanvas: canvas } = await import('../../canvas.mjs');
    class Raycaster {
        constructor() {
            this.aCalls = [];
            this.nMapSize = 24;
            this.nPlaneSpacing = 64;
            this.oRenderCanvas = { width: 800, height: 500 };
            this.oCanvas = canvas(800, 500);
            this.TIME_FACTOR = 40;
            this.oCamera = {
                x: 320, y: 416,
                setThinker: (t) => {
                    this.oCamera.oThinker = t;
                }
            };
            this.oThinkerManager = {
                createThinker: (s) => ({ sName: s, think: null, thinkInit() {} })
            };
            this.oEffects = { addEffect: vi.fn() };
        }

        setConfig(o) {
            this.aCalls.push(['setConfig', { ...o, canvas: o.canvas.width + 'x' + o.canvas.height }]);
        }

        initialize() {
            this.aCalls.push(['initialize']);
        }

        defineWorld(o) {
            this.oWorld = o;
            this.aCalls.push(['defineWorld']);
        }

        buildLevel() {
            this.aCalls.push(['buildLevel']);
        }
    }
    return { Raycaster };
});

function stubBrowser() {
    vi.stubGlobal('document', { createElement: () => fakeCanvas(0, 0) });
    vi.stubGlobal('window', {});
}
stubBrowser();

const { Cutscene } = await import('../../../../src-recovered/game/cutscenes/Cutscene.js');
const { CutsceneIntro } = await import('../../../../src-recovered/game/cutscenes/CutsceneIntro.js');
const { CutsceneEnd } = await import('../../../../src-recovered/game/cutscenes/CutsceneEnd.js');
const { MenuSystem } = await import('../../../../src-recovered/game/MenuSystem.js');
const { STRINGS } = await import('../../../../src-recovered/game/data/STRINGS.js');
STRINGS.setLanguage('en');

beforeEach(() => {
    stubBrowser();
    // MathTools.rndChoose (variantes de murs) : toujours la première
    vi.spyOn(Math, 'random').mockReturnValue(0);
});

function value(x) {
    if (x === null || x === undefined || typeof x !== 'object' && typeof x !== 'function') {
        return x;
    }
    if (typeof x === 'function') {
        return '[Function ' + (x.name || 'anonymous') + ']';
    }
    if ('getContext' in x) {
        return '[canvas ' + x.width + 'x' + x.height + ']';
    }
    if ('fillRect' in x) {
        return '[context ' + x.canvas.width + 'x' + x.canvas.height + ']';
    }
    if (Array.isArray(x)) {
        return '[Array ' + x.length + ']';
    }
    return '[' + (x.constructor ? x.constructor.name : 'Object') + ']';
}

// ce que la cinématique a demandé au raycaster, et ses champs
function describeCutscene(c) {
    const rc = c.oRaycaster;
    const w = rc.oWorld;
    const oFields = {};
    const aKeys = [];
    for (const k in c) {
        aKeys.push(k);
    }
    aKeys.sort().forEach((k) => {
        if (k !== 'RAYCASTER_LEVEL') {
            oFields[k] = value(c[k]);
        }
    });
    const t = rc.oCamera.oThinker;
    const oThinker = {};
    Object.keys(t).sort().forEach((k) => {
        if (k !== 'oRaycaster' && k !== 'oCutscene') {
            oThinker[k] = value(t[k]);
        }
    });
    return {
        calls: rc.aCalls,
        world: {
            keys: Object.keys(w).sort(),
            map: w.map.length + 'x' + w.map[0].length,
            mapRows: w.map.map((r) => r.join(',')),
            uppermap: w.uppermap ? w.uppermap.length : null,
            startpoint: w.startpoint,
            objects: (w.objects || []).map((o) => o.blueprint + ' ' + o.x + ',' + o.y),
            background: w.background
        },
        cameraThinker: oThinker,
        cameraThinkerLinks: { oRaycaster: t.oRaycaster === rc, oCutscene: t.oCutscene === c },
        fields: oFields
    };
}

const CLASSES = { CutsceneIntro, CutsceneEnd, MenuSystem };

describe('cinématiques : construction', () => {
    it.each(Object.keys(CLASSES))('%s', (sClass) => {
        const c = new CLASSES[sClass]();
        expect(describeCutscene(c)).toMatchSnapshot();
    });

    it.each(Object.keys(CLASSES))('%s : setFinalCanvas', (sClass) => {
        const c = new CLASSES[sClass]();
        c.setFinalCanvas(fakeCanvas(1024, 600));
        expect([c.oRenderCanvas.width, c.oRenderCanvas.height, c.xRC, c.yRC]).toMatchSnapshot();
        c.finalize();
        expect([c.oRenderCanvas, c.oRaycaster, c.oCameraThinker]).toEqual([null, null, null]);
    });
});

describe('Cutscene', () => {
    it('le menu a un raycaster plus petit (400 x 250) que les cinématiques (800 x 500)', () => {
        expect([new MenuSystem().oRCCanvas.width, new MenuSystem().oRCCanvas.height]).toEqual([400, 250]);
        expect([new CutsceneIntro().oRCCanvas.width, new CutsceneIntro().oRCCanvas.height]).toEqual([800, 500]);
        expect([new MenuSystem().RAYCASTER_WIDTH, new CutsceneEnd().RAYCASTER_WIDTH]).toEqual([400, 800]);
    });

    it('les méthodes des sous-classes ne sont pas masquées', () => {
        const c = new CutsceneIntro();
        expect(c.getLevelData).toBe(CutsceneIntro.prototype.getLevelData);
        expect(c.getLabyMap).toBe(CutsceneIntro.prototype.getLabyMap);
        expect(c.onRender).toBe(CutsceneIntro.prototype.onRender);
    });

    it('popups : en file par date, lancés quand leur heure vient', () => {
        const c = new MenuSystem();
        c.nTime = 10;
        c.popup('B', 5);
        c.popup('A');
        expect(c.aPopups.map((p) => p[0])).toEqual([10, 15]);
        c.runPopups();
        expect(c.oRaycaster.oEffects.addEffect).toHaveBeenCalledTimes(1);
        c.runPopups();
        expect(c.oRaycaster.oEffects.addEffect).toHaveBeenCalledTimes(1);
        c.nTime = 15;
        c.runPopups();
        expect(c.oRaycaster.oEffects.addEffect).toHaveBeenCalledTimes(2);
        expect(new MenuSystem().aPopups).not.toBe(c.aPopups);
    });
});
