O2.createObject('StubPlugin', class StubPlugin {
    setGame(g) {
        this.oGame = g;
        this.oGame.registerPluginSignal('block', this)
    }

    uiController(sCommand, xParams) {
        var w;
        switch (sCommand) {
            case 'on':
                this.clear();
                this.centerWidget(this.declareWidget(new UI.StubWindow(xParams)));
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
});
Object.assign(StubPlugin.prototype, {
    oGame: null
});
