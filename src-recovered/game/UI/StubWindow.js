O2.createObject('UI.StubWindow', class StubWindow extends UI.Window {
    __construct(oParams) {
        super.__construct({
            caption: 'STUB Window'
        });
        this.oParams = oParams;
        this.buildWindowContent();
        this.setCommands([
            ['~key_gen_close', 'stub_close', 4]
        ])
    }

    buildWindowContent() {
        this.setSize(this.nWidth, this.nHeight)
    }

    command(sCommand) {
        switch (sCommand) {
            case 'stub_close':
                if (this.oPopup._bVisible) {
                    this.getPlugin('Stub').abort()
                } else {
                    this.close()
                }
                break
        }
    }
});
Object.assign(UI.StubWindow.prototype, {
    nWidth: 540,
    nHeight: 356,
    oParams: null
});
