import { CanvasFactory } from '../../libraries/O876/CanvasFactory.js';
import { GXMessage } from '../../libraries/Raycaster/GXMessage.js';
import { Raycaster } from '../../libraries/Raycaster/Raycaster.js';
import { MathTools } from '../../libraries/Raycaster/Tools/MathTools.js';
import { buildUpperMap } from '../storey.js';

export class Cutscene {
    constructor(...aArgs) {
        this.__construct(...aArgs);
    }

    __construct() {
        this.aPopups = [];
        this.oRenderCanvas = CanvasFactory.getCanvas();
        this.oRenderContext = this.oRenderCanvas.getContext('2d');
        this.oRCCanvas = CanvasFactory.getCanvas();
        this.oRCCanvas.width = this.RAYCASTER_WIDTH;
        this.oRCCanvas.height = this.RAYCASTER_HEIGHT;
        this.oRCContext = this.oRenderCanvas.getContext('2d');
        this.defineData();
        this.buildRaycaster()
    }

    finalize() {
        this.oRenderCanvas = null;
        this.oRenderContext = null;
        this.oFinalCanvas = null;
        this.oFinalContext = null;
        this.oRCCanvas = null;
        this.oRCContext = null;
        this.oRaycaster = null;
        this.oCameraThinker = null
    }

    buildRaycaster() {
        this.bRender = false;
        this.oRaycaster = new Raycaster();
        this.oRaycaster.setConfig({
            canvas: this.oRCCanvas,
            smoothTextures: false,
            ghostVision: 0,
            drawMap: false,
            zoom: 1
        });
        this.oRaycaster.initialize();
        this.oRaycaster.defineWorld(this.RAYCASTER_LEVEL);
        this.oRaycaster.buildLevel();
        const oThinker = this.oRaycaster.oThinkerManager.createThinker('O876_Raycaster.Linear');
        this.oRaycaster.oCamera.setThinker(oThinker)
    }

    sortPopups(a, b) {
        return a[0] - b[0]
    }

    popup(sMessage, nDelay) {
        if (nDelay === undefined) {
            nDelay = 0
        }
        const oGX = new GXMessage(this.oRaycaster);
        oGX.setMessage(sMessage);
        oGX.yTo += 4;
        oGX.yPos = oGX.yTo - 16;
        oGX.buildPath();
        this.aPopups.push([this.nTime + nDelay, oGX]);
        this.aPopups.sort(this.sortPopups);
        return oGX.getTime()
    }

    runPopups() {
        if (this.aPopups.length) {
            if (this.nTime >= this.aPopups[0][0]) {
                const aGX = this.aPopups.shift();
                this.oRaycaster.oEffects.addEffect(aGX[1])
            }
        }
    }

    defineData() {
        this.RAYCASTER_LEVEL = this.getLevelData();
        const aLaby = this.getLabyMap();
        let xBlock, yBlock, aRow, nBlock, nCode;
        for (yBlock = 0; yBlock < aLaby.length; yBlock++) {
            aRow = [];
            for (xBlock = 0; xBlock < aLaby[yBlock].length; xBlock++) {
                nBlock = aLaby[yBlock][xBlock];
                if (nBlock in this.RAYCASTER_LEVEL.walls.metacodes) {
                    if (typeof this.RAYCASTER_LEVEL.walls.metacodes[nBlock] === 'object') {
                        nCode = MathTools.rndChoose(this.RAYCASTER_LEVEL.walls.metacodes[nBlock])
                    } else {
                        nCode = this.RAYCASTER_LEVEL.walls.metacodes[nBlock]
                    }
                } else {
                    nCode = 0
                }
                aRow.push(nCode)
            }
            this.RAYCASTER_LEVEL.map.push(aRow)
        }
        const oWalls = this.RAYCASTER_LEVEL.walls;
        if (oWalls.storey) {
            this.RAYCASTER_LEVEL.uppermap = buildUpperMap(this.RAYCASTER_LEVEL.map, oWalls.codes, oWalls.storey)
        }
    }

    setFinalCanvas(c) {
        this.oFinalCanvas = c;
        this.oFinalContext = c.getContext('2d');
        this.oRenderCanvas.width = c.width;
        this.oRenderCanvas.height = c.height
    }

    render() {
        if (this.bRender) {
            this.nTime++;
            this.runPopups();
            this.oRaycaster.frameProcess();
            this.oRaycaster.frameRender();
            const xRC = this.xRC;
            const yRC = this.yRC;
            this.oRenderContext.drawImage(this.oRCCanvas, xRC, yRC);
            if (this.onRender) {
                this.onRender()
            }
            this.oFinalContext.drawImage(this.oRenderCanvas, 0, 0)
        } else {
            if (this.oRaycaster.oImages.complete()) {
                if (this.oRaycaster.shadeProcess()) {
                    this.bRender = true
                }
            }
        }
    }
}
Object.assign(Cutscene.prototype, {
    RAYCASTER_WIDTH: 800,
    RAYCASTER_HEIGHT: 500,
    RAYCASTER_LEVEL: null,
    oRenderCanvas: null,
    oRenderContext: null,
    oFinalCanvas: null,
    oFinalContext: null,
    oRCCanvas: null,
    oRCContext: null,
    xRC: 0,
    yRC: 0,
    oRaycaster: null,
    oCameraThinker: null,
    bRender: false,
    aPopups: null,
    nTime: 0,
    getLabyMap: null,
    getLevelData: null,
    onRender: null
});
