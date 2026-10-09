import { ProgressBar } from './ProgressBar.js';
import { Window } from './Window.js';
import { STRINGS } from '../data/STRINGS.js';

export class LoadingWindow extends Window {
    __construct(oParams) {
        super.__construct({
            caption: STRINGS._('~win_loading')
        });
        this.setSize(320, 160);
        const pb = this.linkControl(new ProgressBar({}));
        pb.setSize(260, 32);
        pb.moveTo(32, 100);
        pb.setMax(100);
        pb.setProgress(0);
        this.oPB = pb
    }

    getProgressBar() {
        return this.oPB
    }
}
Object.assign(LoadingWindow.prototype, {
    _sClass: 'UI.LoadingWindow',
    oPB: null
});
