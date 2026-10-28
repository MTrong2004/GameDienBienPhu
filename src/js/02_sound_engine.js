        /* ============================================================================
           2. WEB AUDIO SYNTHESIS ENGINE (RADAR PING, SAM-2 ROAR & B-52 DETONATION)
           ============================================================================ */
        const SoundEngine = {
            ctx: null,
            enabled: true,
            lastLockPing: 0,

            init() {
                if (!this.ctx) {
                    const AudioCtx = (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) ||
                                     (typeof AudioContext !== 'undefined' ? AudioContext : null);
                    if (AudioCtx) {
                        try {
                            this.ctx = new AudioCtx();
                        } catch(e) {}
                    }
                }
                if (this.ctx && this.ctx.state === 'suspended') {
                    try { this.ctx.resume().catch(() => {}); } catch(e){}
                }
                return this.ctx;
            },

            unlock() {
                this.init();
                if (this.ctx && this.ctx.state === 'suspended') {
                    try {
                        this.ctx.resume().catch(() => {});
                    } catch(e){}
                }
                return this.ctx;
            },

            playLaunch(isMiG) {
                if (!this.enabled) return;
                this.init();
                if (!this.ctx) return;
                const now = this.ctx.currentTime;

                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = isMiG ? 'triangle' : 'sine';
                osc.frequency.setValueAtTime(isMiG ? 320 : 145, now);
                osc.frequency.exponentialRampToValueAtTime(34, now + 0.38);
                gain.gain.setValueAtTime(0.35, now);
                gain.gain.exponentialRampToValueAtTime(0.005, now + 0.4);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.42);

                const bufLen = Math.floor(this.ctx.sampleRate * 0.85);
                const buf = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
                const data = buf.getChannelData(0);
                for (let i = 0; i < bufLen; i++) {
                    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.36));
                }
                const noise = this.ctx.createBufferSource();
                noise.buffer = buf;
                const filter = this.ctx.createBiquadFilter();
                filter.type = 'bandpass';
                filter.frequency.value = isMiG ? 1200 : 640;
                const nGain = this.ctx.createGain();
                nGain.gain.setValueAtTime(0.28, now);
                nGain.gain.exponentialRampToValueAtTime(0.008, now + 0.82);
                noise.connect(filter);
                filter.connect(nGain);
                nGain.connect(this.ctx.destination);
                noise.start(now);
            },

            playExplosion() {
                if (!this.enabled) return;
                this.init();
                if (!this.ctx) return;
                const now = this.ctx.currentTime;

                const sub = this.ctx.createOscillator();
                const sGain = this.ctx.createGain();
                sub.type = 'sine';
                sub.frequency.setValueAtTime(92, now);
                sub.frequency.exponentialRampToValueAtTime(22, now + 1.1);
                sGain.gain.setValueAtTime(0.45, now);
                sGain.gain.exponentialRampToValueAtTime(0.005, now + 1.15);
                sub.connect(sGain);
                sGain.connect(this.ctx.destination);
                sub.start(now);
                sub.stop(now + 1.2);
            },

            playLockBeep() {
                if (!this.enabled) return;
                const t = performance.now();
                if (t - this.lastLockPing < 480) return;
                this.lastLockPing = t;
                this.init();
                if (!this.ctx) return;
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const g = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1480, now);
                g.gain.setValueAtTime(0.045, now);
                g.gain.exponentialRampToValueAtTime(0.001, now + 0.075);
                osc.connect(g);
                g.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.08);
            }
        };

        // Ponytail: Global user interaction listener to transparently unlock AudioContext on first gesture
        if (typeof window !== 'undefined') {
            window.SoundEngine = SoundEngine;
            const _unlockAudio = () => {
                if (typeof SoundEngine !== 'undefined') SoundEngine.unlock();
            };
            ['click', 'keydown', 'pointerdown', 'touchstart', 'mousedown'].forEach(ev => {
                window.addEventListener(ev, _unlockAudio, { passive: true });
            });
            if (typeof document !== 'undefined') {
                ['click', 'keydown', 'pointerdown', 'touchstart', 'mousedown'].forEach(ev => {
                    document.addEventListener(ev, _unlockAudio, { passive: true });
                });
            }
        }

