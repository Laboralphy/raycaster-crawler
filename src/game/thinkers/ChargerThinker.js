import { SOUNDS } from '../data/SOUNDS.js';
import { RusherThinker } from './RusherThinker.js';

/**
 * Poursuit et frappe comme un Rusher ; de temps en temps, quand le joueur est
 * en vue et à bonne distance, fonce droit sur lui à grande vitesse. La charge
 * garde sa direction de départ : on l'esquive en s'écartant. Elle s'arrête sur
 * un mur, un autre monstre, ou au bout de RUSH_DURATION ; sur le joueur, elle
 * le frappe et le repousse.
 */
export class ChargerThinker extends RusherThinker {
    // distance au joueur pour charger (pixels, une case = 64)
    static RUSH_MIN_DISTANCE = 128;
    static RUSH_MAX_DISTANCE = 640;
    // chance de charger (%) à chaque instant de réaction où c'est possible
    static RUSH_CHANCE = 30;
    // vitesse de la charge : vitesse de marche × RUSH_SPEED_FACTOR
    static RUSH_SPEED_FACTOR = 3;
    // durée maximale d'une charge, et délai avant la suivante (ms)
    static RUSH_DURATION = 1500;
    static RUSH_COOLDOWN = 4000;
    // poussée donnée au joueur percuté
    static RUSH_KNOCKBACK = 20;

    constructor() {
        super();
        this.nNextRushTime = 0;
        this.nRushEndTime = 0
    }

    canRush() {
        const C = ChargerThinker;
        const oTarget = this.getTarget();
        if (oTarget === null || this.isConfused() || this.oGame.nTimeMs < this.nNextRushTime) {
            return false
        }
        const d = this.distanceToTarget();
        if (d < C.RUSH_MIN_DISTANCE || d > C.RUSH_MAX_DISTANCE) {
            return false
        }
        if (!this.isTargetVisible(oTarget) || !this.searchForTarget(oTarget)) {
            return false
        }
        return Math.random() * 100 < C.RUSH_CHANCE
    }

    _follow(nTime) {
        if ((nTime % this.TIME_REACTIVITY) === 0 && this.canRush()) {
            this.startRush();
            return
        }
        super._follow(nTime)
    }

    startRush() {
        this.chaseTarget(this.getTarget());
        this.fSpeedFactor = ChargerThinker.RUSH_SPEED_FACTOR;
        this.nRushEndTime = this.oGame.nTimeMs + ChargerThinker.RUSH_DURATION;
        this.oMobile.oSprite.playAnimationType(this.ANIM_WALK);
        this.oGame.sys_playSound(SOUNDS.BOSS_RUSH, this.oMobile.x, this.oMobile.y);
        this.think = this.thinkRush
    }

    endRush() {
        this.fSpeedFactor = 1;
        this.nNextRushTime = this.oGame.nTimeMs + ChargerThinker.RUSH_COOLDOWN
    }

    thinkRush() {
        this.processEffects();
        if (this.think !== this.thinkRush) {
            // mort ou paralysé
            this.endRush();
            return
        }
        switch (this.move()) {
            case this.COLLISION_TARGET: {
                const oTarget = this.getTarget();
                const f = this.oMobile.fTheta;
                const k = ChargerThinker.RUSH_KNOCKBACK;
                this.endRush();
                this.oGame.gc_attack(this.oMobile, 0);
                if (oTarget && oTarget.oThinker && oTarget.oThinker.oPulse) {
                    oTarget.oThinker.oPulse.x += k * Math.cos(f);
                    oTarget.oThinker.oPulse.y += k * Math.sin(f)
                }
                this.setAttackMode();
                break
            }
            case this.COLLISION_WALL_X:
            case this.COLLISION_WALL_Y:
            case this.COLLISION_MOBILE:
                this.endRush();
                this.setPursuitMode();
                break;
            default:
                if (this.oGame.nTimeMs > this.nRushEndTime) {
                    this.endRush();
                    this.setPursuitMode()
                }
        }
    }
}
