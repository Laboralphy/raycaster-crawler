export class CPUMonitor {
    constructor(...aArgs) {
        this.__construct(...aArgs);
    }

    __construct() {
        this.aColors = ['#F00', '#0F0', '#FF0', '#00F', '#F0F', '#0FF', '#FFF'];
        this.aTimes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.sTimes = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
    }

    start() {
        const d = Date.now();
        if (this.nTimes > 0) {
            this.nIdleTime = d - this.aTimes[this.nTimes - 1];
            this.nTimes = 0
        }
        this.aTimes[this.nTimes++] = d
    }

    trigger(s, d) {
        if (d === undefined) {
            d = Date.now()
        }
        this.sTimes[this.nTimes - 1] = s;
        this.aTimes[this.nTimes++] = d
    }

    render(oContext, x, y) {
        let i;
        let n;
        for (i = 0; i < (this.nTimes - 1); i++) {
            n = this.aTimes[i + 1] - this.aTimes[i];
            oContext.fillStyle = this.aColors[i % 7];
            oContext.fillRect(x, y, n, 8);
            x += n
        }
        oContext.fillStyle = this.aColors[i % 7];
        oContext.fillRect(x, y, this.nIdleTime, 8)
    }
}
Object.assign(CPUMonitor.prototype, {
    aTimes: null,
    sTimes: null,
    nTimes: 0,
    nIdleTime: 0,
    aColors: null
});
