export const PointerLock = {
    oElement: null,
    oHookInstance: null,
    oHookFunction: null,
    bInitialized: null,
    bLocked: false,
    bEnabled: true,
    hasPointerLockFeature: function() {
        return 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document
    },
    init: function() {
        if (!PointerLock.hasPointerLockFeature()) {
            return false
        }
        if (PointerLock.bInitialized) {
            return true
        }
        document.addEventListener('pointerlockchange', PointerLock.eventChange, false);
        document.addEventListener('mozpointerlockchange', PointerLock.eventChange, false);
        document.addEventListener('webkitpointerlockchange', PointerLock.eventChange, false);
        document.addEventListener('pointerlockerror', PointerLock.eventError, false);
        document.addEventListener('mozpointerlockerror', PointerLock.eventError, false);
        document.addEventListener('webkitpointerlockerror', PointerLock.eventError, false);
        PointerLock.bInitialized = true;
        return true
    },
    locked: function() {
        return PointerLock.bLocked
    },
    setHook: function(oFunction, oInstance) {
        PointerLock.oHookInstance = oInstance || window;
        PointerLock.oHookFunction = oFunction
    },
    requestPointerLock: function(oElement) {
        if (!PointerLock.bEnabled) {
            return
        }
        if (PointerLock.locked()) {
            return
        }
        PointerLock.oElement = oElement;
        oElement.requestPointerLock = oElement.requestPointerLock || oElement.mozRequestPointerLockWithKeys || oElement.mozRequestPointerLock || oElement.webkitRequestPointerLock;
        oElement.requestPointerLock()
    },
    exitPointerLock: function() {
        if (!PointerLock.locked()) {
            return
        }
        document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;
        document.exitPointerLock()
    },
    eventChange: function(e) {
        const oPointerLockElement = document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement;
        if (oPointerLockElement) {
            document.addEventListener('mousemove', PointerLock.eventMouseMove, false);
            PointerLock.bLocked = true
        } else {
            document.removeEventListener('mousemove', PointerLock.eventMouseMove, false);
            PointerLock.oElement = null;
            PointerLock.bLocked = false
        }
    },
    eventError: function(e) {
        console.error('PointerLock error', e)
    },
    eventMouseMove: function(e) {
        const xMove = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
        const yMove = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
        const p = PointerLock;
        if (p.oHookFunction) {
            p.oHookFunction.apply(p.oHookInstance, [xMove, yMove])
        }
    }
};
