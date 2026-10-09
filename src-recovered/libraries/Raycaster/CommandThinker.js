import { Thinker } from './Thinker.js';

export class CommandThinker extends Thinker {
    setMovement(a, s) {
        if (this.fma != a || this.fms != s) {
            this.fma = a;
            this.fms = s;
            const oSprite = this.oMobile.oSprite;
            const nAnim = oSprite.nAnimationType;
            const bStopped = s === 0;
            switch (nAnim) {
                case this.ANIMATION_ACTION:
                case this.ANIMATION_STAND:
                    if (!bStopped) {
                        oSprite.playAnimationType(this.ANIMATION_WALK)
                    }
                    break;
                case this.ANIMATION_WALK:
                    if (bStopped) {
                        oSprite.playAnimationType(this.ANIMATION_STAND)
                    }
                    break
            }
        }
    }

    die() {
        this.setMovement(this.fma, 0);
        this.oMobile.oSprite.playAnimationType(this.ANIMATION_DEATH);
        this.oMobile.bEthereal = true;
        this.nDeadTime = this.oMobile.oSprite.oAnimation.nDuration * this.oMobile.oSprite.oAnimation.nCount;
        this.think = this.thinkDying
    }

    disable() {
        this.thinkDisable()
    }

    restore() {
        this.oMobile.bEthereal = false;
        this.think = this.thinkAlive
    }

    think() {
        this.restore()
    }

    thinkAlive() {
        const m = this.oMobile;
        m.move(this.fma, this.fms);
        if (this.oGame.oRaycaster.clip(m.x, m.y, 1)) {
            m.rollbackXY()
        }
    }

    thinkDisable() {
        this.oMobile.bEthereal = true;
        this.nDeadTime = 0;
        this.think = this.thinkDying
    }

    thinkDying() {
        this.nDeadTime -= this.oGame.TIME_FACTOR;
        if (this.nDeadTime <= 0) {
            this.oMobile.gotoLimbo();
            this.think = this.thinkDead
        }
    }

    thinkDead() {
        this.oMobile.bActive = false
    }
}
Object.assign(CommandThinker.prototype, {
    fma: 0,
    fms: 0,
    nDeadTime: 0,
    ANIMATION_STAND: 0,
    ANIMATION_WALK: 1,
    ANIMATION_ACTION: 2,
    ANIMATION_DEATH: 3
});
