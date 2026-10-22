import { MissileThinker } from '../../libraries/Raycaster/MissileThinker.js';
import { PI } from '../../libraries/Raycaster/Tools/MathTools.js';

export class MagicMissileThinker extends MissileThinker {
    constructor() {
        super();
        this.nRndTime = 0;
        this.fSineTime = 0;
        this.fSineInc = 0;
        this.fSine = 0;
        this.bHeavy = false;
        this.bRandom = false;
        this.bBump = false;
        this.bSine = false;
        this.bCosine = false;
        this.bAoE = false;
        this.nAoE = 0;
        this.bSpareBoss = false;
        this.aEffects = null;
        this.aChances = null;
        this.nPower = 0;
        this.oOwner = null
    }

    setOptions(sOptions) {
        this.fSineInc = this.oGame.TIME_FACTOR / 320;
        this.bRandom = false;
        this.bBump = false;
        this.bSine = false;
        this.bCosine = false;
        this.bHeavy = false;
        this.bAoE = false;
        this.nAoE = 0;
        this.bSpareBoss = false;
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
                case 'p':
                    // épargne les boss : le projectile éclate sur eux sans effet
                    this.bSpareBoss = true;
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

    // rebond sur la direction de vol : un projectile ne glisse pas le long des
    // murs, le choc a donc annulé xSpeed et ySpeed ; et oWallCollision ne dit
    // pas toujours de quel côté est le mur (il ne retient que le point de
    // contrôle touché, dont le décalage sur cet axe peut être nul). On regarde
    // donc juste après le bord du projectile, axe par axe, vers où il va.
    bump() {
        const m = this.oMobile;
        let dx = Math.cos(m.fTheta);
        let dy = Math.sin(m.fTheta);
        const nReach = m.nSize + 1;
        const bWallX = Math.sign(dx) !== 0 && !!m.oRaycaster.clip(m.x + Math.sign(dx) * nReach, m.y, 1);
        const bWallY = Math.sign(dy) !== 0 && !!m.oRaycaster.clip(m.x, m.y + Math.sign(dy) * nReach, 1);
        if (bWallX || !bWallY) {
            dx = -dx
        }
        if (bWallY || !bWallX) {
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
                if (this.isSpared(oMC)) {
                    return b
                }
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
        } else if (this.bBump) {
            // un projectile qui rebondit ne touche jamais de mur : il explose
            // au bout de sa portée au lieu de disparaître
            this.oMobile.oMobileCollision = null;
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
            if (this.isSpared(oVictim)) {
                continue
            }
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

    /**
     * Option « p » : les boss (drapeau « B ») ne subissent rien.
     */
    isSpared(oMobile) {
        if (!this.bSpareBoss) {
            return false
        }
        const oCreature = oMobile.getData('creature');
        return !!oCreature && !!oCreature.getAttribute('f_boss')
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
