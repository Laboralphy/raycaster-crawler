export const PI = 3.14159;
export const MathTools = {
    aQuadrans: [-PI / 2, -PI / 4, 0, PI / 4, PI / 2],
    fToDeg: 180 / PI,
    fToRad: PI / 180,
    pRndFunc: Math.random,
    sBASE64: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
    iRndTable: 0,
    nRndSeed: Date.now() % 2147483647,
    aRndTable: [0, 8, 109, 220, 222, 241, 149, 107, 75, 248, 254, 140, 16, 66, 74, 21, 211, 47, 80, 242, 154, 27, 205, 128, 161, 89, 77, 36, 95, 110, 85, 48, 212, 140, 211, 249, 22, 79, 200, 50, 28, 188, 52, 140, 202, 120, 68, 145, 62, 70, 184, 190, 91, 197, 152, 224, 149, 104, 25, 178, 252, 182, 202, 182, 141, 197, 4, 81, 181, 242, 145, 42, 39, 227, 156, 198, 225, 193, 219, 93, 122, 175, 249, 0, 175, 143, 70, 239, 46, 246, 163, 53, 163, 109, 168, 135, 2, 235, 25, 92, 20, 145, 138, 77, 69, 166, 78, 176, 173, 212, 166, 113, 94, 161, 41, 50, 239, 49, 111, 164, 70, 60, 2, 37, 171, 75, 136, 156, 11, 56, 42, 146, 138, 229, 73, 146, 77, 61, 98, 196, 135, 106, 63, 197, 195, 86, 96, 203, 113, 101, 170, 247, 181, 113, 80, 250, 108, 7, 255, 237, 129, 226, 79, 107, 112, 166, 103, 241, 24, 223, 239, 120, 198, 58, 60, 82, 128, 3, 184, 66, 143, 224, 145, 224, 81, 206, 163, 45, 63, 90, 168, 114, 59, 33, 159, 95, 28, 139, 123, 98, 125, 196, 15, 70, 194, 253, 54, 14, 109, 226, 71, 17, 161, 93, 186, 87, 244, 138, 20, 52, 123, 251, 26, 36, 17, 46, 52, 231, 232, 76, 31, 221, 84, 37, 216, 165, 212, 106, 197, 242, 98, 43, 39, 175, 254, 145, 190, 84, 118, 222, 187, 136, 120, 163, 236, 249],
    sign: function(x) {
        if (x === 0) {
            return 0
        }
        return x > 0 ? 1 : -1
    },
    distance: function(dx, dy) {
        return Math.sqrt((dx * dx) + (dy * dy))
    },
    isPointInsideAngle: function(xCenter, yCenter, fBissect, fAperture, xTarget, yTarget) {
        let xPoint = xTarget - xCenter;
        let yPoint = yTarget - yCenter;
        const dPoint = MathTools.distance(xPoint, yPoint);
        xPoint /= dPoint;
        yPoint /= dPoint;
        const xBissect = Math.cos(fBissect);
        const yBissect = Math.sin(fBissect);
        const fDot = xPoint * xBissect + yPoint * yBissect;
        return Math.acos(fDot) < (fAperture / 2)
    },
    quadran: function(a) {
        let i = 0;
        while (i < (MathTools.aQuadrans.length - 1)) {
            if (a >= MathTools.aQuadrans[i] && a < MathTools.aQuadrans[i + 1]) {
                break
            }
            i++
        }
        return i
    },
    toDeg: function(fRad) {
        return fRad * MathTools.fToDeg
    },
    toRad: function(fDeg) {
        return fDeg * MathTools.fToRad
    },
    rndSeed8: function(n) {
        MathTools.iRndIndex = n % MathTools.aRndTable.length
    },
    rnd8: function(nMin, nMax) {
        const r = MathTools.aRndTable[MathTools.iRndIndex];
        MathTools.iRndIndex = (MathTools.iRndIndex + 1) & 0xFF;
        const d = nMax - nMin + 1;
        return (r * d / 256 | 0) + nMin
    },
    rndSeed31: function(n) {
        let v = n % 2147483647;
        if (v == 0) {
            v = 1
        }
        return this.nRndSeed = v
    },
    rnd31: function(nMin, nMax) {
        const nRnd = this.rndSeed31(16807 * this.nRndSeed);
        if (nMin === undefined) {
            return nRnd
        } else {
            return nRnd * (nMax - nMin + 1) / 2147483647 + nMin | 0
        }
    },
    rndJS: function(nMin, nMax) {
        const fRnd = Math.random();
        if (nMin === undefined) {
            return fRnd
        } else {
            return (fRnd * (nMax - nMin + 1) | 0) + nMin
        }
    },
    rnd: null,
    benchmarkRnd: function() {
        let x, i, a = [];
        console.time('rnd js');
        for (i = 0; i < 1000000; ++i) {
            x = MathTools.rnd(0, 10);
            if (a[x] === undefined) {
                a[x] = 1
            } else {
                ++a[x]
            }
        }
        console.timeEnd('rnd js');
        console.log(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9], a[10]);
        a = [];
        console.time('rnd 31');
        for (i = 0; i < 1000000; ++i) {
            x = MathTools.rnd31(0, 10);
            if (a[x] === undefined) {
                a[x] = 1
            } else {
                ++a[x]
            }
        }
        console.timeEnd('rnd 31');
        console.log(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9], a[10])
    },
    rollDice: function(nFaces, nCount) {
        if (nCount > 3) {
            return (nCount - 3) * ((1 + nFaces) / 2) + MathTools.rollDice(nFaces, 3) | 0
        }
        let n = 0;
        for (let i = 0; i < nCount; i++) {
            n += MathTools.rnd(1, nFaces)
        }
        return n
    },
    rndChoose: function(a) {
        if (a.length) {
            return a[MathTools.rnd(0, a.length - 1)]
        } else {
            return null
        }
    },
    base64Encode: function(n, l) {
        let s = '';
        if (l === undefined) {
            l = 0
        }
        while (n > 0) {
            s = MathTools.sBASE64.charAt(n & 63) + s;
            l--;
            n >>= 6
        }
        while (l > 0) {
            s = 'A' + s;
            l--
        }
        return s
    },
    base64Decode: function(s64) {
        let n = 0;
        const nLen = s64.length;
        for (let i = 0; i < nLen; i++) {
            n = (n << 6) | MathTools.sBASE64.indexOf(s64.charAt(i))
        }
        return n
    }
};
MathTools.rnd = MathTools.rndJS;
