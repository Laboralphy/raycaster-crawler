import { ICONS } from '../data/ICONS.js';
import { LABY } from '../data/LABY.js';
import { MAGIC_DATA } from '../data/MAGIC_DATA.js';
import { SOUNDS } from '../data/SOUNDS.js';
import { SPELLS_DATA } from '../data/SPELLS_DATA.js';
import { GXTimeStop } from '../gx/GXTimeStop.js';
import { CanvasFactory } from '../../libraries/O876/CanvasFactory.js';
import { Animation } from '../../libraries/Raycaster/Animation.js';
import { KEYS } from '../../libraries/Raycaster/KEYS.js';
import { RC } from '../../libraries/Raycaster/RC.js';
import { Raycaster } from '../../libraries/Raycaster/Raycaster.js';
import { MathTools, PI } from '../../libraries/Raycaster/Tools/MathTools.js';

export class MagicPlugin {
    oGame = null;
    oCanvas = null;
    oContext = null;
    bDisplayInvalid = true;
    oDisplay = null;
    sSelected = '';
    nTimeStop = 0;
    nTimeStopGameTime = 0;
    oTimeStopMobile = null;
    oTimeStopGX = null;
    __timestopThink = null;

    triggerSpell(b, n) {
        const s = b[n];
        if (s === undefined) {
            return
        }
        if (MAGIC_DATA[s].target) {
            this.select(s)
        } else {
            this.castSpell(this.oGame.getPlayer(), s)
        }
    }

    key(nKey) {
        const b = this.oGame.getPlayer().getData('creature').oExtraData.magic.book;
        switch (nKey) {
            case 3:
            case KEYS.ALPHANUM.V:
                if (this.sSelected) {
                    this.castSpell(this.oGame.getPlayer(), this.sSelected)
                }
                break;
            case KEYS.F1:
                this.triggerSpell(b, 0);
                break;
            case KEYS.F2:
                this.triggerSpell(b, 1);
                break;
            case KEYS.F3:
                this.triggerSpell(b, 2);
                break;
            case KEYS.F4:
                this.triggerSpell(b, 3);
                break;
            case KEYS.F5:
                this.triggerSpell(b, 4);
                break;
            case KEYS.F6:
                this.triggerSpell(b, 5);
                break;
            case KEYS.F7:
                this.triggerSpell(b, 6);
                break;
            case KEYS.F8:
                this.triggerSpell(b, 7);
                break;
            case KEYS.F9:
                this.triggerSpell(b, 8);
                break;
            case KEYS.F10:
                this.triggerSpell(b, 9);
                break;
            case KEYS.F11:
                this.triggerSpell(b, 10);
                break
        }
        return false
    }

    exitlevel() {
        this.spellTimeRestart()
    }

    select(s) {
        if (s != this.sSelected) {
            this.sSelected = s;
            this.display()
        }
    }

    damage(oAttacker, oVictim, nAmount) {
        if (oAttacker === null) {
            return false
        }
        const oAttackerCreature = oAttacker.getData('creature');
        const nVampyre = oAttackerCreature.getAttribute('vampyre');
        if (nVampyre > 0) {
            const ep = this.oGame.oDungeon.oEffectProcessor;
            const nHeal = Math.max(1, nAmount * ep.BUFF_FACTOR[nVampyre]) | 0;
            ep.healCreature(oAttackerCreature, nHeal)
        }
        return false
    }

    timesecond() {
        if (this.bDisplayInvalid) {
            this.display()
        }
        if (this.nTimeStop) {
            this.nTimeStop -= 1;
            if (this.nTimeStop === 0) {
                this.spellTimeRestart()
            }
        }
        return false
    }

    invalidateDisplay() {
        this.bDisplayInvalid = true
    }

    display() {
        let iSpell;
        const xStart = 320;
        const wIcon = 48;
        if (this.oCanvas === null) {
            this.oCanvas = document.createElement('canvas');
            this.oCanvas.height = wIcon;
            this.oCanvas.width = 12 * this.oCanvas.height;
            this.oContext = this.oCanvas.getContext('2d')
        }
        const oCreature = this.oGame.oDungeon.getPlayerCreature();
        const aBook = oCreature.oExtraData.magic.book;
        const nSpellCount = aBook.length;
        let sSpell;
        let nCooldown;
        let x, y;
        const oIcons = this.oGame.oRaycaster.oHorde.oTiles.i_icons.oImage;
        if (!oIcons.complete) {
            return
        }
        this.bDisplayInvalid = false;
        this.oContext.fillStyle = 'rgba(0, 0, 0, 0.666)';
        for (iSpell = 0; iSpell < nSpellCount; iSpell += 1) {
            sSpell = aBook[iSpell];
            nCooldown = this.computeCooldown(oCreature, sSpell);
            x = iSpell * wIcon;
            this.oContext.drawImage(oIcons, ICONS[MAGIC_DATA[sSpell].icon] * wIcon, 0, wIcon, wIcon, x, 0, wIcon, wIcon);
            if (nCooldown < 0) {
                this.invalidateDisplay();
                y = wIcon - (wIcon * (MAGIC_DATA[sSpell].cooldown + nCooldown) / MAGIC_DATA[sSpell].cooldown | 0);
                this.oContext.fillRect(x, 0, wIcon, y)
            } else if (this.sSelected === sSpell) {
                const sGCO = this.oContext.globalCompositeOperation;
                this.oContext.globalCompositeOperation = 'lighter';
                this.oContext.drawImage(oIcons, ICONS[MAGIC_DATA[sSpell].icon] * wIcon, 0, wIcon, wIcon, x, 0, wIcon, wIcon);
                this.oContext.globalCompositeOperation = sGCO
            }
        }
        const c = this.oGame.oHUD.oContext;
        const ca = this.oGame.oHUD.oCanvas;
        c.drawImage(this.oCanvas, 0, 0, this.oCanvas.width, this.oCanvas.height, 320, 0, this.oCanvas.width * 32 / 48 | 0, 32);
        c.clearRect(xStart, 32, ca.width - xStart, ca.height - 32);
        c.fillStyle = '#FFFFFF';
        c.font = 'monospace 12px bold';
        for (iSpell = 0; iSpell < nSpellCount; iSpell += 1) {
            c.fillText('F' + (iSpell + 1).toString(), 32 * iSpell + xStart + 10, 44)
        }
        this.oGame.oHUD._bInvalid = true
    }

    computeCooldown(c, sSpell) {
        const m = c.oExtraData.magic.cooldown;
        const md = MAGIC_DATA[sSpell];
        let nCastTime = m[sSpell] || 0;
        if (nCastTime) {
            nCastTime += md.cooldown
        }
        return this.oGame.nTimeMs - nCastTime
    }

    castSpell(oWho, sSpell) {
        const c = oWho.getData('creature');
        const m = c.oExtraData.magic.cooldown;
        const md = MAGIC_DATA[sSpell];
        if (this.computeCooldown(c, sSpell) < 0) {
            this.oGame.sys_notify('magic_cooldown');
            return
        }
        if ((c.getAttribute('energy') - c.getAttribute('mp')) < md.mp) {
            this.oGame.sys_notify('magic_oom');
            return
        }
        if (this['spell' + sSpell](oWho)) {
            this.oGame.sys_playSound(SOUNDS[md.sound]);
            for (let i = 0; i < md.visual.length; i += 3) {
                this.oGame.sys_flash(md.visual[i], md.visual[i + 1], md.visual[i + 2])
            }
            m[sSpell] = this.oGame.nTimeMs;
            this.invalidateDisplay();
            c.modifyAttribute('mp', md.mp)
        }
    }

    spellDrainLife(oMobile) {
        this.oGame.gc_affect(oMobile, 'hsdrnEP', 1, 0);
        return true
    }

    spellTeleport(oMobile) {
        oMobile.bEthereal = true;
        const nSize = oMobile.nSize;
        oMobile.nSize = 0;
        oMobile.fSpeed = 16;
        this.oGame.gc_visualEffect('o_teleport', oMobile.x, oMobile.y);
        let bCollision = false;
        do {
            oMobile.moveForward();
            bCollision = oMobile.oWallCollision.x || oMobile.oWallCollision.y;
            if (bCollision) {
                oMobile.rollbackXY()
            }
        } while (!bCollision);
        oMobile.fTheta += PI;
        oMobile.fSpeed = 0;
        const ps = oMobile.oRaycaster.nPlaneSpacing;
        const ps2 = ps >> 1;
        oMobile.x = (oMobile.x / ps | 0) * ps + ps2;
        oMobile.y = (oMobile.y / ps | 0) * ps + ps2;
        oMobile.bEthereal = false;
        oMobile.nSize = nSize;
        this.oGame.gc_visualEffect('o_teleport', oMobile.x, oMobile.y);
        this.spellForget(oMobile);
        return true
    }

    spellForget(oMobile) {
        const g = this.oGame;
        const h = g.oRaycaster.oHorde;
        const nMobs = h.getMobileCount();
        let oMob;
        for (let iMob = 0; iMob < nMobs; iMob += 1) {
            oMob = h.getMobile(iMob);
            if (oMob.oThinker) {
                if (oMob.getType() == RC.OBJECT_TYPE_MOB) {
                    if (oMob.oThinker.getTarget() == oMobile) {
                        oMob.oThinker.setWanderMode()
                    }
                }
            }
        }
        return true
    }

    spellKnock(oMobile) {
        const oDoorCellXY = oMobile.getFrontCellXY();
        if ('x' in oDoorCellXY && 'y' in oDoorCellXY) {
            const x = oDoorCellXY.x;
            const y = oDoorCellXY.y;
            switch (this.oGame.oDungeon.getAreaBlockProperty(x, y)) {
                case LABY.BLOCK_LOCKEDDOOR_0:
                case LABY.BLOCK_LOCKEDDOOR_1:
                case LABY.BLOCK_LOCKEDDOOR_2:
                case LABY.BLOCK_LOCKEDDOOR_3:
                case LABY.BLOCK_UNLOCKEDDOOR:
                case LABY.BLOCK_WATCH_DOOR_LOCKED:
                    this.oGame.gc_unlockDoor(x, y);
                    return true
            }
        }
        this.oGame.sys_notify('magic_fail_knock');
        return false
    }

    spellDeathSpell(oMobile) {
        const oCreature = oMobile.getData('creature');
        const aMissiles = this.oGame.oDungeon.getWeaponMissileDefinition(SPELLS_DATA.mis_deathspell_1);
        const nMissiles = aMissiles.length;
        let oMissileDef, oMissile = null,
            sOptions;
        for (let iMis = 0; iMis < nMissiles; iMis++) {
            oMissileDef = aMissiles[iMis];
            oMissile = this.oGame.spawnMobile(oMissileDef.blueprint, oMobile.x, oMobile.y, oMobile.fTheta + oMissileDef.angle);
            oMissile.fSpeed = this.oGame.TIME_FACTOR * oMissile.getData('speed') / 1000;
            oMissile.oOwner = oMobile;
            sOptions = oMissileDef.options;
            if (oCreature.getAttribute('confused') > 0) {
                sOptions += 'r'
            }
            oMissile.oThinker.setOptions(sOptions);
            oMissile.oThinker.setEffects(oMissileDef.effects, oMissileDef.chances, oCreature.getAttribute('power'));
            oMissile.oThinker.nStepSpeed = oMissile.getData('steps');
            oMissile.oThinker.nLifeOut = this.oGame.nTime + oMissile.getData('range');
            oMissile.oThinker.fire(oMobile)
        }
        const aSnd = oMissile.getData('sounds');
        this.oGame.sys_playSound(aSnd[0], oMobile.x, oMobile.y);
        return true
    }

    spellMagicMapping(oMobile) {
        const oWallCellXY = oMobile.getFrontCellXY();
        if ('x' in oWallCellXY && 'y' in oWallCellXY) {
            const x = oWallCellXY.x;
            const y = oWallCellXY.y;
            if (this.oGame.oDungeon.getAreaBlockProperty(x, y) == LABY.BLOCK_WALL) {
                const xMob = oMobile.xSector;
                const yMob = oMobile.ySector;
                let nSide = -1;
                if (xMob === (x - 1)) {
                    nSide = 0
                } else if (xMob === (x + 1)) {
                    nSide = 2
                } else if (yMob === (y - 1)) {
                    nSide = 3
                } else if (yMob === (y + 1)) {
                    nSide = 1
                }
                if (nSide >= 0) {
                    const g = this.oGame;
                    g.oRaycaster.cloneWall(x, y, nSide, function(rc, c, xBlock, yBlock, n) {
                        const aWallStyles = ['#552200', '#663300', '#773300'];
                        const aVoidStyles = ['#FFFFFF', '#FFFFEE', '#FFFFDD'];
                        const oContext = c.getContext('2d');
                        const wMap = 44;
                        const oMap = CanvasFactory.getCanvas();
                        const wWall = rc.xTexture;
                        const hWall = rc.yTexture;
                        oMap.width = wMap;
                        oMap.height = wMap;
                        const xMap = (wWall - wMap) >> 1;
                        const yMap = (hWall - wMap) >> 1;
                        oContext.fillStyle = '#FFFFFF';
                        oContext.strokeStyle = '#000000';
                        oContext.fillRect(xMap, yMap, wMap, wMap);
                        oContext.fillStyle = '#000000';
                        let xi, yi;
                        let xb, yb;
                        for (yi = 0; yi < wMap; yi += 1) {
                            for (xi = 0; xi < wMap; xi += 1) {
                                xb = xi + (xBlock - (wMap >> 1));
                                yb = yi + (yBlock - (wMap >> 1));
                                if (rc.insideMap(xb) && rc.insideMap(yb)) {
                                    switch (g.oDungeon.getAreaBlockProperty(xb, yb)) {
                                        case LABY.BLOCK_VOID:
                                        case LABY.BLOCK_MOB_LEVEL_0:
                                        case LABY.BLOCK_MOB_LEVEL_1:
                                        case LABY.BLOCK_MOB_LEVEL_2:
                                        case LABY.BLOCK_MOB_LEVEL_3:
                                        case LABY.BLOCK_MOB_LEVEL_4:
                                        case LABY.BLOCK_MOB_LEVEL_5:
                                        case LABY.BLOCK_MOB_LEVEL_6:
                                        case LABY.BLOCK_MOB_LEVEL_7:
                                        case LABY.BLOCK_MOB_LEVEL_8:
                                        case LABY.BLOCK_MOB_LEVEL_9:
                                        case LABY.BLOCK_MOB_LEVEL_X:
                                            oContext.fillStyle = MathTools.rndChoose(aVoidStyles);
                                            break;
                                        case LABY.BLOCK_DOOR:
                                        case LABY.BLOCK_WATCH_DOOR_LOCKED:
                                        case LABY.BLOCK_ELEVATOR_DOOR_PREV:
                                        case LABY.BLOCK_ELEVATOR_DOOR_NEXT_SEALED:
                                        case LABY.BLOCK_ELEVATOR_DOOR_NEXT_UNSEALED:
                                            oContext.fillStyle = '#888888';
                                            break;
                                        case LABY.BLOCK_KEY_0:
                                            oContext.fillStyle = '#0000FF';
                                            break;
                                        case LABY.BLOCK_KEY_1:
                                            oContext.fillStyle = '#FF0000';
                                            break;
                                        case LABY.BLOCK_KEY_2:
                                            oContext.fillStyle = '#00FF00';
                                            break;
                                        case LABY.BLOCK_KEY_3:
                                            oContext.fillStyle = '#FFFF00';
                                            break;
                                        case LABY.BLOCK_LOCKEDDOOR_0:
                                            oContext.fillStyle = '#0000AA';
                                            break;
                                        case LABY.BLOCK_LOCKEDDOOR_1:
                                            oContext.fillStyle = '#AA0000';
                                            break;
                                        case LABY.BLOCK_LOCKEDDOOR_2:
                                            oContext.fillStyle = '#00AA00';
                                            break;
                                        case LABY.BLOCK_LOCKEDDOOR_3:
                                            oContext.fillStyle = '#AAAA00';
                                            break;
                                        case LABY.BLOCK_SECRET:
                                        case LABY.BLOCK_CURTAIN:
                                            oContext.fillStyle = '#FF00FF';
                                            break;
                                        case LABY.BLOCK_TREASURE:
                                        case LABY.BLOCK_WATCH_TREASURE:
                                        case LABY.BLOCK_SHOP:
                                            oContext.fillStyle = '#FFAA00';
                                            break;
                                        case LABY.BLOCK_ELEVATOR_EXIT:
                                        case LABY.BLOCK_ELEVATOR_ENTRANCE:
                                        case LABY.BLOCK_ELEVATOR_PORTAL:
                                            oContext.fillStyle = '#00FFFF';
                                            break;
                                        default:
                                            oContext.fillStyle = MathTools.rndChoose(aWallStyles);
                                            break
                                    }
                                } else {
                                    oContext.fillStyle = MathTools.rndChoose(aWallStyles)
                                }
                                oContext.fillRect(xi + xMap, yi + yMap, 1, 1)
                            }
                        }
                        oContext.beginPath();
                        oContext.lineWidth = 1;
                        oContext.strokeStyle = 'rgba(255, 0, 0, 0.666)';
                        oContext.moveTo(xMap + (wMap >> 1) - 3, yMap + (wMap >> 1) - 3);
                        oContext.lineTo(xMap + (wMap >> 1) + 3, yMap + (wMap >> 1) + 3);
                        oContext.stroke();
                        oContext.beginPath();
                        oContext.moveTo(xMap + (wMap >> 1) + 3, yMap + (wMap >> 1) - 3);
                        oContext.lineTo(xMap + (wMap >> 1) - 3, yMap + (wMap >> 1) + 3);
                        oContext.stroke();
                        oContext.lineWidth = 2;
                        oContext.strokeStyle = 'rgb(64, 64, 0)';
                        oContext.strokeRect(xMap - 1, yMap - 1, wMap + 2, wMap + 2)
                    });
                    return true
                }
            }
        }
        this.oGame.sys_notify('magic_fail_magicmapping');
        return false
    }

    spellSummonFood(oMobile) {
        let ps, ps2;
        const oWallCellXY = oMobile.getFrontCellXY();
        if ('x' in oWallCellXY && 'y' in oWallCellXY) {
            const x = oWallCellXY.x;
            const y = oWallCellXY.y;
            switch (this.oGame.oDungeon.getAreaBlockProperty(x, y)) {
                case LABY.BLOCK_VOID:
                case LABY.BLOCK_MOB_LEVEL_0:
                case LABY.BLOCK_MOB_LEVEL_1:
                case LABY.BLOCK_MOB_LEVEL_2:
                case LABY.BLOCK_MOB_LEVEL_3:
                case LABY.BLOCK_MOB_LEVEL_4:
                case LABY.BLOCK_MOB_LEVEL_5:
                case LABY.BLOCK_MOB_LEVEL_6:
                case LABY.BLOCK_MOB_LEVEL_7:
                case LABY.BLOCK_MOB_LEVEL_8:
                case LABY.BLOCK_MOB_LEVEL_9:
                case LABY.BLOCK_MOB_LEVEL_X:
                    this.oGame.gc_dropLoot('spell_summon_food', x, y);
                    this.oGame.gc_spawnLootBag(4, x, y);
                    ps = this.oGame.oRaycaster.nPlaneSpacing;
                    ps2 = ps >> 1;
                    this.oGame.gc_visualEffect('o_boom', x * ps + ps2, y * ps + ps2);
                    return true
            }
        }
        this.oGame.sys_notify('magic_fail_summonfood');
        return false
    }

    spellReflect(oMobile) {
        this.oGame.gc_affect(oMobile, 'hbrefCP', 1, 0);
        return true
    }

    spellLight(oMobile) {
        const r = this.oGame.oRaycaster;
        r.oVisual.light = 200;
        r.oVisual.fogDistance = 1;
        r.buildGradient();
        return true
    }

    timeStopHordeThinker() {
        const oMobile = this.__timestopMobile;
        oMobile.think();
        if (!oMobile.bActive) {
            this.unlinkMobile(oMobile);
            this.oMobileDispenser.pushMobile(oMobile.oSprite.oBlueprint.sId, oMobile)
        }
    }

    timeStopAnimator(nInc) {
        return this.nIndex + this.nStart
    }

    timeStopTextureAnimation() {}

    spellTimeRestart() {
        if (!this.oTimeStopMobile) {
            return false
        }
        const h = this.oGame.oRaycaster.oHorde;
        h.think = this.__timestopThink;
        h.__timestopMobile = null;
        this.__timestopThink = null;
        Animation.prototype.animate = Animation.prototype.__timestopAnimate;
        Animation.prototype.__timestopAnimate = null;
        Raycaster.prototype.textureAnimation = Raycaster.prototype.__timestopAnimate;
        Raycaster.prototype.__timestopAnimate = null;
        this.oGame.nTime = this.nTimeStopGameTime;
        this.oGame.nTimeMs = this.nTimeStopGameTime * this.oGame.oRaycaster.TIME_FACTOR;
        this.oTimeStopMobile.getData('creature').oExtraData.retrigger = 0;
        this.nTimeStop = 0;
        this.oTimeStopMobile = null;
        this.oTimeStopGX.terminate();
        this.oTimeStopGX = null;
        this.oGame.sys_flash(0xFFFFFF, 50, 5)
    }

    spellTimeStop(oMobile) {
        if (this.oTimeStopMobile) {
            return false
        }
        const h = this.oGame.oRaycaster.oHorde;
        h.__timestopMobile = oMobile;
        this.__timestopThink = h.think;
        h.think = this.timeStopHordeThinker;
        Animation.prototype.__timestopAnimate = Animation.prototype.animate;
        Animation.prototype.animate = this.timeStopAnimator;
        Raycaster.prototype.__timestopAnimate = Raycaster.prototype.textureAnimation;
        Raycaster.prototype.textureAnimation = this.timeStopTextureAnimation;
        this.oTimeStopMobile = oMobile;
        this.nTimeStop = 9;
        this.nTimeStopGameTime = this.oGame.nTime;
        this.oGame.oRaycaster.oEffects.addEffect(this.oTimeStopGX = new GXTimeStop(this.oGame.oRaycaster));
        return true
    }

    setGame(g) {
        this.oGame = g;
        this.oGame.registerPluginSignal('key', this);
        this.oGame.registerPluginSignal('damage', this);
        this.oGame.registerPluginSignal('timesecond', this);
        this.oGame.registerPluginSignal('exitlevel', this)
    }
}
