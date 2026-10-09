import { CanvasFactory } from '../O876/CanvasFactory.js';

export class XMap {
    setSize(w, h) {
        this.aMap = [];
        let aBlock, aRow, x, y, nSide;
        this.nWidth = w;
        this.nHeight = h;
        for (y = 0; y < h; y++) {
            aRow = [];
            for (x = 0; x < w; x++) {
                aBlock = [];
                for (nSide = 0; nSide < 6; nSide++) {
                    aBlock.push({
                        x: x,
                        y: y,
                        oCanvas: null
                    })
                }
                aRow.push(aBlock)
            }
            this.aMap.push(aRow)
        }
    }

    get(x, y, nSide) {
        if (x < 0 || y < 0) {
            throw new Error('x or y out of bound ' + x + ', ' + y)
        }
        return this.aMap[y][x][nSide]
    }

    set(x, y, nSide, xValue) {
        this.aMap[y][x][nSide] = xValue
    }

    setBlockSize(w, h) {
        this.nBlockHeight = h;
        this.nBlockWidth = w
    }

    cloneTexture(oTextures, iTexture, x, y, nSide) {
        let oCanvas;
        const oBlock = this.get(x, y, nSide);
        if (oBlock.oCanvas === null) {
            oBlock.oCanvas = oCanvas = CanvasFactory.getCanvas()
        } else {
            oCanvas = oBlock.oCanvas;
            delete oCanvas.__shaded
        }
        const w = this.nBlockWidth;
        let h;
        if (nSide < 4) {
            h = this.nBlockHeight
        } else {
            h = w;
            oBlock.imageData = null;
            oBlock.imageData32 = null
        }
        oCanvas.width = w;
        oCanvas.height = h;
        oCanvas.getContext('2d').drawImage(oTextures, iTexture * w, 0, w, h, 0, 0, w, h);
        return oCanvas
    }
}
Object.assign(XMap.prototype, {
    aMap: null,
    nWidth: 0,
    nHeight: 0,
    nBlockWidth: 0,
    nBlockHeight: 0,
    nShadeFactor: 0
});
