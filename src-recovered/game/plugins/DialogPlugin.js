O2.createObject('DialogPlugin', class DialogPlugin {
    uiController(sCommand, xParams) {
        switch (sCommand) {
            case 'on':
                this.clear();
                this.centerWidget(this.declareWidget(new UI.DialogWindow(xParams)));
                break
        }
    }

    setGame(g) {
        this.oGame = g
    }

    display(sMessage, oCmds) {
        var aButtons = [];
        var oKeyEvents = {};
        for (var i in oCmds) {
            aButtons.push([oCmds[i][0], i, oCmds[i][1]]);
            oKeyEvents[i] = oCmds[i][2]
        }
        if (this.oGame.nIntfMode != UI.INTFMODE_NONE) {
            this.oGame.ui_close()
        }
        this.oGame.ui_open('Dialog', {
            message: sMessage,
            buttons: aButtons
        });
        this.oEvents = oKeyEvents
    }
});
Object.assign(DialogPlugin.prototype, {
    oGame: null,
    sMe: 'dialog',
    oEvents: null
});
