O2.createObject('O876.CanvasFactory', {
    getCanvas: function() {
        var oCanvas = document.createElement('canvas');
        var oContext = oCanvas.getContext('2d');
        O876.CanvasFactory.setImageSmoothing(oContext, false);
        return oCanvas
    },
    setImageSmoothing: function(oContext, b) {
        oContext.webkitImageSmoothingEnabled = b;
        oContext.mozImageSmoothingEnabled = b;
        oContext.imageSmoothingEnabled = b
    }
});
