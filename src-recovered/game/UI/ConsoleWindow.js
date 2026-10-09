import { Window } from './Window.js';
import { Text } from '../../libraries/H5UI/Text.js';

export class ConsoleWindow extends Window {
    __construct(oParams) {
        super.__construct({
            caption: 'Console'
        });
        this.oParams = oParams;
        this.buildWindowContent();
        this.setCommands([
            ['~key_gen_close', 'console_close', 4]
        ])
    }

    buildWindowContent() {
        this.setSize(this.nWidth, this.nHeight);
        const oText = this.linkControl(new Text());
        oText._bWordWrap = true;
        oText._bAutosize = false;
        oText.moveTo(8, 24);
        oText.setSize(524, 290);
        oText.font.setFont('monospace');
        oText.font.setSize(12);
        oText.font.setColor('#000');
        oText.setCaption(this.oParams.lines);
        this.oText = oText
    }

    command(sCommand) {
        switch (sCommand) {
            case 'console_close':
                this.close();
                break
        }
    }
}
Object.assign(ConsoleWindow.prototype, {
    nWidth: 512,
    nHeight: 256,
    oParams: null,
    oText: null
});
