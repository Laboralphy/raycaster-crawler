O2.createObject('UI.LoadingWindow', class LoadingWindow extends UI.Window {
    __construct(oParams) {
        super.__construct({
            caption: STRINGS._('~win_loading')
        });
        this.setSize(320, 160);
        var pb = this.linkControl(new UI.ProgressBar({}));
        pb.setSize(260, 32);
        pb.moveTo(32, 100);
        pb.setMax(100);
        pb.setProgress(0);
        this.oPB = pb
    }

    getProgressBar() {
        return this.oPB
    }
});
Object.assign(UI.LoadingWindow.prototype, {
    _sClass: 'UI.LoadingWindow',
    oPB: null
});
