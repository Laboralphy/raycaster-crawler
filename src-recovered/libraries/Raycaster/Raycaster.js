O2.createObject('O876_Raycaster.Raycaster', class Raycaster {
    setConfig(oConfig) {
        if (this.oConfig === null) {
            this.oConfig = oConfig
        } else {
            for (var i in oConfig) {
                this.oConfig[i] = oConfig[i]
            }
        }
    }

    defineWorld(aWorld) {
        this.aWorld = aWorld
    }

    initialize() {
        this.fViewAngle = PI / 4;
        if (this.oConfig.planeSpacing) {
            this.nPlaneSpacing = this.oConfig.planeSpacing;
            this.xTexture = this.oConfig.planeSpacing
        }
        if (this.oConfig.wallHeight) {
            this.yTexture = this.oConfig.wallHeight
        }
        if (this.oCanvas === null) {
            this.initCanvas()
        }
        this.setDetail(1);
        this.aZBuffer = [];
        this.oEffects = new O876_Raycaster.GXManager();
        if (this.oImages === null) {
            this.oImages = new O876_Raycaster.ImageLoader()
        }
        this.oThinkerManager = new O876_Raycaster.ThinkerManager();
        this.oContinueRay = {
            bContinue: false
        };
        this.oWeaponLayer = {
            canvas: null,
            x: -1024,
            y: 0,
            width: 0,
            height: 0,
            index: 0,
            alpha: 1,
            zoom: 1
        };
        if (this.oConfig.shades) {
            this.nShadingThreshold = this.oConfig.shades
        }
        switch (this.nShadingThreshold) {
            case 0:
                this.nDimmedWall = 0;
                break;
            case 1:
                this.nDimmedWall = 1;
                break;
            default:
                this.nDimmedWall = Math.round(this.nShadingThreshold / 3);
                break
        }
    }

    finalize() {
        this.oEffects.clear();
        this.oEffects = null;
        this.oImages.finalize();
        this.oImages = null;
        this.oThinkerManager = null
    }

    shadeProcess() {
        if (this.nShadingThreshold === 0) {
            return true
        }
        var i = '';
        var w = this.shadeImage(this.oWall.image, false);
        this.oWall.image = w;
        if (this.bFloor) {
            w = this.shadeImage(this.oFloor.image, false);
            this.oFloor.image = w
        }
        for (i in this.oHorde.oTiles) {
            if (this.oHorde.oTiles[i].bShading) {
                w = this.shadeImage(this.oHorde.oTiles[i].oImage, true);
                this.oHorde.oTiles[i].bShading = false;
                this.oHorde.oTiles[i].oImage = w;
                return false
            }
        }
        return true
    }

    drawUpper() {
        this.oUpper.fViewHeight = this.fViewHeight + 2;
        this.oUpper.drawScreen()
    }

    frameProcess() {
        this.updateHorde();
        this.oEffects.process()
    }

    frameRender() {
        this.drawScreen();
        this.oEffects.render()
    }

    downgrade() {
        this.oCanvas.width >>= 1;
        this.oCanvas.height >>= 1;
        this.xScrSize >>= 1;
        this.yScrSize >>= 1;
        this.backgroundRedim();
        if (this.oUpper) {
            this.oUpper.xScrSize >>= 1;
            this.oUpper.yScrSize >>= 1
        }
    }

    addGXEffect(G) {
        var g = new G(this);
        this.oEffects.addEffect(g);
        return g
    }

    drawWeapon() {
        var w = this.oWeaponLayer;
        if (w.index >= 0 && w.canvas) {
            var fAlpha = 1;
            if (w.alpha != 1) {
                fAlpha = this.oRenderContext.globalAlpha;
                this.oRenderContext.globalAlpha = w.alpha
            }
            this.oRenderContext.drawImage(w.canvas, w.index * w.width, 0, w.width, w.height, w.x, w.y, w.width * w.zoom | 0, w.height * w.zoom | 0);
            if (w.alpha != 1) {
                this.oRenderContext.globalAlpha = fAlpha
            }
        }
    }

    buildLevel() {
        this.oHorde = null;
        this.oEffects.clear();
        this.aScanSectors = null;
        this.aWallSectors = null;
        this.oMobileSectors = null;
        this.buildMap();
        this.buildHorde()
    }

    updateHorde() {
        this.oHorde.think()
    }

    initCanvas() {
        if (typeof this.oConfig.canvas == 'string') {
            this.oCanvas = document.getElementById(this.oConfig.canvas)
        } else if (typeof this.oConfig.canvas == 'object' && this.oConfig.canvas !== null) {
            this.oCanvas = this.oConfig.canvas
        } else {
            throw new Error('initCanvas failed: configuration object needs a valid canvas entry (dom or string id)')
        }
        if (this.wCanvas) {
            this.oCanvas.width = this.wCanvas
        }
        if (this.hCanvas) {
            this.oCanvas.height = this.hCanvas
        }
        this.oContext = this.oCanvas.getContext('2d');
        if (this.bUseVideoBuffer) {
            if (this.oRenderCanvas === null) {
                this.oRenderCanvas = O876.CanvasFactory.getCanvas()
            }
            this.oRenderCanvas.height = this.oCanvas.height;
            this.oRenderCanvas.width = this.oCanvas.width;
            this.oRenderContext = this.oRenderCanvas.getContext('2d')
        } else {
            this.oRenderCanvas = this.oCanvas;
            this.oRenderContext = this.oContext
        }
        if ('smoothTextures' in this.oConfig) {
            this.oRenderContext.mozImageSmoothingEnabled = this.oConfig.smoothTextures;
            this.oRenderContext.webkitImageSmoothingEnabled = this.oConfig.smoothTextures
        }
        this.xScrSize = this.oCanvas.width;
        this.yScrSize = this.oCanvas.height >> 1
    }

    setDetail(nDetail) {
        switch (nDetail) {
            case 1:
                this.nZoom = 1;
                this.xScrSize = this.oCanvas.width;
                this.drawFloor = this.drawFloor_zoom1;
                this.drawFloorAndCeil = this.drawFloorAndCeil_zoom1;
                break;
            default:
                throw new Error('setting detail is now deprecated. Use css resizing instead')
        }
    }

    loadImage(sUrl) {
        return this.oImages.load(sUrl)
    }

    filterImage(oImage, f) {
        if (f) {
            var oCtx = oImage.getContext('2d');
            var oImgData = oCtx.getImageData(0, 0, oImage.width, oImage.height);
            var aPixData = oImgData.data;
            var nPixCount = aPixData.length;
            var fr = f.r,
                fg = f.g,
                fb = f.b;
            for (var iPix = 0; iPix < nPixCount; iPix += 4) {
                aPixData[iPix] = Math.min(255, Math.max(0, aPixData[iPix] * fr | 0));
                aPixData[iPix + 1] = Math.min(255, Math.max(0, aPixData[iPix + 1] * fg | 0));
                aPixData[iPix + 2] = Math.min(255, Math.max(0, aPixData[iPix + 2] * fb | 0))
            }
            oCtx.putImageData(oImgData, 0, 0)
        }
    }

    shadeImage(oImage, bSprite) {
        if (oImage.__shaded) {
            return oImage
        }
        var oShaded = O876.CanvasFactory.getCanvas();
        oShaded.width = oImage.width;
        oShaded.height = oImage.height * (this.nShadingThreshold + 1);
        var oCtx = oShaded.getContext('2d');
        var g;
        var nMethod = 1;
        g = {
            r: this.oVisual.fogColor.r,
            g: this.oVisual.fogColor.g,
            b: this.oVisual.fogColor.b
        };
        if (bSprite && this.oVisual.filter) {
            var oFilteredImage;
            oFilteredImage = O876.CanvasFactory.getCanvas();
            oFilteredImage.width = oImage.width;
            oFilteredImage.height = oImage.height;
            oFilteredImage.getContext('2d').drawImage(oImage, 0, 0);
            this.filterImage(oFilteredImage, this.oVisual.filter);
            oImage = oFilteredImage
        }
        var fAlphaMin = this.oVisual.diffuse || 0;
        for (var i = 0; i <= this.nShadingThreshold; i++) {
            g.a = Math.min(i / this.nShadingThreshold, 1) * (1 - fAlphaMin);
            switch (nMethod) {
                case 0:
                    oCtx.globalCompositeOperation = 'source-over';
                    oCtx.drawImage(oImage, 0, i * oImage.height);
                    oCtx.fillStyle = GfxTools.buildRGBA(g);
                    oCtx.fillRect(0, i * oImage.height, oImage.width, oImage.height);
                    oCtx.globalCompositeOperation = 'destination-in';
                    oCtx.drawImage(oImage, 0, i * oImage.height);
                    oCtx.globalCompositeOperation = 'source-over';
                    break;
                case 1:
                    oCtx.drawImage(oImage, 0, i * oImage.height);
                    oCtx.globalCompositeOperation = 'source-atop';
                    oCtx.fillStyle = GfxTools.buildRGBA(g);
                    oCtx.fillRect(0, i * oImage.height, oImage.width, oImage.height);
                    oCtx.globalCompositeOperation = 'source-over';
                    break;
                case 2:
                    oCtx.drawImage(oImage, 0, i * oImage.height);
                    oCtx.globalCompositeOperation = 'source-over';
                    break
            }
        }
        oShaded.__shaded = true;
        return oShaded
    }

    cloneWall(x, y, nSide, pDrawingFunction) {
        var c = this.oXMap.cloneTexture(this.oWall.image, this.aWorld.walls.codes[this.getMapXYTexture(x, y)][(1 - nSide & 1)], x, y, nSide);
        pDrawingFunction(this, c, x, y, nSide);
        this.shadeCloneWall(c, x, y, nSide)
    }

    shadeCloneWall(oCanvas, x, y, nSide) {
        return this.oXMap.get(x, y, nSide).oCanvas = this.shadeImage(oCanvas, false)
    }

    cloneFlat(x, y, nSide, pDrawingFunction) {
        var iTexture = this.aWorld.flats.codes[this.getMapXYTexture(x, y)][nSide];
        if (iTexture < 0) {
            return
        }
        var c = this.oXMap.cloneTexture(this.oFloor.image, iTexture, x, y, nSide + 4);
        nSide += 4;
        pDrawingFunction(this, c, x, y, nSide);
        c = this.shadeCloneWall(c, x, y, nSide);
        var b = this.oXMap.get(x, y, nSide);
        var oCtx = c.getContext('2d');
        b.imageData = oCtx.getImageData(0, 0, c.width, c.height);
        b.imageData32 = new Uint32Array(b.imageData.data.buffer)
    }

    checkObjectStructure(oObj, xKeys) {
        if (ArrayTools.isArray(xKeys)) {
            for (var i = 0; i < xKeys.length; i++) {
                this.checkObjectStructure(oObj, xKeys[i])
            }
            return true
        }
        if (xKeys.indexOf('.') >= 0) {
            var aKeys = xKeys.split('.');
            var sKey0 = aKeys.shift();
            if (this.checkObjectStructure(oObj, sKey0)) {
                return this.checkObjectStructure(oObj[sKey0], aKeys.join('.'))
            } else {
                throw new Error('invalid object structure: missing key [' + xKeys + ']')
            }
        } else {
            if (typeof oObj != 'object') {
                throw new Error('invalid object type : ' + (typeof oObj) + ' ; can not contain key [' + xKeys + ']')
            }
            if (oObj === null) {
                throw new Error('object is null, and can not contain key [' + xKeys + ']')
            }
            if (xKeys in oObj) {
                return true
            } else {
                throw new Error('invalid object structure: missing key [' + xKeys + ']')
            }
        }
    }

    buildMap() {
        var oData = this.aWorld;
        try {
            this.checkObjectStructure(oData, ['map.length', 'walls.src', 'walls.codes', 'startpoint.x', 'startpoint.y', 'startpoint.angle', 'visual'])
        } catch (e) {}
        this.nMapSize = oData.map.length;
        this.oMobileSectors = new O876_Raycaster.MobileRegister(this.nMapSize);
        this.oDoors = Marker.create();
        this.aMap = [];
        var yMap, xMap;
        for (yMap = 0; yMap < oData.map.length; ++yMap) {
            this.aMap[yMap] = new Uint32Array(oData.map[yMap].length);
            for (xMap = 0; xMap < oData.map[yMap].length; ++xMap) {
                this.aMap[yMap][xMap] = oData.map[yMap][xMap]
            }
        }
        this.oWall = {
            image: this.loadImage(oData.walls.src),
            codes: oData.walls.codes,
            animated: 'animated' in oData.walls ? oData.walls.animated : {}
        };
        if ('flats' in oData) {
            this.bFloor = true;
            var pEmpty = function(item, index, array) {
                if (item) {
                    return item[1] === -1
                } else {
                    return true
                }
            };
            var bEmptyCeil = oData.flats.codes.every(function(item, index, array) {
                if (item) {
                    return item[1] === -1
                } else {
                    return true
                }
            });
            var bEmptyFloor = oData.flats.codes.every(function(item, index, array) {
                if (item) {
                    return item[0] === -1
                } else {
                    return true
                }
            });
            this.bCeil = !bEmptyCeil;
            this.bFloor = !bEmptyFloor;
            if (this.bFloor) {
                this.oFloor = {
                    image: this.loadImage(oData.flats.src),
                    codes: oData.flats.codes,
                    imageData: null,
                    imageData32: null,
                    renderSurface32: null
                }
            }
        } else {
            this.bFloor = false;
            this.bCeil = false
        }
        if ('background' in oData && oData.background) {
            this.oBackground = this.loadImage(oData.background);
            this.bSky = true
        } else {
            this.oBackground = null;
            this.bSky = false
        }
        this.buildAnimatedTextures();
        this.oCamera = new O876_Raycaster.Mobile();
        this.oCamera.oRaycaster = this;
        this.oCamera.fSpeed = 8;
        this.oCamera.fRotSpeed = 0.1;
        this.oCamera.xSave = this.oCamera.x = oData.startpoint.x;
        this.oCamera.ySave = this.oCamera.y = oData.startpoint.y;
        this.oCamera.xSector = this.oCamera.x / this.nPlaneSpacing | 0;
        this.oCamera.ySector = this.oCamera.y / this.nPlaneSpacing | 0;
        this.oCamera.fTheta = oData.startpoint.angle;
        this.oCamera.bActive = true;
        this.oVisual = {
            ceilColor: oData.visual.ceilColor,
            floorColor: oData.visual.floorColor,
            light: oData.visual.light,
            diffuse: oData.visual.diffuse,
            filter: oData.visual.filter,
            fogDistance: oData.visual.fogDistance,
            fogColor: oData.visual.fogColor
        };
        this.buildGradient();
        this.oXMap = new O876_Raycaster.XMap();
        this.oXMap.setBlockSize(this.xTexture, this.yTexture);
        this.oXMap.setSize(this.nMapSize, this.nMapSize);
        if ('uppermap' in oData && !!oData.uppermap) {
            this.buildSecondFloor()
        }
    }

    backgroundRedim() {
        var oBackground = this.oBackground;
        var dh = this.yScrSize << 1;
        if (oBackground && oBackground.height != dh) {
            var sw = oBackground.width;
            var sh = oBackground.height;
            var dw = sw * dh / sh | 0;
            var bg2 = O876.CanvasFactory.getCanvas();
            bg2.height = dh;
            bg2.width = dw;
            var ctx = bg2.getContext('2d');
            ctx.drawImage(oBackground, 0, 0, sw, sh, 0, 0, dw, dh);
            this.oBackground = bg2
        }
    }

    buildSecondFloor() {
        var oData = this.aWorld;
        if ('uppermap' in oData) {
            var SELF = this.constructor;
            var urc = new SELF();
            urc.TIME_FACTOR = this.TIME_FACTOR;
            urc.setConfig(this.oConfig);
            urc.bUseVideoBuffer = false;
            urc.initialize();
            var oUpperWorld = {
                map: oData.uppermap,
                walls: oData.walls,
                visual: oData.visual,
                startpoint: oData.startpoint,
                tiles: oData.tiles,
                blueprints: {},
                objects: []
            };
            urc.defineWorld(oUpperWorld);
            urc.buildMap();
            urc.bGradient = false;
            urc.oCamera = this.oCamera;
            urc.oWall = this.oWall;
            urc.oRenderCanvas = this.oRenderCanvas;
            urc.oRenderContext = this.oRenderContext;
            this.oUpper = urc
        }
    }

    buildHorde() {
        this.oHorde = new O876_Raycaster.Horde(this);
        this.oHorde.oThinkerManager = this.oThinkerManager;
        var aData = this.aWorld;
        var oTiles = aData.tiles;
        var oBlueprints = aData.blueprints;
        var oMobs = aData.objects;
        this.oHorde.linkMobile(this.oCamera);
        var i = '';
        for (i in oTiles) {
            this.oHorde.defineTile(i, oTiles[i])
        }
        for (i in oBlueprints) {
            this.oHorde.defineBlueprint(i, oBlueprints[i])
        }
        for (i = 0; i < oMobs.length; i++) {
            this.oHorde.defineMobile(oMobs[i])
        }
    }

    buildGradient() {
        var g;
        this.oVisual.gradients = [];
        g = this.oRenderContext.createLinearGradient(0, 0, 0, this.oCanvas.height >> 1);
        g.addColorStop(0, GfxTools.buildRGBA(this.oVisual.ceilColor));
        if (this.oVisual.fogDistance < 1) {
            g.addColorStop(this.oVisual.fogDistance, GfxTools.buildRGBA(this.oVisual.fogColor))
        }
        g.addColorStop(1, GfxTools.buildRGBA(this.oVisual.fogColor));
        this.oVisual.gradients[0] = g;
        g = this.oRenderContext.createLinearGradient(0, this.oCanvas.height - 1, 0, (this.oCanvas.height >> 1) + 1);
        g.addColorStop(0, GfxTools.buildRGBA(this.oVisual.floorColor));
        if (this.oVisual.fogDistance < 1) {
            g.addColorStop(this.oVisual.fogDistance, GfxTools.buildRGBA(this.oVisual.fogColor))
        }
        g.addColorStop(1, GfxTools.buildRGBA(this.oVisual.fogColor));
        this.oVisual.gradients[1] = g;
        this.nShadingFactor = this.oVisual.light
    }

    insideMap(x) {
        return x >= 0 && x < this.nMapSize
    }

    projectRay(oData, x, y, dx, dy, aExcludes, aVisibles) {
        var side = 0;
        var map = this.aMap;
        var nMapSize = this.nMapSize;
        var nScale = this.nPlaneSpacing;
        var xi, yi, xt, dxt, yt, dyt, t, dxi, dyi, xoff, yoff, cmax = oData.nRayLimit;
        var oContinue = oData.oContinueRay;
        if (oContinue.bContinue) {
            xi = oContinue.xi;
            yi = oContinue.yi
        } else {
            xi = x / nScale | 0;
            yi = y / nScale | 0
        }
        xoff = (x / nScale) - xi;
        yoff = (y / nScale) - yi;
        if (dx < 0) {
            xt = -xoff / dx;
            dxt = -1 / dx;
            dxi = -1
        } else {
            xt = (1 - xoff) / dx;
            dxt = 1 / dx;
            dxi = 1
        }
        if (dy < 0) {
            yt = -yoff / dy;
            dyt = -1 / dy;
            dyi = -1
        } else {
            yt = (1 - yoff) / dy;
            dyt = 1 / dy;
            dyi = 1
        }
        var xScale = nScale * dx;
        var yScale = nScale * dy;
        t = 0;
        var done = 0;
        var c = 0;
        var bStillVisible = true;
        var nOfs, nTOfs = 0;
        var nText;
        var Marker_getMarkXY = Marker.getMarkXY;
        var Marker_markXY = Marker.markXY;
        var nPhys;
        var nPHYS_FIRST_DOOR = this.PHYS_FIRST_DOOR;
        var nPHYS_LAST_DOOR = this.PHYS_LAST_DOOR;
        var nPHYS_SECRET_BLOCK = this.PHYS_SECRET_BLOCK;
        var nPHYS_OFFSET_BLOCK = this.PHYS_OFFSET_BLOCK;
        var nPHYS_TRANSPARENT_BLOCK = this.PHYS_TRANSPARENT_BLOCK;
        var xint = 0,
            yint = 0;
        var sameOffsetWall = this.sameOffsetWall;
        while (done === 0) {
            if (xt < yt) {
                xi += dxi;
                if (xi >= 0 && xi < nMapSize) {
                    nText = map[yi][xi];
                    nPhys = (nText >> 8) & 0xFF;
                    if (nText !== 0 && Marker_getMarkXY(aExcludes, xi, yi)) {
                        nPhys = nText = 0
                    }
                    if (nPhys >= nPHYS_FIRST_DOOR && nPhys <= nPHYS_LAST_DOOR) {
                        nOfs = nScale >> 1
                    } else if (nPhys == nPHYS_SECRET_BLOCK || nPhys == nPHYS_TRANSPARENT_BLOCK || nPhys == nPHYS_OFFSET_BLOCK) {
                        nOfs = (nText >> 16) & 0xFF
                    } else {
                        nOfs = 0
                    }
                    if (nOfs) {
                        xint = x + xScale * xt;
                        yint = y + yScale * xt;
                        if (sameOffsetWall(nOfs, xint, yint, xi, yi, dx, dy, nScale)) {
                            nTOfs = (dxt / nScale) * nOfs;
                            yint = y + yScale * (xt + nTOfs);
                            if (((yint / nScale | 0)) != yi) {
                                nPhys = nText = 0
                            }
                            if (nText !== 0 && Marker_getMarkXY(aExcludes, xi, yi)) {
                                nPhys = nText = 0
                            }
                        } else {
                            nPhys = nText = 0
                        }
                    } else {
                        nTOfs = 0
                    }
                    if (nPhys == 0xB || nPhys == 0) {
                        if (bStillVisible) {
                            Marker_markXY(aVisibles, xi, yi)
                        }
                        xt += dxt
                    } else {
                        t = xt + nTOfs;
                        xint = x + xScale * t;
                        yint = y + yScale * t;
                        done = 1;
                        side = 1;
                        bStillVisible = false
                    }
                } else {
                    t = xt;
                    c = cmax
                }
            } else {
                yi += dyi;
                if (yi >= 0 && yi < nMapSize) {
                    nText = map[yi][xi];
                    nPhys = (nText >> 8) & 0xFF;
                    if (nText !== 0 && Marker_getMarkXY(aExcludes, xi, yi)) {
                        nPhys = nText = 0
                    }
                    if (nPhys >= nPHYS_FIRST_DOOR && nPhys <= nPHYS_LAST_DOOR) {
                        nOfs = nScale >> 1
                    } else if (nPhys == nPHYS_SECRET_BLOCK || nPhys == nPHYS_TRANSPARENT_BLOCK || nPhys == nPHYS_OFFSET_BLOCK) {
                        nOfs = (nText >> 16) & 0xFF
                    } else {
                        nOfs = 0
                    }
                    if (nOfs) {
                        xint = x + xScale * yt;
                        yint = y + yScale * yt;
                        if (sameOffsetWall(nOfs, xint, yint, xi, yi, dx, dy, nScale)) {
                            nTOfs = (dyt / nScale) * nOfs;
                            xint = x + xScale * (yt + nTOfs);
                            if (((xint / nScale | 0)) != xi) {
                                nPhys = nText = 0
                            }
                            if (nText !== 0 && Marker_getMarkXY(aExcludes, xi, yi)) {
                                nPhys = nText = 0
                            }
                        } else {
                            nPhys = nText = 0
                        }
                    } else {
                        nTOfs = 0
                    }
                    if (nPhys == 0xB || nPhys == 0) {
                        if (bStillVisible) {
                            Marker_markXY(aVisibles, xi, yi)
                        }
                        yt += dyt
                    } else {
                        t = yt + nTOfs;
                        xint = x + xScale * t;
                        yint = y + yScale * t;
                        done = 1;
                        side = 2;
                        bStillVisible = false
                    }
                } else {
                    t = yt;
                    c = cmax
                }
            }
            c++;
            if (c >= cmax) {
                done = 1
            }
        }
        if (c < cmax) {
            oData.nWallPanel = map[yi][xi];
            oData.bSideWall = side == 1;
            oData.nSideWall = side - 1;
            oData.nWallPos = oData.bSideWall ? yint % oData.xTexture : xint % oData.xTexture;
            if (oData.bSideWall && dxi < 0) {
                oData.nWallPos = oData.xTexture - 1 - oData.nWallPos;
                oData.nSideWall = 2
            }
            if (!oData.bSideWall && dyi > 0) {
                oData.nWallPos = oData.xTexture - 1 - oData.nWallPos;
                oData.nSideWall = 3
            }
            oData.xWall = xi;
            oData.yWall = yi;
            oData.fDist = t * nScale;
            oData.bExterior = false;
            if (this.isWallTransparent(oData.xWall, oData.yWall)) {
                oContinue.bContinue = true;
                oContinue.xi = xi;
                oContinue.yi = yi
            } else {
                oContinue.bContinue = false
            }
        } else {
            oData.fDist = t * nScale;
            oData.bExterior = true
        }
    }

    castRay(oData, x, y, dx, dy, xScreen, aVisibles) {
        var aExcludes = Marker.create();
        var oXBlock = null;
        var oWall;
        var nTextureBase;
        var nMaxIterations = 6;
        if (!aVisibles) {
            aVisibles = Marker.create()
        }
        var oBG = this.oBackground;
        do {
            this.projectRay(oData, x, y, dx, dy, aExcludes, aVisibles);
            if (oData.bExterior) {
                if (oBG) {
                    this.drawExteriorLine(xScreen, oData.fDist)
                }
            } else if (oData.fDist >= 0) {
                if (xScreen !== undefined) {
                    oXBlock = this.oXMap.get(oData.xWall, oData.yWall, oData.nSideWall);
                    if (oXBlock.oCanvas) {
                        oWall = oXBlock.oCanvas;
                        nTextureBase = 0
                    } else {
                        oWall = oData.oWall.image;
                        nTextureBase = oData.oWall.codes[oData.nWallPanel & 0xFF][oData.bSideWall ? 1 : 0] * this.xTexture
                    }
                    this.drawLine(xScreen, oData.fDist, nTextureBase, oData.nWallPos | 0, oData.bSideWall, oWall, oData.nWallPanel)
                }
                if (oData.oContinueRay.bContinue) {
                    Marker.markXY(aExcludes, oData.xWall, oData.yWall)
                }
            }
            nMaxIterations--
        } while (oData.oContinueRay.bContinue && nMaxIterations > 0);
        return aVisibles
    }

    fastCastRay(x, y, a) {
        var aExcludes = Marker.create();
        var nMaxIterations = 6;
        var aVisibles = {};
        var dx = Math.cos(a);
        var dy = Math.sin(a);
        var oData = {
            oContinueRay: {
                bContinue: false
            },
            nRayLimit: 10
        };
        do {
            this.projectRay(oData, x, y, dx, dy, aExcludes, aVisibles);
            if (oData.fDist >= 0) {
                if (oData.oContinueRay.bContinue) {
                    Marker.markXY(aExcludes, oData.xWall, oData.yWall)
                }
            }
            nMaxIterations--
        } while (oData.oContinueRay.bContinue && nMaxIterations > 0);
        return aVisibles
    }

    sameOffsetWall(nOfs, x0, y0, xm, ym, fBx, fBy, ps) {
        x0 += nOfs * fBx;
        y0 += nOfs * fBy;
        var ym2, xm2;
        ym2 = y0 / ps | 0;
        xm2 = x0 / ps | 0;
        return xm2 == xm && ym2 == ym
    }

    zBufferCompare(a, b) {
        if (a[9] != b[9]) {
            return b[9] - a[9]
        }
        return a[5] - b[5]
    }

    isDoor(xw, yw) {
        var nPhys = this.getMapXYPhysical(xw, yw);
        return (nPhys >= this.PHYS_FIRST_DOOR && nPhys <= this.PHYS_LAST_DOOR)
    }

    isWallTransparent(xWall, yWall) {
        var nPhys = this.getMapXYPhysical(xWall, yWall);
        if (nPhys === 0) {
            return false
        }
        var nOffset = this.getMapXYOffset(xWall, yWall);
        if ((nPhys >= this.PHYS_FIRST_DOOR && nPhys <= this.PHYS_LAST_DOOR && nOffset !== 0) || nPhys == this.PHYS_TRANSPARENT_BLOCK || nPhys == this.PHYS_INVISIBLE_BLOCK) {
            return true
        }
        return false
    }

    getWallDepth(xw, yw) {
        var nPhys = this.getMapXYPhysical(xw, yw);
        if (this.isDoor(xw, yw)) {
            return this.nPlaneSpacing >> 1
        }
        if (nPhys == this.PHYS_SECRET_BLOCK || nPhys == this.PHYS_TRANSPARENT_BLOCK || nPhys == this.PHYS_OFFSET_BLOCK) {
            return this.getMapXYOffset(xw, yw)
        }
        return 0
    }

    setMapXY(x, y, nCode) {
        this.aMap[y][x] = nCode
    }

    getMapXY(x, y) {
        return this.aMap[y][x]
    }

    setMapXYTexture(x, y, nTexture) {
        this.aMap[y][x] = (this.aMap[y][x] & 0xFFFFFF00) | nTexture
    }

    getMapXYTexture(x, y) {
        return this.aMap[y][x] & 0xFF
    }

    setMapXYPhysical(x, y, nPhys) {
        this.aMap[y][x] = (this.aMap[y][x] & 0xFFFF00FF) | (nPhys << 8)
    }

    getMapXYPhysical(x, y) {
        return (this.aMap[y][x] >> 8) & 0xFF
    }

    setMapXYOffset(x, y, nOffset) {
        this.aMap[y][x] = (this.aMap[y][x] & 0xFF00FFFF) | (nOffset << 16)
    }

    getMapXYOffset(x, y) {
        return (this.aMap[y][x] >> 16) & 0xFF
    }

    setMapXYTag(x, y, nTag) {
        this.aMap[y][x] = (this.aMap[y][x] & 0x00FFFFFF) | (nOffset << 24)
    }

    getMapXYTag(x, y) {
        return (this.aMap[y][x] >> 24) & 0xFF
    }

    drawScreen() {
        var wx1 = Math.cos(this.oCamera.fTheta - this.fViewAngle);
        var wy1 = Math.sin(this.oCamera.fTheta - this.fViewAngle);
        var wx2 = Math.cos(this.oCamera.fTheta + this.fViewAngle);
        var wy2 = Math.sin(this.oCamera.fTheta + this.fViewAngle);
        var dx = (wx2 - wx1) / this.xScrSize;
        var dy = (wy2 - wy1) / this.xScrSize;
        var fBx = wx1;
        var fBy = wy1;
        var xCam = this.oCamera.x;
        var yCam = this.oCamera.y;
        var xCam8 = xCam / this.nPlaneSpacing | 0;
        var yCam8 = yCam / this.nPlaneSpacing | 0;
        var i = 0;
        this.aZBuffer = [];
        this.aScanSectors = Marker.create();
        this.aWallSectors = {};
        if (this.oBackground) {
            this.fCameraBGOfs = (PI + this.oCamera.fTheta) * this.oBackground.width / PI
        }
        Marker.markXY(this.aScanSectors, xCam8, yCam8);
        var oContinueRay = this.oContinueRay;
        var xScrSize = this.xScrSize;
        var aScanSectors = this.aScanSectors;
        for (i = 0; i < xScrSize; ++i) {
            oContinueRay.bContinue = false;
            this.castRay(this, xCam, yCam, fBx, fBy, i, aScanSectors);
            fBx += dx;
            fBy += dy
        }
        var aZ = [];
        var nLast = 1;
        var nLLast = 1;
        var nLLLast = 1;
        var z = 1;
        var zb = this.aZBuffer;
        var zbl = zb.length;
        if (zbl === 0) {
            return
        }
        var b;
        var lb = zb[0];
        var llb = lb;
        var lllb = lb;
        var abs = Math.abs;
        for (i = 0; i < zbl; i++) {
            b = zb[i];
            if (b[10] == lb[10] && b[0] == lb[0] && b[1] == lb[1] && abs(b[9] - lb[9]) < 8) {
                nLast += z
            } else if (b[10] == llb[10] && b[0] == llb[0] && b[1] == llb[1] && abs(b[9] - llb[9]) < 8) {
                nLLast += z
            } else if (b[10] == lllb[10] && b[0] == lllb[0] && b[1] == lllb[1] && abs(b[9] - lllb[9]) < 8) {
                nLLLast += z
            } else {
                lllb[7] = nLLLast;
                aZ.push(lllb);
                lllb = llb;
                nLLLast = nLLast;
                llb = lb;
                nLLast = nLast;
                lb = b;
                nLast = z
            }
        }
        lllb[7] = nLLLast;
        aZ.push(lllb);
        llb[7] = nLLast;
        aZ.push(llb);
        lb[7] = nLast;
        aZ.push(lb);
        this.aZBuffer = aZ;
        this.drawHorde();
        this.aZBuffer.sort(this.zBufferCompare);
        var rctx = this.oRenderContext;
        if (this.bSky && this.oBackground) {
            var oBG = this.oBackground;
            var wBG = oBG.width;
            var hBG = oBG.height;
            var xBG = this.fCameraBGOfs % wBG | 0;
            var yBG = this.yScrSize - (hBG >> 1);
            hBG = hBG + yBG;
            rctx.drawImage(oBG, 0, 0, wBG, hBG, wBG - xBG, yBG, wBG, hBG);
            rctx.drawImage(oBG, 0, 0, wBG, hBG, -xBG, yBG, wBG, hBG)
        } else if (this.bGradient) {
            rctx.fillStyle = this.oVisual.gradients[0];
            rctx.fillRect(0, 0, this.oCanvas.width, this.oCanvas.height >> 1);
            if (!this.bFloor) {
                rctx.fillStyle = this.oVisual.gradients[1];
                rctx.fillRect(0, (this.oCanvas.height >> 1), this.oCanvas.width, this.oCanvas.height >> 1)
            }
        }
        if (this.oUpper) {
            this.drawUpper()
        }
        if (this.bFloor) {
            if (this.bCeil && this.fViewHeight != 1) {
                this.drawFloorAndCeil()
            } else {
                this.drawFloor()
            }
        }
        zbl = this.aZBuffer.length;
        for (i = 0; i < zbl; ++i) {
            this.drawImage(i)
        }
        if (this.oConfig.drawMap) {
            this.drawMap()
        }
        this.drawWeapon();
        if (this.bUseVideoBuffer) {
            this.oContext.drawImage(this.oRenderCanvas, 0, 0)
        }
    }

    drawSprite(oMobile) {
        var oSprite = oMobile.oSprite;
        if (!(oSprite.bVisible && oMobile.bVisible)) {
            return
        }
        var oTile = oSprite.oBlueprint.oTile;
        var dx = oMobile.x - this.oCamera.x;
        var dy = oMobile.y - this.oCamera.y;
        var fTarget = Math.atan2(dy, dx);
        var fAlpha = fTarget - this.oCamera.fTheta;
        if (fAlpha >= PI) {
            fAlpha = -(PI * 2 - fAlpha)
        }
        if (fAlpha < -PI) {
            fAlpha = PI * 2 + fAlpha
        }
        var w2 = this.oCanvas.width >> 1;
        var fAngle1 = oMobile.fTheta + (PI / 8) - fTarget;
        if (fAngle1 < 0) {
            fAngle1 = 2 * PI + fAngle1
        }
        oSprite.setDirection(((8 * fAngle1 / (2 * PI)) | 0) & 7);
        oSprite.animate(this.TIME_FACTOR);
        if (Math.abs(fAlpha) <= (this.fViewAngle * 1.5)) {
            var x = (Math.tan(fAlpha) * w2 + w2) | 0;
            var z = MathTools.distance(dx, dy) * Math.cos(fAlpha) * 1.333;
            var dz = (oTile.nScale * oTile.nHeight / (z / this.yScrSize) + 0.5);
            var dzy = this.yScrSize - (dz * this.fViewHeight);
            var iZoom = (oTile.nScale * oTile.nWidth / (z / this.yScrSize) + 0.5);
            var nOpacity;
            var nSFx = oSprite.oBlueprint.nFx | (oSprite.bTranslucent ? (oSprite.nAlpha << 2) : 0);
            if (nSFx & 2) {
                nOpacity = 0
            } else {
                nOpacity = z / this.nShadingFactor | 0;
                if (nOpacity > this.nShadingThreshold) {
                    nOpacity = this.nShadingThreshold
                }
            }
            var aData = [oTile.oImage, oSprite.nFrame * oTile.nWidth, oTile.nHeight * nOpacity, oTile.nWidth, oTile.nHeight, x - iZoom, dzy, iZoom << 1, dz << 1, z, nSFx];
            this.aZBuffer.push(aData);
            var oOL = oSprite.oOverlay;
            if (oOL) {
                if (Array.isArray(oSprite.nOverlayFrame)) {
                    oSprite.nOverlayFrame.forEach(function(of, iOF) {
                        this.aZBuffer.push([oOL.oImage, of * oOL.nWidth, 0, oOL.nWidth, oOL.nHeight, aData[5], aData[6], aData[7], aData[8], aData[9] - 1 - (iOF / 100), 2])
                    }, this)
                } else if (oSprite.nOverlayFrame !== null) {
                    this.aZBuffer.push([oOL.oImage, oSprite.nOverlayFrame * oOL.nWidth, 0, oOL.nWidth, oOL.nHeight, aData[5], aData[6], aData[7], aData[8], aData[9] - 1, 2])
                }
            }
        }
    }

    drawHorde() {
        var x = '',
            y = '',
            aMobiles, oMobile, nMobileCount, i;
        for (x in this.aScanSectors) {
            for (y in this.aScanSectors[x]) {
                aMobiles = this.oMobileSectors.get(x, y);
                nMobileCount = aMobiles.length;
                for (i = 0; i < nMobileCount; i++) {
                    oMobile = aMobiles[i];
                    if (oMobile.bActive && oMobile.oSprite) {
                        this.drawSprite(oMobile)
                    }
                }
            }
        }
    }

    drawExteriorLine(x, z) {
        var dz, sx, sy, sw, sh, dx, dy, dw, dh, a = null;
        if (z === 0) {
            z = 0.1
        }
        dz = (this.yTexture / (z / this.yScrSize));
        var dzfv = (dz * this.fViewHeight);
        var dzy = this.yScrSize - dzfv;
        var oBG = this.oBackground;
        var wBG = oBG.width,
            hBG = oBG.height;
        sx = (x + this.fCameraBGOfs) % wBG | 0;
        sy = Math.max(0, (hBG >> 1) - dzfv);
        sw = 1;
        sh = Math.min(hBG, dz << 1);
        dx = x;
        dy = Math.max(dzy, this.yScrSize - (hBG >> 1));
        dw = sw;
        dh = Math.min(sh, dz << 1);
        a = [oBG, sx, sy, sw, sh, dx, dy, dw, dh, z, 0];
        this.aZBuffer.push(a)
    }

    drawFloor_zoom1() {
        var bCeil = this.bCeil;
        var oFloor = this.oFloor;
        var x, y, w = this.xScrSize,
            h = this.yScrSize;
        if (oFloor.imageData === null) {
            var oFlat = O876.CanvasFactory.getCanvas();
            oFlat.width = oFloor.image.width;
            oFlat.height = oFloor.image.height;
            var oCtx = oFlat.getContext('2d');
            oCtx.drawImage(oFloor.image, 0, 0);
            oFloor.image = oFlat;
            oFloor.imageData = oCtx.getImageData(0, 0, oFlat.width, oFlat.height);
            oFloor.imageData32 = new Uint32Array(oFloor.imageData.data.buffer);
            oFloor.renderSurface = this.oRenderContext.getImageData(0, 0, w, h << 1);
            oFloor.renderSurface32 = new Uint32Array(oFloor.renderSurface.data.buffer)
        }
        if (this.bFlatSky) {
            oFloor.renderSurface = this.oRenderContext.getImageData(0, 0, w, h << 1);
            oFloor.renderSurface32 = new Uint32Array(oFloor.renderSurface.data.buffer)
        }
        var aFloorSurf = oFloor.imageData32;
        var aRenderSurf = oFloor.renderSurface32;
        var wx1 = Math.cos(this.oCamera.fTheta - this.fViewAngle);
        var wy1 = Math.sin(this.oCamera.fTheta - this.fViewAngle);
        var wx2 = Math.cos(this.oCamera.fTheta + this.fViewAngle);
        var wy2 = Math.sin(this.oCamera.fTheta + this.fViewAngle);
        var fh = (this.yTexture >> 1) - ((this.fViewHeight - 1) * this.yTexture >> 1);
        var xDelta = (wx2 - wx1) / this.xScrSize;
        var yDelta = (wy2 - wy1) / this.xScrSize;
        var xDeltaFront;
        var yDeltaFront;
        var ff = this.yScrSize << 1;
        var fx, fy;
        var dFront;
        var ofsDst;
        var wy;
        var ofsDstCeil;
        var wyCeil;
        var xCam = this.oCamera.x;
        var yCam = this.oCamera.y;
        var nFloorWidth = oFloor.image.width;
        var ofsSrc;
        var xOfs = 0;
        var yOfs = 0;
        var ps = this.nPlaneSpacing;
        var nBlock;
        var xyMax = this.nMapSize * ps;
        var st = this.nShadingThreshold;
        var sf = this.nShadingFactor;
        var aMap = this.aMap;
        var F = this.oFloor.codes;
        var aFBlock;
        var fy64, fx64;
        var oXMap = this.oXMap;
        var oXBlock, oXBlockImage;
        var oXBlockCeil;
        var nXDrawn = 0;
        var fBx, fBy;
        for (y = 1; y < h; ++y) {
            fBx = wx1;
            fBy = wy1;
            dFront = fh * ff / y;
            fy = wy1 * dFront + yCam;
            fx = wx1 * dFront + xCam;
            xDeltaFront = xDelta * dFront;
            yDeltaFront = yDelta * dFront;
            wy = w * (h + y);
            wyCeil = w * (h - y - 1);
            yOfs = Math.min(st, dFront / sf | 0);
            for (x = 0; x < w; ++x) {
                ofsDst = wy + x;
                ofsDstCeil = wyCeil + x;
                fy64 = fy / ps | 0;
                fx64 = fx / ps | 0;
                if (fx >= 0 && fy >= 0 && fx < xyMax && fy < xyMax) {
                    nXDrawn = 0;
                    oXBlock = oXMap.get(fx64, fy64, 4);
                    oXBlockCeil = oXMap.get(fx64, fy64, 5);
                    if (oXBlock.imageData32) {
                        oXBlockImage = oXBlock.imageData32;
                        ofsSrc = (((fy % ps) + yOfs * ps | 0) * ps + (((fx % ps) | 0)));
                        aRenderSurf[ofsDst] = oXBlockImage[ofsSrc];
                        nXDrawn += 1
                    }
                    if (oXBlockCeil.imageData32) {
                        oXBlockImage = oXBlockCeil.imageData32;
                        if (nXDrawn === 0) {
                            ofsSrc = (((fy % ps) + yOfs * ps | 0) * ps + (((fx % ps) | 0)))
                        }
                        aRenderSurf[ofsDstCeil] = oXBlockImage[ofsSrc];
                        nXDrawn += 2
                    }
                    if (nXDrawn != 3) {
                        nBlock = aMap[fy / ps | 0][fx / ps | 0] & 0xFF;
                        aFBlock = F[nBlock];
                        if (aFBlock !== null) {
                            if (nXDrawn != 1) {
                                xOfs = aFBlock[0];
                                ofsSrc = (((fy % ps) + yOfs * ps | 0) * nFloorWidth + (((fx % ps) + xOfs * ps | 0)));
                                aRenderSurf[ofsDst] = aFloorSurf[ofsSrc]
                            }
                            if (bCeil && nXDrawn != 2) {
                                xOfs = aFBlock[1];
                                if (xOfs >= 0) {
                                    ofsSrc = (((fy % ps) + yOfs * ps | 0) * nFloorWidth + (((fx % ps) + xOfs * ps | 0)));
                                    aRenderSurf[ofsDstCeil] = aFloorSurf[ofsSrc]
                                }
                            }
                        }
                    }
                }
                fy += yDeltaFront;
                fx += xDeltaFront
            }
        }
        this.oRenderContext.putImageData(oFloor.renderSurface, 0, 0)
    }

    drawFloorAndCeil_zoom1() {
        var oFloor = this.oFloor;
        var x, y, w = this.xScrSize,
            h = this.yScrSize;
        if (oFloor.imageData === null) {
            var oFlat = O876.CanvasFactory.getCanvas();
            oFlat.width = oFloor.image.width;
            oFlat.height = oFloor.image.height;
            var oCtx = oFlat.getContext('2d');
            oCtx.drawImage(oFloor.image, 0, 0);
            oFloor.image = oFlat;
            oFloor.imageData = oCtx.getImageData(0, 0, oFlat.width, oFlat.height);
            oFloor.imageData32 = new Uint32Array(oFloor.imageData.data.buffer);
            oFloor.renderSurface = this.oRenderContext.getImageData(0, 0, w, h << 1);
            oFloor.renderSurface32 = new Uint32Array(oFloor.renderSurface.data.buffer)
        }
        if (this.bFlatSky) {
            oFloor.renderSurface = this.oRenderContext.getImageData(0, 0, w, h << 1);
            oFloor.renderSurface32 = new Uint32Array(oFloor.renderSurface.data.buffer)
        }
        var aFloorSurf = oFloor.imageData32;
        var aRenderSurf = oFloor.renderSurface32;
        var wx1 = Math.cos(this.oCamera.fTheta - this.fViewAngle);
        var wy1 = Math.sin(this.oCamera.fTheta - this.fViewAngle);
        var wx2 = Math.cos(this.oCamera.fTheta + this.fViewAngle);
        var wy2 = Math.sin(this.oCamera.fTheta + this.fViewAngle);
        var fh = (this.yTexture >> 1) - ((this.fViewHeight - 1) * this.yTexture >> 1);
        var xDelta = (wx2 - wx1) / this.xScrSize;
        var yDelta = (wy2 - wy1) / this.xScrSize;
        var xDeltaFront;
        var yDeltaFront;
        var ff = this.yScrSize << 1;
        var fx, fy;
        var dFront;
        var ofsDst;
        var wy;
        var fhCeil = (this.yTexture >> 1) + ((this.fViewHeight - 1) * this.yTexture >> 1);
        var xDeltaFrontCeil = 0;
        var yDeltaFrontCeil = 0;
        var fxCeil = 0,
            fyCeil = 0;
        var dFrontCeil;
        var ofsDstCeil;
        var wyCeil = 0;
        var xCam = this.oCamera.x;
        var yCam = this.oCamera.y;
        var nFloorWidth = oFloor.image.width;
        var ofsSrc;
        var xOfs = 0;
        var yOfs = 0;
        var ps = this.nPlaneSpacing;
        var nBlock;
        var xyMax = this.nMapSize * ps;
        var st = this.nShadingThreshold;
        var sf = this.nShadingFactor;
        var aMap = this.aMap;
        var F = this.oFloor.codes;
        var aFBlock;
        var bCeil = this.bCeil;
        var fy64, fx64;
        var oXMap = this.oXMap;
        var oXBlock, oXBlockCeil, oXBlockImage;
        var nXDrawn;
        var fBx, fBy, yOfsCeil;
        for (y = 1; y < h; ++y) {
            fBx = wx1;
            fBy = wy1;
            dFront = fh * ff / y;
            fy = wy1 * dFront + yCam;
            fx = wx1 * dFront + xCam;
            xDeltaFront = xDelta * dFront;
            yDeltaFront = yDelta * dFront;
            wy = w * (h + y);
            yOfs = Math.min(st, dFront / sf | 0);
            if (bCeil) {
                dFrontCeil = fhCeil * ff / y;
                fyCeil = wy1 * dFrontCeil + yCam;
                fxCeil = wx1 * dFrontCeil + xCam;
                xDeltaFrontCeil = xDelta * dFrontCeil;
                yDeltaFrontCeil = yDelta * dFrontCeil;
                wyCeil = w * (h - y);
                yOfsCeil = Math.min(st, dFrontCeil / sf | 0)
            }
            for (x = 0; x < w; ++x) {
                ofsDst = wy + x;
                ofsDstCeil = wyCeil + x;
                fy64 = fy / ps | 0;
                fx64 = fx / ps | 0;
                if (fx >= 0 && fy >= 0 && fx < xyMax && fy < xyMax) {
                    oXBlock = oXMap.get(fx64, fy64, 4);
                    if (oXBlock.imageData32) {
                        oXBlockImage = oXBlock.imageData32;
                        ofsSrc = (((fy % ps) + yOfs * ps | 0) * ps + (((fx % ps) | 0)));
                        aRenderSurf[ofsDst] = oXBlockImage[ofsSrc]
                    } else {
                        nBlock = aMap[fy64][fx64] & 0xFF;
                        aFBlock = F[nBlock];
                        if (aFBlock !== null) {
                            xOfs = aFBlock[0];
                            if (xOfs >= 0) {
                                ofsSrc = (((fy % ps) + yOfs * ps | 0) * nFloorWidth + (((fx % ps) + xOfs * ps | 0)));
                                aRenderSurf[ofsDst] = aFloorSurf[ofsSrc]
                            }
                        }
                    }
                }
                if (bCeil && fxCeil >= 0 && fyCeil >= 0 && fxCeil < xyMax && fyCeil < xyMax) {
                    fy64 = fyCeil / ps | 0;
                    fx64 = fxCeil / ps | 0;
                    oXBlockCeil = oXMap.get(fx64, fy64, 5);
                    if (oXBlockCeil.imageData32) {
                        oXBlockImage = oXBlockCeil.imageData32;
                        ofsSrc = (((fyCeil % ps) + yOfs * ps | 0) * ps + (((fxCeil % ps) | 0)));
                        aRenderSurf[ofsDstCeil] = oXBlockImage[ofsSrc]
                    } else {
                        nBlock = aMap[fy64][fx64] & 0xFF;
                        aFBlock = F[nBlock];
                        if (aFBlock !== null) {
                            xOfs = aFBlock[1];
                            if (xOfs >= 0) {
                                ofsSrc = (((fyCeil % ps) + yOfs * ps | 0) * nFloorWidth + (((fxCeil % ps) + xOfs * ps | 0)));
                                aRenderSurf[ofsDstCeil] = aFloorSurf[ofsSrc]
                            }
                        }
                    }
                }
                if (bCeil) {
                    fyCeil += yDeltaFrontCeil;
                    fxCeil += xDeltaFrontCeil
                }
                fy += yDeltaFront;
                fx += xDeltaFront
            }
        }
        this.oRenderContext.putImageData(oFloor.renderSurface, 0, 0)
    }

    drawLine(x, z, nTextureBase, nPos, bDim, oWalls, nPanel) {
        if (z === 0) {
            z = 0.1
        }
        var ytex = this.yTexture;
        var xtex = this.xTexture;
        var yscr = this.yScrSize;
        var dz = ytex * yscr / z;
        var fvh = this.fViewHeight;
        dz = dz + 0.5 | 0;
        var dzy = yscr - (dz * fvh);
        var nPhys = (nPanel >> 8) & 0x7F;
        var nOffset = (nPanel >> 16) & 0xFF;
        var nOpacity = z / this.nShadingFactor | 0;
        if (bDim) {
            nOpacity += this.nDimmedWall
        }
        if (nOpacity > this.nShadingThreshold) {
            nOpacity = this.nShadingThreshold
        }
        var aData = [oWalls, nTextureBase + nPos, ytex * nOpacity, 1, ytex, x, dzy - 1, 1, (2 + dz * 2), z, bDim ? RC.FX_DIM0 : 0];
        switch (nPhys) {
            case this.PHYS_DOOR_SLIDING_UP:
                aData[2] += nOffset;
                if (nOffset > 0) {
                    aData[4] = ytex - nOffset;
                    aData[8] = ((aData[4] / (z / yscr) + 0.5)) << 1
                }
                break;
            case this.PHYS_CURT_SLIDING_UP:
                if (nOffset > 0) {
                    aData[8] = (((ytex - nOffset) / (z / yscr) + 0.5)) << 1
                }
                break;
            case this.PHYS_CURT_SLIDING_DOWN:
                aData[2] += nOffset;
            case this.PHYS_DOOR_SLIDING_DOWN:
                if (nOffset > 0) {
                    aData[4] = ytex - nOffset;
                    aData[8] = ((aData[4] / (z / yscr) + 0.5));
                    aData[6] += (dz - aData[8]) << 1;
                    aData[8] <<= 1
                }
                break;
            case this.PHYS_DOOR_SLIDING_LEFT:
                if (nOffset > 0) {
                    if (nPos > (xtex - nOffset)) {
                        aData[0] = null
                    } else {
                        aData[1] = (nPos + nOffset) % xtex + nTextureBase
                    }
                }
                break;
            case this.PHYS_DOOR_SLIDING_RIGHT:
                if (nOffset > 0) {
                    if (nPos < nOffset) {
                        aData[0] = null
                    } else {
                        aData[1] = (nPos + xtex - nOffset) % xtex + nTextureBase
                    }
                }
                break;
            case this.PHYS_DOOR_SLIDING_DOUBLE:
                if (nOffset > 0) {
                    if (nPos < (xtex >> 1)) {
                        if ((nPos) > ((xtex >> 1) - nOffset)) {
                            aData[0] = null
                        } else {
                            aData[1] = (nPos + nOffset) % xtex + nTextureBase
                        }
                    } else {
                        if ((nPos) < ((xtex >> 1) + nOffset)) {
                            aData[0] = null
                        } else {
                            aData[1] = (nPos + xtex - nOffset) % xtex + nTextureBase
                        }
                    }
                }
                break;
            case this.PHYS_INVISIBLE_BLOCK:
                aData[0] = null;
                break
        }
        if (aData[0]) {
            this.aZBuffer.push(aData)
        }
    }

    drawImage(i) {
        var rc = this.oRenderContext;
        var aLine = this.aZBuffer[i];
        var sGCO = '';
        var fGobalAlphaSave = 0;
        var nFx = aLine[10];
        if (nFx & 1) {
            sGCO = rc.globalCompositeOperation;
            rc.globalCompositeOperation = 'lighter'
        }
        if (nFx & 12) {
            fGobalAlphaSave = rc.globalAlpha;
            rc.globalAlpha = RC.FX_ALPHA[nFx >> 2]
        }
        var xStart = aLine[1];
        if (xStart >= 0) {
            rc.drawImage(aLine[0], aLine[1] | 0, aLine[2] | 0, aLine[3] | 0, aLine[4] | 0, aLine[5] | 0, aLine[6] | 0, aLine[7] | 0, aLine[8] | 0)
        }
        if (sGCO !== '') {
            rc.globalCompositeOperation = sGCO
        }
        if (nFx & 12) {
            rc.globalAlpha = fGobalAlphaSave
        }
    }

    drawSquare(x, y, nWidth, nHeight, sColor) {
        this.oRenderContext.fillStyle = sColor;
        this.oRenderContext.fillRect(x, y, nWidth, nHeight)
    }

    drawMap() {
        if (this.oMinimap) {
            this.oMinimap.render()
        } else {
            this.oMinimap = new O876_Raycaster.Minimap();
            this.oMinimap.reset(this)
        }
    }

    clip(x, y, n) {
        if (n === undefined) {
            n = 0
        }
        var ps = this.nPlaneSpacing;
        var xm = x / ps | 0;
        var ym = y / ps | 0;
        switch (n) {
            case 0:
                return this.getMapXYTexture(xm, ym);
            case 1:
                return this.getMapXYPhysical(xm, ym);
            case 2:
                return this.getMapXYOffset(xm, ym);
            case 3:
                return this.getMapXYTag(xm, ym);
            default:
                return this.aMap[ym][xm]
        }
    }

    textureAnimation() {
        var aCode, w = this.oWall,
            wc = w.codes,
            wa = w.animated;
        for (var iAnim in wa) {
            aCode = wc[iAnim];
            aCode.push(aCode.shift());
            aCode.push(aCode.shift())
        }
    }

    buildAnimatedTextures() {
        var w = this.oWall;
        if (!('animated' in w)) {
            w.animated = {}
        }
        var wc = w.codes,
            wa = w.animated;
        for (var nCode = 0; nCode < wc.length; ++nCode) {
            if (wc[nCode] && wc[nCode].length > 3) {
                wa[nCode] = {
                    nIndex: 0,
                    nCount: wc[nCode].length >> 1
                }
            }
        }
    }
});
Object.assign(O876_Raycaster.Raycaster.prototype, {
    PHYS_NONE: 0x00,
    PHYS_WALL: 0x01,
    PHYS_FIRST_DOOR: 0x02,
    PHYS_DOOR_SLIDING_UP: 0x02,
    PHYS_CURT_SLIDING_UP: 0x03,
    PHYS_DOOR_SLIDING_DOWN: 0x04,
    PHYS_CURT_SLIDING_DOWN: 0x05,
    PHYS_DOOR_SLIDING_LEFT: 0x06,
    PHYS_DOOR_SLIDING_RIGHT: 0x07,
    PHYS_DOOR_SLIDING_DOUBLE: 0x08,
    PHYS_LAST_DOOR: 0x08,
    PHYS_SECRET_BLOCK: 0x09,
    PHYS_TRANSPARENT_BLOCK: 0x0A,
    PHYS_INVISIBLE_BLOCK: 0x0B,
    PHYS_OFFSET_BLOCK: 0x0C,
    PHYS_DOOR_D: 0x0D,
    PHYS_DOOR_E: 0x0E,
    PHYS_DOOR_F: 0x0F,
    TIME_FACTOR: 50,
    oWall: null,
    oFloor: null,
    oBackground: null,
    nMapSize: 0,
    aMap: null,
    oVisual: null,
    nPlaneSpacing: 64,
    nShadingFactor: 50,
    nShadingThreshold: 15,
    nDimmedWall: 7,
    oDoors: null,
    oXMap: null,
    oMinimap: null,
    xTexture: 64,
    yTexture: 96,
    oCanvas: null,
    oContext: null,
    oRenderCanvas: null,
    oRenderContext: null,
    bUseVideoBuffer: true,
    bGradient: true,
    bFloor: true,
    bCeil: true,
    bSky: false,
    bFlatSky: false,
    nZoom: 1,
    wCanvas: 0,
    hCanvas: 0,
    xScrSize: 0,
    yScrSize: 0,
    fViewAngle: 0,
    fViewHeight: 1,
    nRayLimit: 100,
    bExterior: false,
    nMeteo: 0,
    fCameraBGOfs: 0,
    fDist: 1,
    bSideWall: false,
    nWallPanel: 1,
    nWallPos: 1,
    xWall: 0,
    yWall: 0,
    aZBuffer: null,
    oContinueRay: null,
    oHorde: null,
    aScanSectors: null,
    aWallSectors: null,
    oMobileSectors: null,
    oThinkerManager: null,
    oWeaponLayer: null,
    oImages: null,
    oEffects: null,
    aWorld: null,
    oConfig: null,
    oUpper: null,
    drawFloor: null,
    drawFloorAndCeil: null
});
