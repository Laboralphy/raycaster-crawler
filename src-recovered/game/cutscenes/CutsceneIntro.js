import { Cutscene } from './Cutscene.js';
import { GFX_DATA } from '../data/GFX_DATA.js';
import { MONSTERS_TILES } from '../data/MONSTERS_TILES.js';
import { STRINGS } from '../data/STRINGS.js';
import { RC } from '../../libraries/Raycaster/RC.js';
import { PI } from '../../libraries/Raycaster/Tools/MathTools.js';

export class CutsceneIntro extends Cutscene {
    __construct() {
        super.__construct();
        this.nLabySize = this.oRaycaster.nMapSize;
        this.oCameraThinker = this.oRaycaster.oCamera.oThinker;
        this.oCameraThinker.oCutscene = this
    }

    onSoundEvent(sSound) {}

    getLevelData() {
        return {
            map: [],
            walls: GFX_DATA.textures.t_forest,
            visual: GFX_DATA.visuals.forest,
            startpoint: {
                x: 320,
                y: 416,
                angle: 0
            },
            tiles: {
                m_myco: MONSTERS_TILES.m_myco,
                m_warlockboss: MONSTERS_TILES.m_warlockboss,
                m_adventurer: MONSTERS_TILES.m_adventurer,
                o_boom: GFX_DATA.tiles.o_boom,
                o_chicken: GFX_DATA.tiles.o_chicken,
                o_tome: GFX_DATA.tiles.o_tome
            },
            blueprints: {
                m_myco: {
                    type: RC.OBJECT_TYPE_MOB,
                    tile: 'm_myco',
                    width: 5,
                    height: 64,
                    thinker: 'O876_Raycaster.Linear',
                    fx: 0,
                    data: {
                        vitality: 4,
                        speed: 30,
                        weapon: 'dag_brass',
                        flags: '0'
                    }
                },
                m_warlockboss: {
                    type: RC.OBJECT_TYPE_MOB,
                    tile: 'm_warlockboss',
                    width: 5,
                    height: 64,
                    thinker: 'O876_Raycaster.Linear',
                    fx: 2,
                    data: {
                        vitality: 4,
                        speed: 30,
                        weapon: 'wand_warlock_1',
                        flags: '0'
                    }
                },
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
                },
                o_boom: {
                    type: RC.OBJECT_TYPE_PLACEABLE,
                    tile: 'o_boom',
                    width: 1,
                    height: 96,
                    thinker: 'O876_Raycaster.Linear',
                    fx: 0,
                    data: {}
                },
                o_tome: {
                    type: RC.OBJECT_TYPE_PLACEABLE,
                    tile: 'o_tome',
                    width: 1,
                    height: 64,
                    thinker: 'O876_Raycaster.NonLinear',
                    fx: 0,
                    data: {}
                },
                o_chicken: {
                    type: RC.OBJECT_TYPE_PLACEABLE,
                    tile: 'o_chicken',
                    width: 1,
                    height: 64,
                    thinker: 'O876_Raycaster.Linear',
                    fx: 0,
                    data: {}
                }
            },
            objects: [{
                blueprint: 'm_adventurer',
                x: 64 * 8 + 32,
                y: 64 * 18 + 32,
                angle: PI / 2
            }, {
                blueprint: 'm_warlockboss',
                x: 64 * 9 + 32,
                y: 64 * 18 + 32,
                angle: PI / 2
            }, {
                blueprint: 'm_myco',
                x: 64 * 5 + 32,
                y: 64 * 18 + 32,
                angle: PI / 2
            }, {
                blueprint: 'm_myco',
                x: 64 * 6 + 32,
                y: 64 * 18 + 32,
                angle: PI / 2
            }, {
                blueprint: 'm_myco',
                x: 64 * 7 + 32,
                y: 64 * 18 + 32,
                angle: PI / 2
            }, {
                blueprint: 'm_myco',
                x: 64 * 8 + 32,
                y: 64 * 18 + 32,
                angle: PI / 2
            }, {
                blueprint: 'o_chicken',
                x: 64 * 9 + 32,
                y: 64 * 18 + 32,
                angle: 0
            }, {
                blueprint: 'o_boom',
                x: 64 * 10 + 32,
                y: 64 * 18 + 32,
                angle: 0
            }, {
                blueprint: 'o_tome',
                x: 64 * 11 + 32,
                y: 64 * 18 + 32,
                angle: 0
            }]
        }
    }

    getLabyMap() {
        return [
            [160, 160, 160, 160, 160, 160, 160, 160, 160, 160, 160, 160, 160, 160, 160, 160, 160, 160, 160, 160, 160, 160, 160, 160, 160],
            [160, 163, 160, 163, 160, 162, 160, 162, 160, 162, 160, 163, 160, 162, 160, 162, 160, 162, 160, 163, 160, 162, 160, 163, 160],
            [160, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 160],
            [160, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 160],
            [160, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 160],
            [160, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 160],
            [160, 160, 160, 160, 160, 0, 160, 160, 160, 160, 160, 160, 160, 160, 160, 160, 160, 0, 160, 160, 160, 160, 160, 160, 160],
            [160, 163, 160, 163, 160, 0, 160, 162, 160, 162, 160, 163, 160, 162, 160, 162, 160, 0, 160, 163, 160, 162, 160, 163, 160],
            [160, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 160],
            [160, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 160],
            [160, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 160],
            [160, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 160],
            [160, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 160],
            [160, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 160],
            [160, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 160],
            [160, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 160],
            [160, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 160],
            [160, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 160],
            [160, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 160],
            [160, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 160],
            [160, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 160],
            [160, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 160],
            [160, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 160],
            [160, 162, 160, 163, 160, 162, 160, 163, 160, 162, 160, 162, 160, 163, 160, 163, 160, 160, 160, 160, 160, 131, 160, 160, 160],
            [160, 160, 160, 160, 160, 160, 160, 160, 160, 160, 160, 160, 160, 160, 160, 160, 160, 160, 160, 160, 160, 160, 160, 160, 160]
        ]
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
    }

    setActorMove(iActor, x, y, a, dx, dy, t, nAnim, pOnStop) {
        const oActor = this.oRaycaster.oHorde.getMobile(iActor);
        const oThinker = oActor.oThinker;
        if (x !== null && x !== undefined) {
            x = this.oRaycaster.nPlaneSpacing * x + (this.oRaycaster.nPlaneSpacing >> 1) | 0
        }
        if (y !== null && y !== undefined) {
            y = this.oRaycaster.nPlaneSpacing * y + (this.oRaycaster.nPlaneSpacing >> 1) | 0
        }
        oThinker.setMove(x, y, a, dx, dy, t);
        if (nAnim !== null && nAnim !== undefined) {
            oActor.oSprite.playAnimationType(nAnim, true)
        }
        if (pOnStop !== null && pOnStop !== undefined) {
            oThinker.thinkStop = pOnStop
        } else {
            oThinker.thinkStop = this.doNothing
        }
        oThinker.think = oThinker.thinkInit;
        oThinker.think()
    }

    setActorNonLinearMove(iActor, x, y, a, dx, dy, t, nAnim, pOnStop) {
        const oActor = this.oRaycaster.oHorde.getMobile(iActor);
        const oThinker = oActor.oThinker;
        x = this.oRaycaster.nPlaneSpacing * x + (this.oRaycaster.nPlaneSpacing >> 1) | 0;
        y = this.oRaycaster.nPlaneSpacing * y + (this.oRaycaster.nPlaneSpacing >> 1) | 0;
        dx = this.oRaycaster.nPlaneSpacing * dx + (this.oRaycaster.nPlaneSpacing >> 1) | 0;
        dy = this.oRaycaster.nPlaneSpacing * dy + (this.oRaycaster.nPlaneSpacing >> 1) | 0;
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

    wait(nTime, pEvent) {
        this.setCameraMove(null, null, null, null, null, nTime, pEvent)
    }

    doNothing() {}

    doStandAnimation() {
        this.oMobile.oSprite.playAnimationType(0);
        this.think = this.thinkIdle
    }

    doVanish() {
        this.oMobile.oSprite.bVisible = false;
        this.think = this.thinkIdle
    }

    eventGoingWrongWay() {
        this.oCutscene.setActorMove(1, null, null, 3 * PI / 2, 0, -2, 500);
        this.oCutscene.setCameraMove(null, null, null, 0, -2, 3 * 64 / 2, this.oCutscene.eventGoingWrongWayLookLeft)
    }

    eventGoingWrongWayLookLeft() {
        this.oCutscene.setActorMove(1, null, null, PI, 0, 0, 500, 0);
        this.oCutscene.setCameraMove(null, null, null, 0, 0, 15, this.oCutscene.eventGoingWrongWayLookRight)
    }

    eventGoingWrongWayLookRight() {
        this.oCutscene.setActorMove(1, null, null, 0, 0, 0, 500);
        this.oCutscene.wait(25, this.oCutscene.eventGoingWrongWayLookLeft2)
    }

    eventGoingWrongWayLookLeft2() {
        this.oCutscene.setActorMove(1, null, null, PI, 0, 0, 500, 0);
        this.oCutscene.wait(60, this.oCutscene.eventGoingWrongWayLookForth)
    }

    eventGoingWrongWayLookForth() {
        this.oCutscene.setActorMove(1, null, null, PI / 2, 0, 0, 500);
        this.oCutscene.wait(60, this.oCutscene.eventGoingWrongWayComeBack)
    }

    eventGoingWrongWayComeBack() {
        this.oCutscene.setActorMove(1, null, null, PI / 2, 0, 2, 500, 1);
        this.oCutscene.setCameraMove(null, null, null, 0, 2, 3 * 64 / 2, this.oCutscene.eventOnTheRoadAgain)
    }

    eventOnTheRoadAgain() {
        this.oCutscene.setActorMove(1, null, null, 0, 2, 0, 500);
        this.oCutscene.setCameraMove(null, null, null, 2, 0, 3 * 64 / 2, this.oCutscene.eventWaitEmbush)
    }

    eventWaitEmbush() {
        this.oCutscene.wait(10, this.oCutscene.eventEmbush);
        this.oCutscene.setActorMove(1, null, null, 0.4, 0, 0, 0, 0)
    }

    eventEmbush() {
        this.oCutscene.setActorMove(3, 5.3, 7.8, 0, 8, 0, 8, 1, this.oCutscene.doStandAnimation);
        this.oCutscene.setActorMove(4, 5, 8.3, -0.5, 8, 0, 18, 1, this.oCutscene.doStandAnimation);
        this.oCutscene.setActorMove(5, 10, 7.8, PI * (0.9), -8, 0, 5, 1, this.oCutscene.doStandAnimation);
        this.oCutscene.setCameraMove(null, null, null, 0, 0, 10, this.oCutscene.eventWaitEmbush2)
    }

    eventWaitEmbush2() {
        this.oCutscene.wait(30, this.oCutscene.eventWarlockZoom)
    }

    eventWarlockZoom() {
        this.oCutscene.setCameraMove(null, null, null, 4, -2, 20, this.oCutscene.eventWarlockSpeaks)
    }

    eventWarlockSpeaks() {
        const nTime = this.oCutscene.popup(STRINGS._('~cs0_ambush0'));
        this.oCutscene.setActorMove(2, null, null, null, null, null, 10, 1, this.oCutscene.doStandAnimation);
        this.oCutscene.setCameraMove(null, null, null, 0, 0, nTime + 10, this.oCutscene.eventAdvZoom)
    }

    eventAdvZoom() {
        this.oCutscene.setCameraMove(null, null, null, -8, 0, 10, this.oCutscene.eventAdvSpeaks)
    }

    eventAdvSpeaks() {
        const nTime = this.oCutscene.popup(STRINGS._('~cs0_ambush1'));
        this.oCutscene.setCameraMove(null, null, null, 0, 0, nTime + 10, this.oCutscene.eventWarlockZoom2)
    }

    eventWarlockZoom2() {
        this.oCutscene.setCameraMove(null, null, null, 8, 0, 10, this.oCutscene.eventWarlockSpeaks2)
    }

    eventWarlockSpeaks2() {
        const nTime = this.oCutscene.popup(STRINGS._('~cs0_ambush2'));
        this.oCutscene.setActorMove(2, null, null, null, null, null, 10, 1, this.oCutscene.doStandAnimation);
        this.oCutscene.setCameraMove(null, null, null, 0, 0, nTime + 10, this.oCutscene.eventUnzoom)
    }

    eventUnzoom() {
        this.oCutscene.setCameraMove(null, null, null, -4, 2, 20, this.oCutscene.eventWarlockAttacks)
    }

    eventWarlockAttacks() {
        this.oCutscene.onSoundEvent('hit_spell0');
        this.oCutscene.setActorMove(2, null, null, null, null, null, 5, 1, this.oCutscene.doStandAnimation);
        this.oCutscene.setActorMove(8, 8, 8.1, 0, 0, 0, 0, 0);
        this.oCutscene.setActorMove(7, 8, 8, 0, 0, 0, 0, 0);
        this.oCutscene.setActorMove(1, null, 3);
        this.oCutscene.setCameraMove(null, null, null, 0, 0, 25, this.oCutscene.eventBookToWarlock)
    }

    eventBookToWarlock() {
        this.oCutscene.onSoundEvent('m_chicken0');
        this.oCutscene.setActorNonLinearMove(9, 8, 8, 0, 10, 8, 64, 0, this.oCutscene.doVanish);
        this.oCutscene.setCameraMove(null, null, null, 0, 0, 25, this.oCutscene.eventWarlockLaughter)
    }

    eventWarlockLaughter() {
        const nTime = this.oCutscene.popup(STRINGS._('~cs0_ambush3'));
        this.oCutscene.setActorMove(2, null, null, null, null, null, 10, 1, this.oCutscene.doStandAnimation);
        this.oCutscene.setCameraMove(null, null, null, 0, 0, nTime + 10, this.oCutscene.eventWarlockLeaves)
    }

    eventWarlockLeaves() {
        this.oCutscene.setActorMove(2, null, null, 0, 4, 0, 100, 1, this.oCutscene.doStandAnimation);
        this.oCutscene.wait(10, this.oCutscene.eventMycosLeave)
    }

    eventMycosLeave() {
        this.oCutscene.setActorMove(3, null, null, PI, -4, 0, 100, 1, this.oCutscene.doStandAnimation);
        this.oCutscene.setActorMove(4, null, null, PI, -4, 0, 100, 1, this.oCutscene.doStandAnimation);
        this.oCutscene.wait(50, this.oCutscene.eventChickenRuns)
    }

    eventChickenRuns() {
        this.oCutscene.onSoundEvent('m_chicken1');
        this.oCutscene.setActorMove(7, null, null, null, -1, 0, 64, 3);
        this.oCutscene.setActorMove(5, null, null, null, -1.5, 1, 15, 1, this.oCutscene.doStandAnimation);
        this.oCutscene.wait(15, this.oCutscene.eventChickenRuns2)
    }

    eventChickenRuns2() {
        this.oCutscene.setActorMove(5, null, null, null, -1.5, 0, 49, 1, this.oCutscene.doStandAnimation);
        this.oCutscene.wait(49, this.oCutscene.eventAdvBack)
    }

    eventAdvBack() {
        this.oCutscene.onSoundEvent('hit_spell0');
        this.oCutscene.setActorMove(8, 7, 8.1, 0, 0, 0, 100, 0);
        this.oCutscene.setActorMove(7, null, 3);
        this.oCutscene.setActorMove(1, 7, 8, 0.8 * PI, 0, 0, 0, 0);
        this.oCutscene.wait(20, this.oCutscene.eventAdvPayBack)
    }

    eventAdvPayBack() {
        this.oCutscene.setActorMove(5, null, null, null, 0, 0, 0, 0);
        this.oCutscene.wait(20, this.oCutscene.eventMycoFlees)
    }

    eventMycoFlees() {
        this.oCutscene.setActorMove(1, null, null, 0, 2, 0, 10, 1, this.oCutscene.doStandAnimation);
        this.oCutscene.setActorMove(5, null, null, 0, 6, 0, 500, 1);
        this.oCutscene.wait(50, this.oCutscene.eventAngryAdvZoom)
    }

    eventAngryAdvZoom() {
        this.oCutscene.popup(STRINGS._('~cs0_advangry0'));
        this.oCutscene.setCameraMove(null, null, null, -2, -2, 32, this.oCutscene.eventAngryAdvSpeaks)
    }

    eventAngryAdvSpeaks() {
        let nTime = 0;
        nTime += this.oCutscene.popup(STRINGS._('~cs0_advangry1'), nTime) + 10;
        nTime += this.oCutscene.popup(STRINGS._('~cs0_advangry2'), nTime) + 10;
        this.oCutscene.setCameraMove(null, null, null, 0, -0.25, nTime, this.oCutscene.eventAdvFaceCamera)
    }

    eventAdvFaceCamera() {
        this.oCutscene.setActorMove(1, null, null, 0.25 * PI, 0, 0, 10, 0, this.oCutscene.doStandAnimation);
        this.oCutscene.setCameraMove(null, null, null, 0, 0, 3, this.oCutscene.eventItsWar)
    }

    eventItsWar() {
        this.oCutscene.setActorMove(1, null, null, 0.5 * PI, 0, 0, 10, 0, this.oCutscene.doStandAnimation);
        const nTime = this.oCutscene.popup(STRINGS._('~cs0_advangry3'), 10);
        this.oCutscene.setCameraMove(null, null, null, 0, 0, nTime * 2, this.oCutscene.eventEnd)
    }

    eventEnd() {
        this.oCutscene.end()
    }

    end() {
        this.sPhase = 'phaseFinish'
    }

    hasEnded() {
        return this.sPhase === 'phaseFinish'
    }

    phaseInit() {
        this.fFade = -0.05;
        this.fAlpha = 1;
        const t = this.oCameraThinker;
        t.oRaycaster = this.oRaycaster;
        this.setActorMove(0, 2, 10.5, 3 * PI / 2, 2, 0, 96, null, this.eventGoingWrongWay);
        this.setActorMove(1, 2, 8, 0, 2, 0, 500, 1);
        this.setActorMove(2, 10, 8, PI * (0.9), 0, 0, 500, 0);
        let nTime = 0;
        nTime += this.popup(STRINGS._('~cs0_advwalking0'), nTime) + 10;
        nTime += this.popup(STRINGS._('~cs0_advwalking1'), nTime) + 10;
        nTime += this.popup(STRINGS._('~cs0_advwalking2'), nTime) + 40;
        nTime += this.popup(STRINGS._('~cs0_advlost0'), nTime) + 50;
        nTime += this.popup(STRINGS._('~cs0_advlost1'), nTime) + 10;
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
}
Object.assign(CutsceneIntro.prototype, {
    fFade: -0.05,
    fAlpha: 1,
    sPhase: 'phaseInit',
    nLabyWidth: 0,
    nLabySize: 0,
    nShadedTileCount: 0
});
