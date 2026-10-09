import { ConsoleWindow } from '../UI/ConsoleWindow.js';
import { UI } from '../UI/UI.js';
import { KEYS } from '../../libraries/Raycaster/KEYS.js';

export class ConsolePlugin {
    setGame(g) {
        this.oGame = g;
        this.oGame.registerPluginSignal('key', this);
        this.oGame.registerPluginSignal('notify', this)
    }

    uiController(sCommand, xParams) {
        let w;
        switch (sCommand) {
            case 'on':
                this.clear();
                this.centerWidget(this.declareWidget(new ConsoleWindow(xParams)));
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

    key(nKey) {
        if (this.oGame.nIntfMode != UI.INTFMODE_CONSOLE && nKey != KEYS.ALPHANUM.I) {
            return false
        }
        switch (nKey) {
            case KEYS.ALPHANUM.I:
                if (this.oGame.nIntfMode == UI.INTFMODE_NONE) {
                    this.oGame.ui_open('Console', {
                        lines: this.aLines.join('\n')
                    });
                    return true
                } else if (this.oGame.nIntfMode == UI.INTFMODE_CONSOLE) {
                    this.oGame.ui_close();
                    return true
                }
                break
        }
        return false
    }

    notify(sMessage) {
        if (this.aLines === null) {
            this.aLines = []
        }
        this.aLines.push(sMessage);
        while (this.aLines.length > 16) {
            this.aLines.shift()
        }
    }
}
Object.assign(ConsolePlugin.prototype, {
    oGame: null,
    aLines: null
});
