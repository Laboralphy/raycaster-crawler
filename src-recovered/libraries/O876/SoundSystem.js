import { Howl } from 'howler';

/**
 * Sons et musique, avec howler.js.
 *
 * Les bruitages sont décodés une fois (Web Audio) puis rejoués sans délai ;
 * plusieurs instances d'un même son peuvent se chevaucher. La musique est
 * lue en flux (html5), en boucle, une seule à la fois.
 */
export class SoundSystem {
    constructor(...aArgs) {
        this.__construct(...aArgs);
    }

    __construct() {
        this.oSounds = new Map();
        this.oMusic = null
    }

    getSound(sFile) {
        let oSound = this.oSounds.get(sFile);
        if (oSound === undefined) {
            oSound = new Howl({
                src: [sFile]
            });
            this.oSounds.set(sFile, oSound)
        }
        return oSound
    }

    /** Charge des bruitages à l'avance, pour que leur première lecture soit immédiate. */
    preload(aFiles) {
        aFiles.forEach((sFile) => this.getSound(sFile))
    }

    play(sFile, fVolume) {
        if (this.bMute) {
            return
        }
        const oSound = this.getSound(sFile);
        const id = oSound.play();
        if (fVolume !== undefined) {
            oSound.volume(fVolume, id)
        }
    }

    playMusic(sFile) {
        if (this.oMusic) {
            if (this.sMusicFile === sFile) {
                // même morceau (ex. cinématique puis niveau) : il continue
                return
            }
            this.oMusic.unload()
        }
        this.sMusicFile = sFile;
        const oMusic = new Howl({
            src: [sFile],
            html5: true,
            loop: true,
            // le navigateur refuse de lancer un son avant la première action
            // du joueur (clic, touche) : on rejoue alors le morceau dès que
            // howler signale que le son est débloqué
            onplayerror: () => {
                oMusic.once('unlock', () => {
                    if (this.oMusic === oMusic && !this.bMute) {
                        oMusic.play();
                    }
                })
            }
        });
        this.oMusic = oMusic;
        if (!this.bMute) {
            this.oMusic.play()
        }
    }

    mute() {
        if (!this.bMute) {
            if (this.oMusic) {
                this.oMusic.pause()
            }
            this.bMute = true
        }
    }

    unmute() {
        if (this.bMute) {
            if (this.oMusic) {
                this.oMusic.play()
            }
            this.bMute = false
        }
    }

    free() {
        this.oSounds.forEach((oSound) => oSound.unload());
        this.oSounds.clear();
        if (this.oMusic) {
            this.oMusic.unload();
            this.oMusic = null;
            this.sMusicFile = ''
        }
    }
}
Object.assign(SoundSystem.prototype, {
    oSounds: null,
    oMusic: null,
    sMusicFile: '',
    bMute: false
});
