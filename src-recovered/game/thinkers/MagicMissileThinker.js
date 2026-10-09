import { MissileThinker } from '../../libraries/Raycaster/MissileThinker.js';
import { PI } from '../../libraries/Raycaster/Tools/MathTools.js';

export class MagicMissileThinker extends MissileThinker {
    setOptions(sOptions) {
        this.fSineInc = this.oGame.TIME_FACTOR / 320;
        this.bRandom = false;
        this.bBump = false;
        this.bSine = false;
        this.bCosine = false;
        this.bHeavy = false;
        this.bAoE = false;
        this.nAoE = 0;
        const nOptLen = sOptions.length;
        for (let iOpt = 0; iOpt < nOptLen; iOpt++) {
            switch (sOptions.charAt(iOpt)) {
                case 'h':
                    this.bHeavy = true;
                    break;
                case 'b':
                    this.bBump = true;
                    break;
                case 's':
                    this.bSine = true;
                    break;
                case 'c':
                    this.bCosine = true;
                    break;
                case 'r':
                    this.bRandom = true;
                    break;
                case 'a':
                    this.bAoE = true;
                    if ((iOpt + 1) < nOptLen) {
                        this.nAoE = (this.oGame.oRaycaster.nPlaneSpacing >> 1) * (sOptions.charAt(iOpt + 1) | 0);
                        iOpt++
                    }
                    break
            }
        }
    }

    setEffects(aEffects, aChances, nBonus) {
        this.aEffects = aEffects;
        this.aChances = aChances;
        this.nPower = nBonus
    }

    fire(oMobile) {
        this.nRndTime = 0;
        this.fSineTime = PI / 2;
        if (this.bCosine) {
            this.fSineTime += PI / 2
        }
        this.fSine = 0;
        super.fire(oMobile)
    }

    bump() {
        let dx = this.oMobile.xSpeed;
        let dy = this.oMobile.ySpeed;
        if (this.oMobile.oWallCollision.x) {
            dx = -dx
        }
        if (this.oMobile.oWallCollision.y) {
            dy = -dy
        }
        this.oMobile.fTheta = Math.atan2(dy, dx);
        this.oMobile.moveForward()
    }

    isCollisioned() {
        let b = super.isCollisioned();
        const oMC = this.oMobile.oMobileCollision;
        if (b) {
            if (this.bBump && oMC === null) {
                this.bump();
                b = false
            }
            if (oMC) {
                const oMCC = oMC.getData('creature');
                const nReflect = oMCC.getAttribute('reflect');
                if (nReflect > 0) {
                    this.oMobile.rollbackXY();
                    this.oMobile.rotate(PI);
                    this.oGame.gc_affect(oMC, this.aEffects, this.aChances, this.nPower - nReflect);
                    return false
                }
                const oMCT = oMC.oThinker;
                oMCT._hitByMissile(this.oMobile);
                if (this.bHeavy) {
                    oMCT.oPulse.x += 10 * Math.cos(this.oMobile.fTheta);
                    oMCT.oPulse.y += 10 * Math.sin(this.oMobile.fTheta)
                }
                if (this.bAoE) {
                    this.boom()
                } else {
                    this.oGame.gc_affect(oMC, this.aEffects, this.aChances, this.nPower)
                }
            }
        }
        return b
    }

    extinct() {
        if (this.bAoE) {
            this.boom();
            this.explode()
        } else {
            super.extinct()
        }
    }

    boom() {
        const xBoom = this.oMobile.x, yBoom = this.oMobile.y;
        let fBoomAngle;
        let xVic, yVic;
        const aVictims = this.oGame.gc_selectMobilesInCircle(xBoom, yBoom, this.nAoE);
        const nBodyCount = aVictims.length;
        let i, oVictim;
        for (i = 0; i < nBodyCount; i++) {
            oVictim = aVictims[i];
            if (this.bHeavy) {
                xVic = oVictim.x;
                yVic = oVictim.y;
                fBoomAngle = Math.atan2(yVic - yBoom, xVic - xBoom);
                oVictim.oThinker.oPulse.x += 10 * Math.cos(fBoomAngle);
                oVictim.oThinker.oPulse.y += 10 * Math.sin(fBoomAngle)
            }
            this.oGame.gc_affect(oVictim, this.aEffects, this.aChances, this.nPower)
        }
    }

    advance() {
        super.advance();
        let f;
        if (this.bRandom) {
            this.nRndTime = (this.nRndTime + 1) & 3;
            if (this.nRndTime === 0) {
                this.oMobile.rotate((Math.random() - 0.5) / 2)
            }
        }
        if (this.bSine) {
            this.fSineTime += this.fSineInc;
            f = 0.5 * Math.sin(this.fSineTime);
            this.oMobile.rotate(f - this.fSine);
            this.fSine = f
        } else if (this.bCosine) {
            this.fSineTime += this.fSineInc;
            f = 0.5 * Math.cos(this.fSineTime);
            this.oMobile.rotate(f - this.fSine);
            this.fSine = f
        }
    }

    explode() {
        const oMobile = this.oMobile.oMobileCollision;
        if (oMobile) {
            const oCreature = oMobile.getData('creature');
            const nReflect = oCreature.getAttribute('reflect');
            if (nReflect > 0) {
                this.oMobile.rollbackXY();
                this.oMobile.rotate(PI);
                return
            }
        }
        super.explode()
    }

    _hitByMissile(oMissile) {}
}
Object.assign(MagicMissileThinker.prototype, {
    nRndTime: 0,
    fSineTime: 0,
    fSineInc: 0,
    fSine: 0,
    bHeavy: false,
    bRandom: false,
    bBump: false,
    bSine: false,
    bCosine: false,
    bAoE: false,
    nAoE: 0,
    aEffects: null,
    aChances: null,
    nPower: 0,
    oOwner: null
});
