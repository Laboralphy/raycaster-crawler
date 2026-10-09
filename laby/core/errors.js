/**
 * Erreur de bornes (hors limite de grille, bornes aléatoires invalides) :
 * c'est la seule que les blocs try/catch du générateur interceptent.
 */
class RangeException extends Error {}

/**
 * Égalité entre une valeur de cellule éventuellement null (voisine hors
 * grille) et un code de bloc : null est considéré égal au vide (0).
 */
function looseEq(a, b) {
    if (a === null || b === null) {
        return !a === !b;
    }
    return a == b;
}

module.exports = { RangeException, looseEq };
