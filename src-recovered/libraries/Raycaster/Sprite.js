import { Animation } from './Animation.js';

export class Sprite {
    oBlueprint = null;
    oAnimation = null;
    nAnimation = -1;
    nFrame = 0;
    nLight = 0;
    nAngle8 = 0;
    nAnimationType = 0;
    sCompose = '';
    bVisible = true;
    oOverlay = null;
    nOverlayFrame = null;
    bTranslucent = false;
    nAlpha = 2;

    playAnimation(n) {
        if (n == this.nAnimation) {
            return
        }
        const aBTA = this.oBlueprint.oTile.aAnimations;
        this.nAnimation = n;
        if (n < aBTA.length) {
            if (this.oAnimation === null) {
                this.oAnimation = new Animation()
            }
            if (aBTA[n]) {
                this.oAnimation.assign(aBTA[n]);
                this.bVisible = true
            } else {
                this.bVisible = false
            }
            this.oAnimation.nDirLoop = 1
        } else {
            throw new Error('sprite animation out of range: ' + n + ' max: ' + aBTA.length)
        }
    }

    playAnimationType(nAnimationType, bReset) {
        this.nAnimationType = nAnimationType;
        this.playAnimation(this.nAnimationType * 8 + this.nAngle8);
        if (bReset) {
            this.oAnimation.reset()
        }
    }

    setDirection(n) {
        this.nAngle8 = n;
        let nIndex = 0;
        if (this.oAnimation !== null) {
            nIndex = this.oAnimation.nIndex
        }
        this.playAnimationType(this.nAnimationType);
        this.oAnimation.nIndex = nIndex
    }

    animate(nInc) {
        if (this.oAnimation) {
            this.nFrame = this.oAnimation.animate(nInc)
        }
    }
}
