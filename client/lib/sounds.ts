'use client';

class SoundSystem {
    private ctx: AudioContext | null = null;
    private enabled: boolean = true;

    private init() {
        if (!this.ctx && typeof window !== 'undefined') {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    }

    setEnabled(enabled: boolean) {
        this.enabled = enabled;
    }

    private playTone(freq: number, type: OscillatorType, duration: number, volume: number) {
        this.init();
        if (!this.enabled || !this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playEat() {
        this.playTone(523.25, 'sine', 0.1, 0.1); // C5
    }

    playSpecialEat() {
        this.playTone(659.25, 'sine', 0.1, 0.1); // E5
        setTimeout(() => this.playTone(830.61, 'sine', 0.1, 0.1), 50); // G#5
    }

    playGameOver() {
        this.playTone(261.63, 'sawtooth', 0.5, 0.1); // C4
        setTimeout(() => this.playTone(196.00, 'sawtooth', 0.5, 0.1), 100); // G3
    }
}

export const sounds = new SoundSystem();
