import { ArrayTools } from '../O876/ArrayTools.js';

export class GXManager {
    constructor() {
        this.aEffects = []
    }

    count() {
        return this.aEffects.length
    }

    addEffect(oEffect) {
        this.aEffects.push(oEffect);
        return oEffect
    }

    clear() {
        for (let i = 0; i < this.aEffects.length; ++i) {
            this.aEffects[i].terminate();
            this.aEffects[i].done()
        }
        this.aEffects = []
    }

    process() {
        let i = this.aEffects.length - 1;
        while (i >= 0) {
            this.aEffects[i].process();
            if (this.aEffects[i].isOver()) {
                this.aEffects[i].done();
                ArrayTools.removeItem(this.aEffects, i)
            }
            i--
        }
    }

    render() {
        const nLen = this.aEffects.length;
        for (let i = nLen - 1; i >= 0; i--) {
            this.aEffects[i].render()
        }
    }
}
