import { Icon } from './Icon.js';
import { UI } from './UI.js';
import { Window } from './Window.js';
import { Text } from '../../libraries/H5UI/Text.js';

export class DescriptorWindow extends Window {
    __construct(oParams) {
        super.__construct({
            caption: oParams.title
        });
        this.oParams = oParams;
        this.buildWindowContent()
    }

    command(sCommand) {
        switch (sCommand) {
            case 'desc_close':
                G.nIntfMode = UI.INTFMODE_INVENTORY;
                G.oUI.setScreen('Inventory');
                this.free();
                break
        }
    }

    buildWindowContent() {
        this.setSize(this.nWidth, this.nHeight);
        const oText = this.linkControl(new Text());
        this.xIcon = this.nWidth - this.nIconSize - this.yIcon;
        oText._bWordWrap = true;
        oText._bAutosize = false;
        oText.moveTo(this.nPadding, this.yText);
        oText.setSize(this.nWidth - (this.nPadding * 2) - this.nIconSize, this.nHeight - this.yText - this.nPadding);
        oText.font.setSize(this.nFontSize);
        oText.font.setFont('serif');
        oText.font.setColor('#000000');
        oText._nLineHeight = 4;
        this.oText = oText;
        this.oText.setCaption(this.oParams.message);
        const oBox = this.linkControl(new Icon());
        oBox.setSize(this.nIconSize, this.nIconSize);
        oBox.xStart = this.oParams.icon * this.nIconSize;
        oBox.moveTo(this.xIcon, this.yIcon);
        oBox.setImage(UI.oIconsItems);
        oBox.selected(false);
        this.setCommands([
            ['~key_gen_close', 'desc_close', 4]
        ])
    }
}
Object.assign(DescriptorWindow.prototype, {
    nWidth: 400,
    nHeight: 360,
    nFontSize: 14,
    nPadding: 24,
    oParams: null,
    yText: 32,
    oText: null,
    xIcon: 0,
    yIcon: 16,
    nIconSize: 48
});
