export class SoundSystem {
    constructor(...aArgs) {
        this.__construct(...aArgs);
    }

    __construct() {
        this.oBase = document.getElementsByTagName('body')[0];
        this.aChans = [];
        this.aAmbient = [];
        this.oMusicChan = this.createChan();
        this.oMusicChan.loop = true;
        this.aChans = []
    }

    worthPlaying(nTime, sFile, fVolume) {
        if (this.nSndPlayedTime != nTime || this.sSndPlayedFile != sFile || this.fSndPlayedVolume != fVolume) {
            this.sSndPlayedFile = sFile;
            this.fSndPlayedVolume = fVolume;
            this.nSndPlayedTime = nTime;
            return true
        } else {
            return false
        }
    }

    mute() {
        if (!this.bMute) {
            this.oMusicChan.pause();
            this.bMute = true
        }
    }

    unmute() {
        if (this.bMute) {
            this.oMusicChan.play();
            this.bMute = false
        }
    }

    destroyItem(o) {
        o.parentNode.removeChild(o)
    }

    free() {
        for (let i = 0; i < this.aChans.length; i++) {
            this.destroyItem(this.aChans[i])
        }
        this.destroyItem(this.oMusicChan);
        this.aChans = []
    }

    createChan() {
        const oChan = document.createElement('audio');
        this.oBase.appendChild(oChan);
        return oChan
    }

    addChan() {
        const oChan = this.createChan();
        oChan.setAttribute('preload', 'auto');
        oChan.setAttribute('autoplay', 'autoplay');
        oChan.__file = '';
        this.aChans.push(oChan);
        this.bAllUsed = false;
        return oChan
    }

    addChans(n) {
        for (let i = 0; i < n; i++) {
            this.addChan()
        }
    }

    isChanPlaying(nChan, sFile) {
        if (nChan == this.CHAN_MUSIC) {
            return !this.oMusicChan.ended
        }
        if (nChan < 0) {
            nChan = 0
        }
        if (nChan >= this.aChans.length) {
            nChan = this.aChans.length - 1
        }
        const oChan = this.aChans[nChan];
        if (sFile === undefined) {
            return !oChan.ended
        } else {
            return !(oChan.ended && ((sFile == oChan.__file) || (oChan.__file !== '')))
        }
    }

    isChanFree(nChan, sFile) {
        if (nChan == this.CHAN_MUSIC) {
            return this.oMusicChan.ended
        }
        if (nChan < 0) {
            nChan = 0
        }
        if (nChan >= this.aChans.length) {
            nChan = this.aChans.length - 1
        }
        const oChan = this.aChans[nChan];
        if (sFile === undefined) {
            return oChan.ended
        } else {
            const bEmpty = oChan.__file === '';
            const bNotPlaying = oChan.ended;
            const bAlreadyLoaded = sFile == oChan.__file;
            return bEmpty || (bNotPlaying && bAlreadyLoaded)
        }
    }

    getFreeChan(sFile) {
        if (!this.hasChan()) {
            return -1
        }
        let iChan;
        for (iChan = 0; iChan < this.aChans.length; iChan++) {
            if (this.isChanFree(iChan, sFile)) {
                return iChan
            }
        }
        for (iChan = 0; iChan < this.aChans.length; iChan++) {
            if (this.isChanFree(iChan)) {
                return iChan
            }
        }
        this.nChanIndex = (this.nChanIndex + 1) % this.aChans.length;
        return this.nChanIndex
    }

    hasChan() {
        return this.aChans.length > 0
    }

    play(sFile, nChan, fVolume) {
        if (this.bMute) {
            return -1
        }
        let oChan = null;
        if (sFile === undefined) {
            return -1
        }
        if (nChan == this.CHAN_MUSIC) {
            this.playMusic(sFile);
            return
        } else if (this.hasChan()) {
            if (nChan === undefined) {
                nChan = this.getFreeChan(sFile)
            }
            oChan = this.aChans[nChan]
        } else {
            oChan = null
        }
        if (oChan !== null) {
            if (oChan.__file != sFile) {
                oChan.src = sFile;
                oChan.__file = sFile;
                oChan.load()
            } else if (oChan.readyState > this.HAVE_NOTHING) {
                oChan.currentTime = 0;
                oChan.play()
            }
        }
        if (fVolume !== undefined) {
            oChan.volume = fVolume
        }
        return nChan
    }

    playMusic(sFile) {
        const oChan = this.oMusicChan;
        oChan.src = sFile;
        oChan.load();
        oChan.play()
    }

    crossFadeMusic(sFile) {
        if (this.bCrossFading) {
            this.sCrossFadeTo = sFile;
            return
        }
        let iVolume = 100;
        const nVolumeDelta = -10;
        this.bCrossFading = true;
        let oInterval = null;
        oInterval = setInterval((function() {
            iVolume += nVolumeDelta;
            this.oMusicChan.volume = iVolume / 100;
            if (iVolume <= 0) {
                this.playMusic(sFile);
                this.oMusicChan.volume = 1;
                clearInterval(oInterval);
                this.bCrossFading = false;
                if (this.sCrossFadeTo) {
                    this.crossFadeMusic(this.sCrossFadeTo);
                    this.sCrossFadeTo = ''
                }
            }
        }).bind(this), 100)
    }
}
Object.assign(SoundSystem.prototype, {
    CHAN_MUSIC: 99,
    HAVE_NOTHING: 0,
    HAVE_METADATA: 1,
    HAVE_CURRENT_DATA: 2,
    HAVE_FUTURE_DATA: 3,
    HAVE_ENOUGH_DATA: 4,
    oBase: null,
    aChans: null,
    oMusicChan: null,
    nChanIndex: -1,
    nPlayed: 0,
    fMuteVolume: 0,
    bMute: false,
    bAllUsed: false,
    sCrossFadeTo: '',
    bCrossFading: false,
    sSndPlayedFile: '',
    fSndPlayedVolume: 0,
    nSndPlayedTime: 0
});
