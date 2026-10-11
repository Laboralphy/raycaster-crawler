import { Howl } from 'howler';

/**
 * Sons et musique, avec howler.js.
 *
 * Les bruitages sont décodés une fois (Web Audio) puis rejoués sans délai ;
 * plusieurs instances d'un même son peuvent se chevaucher. La musique passe
 * aussi par Web Audio, en boucle, une seule à la fois : les morceaux sont
 * courts (moins de 2 Mo), et la boucle est alors faite par le moteur audio,
 * sans coupure ni travail sur le fil principal. En flux (html5), howler
 * rebouclait à la main (stop puis play), ce qui rechargeait le fichier et
 * faisait chuter la cadence d'images à chaque tour.
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
        // avant la première action du joueur (clic, touche), le navigateur
        // tient le son suspendu : howler attend alors sa reprise pour jouer
        this.oMusic = new Howl({
            src: [sFile],
            loop: true
        });
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
