import { GXEffect } from '../../libraries/Raycaster/GXEffect.js';
import { MathTools } from '../../libraries/Raycaster/Tools/MathTools.js';

export class GXColorVeil extends GXEffect {
    __construct(oRaycaster) {
        super.__construct(oRaycaster);
        this.oCanvas = this.oRaycaster.oCanvas;
        this.oContext = this.oCanvas.getContext('2d');
        this.nTime = 0
    }

    clearEffect(nEffect) {
        this.nEffectMask &= 7 ^ nEffect;
        this.setupVeil()
    }

    setEffect(nEffect) {
        this.nEffectMask |= nEffect;
        this.setupVeil()
    }

    setupVeil() {
        switch (this.nEffectMask) {
            case 0:
                this.terminate();
                break;
            case 1:
                this.setupSnare();
                break;
            case 2:
            case 3:
                this.setupRoot();
                break;
            case 4:
            case 5:
            case 6:
            case 7:
                this.setupHold();
                break
        }
    }

    setupSnare() {
        this.xStyle = this.oContext.createLinearGradient(0, this.oCanvas.height >> 1, 0, this.oCanvas.height - 1);
        this.xStyle.addColorStop(0, 'rgba(0, 255, 0, 0)');
        this.xStyle.addColorStop(1, 'rgba(0, 255, 0, 1)');
        this.yFrom = this.oCanvas.height >> 1;
        this.yTo = this.oCanvas.height
    }

    setupRoot() {
        this.xStyle = this.oContext.createLinearGradient(0, this.oCanvas.height >> 1, 0, this.oCanvas.height - 1);
        this.xStyle.addColorStop(0, 'rgba(0, 220, 255, 0)');
        this.xStyle.addColorStop(1, 'rgba(0, 220, 255, 1)');
        this.yFrom = this.oCanvas.height >> 1;
        this.yTo = this.oCanvas.height
    }

    setupHold() {
        this.xStyle = 'rgb(220, 220, 255)';
        this.yFrom = 0;
        this.yTo = this.oCanvas.height
    }

    isOver() {
        return this.nEffectMask === 0
    }

    process() {
        this.nTime++
    }

    render() {
        if (this.nEffectMask) {
            const f = this.oContext.globalAlpha;
            this.oContext.globalAlpha = Math.sin(MathTools.toRad(this.nTime << 3)) / 5 + 0.444;
            this.oContext.fillStyle = this.xStyle;
            this.oContext.fillRect(0, this.yFrom, this.oCanvas.width, this.yTo);
            this.oContext.globalAlpha = f
        }
    }

    done() {}

    terminate() {
        this.bOver = true
    }
}
Object.assign(GXColorVeil.prototype, {
    sClass: 'ColorVeil',
    oCanvas: null,
    oContext: null,
    nTime: 0,
    xStyle: null,
    yFrom: 0,
    yTo: 0,
    nEffectMask: 0,
    SNARE: 1,
    ROOT: 2,
    HOLD: 4
});
