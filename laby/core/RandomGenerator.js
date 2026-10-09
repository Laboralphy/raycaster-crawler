const { RangeException } = require('./errors');

/**
 * Générateur pseudo-aléatoire à graine (mulberry32, période 2^32).
 * Une même graine donne toujours le même niveau.
 */
class RandomGenerator {
    constructor() {
        this.nState = 0;
    }

    /** Réel dans [0, 1[ */
    random() {
        let t = (this.nState = (this.nState + 0x6D2B79F5) | 0);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    /**
     * Renvoie un nombre aléatoire entier compris entre deux bornes (incluses)
     * @param {number} n1 borne inf
     * @param {number} n2 borne sup
     */
    getRandom(n1, n2) {
        n1 = Math.trunc(n1);
        n2 = Math.trunc(n2);
        if (n1 > n2) {
            throw new RangeException(`getRandom min ${n1} is > max ${n2}`);
        }
        return n1 + Math.floor(this.random() * (n2 - n1 + 1));
    }

    /**
     * Défini la graine aléatoire ; les graines de plus de 32 bits sont
     * repliées sur 32 bits.
     * @param {number|bigint|null} n
     */
    setRandomSeed(n) {
        if (n !== null && n !== undefined) {
            let b = BigInt.asUintN(64, BigInt(n));
            b ^= b >> 32n;
            this.nState = Number(BigInt.asIntN(32, b));
        }
    }

    /** roll100(40) a 40% de chance de renvoyer true */
    roll100(nPercent) {
        return this.getRandom(0, 99) < nPercent;
    }

    /** Choisi un élément du tableau (null si vide) */
    choose(aChoices) {
        if (aChoices.length) {
            return aChoices[this.getRandom(0, aChoices.length - 1)];
        }
        return null;
    }

    /** Renvoie une copie mélangée du tableau (Fisher-Yates) */
    shuffle(a) {
        a = a.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = this.getRandom(0, i);
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }
}

module.exports = RandomGenerator;
