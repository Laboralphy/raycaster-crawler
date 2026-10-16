import { Renderer } from '@laboralphy/raycaster386';
import { CanvasFactory } from '../O876/CanvasFactory.js';
import { GfxTools } from '../O876/GfxTools.js';
import { Marker } from '../O876/Marker.js';
import { GXManager } from './GXManager.js';
import { Horde } from './Horde.js';
import { ImageLoader } from './ImageLoader.js';
import { Minimap } from './Minimap.js';
import { Mobile } from './Mobile.js';
import { MobileRegister } from './MobileRegister.js';
import { ThinkerManager } from './ThinkerManager.js';
import { PI } from './Tools/MathTools.js';

// Garde le rapport de hauteur sprites / murs de l'ancien moteur.
// Ancien moteur : murs à la distance des rayons non normalisés (vecteurs
// interpolés entre ±45°, soit perpendiculaire × 1.414), sprites à la
// distance perpendiculaire × 1.333 : sprite / mur = 1.414 / 1.333 = 1.061.
// raycaster-386 projette murs et sprites à la même échelle (pixels carrés) :
// sprite / mur = 1 à l'échelle 1, quel que soit le champ de vision.
// Avec 1 / 1.061, centrés sur l'horizon, les pieds touchent le sol.
const SPRITE_SCALE = 0.943;

/**
 * Monde du jeu (carte, mobiles, caméra, effets) et façade du rendu.
 *
 * Le dessin est délégué à un Renderer de raycaster-386. La carte reste dans
 * `aMap` au format de l'ancien moteur (texture 0-7, phys 8-15, offset 16-23,
 * tag 24-31) : le jeu la lit et l'écrit directement ; elle est recopiée dans
 * le Renderer avant chaque image (seules les cases modifiées).
 */
export class Raycaster {
    setConfig(oConfig) {
        if (this.oConfig === null) {
            this.oConfig = oConfig
        } else {
            for (const i in oConfig) {
                this.oConfig[i] = oConfig[i]
            }
        }
    }

    defineWorld(aWorld) {
        this.aWorld = aWorld
    }

    initialize() {
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
        this.oEffects = new GXManager();
        if (this.oImages === null) {
            this.oImages = new ImageLoader()
        }
        this.oThinkerManager = new ThinkerManager();
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
    }

    finalize() {
        this.oEffects.clear();
        this.oEffects = null;
        this.oImages.finalize();
        this.oImages = null;
        this.oThinkerManager = null;
        this.oRenderer = null
    }

    /**
     * Prépare le rendu une fois les images chargées (textures, matériaux,
     * fond, peintures murales en attente). Renvoie true quand c'est fait ;
     * l'ancien moteur y précalculait l'ombrage, en plusieurs appels.
     */
    shadeProcess() {
        if (this.bRendererReady) {
            return true
        }
        const r = this.oRenderer;
        const v = this.oVisual;
        r.setShading({
            shades: this.nShadingThreshold + 1,
            color: GfxTools.buildRGBA(v.fogColor),
            // le filtre de couleur de l'ancien moteur ne s'appliquait qu'aux
            // sprites : il est appliqué à leurs images (getTileSet)
            filter: null,
            brightness: v.diffuse || 0
        });
        this.oWall.image = this.toCanvas(this.oWall.image);
        r.setWallTextures(this.oWall.image);
        if (this.bFloor) {
            r.setFlatTextures(this.oFloor.image)
        }
        for (let nCode = 0; nCode < this.oWall.codes.length; ++nCode) {
            this.registerMaterial(nCode)
        }
        if (this.oBackground) {
            const oSky = this.toCanvas(this.oBackground);
            r.setBackground(oSky);
            // largeur une fois l'image mise à la hauteur de l'écran
            this.nBackgroundWidth = oSky.width * this.oCanvas.height / oSky.height
        }
        // les tilesets créés avant le premier rendu sont ombrés par celui-ci
        for (const sTile in this.oHorde.oTiles) {
            this.getTileSet(this.oHorde.oTiles[sTile])
        }
        this.bRendererReady = true;
        const aPaints = this.aPendingPaints;
        this.aPendingPaints = [];
        aPaints.forEach((p) => this.paintSurface(...p));
        return true
    }

    frameProcess() {
        this.updateHorde();
        this.oEffects.process()
    }

    frameRender() {
        this.drawScreen();
        this.oEffects.render()
    }

    addGXEffect(G) {
        const g = new G(this);
        this.oEffects.addEffect(g);
        return g
    }

    drawWeapon() {
        const w = this.oWeaponLayer;
        if (w.index >= 0 && w.canvas) {
            let fAlpha = 1;
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
        this.oContext = this.oCanvas.getContext('2d');
        // le Renderer a son propre tampon : l'image y est copiée, puis l'arme
        // et les effets sont dessinés directement sur le canvas
        this.oRenderCanvas = this.oCanvas;
        this.oRenderContext = this.oContext
    }

    loadImage(sUrl) {
        return this.oImages.load(sUrl)
    }

    /** Copie une image (chargée ou canvas) dans un nouveau canvas. */
    toCanvas(oImage) {
        const c = CanvasFactory.getCanvas();
        c.width = oImage.width;
        c.height = oImage.height;
        c.getContext('2d').drawImage(oImage, 0, 0);
        return c
    }

    filterImage(oImage, f) {
        if (f) {
            const oCtx = oImage.getContext('2d');
            const oImgData = oCtx.getImageData(0, 0, oImage.width, oImage.height);
            const aPixData = oImgData.data;
            const nPixCount = aPixData.length;
            const fr = f.r,
                fg = f.g,
                fb = f.b;
            for (let iPix = 0; iPix < nPixCount; iPix += 4) {
                aPixData[iPix] = Math.min(255, Math.max(0, aPixData[iPix] * fr | 0));
                aPixData[iPix + 1] = Math.min(255, Math.max(0, aPixData[iPix + 1] * fg | 0));
                aPixData[iPix + 2] = Math.min(255, Math.max(0, aPixData[iPix + 2] * fb | 0))
            }
            oCtx.putImageData(oImgData, 0, 0)
        }
    }

    /**
     * Matériau 386 d'un code de texture : codes[n][0] pour les faces nord et
     * sud, codes[n][1] pour les faces est et ouest ; sol et plafond d'après
     * flats.codes (-1 : rien, le fond se voit).
     */
    registerMaterial(nCode) {
        const aWall = this.oWall.codes[nCode];
        if (!aWall) {
            return
        }
        const aFlat = this.bFloor ? this.oFloor.codes[nCode] : null;
        this.oRenderer.registerCellMaterial(nCode, {
            n: aWall[0],
            s: aWall[0],
            e: aWall[1],
            w: aWall[1],
            f: aFlat && aFlat[0] >= 0 ? aFlat[0] : null,
            c: aFlat && this.bCeil && aFlat[1] >= 0 ? aFlat[1] : null
        })
    }

    /** À appeler quand l'image des murs (oWall.image) a été modifiée. */
    updateWallTextures() {
        if (this.bRendererReady) {
            this.oRenderer.setWallTextures(this.oWall.image)
        }
    }

    /**
     * Dessine sur une face d'un bloc : pDrawingFunction(raycaster, canvas, x,
     * y, nSide) reçoit une copie de la texture de cette face (nSide : 0 ouest,
     * 1 sud, 2 est, 3 nord, 4 sol, 5 plafond).
     */
    paintSurface(x, y, nSide, pDrawingFunction) {
        if (!this.bRendererReady) {
            this.aPendingPaints.push([x, y, nSide, pDrawingFunction]);
            return
        }
        this.oRenderer.paintSurface(x, y, nSide, (xBlock, yBlock, nFace, oCanvas) => {
            pDrawingFunction(this, oCanvas, xBlock, yBlock, nFace)
        })
    }

    cloneWall(x, y, nSide, pDrawingFunction) {
        this.paintSurface(x, y, nSide, pDrawingFunction)
    }

    cloneFlat(x, y, nSide, pDrawingFunction) {
        this.paintSurface(x, y, nSide + 4, pDrawingFunction)
    }

    buildMap() {
        const oData = this.aWorld;
        this.nMapSize = oData.map.length;
        this.oMobileSectors = new MobileRegister(this.nMapSize);
        this.oDoors = Marker.create();
        this.aMap = [];
        let yMap, xMap;
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
            const bEmptyCeil = oData.flats.codes.every(function(item, index, array) {
                if (item) {
                    return item[1] === -1
                } else {
                    return true
                }
            });
            const bEmptyFloor = oData.flats.codes.every(function(item, index, array) {
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
                    codes: oData.flats.codes
                }
            }
        } else {
            this.bFloor = false;
            this.bCeil = false
        }
        if ('background' in oData && oData.background) {
            this.oBackground = this.loadImage(oData.background)
        } else {
            this.oBackground = null
        }
        this.buildAnimatedTextures();
        this.oCamera = new Mobile();
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
        this.buildRenderer();
        this.buildGradient()
    }

    buildRenderer() {
        const r = new Renderer();
        r.setScreen({
            width: this.oCanvas.width,
            height: this.oCanvas.height,
            fov: (this.oConfig.fov || this.nFieldOfView) * Math.PI / 180
        });
        r.setMetrics({
            spacing: this.nPlaneSpacing,
            height: this.yTexture
        });
        r.setTextureSmoothing(!!this.oConfig.smoothTextures);
        r.setMapSize(this.nMapSize);
        // second étage (fixe) : partage les matériaux et textures du rez-de-chaussée
        const aUpper = this.aWorld.uppermap;
        if (aUpper) {
            const oStorey = r.createStorey();
            aUpper.forEach((aRow, y) => aRow.forEach((nCode, x) => {
                oStorey.setCellMaterial(x, y, nCode & 0xFF);
                oStorey.setCellPhys(x, y, (nCode >> 8) & 0xFF);
                oStorey.setCellOffset(x, y, (nCode >> 16) & 0xFF)
            }))
        }
        this.oRenderer = r;
        this.bRendererReady = false;
        this.bRendered = false;
        this.aPendingPaints = [];
        this.aRenderedMap = null;
        this.oTileSets = new Map();
        this.aSpritePool = [];
        this.nSpriteCount = 0
    }

    buildHorde() {
        this.oHorde = new Horde(this);
        this.oHorde.oThinkerManager = this.oThinkerManager;
        const aData = this.aWorld;
        const oTiles = aData.tiles;
        const oBlueprints = aData.blueprints;
        const oMobs = aData.objects;
        this.oHorde.linkMobile(this.oCamera);
        let i = '';
        for (i in oTiles) {
            this.oHorde.defineTile(i, oTiles[i])
        }
        for (i in oBlueprints) {
            this.oHorde.defineBlueprint(i, oBlueprints[i])
        }
        for (i = 0; i < oMobs.length; i++) {
            const oMobile = this.oHorde.defineMobile(oMobs[i]);
            // lumière fixe des objets qui en émettent une (torches)
            const oLight = oBlueprints[oMobs[i].blueprint].lightsource;
            if (oLight) {
                this.oRenderer.addLightSource(oMobile.x, oMobile.y, oLight.r0, oLight.r1, oLight.v)
            }
        }
    }

    /**
     * Applique oVisual : facteur d'ombrage, et dégradés du plafond et du sol
     * (visibles là où il n'y a ni texture de sol/plafond ni image de fond).
     */
    buildGradient() {
        this.nShadingFactor = this.oVisual.light;
        this.oRenderer.shadingFactor = this.nShadingFactor;
        if (this.oBackground) {
            return
        }
        const w = this.oCanvas.width;
        const h = this.oCanvas.height;
        const c = CanvasFactory.getCanvas();
        c.width = w;
        c.height = h;
        const ctx = c.getContext('2d');
        let g;
        g = ctx.createLinearGradient(0, 0, 0, h >> 1);
        g.addColorStop(0, GfxTools.buildRGBA(this.oVisual.ceilColor));
        if (this.oVisual.fogDistance < 1) {
            g.addColorStop(this.oVisual.fogDistance, GfxTools.buildRGBA(this.oVisual.fogColor))
        }
        g.addColorStop(1, GfxTools.buildRGBA(this.oVisual.fogColor));
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h >> 1);
        g = ctx.createLinearGradient(0, h - 1, 0, (h >> 1) + 1);
        g.addColorStop(0, GfxTools.buildRGBA(this.oVisual.floorColor));
        if (this.oVisual.fogDistance < 1) {
            g.addColorStop(this.oVisual.fogDistance, GfxTools.buildRGBA(this.oVisual.fogColor))
        }
        g.addColorStop(1, GfxTools.buildRGBA(this.oVisual.fogColor));
        ctx.fillStyle = g;
        ctx.fillRect(0, h >> 1, w, h >> 1);
        this.oRenderer.setBackground(c)
    }

    insideMap(x) {
        return x >= 0 && x < this.nMapSize
    }

    // Lancer de rayon sur la carte, sans dessin : sert à la ligne de vue des
    // monstres (castRay, fastCastRay).
    projectRay(oData, x, y, dx, dy, aExcludes, aVisibles) {
        let side = 0;
        const map = this.aMap;
        const nMapSize = this.nMapSize;
        const nScale = this.nPlaneSpacing;
        let xi, yi, xt, dxt, yt, dyt, t, dxi, dyi, xoff, yoff;
        const cmax = oData.nRayLimit;
        const oContinue = oData.oContinueRay;
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
        const xScale = nScale * dx;
        const yScale = nScale * dy;
        t = 0;
        let done = 0;
        let c = 0;
        let bStillVisible = true;
        let nOfs, nTOfs = 0;
        let nText;
        const Marker_getMarkXY = Marker.getMarkXY;
        const Marker_markXY = Marker.markXY;
        let nPhys;
        const nPHYS_FIRST_DOOR = this.PHYS_FIRST_DOOR;
        const nPHYS_LAST_DOOR = this.PHYS_LAST_DOOR;
        const nPHYS_SECRET_BLOCK = this.PHYS_SECRET_BLOCK;
        const nPHYS_OFFSET_BLOCK = this.PHYS_OFFSET_BLOCK;
        const nPHYS_TRANSPARENT_BLOCK = this.PHYS_TRANSPARENT_BLOCK;
        let xint = 0,
            yint = 0;
        const sameOffsetWall = this.sameOffsetWall;
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
        const aExcludes = Marker.create();
        let nMaxIterations = 6;
        if (!aVisibles) {
            aVisibles = Marker.create()
        }
        do {
            this.projectRay(oData, x, y, dx, dy, aExcludes, aVisibles);
            if (!oData.bExterior && oData.fDist >= 0 && oData.oContinueRay.bContinue) {
                Marker.markXY(aExcludes, oData.xWall, oData.yWall)
            }
            nMaxIterations--
        } while (oData.oContinueRay.bContinue && nMaxIterations > 0);
        return aVisibles
    }

    fastCastRay(x, y, a) {
        const aExcludes = Marker.create();
        let nMaxIterations = 6;
        const aVisibles = {};
        const dx = Math.cos(a);
        const dy = Math.sin(a);
        const oData = {
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
        let ym2, xm2;
        ym2 = y0 / ps | 0;
        xm2 = x0 / ps | 0;
        return xm2 == xm && ym2 == ym
    }

    isDoor(xw, yw) {
        const nPhys = this.getMapXYPhysical(xw, yw);
        return (nPhys >= this.PHYS_FIRST_DOOR && nPhys <= this.PHYS_LAST_DOOR)
    }

    isWallTransparent(xWall, yWall) {
        const nPhys = this.getMapXYPhysical(xWall, yWall);
        if (nPhys === 0) {
            return false
        }
        const nOffset = this.getMapXYOffset(xWall, yWall);
        if ((nPhys >= this.PHYS_FIRST_DOOR && nPhys <= this.PHYS_LAST_DOOR && nOffset !== 0) || nPhys == this.PHYS_TRANSPARENT_BLOCK || nPhys == this.PHYS_INVISIBLE_BLOCK) {
            return true
        }
        return false
    }

    getWallDepth(xw, yw) {
        const nPhys = this.getMapXYPhysical(xw, yw);
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
        this.aMap[y][x] = (this.aMap[y][x] & 0x00FFFFFF) | (nTag << 24)
    }

    getMapXYTag(x, y) {
        return (this.aMap[y][x] >> 24) & 0xFF
    }

    /** Recopie dans le Renderer les cases de aMap modifiées depuis l'image précédente. */
    syncMap() {
        const r = this.oRenderer;
        const n = this.nMapSize;
        const aMap = this.aMap;
        const bFirst = this.aRenderedMap === null;
        if (bFirst) {
            this.aRenderedMap = new Uint32Array(n * n)
        }
        const aRendered = this.aRenderedMap;
        let x, y, i, nCode;
        for (y = 0; y < n; ++y) {
            const aRow = aMap[y];
            for (x = 0; x < n; ++x) {
                nCode = aRow[x];
                i = y * n + x;
                if (bFirst || aRendered[i] !== nCode) {
                    aRendered[i] = nCode;
                    r.setCellMaterial(x, y, nCode & 0xFF);
                    r.setCellPhys(x, y, (nCode >> 8) & 0xFF);
                    r.setCellOffset(x, y, (nCode >> 16) & 0xFF)
                }
            }
        }
    }

    drawScreen() {
        if (!this.bRendererReady) {
            return
        }
        this.syncMap();
        this.drawHorde();
        const c = this.oCamera;
        const r = this.oRenderer;
        if (this.oBackground) {
            // raycaster386 fait défiler l'image d'une largeur par quart de
            // tour (elle se répète 4 fois) : on la ralentit pour qu'une
            // largeur fasse un tour complet, l'image est un panorama de 360°
            r.backgroundOffset = -3 * c.fTheta * this.nBackgroundWidth / (2 * Math.PI)
        }
        r.render(c.x, c.y, c.fTheta, this.fViewHeight);
        this.bRendered = true;
        r.flip(this.oRenderContext);
        // cases atteintes par les rayons : sprites de l'image suivante, minicarte
        const aScanSectors = Marker.create();
        if (r.visibleCells) {
            r.visibleCells.iterate((x, y) => Marker.markXY(aScanSectors, x, y))
        }
        this.aScanSectors = aScanSectors;
        if (this.oConfig.drawMap) {
            this.drawMap()
        }
        this.drawWeapon()
    }

    /** Tileset 386 d'une tuile de sprite (créé à la première utilisation). */
    getTileSet(oTile) {
        let ts = this.oTileSets.get(oTile);
        if (ts === undefined) {
            const oImage = oTile.oImage;
            if (!oImage || !oImage.complete && !oImage.getContext) {
                return null
            }
            let oSource = oImage;
            if (oTile.bShading && this.oVisual.filter) {
                oSource = this.toCanvas(oImage);
                this.filterImage(oSource, this.oVisual.filter)
            }
            ts = this.oRenderer.buildTileSet(oSource, oTile.nWidth, oTile.nHeight, !oTile.bShading);
            if (this.bRendered) {
                // raycaster386 1.0.0 n'ombre que les tilesets présents lors
                // d'un changement d'ombrage : sinon le sprite resterait vide
                const sh = this.oRenderer.shading;
                ts.compute(sh.color, sh.filter, sh.brightness)
            }
            this.oTileSets.set(oTile, ts)
        }
        return ts
    }

    /** Place un sprite 386 (pris dans la réserve) pour cette image. */
    pushSprite(oTile, x, y, nFrame, nFx) {
        const ts = this.getTileSet(oTile);
        if (ts === null) {
            return
        }
        let s = this.aSpritePool[this.nSpriteCount];
        if (s === undefined) {
            s = this.oRenderer.buildSprite(ts);
            s.buildAnimation({
                starts: [0],
                length: 1,
                duration: 0
            });
            s.setCurrentAnimation('default');
            this.aSpritePool.push(s)
        }
        ++this.nSpriteCount;
        s.setTileSet(ts);
        s.x = x;
        s.y = y;
        s.flags = nFx;
        s.scale = SPRITE_SCALE / oTile.nScale;
        s.visible = true;
        s.getCurrentAnimation().base = nFrame
    }

    drawSprite(oMobile) {
        const oSprite = oMobile.oSprite;
        if (!(oSprite.bVisible && oMobile.bVisible)) {
            return
        }
        const oTile = oSprite.oBlueprint.oTile;
        const dx = oMobile.x - this.oCamera.x;
        const dy = oMobile.y - this.oCamera.y;
        const fTarget = Math.atan2(dy, dx);
        let fAngle1 = oMobile.fTheta + (PI / 8) - fTarget;
        if (fAngle1 < 0) {
            fAngle1 = 2 * PI + fAngle1
        }
        oSprite.setDirection(((8 * fAngle1 / (2 * PI)) | 0) & 7);
        oSprite.animate(this.TIME_FACTOR);
        const nSFx = oSprite.oBlueprint.nFx | (oSprite.bTranslucent ? (oSprite.nAlpha << 2) : 0);
        this.pushSprite(oTile, oMobile.x, oMobile.y, oSprite.nFrame, nSFx);
        const oOL = oSprite.oOverlay;
        if (oOL) {
            // l'ancien moteur dessinait la surcouche juste devant le sprite :
            // elle est rapprochée de la caméra d'une unité
            const fDist = Math.sqrt(dx * dx + dy * dy) || 1;
            const pushOverlay = (nOverlayFrame, fCloser) => {
                this.pushSprite(oOL, oMobile.x - dx * fCloser / fDist, oMobile.y - dy * fCloser / fDist, nOverlayFrame, 2)
            };
            if (Array.isArray(oSprite.nOverlayFrame)) {
                oSprite.nOverlayFrame.forEach((of, iOF) => pushOverlay(of, 1 + iOF / 100))
            } else if (oSprite.nOverlayFrame !== null) {
                pushOverlay(oSprite.nOverlayFrame, 1)
            }
        }
    }

    /**
     * Sprites des mobiles situés dans les cases vues à l'image précédente
     * (l'ancien moteur n'animait et ne dessinait que ceux-là).
     */
    drawHorde() {
        this.nSpriteCount = 0;
        if (this.aScanSectors) {
            Marker.iterate(this.aScanSectors, (x, y) => {
                const aMobiles = this.oMobileSectors.get(x, y);
                const nMobileCount = aMobiles.length;
                for (let i = 0; i < nMobileCount; i++) {
                    const oMobile = aMobiles[i];
                    if (oMobile.bActive && oMobile.oSprite) {
                        this.drawSprite(oMobile)
                    }
                }
            })
        }
        for (let i = this.nSpriteCount; i < this.aSpritePool.length; ++i) {
            this.aSpritePool[i].visible = false
        }
    }

    drawMap() {
        if (this.oMinimap) {
            this.oMinimap.render()
        } else {
            this.oMinimap = new Minimap();
            this.oMinimap.reset(this)
        }
    }

    clip(x, y, n) {
        if (n === undefined) {
            n = 0
        }
        const ps = this.nPlaneSpacing;
        const xm = x / ps | 0;
        const ym = y / ps | 0;
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
        let aCode;
        const w = this.oWall, wc = w.codes, wa = w.animated;
        for (const iAnim in wa) {
            aCode = wc[iAnim];
            aCode.push(aCode.shift());
            aCode.push(aCode.shift());
            if (this.bRendererReady) {
                this.registerMaterial(iAnim)
            }
        }
    }

    buildAnimatedTextures() {
        const w = this.oWall;
        if (!('animated' in w)) {
            w.animated = {}
        }
        const wc = w.codes,
            wa = w.animated;
        for (let nCode = 0; nCode < wc.length; ++nCode) {
            if (wc[nCode] && wc[nCode].length > 3) {
                wa[nCode] = {
                    nIndex: 0,
                    nCount: wc[nCode].length >> 1
                }
            }
        }
    }
}
Object.assign(Raycaster.prototype, {
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
    nBackgroundWidth: 0,
    nMapSize: 0,
    aMap: null,
    oVisual: null,
    nPlaneSpacing: 64,
    nShadingFactor: 50,
    nShadingThreshold: 15,
    oDoors: null,
    oMinimap: null,
    xTexture: 64,
    yTexture: 96,
    oCanvas: null,
    oContext: null,
    oRenderCanvas: null,
    oRenderContext: null,
    bFloor: true,
    bCeil: true,
    fViewHeight: 1,
    nFieldOfView: 90,
    nRayLimit: 100,
    oHorde: null,
    aScanSectors: null,
    oMobileSectors: null,
    oThinkerManager: null,
    oWeaponLayer: null,
    oImages: null,
    oEffects: null,
    aWorld: null,
    oConfig: null,
    oRenderer: null,
    bRendererReady: false,
    bRendered: false,
    aPendingPaints: null,
    aRenderedMap: null,
    oTileSets: null,
    aSpritePool: null,
    nSpriteCount: 0
});
