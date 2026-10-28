        /* ============================================================================
           16. SOUND DESIGN — everything synthesized with Web Audio
           Continuous layers (rain, city rumble, jamming static, B-52 drone, MiG turbine,
           missile rush, tracking tone) are mixed every frame in SoundFX.update();
           one-shots go through the same bus with a compressor and a synthetic reverb.
           Distant explosions arrive late and muffled, like real sound over kilometres.
           ============================================================================ */
        const SoundFX = {
            ready: false, L: {}, prevLightning: 0,
            masterGain: null, sfxGain: null, sirenNodes: [],

            init() {
                const ctx = SoundEngine.init();
                if (ctx && !this.ready) this.setup(ctx);
                return ctx;
            },
            resumeAudio() {
                SoundEngine.unlock();
                return SoundEngine.ctx;
            },
            toggleMute() {
                if (!this.masterGain) {
                    this.masterGain = { gain: { value: 0.8 } };
                    this.master = this.masterGain;
                }
                const target = this.masterGain;
                if (this.muted) {
                    target.gain.value = (this.prevVolume !== undefined) ? this.prevVolume : 0.8;
                    this.muted = false;
                } else {
                    this.prevVolume = target.gain.value;
                    target.gain.value = 0;
                    this.muted = true;
                }
                return this.muted;
            },
            setMasterVolume(val) {
                const v = Math.max(0, Math.min(1, Number(val) !== undefined && !isNaN(val) ? Number(val) : 0.8));
                if (!this.masterGain) {
                    this.masterGain = { gain: { value: v } };
                    this.master = this.masterGain;
                } else {
                    if (this.master) this.master.gain.value = v;
                    if (this.masterGain) this.masterGain.gain.value = v;
                }
                return v;
            },
            setSFXVolume(val) { return this.setSfxVolume(val); },
            setSfxVolume(val) {
                const v = Math.max(0, Math.min(1, Number(val) !== undefined && !isNaN(val) ? Number(val) : 0.8));
                if (!this.sfxGain) {
                    this.sfxGain = { gain: { value: v } };
                    this.bus = this.sfxGain;
                } else {
                    if (this.bus) this.bus.gain.value = v;
                    if (this.sfxGain) this.sfxGain.gain.value = v;
                }
                return v;
            },
            setVoiceVolume(val) {
                const v = Math.max(0, Math.min(1, Number(val) !== undefined && !isNaN(val) ? Number(val) : 0.8));
                return v;
            },

            ensure() {
                const ctx = SoundEngine.ctx;
                if (!ctx || !SoundEngine.enabled) return false;
                if (!this.ready) this.setup(ctx);
                return true;
            },

            setup(ctx) {
                const comp = ctx.createDynamicsCompressor();
                comp.threshold.value = -16;
                comp.ratio.value = 4;
                comp.attack.value = 0.004;
                comp.release.value = 0.3;
                this.master = ctx.createGain();
                this.master.gain.value = 0.9;
                this.masterGain = this.master;
                this.master.connect(comp);
                comp.connect(ctx.destination);
                this.bus = ctx.createGain();
                this.sfxGain = this.bus;
                this.bus.connect(this.master);
                this.reverb = ctx.createConvolver();
                this.reverb.buffer = this.makeImpulse(ctx, 3.4, 2.4);
                this.reverbSend = ctx.createGain();
                this.reverbSend.gain.value = 0.4;
                this.reverbSend.connect(this.reverb);
                this.reverb.connect(this.master);
                this.white = this.makeNoise(ctx, 'white');
                this.brown = this.makeNoise(ctx, 'brown');

                const L = this.L;
                L.rain = this.layer(this.loop(this.white), [this.filter('highpass', 1400), this.filter('lowpass', 7000)]);
                L.rumble = this.layer(this.loop(this.brown), [this.filter('lowpass', 120)], 0.3);
                L.jam = this.layer(this.loop(this.white), [this.filter('bandpass', 2600, 0.7)]);
                const d1 = this.osc('sawtooth', 52), d2 = this.osc('sawtooth', 55.3);
                L.drone = this.layer(d1, [this.filter('lowpass', 240)], 0.2);
                d2.connect(L.drone.f);
                L.drone.oscs = [d1, d2];
                const tb = this.osc('sawtooth', 800);
                L.turbine = this.layer(tb, [this.filter('bandpass', 1500, 2)]);
                L.turbine.osc = tb;
                L.burner = this.layer(this.loop(this.brown), [this.filter('lowpass', 700)]);
                L.rush = this.layer(this.loop(this.white), [this.filter('bandpass', 700, 1.2)]);
                const tr = this.osc('sine', 900);
                L.track = this.layer(tr, []);
                L.track.osc = tr;
                this.ready = true;
            },

            // ---- building blocks ----
            makeNoise(ctx, kind) {
                const n = ctx.sampleRate * 2, buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
                let last = 0;
                for (let i = 0; i < n; i++) {
                    const w = Math.random() * 2 - 1;
                    if (kind === 'brown') { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
                    else d[i] = w;
                }
                return buf;
            },
            makeImpulse(ctx, secs, decay) {
                const n = Math.floor(ctx.sampleRate * secs), buf = ctx.createBuffer(2, n, ctx.sampleRate);
                for (let c = 0; c < 2; c++) {
                    const d = buf.getChannelData(c);
                    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay);
                }
                return buf;
            },
            loop(buf) {
                const s = SoundEngine.ctx.createBufferSource();
                s.buffer = buf;
                s.loop = true;
                s.loopStart = Math.random();
                s.start();
                return s;
            },
            osc(type, freq) {
                const o = SoundEngine.ctx.createOscillator();
                o.type = type;
                o.frequency.value = freq;
                o.start();
                return o;
            },
            filter(type, freq, Q = 0.7) {
                const f = SoundEngine.ctx.createBiquadFilter();
                f.type = type;
                f.frequency.value = freq;
                f.Q.value = Q;
                return f;
            },
            out(node, wet = 0) {
                node.connect(this.bus);
                if (wet) {
                    const g = SoundEngine.ctx.createGain();
                    g.gain.value = wet;
                    node.connect(g);
                    g.connect(this.reverbSend);
                }
            },
            layer(src, filters, wet = 0) {
                const g = SoundEngine.ctx.createGain();
                g.gain.value = 0;
                let node = src;
                filters.forEach(f => { node.connect(f); node = f; });
                node.connect(g);
                this.out(g, wet);
                return { g, f: filters[0] || g };
            },
            // one-shot filtered noise with an attack / hold / release envelope
            burst(o) {
                const ctx = SoundEngine.ctx;
                const t0 = o.t0 || ctx.currentTime;
                const src = ctx.createBufferSource();
                src.buffer = o.brown ? this.brown : this.white;
                src.loopStart = Math.random();
                src.loop = true;
                const f = this.filter(o.type || 'lowpass', o.freq || 1000, o.Q || 0.7);
                const g = ctx.createGain();
                const a = o.a || 0.01, hold = o.hold || 0, rel = o.rel || 0.3, peak = Math.max(0.0002, o.peak || 0.3);
                if (o.freqEnd) f.frequency.exponentialRampToValueAtTime(o.freqEnd, t0 + a + hold + rel);
                g.gain.setValueAtTime(0.0001, t0);
                g.gain.exponentialRampToValueAtTime(peak, t0 + a);
                g.gain.setValueAtTime(peak, t0 + a + hold);
                g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + hold + rel);
                src.connect(f);
                f.connect(g);
                this.out(g, o.wet || 0);
                src.start(t0);
                src.stop(t0 + a + hold + rel + 0.05);
            },
            tone(o) {
                const ctx = SoundEngine.ctx;
                const t0 = o.t0 || ctx.currentTime;
                const osc = ctx.createOscillator(), g = ctx.createGain();
                osc.type = o.type || 'sine';
                osc.frequency.setValueAtTime(o.freq, t0);
                if (o.freqEnd) osc.frequency.exponentialRampToValueAtTime(o.freqEnd, t0 + (o.dur || 0.3));
                g.gain.setValueAtTime(0.0001, t0);
                g.gain.exponentialRampToValueAtTime(o.peak || 0.2, t0 + (o.a || 0.01));
                g.gain.exponentialRampToValueAtTime(0.0001, t0 + (o.dur || 0.3));
                osc.connect(g);
                this.out(g, o.wet || 0);
                osc.start(t0);
                osc.stop(t0 + (o.dur || 0.3) + 0.05);
            },

            // ---- per-frame mix ----
            update() {
                const ctx = SoundEngine.ctx;
                if (!ctx || !this.ready) { if (ctx && SoundEngine.enabled) this.setup(ctx); return; }
                const t = ctx.currentTime, L = this.L;
                const set = (layer, v, tc = 0.2) => layer.g.gain.setTargetAtTime(v, t, tc);
                const live = SoundEngine.enabled && !gamePaused;
                this.master.gain.setTargetAtTime(live ? 0.9 : 0, t, 0.05);
                const world = currentMode !== 'HANGAR';
                const air = currentMode === 'MIG21' && (gameState === 'PLAYING' || gameState === 'ENDING');
                const missileView = !!guidedMissile && guidedMissile.t > 0.7;

                set(L.rain, world && !air ? (missileView ? 0.03 : 0.09) : 0);
                set(L.rumble, world && !air ? 0.22 : air ? 0.08 : 0);

                // jamming hiss in the operator's headphones, crackling with the noise level
                const jamOn = currentMode === 'SAM2' && gameState === 'PLAYING' && activeMission && activeMission.jam;
                set(L.jam, jamOn ? jammingLevel * (0.05 + Math.random() * 0.05) : 0, 0.03);
                if (jamOn) L.jam.f.frequency.setTargetAtTime(1800 + Math.random() * 1600, t, 0.05);

                // B-52 engines: loudest bomber near the camera
                let near = Infinity;
                activeBombers.forEach(b => { near = Math.min(near, b.mesh.position.distanceTo(camera.position)); });
                const droneV = world ? Math.pow(Math.max(0, 1 - near / (air ? 500 : 900)), 2) * (air ? 0.35 : 0.22) : 0;
                set(L.drone, droneV, 0.4);

                // MiG-21: R-25 turbine whine follows the throttle, afterburner roar above 85 %
                set(L.turbine, air ? 0.035 + mig.throttle * 0.04 : 0);
                if (air) L.turbine.osc.frequency.setTargetAtTime(650 + mig.throttle * 650, t, 0.3);
                set(L.burner, air ? (mig.throttle > 0.85 ? 0.32 : 0.1 + mig.throttle * 0.08) : 0);

                // missile rush in the follow camera
                set(L.rush, missileView ? 0.12 + Math.min(0.12, guidedMissile.speed / 600) : 0, 0.1);
                if (missileView) L.rush.f.frequency.setTargetAtTime(400 + guidedMissile.speed * 9, t, 0.2);

                // SNR-75 tracking tone: pulses faster as the track firms up, steady when locked
                const tracking = currentMode === 'SAM2' && gameState === 'PLAYING' && !guidedMissile && trackTimer > 0;
                if (tracking) {
                    const prog = Math.min(1, trackTimer / TRACK_TIME);
                    const locked = prog >= 1;
                    L.track.osc.frequency.setTargetAtTime(locked ? 1250 : 520 + prog * 600, t, 0.02);
                    const on = locked || (t * (3 + prog * 9)) % 1 < 0.5;
                    set(L.track, on ? (locked ? 0.025 : 0.035) : 0, 0.008);
                } else {
                    set(L.track, 0, 0.02);
                }

                // thunder follows lightning after a short delay
                if (lightningLevel > this.prevLightning + 0.3 && world && !air) this.thunder();
                this.prevLightning = lightningLevel;
            },

            // ---- one-shots ----
            launch(isMiG) {
                if (!this.ensure()) return;
                const t = SoundEngine.ctx.currentTime;
                if (isMiG) {
                    this.tone({ t0: t, freq: 240, freqEnd: 75, peak: 0.5, a: 0.003, dur: 0.4 });
                    this.burst({ type: 'lowpass', freq: 5200, freqEnd: 1100, peak: 0.5, a: 0.01, hold: 0.35, rel: 1.1, wet: 0.25 });
                    this.burst({ type: 'highpass', freq: 2800, peak: 0.25, a: 0.005, hold: 0.15, rel: 0.5 });
                    return;
                }
                // V-750 booster: blast, roar that fades as it climbs away, crackle, sub thump
                this.tone({ freq: 85, freqEnd: 24, peak: 0.95, a: 0.003, dur: 1.5, wet: 0.4 });
                this.burst({ type: 'lowpass', freq: 2800, freqEnd: 320, peak: 0.9, a: 0.02, hold: 1.8, rel: 2.8, wet: 0.55 });
                this.burst({ type: 'highpass', freq: 3000, peak: 0.28, a: 0.01, hold: 1.4, rel: 1.2, wet: 0.35 });
                this.burst({ t0: t + 0.04, brown: true, type: 'lowpass', freq: 320, peak: 0.65, a: 0.01, hold: 0.8, rel: 2.4, wet: 0.65 });
            },

            boom(pos, big) {
                if (!this.ensure()) return;
                const d = pos && typeof pos.distanceTo === 'function' ? pos.distanceTo(camera.position) : 300;
                const t0 = SoundEngine.ctx.currentTime + Math.min(2.2, d * 0.0025);   // sound arrives after the flash
                const vol = (big ? 1.05 : 0.65) / (1 + d / 500);
                const cutoff = Math.max(260, 9000 / (1 + d / 120));                   // air absorbs the highs
                this.tone({ t0, freq: big ? 90 : 80, freqEnd: 22, peak: vol * 0.95, a: 0.004, dur: big ? 2.2 : 1.2, wet: 0.5 });
                this.burst({ t0, type: 'lowpass', freq: cutoff, freqEnd: cutoff * 0.12, peak: vol, a: 0.004, hold: 0.15, rel: big ? 3.2 : 1.6, wet: 0.85 });
                if (big) {
                    for (let k = 0; k < 10; k++) {
                        this.burst({ t0: t0 + 0.18 + Math.random() * 1.8, type: 'bandpass', freq: 550 + Math.random() * 1900, Q: 2, peak: vol * 0.25, a: 0.003, hold: 0.02, rel: 0.3, wet: 0.6 });
                    }
                    this.burst({ t0: t0 + 0.3, brown: true, type: 'lowpass', freq: 180, peak: vol * 0.5, a: 0.1, hold: 1.0, rel: 2.8, wet: 0.7 });
                }
            },

            carpet(onImpactCallback) {
                // a cell's bombs walking across a distant target
                if (!this.ensure()) return;
                const t = SoundEngine.ctx.currentTime;
                for (let k = 0; k < 18; k++) {
                    const delay = 0.8 + k * 0.17 + Math.random() * 0.1;
                    const t0 = t + delay;
                    this.burst({ t0, brown: true, type: 'lowpass', freq: 240, peak: 0.28 + Math.random() * 0.2, a: 0.01, hold: 0.05, rel: 1.0, wet: 0.8 });
                    this.tone({ t0, freq: 52, freqEnd: 28, peak: 0.28, a: 0.005, dur: 0.6 });
                    if (typeof onImpactCallback === 'function') {
                        setTimeout(() => {
                            try { onImpactCallback(k); } catch(e) {}
                        }, Math.max(0, delay * 1000));
                    }
                }
                if (typeof onImpactCallback === 'function') {
                    try { onImpactCallback(0); } catch(e) {}
                }
            },

            siren(active = true) {
                if (active === false) {
                    if (this.sirenNodes && this.sirenNodes.length) {
                        const ctx = SoundEngine.ctx;
                        const t = ctx ? ctx.currentTime : 0;
                        this.sirenNodes.forEach(n => {
                            try {
                                if (n.g && n.g.gain) n.g.gain.setTargetAtTime(0, t, 0.5);
                                if (n.o && n.o.frequency) n.o.frequency.setTargetAtTime(80, t, 0.6);
                                setTimeout(() => { try { n.o.stop(); n.o.disconnect(); } catch(e){} }, 700);
                            } catch(e) {}
                        });
                        this.sirenNodes = [];
                    }
                    return;
                }
                // air-raid siren over the city, two units slightly out of tune
                if (!this.ensure()) return;
                const ctx = SoundEngine.ctx, t = ctx.currentTime;
                const g = ctx.createGain(), lp = this.filter('lowpass', 1500);
                g.gain.setValueAtTime(0.0001, t);
                g.gain.exponentialRampToValueAtTime(0.08, t + 1.2);
                g.gain.setValueAtTime(0.08, t + 8);
                g.gain.exponentialRampToValueAtTime(0.0001, t + 10.5);
                lp.connect(g);
                this.out(g, 0.9);
                this.sirenNodes = [];
                [1, 1.012].forEach(k => {
                    const o = ctx.createOscillator();
                    o.type = 'sawtooth';
                    const f = o.frequency;
                    f.setValueAtTime(200 * k, t);
                    f.linearRampToValueAtTime(620 * k, t + 2.6);
                    f.setValueAtTime(620 * k, t + 4.2);
                    f.linearRampToValueAtTime(300 * k, t + 6.4);
                    f.linearRampToValueAtTime(620 * k, t + 8.4);
                    f.linearRampToValueAtTime(180 * k, t + 10.5);
                    o.connect(lp);
                    o.start(t);
                    o.stop(t + 10.6);
                    this.sirenNodes.push({ o, g });
                });
            },

            radio(isEnd = false) {
                // press-to-talk squelch + click
                if (!this.ensure()) return;
                const t = SoundEngine.ctx.currentTime;
                if (isEnd) {
                    this.burst({ t0: t, type: 'bandpass', freq: 1600, Q: 1.6, peak: 0.08, a: 0.002, hold: 0.05, rel: 0.06 });
                    this.tone({ t0: t + 0.04, type: 'square', freq: 440, peak: 0.02, a: 0.002, dur: 0.02 });
                } else {
                    this.tone({ t0: t, type: 'sine', freq: 1480, freqEnd: 1850, peak: 0.04, a: 0.002, dur: 0.035 });
                    this.burst({ t0: t + 0.03, type: 'bandpass', freq: 2100, Q: 1.4, peak: 0.07, a: 0.003, hold: 0.04, rel: 0.05 });
                }
            },

            metal(t0, freq, peak) {
                this.burst({ t0, type: 'bandpass', freq, Q: 16, peak, a: 0.001, hold: 0.02, rel: 0.4, wet: 0.3 });
            },
            reloadStart() {
                if (!this.ensure()) return;
                const t = SoundEngine.ctx.currentTime;
                this.metal(t + 0.05, 430, 0.5);
                this.metal(t + 0.45, 820, 0.35);
                this.metal(t + 1.0, 560, 0.45);
                this.tone({ t0: t + 0.3, type: 'sawtooth', freq: 95, freqEnd: 150, peak: 0.04, a: 0.3, dur: 2.4 });   // hydraulics
            },
            reloadDone() {
                if (!this.ensure()) return;
                const t = SoundEngine.ctx.currentTime;
                this.burst({ brown: true, type: 'lowpass', freq: 320, peak: 0.45, a: 0.003, hold: 0.04, rel: 0.4 });
                this.metal(t + 0.02, 640, 0.4);
                this.burst({ t0: t + 0.15, type: 'highpass', freq: 3500, peak: 0.08, a: 0.02, hold: 0.1, rel: 0.3 });
            },

            aaa(dist, heavy) {
                if (!this.ensure()) return;
                // sound reaches the battery late and muffled from far guns
                const t = SoundEngine.ctx.currentTime + Math.min(1.4, dist * 0.004), v = (heavy ? 0.5 : 0.32) / (1 + dist / 90);
                if (heavy) {
                    this.burst({ t0: t, brown: true, type: 'lowpass', freq: 220, freqEnd: 70, peak: v, a: 0.004, hold: 0.05, rel: 1.1, wet: 0.6 });
                    this.burst({ t0: t + 0.45, brown: true, type: 'lowpass', freq: 200, freqEnd: 70, peak: v * 0.8, a: 0.004, hold: 0.05, rel: 1.0, wet: 0.6 });
                } else {
                    const n = 5 + Math.floor(Math.random() * 4);
                    for (let k = 0; k < n; k++) {
                        this.burst({ t0: t + k * 0.09, brown: true, type: 'bandpass', freq: 240 + Math.random() * 60, Q: 0.9, peak: v, a: 0.002, hold: 0.02, rel: 0.22, wet: 0.45 });
                    }
                }
            },

            gunBurst(dist) {
                if (!this.ensure()) return;
                const t = SoundEngine.ctx.currentTime, v = 0.3 / (1 + dist / 80);
                for (let k = 0; k < 9; k++) {
                    this.burst({ t0: t + k * 0.055, type: 'bandpass', freq: 900, Q: 1, peak: v, a: 0.001, hold: 0.01, rel: 0.06 });
                }
            },

            thunder() {
                if (!this.ensure()) return;
                const t0 = SoundEngine.ctx.currentTime + 0.4 + Math.random() * 2;
                this.burst({ t0, brown: true, type: 'lowpass', freq: 420, freqEnd: 110, peak: 0.55, a: 0.25, hold: 0.7, rel: 3.6, wet: 0.7 });
                if (Math.random() < 0.4) this.burst({ t0, type: 'lowpass', freq: 3200, peak: 0.18, a: 0.005, hold: 0.05, rel: 0.5, wet: 0.5 });
            },

            click() {
                SoundEngine.init();
                if (!this.ensure()) return;
                const ctx = SoundEngine.ctx, t = ctx.currentTime;
                this.burst({ t0: t, type: 'bandpass', freq: 2400, Q: 3, peak: 0.1, a: 0.001, hold: 0.01, rel: 0.03 });
                this.tone({ t0: t, type: 'triangle', freq: 880, freqEnd: 440, peak: 0.05, a: 0.002, dur: 0.04 });
            },

            fanfare() {
                SoundEngine.init();
                if (!this.ensure()) return;
                const ctx = SoundEngine.ctx, t = ctx.currentTime;
                // Heroic military brass fanfare celebrating B-52 kill!
                const notes = [
                    { f: 293.66, d: 0.22, v: 0.25 }, // D4
                    { f: 369.99, d: 0.22, v: 0.25 }, // F#4
                    { f: 440.00, d: 0.25, v: 0.28 }, // A4
                    { f: 587.33, d: 1.1,  v: 0.35 }  // D5 (High triumphant ring!)
                ];
                notes.forEach((n, idx) => {
                    const t0 = t + idx * 0.14;
                    const osc1 = ctx.createOscillator();
                    const osc2 = ctx.createOscillator();
                    const f = this.filter('lowpass', 2400, 2.5);
                    const g = ctx.createGain();
                    osc1.type = 'sawtooth';
                    osc2.type = 'sawtooth';
                    osc1.frequency.setValueAtTime(n.f, t0);
                    osc2.frequency.setValueAtTime(n.f * 1.005, t0);
                    f.frequency.setValueAtTime(600, t0);
                    f.frequency.exponentialRampToValueAtTime(3200, t0 + 0.04);
                    f.frequency.exponentialRampToValueAtTime(1400, t0 + n.d);
                    g.gain.setValueAtTime(0.001, t0);
                    g.gain.exponentialRampToValueAtTime(n.v, t0 + 0.03);
                    g.gain.exponentialRampToValueAtTime(0.0001, t0 + n.d);
                    osc1.connect(f);
                    osc2.connect(f);
                    f.connect(g);
                    this.out(g, 0.45);
                    osc1.start(t0);
                    osc2.start(t0);
                    osc1.stop(t0 + n.d + 0.05);
                    osc2.stop(t0 + n.d + 0.05);
                });
                this.tone({ t0: t + 0.42, freq: 74, freqEnd: 28, peak: 0.4, a: 0.005, dur: 0.9, wet: 0.4 });
            },

            alertChime() {
                SoundEngine.init();
                if (!this.ensure()) return;
                const ctx = SoundEngine.ctx, t = ctx.currentTime;
                [440, 554.37, 659.25, 880].forEach((freq, idx) => {
                    this.tone({ t0: t + idx * 0.08, type: 'sine', freq, peak: 0.18, a: 0.01, dur: 0.35, wet: 0.3 });
                });
            }
        };

        SoundEngine.playLaunch = function (isMiG) { this.init(); SoundFX.launch(isMiG); };
        SoundEngine.playExplosion = function (pos, big) { this.init(); SoundFX.boom(pos, big); };

        /* ============================================================================
           CINEMATIC MILITARY BGM ENGINE (PROCEDURAL WEB AUDIO ORCHESTRA)
           Nhạc nền hành khúc / hào hùng tự tổng hợp bằng sóng âm, 100% offline, mượt mà
           ============================================================================ */
        const MusicSystem = {
            enabled: true,
            volume: 0.35,
            ctx: null,
            masterGain: null,
            timer: null,
            step: 0,
            phrase: 0,
            theme: 'MENU', // 'MENU' | 'PLAYING' | 'VICTORY'
            chordNodes: [],

            init() {
                if (this.masterGain && this.ctx) {
                    if (this.ctx.state === 'suspended') {
                        try { this.ctx.resume().catch(() => {}); } catch(e){}
                    }
                    return;
                }
                const ctx = SoundEngine.ctx;
                if (!ctx) return;
                this.ctx = ctx;
                this.masterGain = ctx.createGain();
                try {
                    const saved = localStorage.getItem('game_bgm_enabled');
                    if (saved !== null) this.enabled = saved === '1';
                } catch(e){}
                this.masterGain.gain.setValueAtTime(this.enabled ? this.volume : 0, ctx.currentTime);
                this.masterGain.connect(ctx.destination);
                this.startLoop();
                this.updateUI();
            },

            setTheme(newTheme) {
                if (this.theme === newTheme) return;
                this.theme = newTheme;
                this.step = 0;
                this.phrase = 0;
                this.updateChord();
            },

            toggle() {
                SoundEngine.unlock();
                this.enabled = !this.enabled;
                if (this.masterGain && this.ctx) {
                    const t = this.ctx.currentTime;
                    this.masterGain.gain.setTargetAtTime(this.enabled ? this.volume : 0, t, 0.05);
                }
                this.updateUI();
                try { localStorage.setItem('game_bgm_enabled', this.enabled ? '1' : '0'); } catch(e){}
                if (this.enabled && this.chordNodes.length === 0) this.updateChord();
            },

            updateUI() {
                if (typeof document === 'undefined') return;
                const btns = document.querySelectorAll('.btn-toggle-bgm');
                btns.forEach(btn => {
                    btn.innerHTML = `<span>🎵</span> Nhạc: ${this.enabled ? 'BẬT' : 'TẮT'}<kbd>B</kbd>`;
                    btn.classList.toggle('text-emerald-300', this.enabled);
                    btn.classList.toggle('text-zinc-500', !this.enabled);
                });
            },

            startLoop() {
                const clrInt = typeof clearInterval !== 'undefined' ? clearInterval : (typeof window !== 'undefined' && window.clearInterval ? window.clearInterval : null);
                const setInt = typeof setInterval !== 'undefined' ? setInterval : (typeof window !== 'undefined' && window.setInterval ? window.setInterval : null);
                if (this.timer && clrInt) clrInt(this.timer);
                this.step = 0;
                this.phrase = 0;
                if (setInt) {
                    this.timer = setInt(() => {
                        if (!this.enabled || !this.ctx || this.ctx.state !== 'running') return;
                        this.tick();
                    }, 125);
                }
                this.updateChord();
            },

            updateChord() {
                if (!this.ctx || !this.masterGain) return;
                const t = this.ctx.currentTime;

                this.chordNodes.forEach(n => {
                    try {
                        n.gain.gain.setTargetAtTime(0, t, 0.4);
                        setTimeout(() => { try { n.osc.stop(); n.osc.disconnect(); }catch(e){} }, 500);
                    } catch(e){}
                });
                this.chordNodes = [];

                if (!this.enabled) return;

                let freqs = [];
                if (this.theme === 'VICTORY') {
                    // D major tráng lệ khải hoàn: D3, F#3, A3, D4
                    freqs = [146.83, 185.00, 220.00, 293.66];
                } else if (this.theme === 'PLAYING') {
                    // D minor hành khúc chiến đấu khẩn trương: D2 (trầm), D3, F3, A3
                    freqs = [73.42, 146.83, 174.61, 220.00];
                } else {
                    // MENU / BRIEFING: D minor trầm hùng, bi tráng: D2, A2, D3, F3
                    freqs = [73.42, 110.00, 146.83, 174.61];
                }

                freqs.forEach((freq, idx) => {
                    const osc = this.ctx.createOscillator();
                    const filter = this.ctx.createBiquadFilter();
                    const gain = this.ctx.createGain();

                    osc.type = idx === 0 ? 'sine' : 'sawtooth';
                    osc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 0.6, t);

                    filter.type = 'lowpass';
                    filter.frequency.setValueAtTime(this.theme === 'PLAYING' ? 420 : 280, t);
                    filter.Q.value = 1.6;

                    const targetGain = (idx === 0 ? 0.32 : 0.1) * (this.theme === 'PLAYING' ? 1.15 : 0.85);
                    gain.gain.setValueAtTime(0.001, t);
                    gain.gain.setTargetAtTime(targetGain, t + 0.1, 0.7);

                    osc.connect(filter);
                    filter.connect(gain);
                    gain.connect(this.masterGain);

                    osc.start(t);
                    this.chordNodes.push({ osc, gain });
                });
            },

            // Dàn kèn đồng quân đội hào sảng (French Horn / Trumpet military fanfares)
            playBrass(t, freq, dur = 0.35, vol = 0.28) {
                if (!this.ctx || !this.masterGain) return;
                const osc1 = this.ctx.createOscillator();
                const osc2 = this.ctx.createOscillator();
                const filter = this.ctx.createBiquadFilter();
                const gain = this.ctx.createGain();

                osc1.type = 'sawtooth';
                osc2.type = 'sawtooth';
                osc1.frequency.setValueAtTime(freq, t);
                osc2.frequency.setValueAtTime(freq * 1.006, t); // rich detuned brass unison

                filter.type = 'lowpass';
                filter.Q.value = 2.8;
                // Brass attack envelope: crisp brass bite opening up to 2800Hz then settling to warm body
                filter.frequency.setValueAtTime(380, t);
                filter.frequency.exponentialRampToValueAtTime(Math.min(3200, freq * 7), t + 0.035);
                filter.frequency.exponentialRampToValueAtTime(Math.min(1800, freq * 4), t + dur * 0.5);
                filter.frequency.exponentialRampToValueAtTime(280, t + dur + 0.08);

                gain.gain.setValueAtTime(0.001, t);
                gain.gain.exponentialRampToValueAtTime(vol * 0.38, t + 0.02);
                gain.gain.setValueAtTime(vol * 0.34, t + dur * 0.6);
                gain.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.08);

                osc1.connect(filter);
                osc2.connect(filter);
                filter.connect(gain);
                gain.connect(this.masterGain);

                osc1.start(t);
                osc2.start(t);
                osc1.stop(t + dur + 0.1);
                osc2.stop(t + dur + 0.1);
            },

            // Dàn dây vĩ cầm dồn dập (Cinematic staccato string ostinato)
            playStrings(t, freq, dur = 0.12, vol = 0.16) {
                if (!this.ctx || !this.masterGain) return;
                const osc = this.ctx.createOscillator();
                const filter = this.ctx.createBiquadFilter();
                const gain = this.ctx.createGain();

                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freq, t);

                filter.type = 'bandpass';
                filter.frequency.setValueAtTime(Math.max(450, freq * 2.2), t);
                filter.Q.value = 1.4;

                gain.gain.setValueAtTime(0.001, t);
                gain.gain.exponentialRampToValueAtTime(vol * 0.25, t + 0.015);
                gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

                osc.connect(filter);
                filter.connect(gain);
                gain.connect(this.masterGain);

                osc.start(t);
                osc.stop(t + dur + 0.02);
            },

            // Tiếng trống trận trầm hùng (War Drum / Timpani)
            playTimpani(t, freq = 65, vol = 0.45, isWarDrum = false) {
                if (!this.ctx || !this.masterGain) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = isWarDrum ? 'triangle' : 'sine';
                osc.frequency.setValueAtTime(isWarDrum ? freq * 1.6 : freq, t);
                osc.frequency.exponentialRampToValueAtTime(isWarDrum ? 32 : 26, t + 0.42);

                gain.gain.setValueAtTime(vol * 0.75, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + (isWarDrum ? 0.6 : 0.48));
                osc.connect(gain);
                gain.connect(this.masterGain);
                osc.start(t);
                osc.stop(t + (isWarDrum ? 0.65 : 0.52));
            },

            // Tiếng trống duyệt binh hành quân (Marching Snare)
            playSnareBrush(t, vol = 0.22, isRoll = false) {
                if (!this.ctx || !this.masterGain) return;
                const dur = isRoll ? 0.07 : 0.14;
                const bufLen = Math.floor(this.ctx.sampleRate * dur);
                const buf = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
                const data = buf.getChannelData(0);
                for (let i = 0; i < bufLen; i++) {
                    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufLen * (isRoll ? 0.22 : 0.35)));
                }
                const src = this.ctx.createBufferSource();
                const filter = this.ctx.createBiquadFilter();
                const gain = this.ctx.createGain();
                filter.type = 'bandpass';
                filter.frequency.value = isRoll ? 2300 : 1800;
                filter.Q.value = 1.8;
                src.buffer = buf;
                gain.gain.setValueAtTime(vol * 0.35, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
                src.connect(filter);
                filter.connect(gain);
                gain.connect(this.masterGain);
                src.start(t);
            },

            // Chũm chọe / Tiếng kẻng lệnh xuất kích (Cymbal clash)
            playCymbal(t, vol = 0.18) {
                if (!this.ctx || !this.masterGain) return;
                const dur = 0.65;
                const bufLen = Math.floor(this.ctx.sampleRate * dur);
                const buf = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
                const data = buf.getChannelData(0);
                for (let i = 0; i < bufLen; i++) {
                    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufLen * 0.18));
                }
                const src = this.ctx.createBufferSource();
                const filter = this.ctx.createBiquadFilter();
                const gain = this.ctx.createGain();
                filter.type = 'highpass';
                filter.frequency.value = 4200;
                src.buffer = buf;
                gain.gain.setValueAtTime(vol * 0.2, t);
                gain.gain.exponentialRampToValueAtTime(0.0005, t + dur);
                src.connect(filter);
                filter.connect(gain);
                gain.connect(this.masterGain);
                src.start(t);
            },

            tick() {
                const step = this.step;
                this.step = (this.step + 1) % 32;
                if (this.step === 0) this.phrase = (this.phrase + 1) % 2;
                const t = this.ctx.currentTime;
                const isAir = typeof currentMode !== 'undefined' && currentMode === 'MIG21';

                if (this.theme === 'PLAYING') {
                    // === CHIẾN ĐẤU: HÀNH KHÚC HÀO HÙNG, XUNG TRẬN DŨNG MÃNH ===
                    if (step === 0) {
                        this.playTimpani(t, 72, 0.6, true);
                        this.playCymbal(t, 0.22);
                    } else if (step === 8) {
                        this.playTimpani(t, 55, 0.42);
                        this.playSnareBrush(t, 0.25);
                    } else if (step === 16) {
                        this.playTimpani(t, 65, 0.5, true);
                    } else if (step === 24) {
                        this.playTimpani(t, 55, 0.45);
                        this.playSnareBrush(t, 0.28);
                    }

                    if (step === 4 || step === 20) {
                        this.playSnareBrush(t, 0.22);
                    } else if (step === 12) {
                        this.playSnareBrush(t, 0.18, true);
                    } else if (step === 13) {
                        this.playSnareBrush(t, 0.24);
                    } else if (step >= 28) {
                        this.playSnareBrush(t, 0.16 + (step - 28) * 0.06, true);
                    }

                    if (step % 2 === 0) {
                        const strNote = step < 16 ? (step % 4 === 0 ? 146.83 : 174.61) : (step % 4 === 0 ? 220.00 : 196.00);
                        this.playStrings(t, strNote, 0.1, isAir ? 0.2 : 0.14);
                    }

                    if (this.phrase === 0) {
                        if (step === 0) this.playBrass(t, 146.83, 0.45, 0.32);
                        else if (step === 4) this.playBrass(t, 174.61, 0.3, 0.3);
                        else if (step === 8) this.playBrass(t, 220.00, 0.4, 0.34);
                        else if (step === 12) this.playBrass(t, 293.66, 0.65, 0.38);
                        else if (step === 16) this.playBrass(t, 293.66, 0.35, 0.32);
                        else if (step === 20) this.playBrass(t, 261.63, 0.3, 0.3);
                        else if (step === 24) this.playBrass(t, 220.00, 0.4, 0.32);
                        else if (step === 28) this.playBrass(t, 174.61, 0.25, 0.28);
                    } else {
                        if (step === 0) this.playBrass(t, 220.00, 0.4, 0.32);
                        else if (step === 4) this.playBrass(t, 261.63, 0.3, 0.3);
                        else if (step === 8) this.playBrass(t, 293.66, 0.4, 0.35);
                        else if (step === 12) this.playBrass(t, 349.23, 0.7, 0.4);
                        else if (step === 16) this.playBrass(t, 329.63, 0.35, 0.32);
                        else if (step === 20) this.playBrass(t, 293.66, 0.35, 0.32);
                        else if (step === 24) this.playBrass(t, 220.00, 0.4, 0.3);
                        else if (step === 28) this.playBrass(t, 293.66, 0.6, 0.35);
                    }
                } else if (this.theme === 'MENU') {
                    // === MENU / BRIEFING: TRANG NGHIÊM, HÀO HÙNG, BI TRÁNG ===
                    if (step === 0) {
                        this.playTimpani(t, 52, 0.38, true);
                        this.playCymbal(t, 0.14);
                        this.playBrass(t, 146.83, 0.8, 0.28);
                    } else if (step === 8) {
                        this.playSnareBrush(t, 0.16);
                        this.playBrass(t, 174.61, 0.5, 0.26);
                    } else if (step === 16) {
                        this.playTimpani(t, 46, 0.3);
                        this.playBrass(t, 220.00, 0.7, 0.3);
                    } else if (step === 24) {
                        this.playSnareBrush(t, 0.2);
                        this.playBrass(t, 293.66, 0.9, 0.32);
                    } else if (step === 28 || step === 30) {
                        this.playSnareBrush(t, 0.12, true);
                    }
                } else if (this.theme === 'VICTORY') {
                    // === VICTORY: ĐẠI THẮNG KHẢI HOÀN, RẠNG RỠ NON SÔNG ===
                    if (step % 8 === 0) {
                        this.playTimpani(t, 73.4, 0.48, true);
                        this.playCymbal(t, 0.2);
                    }
                    if (step % 4 === 2) {
                        this.playSnareBrush(t, 0.26, true);
                    }
                    if (step === 0) this.playBrass(t, 146.83, 0.35, 0.35);
                    else if (step === 4) this.playBrass(t, 185.00, 0.35, 0.35);
                    else if (step === 8) this.playBrass(t, 220.00, 0.35, 0.35);
                    else if (step === 12) this.playBrass(t, 293.66, 0.7, 0.42);
                    else if (step === 16) this.playBrass(t, 369.99, 0.4, 0.38);
                    else if (step === 20) this.playBrass(t, 329.63, 0.35, 0.35);
                    else if (step === 24) this.playBrass(t, 293.66, 0.4, 0.38);
                    else if (step === 28) this.playBrass(t, 220.00, 0.5, 0.35);
                }
            }
        };

        if (typeof window !== 'undefined') {
            window.SoundFX = SoundFX;
            window.MusicSystem = MusicSystem;
        }


