// Organisation des niveaux : Adventure.config relie les zones entre elles
// (sorties, entrées, portails). On vérifie le graphe obtenu.
import { describe, it, expect, vi, beforeEach } from 'vitest';

// config.js (importé par les LevelProcessor) teste le pointer lock au chargement
vi.hoisted(() => {
    globalThis.document ??= {};
});

const { dungeons } = await import('../../../src/game/data/WORLD_DATA.dungeons.js');
const { Adventure } = await import('../../../src/game/Adventure.js');

const MAIN_PATH = ['forest', 'd1', 'medusa', 'coven', 'crypts', 'hellgate', 'hellkeep', 'd2', 'treasure'];

let d;
let adventure;

beforeEach(() => {
    d = structuredClone(dungeons);
    adventure = Object.create(Adventure.prototype);
    adventure.oVariables = null;
    adventure.config(d);
});

const last = (s) => d[s].length - 1;

describe('Adventure.config : organisation des niveaux', () => {
    it.each(MAIN_PATH.slice(0, -1).map((s, i) => [s, MAIN_PATH[i + 1]]))(
        'la sortie du dernier étage de %s mène au premier étage de %s, et retour',
        (sFrom, sTo) => {
            // zone et étage seulement : les liens forêt -> d1 et d2 -> trésor,
            // posés dans les données, ont leurs propres points d'arrivée
            expect(d[sFrom][last(sFrom)].transit.exit.slice(0, 2)).toEqual([sTo, 0]);
            expect(d[sTo][0].transit.entrance.slice(0, 2)).toEqual([sFrom, last(sFrom)]);
        }
    );

    it("la forêt n'a pas d'entrée, la salle au trésor pas de sortie", () => {
        expect(d.forest[0].transit.entrance).toBe(false);
        expect(d.treasure[0].transit.exit).toBe(false);
    });

    it("seul un étage de d1 (1 ou 2) a un portail : vers les mines, qui y ramènent", () => {
        const aPortals = [];
        for (const [s, aFloors] of Object.entries(d)) {
            aFloors.forEach((f, i) => {
                if (f.transit && 'portal' in f.transit) {
                    aPortals.push([s, i, f.transit.portal]);
                }
            });
        }
        expect(aPortals).toHaveLength(1);
        const [sArea, nFloor, sTarget] = aPortals[0];
        expect(sArea).toBe('d1');
        expect([1, 2]).toContain(nFloor);
        expect(sTarget).toBe('mines');
        expect(d.d1[nFloor].options).toMatch(/-p1/);
        expect(d.mines[0].transit.entrance).toEqual(['d1', nFloor, 3]);
        expect(d.mines[2].transit.exit).toEqual(['d1', nFloor, 3]);
    });

    it("aucun autre étage n'a l'option de portail", () => {
        const nPortalFloor = adventure.oVariables.portalToMines;
        for (const [s, aFloors] of Object.entries(d)) {
            aFloors.forEach((f, i) => {
                if (s !== 'd1' || i !== nPortalFloor) {
                    expect(f.options ?? '', `${s}[${i}]`).not.toMatch(/-p1/);
                }
            });
        }
    });

    it('toutes les zones sont atteignables depuis la forêt', () => {
        const seen = new Set(['forest']);
        const todo = ['forest'];
        while (todo.length) {
            const s = todo.pop();
            for (const f of d[s]) {
                for (const t of Object.values(f.transit ?? {})) {
                    const sTarget = typeof t === 'string' ? t : Array.isArray(t) ? t[0] : null;
                    if (sTarget && !seen.has(sTarget)) {
                        seen.add(sTarget);
                        todo.push(sTarget);
                    }
                }
            }
        }
        expect([...seen].sort()).toEqual(Object.keys(d).sort());
    });
});
