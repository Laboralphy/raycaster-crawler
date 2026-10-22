import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fakeCanvas } from '../../canvas.mjs';

function stubBrowser() {
    vi.stubGlobal('document', { createElement: () => fakeCanvas(0, 0) });
    vi.stubGlobal('window', {});
}
stubBrowser();
beforeEach(stubBrowser);

const { System } = await import('../../../../src/game/UI/System.js');
const { UI } = await import('../../../../src/game/UI/UI.js');
const { Screen } = await import('../../../../src/game/UI/Screen.js');
const { Box } = await import('../../../../src/libraries/H5UI/Box.js');
const { STRINGS } = await import('../../../../src/game/data/STRINGS.js');
STRINGS.setLanguage('en');

// greffon d'interface : son contrôleur tourne avec this = System
const oTestPlugin = {
    uiController: vi.fn(function (sCommand, xParams) {
        if (sCommand === 'on') {
            this.clear();
            this.centerWidget(this.declareWidget(xParams));
        }
        return sCommand + ':' + (this instanceof System);
    })
};
UI.addUIPlugin('Test', oTestPlugin);

function system() {
    const s = new System();
    s.setRenderCanvas(fakeCanvas(640, 400));
    return s;
}

function box(w, h) {
    const b = new Box();
    b.setSize(w, h);
    return b;
}

describe('System', () => {
    it('valeurs initiales', () => {
        const s = new System();
        expect(s.oScreen).toBeInstanceOf(Screen);
        expect(s.oPlugins).toBe(UI.oPlugins);
        expect([s.oRenderContext, s.oRenderCanvas, s.oWidgets, s.oWidget, s.sScreen, s.bEventsDefined, s.commandProc])
            .toEqual([null, null, null, null, 0, false, null]);
        expect(new System().oScreen).not.toBe(s.oScreen);
    });

    it('addUIPlugin numérote le mode d\'interface et range le greffon', () => {
        expect(UI.INTFMODE_TEST).toBeGreaterThan(10);
        expect(UI.oPlugins.Test).toBe(oTestPlugin);
    });

    it('command : le contrôleur du greffon, appelé avec this = System', () => {
        const s = system();
        const w = box(100, 50);
        expect(s.command('Test', 'on', w)).toBe('on:true');
        expect(s.sScreen).toBe('Test');
        expect(s.getWidget()).toBe(w);
        expect([w._x, w._y]).toEqual([270, 175]);
        expect(s.command('', 'get')).toBe('get:true');
    });

    it('command : écran intégré (Mainmenu), écran inconnu', () => {
        const s = system();
        s.command('Mainmenu', 'on', { options: ['~menu_new'] });
        expect(s.getWidget().constructor.name).toBe('MainMenuWindow');
        expect(s.oScreen.fAlpha).toBe(0);
        expect(() => s.command('Nope', 'on')).toThrow('Unknown UI Command');
    });

    it('cmdLoading : barre de progression', () => {
        const s = system();
        s.oWidget = null;
        s.cmdLoading('set', { max: 10, caption: 'x', n: 5 });
        const pb = s.getWidget().getProgressBar();
        expect([pb.nMax, pb.nProgress]).toEqual([10, 5]);
        expect(s.oScreen.fAlpha).toBe(0.2);
    });

    it('declareWidget remplace la fenêtre, cornerWidget place dans les 9 positions', () => {
        const s = system();
        const a = s.declareWidget(box(100, 50));
        const b = s.declareWidget(box(100, 50));
        expect(s.oScreen.getControlCount()).toBe(1);
        expect(s.getWidget()).toBe(b);
        expect(a._aControls).toBe(null);
        const aPos = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
            s.cornerWidget(b, n, 10);
            return [b._x, b._y];
        });
        expect(aPos).toEqual([[10, 340], [270, 340], [530, 340], [10, 175], [270, 175], [530, 175], [10, 10], [270, 10], [530, 10]]);
    });

    it('souris : coordonnées ramenées à l\'écran, puis au contrôle', () => {
        const s = system();
        const w = s.declareWidget(box(100, 50));
        w.moveTo(20, 30);
        w.onClick = vi.fn();
        const c = { __ratio: 2, __x: 0, __y: 0, addEventListener: vi.fn(), removeEventListener: vi.fn() };
        s.listenToMouseEvents(c);
        expect(c.addEventListener).toHaveBeenCalledTimes(7);
        s.listenToMouseEvents(c);
        expect(c.addEventListener).toHaveBeenCalledTimes(7);
        s.eventScreenClick.call(c, { offsetX: 100, offsetY: 100, which: 1 });
        expect(w.onClick).toHaveBeenCalledWith(30, 20, 1);
        s.deafToMouseEvents(c);
        expect(c.removeEventListener).toHaveBeenCalledTimes(7);
        expect('__this' in c).toBe(false);
    });

    it('render : l\'écran est dessiné s\'il est visible', () => {
        const s = system();
        const ctx = s.oRenderCanvas.getContext();
        s.render();
        expect(ctx.drawImage).not.toHaveBeenCalled();
        s.declareWidget(box(10, 10));
        s.render();
        expect(ctx.drawImage).toHaveBeenCalledWith(s.oScreen._oCanvas, 0, 0);
    });
});
