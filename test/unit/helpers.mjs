// Outils communs aux tests unitaires.
import { expect } from 'vitest';

// Vérifie les valeurs par défaut d'une instance neuve. Seule la valeur lue
// compte : le test passe que le défaut vienne du prototype ou du constructeur.
export function assertDefaults(oInstance, oExpected) {
    for (const [sKey, xValue] of Object.entries(oExpected)) {
        expect(oInstance[sKey], `défaut de ${sKey}`).toEqual(xValue);
    }
}

// Vérifie que deux instances ne partagent pas leurs tableaux et objets
// (un défaut mutable laissé sur le prototype serait partagé).
export function assertNotShared(a, b, aKeys) {
    for (const sKey of aKeys) {
        expect(a[sKey], `${sKey} est partagé entre deux instances`).not.toBe(b[sKey]);
    }
}
