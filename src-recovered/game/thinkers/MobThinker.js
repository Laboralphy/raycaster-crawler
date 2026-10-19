import { SOUNDS } from '../data/SOUNDS.js';
import { ArrayTools } from '../../libraries/O876/ArrayTools.js';
import { Marker } from '../../libraries/O876/Marker.js';
import { RC } from '../../libraries/Raycaster/RC.js';
import { Thinker } from '../../libraries/Raycaster/Thinker.js';
import { MathTools, PI } from '../../libraries/Raycaster/Tools/MathTools.js';

// surcouche (e_hazes, 64 x 96) des effets en cours ; le premier effet
// actif de la liste l'emporte. Images : 0 vert, 1 cyan, 2 bleu clair,
// 3 bleu, 4 violet, 5 magenta, 6 rouge, 7 orange, 8 jaune, 9 blanc,
// 10 gris, 11 noir, 12 bouclier bleu, 13 bouclier jaune, 14 bouclier de
// feu, 15 bouclier sacré
const EFFECT_HAZES = {
    reflect: {
        property: 'bReflect',
        haze: 13
    },
    blind: {
        property: 'bBlind',
        haze: 11
    },
    confused: {
        property: 'bConfused',
        haze: 6
    },
    held: {
        property: 'bHeld',
        haze: 9
    },
    rooted: {
        property: 'bRooted',
        haze: 1
    },
    snared: {
        property: 'bSnared',
        haze: 0
    },
    vulnerable: {
        property: 'bVulnerable',
        haze: 4
    },
    disease: {
        property: 'bDisease',
        haze: 7
    },
    weak: {
        property: 'bWeak',
        haze: 7
    }
};

export class MobThinker extends Thinker {
    constructor() {
        super();
        this.oMobileSectors = null;
        this.oInventory = null;
        this.oWeapon = null;
        this.oCreature = null;
        this.oTarget = null;
        this.oLastAggressor = null;
        this.nNewActionTime = 0;
        this.nLastFireTime = 0;
        this.nDeadTime = 0;
        this.nSearchingTime = 2500;
        this.nWalkingTime = 750;
        this.nCastingTime = 250;
        this.nWanderingTime = 250;
        this.nWeaponSpeed = 10;
        this.bAttacking = false;
        this.nHazedEffects = 0;
        this.nBoredTime = 0;
        this.bSnared = false;
        this.bRooted = false;
        this.bHeld = false;
        this.bConfused = false;
        this.bBlind = false;
        this.bVulnerable = false;
        this.bDisease = false;
        this.bWeak = false;
        this.bReflect = false;
        this.nCastAttack = 0;
        this.aCastTimes = null;
        this.TIME_REACTIVITY = 1;
        this.ANIM_IDLE = 0;
        this.ANIM_WALK = 1;
        this.ANIM_ATTACK = 2;
        this.ANIM_DIE = 3;
        this.COLLISION_NONE = 0;
        this.COLLISION_MOBILE = 1;
        this.COLLISION_TARGET = 2;
        this.COLLISION_WALL_X = 3;
        this.COLLISION_WALL_Y = 4;
        this.MAX_BORING_TIME = 10000;
        this.EFFECT_HAZES = EFFECT_HAZES;
        this.fViewAngle = PI;
        this.aAngles = [0, 0.25 * PI, 0.5 * PI, 0.75 * PI, PI, -0.75 * PI, -0.5 * PI, -0.25 * PI];
        this.oDummyData = {
            oContinueRay: {
                bContinue: false
            },
            nRayLimit: 10
        };
        this.oPulse = {
            x: 0,
            y: 0
        };
        this.think = this.thinkInit
    }

    processEffects() {
        // la mort l'emporte sur la paralysie : sinon un monstre tué pendant
        // qu'il est paralysé reste figé jusqu'à la fin de l'effet
        if (this.isDead()) {
            this.think = this.thinkDie
        } else if (this.isHeld()) {
            this.oMobile.oSprite.playAnimationType(this.ANIM_IDLE);
            this.think = this.thinkHeld
        }
        if (this.oGame.bNewSecond) {
            this.oCreature.processEffects();
            this.checkVisibility()
        }
        this.pulse()
    }

    searchForTarget(oTarget) {
        if (oTarget === null) {
            return
        }
        const sx = oTarget.x;
        const sy = oTarget.y;
        const mx = this.oMobile.x;
        const my = this.oMobile.y;
        const fSearchAngle = Math.atan2(sy - my, sx - mx);
        const fSA = Math.abs((fSearchAngle + PI) - (this.oMobile.fTheta + PI));
        if (fSA > this.fViewAngle) {
            return false
        }
        const dx = Math.cos(fSearchAngle);
        const dy = Math.sin(fSearchAngle);
        const aVisibles = this.oGame.oRaycaster.castRay(this.oDummyData, this.oMobile.x, this.oMobile.y, dx, dy);
        return Marker.getMarkXY(aVisibles, oTarget.xSector, oTarget.ySector)
    }

    searchForRandomTarget() {
        const aMobs = this.oGame.gc_selectMobilesInCircle(this.oMobile.x, this.oMobile.y, 384);
        const nMe = aMobs.indexOf(this.oMobile);
        if (nMe >= 0) {
            ArrayTools.removeItem(aMobs, nMe)
        }
        if (aMobs.length) {
            return MathTools.rndChoose(aMobs)
        } else {
            return null
        }
    }

    isTargetVisible(t) {
        if (t === null) {
            return false
        }
        const c = t.getData('creature');
        const bInvisible = c.getAttribute('invisible') > 0;
        const bEsp = c.getAttribute('esp') > 0;
        if (bInvisible && (!bEsp)) {
            return false
        }
        if ((!bInvisible) && this.bBlind) {
            return false
        }
        return true
    }

    distanceToTarget() {
        const t = this.getTarget();
        if (t) {
            return MathTools.distance(this.oMobile.x - t.x, this.oMobile.y - t.y)
        } else {
            return -1
        }
    }

    chaseTarget(oTarget) {
        this.oTarget = oTarget;
        if (this.getTarget() !== null) {
            this.oMobile.fTheta = Math.atan2(oTarget.y - this.oMobile.y, oTarget.x - this.oMobile.x);
            if (!this.isTargetVisible(oTarget)) {
                if (this.distanceToTarget() < 384) {
                    this.oMobile.fTheta += 4 * Math.random() - 2
                } else {
                    this.setWanderMode()
                }
            }
        }
    }

    getTarget() {
        if (this.oTarget && this.oTarget.getData('creature').getAttribute('dead')) {
            this.oTarget = null
        }
        return this.oTarget
    }

    getCollisionType() {
        if (this.oMobile.oMobileCollision !== null) {
            const oTarget = this.oMobile.oMobileCollision;
            if (oTarget.getType() == RC.OBJECT_TYPE_MISSILE) {
                return this.COLLISION_NONE
            } else {
                this.oMobile.rollbackXY();
                if (oTarget == this.getTarget()) {
                    return this.COLLISION_TARGET
                } else {
                    return this.COLLISION_MOBILE
                }
            }
        } else {
            if (this.oMobile.oWallCollision.x) {
                return this.COLLISION_WALL_X
            } else if (this.oMobile.oWallCollision.y) {
                return this.COLLISION_WALL_Y
            }
        }
        return this.COLLISION_NONE
    }

    escapeFrom(oMobile) {
        const fAngle = Math.atan2(this.oMobile.y - oMobile.y, this.oMobile.x - oMobile.x);
        this.oMobile.move(fAngle, this.oMobile.fSpeed)
    }

    disable() {
        this.oMobile.bEthereal = true;
        this.oMobile.gotoLimbo();
        this.think = this.thinkDead()
    }

    pulse() {
        const xPulse = this.oPulse.x;
        const yPulse = this.oPulse.y;
        if (xPulse || yPulse) {
            this.oMobile.slide(xPulse | 0, yPulse | 0);
            this.oPulse.x /= 1.33;
            this.oPulse.y /= 1.33;
            if (Math.abs(this.oPulse.x) < 1) {
                this.oPulse.x = 0
            }
            if (Math.abs(this.oPulse.y) < 1) {
                this.oPulse.y = 0
            }
        }
    }

    move(nType) {
        if (nType === undefined) {
            nType = 0
        }
        const g = this.oGame;
        this.oMobile.fSpeed = g.TIME_FACTOR * g.oDungeon.getCreatureMoveSpeed(this.oCreature) / 1000;
        switch (nType) {
            case 0:
                this.oMobile.moveForward();
                break;
            case 1:
                this.oMobile.strafeLeft();
                break;
            case 2:
                this.oMobile.strafeRight();
                break;
            case 3:
                this.oMobile.moveBackward();
                break
        }
        const nCollisionType = this.getCollisionType();
        switch (nCollisionType) {
            case this.COLLISION_TARGET:
                this.oMobile.rollbackXY();
                break;
            case this.COLLISION_MOBILE:
                this.oMobile.rollbackXY();
                this.escapeFrom(this.oMobile.oMobileCollision);
                this.nBoredTime += g.TIME_FACTOR;
                break;
            case this.COLLISION_WALL_X:
            case this.COLLISION_WALL_Y:
                this.nBoredTime += g.TIME_FACTOR;
                break;
            case this.COLLISION_NONE:
                this.nBoredTime = 0
        }
        return nCollisionType
    }

    isActionTimeExpired() {
        return this.oGame.nTimeMs > this.nNewActionTime
    }

    setNextActionTime(nNextActionTimeRndMin, nNextActionTimeRndMax) {
        if (nNextActionTimeRndMax === undefined) {
            this.nNewActionTime = this.oGame.nTimeMs + nNextActionTimeRndMin
        } else {
            this.nNewActionTime = this.oGame.nTimeMs + MathTools.rnd(nNextActionTimeRndMin, nNextActionTimeRndMax)
        }
    }

    isConfused() {
        return this.bConfused
    }

    isBlind() {
        return this.bBlind
    }

    isHeld() {
        return this.bHeld
    }

    isDead() {
        return this.oCreature.getAttribute('dead') > 0
    }

    isRooted() {
        return this.bRooted
    }

    isSnared() {
        return this.bSnared
    }

    checkVisibility() {
        this.oMobile.bVisible = this.oCreature.getAttribute('invisible') <= 0 || this.oGame.oDungeon.getPlayerCreature().getAttribute('esp') > 0
    }

    creatureAttributeChanged(oCreature, sAttribute, nNewValue, nPreviousValue) {
        if (sAttribute in this.EFFECT_HAZES) {
            this[this.EFFECT_HAZES[sAttribute].property] = nNewValue > 0;
            this.setupHaze()
        }
        switch (sAttribute) {
            case 'invisible':
                this.checkVisibility();
                break;
            case 'hp':
                if (nNewValue > nPreviousValue && this.oLastAggressor !== oCreature) {
                    this.oGame.sendPluginSignal('damage', this.oLastAggressor, this.oMobile, nNewValue - nPreviousValue)
                }
                break;
            case 'dead':
                if (nNewValue > nPreviousValue && this.oLastAggressor !== oCreature) {
                    this.oGame.sendPluginSignal('kill', this.oLastAggressor, this.oMobile)
                }
                break
        }
    }

    setupHaze() {
        let nHaze = 0;
        let bHaze = false;
        let oHazeDef;
        for (const sHaze in this.EFFECT_HAZES) {
            oHazeDef = this.EFFECT_HAZES[sHaze];
            if (this[oHazeDef.property]) {
                nHaze = oHazeDef.haze;
                bHaze = true;
                break
            }
        }
        if (bHaze) {
            // l'image suit l'effet prioritaire, même si une surcouche est déjà
            // posée (un effet qui s'ajoute ou qui se termine change la couleur)
            this.oMobile.oSprite.oOverlay = this.oGame.oRaycaster.oHorde.oTiles.e_hazes;
            this.oMobile.oSprite.nOverlayFrame = nHaze
        } else {
            if (this.oMobile.oSprite.oOverlay) {
                this.oMobile.oSprite.oOverlay = null
            }
        }
    }

    _init() {}

    _follow(nTime) {}

    _attack(nTime) {}

    _dead() {}

    _cast(nTime) {}

    _hitByMissile(oMissile) {
        const oBastard = this.oLastAggressor = oMissile.oThinker.oOwner;
        if (this.isConfused()) {
            return
        }
        if (this.getTarget() === null && oBastard == this.oGame.getPlayer()) {
            this.chaseTarget(oBastard);
            this.setPursuitMode()
        }
    }

    setAttackMode() {
        this.oMobile.oSprite.playAnimationType(this.ANIM_ATTACK);
        this.think = this.thinkAttack
    }

    setSearchMode() {
        this.setNextActionTime(this.nSearchingTime, this.nSearchingTime << 1);
        this.oMobile.oSprite.playAnimationType(this.ANIM_IDLE);
        this.think = this.thinkSearch
    }

    setPursuitMode() {
        this.oMobile.oSprite.playAnimationType(this.ANIM_WALK);
        this.think = this.thinkFollow
    }

    setWanderMode() {
        this.oMobile.oSprite.playAnimationType(this.ANIM_IDLE);
        this.setNextActionTime(this.nWanderingTime, this.nWanderingTime << 1);
        this.chaseTarget(null);
        this.think = this.thinkWander
    }

    setCastMode(nCast) {
        this.bAttacking = false;
        this.nCastAttack = nCast;
        this.nCastingTime = this.aCastTimes[this.nCastAttack] + 1;
        this.setNextActionTime(this.nCastingTime);
        this.think = this.thinkCast
    }

    stripEffects() {
        this.oGame.oDungeon.oEffectProcessor.dispellEffects(this.oCreature, this.oGame.oDungeon.oEffectProcessor.selectorAll);
        for (const sHaze in this.EFFECT_HAZES) {
            this[this.EFFECT_HAZES[sHaze].property] = false
        }
        if (this.oMobile.oSprite.oOverlay) {
            this.oMobile.oSprite.oOverlay = null
        }
    }

    thinkInit() {
        this.oMobile.bEthereal = false;
        this.oCreature = this.oMobile.getData('creature');
        this.oInventory = this.oGame.oDungeon.getCreatureInventory(this.oCreature);
        this.oWeapon = this.oInventory.oEquipSlots.hand;
        this.nWeaponSpeed = this.oWeapon.speed;
        this.oMobileSectors = this.oGame.oRaycaster.oMobileSectors;
        this.setNextActionTime(0);
        if (this.isDead()) {
            this.disable()
        }
        this.aCastTimes = [];
        for (let i = 0; i < this.oWeapon.spells.length; i++) {
            this.aCastTimes.push(this.oWeapon.spells[i].time)
        }
        this.TIME_REACTIVITY = 400 / this.oGame.TIME_FACTOR | 0;
        this._init();
        this.setWanderMode()
    }

    thinkWander() {
        this.processEffects();
        if (this.isActionTimeExpired()) {
            this.oMobile.fSpeed = 0;
            this.oMobile.fTheta = this.aAngles[MathTools.rnd(0, this.aAngles.length - 1)];
            this.oMobile.oSprite.playAnimationType(this.ANIM_WALK);
            this.setNextActionTime(this.nWalkingTime, this.nWalkingTime << 1);
            this.think = this.thinkWalk
        }
    }

    thinkHeld() {
        this.processEffects();
        if (!this.isHeld()) {
            this.setSearchMode()
        }
    }

    thinkWalk() {
        this.processEffects();
        this.move();
        if (this.isActionTimeExpired()) {
            this.setSearchMode()
        }
    }

    thinkSearch() {
        this.processEffects();
        if (this.isConfused()) {
            this.think = this.thinkSearchConfused;
            return
        }
        if (this.searchForTarget(this.oGame.getPlayer())) {
            this.chaseTarget(this.oGame.getPlayer());
            this.setPursuitMode()
        } else if (this.isActionTimeExpired()) {
            this.setWanderMode()
        }
    }

    thinkSearchConfused() {
        this.processEffects();
        let oTarget = null;
        if (!this.isConfused()) {
            this.think = this.thinkSearch;
            return
        }
        oTarget = this.searchForRandomTarget();
        if (oTarget) {
            this.chaseTarget(oTarget);
            this.setPursuitMode()
        }
        if (this.isActionTimeExpired()) {
            this.setWanderMode()
        }
    }

    thinkFollow() {
        this.processEffects();
        const nTime = this.oGame.nTime;
        if (this.nBoredTime > this.MAX_BORING_TIME) {
            this.setWanderMode()
        } else {
            this._follow(nTime)
        }
    }

    thinkAttack() {
        this.processEffects();
        if (!this.bAttacking) {
            this.oMobile.oSprite.playAnimationType(this.ANIM_ATTACK);
            this.bAttacking = true;
            this.setNextActionTime(this.nWeaponSpeed);
            this._attack(this.oGame.nTime)
        } else if (this.isActionTimeExpired()) {
            this.bAttacking = false;
            this.oMobile.oSprite.playAnimationType(this.ANIM_WALK);
            if (this.isConfused()) {
                this.setWanderMode()
            } else {
                this.setPursuitMode()
            }
        }
    }

    thinkCast() {
        this.processEffects();
        if (!this.bAttacking) {
            this.oMobile.oSprite.playAnimationType(this.ANIM_ATTACK);
            this.bAttacking = true;
            this.setNextActionTime(this.nCastingTime)
        } else if (this.isActionTimeExpired()) {
            this.bAttacking = false;
            this.oMobile.oSprite.playAnimationType(this.ANIM_WALK);
            if (this.isConfused()) {
                this.setWanderMode()
            } else {
                this._cast(this.oGame.nTime)
            }
        }
    }

    thinkDie() {
        this.pulse();
        this.oMobile.oSprite.playAnimationType(this.ANIM_DIE);
        this.oMobile.bEthereal = true;
        this.nDeadTime = this.oMobile.oSprite.oAnimation.nDuration * this.oMobile.oSprite.oAnimation.nCount;
        this.oGame.gc_dropLoot(this.oMobile.oSprite.oBlueprint.sId, this.oMobile);
        this.stripEffects();
        this.think = this.thinkDying;
        this.oGame.sys_playSound(SOUNDS.FOE_SLAIN, this.oMobile.x, this.oMobile.y)
    }

    thinkDying() {
        this.pulse();
        this.nDeadTime -= this.oGame.TIME_FACTOR;
        if (this.nDeadTime <= 0) {
            this.oMobile.gotoLimbo();
            this.think = this.thinkDead
        }
    }

    thinkDead() {
        this.oMobile.bActive = false;
        this._dead()
    }
}
