import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fakeCanvas } from '../../canvas.mjs';

function stubBrowser() {
    vi.stubGlobal('document', { createElement: () => fakeCanvas(0, 0) });
}
stubBrowser();
beforeEach(stubBrowser);

const { Text } = await import('../../../../src-recovered/libraries/H5UI/Text.js');
const { STRINGS } = await import('../../../../src-recovered/game/data/STRINGS.js');

// texte à la ligne, largeur en caractères (le faux canvas compte 7 px par caractère)
function wrapped(sCaption, nChars) {
    const t = new Text();
    t.setWordWrap(true);
    t.setAutosize(false);
    t.setSize(nChars * 7 + 1, 400);
    t.setCaption(sCaption);
    t.render();
    return t.getSurface().fillText.mock.calls.map((a) => a[0]);
}

describe('Text à la ligne', () => {
    it('coupe aux espaces quand la ligne déborde', () => {
        expect(wrapped('one two three four', 9)).toEqual(['one two', 'three', 'four']);
    });

    it('garde les espaces en tête de ligne (suite alignée)', () => {
        expect(wrapped('- 2026 : AI,\n         modernize', 30)).toEqual(['- 2026 : AI,', '         modernize']);
    });

    it('lignes vides gardées', () => {
        expect(wrapped('a\n\nb', 10)).toEqual(['a', '', 'b']);
    });
});

describe('générique de fin', () => {
    // colonne de 400 px en chasse fixe 16 px : 41 caractères au plus par ligne,
    // sinon la suite repart à gauche et l'alignement est perdu
    it.each(['en', 'fr'])('%s : chaque ligne tient dans la colonne (sauf les phrases d\'introduction)', (sLang) => {
        STRINGS.setLanguage(sLang);
        const aLong = STRINGS._('~cs1_credits').split('\n').filter((s) => s.length > 41);
        expect(aLong).toHaveLength(1);
        expect(aLong[0]).toMatch(/2012\.$/);
    });
});
