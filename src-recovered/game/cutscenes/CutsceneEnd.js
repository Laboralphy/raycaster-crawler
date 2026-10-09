O2.createObject('CutsceneEnd', class CutsceneEnd extends Cutscene {
    __construct() {
        super.__construct();
        this.nLabySize = this.oRaycaster.nMapSize;
        this.oCameraThinker = this.oRaycaster.oCamera.oThinker;
        this.oCameraThinker.oCutscene = this;
        this.yPrompter = this.oRaycaster.oRenderCanvas.height;
        var p = new H5UI.Text();
        p.setSize(400, 2048);
        p.setWordWrap(true);
        p.setAutosize(false);
        p.font.setFont('monospace');
        p.font.setSize(16);
        p.font.setStyle('bold');
        p.font.setColor('#FFFFFF');
        p.setCaption(STRINGS._('~cs1_credits'));
        p._nLineHeight = 16;
        var s = p.getSurface();
        s.shadowColor = 'black';
        s.shadowOffsetX = 1;
        s.shadowOffsetY = 1;
        s.shadowBlur = 2;
        p.render();
        this.oPrompter = p
    }

    getLevelData() {
        return {
            map: [],
            walls: GFX_DATA.textures.t_credits,
            visual: GFX_DATA.visuals.darkbrown,
            startpoint: {
                x: 64 + 32,
                y: 64 + 32,
                angle: 0
            },
            tiles: {
                m_adventurer: MONSTERS_TILES.m_adventurer
            },
            blueprints: {
                m_adventurer: {
                    type: RC.OBJECT_TYPE_MOB,
                    tile: 'm_adventurer',
                    width: 5,
                    height: 64,
                    thinker: 'O876_Raycaster.Linear',
                    fx: 0,
                    data: {
                        vitality: 4,
                        speed: 30,
                        weapon: 'wand_warlock_1',
                        flags: '0'
                    }
                }
            },
            objects: [{
                blueprint: 'm_adventurer',
                x: 64 + 32,
                y: 64 + 32,
                angle: 0
            }]
        }
    }

    getLabyMap() {
        return ['AABACABACAAACABACABACAAA', 'M                      E', 'MM AA              AA  E', 'MM M                 E E', 'MM M                 E E', 'MM                     E', 'M                      E', 'MM                     F', 'MM                     E', 'MN                     G', 'MM                     E', 'MN                     F', 'MM                     E', 'MM                     E', 'MN                     E', 'MM                     G', 'MM                     E', 'MN                     F', 'MM                     E', 'MM M                 E E', 'M                    E E', 'M  II              II  E', 'M                      E', 'IIIIIJIKIJIKIJIIIJIIIJII']
    }

    setActorMove(iActor, x, y, a, dx, dy, t, nAnim, pOnStop) {
        var oActor = this.oRaycaster.oHorde.getMobile(iActor);
        var oThinker = oActor.oThinker;
        if (x !== null && x !== undefined) {
            x = this.oRaycaster.nPlaneSpacing * x + (this.oRaycaster.nPlaneSpacing >> 1) | 0
        }
        if (y !== null && y !== undefined) {
            y = this.oRaycaster.nPlaneSpacing * y + (this.oRaycaster.nPlaneSpacing >> 1) | 0
        }
        oThinker.setMove(x, y, a, dx, dy, t);
        if (nAnim !== null && nAnim !== undefined) {
            oActor.oSprite.playAnimationType(nAnim)
        }
        if (pOnStop !== null && pOnStop !== undefined) {
            oThinker.thinkStop = pOnStop
        } else {
            oThinker.thinkStop = this.doNothing
        }
        oThinker.think = oThinker.thinkInit;
        oThinker.think()
    }

    setCameraMove(x, y, a, dx, dy, t, pOnStop) {
        this.setActorMove(0, x, y, a, dx, dy, t, null, pOnStop)
    }

    end() {
        this.sPhase = 'phaseFinish'
    }

    hasEnded() {
        return this.sPhase === 'phaseFinish'
    }

    onRender() {
        this[this.sPhase]();
        if (this.fAlpha) {
            this.oRenderContext.fillStyle = 'rgba(0, 0, 0, ' + this.fAlpha + ')';
            this.oRenderContext.fillRect(this.xRC, this.yRC, this.oRCCanvas.width, this.oRCCanvas.height)
        }
        if (this.fFade) {
            this.fAlpha += this.fFade;
            if (this.fAlpha < 0) {
                this.fAlpha = 0;
                this.fFade = 0
            }
            if (this.fAlpha > 1) {
                this.fAlpha = 1;
                this.fFade = 0
            }
        }
        this.oRenderContext.drawImage(this.oPrompter._oCanvas, 392, this.yPrompter--)
    }

    setVisual(v) {
        this.oRaycaster.oVisual = v;
        this.oRaycaster.buildGradient()
    }

    eventGoldenFadeOut() {
        this.oCutscene.fFade = 0.05;
        this.oCutscene.setCameraMove(null, null, null, null, null, 20, this.oCutscene.eventCrimson)
    }

    eventCrimson() {
        this.oCutscene.setVisual(GFX_DATA.visuals.hellish);
        this.oCutscene.fFade = -0.05;
        this.oCutscene.setCameraMove(20, 4, 0, 0, 2, 448, this.oCutscene.eventCrimsonFadeOut);
        this.oCutscene.setActorMove(1, 22, 3, PI / 2 - 0.8, 0, 2, 500, 1)
    }

    eventCrimsonFadeOut() {
        this.oCutscene.fFade = 0.05;
        this.oCutscene.setCameraMove(null, null, null, null, null, 20, this.oCutscene.eventGray)
    }

    eventGray() {
        this.oCutscene.setVisual(GFX_DATA.visuals.dark);
        this.oCutscene.fFade = -0.05;
        this.oCutscene.setCameraMove(19, 20, PI / 2, -2, 0, 448, this.oCutscene.eventGrayFadeOut);
        this.oCutscene.setActorMove(1, 20, 22, PI - 0.8, -2, 0, 500, 1)
    }

    eventGrayFadeOut() {
        this.oCutscene.fFade = 0.05;
        this.oCutscene.setCameraMove(null, null, null, null, null, 20, this.oCutscene.eventForest)
    }

    eventForest() {
        this.oCutscene.setVisual(GFX_DATA.visuals.forest);
        this.oCutscene.fFade = -0.05;
        this.oCutscene.setCameraMove(4, 19, PI, 0, -2, 448, this.oCutscene.eventForestFadeOut);
        this.oCutscene.setActorMove(1, 2, 20, 3 * PI / 2 - 0.8, 0, -2, 500, 1)
    }

    eventForestFadeOut() {
        this.oCutscene.fFade = 0.05;
        this.oCutscene.setCameraMove(null, null, null, null, null, 20, this.oCutscene.eventEnd)
    }

    eventEnd() {
        this.oCutscene.end()
    }

    phaseInit() {
        this.fFade = -0.025;
        this.fAlpha = 1;
        var t = this.oCameraThinker;
        t.oRaycaster = this.oRaycaster;
        this.setCameraMove(4, 3, 3 * PI / 2, 2, 0, 448, this.eventGoldenFadeOut);
        this.setActorMove(1, 3, 1, -0.8, 2, 0, 500, 1);
        this.sPhase = 'phaseRun'
    }

    phaseRun() {}

    phaseFinish() {}

    render() {
        super.render();
        if (!this.bRender) {
            G._callGameEvent('onLoading', 'shd', ++this.nShadedTileCount, this.oRaycaster.oHorde.nTileCount)
        }
    }
});
Object.assign(CutsceneEnd.prototype, {
    fFade: -0.05,
    fAlpha: 1,
    sPhase: 'phaseInit',
    oPrompter: null,
    yPrompter: 512,
    nShadedTileCount: 0
});
