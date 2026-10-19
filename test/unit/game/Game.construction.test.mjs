// Filet de sécurité de la chaîne Transistate -> Engine -> Game : un vrai
// « new Game() », comme main.js, avec un faux navigateur, un faux howler et un
// faux Raycaster. Le constructeur lance la boucle (stateInitialize, qui appelle
// Game.onInitialize, puis le menu) : l'instantané garde l'état du jeu juste
// après, champs compris.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fakeCanvas } from '../canvas.mjs';

vi.mock('howler', () => ({
    Howl: vi.fn(function () {
        this.play = vi.fn();
        this.pause = vi.fn();
        this.volume = vi.fn();
        this.unload = vi.fn();
    })
}));

vi.mock('../../../src-recovered/libraries/Raycaster/Raycaster.js', async () => {
    const { fakeCanvas: canvas } = await import('../canvas.mjs');
    class Raycaster {
        constructor() {
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
            this.oThinkerManager = { createThinker: (s) => ({ sName: s }) };
            this.oEffects = { addEffect: vi.fn() };
            this.oImages = { complete: () => false };
        }

        setConfig() {}

        initialize() {}

        defineWorld() {}

        buildLevel() {}
    }
    return { Raycaster };
});

function element(sId) {
    const c = fakeCanvas(800, 500);
    c.id = sId;
    c.style = {};
    c.addEventListener = vi.fn();
    c.removeEventListener = vi.fn();
    return c;
}

let oElements;
function stubBrowser() {
    oElements = { screen: element('screen'), hud: element('hud') };
    const storage = {};
    Object.defineProperty(storage, 'removeItem', { value: (k) => delete storage[k] });
    vi.stubGlobal('localStorage', storage);
    vi.stubGlobal('location', { search: '' });
    vi.stubGlobal('window', { localStorage: storage });
    vi.stubGlobal('document', {
        createElement: () => fakeCanvas(0, 0),
        getElementById: (s) => oElements[s] || (oElements[s] = element(s)),
        addEventListener: vi.fn(),
        body: element('body')
    });
}
stubBrowser();

const { Game } = await import('../../../src-recovered/game/Game.js');
const { Transistate } = await import('../../../src-recovered/libraries/Raycaster/Transistate.js');
const { Engine } = await import('../../../src-recovered/libraries/Raycaster/Engine.js');

beforeEach(() => {
    stubBrowser();
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0);
});

afterEach(() => {
    vi.useRealTimers();
});

function value(x) {
    if (x === null || x === undefined || typeof x !== 'object' && typeof x !== 'function') {
        return x;
    }
    if (typeof x === 'function') {
        return '[Function ' + (x.name || 'anonymous') + ']';
    }
    if ('getContext' in x) {
        return '[canvas ' + (x.id || '') + ']';
    }
    if (Array.isArray(x)) {
        return '[Array ' + x.length + ']';
    }
    return '[' + (x.constructor ? x.constructor.name : 'Object') + ']';
}

describe('new Game()', () => {
    it('construit le jeu, l\'initialise et entre dans le menu', () => {
        const g = new Game();
        expect(g).toBeInstanceOf(Engine);
        expect(g).toBeInstanceOf(Transistate);
        const oFields = {};
        const aKeys = [];
        for (const k in g) {
            aKeys.push(k);
        }
        aKeys.sort().forEach((k) => {
            if (k !== 'nLastTimeStamp' && k !== 'sWorldBackup') {
                oFields[k] = value(g[k]);
            }
        });
        expect({
            state: g.getDoomLoop(),
            pause: g.bPause,
            interval: g.nInterval,
            timeFactor: g.TIME_FACTOR,
            loopRunning: g.oInterval !== null,
            plugins: g.aPlugins.map((p) => p.constructor.name),
            signals: Object.keys(g.oPluginSignalRegister).sort(),
            fields: oFields
        }).toMatchSnapshot();
    });

    it('la boucle tourne au rythme de CONFIG.game.interval', () => {
        const g = new Game();
        const spy = vi.spyOn(g, 'pDoomloop');
        vi.advanceTimersByTime(g.nInterval * 3);
        expect(spy).toHaveBeenCalledTimes(3);
        g.pause();
        vi.advanceTimersByTime(g.nInterval * 3);
        expect(spy).toHaveBeenCalledTimes(3);
    });

    it('deux jeux ne partagent rien de mutable', () => {
        const a = new Game(), b = new Game();
        ['aPlugins', 'oPluginSignalRegister', 'aPopupMessages', 'oControls', 'oUI', 'oHUD'].forEach((k) => {
            expect(a[k], k).not.toBe(b[k]);
        });
    });

    it('cinématique d\'intro : la promenade, les deux parties suivantes chargées d\'avance, puis branchées', () => {
        const g = new Game();
        const play = vi.spyOn(g.oSoundSystem, 'playMusic');
        const preload = vi.spyOn(g.oSoundSystem, 'preload');
        g.sys_cutscene('intro', 'stateStartAdventure');
        expect(play).toHaveBeenCalledWith('resources/snd/ogg/mus_intro_wander.ogg');
        expect(preload).toHaveBeenCalledWith(['resources/snd/ogg/mus_intro_ambush.ogg', 'resources/snd/ogg/mus_intro_revenge.ogg']);
        g.oCutscene.onMusicEvent('MUSIC_INTRO_AMBUSH');
        expect(play).toHaveBeenLastCalledWith('resources/snd/ogg/mus_intro_ambush.ogg');
        g.oCutscene.onMusicEvent('MUSIC_INTRO_REVENGE');
        expect(play).toHaveBeenLastCalledWith('resources/snd/ogg/mus_intro_revenge.ogg');
    });
});

