import { StubWindow } from '../UI/StubWindow.js';
import { SOUNDS } from '../data/SOUNDS.js';
import { GXFlood } from '../gx/GXFlood.js';
import { MathTools } from '../../libraries/Raycaster/Tools/MathTools.js';

export class UnderwaterPlugin {
    oGame = null;
    MAX_APNEA = 20;
    MAX_BUBBLES = 5;
    HUD_BUBBLE = 51;
    HUD_POP = 52;
    APNEA_DAMAGE = 5;
    bInWater = false;

    setGame(g) {
        this.oGame = g;
        this.oGame.registerPluginSignal('gamerestart', this)
    }

    uiController(sCommand, xParams) {
        let w;
        switch (sCommand) {
            case 'on':
                this.clear();
                this.centerWidget(this.declareWidget(new StubWindow(xParams)));
                break;
            case 'off':
                w = this.getWidget();
                if (w.oPopup._bVisible) {
                    w.oPopup.hide();
                    return false
                } else {
                    this.oScreen.hide()
                }
                return true
        }
    }

    waterIn() {
        if (this.bInWater) {
            return
        }
        this.bInWater = true;
        this.oGame.registerPluginSignal('timesecond', this);
        this.oGame.registerPluginSignal('exitlevel', this);
        const p = this.oGame.oDungeon.getPlayerCreature();
        p.setBaseAttribute('maxapnea', this.MAX_APNEA);
        p.modifyAttribute('apnea', -p.getAttribute('apnea'));
        this.displayBubbles(0, this.MAX_APNEA)
    }

    waterOut() {
        if (!this.bInWater) {
            return
        }
        this.bInWater = false;
        this.oGame.unregisterPluginSignal('timesecond', this);
        this.oGame.unregisterPluginSignal('exitlevel', this);
        for (let x = 0; x < this.MAX_BUBBLES; ++x) {
            this.oGame.oHUD.printTile(11 + x, 0, 0)
        }
    }

    breathe() {
        const p = this.oGame.oDungeon.getPlayerCreature();
        p.modifyAttribute('apnea', -p.getAttribute('apnea'));
        this.displayBubbles(0, this.MAX_APNEA);
        this.oGame.sys_flash(0x0044FF, 50, 10);
        const nBubbles = MathTools.rnd(0, 5);
        if (nBubbles < SOUNDS.AMB_BUBBLES.length) {
            this.oGame.sys_playSound(SOUNDS.AMB_BUBBLES[nBubbles])
        }
    }

    dive() {
        const g = this.oGame;
        const p = g.oDungeon.getPlayerCreature();
        let nApnea = p.getAttribute('apnea');
        const nMaxApnea = p.getAttribute('maxapnea');
        if (nApnea < nMaxApnea) {
            ++nApnea;
            p.modifyAttribute('apnea', 1)
        } else {
            this.oGame.oDungeon.oEffectProcessor.damageCreature(p, this.APNEA_DAMAGE, '')
        }
        this.displayBubbles(nApnea, nMaxApnea)
    }

    checkAir() {
        const g = this.oGame;
        const p = g.getPlayer();
        const aSector = g.oRaycaster.oMobileSectors.get(p.xSector, p.ySector);
        const l = aSector.length;
        let o;
        for (let i = 0; i < l; ++i) {
            o = aSector[i];
            if (o.getData('bubbles')) {
                return true
            }
        }
        return false
    }

    displayBubbles(nApnea, nMaxApnea) {
        let x;
        const nMaxBubbles = this.MAX_BUBBLES;
        let nBubbles = (nMaxBubbles << 1) * (nMaxApnea - nApnea) / nMaxApnea | 0;
        const bPop = (nBubbles & 1) !== 0;
        nBubbles >>= 1;
        for (x = 0; x < nBubbles; ++x) {
            this.oGame.oHUD.printTile(11 + x, 0, this.HUD_BUBBLE)
        }
        if (bPop) {
            this.oGame.oHUD.printTile(11 + x, 0, this.HUD_POP);
            ++x
        }
        while (x < nMaxBubbles) {
            this.oGame.oHUD.printTile(11 + x, 0, 0);
            ++x
        }
    }

    exitlevel() {
        this.waterOut()
    }

    timesecond() {
        if (this.checkAir()) {
            this.breathe()
        } else {
            this.dive()
        }
    }

    block(nBlock) {
        if (nBlock === 129) {
            this.oGame.unregisterPluginSignal('block', this);
            this.oGame.oRaycaster.oEffects.addEffect(new GXFlood(this.oGame.oRaycaster));
            this.oGame.sys_playSound(SOUNDS.WATER_SPLASH);
            this.oGame.sys_playMusic(SOUNDS.MUSIC_UNDERWATER);
            this.waterIn()
        }
    }

    gamerestart() {
        this.waterOut()
    }
}
