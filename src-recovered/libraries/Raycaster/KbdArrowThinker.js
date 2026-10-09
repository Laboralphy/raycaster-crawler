O2.createObject('O876_Raycaster.KbdArrowThinker', class KbdArrowThinker extends O876_Raycaster.KeyboardThinker {
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
            var oTarget = this.oMobile.oMobileCollision;
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
});
