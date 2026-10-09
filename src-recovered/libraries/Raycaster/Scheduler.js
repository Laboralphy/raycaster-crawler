export class Scheduler {
    constructor(...aArgs) {
        this.__construct(...aArgs);
    }

    __construct() {
        this.oCommands = {};
        this.aIndex = []
    }

    delayCommand(oInstance, pCommand, nDelay) {
        const aParams = Array.prototype.slice.call(arguments, 3);
        const n = nDelay + this.nTime;
        if (!(n in this.oCommands)) {
            this.oCommands[n] = []
        }
        this.oCommands[n].push([oInstance, pCommand, aParams]);
        this.aIndex.push(n);
        this.bInvalid = true
    }

    schedule(nTime) {
        this.nTime = nTime;
        if (this.bInvalid) {
            this.aIndex.sort(function(a, b) {
                return a - b
            });
            this.bInvalid = false
        }
        let n, i, o;
        while (this.aIndex.length && this.aIndex[0] < nTime) {
            n = this.aIndex.shift();
            o = this.oCommands[n];
            for (i = 0; i < o.length; i++) {
                o[i][2].apply(o[i][0], o[i][2])
            }
            delete this.oCommands[n]
        }
    }
}
Object.assign(Scheduler.prototype, {
    oCommands: null,
    aIndex: null,
    bInvalid: true,
    nTime: 0
});
