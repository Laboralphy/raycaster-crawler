O2.createObject('UI.MainMenuWindow', class MainMenuWindow extends UI.Window {
    __construct(oParams) {
        super.__construct({
            caption: STRINGS._('~win_mainmenu')
        });
        this.buildWindowContent(oParams.options)
    }

    menuOptionClick() {
        var oMenu = this.getParent();
        oMenu.iSelect = oMenu.aOptions.indexOf(this)
    }

    buildWindowContent(aOptions) {
        this.setSize(192, 128);
        var oText;
        this.aOptions = [];
        var oTheLastOption = null;
        for (var iOpt = 0; iOpt < aOptions.length; iOpt++) {
            oText = this.linkControl(new H5UI.Button());
            oText.setCaption(aOptions[iOpt]);
            oText.setSize(this.getWidth() - 16 - 16, 24);
            oText.moveTo(16, 40 + (iOpt * 24));
            this.aOptions.push(oText);
            oTheLastOption = oText;
            oText.onClick = this.menuOptionClick
        }
        if (oTheLastOption) {
            this.setSize(192, oTheLastOption._y + oTheLastOption.getHeight() + 16)
        }
    }
});
Object.assign(UI.MainMenuWindow.prototype, {
    aOptions: null,
    iSelect: -1
});
