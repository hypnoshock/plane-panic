export class AudioSystem {
    private audioContext: AudioContext;
    private masterGainNode: GainNode;
    private musicGainNode: GainNode;
    private musicOscillator: OscillatorNode | null = null;
    private musicGain: GainNode | null = null;
    private musicFilter: BiquadFilterNode | null = null;
    private drumGainNode: GainNode;
    private isMusicPlaying: boolean = false;

    constructor() {
        this.audioContext = new AudioContext();
        this.masterGainNode = this.audioContext.createGain();
        this.musicGainNode = this.audioContext.createGain();
        this.drumGainNode = this.audioContext.createGain();
        this.masterGainNode.connect(this.audioContext.destination);
        this.musicGainNode.connect(this.masterGainNode);
        this.drumGainNode.connect(this.masterGainNode);
    }

    private playKick(time: number): void {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        // Configure kick drum sound
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(150, time);
        oscillator.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, time);
        filter.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);

        gainNode.gain.setValueAtTime(0.3, time);
        gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

        // Connect nodes
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.drumGainNode);

        // Start and stop
        oscillator.start(time);
        oscillator.stop(time + 0.5);

        // Cleanup
        oscillator.onended = () => {
            oscillator.disconnect();
            filter.disconnect();
            gainNode.disconnect();
        };
    }

    private playHiHat(time: number): void {
        const noise = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        // Generate white noise
        const bufferSize = this.audioContext.sampleRate * 0.1;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        noise.buffer = buffer;

        // Configure hi-hat sound
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(7000, time);
        filter.frequency.exponentialRampToValueAtTime(2000, time + 0.1);

        gainNode.gain.setValueAtTime(0.1, time);
        gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

        // Connect nodes
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.drumGainNode);

        // Start and stop
        noise.start(time);
        noise.stop(time + 0.1);

        // Cleanup
        noise.onended = () => {
            noise.disconnect();
            filter.disconnect();
            gainNode.disconnect();
        };
    }

    public playMusic(): void {
        if (this.isMusicPlaying) return;
        this.isMusicPlaying = true;

        // Create main oscillator for melody
        this.musicOscillator = this.audioContext.createOscillator();
        this.musicGain = this.audioContext.createGain();
        this.musicFilter = this.audioContext.createBiquadFilter();

        // Configure filter
        this.musicFilter.type = 'lowpass';
        this.musicFilter.frequency.setValueAtTime(2000, this.audioContext.currentTime);
        this.musicFilter.Q.setValueAtTime(1, this.audioContext.currentTime);

        // Configure gain
        this.musicGain.gain.setValueAtTime(0.2, this.audioContext.currentTime);

        // Connect nodes
        this.musicOscillator.connect(this.musicFilter);
        this.musicFilter.connect(this.musicGain);
        this.musicGain.connect(this.musicGainNode);

        // Define melody notes (in Hz)
        const melody = [
            220, 277.18, 329.63, 440,  // A3, C#4, E4, A4
            220, 277.18, 329.63, 440,  // A3, C#4, E4, A4
            246.94, 293.66, 349.23, 493.88,  // B3, D4, F4, B4
            246.94, 293.66, 349.23, 493.88,  // B3, D4, F4, B4
            220, 277.18, 329.63, 440,  // A3, C#4, E4, A4
            220, 277.18, 329.63, 440,  // A3, C#4, E4, A4
            246.94, 293.66, 349.23, 493.88,  // B3, D4, F4, B4
            246.94, 293.66, 349.23, 493.88   // B3, D4, F4, B4
        ];

        // Create a repeating melody
        let time = this.audioContext.currentTime;
        const noteDuration = 0.25; // Duration of each note in seconds
        const loopDuration = noteDuration * melody.length;

        const playNote = (noteIndex: number) => {
            if (!this.isMusicPlaying) return;

            const frequency = melody[noteIndex];
            this.musicOscillator!.frequency.setValueAtTime(frequency, time);
            
            // Add slight filter modulation for interest
            this.musicFilter!.frequency.setValueAtTime(2000, time);
            this.musicFilter!.frequency.exponentialRampToValueAtTime(1000, time + noteDuration);

            // Play drums
            // Kick on every first and third beat
            if (noteIndex % 4 === 0 || noteIndex % 4 === 2) {
                this.playKick(time);
            }
            // Hi-hat on every beat
            this.playHiHat(time);

            // Schedule next note
            time += noteDuration;
            if (noteIndex < melody.length - 1) {
                setTimeout(() => playNote(noteIndex + 1), noteDuration * 1000);
            } else {
                // Loop back to start
                setTimeout(() => playNote(0), noteDuration * 1000);
            }
        };

        // Start the melody
        this.musicOscillator.start(time);
        playNote(0);
    }

    public stopMusic(): void {
        if (!this.isMusicPlaying) return;
        this.isMusicPlaying = false;

        if (this.musicOscillator) {
            this.musicOscillator.stop(this.audioContext.currentTime);
            this.musicOscillator.disconnect();
            this.musicOscillator = null;
        }
        if (this.musicGain) {
            this.musicGain.disconnect();
            this.musicGain = null;
        }
        if (this.musicFilter) {
            this.musicFilter.disconnect();
            this.musicFilter = null;
        }
    }

    public playBullet(): void {
        // Create oscillator for the bullet sound
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        // Configure the sound
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime); // A5 note
        oscillator.frequency.exponentialRampToValueAtTime(440, this.audioContext.currentTime + 0.1); // A4 note

        // Configure the envelope
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGainNode);

        // Start and stop the sound
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);

        // Clean up nodes after they're done
        oscillator.onended = () => {
            oscillator.disconnect();
            gainNode.disconnect();
        };
    }

    public playExplosion(): void {
        const now = this.audioContext.currentTime;
        const duration = 0.5; // Duration of the explosion sound

        // Create noise generator
        const noise = this.audioContext.createBufferSource();
        const noiseGain = this.audioContext.createGain();
        const noiseFilter = this.audioContext.createBiquadFilter();
        
        // Generate white noise
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        noise.buffer = buffer;

        // Configure noise filter
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(1000, now);
        noiseFilter.frequency.exponentialRampToValueAtTime(100, now + duration);
        noiseFilter.Q.setValueAtTime(1, now);

        // Configure noise envelope
        noiseGain.gain.setValueAtTime(0, now);
        noiseGain.gain.linearRampToValueAtTime(0.5, now + 0.01);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

        // Create low frequency oscillator for rumble
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(20, now);
        lfo.frequency.exponentialRampToValueAtTime(5, now + duration);
        lfoGain.gain.setValueAtTime(0.3, now);
        lfoGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

        // Connect nodes
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.masterGainNode);
        lfo.connect(lfoGain);
        lfoGain.connect(this.masterGainNode);

        // Start and stop sounds
        noise.start(now);
        noise.stop(now + duration);
        lfo.start(now);
        lfo.stop(now + duration);

        // Clean up nodes after they're done
        noise.onended = () => {
            noise.disconnect();
            noiseFilter.disconnect();
            noiseGain.disconnect();
        };
        lfo.onended = () => {
            lfo.disconnect();
            lfoGain.disconnect();
        };
    }

    public cleanup(): void {
        this.stopMusic();
        this.audioContext.close();
    }
} 