O2.createObject('GXConfused', class GXConfused extends O876_Raycaster.GXEffect {
    __construct(oRaycaster) {
        super.__construct(oRaycaster);
        this.oCanvas = this.oRaycaster.oCanvas;
        this.oContext = this.oCanvas.getContext('2d');
        this.oConfCanvas = O876.CanvasFactory.getCanvas();
        this.oConfCanvas.width = this.oCanvas.width;
        this.oConfCanvas.height = this.oCanvas.height;
        this.oConfContext = this.oConfCanvas.getContext('2d');
        this.oConfContext.fillStyle = 'rgb(0, 0, 0)';
        this.oConfContext.fillRect(0, 0, this.oConfCanvas.width, this.oConfCanvas.height);
        this.nTime = 0;
        this.bOver = false
    }

    isOver() {
        return this.bOver
    }

    process() {
        this.nTime++
    }

    render() {
        this.buildConfusion();
        this.oContext.drawImage(this.oConfCanvas, 0, 0)
    }

    done() {
        this.oConfCanvas = null
    }

    terminate() {
        this.bOver = true
    }

    buildConfusion() {
        var fx = Math.sin(MathTools.toRad(this.nTime << 3)) + 1;
        var fy = 2 - fx;
        var nx = fx * 32 | 0;
        var ny = fy * 32 | 0;
        this.oConfContext.drawImage(this.oCanvas, nx, ny, this.oCanvas.width - nx - nx, this.oCanvas.height - ny - ny, 0, 0, this.oConfCanvas.width, this.oConfCanvas.height)
    }
});
Object.assign(GXConfused.prototype, {
    sClass: 'Confused',
    oCanvas: null,
    oContext: null,
    nTime: 0,
    bOver: false,
    oConfCanvas: null,
    oConfContext: null
});
