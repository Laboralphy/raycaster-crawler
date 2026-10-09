O2.createObject('BookPlugin', class BookPlugin {
    uiController(sCommand, xParams) {
        switch (sCommand) {
            case 'on':
                this.clear();
                this.centerWidget(this.declareWidget(new UI.BookWindow(xParams)));
                break;
            case 'next':
                return this.getWidget().nextPage();
            case 'prev':
                return this.getWidget().previousPage()
        }
    }

    block(nBlock, oMobile, x, y) {
        if (oMobile == this.oGame.getPlayer()) {
            switch (nBlock) {
                case LABY.BLOCK_LIBRARY_BOOK:
                case LABY.BLOCK_LIVING_BOOK:
                    this.readRandom();
                    return true
            }
        }
        return false
    }

    setGame(g) {
        this.oGame = g;
        this.oGame.registerPluginSignal('block', this)
    }

    read(sBook, aParams) {
        var oBook = STRINGS._(sBook, aParams);
        if (('images' in oBook) && oBook.images !== null) {
            for (var iBook = 0; iBook < oBook.images.length; iBook++) {
                if (typeof oBook.images[iBook] === 'string') {
                    oBook.images[iBook] = this.oGame.oRaycaster.oImages.load(oBook.images[iBook])
                }
            }
        }
        if (this.oGame.nIntfMode == UI.INTFMODE_NONE) {
            this.oGame.ui_open('Book', oBook)
        }
    }

    readRandom() {
        if (this.aBookList === null) {
            this.aBookList = [];
            for (var s in STRINGS.l) {
                if (s.substr(0, 5) === 'book_') {
                    this.aBookList.push('~' + s)
                }
            }
        }
        this.read(MathTools.rndChoose(this.aBookList))
    }
});
Object.assign(BookPlugin.prototype, {
    oGame: null,
    aBookList: null
});
