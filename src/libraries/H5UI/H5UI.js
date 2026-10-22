import { CanvasFactory } from '../O876/CanvasFactory.js';

export const H5UI = {
    data: {
        renderCount: 0,
        cdiCount: 0,
        pixelCount: 0,
        renderedList: {},
        buildCanvases: 0,
        destroyedCanvases: 0
    },
    canvasDispenser: [],
    handle: 0,
    root: null,
    initRoot: function() {
        H5UI.root = document.getElementsByTagName('body')[0]
    },
    setRoot: function(oDomElement) {
        H5UI.root = oDomElement
    },
    getCanvas: function() {
        const oCanvas = H5UI.canvasDispenser.pop();
        if (oCanvas) {
            return oCanvas
        } else {
            return CanvasFactory.getCanvas()
        }
    },
    recycleCanvas: function(oCanvas) {
        H5UI.canvasDispenser.push(oCanvas)
    }
};
