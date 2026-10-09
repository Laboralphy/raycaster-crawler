import { Window } from './Window.js';
import { STRINGS } from '../data/STRINGS.js';
import { Text } from '../../libraries/H5UI/Text.js';

export class DialogWindow extends Window {
    __construct(oParams) {
        super.__construct({
            caption: STRINGS._('~win_dialog')
        });
        this.oParams = oParams;
        this.buildWindowContent()
    }

    buildWindowContent() {
        this.setSize(this.nWidth, this.nHeight);
        const oText = this.linkControl(new Text());
        oText._bWordWrap = true;
        oText._bAutosize = false;
        oText.moveTo(this.nPadding, this.yText);
        oText.setSize(this.nWidth - (this.nPadding * 2), this.nHeight - this.yText - this.nPadding);
        oText.font.setSize(this.nFontSize);
        oText.font.setFont('serif');
        oText.font.setColor('#000000');
        oText._nLineHeight = 4;
        this.oText = oText;
        this.oText.setCaption(this.oParams.message);
        this.setCommands(this.oParams.buttons)
    }

    command(sCommand) {
        let p, e;
        switch (sCommand) {
            case 'dlg_close':
                this.close();
                break;
            default:
                p = this.getPlugin('Dialog');
                e = p.oEvents;
                if (sCommand in e) {
                    e[sCommand].apply(p.oGame, [])
                }
                break
        }
    }
}
Object.assign(DialogWindow.prototype, {
    nWidth: 512,
    nHeight: 192,
    nFontSize: 16,
    nPadding: 32,
    oParams: null,
    yText: 64,
    oText: null
});
