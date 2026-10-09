import { KEYS } from './KEYS.js';
import { KeyboardThinker } from './KeyboardThinker.js';
import { RC } from './RC.js';

export class KbdArrowThinker extends KeyboardThinker {
    __construct() {
        this.defineKeys({
            forward: KEYS.UP,
            backward: KEYS.DOWN,
            left: KEYS.LEFT,
            right: KEYS.RIGHT
        })
    }

    think() {
        this.oMobile.fSpeed = 4;
        this.oMobile.fRotSpeed = 0.1;
        this.updateKeys()
    }

    checkCollision() {
        if (this.oMobile.oMobileCollision !== null) {
            const oTarget = this.oMobile.oMobileCollision;
            if (oTarget.oSprite.oBlueprint.nType != RC.OBJECT_TYPE_MISSILE) {
                this.oMobile.rollbackXY()
            }
        }
    }

    forwardDown() {
        this.oMobile.oSprite.playAnimationType(1)
    }

    forwardUp() {
        this.oMobile.oSprite.playAnimationType(0)
    }

    forwardCommand() {
        this.oMobile.moveForward();
        this.checkCollision()
    }

    leftCommand() {
        this.oMobile.rotateLeft()
    }

    rightCommand() {
        this.oMobile.rotateRight()
    }

    backwardCommand() {
        this.oMobile.moveBackward();
        this.checkCollision()
    }
}
