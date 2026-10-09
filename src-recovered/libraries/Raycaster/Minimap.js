O2.createObject('O876_Raycaster.Minimap', class Minimap {
    reset(oRaycaster) {
        this.aColors = ['#000000', '#FF8888', '#00FF00', '#00FFFF', '#5588AA', '#FF00FF', '#FFFF00', '#555555', '#777777'];
        this.oRaycaster = oRaycaster;
        this.aSquares = [];
        this.aModified = [
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ];
        var aSqrRaw;
        var x, y;
        for (y = 0; y < this.oRaycaster.nMapSize; y++) {
            aSqrRaw = [];
            for (x = 0; x < this.oRaycaster.nMapSize; x++) {
                aSqrRaw.push([-1, false, x, y])
            }
            this.aSquares.push(aSqrRaw)
        }
        if (this.oCanvas === null) {
            this.oCanvas = O876.CanvasFactory.getCanvas()
        }
        this.oCanvas.width = this.oCanvas.height = this.oRaycaster.nMapSize << 2;
        var ctx = this.oCanvas.getContext('2d');
        var pix = [];
        this.aColors.forEach(function(sItem, i, a) {
            var oID = ctx.createImageData(1, 1);
            var d = oID.data;
            d[0] = 100;
            d[1] = 200;
            d[2] = 50;
            d[3] = 1;
            pix.push(oID)
        });
        this.aPixels = pix;
        this.oContext = ctx
    }

    setSquare(x, y, n) {
        var q = this.aSquares[y][x];
        if (q[0] != n) {
            q[0] = n;
            if (!q[1]) {
                q[1] = true;
                this.aModified[n].push(q)
            }
        }
    }

    getMobileColor(aMobiles) {
        var l = aMobiles.length;
        var m, nType, bPlaceable = false;
        for (var i = 0; i < l; ++i) {
            m = aMobiles[i];
            nType = m.getType();
            if (nType == RC.OBJECT_TYPE_PLAYER || nType == RC.OBJECT_TYPE_MOB) {
                return 2
            }
            if (nType == RC.OBJECT_TYPE_MISSILE) {
                return 1
            }
            if (nType == RC.OBJECT_TYPE_PLACEABLE) {
                bPlaceable = true
            }
        }
        return bPlaceable ? 8 : 7
    }

    render() {
        var rc = this.oRaycaster;
        var nMapSize = rc.nMapSize;
        var x, y, nColor;
        for (y = 0; y < nMapSize; y++) {
            for (x = 0; x < nMapSize; x++) {
                if (this.bRestricted && rc.oCamera.xSector === x && rc.oCamera.ySector === y) {
                    nColor = 2
                } else if (this.bRestricted === false && rc.oMobileSectors.get(x, y).length) {
                    nColor = this.getMobileColor(rc.oMobileSectors.get(x, y))
                } else if (Marker.getMarkXY(rc.aScanSectors, x, y)) {
                    nColor = 4
                } else if (rc.getMapXYPhysical(x, y)) {
                    nColor = 0
                } else {
                    nColor = 7
                }
                this.setSquare(x, y, nColor)
            }
        }
        var q, mc, m = this.aModified;
        for (nColor = 0; nColor < m.length; nColor++) {
            if (this.aColors[nColor]) {
                mc = m[nColor];
                this.oContext.fillStyle = this.aColors[nColor];
                while (mc.length) {
                    q = mc.shift();
                    this.oContext.fillRect(q[2], q[3], 1, 1);
                    q[1] = false
                }
            }
        }
        rc.oRenderContext.drawImage(this.oCanvas, 2, 2)
    }
});
Object.assign(O876_Raycaster.Minimap.prototype, {
    oRaycaster: null,
    aSquares: null,
    aModified: null,
    aColors: null,
    oCanvas: null,
    oContext: null,
    aPixels: null,
    bRestricted: true
});
