O2.createObject('O876_Raycaster.CameraMouseKeyboardThinker', class CameraMouseKeyboardThinker extends O876_Raycaster.MouseKeyboardThinker {
    __construct() {
        this.defineKeys({
            forward: KEYS.ALPHANUM.Z,
            forward2: KEYS.ALPHANUM.W,
            backward: KEYS.ALPHANUM.S,
            left: KEYS.ALPHANUM.Q,
            left2: KEYS.ALPHANUM.A,
            right: KEYS.ALPHANUM.D,
            use: KEYS.SPACE
        })
    }

    readMouseMovement(x, y) {
        this.oMobile.rotate(x / 166)
    }

    think() {
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

    forwardCommand() {
        this.oMobile.moveForward();
        this.checkCollision()
    }

    leftCommand() {
        this.oMobile.strafeLeft();
        this.checkCollision()
    }

    forward2Command() {
        this.oMobile.moveForward();
        this.checkCollision()
    }

    left2Command() {
        this.oMobile.strafeLeft();
        this.checkCollision()
    }

    rightCommand() {
        this.oMobile.strafeRight();
        this.checkCollision()
    }

    backwardCommand() {
        this.oMobile.moveBackward();
        this.checkCollision()
    }
});
Object.assign(O876_Raycaster.CameraMouseKeyboardThinker.prototype, {
    nRotationTime: 0,
    nRotationMask: 0,
    nRotationLeftTime: 0,
    nRotationRightTime: 0,
    fRotationSpeed: 0.1,
    ROTATION_MASK_LEFT: 0,
    ROTATION_MASK_RIGHT: 1,
    ROTATION_MASK_FORWARD: 2,
    ROTATION_MASK_BACKWARD: 3
});
