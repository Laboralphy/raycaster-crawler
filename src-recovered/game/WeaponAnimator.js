import { WEAPON_MODELS_DATA } from './data/WEAPON_MODELS_DATA.js';
import { Animation } from '../libraries/Raycaster/Animation.js';
import { MathTools } from '../libraries/Raycaster/Tools/MathTools.js';

export class WeaponAnimator {
    constructor() {
        this.oWeaponLayer = null;
        this.oRaycaster = null;
        this.bInvalid = true;
        this.wScreen = 0;
        this.hScreen = 0;
        this.xWeapon = 0;
        this.yWeapon = 0;
        this.xCalibration = 0;
        this.yCalibration = 0;
        this.xShift = 0;
        this.yShift = 0;
        this.nDraw = 0;
        this.nDrawSpeed = 20;
        this.fOscilloSpeed = 0;
        this.oAnimationLibrary = null;
        this.sTile = '';
        this.sAnim = '';
        this.oAnimation = new Animation()
    }

    selectWeapon(wd) {
        this.sAnim = '';
        const wm = WEAPON_MODELS_DATA[wd.model];
        this.sTile = wm.tile;
        this.oAnimationLibrary = {
            ready: {
                nStart: wm.startframe,
                nCount: 1,
                nDuration: 0,
                nLoop: 0,
                nIndex: 0,
                nTime: 0
            },
            charging: {
                nStart: wm.startframe,
                nCount: 3,
                nDuration: 100,
                nLoop: 2,
                nIndex: 0,
                nTime: 0
            },
            stabbing: {
                nStart: wm.startframe + 1,
                nCount: 3,
                nDuration: 100,
                nLoop: 0,
                nIndex: 0,
                nTime: 0
            }
        };
        this.nDraw = 120;
        this.setAnimation('ready')
    }

    calibrateWeapon(x, y) {
        this.xShift = 0;
        this.yShift = 0;
        this.xCalibration = x;
        this.yCalibration = y
    }

    setAnimation(sAnim) {
        if (sAnim != this.sAnim) {
            this.oAnimation.assign(this.oAnimationLibrary[sAnim]);
            this.sAnim = sAnim;
            this.oAnimation.reset()
        }
    }

    compute(nTime, bMoving, sAnim) {
        this.setAnimation(sAnim);
        this.nIndex = this.oAnimation.animate(this.nDrawSpeed);
        if (this.nDraw > 0) {
            this.nDraw = Math.max(0, this.nDraw - (this.nDrawSpeed >> 2))
        }
        this.yShift = this.nDraw;
        if (bMoving) {
            const fTime = MathTools.toRad(nTime * this.fOscilloSpeed);
            this.xShift = 32 * Math.sin(fTime);
            this.yShift += Math.abs(32 * Math.cos(fTime))
        } else {
            this.xShift = 0
        }
        this.xWeapon = this.xCalibration + this.xShift | 0;
        this.yWeapon = this.yCalibration + this.yShift | 0
    }
}
