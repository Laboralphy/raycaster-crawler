import { Window } from './Window.js';
import { STRINGS } from '../data/STRINGS.js';
import { Image } from '../../libraries/H5UI/Image.js';
import { Text } from '../../libraries/H5UI/Text.js';

export class BookWindow extends Window {
    __construct(oParams) {
        super.__construct({
            caption: STRINGS._('~win_book')
        });
        this.oParams = oParams;
        this.oGame = oParams.game;
        this.buildWindowContent()
    }

    buildWindowContent() {
        this.setSize(this.nWidth, this.nHeight);
        const oTitle = this.linkControl(new Text());
        oTitle._bWordWrap = false;
        oTitle._bAutosize = true;
        oTitle.moveTo(this.nPadding, this.yTitle);
        oTitle.font.setSize(this.nFontSize * 1.2 | 0);
        oTitle.font.setFont('serif');
        oTitle.font.setStyle('bold');
        oTitle.font.setColor('#000000');
        oTitle.setCaption(this.oParams.title);
        const oText = this.linkControl(new Text());
        oText._bWordWrap = true;
        oText._bAutosize = false;
        oText.moveTo(this.nPadding, this.yText);
        if (this.oParams.images) {
            oText.setSize(this.nWidth - (this.nPadding * 3) - this.nImageWidth, this.nHeight - this.yText - this.nPadding);
            this.oImage = this.linkControl(new Image());
            this.oImage.hide();
            this.oImage.__imageWidth = this.nImageWidth;
            this.oImage.moveTo(this.nWidth - this.nPadding - this.nImageWidth, this.yText)
        } else {
            oText.setSize(this.nWidth - (this.nPadding * 2), this.nHeight - this.yText - this.nPadding)
        }
        oText.font.setSize(this.nFontSize);
        oText.font.setFont('serif');
        oText.font.setColor('#000000');
        oText._nLineHeight = 4;
        this.oText = oText;
        this.setCommands([
            ['~key_gen_close', 'book_close', 4], null, ['~key_book_prev', 'book_prev', 1],
            ['~key_book_next', 'book_next', 1]
        ]);
        this.readPage(0)
    }

    command(sCommand) {
        switch (sCommand) {
            case 'book_next':
                this.nextPage();
                break;
            case 'book_prev':
                this.previousPage();
                break;
            case 'book_close':
                this.close()
        }
    }

    imageLoaded() {
        const oImage = this;
        const t = oImage._oTexture;
        const w = t.width;
        const h = t.height;
        const iw = oImage.__imageWidth;
        const h2 = h * iw / w | 0;
        oImage.setSize(iw, h2);
        oImage._bAutosize = false;
        oImage.show();
        oImage.invalidate()
    }

    readPage(i) {
        this.iPage = Math.min(this.oParams.pages.length - 1, Math.max(0, i));
        const oBPrev = this.getCommandButton(1);
        const oBNext = this.getCommandButton(2);
        if (this.iPage === 0) {
            oBPrev.hide()
        } else {
            oBPrev.show()
        }
        if (this.iPage == this.oParams.pages.length - 1) {
            oBNext.hide()
        } else {
            oBNext.show()
        }
        const sText = this.oParams.pages[this.iPage];
        this.oText.setCaption(sText);
        if (this.oParams.images) {
            this.oImage.setImage(this.oParams.images[i % this.oParams.images.length]);
            if (this.oImage._oTexture.complete) {
                this.imageLoaded.apply(this.oImage, [])
            } else {
                this.oImage.onLoad = this.imageLoaded
            }
        }
    }

    nextPage() {
        if (this.iPage < (this.oParams.pages.length - 1)) {
            this.readPage(this.iPage + 1);
            return true
        } else {
            return false
        }
    }

    previousPage() {
        if (this.iPage > 0) {
            this.readPage(this.iPage - 1);
            return true
        } else {
            return false
        }
    }
}
Object.assign(BookWindow.prototype, {
    nWidth: 540,
    nHeight: 320,
    nFontSize: 16,
    nPadding: 32,
    nImageWidth: 128,
    yText: 64,
    yTitle: 32,
    oParams: null,
    iPage: 0,
    oText: null,
    oImage: null,
    oGame: null
});
