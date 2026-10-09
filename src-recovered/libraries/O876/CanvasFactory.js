export const CanvasFactory = {
    getCanvas: function() {
        const oCanvas = document.createElement('canvas');
        const oContext = oCanvas.getContext('2d');
        CanvasFactory.setImageSmoothing(oContext, false);
        return oCanvas
    },
    setImageSmoothing: function(oContext, b) {
        oContext.webkitImageSmoothingEnabled = b;
        oContext.mozImageSmoothingEnabled = b;
        oContext.imageSmoothingEnabled = b
    }
};
