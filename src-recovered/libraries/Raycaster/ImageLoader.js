export class ImageLoader {
    constructor() {
        this.oImages = {};
        this.aLoading = [];
        this.bComplete = false;
        this.nLoaded = 0;
        this.oStats = {
            images: {},
            totalsize: 0
        }
    }

    finalize() {
        this.aLoading = null;
        for (const i in this.oImages) {
            this.oImages[i] = null
        }
        this.oImages = null;
        this.oStats = null
    }

    load(sUrl) {
        if (!(sUrl in this.oImages)) {
            this.oImages[sUrl] = new Image();
            this.oImages[sUrl].src = sUrl
        }
        this.bComplete = false;
        this.aLoading.push(this.oImages[sUrl]);
        return this.oImages[sUrl]
    }

    complete() {
        if (this.bComplete) {
            return true
        }
        this.nLoaded = 0;
        this.bComplete = true;
        for (let i = 0; i < this.aLoading.length; i++) {
            if (this.aLoading[i].complete) {
                this.nLoaded++
            } else {
                this.bComplete = false
            }
        }
        if (this.bComplete) {
            this.aLoading = [];
            let oImg;
            for (const sImg in this.oImages) {
                oImg = this.oImages[sImg];
                this.oStats.images[sImg] = oImg.width * oImg.height * 4;
                this.oStats.totalsize += this.oStats.images[sImg]
            }
        }
        return this.bComplete
    }

    countLoading() {
        if (this.bComplete) {
            return this.nLoaded
        } else {
            return this.aLoading.length
        }
    }

    countLoaded() {
        return this.nLoaded
    }
}
