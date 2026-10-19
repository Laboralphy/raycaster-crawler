// Scheduler n'est utilisé nulle part dans le jeu.
import { describe, it, expect } from 'vitest';
import { Scheduler } from '../../../../src-recovered/libraries/Raycaster/Scheduler.js';
import { assertDefaults, assertNotShared } from '../../helpers.mjs';

describe('Scheduler', () => {
    it('a des valeurs par défaut', () => {
        assertDefaults(new Scheduler(), { oCommands: {}, aIndex: [], bInvalid: true, nTime: 0 });
    });

    it('ne partage pas ses files entre instances', () => {
        assertNotShared(new Scheduler(), new Scheduler(), ['oCommands', 'aIndex']);
    });

    it('range les commandes par échéance', () => {
        const s = new Scheduler();
        s.schedule(100);
        const o = {}, f = () => {};
        s.delayCommand(o, f, 50, 'a', 'b');
        expect(s.oCommands).toEqual({ 150: [[o, f, ['a', 'b']]] });
        expect(s.aIndex).toEqual([150]);
        expect(s.bInvalid).toBe(true);
    });

    it('schedule sans commande échue ne fait que noter l\'heure', () => {
        const s = new Scheduler();
        s.delayCommand({}, () => {}, 50);
        s.schedule(10);
        expect(s.nTime).toBe(10);
        expect(s.bInvalid).toBe(false);
        expect(s.aIndex).toEqual([50]);
    });

    // bogue connu : schedule appelle les paramètres (o[i][2]) au lieu de la
    // commande (o[i][1]). it.fails passera au rouge une fois le bogue corrigé.
    it.fails('exécute les commandes échues dans l\'ordre', () => {
        const s = new Scheduler();
        const aOrder = [];
        const o = { aOrder };
        s.delayCommand(o, function (x) { this.aOrder.push(x); }, 20, 'late');
        s.delayCommand(o, function (x) { this.aOrder.push(x); }, 10, 'early');
        s.schedule(30);
        expect(aOrder).toEqual(['early', 'late']);
        expect(s.aIndex).toEqual([]);
    });
});
