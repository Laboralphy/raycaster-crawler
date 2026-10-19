import { describe, it, expect, vi, beforeEach } from 'vitest';
import { assertDefaults, assertNotShared } from '../../helpers.mjs';

// faux howler : chaque Howl garde ses options et compte ses appels
const aHowls = [];
vi.mock('howler', () => ({
    Howl: vi.fn(function (oOptions) {
        this.oOptions = oOptions;
        this.play = vi.fn(() => 7);
        this.pause = vi.fn();
        this.volume = vi.fn();
        this.unload = vi.fn();
        aHowls.push(this);
    })
}));

const { SoundSystem } = await import('../../../../src-recovered/libraries/O876/SoundSystem.js');

beforeEach(() => {
    aHowls.length = 0;
});

describe('SoundSystem', () => {
    it('valeurs initiales', () => {
        const s = new SoundSystem();
        assertDefaults(s, { oMusic: null, sMusicFile: '', bMute: false });
        expect(s.oSounds).toBeInstanceOf(Map);
        expect(s.oSounds.size).toBe(0);
    });

    it('deux instances ne partagent pas leurs sons', () => {
        assertNotShared(new SoundSystem(), new SoundSystem(), ['oSounds']);
    });

    it('getSound crée un Howl par fichier, une seule fois', () => {
        const s = new SoundSystem();
        const a = s.getSound('a.ogg');
        expect(s.getSound('a.ogg')).toBe(a);
        expect(a.oOptions).toEqual({ src: ['a.ogg'] });
        s.getSound('b.ogg');
        expect(aHowls).toHaveLength(2);
    });

    it('preload charge tous les fichiers', () => {
        const s = new SoundSystem();
        s.preload(['a.ogg', 'b.ogg', 'a.ogg']);
        expect([...s.oSounds.keys()]).toEqual(['a.ogg', 'b.ogg']);
    });

    it('play joue le son, avec le volume sur cette instance', () => {
        const s = new SoundSystem();
        s.play('a.ogg');
        const h = s.getSound('a.ogg');
        expect(h.play).toHaveBeenCalledTimes(1);
        expect(h.volume).not.toHaveBeenCalled();
        s.play('a.ogg', 0.5);
        expect(h.volume).toHaveBeenCalledWith(0.5, 7);
    });

    it('play ne joue rien en sourdine', () => {
        const s = new SoundSystem();
        s.mute();
        s.play('a.ogg');
        expect(aHowls).toHaveLength(0);
    });

    it('playMusic joue en boucle, et garde le même morceau', () => {
        const s = new SoundSystem();
        s.playMusic('m.ogg');
        const m = s.oMusic;
        expect(m.oOptions).toEqual({ src: ['m.ogg'], loop: true });
        expect(m.play).toHaveBeenCalledTimes(1);
        expect(s.sMusicFile).toBe('m.ogg');
        s.playMusic('m.ogg');
        expect(s.oMusic).toBe(m);
        expect(m.unload).not.toHaveBeenCalled();
    });

    it('playMusic remplace un autre morceau', () => {
        const s = new SoundSystem();
        s.playMusic('m.ogg');
        const m = s.oMusic;
        s.playMusic('n.ogg');
        expect(m.unload).toHaveBeenCalled();
        expect(s.oMusic).not.toBe(m);
        expect(s.sMusicFile).toBe('n.ogg');
    });

    it('playMusic en sourdine charge sans jouer', () => {
        const s = new SoundSystem();
        s.mute();
        s.playMusic('m.ogg');
        expect(s.oMusic.play).not.toHaveBeenCalled();
    });

    it('mute met la musique en pause, unmute la reprend, une seule fois', () => {
        const s = new SoundSystem();
        s.playMusic('m.ogg');
        const m = s.oMusic;
        s.mute();
        s.mute();
        expect(s.bMute).toBe(true);
        expect(m.pause).toHaveBeenCalledTimes(1);
        s.unmute();
        s.unmute();
        expect(s.bMute).toBe(false);
        expect(m.play).toHaveBeenCalledTimes(2);
    });

    it('mute et unmute sans musique', () => {
        const s = new SoundSystem();
        s.mute();
        expect(s.bMute).toBe(true);
        s.unmute();
        expect(s.bMute).toBe(false);
    });

    it('free décharge tout', () => {
        const s = new SoundSystem();
        s.preload(['a.ogg', 'b.ogg']);
        s.playMusic('m.ogg');
        const aAll = aHowls.slice();
        s.free();
        aAll.forEach((h) => expect(h.unload).toHaveBeenCalled());
        assertDefaults(s, { oMusic: null, sMusicFile: '' });
        expect(s.oSounds.size).toBe(0);
        s.playMusic('m.ogg');
        expect(s.oMusic.play).toHaveBeenCalled();
    });
});
