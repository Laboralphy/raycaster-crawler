import { CanvasFactory } from '../O876/CanvasFactory.js';
import { GXEffect } from './GXEffect.js';

export class GXMessage extends GXEffect {
    __construct(oRaycaster) {
        super.__construct(oRaycaster);
        const s = this.oStyle;
        this.wSize = s.width;
        this.hSize = s.height;
        this.fTimePerChar = s.speed;
        this.yOfs = s.position;
        s.font.toString().split(' ').forEach((function(sFontProp) {
            if (sFontProp | 0) {
                this.nTextHeight = sFontProp | 0
            } else {
                this.sFontFamily = sFontProp
            }
        }).bind(this));
        this.oCanvas = this.oRaycaster.oCanvas;
        this.oContext = this.oCanvas.getContext('2d');
        this.oMessageCanvas = CanvasFactory.getCanvas();
        this.oMessageCanvas.width = this.wSize;
        this.oMessageCanvas.height = this.hSize;
        this.xPos = this.xTo = (this.oCanvas.width - this.oMessageCanvas.width) >> 1;
        this.yPos = 0;
        this.yTo = 16;
        this.xAcc = 0;
        this.yAcc = -2;
        this.buildPath();
        if (this.sTextAlign == 'center') {
            this.xTextPos = this.oMessageCanvas.width >> 1
        } else {
            this.xTextPos = this.oMessageCanvas.height >> 1
        }
        this.yTextPos = (this.nTextHeight >> 1) + (this.oMessageCanvas.height >> 1)
    }

    drawIcon(oSource, x, y, w, h) {
        const nOffset = (this.oMessageCanvas.height - 32) >> 1;
        this.oMessageCanvas.getContext('2d').drawImage(oSource, x, y, w, h, nOffset, nOffset, 32, 32);
        this.xTextPos += 32;
        this.oIcon = null
    }

    setIcon(oSource, x, y, w, h) {
        this.oIcon = {
            src: oSource,
            x: x,
            y: y,
            w: w,
            h: h
        }
    }

    setMessage(sMessage) {
        this.sMessage = sMessage;
        this.nTime = sMessage.length * this.fTimePerChar / this.oRaycaster.TIME_FACTOR | 0
    }

    getTime() {
        return this.nTime
    }

    isOver() {
        return this.nState >= 4
    }

    buildPath() {
        this.aPath = [];
        const nWeightPos = 1;
        const nWeightTo = 1;
        const nSum = nWeightPos + nWeightTo;
        let bMove;
        let xPos = this.xPos;
        let yPos = this.yPos;
        do {
            bMove = false;
            if (xPos != this.xTo) {
                if (Math.abs(xPos - this.xTo) < 1) {
                    xPos = this.xTo
                } else {
                    xPos = (xPos * nWeightPos + this.xTo * nWeightTo) / nSum
                }
                bMove = true
            }
            if (yPos != this.yTo) {
                if (Math.abs(yPos - this.yTo) < 1) {
                    yPos = this.yTo
                } else {
                    yPos = (yPos * nWeightPos + this.yTo * nWeightTo) / nSum
                }
                bMove = true
            }
            if (bMove) {
                this.aPath.push([xPos | 0, yPos + this.yOfs | 0, 1])
            }
        } while (bMove && this.aPath.length < 20);
        for (let i = this.aPath.length - 2; i >= 0; i--) {
            this.aPath[i][2] = Math.max(0, this.aPath[i + 1][2] - 0.2)
        }
    }

    movePopup() {
        if (this.iPath < this.aPath.length) {
            const aPos = this.aPath[this.iPath];
            this.xPos = aPos[0];
            this.yPos = aPos[1];
            this.fAlpha = aPos[2];
            this.iPath++
        }
    }

    reverseMovePopup() {
        if (this.aPath.length) {
            const aPos = this.aPath.pop();
            this.xPos = aPos[0];
            this.yPos = aPos[1];
            this.fAlpha = aPos[2]
        }
    }

    process() {
        let sMessage, oCtx, nTextWidth;
        switch (this.nState) {
            case 0:
                sMessage = this.sMessage;
                oCtx = this.oMessageCanvas.getContext('2d');
                oCtx.font = this.nTextHeight.toString() + 'px ' + this.sFontFamily;
                oCtx.textAlign = this.sTextAlign;
                oCtx.fillStyle = this.oStyle.background;
                oCtx.strokeStyle = this.oStyle.border;
                oCtx.fillRect(0, 0, this.oMessageCanvas.width, this.oMessageCanvas.height);
                oCtx.strokeRect(0, 0, this.oMessageCanvas.width, this.oMessageCanvas.height);
                if (this.oIcon) {
                    this.drawIcon(this.oIcon.src, this.oIcon.x, this.oIcon.y, this.oIcon.w, this.oIcon.h)
                }
                nTextWidth = oCtx.measureText(sMessage).width;
                if ((nTextWidth + this.xTextPos + 2) < this.wSize) {
                    oCtx.fillStyle = this.oStyle.shadow;
                    oCtx.fillText(sMessage, this.xTextPos + 2, this.yTextPos + 2);
                    oCtx.fillStyle = this.oStyle.text;
                    oCtx.fillText(sMessage, this.xTextPos, this.yTextPos)
                } else {
                    let sMessage2 = '';
                    const aWords = sMessage.split(' ');
                    while (aWords.length > 0 && (oCtx.measureText(sMessage2 + aWords[0]).width + this.xTextPos + 8) < this.wSize) {
                        sMessage2 += aWords.shift();
                        sMessage2 += ' '
                    }
                    sMessage = aWords.join(' ');
                    oCtx.fillStyle = this.oStyle.text;
                    const yLine = (this.nTextHeight >> 1) + 2;
                    oCtx.fillText(sMessage2, this.xTextPos + 2, this.yTextPos + 2 - yLine);
                    oCtx.fillText(sMessage, this.xTextPos + 2, this.yTextPos + 2 + yLine);
                    oCtx.fillStyle = this.oStyle.shadow;
                    oCtx.fillText(sMessage2, this.xTextPos, this.yTextPos - yLine);
                    oCtx.fillText(sMessage, this.xTextPos, this.yTextPos + yLine)
                }
                this.nState++;
                this.fAlpha = 0;
                break;
            case 1:
                this.movePopup();
                this.nTime--;
                if (this.nTime <= 0) {
                    this.yTo = -this.oMessageCanvas.height;
                    this.nState++
                }
                break;
            case 2:
                if (this.aPath.length === 0) {
                    this.nState++
                }
                this.reverseMovePopup();
                break;
            case 3:
                this.oMessageCanvas = null;
                this.terminate();
                break
        }
    }

    render() {
        if (this.fAlpha > 0) {
            const a = this.oContext.globalAlpha;
            this.oContext.globalAlpha = this.fAlpha;
            this.oContext.drawImage(this.oMessageCanvas, this.xPos | 0, this.yPos | 0);
            this.oContext.globalAlpha = a
        }
    }

    terminate() {
        this.nState = 4
    }
}
Object.assign(GXMessage.prototype, {
    sClass: 'Message',
    oCanvas: null,
    oContext: null,
    nTime: 0,
    sMessage: '',
    oMessageCanvas: null,
    xPos: 0,
    yPos: 0,
    xTo: 0,
    yTo: 0,
    yOfs: 48,
    nState: 0,
    fAlpha: 1,
    aPath: null,
    iPath: 0,
    sTextAlign: 'left',
    xTextPos: 0,
    yTextPos: 0,
    nTextHeight: 13,
    fTimePerChar: 150,
    wSize: 512,
    hSize: 40,
    sFontFamily: 'monospace',
    oStyle: {
        background: 'rgb(255, 255, 255)',
        border: 'rgb(64, 64, 64)',
        shadow: 'rgb(220, 220, 220)',
        text: 'rgb(0, 0, 0)',
        width: 512,
        height: 40,
        font: 'monospace 13',
        speed: 100,
        position: 48
    },
    oIcon: null
});
