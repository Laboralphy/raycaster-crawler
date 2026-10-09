import { Window } from './Window.js';
import { STRINGS } from '../data/STRINGS.js';
import { Button } from '../../libraries/H5UI/Button.js';

export class MainMenuWindow extends Window {
    __construct(oParams) {
        super.__construct({
            caption: STRINGS._('~win_mainmenu')
        });
        this.buildWindowContent(oParams.options)
    }

    menuOptionClick() {
        const oMenu = this.getParent();
        oMenu.iSelect = oMenu.aOptions.indexOf(this)
    }

    buildWindowContent(aOptions) {
        this.setSize(192, 128);
        let oText;
        this.aOptions = [];
        let oTheLastOption = null;
        for (let iOpt = 0; iOpt < aOptions.length; iOpt++) {
            oText = this.linkControl(new Button());
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
}
Object.assign(MainMenuWindow.prototype, {
    aOptions: null,
    iSelect: -1
});
