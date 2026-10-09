import { RC } from './RC.js';
import { Thinker } from './Thinker.js';

export class MissileThinker extends Thinker {
    __construct() {
        this.think = this.thinkIdle
    }

    isCollisioned() {
        const bWallCollision = this.oMobile.bWallCollision;
        const bMobileCollision = this.oMobile.oMobileCollision !== null;
        const nTargetType = bMobileCollision ? this.oMobile.oMobileCollision.getType() : 0;
        const bOwnerCollision = this.oMobile.oMobileCollision == this.oOwner;
        const bSolidCollision = bMobileCollision && nTargetType != RC.OBJECT_TYPE_MISSILE && nTargetType != RC.OBJECT_TYPE_ITEM;
        if (bWallCollision) {
            this.oMobile.oMobileCollision = null;
            return true
        }
        if (bOwnerCollision && !this.bExiting) {
            return true
        }
        if (this.bExiting) {
            this.bExiting = bOwnerCollision;
            return false
        }
        if (bSolidCollision) {
            return true
        }
        return false
    }

    advance() {
        this.oMobile.moveForward()
    }

    explode() {
        this.oLastHitMobile = this.oMobile.oMobileCollision;
        this.oMobile.rollbackXY();
        this.oMobile.oSprite.playAnimationType(this.ANIMATION_EXPLOSION);
        this.nExplosionTime = 0;
        this.nExplosionMaxTime = this.oMobile.oSprite.oAnimation.nDuration * this.oMobile.oSprite.oAnimation.nCount;
        this.oMobile.bEthereal = true;
        this.think = this.thinkHit
    }

    extinct() {
        this.oMobile.bEthereal = true;
        this.oMobile.gotoLimbo();
        this.oMobile.oSprite.playAnimationType(-1);
        this.think = this.thinkIdle
    }

    fire(oMobile) {
        this.bExiting = true;
        this.oOwner = oMobile;
        this.oMobile.oSprite.playAnimationType(this.ANIMATION_MOVING);
        this.oMobile.bSlideWall = false;
        this.oMobile.bEthereal = false;
        this.think = this.thinkGo;
        this.advance()
    }

    thinkGo() {
        if (this.nLifeOut < this.oGame.nTime) {
            this.extinct();
            return
        }
        for (let i = 0; i < this.nStepSpeed; i++) {
            this.advance();
            if (this.isCollisioned()) {
                this.explode();
                break
            }
        }
    }

    thinkHit() {
        this.nExplosionTime += this.oGame.TIME_FACTOR;
        if (this.nExplosionTime >= this.nExplosionMaxTime) {
            this.oMobile.gotoLimbo();
            this.think = this.thinkIdle
        }
    }

    thinkIdle() {
        this.oMobile.bActive = false
    }
}
Object.assign(MissileThinker.prototype, {
    oOwner: null,
    nExplosionTime: 0,
    nExplosionMaxTime: 4,
    bExiting: true,
    oLastHitMobile: null,
    nStepSpeed: 4,
    ANIMATION_EXPLOSION: 0,
    ANIMATION_MOVING: 1,
    nLifeOut: 0
});
