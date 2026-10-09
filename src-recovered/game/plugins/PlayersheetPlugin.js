O2.createObject('PlayersheetPlugin', class PlayersheetPlugin {
    uiController(sCommand, xParams) {
        switch (sCommand) {
            case 'on':
                this.clear();
                this.centerWidget(this.declareWidget(new UI.PlayersheetWindow(xParams)));
                break
        }
    }

    key(nKey) {
        if (this.oGame.nIntfMode == UI.INTFMODE_NONE && nKey == KEYS._INT_SHEET) {
            this.oGame.ui_open('Playersheet', {
                creature: this.oGame.oDungeon.getPlayerCreature()
            });
            return true
        }
        if (this.oGame.nIntfMode == UI.INTFMODE_PLAYERSHEET && nKey == KEYS._INT_SHEET) {
            this.oGame.ui_close();
            return true
        }
        return false
    }

    setGame(g) {
        this.oGame = g;
        this.oGame.registerPluginSignal('key', this)
    }
});
Object.assign(PlayersheetPlugin.prototype, {
    oGame: null,
    oEffectProcessor: null,
    nPreviousMode: 0
});
