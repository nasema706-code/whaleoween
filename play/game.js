const canvas = document.getElementById("game");
if (canvas) {
  initTreatHunt(canvas);
}

function initTreatHunt(canvas) {
  const ctx = canvas.getContext("2d");

  const overlay = document.getElementById("overlay");
  const panelStart = document.getElementById("panel-start");
  const panelPause = document.getElementById("panel-pause");
  const panelOver = document.getElementById("panel-over");
  const hud = document.getElementById("hud");
  const hudScore = document.getElementById("hud-score");
  const hudLives = document.getElementById("hud-lives");
  const hudTime = document.getElementById("hud-time");
  const hudCombo = document.getElementById("hud-combo");
  const hudLevel = document.getElementById("hud-level");
  const hudPower = document.getElementById("hud-power");
  const finalScore = document.getElementById("final-score");
  const bestScoreEl = document.getElementById("best-score");
  const overTitle = document.getElementById("over-title");
  const overBlurb = document.getElementById("over-blurb");
  const touchHint = document.getElementById("touch-hint");
  const btnStart = document.getElementById("btn-start");
  const btnAgain = document.getElementById("btn-again");
  const btnResume = document.getElementById("btn-resume");
  const btnPause = document.getElementById("btn-pause");
  const btnPauseQuit = document.getElementById("btn-pause-quit");
  const btnMute = document.getElementById("btn-mute");
  const btnMusic = document.getElementById("btn-music");
  const btnQuality = document.getElementById("btn-quality");
  const charPickGrid = document.getElementById("char-pick-grid");
  const charPickName = document.getElementById("char-pick-name");

  const BEST_KEY = "whaleoween-treat-hunt-best";
  const CHAR_KEY = "whaleoween-treat-hunt-char";

  const CHARACTERS = [
    { id: "lane", name: "The Lane" },
    { id: "vigil", name: "The Vigil" },
  ];

  const MAX_LIVES = 5;

  const LEVELS = [
    {
      id: 1,
      name: "The Lane",
      blurb: "Candy in the bucket.",
      theme: "candy",
      duration: 40,
      spawn: 0.92,
      gravity: 175,
      lifeChance: 0.025,
      curseChance: 0.16,
      powerChance: 0.07,
      starChance: 0.06,
      clearBonus: 60,
    },
    {
      id: 2,
      name: "The Porch",
      blurb: "The robe keeps still.",
      theme: "pumpkin",
      duration: 42,
      spawn: 0.78,
      gravity: 195,
      lifeChance: 0.03,
      curseChance: 0.24,
      powerChance: 0.08,
      starChance: 0.07,
      pumpkinBias: 0.22,
      clearBonus: 90,
    },
    {
      id: 3,
      name: "The Mask",
      blurb: "Two hoods. One moon.",
      theme: "alley",
      duration: 44,
      spawn: 0.64,
      gravity: 225,
      lifeChance: 0.035,
      curseChance: 0.34,
      powerChance: 0.1,
      starChance: 0.08,
      clearBonus: 120,
    },
    {
      id: 4,
      name: "The Balloon",
      blurb: "Red against the fog.",
      theme: "grave",
      duration: 48,
      spawn: 0.52,
      gravity: 260,
      lifeChance: 0.04,
      curseChance: 0.43,
      powerChance: 0.14,
      starChance: 0.1,
      clearBonus: 160,
    },
    {
      id: 5,
      name: "The Hook",
      blurb: "Bees at the end of the lane.",
      theme: "haunt",
      duration: 52,
      spawn: 0.42,
      gravity: 285,
      lifeChance: 0.045,
      curseChance: 0.51,
      powerChance: 0.12,
      starChance: 0.14,
      clearBonus: 220,
    },
  ];

  const TREATS = [
    { kind: "candy", points: 10, color: "#ff6b9d", r: 21 },
    { kind: "lolli", points: 15, color: "#ff8fab", r: 22 },
    { kind: "corn", points: 18, color: "#ffd166", r: 21 },
    { kind: "pumpkin", points: 25, color: "#ff7a1a", r: 25 },
    { kind: "star", points: 50, color: "#c8f54a", r: 25, rare: true },
  ];

  const CURSES = [
    { kind: "skull", damage: 1, color: "#efe6d8", r: 22 },
    { kind: "bat", damage: 1, color: "#8b93b5", r: 21 },
    { kind: "spider", damage: 1, color: "#ff4d6d", r: 19 },
  ];

  const LIFE_BONUS = {
    kind: "life",
    power: "life",
    color: "#ff4d6d",
    r: 22,
    label: "+1 LIFE",
    rare: true,
  };

  const POWERS = [
    { kind: "magnet", power: "magnet", color: "#7dd3fc", r: 21, label: "MAGNET" },
    { kind: "shield", power: "shield", color: "#a78bfa", r: 21, label: "SHIELD" },
    { kind: "slow", power: "slow", color: "#67e8f9", r: 21, label: "SLOW" },
    { kind: "double", power: "double", color: "#fde047", r: 21, label: "x2" },
  ];

  const keys = new Set();
  let aimX = null;
  let pointerActive = false;
  let pointerKind = "mouse";
  let running = false;
  let paused = false;
  let lastTs = 0;
  let spawnTimer = 0;
  let rafId = 0;
  let muted = localStorage.getItem("whaleoween-treat-hunt-muted") === "1";
  let musicOn = localStorage.getItem("whaleoween-treat-hunt-music") === "1";
  let lastTickSecond = -1;
  let nearMissCooldown = 0;
  let resizeTimer = 0;
  let viewW = 0;
  let viewH = 0;
  let canvasCssW = 0;
  let canvasCssH = 0;
  const isCoarse =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches;
  const prefersTouch =
    isCoarse ||
    (typeof window.matchMedia === "function" &&
      window.matchMedia("(hover: none)").matches);
  // Tuned profiles: phones/tablets vs mouse/trackpad vs keyboard
  const TOUCH = { speed: 1050, catchUp: 20, dead: 2.5 };
  const MOUSE = { speed: 980, catchUp: 22, dead: 1.25 };
  const KEY = { speed: 960, accel: 9800, reverse: 1.75, friction: 0.68 };

  const QUALITY_KEY = "whaleoween-treat-hunt-quality";
  const QUALITY_MODES = ["auto", "high", "battery"];
  let qualityMode = localStorage.getItem(QUALITY_KEY) || "auto";
  if (!QUALITY_MODES.includes(qualityMode)) qualityMode = "auto";

  function detectAutoTier() {
    const cores = navigator.hardwareConcurrency || 4;
    const mem = Number(navigator.deviceMemory) || 4;
    const dpr = window.devicePixelRatio || 1;
    if (prefersTouch && (cores <= 4 || mem <= 2 || dpr >= 3)) return "low";
    if (prefersTouch && cores <= 6) return "medium";
    return "high";
  }

  function resolveQuality() {
    const tier =
      qualityMode === "battery"
        ? "low"
        : qualityMode === "high"
          ? "high"
          : detectAutoTier();
    const presets = {
      high: {
        tier: "high",
        dprCap: 2,
        maxDrops: 28,
        maxParticles: 90,
        particleMul: 1,
        bgMotion: true,
        shadows: true,
        glow: true,
      },
      medium: {
        tier: "medium",
        dprCap: 1.75,
        maxDrops: 18,
        maxParticles: 42,
        particleMul: 0.65,
        bgMotion: true,
        shadows: true,
        glow: false,
      },
      low: {
        tier: "low",
        dprCap: 1.25,
        maxDrops: 12,
        maxParticles: 22,
        particleMul: 0.4,
        bgMotion: false,
        shadows: false,
        glow: false,
      },
    };
    return presets[tier] || presets.high;
  }

  let quality = resolveQuality();
  const SPRITE_KINDS = [
    "candy",
    "lolli",
    "corn",
    "pumpkin",
    "star",
    "skull",
    "bat",
    "spider",
    "magnet",
    "shield",
    "slow",
    "double",
    "life",
  ];
  const ATLAS_CELL = 72;
  let atlas = null;
  const bgCache = new Map();

  const playerSprite = new Image();
  playerSprite.decoding = "async";
  let playerSpriteReady = false;
  playerSprite.onload = () => {
    playerSpriteReady = true;
    if (!running) drawScene();
  };
  playerSprite.src = new URL("../assets/lane-sprite.png", document.baseURI).href;

  const vigilSprite = new Image();
  vigilSprite.decoding = "async";
  let vigilSpriteReady = false;
  vigilSprite.onload = () => {
    vigilSpriteReady = true;
    if (!running) drawScene();
  };
  vigilSprite.src = new URL("../assets/vigil-sprite.png", document.baseURI).href;

  function getSavedCharId() {
    try {
      const id = localStorage.getItem(CHAR_KEY);
      if (CHARACTERS.some((c) => c.id === id)) return id;
    } catch {
      /* ignore */
    }
    return CHARACTERS[0].id;
  }

  let selectedCharId = getSavedCharId();

  function getCharacter(id = selectedCharId) {
    return CHARACTERS.find((c) => c.id === id) || CHARACTERS[0];
  }

  function setCharacter(id, { persist = true } = {}) {
    const char = getCharacter(id);
    selectedCharId = char.id;
    if (persist) {
      try {
        localStorage.setItem(CHAR_KEY, char.id);
      } catch {
        /* ignore */
      }
    }
    if (charPickName) charPickName.textContent = char.name;
    charPickGrid?.querySelectorAll(".char-option").forEach((btn) => {
      const active = btn.dataset.id === char.id;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
    if (!running) drawScene();
  }

  function buildCharacterPicker() {
    if (!charPickGrid) return;
    charPickGrid.innerHTML = "";
    CHARACTERS.forEach((char) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "char-option";
      btn.dataset.id = char.id;
      btn.setAttribute("role", "option");
      btn.setAttribute("aria-label", char.name);
      const photo =
        char.id === "lane"
          ? playerSprite.src
          : char.id === "vigil"
            ? vigilSprite.src
            : "";
      btn.innerHTML = photo
        ? `<img src="${photo}" alt="" /><span>${char.name}</span>`
        : `<span class="whale-mark" data-look="${char.id}" aria-hidden="true"></span><span>${char.name}</span>`;
      btn.addEventListener("click", () => setCharacter(char.id));
      charPickGrid.appendChild(btn);
    });
    setCharacter(selectedCharId, { persist: false });
  }

  const audio = createAudio();

  const state = {
    score: 0,
    lives: 3,
    timeLeft: LEVELS[0].duration,
    combo: 0,
    maxCombo: 0,
    levelIndex: 0,
    levelBanner: 0,
    magnetT: 0,
    shield: false,
    slowT: 0,
    doubleT: 0,
    levelsCleared: 0,
    hurtThisLevel: false,
    player: {
      x: 0,
      y: 0,
      w: 78,
      h: 58,
      speed: prefersTouch ? TOUCH.speed : KEY.speed,
      accel: KEY.accel,
      vx: 0,
      facing: 0,
    },
    drops: [],
    particles: [],
    floaters: [],
    shake: 0,
    flash: 0,
    flashColor: "rgba(200, 245, 74, 0.28)",
    comboPulse: 0,
  };

  const hudCache = {
    score: null,
    lives: null,
    time: null,
    combo: null,
    hot: null,
    urgent: null,
    level: null,
    power: null,
  };

  function currentLevel() {
    return LEVELS[state.levelIndex] || LEVELS[LEVELS.length - 1];
  }

  function createAudio() {
    let actx = null;
    let master = null;
    let musicBus = null;
    let musicTimer = null;
    let songBuffer = null;
    let songGain = null;
    let songGen = 0;
    let songSources = [];
    // Chorus hooks from Whale-o-ween, the phrases that repeat and peak.
    const HOOKS = [
      { start: 114.7, end: 130.7 },
      { start: 143.4, end: 159.4 },
      { start: 163.9, end: 179.9 },
      { start: 168.0, end: 184.0 },
      { start: 180.2, end: 196.2 },
    ];
    const songBytesPromise = fetch(new URL("../assets/whale-o-ween.mp3", document.baseURI))
      .then((response) => {
        if (!response.ok) throw new Error("song");
        return response.arrayBuffer();
      })
      .catch(() => null);

    function ensure() {
      if (!actx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        actx = new AC();
        master = actx.createGain();
        master.gain.value = 0.28;
        master.connect(actx.destination);
        musicBus = actx.createGain();
        // Music was effectively silent under the old 0.7 * tiny note gains
        musicBus.gain.value = 1.6;
        musicBus.connect(master);
      }
      return actx;
    }

    function resumeCtx() {
      const ac = ensure();
      if (!ac) return Promise.resolve(null);
      if (ac.state === "suspended") return ac.resume().then(() => ac);
      return Promise.resolve(ac);
    }

    function tone(
      freq,
      dur,
      type = "square",
      gain = 0.2,
      when = 0,
      slideTo = null,
      dest = null
    ) {
      if (muted) return;
      const ac = ensure();
      if (!ac || ac.state === "suspended") return;
      const t0 = ac.currentTime + when;
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      if (slideTo != null) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
      }
      const peak = Math.max(0.0001, gain);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(peak, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + Math.max(0.05, dur));
      osc.connect(g);
      g.connect(dest || master);
      osc.start(t0);
      osc.stop(t0 + dur + 0.03);
    }

    function softPad(freqs, dur, gain = 0.04, when = 0) {
      for (const f of freqs) {
        tone(f, dur, "sine", gain, when, null, musicBus);
        tone(f * 0.997, dur * 1.05, "triangle", gain * 0.6, when + 0.01, null, musicBus);
      }
    }

    function noiseBurst(dur, gain = 0.12, when = 0, dest = null) {
      if (muted) return;
      const ac = ensure();
      if (!ac || ac.state === "suspended") return;
      const t0 = ac.currentTime + when;
      const len = Math.floor(ac.sampleRate * dur);
      const buffer = ac.createBuffer(1, len, ac.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = ac.createBufferSource();
      const g = ac.createGain();
      const filter = ac.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 900;
      src.buffer = buffer;
      g.gain.setValueAtTime(Math.max(0.0001, gain), t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      src.connect(filter);
      filter.connect(g);
      g.connect(dest || master);
      src.start(t0);
      src.stop(t0 + dur + 0.02);
    }

    return {
      unlock() {
        return resumeCtx();
      },
      setMuted(next) {
        muted = next;
        localStorage.setItem("whaleoween-treat-hunt-muted", next ? "1" : "0");
      },
      isMuted() {
        return muted;
      },
      setMusic(next) {
        musicOn = next;
        localStorage.setItem("whaleoween-treat-hunt-music", next ? "1" : "0");
        if (!next) this.stopMusic();
        else if (running && !paused) {
          resumeCtx().then(() => {
            if (musicOn && running && !paused) this.startMusic(true);
          });
        }
      },
      isMusicOn() {
        return musicOn;
      },
      start() {
        tone(220, 0.08, "triangle", 0.16);
        tone(330, 0.1, "triangle", 0.14, 0.07);
        tone(440, 0.14, "triangle", 0.12, 0.14);
        tone(660, 0.18, "square", 0.08, 0.22);
      },
      catch(points, combo) {
        const base = 420 + Math.min(combo, 8) * 40;
        tone(base, 0.07, "square", 0.12);
        tone(base * 1.5, 0.1, "triangle", 0.1, 0.04);
        if (points >= 50) {
          tone(880, 0.12, "sine", 0.1, 0.08);
          tone(1175, 0.16, "sine", 0.08, 0.14);
        }
        if (combo > 0 && combo % 5 === 0) {
          tone(523, 0.08, "square", 0.1, 0.12);
          tone(659, 0.08, "square", 0.1, 0.18);
          tone(784, 0.14, "square", 0.12, 0.24);
          if (combo >= 10) {
            tone(880, 0.1, "square", 0.12, 0.3);
            tone(1046, 0.14, "square", 0.11, 0.38);
          }
          if (combo >= 15) {
            tone(1175, 0.12, "sine", 0.1, 0.46);
            tone(1396, 0.16, "sine", 0.09, 0.54);
          }
        }
      },
      star() {
        [659, 784, 988, 1318].forEach((n, i) =>
          tone(n, 0.1, "sine", 0.11, i * 0.07)
        );
      },
      heart() {
        tone(523, 0.08, "sine", 0.12);
        tone(659, 0.1, "triangle", 0.1, 0.06);
        tone(784, 0.14, "sine", 0.09, 0.14);
        tone(1046, 0.16, "sine", 0.07, 0.22);
      },
      nearMiss() {
        tone(720, 0.04, "triangle", 0.07);
        tone(480, 0.06, "sine", 0.05, 0.03);
      },
      power() {
        tone(520, 0.08, "sine", 0.12);
        tone(740, 0.12, "triangle", 0.1, 0.06);
        tone(990, 0.16, "sine", 0.08, 0.12);
      },
      levelUp() {
        [392, 494, 587, 784].forEach((n, i) => tone(n, 0.12, "triangle", 0.11, i * 0.08));
      },
      curse() {
        noiseBurst(0.18, 0.16);
        tone(180, 0.22, "sawtooth", 0.12, 0, 70);
        tone(90, 0.28, "triangle", 0.1, 0.05, 40);
      },
      tick() {
        tone(880, 0.05, "square", 0.07);
      },
      pause() {
        tone(400, 0.08, "triangle", 0.08);
        tone(280, 0.12, "triangle", 0.07, 0.06);
      },
      resume() {
        tone(280, 0.08, "triangle", 0.08);
        tone(400, 0.12, "triangle", 0.07, 0.06);
      },
      win() {
        [523, 659, 784, 1046].forEach((n, i) => tone(n, 0.16, "triangle", 0.12, i * 0.1));
      },
      lose() {
        tone(220, 0.2, "sawtooth", 0.12, 0, 110);
        tone(160, 0.28, "triangle", 0.1, 0.12, 70);
        noiseBurst(0.25, 0.1, 0.05);
      },
      startMusic(force = false) {
        if (!musicOn) return;
        if (musicTimer && !force) return;
        this.stopMusic();
        const hook = HOOKS[Math.max(0, Math.min(state.levelIndex, HOOKS.length - 1))];
        const gen = songGen;

        const arm = async () => {
          const ac = await resumeCtx();
          if (!ac || gen !== songGen || !musicOn || !running || paused) return;
          if (!songBuffer) {
            const bytes = await songBytesPromise;
            if (!bytes || gen !== songGen || !musicOn || !running || paused) return;
            songBuffer = await ac.decodeAudioData(bytes.slice(0));
          }
          if (gen !== songGen || !musicOn || !running || paused || !songBuffer) return;

          if (!songGain) {
            songGain = ac.createGain();
            songGain.gain.value = 0.0001;
            songGain.connect(master);
          }
          const now = ac.currentTime;
          songGain.gain.cancelScheduledValues(now);
          songGain.gain.setValueAtTime(0.0001, now);
          songGain.gain.linearRampToValueAtTime(0.28, now + 0.4);

          const dur = hook.end - hook.start;
          const fade = 0.2;
          let nextAt = now + 0.05;

          const schedule = () => {
            if (gen !== songGen || !songBuffer) return;
            while (nextAt < ac.currentTime + 0.75) {
              const src = ac.createBufferSource();
              const g = ac.createGain();
              src.buffer = songBuffer;
              src.connect(g);
              g.connect(songGain);
              const t = nextAt;
              g.gain.setValueAtTime(0.0001, t);
              g.gain.linearRampToValueAtTime(1, t + fade);
              g.gain.setValueAtTime(1, t + Math.max(fade, dur - fade));
              g.gain.linearRampToValueAtTime(0.0001, t + dur);
              src.start(t, hook.start, dur);
              src.stop(t + dur + 0.03);
              src.onended = () => {
                songSources = songSources.filter((item) => item !== src);
              };
              songSources.push(src);
              nextAt = t + dur - fade;
            }
          };

          schedule();
          if (musicTimer) clearInterval(musicTimer);
          musicTimer = setInterval(schedule, 200);
        };

        arm();
      },
      stopMusic() {
        songGen += 1;
        if (musicTimer) {
          clearInterval(musicTimer);
          musicTimer = null;
        }
        const ac = actx;
        if (ac && songGain) {
          const now = ac.currentTime;
          songGain.gain.cancelScheduledValues(now);
          songGain.gain.setValueAtTime(Math.max(0.0001, songGain.gain.value), now);
          songGain.gain.linearRampToValueAtTime(0.0001, now + 0.08);
        }
        for (const src of songSources) {
          try {
            src.stop();
          } catch {
            /* already stopped */
          }
        }
        songSources = [];
      },
    };
  }

  /* —— Retina sprite atlas (one canvas for all kinds) —— */
  function paintKind(g, kind) {
    const size = 18;
    const s = size / 16;

    if (kind === "candy") {
      g.rotate(-0.4);
      g.fillStyle = "#ff6b9d";
      roundRect(g, -14 * s, -8 * s, 28 * s, 16 * s, 4 * s);
      g.fill();
      g.fillStyle = "rgba(255,255,255,0.38)";
      g.fillRect(-10 * s, -5 * s, 6 * s, 10 * s);
      g.fillStyle = "#ffe08a";
      g.beginPath();
      g.moveTo(-14 * s, -2 * s);
      g.lineTo(-22 * s, -7 * s);
      g.lineTo(-22 * s, 7 * s);
      g.closePath();
      g.fill();
      g.beginPath();
      g.moveTo(14 * s, -2 * s);
      g.lineTo(22 * s, -7 * s);
      g.lineTo(22 * s, 7 * s);
      g.closePath();
      g.fill();
      g.strokeStyle = "#b33b6a";
      g.lineWidth = 1.5 * s;
      roundRect(g, -14 * s, -8 * s, 28 * s, 16 * s, 4 * s);
      g.stroke();
    } else if (kind === "lolli") {
      g.fillStyle = "#ff4d6d";
      g.beginPath();
      g.arc(0, -4 * s, 11 * s, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "rgba(255,255,255,0.5)";
      g.lineWidth = 2.2 * s;
      g.beginPath();
      g.arc(0, -4 * s, 7 * s, 0.2, Math.PI * 1.4);
      g.stroke();
      g.fillStyle = "#f0c27a";
      g.fillRect(-1.6 * s, 4 * s, 3.2 * s, 14 * s);
      g.fillStyle = "rgba(255,255,255,0.38)";
      g.beginPath();
      g.arc(-3 * s, -7 * s, 3 * s, 0, Math.PI * 2);
      g.fill();
    } else if (kind === "corn") {
      const colors = ["#ffd166", "#fff8e7", "#ff7a1a"];
      for (let i = 0; i < 3; i++) {
        g.fillStyle = colors[i];
        g.beginPath();
        g.moveTo((i - 1) * 7 * s, 10 * s);
        g.lineTo((i - 1) * 7 * s - 4 * s, -10 * s);
        g.lineTo((i - 1) * 7 * s + 4 * s, -10 * s);
        g.closePath();
        g.fill();
        g.strokeStyle = "#c47a20";
        g.lineWidth = 1.2 * s;
        g.stroke();
      }
    } else if (kind === "pumpkin") {
      g.fillStyle = "#ff7a1a";
      g.beginPath();
      if (typeof g.ellipse === "function") {
        g.ellipse(0, 2 * s, 14 * s, 12 * s, 0, 0, Math.PI * 2);
      } else {
        g.arc(0, 2 * s, 13 * s, 0, Math.PI * 2);
      }
      g.fill();
      g.fillStyle = "#e8650e";
      g.beginPath();
      if (typeof g.ellipse === "function") {
        g.ellipse(-6 * s, 2 * s, 5 * s, 11 * s, 0, 0, Math.PI * 2);
        g.ellipse(6 * s, 2 * s, 5 * s, 11 * s, 0, 0, Math.PI * 2);
      }
      g.fill();
      g.fillStyle = "#3f8a2c";
      g.fillRect(-2 * s, -12 * s, 4 * s, 6 * s);
      g.fillStyle = "#1a120c";
      g.beginPath();
      g.moveTo(-7 * s, -1 * s);
      g.lineTo(-3 * s, 3 * s);
      g.lineTo(-8 * s, 3 * s);
      g.closePath();
      g.moveTo(7 * s, -1 * s);
      g.lineTo(3 * s, 3 * s);
      g.lineTo(8 * s, 3 * s);
      g.closePath();
      g.fill();
      g.beginPath();
      g.moveTo(-5 * s, 7 * s);
      g.quadraticCurveTo(0, 11 * s, 5 * s, 7 * s);
      g.quadraticCurveTo(0, 9 * s, -5 * s, 7 * s);
      g.fill();
    } else if (kind === "star") {
      g.fillStyle = "#c8f54a";
      starPath(g, 0, 0, 5, 14 * s, 6 * s);
      g.fill();
      g.fillStyle = "rgba(255,255,255,0.5)";
      starPath(g, 0, 0, 5, 7 * s, 3 * s);
      g.fill();
      g.strokeStyle = "#8fbf20";
      g.lineWidth = 1.5 * s;
      starPath(g, 0, 0, 5, 14 * s, 6 * s);
      g.stroke();
    } else if (kind === "skull") {
      g.fillStyle = "#efe6d8";
      g.beginPath();
      if (typeof g.ellipse === "function") {
        g.ellipse(0, -2 * s, 11 * s, 12 * s, 0, 0, Math.PI * 2);
      } else {
        g.arc(0, -2 * s, 11 * s, 0, Math.PI * 2);
      }
      g.fill();
      g.fillRect(-7 * s, 6 * s, 14 * s, 6 * s);
      g.fillStyle = "#1a120c";
      g.beginPath();
      if (typeof g.ellipse === "function") {
        g.ellipse(-4.5 * s, -1 * s, 3.2 * s, 3.6 * s, 0, 0, Math.PI * 2);
        g.ellipse(4.5 * s, -1 * s, 3.2 * s, 3.6 * s, 0, 0, Math.PI * 2);
      } else {
        g.arc(-4.5 * s, -1 * s, 3.2 * s, 0, Math.PI * 2);
        g.arc(4.5 * s, -1 * s, 3.2 * s, 0, Math.PI * 2);
      }
      g.fill();
      g.fillRect(-1.2 * s, 4 * s, 2.4 * s, 3 * s);
      g.fillRect(-5 * s, 10 * s, 2.2 * s, 3 * s);
      g.fillRect(-1.1 * s, 10 * s, 2.2 * s, 3 * s);
      g.fillRect(2.8 * s, 10 * s, 2.2 * s, 3 * s);
    } else if (kind === "bat") {
      g.fillStyle = "#6b728f";
      g.beginPath();
      g.moveTo(0, 2 * s);
      g.quadraticCurveTo(-16 * s, -10 * s, -18 * s, 2 * s);
      g.quadraticCurveTo(-10 * s, -1 * s, 0, 6 * s);
      g.quadraticCurveTo(10 * s, -1 * s, 18 * s, 2 * s);
      g.quadraticCurveTo(16 * s, -10 * s, 0, 2 * s);
      g.fill();
      g.fillStyle = "#4b5168";
      g.beginPath();
      if (typeof g.ellipse === "function") {
        g.ellipse(0, 2 * s, 5 * s, 6 * s, 0, 0, Math.PI * 2);
      } else {
        g.arc(0, 2 * s, 5 * s, 0, Math.PI * 2);
      }
      g.fill();
      g.fillStyle = "#c8f54a";
      g.beginPath();
      g.arc(-2 * s, 1 * s, 1.4 * s, 0, Math.PI * 2);
      g.arc(2 * s, 1 * s, 1.4 * s, 0, Math.PI * 2);
      g.fill();
    } else if (kind === "spider") {
      g.strokeStyle = "#c23a55";
      g.lineWidth = 1.8 * s;
      g.lineCap = "round";
      for (const side of [-1, 1]) {
        for (let i = 0; i < 3; i++) {
          const y = -4 * s + i * 5 * s;
          g.beginPath();
          g.moveTo(side * 4 * s, 0);
          g.quadraticCurveTo(side * 12 * s, y - 2 * s, side * 16 * s, y + 4 * s);
          g.stroke();
        }
      }
      g.fillStyle = "#ff4d6d";
      g.beginPath();
      if (typeof g.ellipse === "function") {
        g.ellipse(0, 0, 7 * s, 6 * s, 0, 0, Math.PI * 2);
      } else {
        g.arc(0, 0, 6.5 * s, 0, Math.PI * 2);
      }
      g.fill();
      g.fillStyle = "#1a120c";
      g.beginPath();
      g.arc(-2.5 * s, -1 * s, 1.3 * s, 0, Math.PI * 2);
      g.arc(2.5 * s, -1 * s, 1.3 * s, 0, Math.PI * 2);
      g.fill();
    } else if (kind === "magnet") {
      g.strokeStyle = "#38bdf8";
      g.lineWidth = 5 * s;
      g.lineCap = "butt";
      g.beginPath();
      g.arc(0, 2 * s, 10 * s, Math.PI * 0.15, Math.PI * 0.85);
      g.stroke();
      g.fillStyle = "#f87171";
      g.fillRect(-12 * s, -2 * s, 6 * s, 10 * s);
      g.fillStyle = "#94a3b8";
      g.fillRect(6 * s, -2 * s, 6 * s, 10 * s);
    } else if (kind === "shield") {
      g.fillStyle = "#a78bfa";
      g.beginPath();
      g.moveTo(0, -13 * s);
      g.lineTo(11 * s, -7 * s);
      g.lineTo(9 * s, 6 * s);
      g.quadraticCurveTo(0, 14 * s, -9 * s, 6 * s);
      g.lineTo(-11 * s, -7 * s);
      g.closePath();
      g.fill();
      g.strokeStyle = "#ddd6fe";
      g.lineWidth = 2 * s;
      g.stroke();
      g.fillStyle = "rgba(255,255,255,0.5)";
      g.beginPath();
      g.moveTo(-2 * s, -6 * s);
      g.lineTo(2 * s, -6 * s);
      g.lineTo(1 * s, 4 * s);
      g.lineTo(-1 * s, 4 * s);
      g.fill();
    } else if (kind === "slow") {
      g.fillStyle = "#67e8f9";
      g.beginPath();
      g.arc(0, 0, 12 * s, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "#0891b2";
      g.lineWidth = 2 * s;
      g.beginPath();
      g.arc(0, 0, 8 * s, 0, Math.PI * 2);
      g.moveTo(0, 0);
      g.lineTo(0, -6 * s);
      g.moveTo(0, 0);
      g.lineTo(5 * s, 3 * s);
      g.stroke();
    } else if (kind === "double") {
      g.fillStyle = "#fde047";
      roundRect(g, -12 * s, -9 * s, 24 * s, 18 * s, 5 * s);
      g.fill();
      g.fillStyle = "#854d0e";
      g.font = `800 ${Math.round(12 * s)}px Outfit, sans-serif`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText("x2", 0, 1 * s);
    } else if (kind === "life") {
      g.fillStyle = "#ff4d6d";
      g.beginPath();
      g.moveTo(0, 10 * s);
      g.bezierCurveTo(-16 * s, 0, -12 * s, -12 * s, 0, -6 * s);
      g.bezierCurveTo(12 * s, -12 * s, 16 * s, 0, 0, 10 * s);
      g.closePath();
      g.fill();
      g.fillStyle = "#ffe4e9";
      g.beginPath();
      if (typeof g.ellipse === "function") {
        g.ellipse(-4 * s, -4 * s, 3.2 * s, 2.2 * s, -0.5, 0, Math.PI * 2);
      } else {
        g.arc(-4 * s, -4 * s, 2.4 * s, 0, Math.PI * 2);
      }
      g.fill();
      g.strokeStyle = "#c23a55";
      g.lineWidth = 1.6 * s;
      g.beginPath();
      g.moveTo(0, 10 * s);
      g.bezierCurveTo(-16 * s, 0, -12 * s, -12 * s, 0, -6 * s);
      g.bezierCurveTo(12 * s, -12 * s, 16 * s, 0, 0, 10 * s);
      g.closePath();
      g.stroke();
    } else {
      g.fillStyle = "#c8f54a";
      g.beginPath();
      g.arc(0, 0, size * 0.8, 0, Math.PI * 2);
      g.fill();
    }
  }

  function buildAtlas(scale) {
    const cols = 4;
    const rows = Math.ceil(SPRITE_KINDS.length / cols);
    const cell = Math.max(48, Math.ceil(ATLAS_CELL * scale));
    const c = document.createElement("canvas");
    c.width = cols * cell;
    c.height = rows * cell;
    const g = c.getContext("2d", { alpha: true });
    const frames = Object.create(null);

    SPRITE_KINDS.forEach((kind, i) => {
      const col = i % cols;
      const row = (i / cols) | 0;
      const cx = col * cell + cell / 2;
      const cy = row * cell + cell / 2;
      g.save();
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.translate(cx, cy);
      g.scale(scale, scale);
      paintKind(g, kind);
      g.restore();
      frames[kind] = { sx: col * cell, sy: row * cell, sw: cell, sh: cell };
    });

    // Identity transform for stable iOS drawImage sourcing
    g.setTransform(1, 0, 0, 1, 0, 0);
    return { canvas: c, frames, scale, cell };
  }

  function ensureAtlas(force = false) {
    const scale = Math.max(1, Math.min(2, quality.dprCap));
    if (!force && atlas && Math.abs(atlas.scale - scale) < 0.01) return atlas;
    atlas = buildAtlas(scale);
    return atlas;
  }

  function drawDropSprite(kind, r) {
    const sheet = ensureAtlas();
    const frame = sheet.frames[kind];
    if (!frame) return;
    const dim = r * 2.35 + 14;
    ctx.drawImage(
      sheet.canvas,
      frame.sx,
      frame.sy,
      frame.sw,
      frame.sh,
      -dim / 2,
      -dim / 2,
      dim,
      dim
    );
  }

  function prewarmAssets() {
    ensureAtlas(true);
    if (!playerSpriteReady && playerSprite.src) {
      // Kick decode early so the first frame isn't blank
      playerSprite.decode?.().then(() => {
        playerSpriteReady = true;
      }).catch(() => {});
    }
    const { w, h } = logicalSize();
    if (w > 1 && h > 1) {
      for (const lvl of LEVELS) {
        getBackground(lvl.theme || "candy", w, h);
      }
    }
  }

  function roundRect(g, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    g.beginPath();
    g.moveTo(x + rr, y);
    g.arcTo(x + w, y, x + w, y + h, rr);
    g.arcTo(x + w, y + h, x, y + h, rr);
    g.arcTo(x, y + h, x, y, rr);
    g.arcTo(x, y, x + w, y, rr);
    g.closePath();
  }

  function starPath(g, cx, cy, spikes, outer, inner) {
    g.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const a = (i * Math.PI) / spikes - Math.PI / 2;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.closePath();
  }

  function resizeCanvas(force = false) {
    const rect = canvas.getBoundingClientRect();
    const nextW = Math.max(1, Math.round(rect.width));
    const nextH = Math.max(1, Math.round(rect.height));

    if (
      !force &&
      Math.abs(nextW - canvasCssW) < 2 &&
      Math.abs(nextH - canvasCssH) < 2
    ) {
      viewW = canvasCssW || nextW;
      viewH = canvasCssH || nextH;
      return false;
    }

    const prevW = viewW || nextW;
    const xRatio = prevW ? state.player.x / prevW : 0.5;
    const dpr = Math.min(window.devicePixelRatio || 1, quality.dprCap);

    canvasCssW = nextW;
    canvasCssH = nextH;
    viewW = nextW;
    viewH = nextH;
    bgCache.clear();

    const bufW = Math.round(nextW * dpr);
    const bufH = Math.round(nextH * dpr);
    if (canvas.width !== bufW || canvas.height !== bufH) {
      canvas.width = bufW;
      canvas.height = bufH;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    state.player.y = viewH - 72;
    state.player.x = Math.min(
      Math.max(xRatio * viewW || viewW / 2, state.player.w / 2),
      viewW - state.player.w / 2
    );
    return true;
  }

  function logicalSize() {
    if (!viewW || !viewH) {
      const rect = canvas.getBoundingClientRect();
      viewW = Math.max(1, Math.round(rect.width));
      viewH = Math.max(1, Math.round(rect.height));
    }
    return { w: viewW, h: viewH };
  }

  function getBest() {
    return Number(localStorage.getItem(BEST_KEY) || 0) || 0;
  }

  function setBest(score) {
    const best = Math.max(getBest(), score);
    localStorage.setItem(BEST_KEY, String(best));
    return best;
  }

  function syncMuteButton() {
    if (!btnMute) return;
    btnMute.setAttribute("aria-pressed", muted ? "true" : "false");
    btnMute.textContent = muted ? "Sound Off" : "Sound On";
    btnMute.setAttribute("aria-label", muted ? "Game sounds off" : "Game sounds on");
  }

  function syncMusicButton() {
    if (!btnMusic) return;
    btnMusic.setAttribute("aria-pressed", musicOn ? "true" : "false");
    btnMusic.textContent = musicOn ? "Music On" : "Music Off";
    btnMusic.setAttribute("aria-label", musicOn ? "Stop the song" : "Play the song");
  }

  function syncQualityButton() {
    if (!btnQuality) return;
    const label =
      qualityMode === "auto"
        ? "Auto"
        : qualityMode === "high"
          ? "High"
          : "Batt";
    btnQuality.textContent = label;
    btnQuality.dataset.tier = quality.tier;
    btnQuality.title = `Graphics: ${quality.tier} (tap to cycle Auto / High / Battery)`;
    btnQuality.setAttribute(
      "aria-label",
      `Graphics quality ${label} — tap to cycle`
    );
  }

  function applyQualityMode(mode) {
    qualityMode = mode;
    localStorage.setItem(QUALITY_KEY, qualityMode);
    quality = resolveQuality();
    atlas = null;
    bgCache.clear();
    ensureAtlas(true);
    resizeCanvas(true);
    syncQualityButton();
    drawScene();
  }

  function cycleQualityMode() {
    const idx = QUALITY_MODES.indexOf(qualityMode);
    applyQualityMode(QUALITY_MODES[(idx + 1) % QUALITY_MODES.length]);
  }

  function setScreen(name) {
    overlay.dataset.screen = name;
    overlay.hidden = name === "playing";
    overlay.setAttribute("aria-hidden", name === "playing" ? "true" : "false");
    panelStart.hidden = name !== "start";
    panelPause.hidden = name !== "pause";
    panelOver.hidden = name !== "over";
    // Keep stats on the game stage during play/pause (no scroll needed)
    hud.hidden = name === "start" || name === "over";
    if (btnPause) btnPause.hidden = name !== "playing";
    if (touchHint) {
      touchHint.hidden =
        name !== "playing" || window.matchMedia("(pointer: fine)").matches;
    }
  }

  function powerLabel() {
    const bits = [];
    if (state.shield) bits.push("Shield");
    if (state.magnetT > 0) bits.push(`Magnet ${Math.ceil(state.magnetT)}s`);
    if (state.slowT > 0) bits.push(`Slow ${Math.ceil(state.slowT)}s`);
    if (state.doubleT > 0) bits.push(`x2 ${Math.ceil(state.doubleT)}s`);
    return bits.length ? bits.join(" · ") : "—";
  }

  function updateHud() {
    const score = String(state.score);
    const lives = "♥".repeat(Math.max(0, state.lives)) || "—";
    const time = String(Math.ceil(state.timeLeft));
    const combo = state.combo > 1 ? `x${state.combo}` : "—";
    const hot = state.combo >= 5;
    const urgent = state.timeLeft <= 10;
    const level = `${state.levelIndex + 1}/${LEVELS.length}`;
    const power = powerLabel();

    if (hudCache.score !== score) {
      hudCache.score = score;
      hudScore.textContent = score;
    }
    if (hudCache.lives !== lives) {
      hudCache.lives = lives;
      hudLives.textContent = lives;
    }
    if (hudCache.time !== time) {
      hudCache.time = time;
      hudTime.textContent = time;
    }
    if (hudCombo && hudCache.combo !== combo) {
      hudCache.combo = combo;
      hudCombo.textContent = combo;
    }
    if (hudCombo && hudCache.hot !== hot) {
      hudCache.hot = hot;
      hudCombo.classList.toggle("is-hot", hot);
    }
    if (hudTime && hudCache.urgent !== urgent) {
      hudCache.urgent = urgent;
      hudTime.classList.toggle("is-urgent", urgent);
    }
    if (hudLevel && hudCache.level !== level) {
      hudCache.level = level;
      hudLevel.textContent = level;
    }
    if (hudPower && hudCache.power !== power) {
      hudCache.power = power;
      hudPower.textContent = power;
    }
  }

  function resetGame() {
    const { w, h } = logicalSize();
    state.score = 0;
    state.lives = 3;
    state.levelIndex = 0;
    state.timeLeft = currentLevel().duration;
    state.combo = 0;
    state.maxCombo = 0;
    state.levelBanner = 2.2;
    state.magnetT = 0;
    state.shield = false;
    state.slowT = 0;
    state.doubleT = 0;
    state.levelsCleared = 0;
    state.hurtThisLevel = false;
    state.drops = [];
    state.particles = [];
    state.floaters = [];
    state.shake = 0;
    state.flash = 0;
    state.comboPulse = 0;
    state.player.x = w / 2;
    state.player.y = h - 72;
    state.player.vx = 0;
    state.player.facing = 0;
    spawnTimer = 0.45;
    lastTickSecond = -1;
    nearMissCooldown = 0;
    updateHud();
  }

  function grantLife(x, y, reason = "+1 LIFE") {
    if (state.lives >= MAX_LIVES) {
      const bonus = 75;
      state.score += bonus;
      addFloater(x, y - 10, `+${bonus}`, "#ff4d6d");
      return false;
    }
    state.lives += 1;
    addFloater(x, y - 10, reason, "#ff4d6d");
    return true;
  }

  function spawnDrop() {
    if (state.drops.length >= quality.maxDrops) return;
    const { w } = logicalSize();
    const lvl = currentLevel();
    const roll = Math.random();
    let proto;
    const lifeChance = lvl.lifeChance || 0;

    if (roll < lifeChance) {
      proto = LIFE_BONUS;
    } else if (roll < lifeChance + lvl.powerChance) {
      proto = POWERS[(Math.random() * POWERS.length) | 0];
    } else if (roll < lifeChance + lvl.powerChance + lvl.curseChance) {
      proto = CURSES[(Math.random() * CURSES.length) | 0];
    } else {
      const t = Math.random();
      if (t < lvl.starChance) proto = TREATS[4];
      else if (lvl.pumpkinBias && t < lvl.pumpkinBias + lvl.starChance) proto = TREATS[3];
      else if (t < 0.45) proto = TREATS[0];
      else if (t < 0.7) proto = TREATS[1];
      else if (t < 0.88) proto = TREATS[2];
      else proto = TREATS[3];
    }

    const elapsedBoost = (lvl.duration - state.timeLeft) * 2.2;
    state.drops.push({
      ...proto,
      x: 24 + Math.random() * Math.max(8, w - 48),
      y: -28,
      vy: lvl.gravity + elapsedBoost + Math.random() * 60,
      vx: (Math.random() - 0.5) * 50,
      spin: (Math.random() - 0.5) * 5,
      rot: Math.random() * Math.PI * 2,
      wobble: Math.random() * Math.PI * 2,
    });
  }

  function burst(x, y, color, count = 8) {
    const n = Math.max(0, Math.round(count * quality.particleMul));
    for (let i = 0; i < n; i++) {
      if (state.particles.length >= quality.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 140;
      state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 50,
        life: 0.35 + Math.random() * 0.4,
        max: 0.75,
        color,
        size: 2 + Math.random() * 3.5,
      });
    }
  }

  function addFloater(x, y, text, color) {
    const big = /CLEAR|PERFECT|HOT|ONSLAUGHT/.test(text);
    state.floaters.push({
      x,
      y,
      text,
      color,
      life: big ? 1.15 : 0.9,
      max: big ? 1.15 : 0.9,
      vy: big ? -70 : -55,
      size: big ? 22 : 16,
    });
  }

  function hitPlayer(drop) {
    const p = state.player;
    const left = p.x - p.w / 2 + 6;
    const right = p.x + p.w / 2 - 6;
    const top = p.y - 10;
    const bottom = p.y + p.h - 2;
    return (
      drop.x + drop.r > left &&
      drop.x - drop.r < right &&
      drop.y + drop.r > top &&
      drop.y - drop.r < bottom
    );
  }

  function applyPower(drop) {
    if (drop.power === "life") {
      grantLife(drop.x, drop.y, "+1 LIFE");
      burst(drop.x, drop.y, drop.color, 22);
      burst(drop.x, drop.y, "#ffe4e9", 10);
      state.flash = 0.26;
      state.flashColor = "rgba(255, 120, 160, 0.38)";
      state.shake = Math.max(state.shake, 0.18);
      audio.heart();
      return;
    }
    if (drop.power === "magnet") state.magnetT = Math.max(state.magnetT, 7);
    if (drop.power === "shield") state.shield = true;
    if (drop.power === "slow") state.slowT = Math.max(state.slowT, 5.5);
    if (drop.power === "double") state.doubleT = Math.max(state.doubleT, 8);
    burst(drop.x, drop.y, drop.color, 14);
    addFloater(drop.x, drop.y - 10, drop.label || "POWER", drop.color);
    state.flash = 0.14;
    state.flashColor = "rgba(125, 211, 252, 0.28)";
    audio.power();
  }

  function advanceLevel() {
    const cleared = currentLevel();
    state.score += cleared.clearBonus;
    state.levelsCleared += 1;
    addFloater(viewW / 2, viewH * 0.35, `+${cleared.clearBonus} CLEAR`, "#c8f54a");

    // Perfect clear: no curse damage taken this level → bonus life
    if (!state.hurtThisLevel) {
      grantLife(viewW / 2, viewH * 0.42, "PERFECT +1♥");
    }

    state.flash = 0.34;
    state.flashColor = "rgba(200, 245, 74, 0.42)";
    state.shake = Math.max(state.shake, 0.24);

    if (state.levelIndex >= LEVELS.length - 1) {
      endGame(true);
      return;
    }

    state.levelIndex += 1;
    const next = currentLevel();
    state.timeLeft = next.duration;
    state.drops = [];
    state.hurtThisLevel = false;
    state.levelBanner = 2.4;
    spawnTimer = 0.55;
    lastTickSecond = -1;
    nearMissCooldown = 0;
    audio.levelUp();
    if (audio.isMusicOn()) audio.startMusic(true);
    updateHud();
  }

  function endGame(won = false) {
    running = false;
    paused = false;
    cancelAnimationFrame(rafId);
    audio.stopMusic();
    finalScore.textContent = String(state.score);
    const best = setBest(state.score);
    if (bestScoreEl) bestScoreEl.textContent = String(best);

    if (state.lives <= 0) {
      overTitle.textContent = "The night wins";
      overBlurb.textContent = `Reached ${currentLevel().name}. Max combo x${state.maxCombo}.`;
      audio.lose();
    } else if (won || state.levelsCleared >= LEVELS.length) {
      overTitle.textContent = "The vigil is kept";
      overBlurb.textContent = `All 5 nights cleared. Max combo x${state.maxCombo}.`;
      audio.win();
    } else if (state.score >= 800 || state.maxCombo >= 14) {
      overTitle.textContent = "A legendary haul";
      overBlurb.textContent = `${currentLevel().name} · combo x${state.maxCombo}.`;
      audio.win();
    } else if (state.score >= 350) {
      overTitle.textContent = "The moon remembers";
      overBlurb.textContent = `Cleared ${state.levelsCleared} nights. Combo x${state.maxCombo}.`;
      audio.win();
    } else {
      overTitle.textContent = "Dawn almost";
      overBlurb.textContent = `${currentLevel().name} · combo x${state.maxCombo}.`;
      audio.lose();
    }
    setScreen("over");
  }

  function startGame() {
    resizeCanvas(true);
    prewarmAssets();
    resetGame();
    aimX = null;
    pointerActive = false;
    running = true;
    paused = false;
    lastTs = 0;
    setScreen("playing");
    canvas.focus({ preventScroll: true });
    Promise.resolve(audio.unlock()).then(() => {
      if (!running || paused) return;
      if (!audio.isMuted()) audio.start();
      if (audio.isMusicOn()) audio.startMusic(true);
    });
    rafId = requestAnimationFrame(loop);
  }

  function togglePause() {
    if (!running) return;
    paused = !paused;
    if (paused) {
      aimX = null;
      pointerActive = false;
      keys.clear();
      audio.stopMusic();
      audio.pause();
      setScreen("pause");
      cancelAnimationFrame(rafId);
    } else {
      lastTs = 0;
      aimX = null;
      pointerActive = false;
      setScreen("playing");
      audio.resume();
      Promise.resolve(audio.unlock()).then(() => {
        if (!running || paused || !audio.isMusicOn()) return;
        audio.startMusic(true);
      });
      rafId = requestAnimationFrame(loop);
    }
  }

  function quitToStart() {
    if (!running && !paused) return;
    running = false;
    paused = false;
    cancelAnimationFrame(rafId);
    audio.stopMusic();
    aimX = null;
    pointerActive = false;
    keys.clear();
    setScreen("start");
    drawScene();
  }

  function update(dt) {
    const { w, h } = logicalSize();
    const p = state.player;
    const lvl = currentLevel();

    if (state.levelBanner > 0) {
      state.levelBanner = Math.max(0, state.levelBanner - dt);
      state.shake = Math.max(0, state.shake - dt);
      state.flash = Math.max(0, state.flash - dt);
      updateHud();
      return;
    }

    let input = 0;
    if (keys.has("ArrowLeft") || keys.has("a") || keys.has("A")) input -= 1;
    if (keys.has("ArrowRight") || keys.has("d") || keys.has("D")) input += 1;

    const prevX = p.x;
    const usingTouch = pointerKind === "touch" || (prefersTouch && pointerActive);
    const pointerProfile = usingTouch ? TOUCH : MOUSE;

    if (input !== 0) {
      // Keyboard / WASD — snappy accel, faster direction changes (desktop/laptop)
      p.speed = KEY.speed;
      const reversing = Math.sign(p.vx) !== 0 && Math.sign(p.vx) !== input;
      const accel = KEY.accel * (reversing ? KEY.reverse : 1);
      p.vx += input * accel * dt;
      p.vx = Math.max(-KEY.speed, Math.min(KEY.speed, p.vx));
      p.x += p.vx * dt;
    } else if (aimX != null) {
      // Touch / mouse / trackpad — exponential chase toward aim (smooth + fast)
      p.speed = pointerProfile.speed;
      const target = Math.max(p.w / 2, Math.min(w - p.w / 2, aimX));
      const dx = target - p.x;
      if (Math.abs(dx) <= pointerProfile.dead) {
        p.x = target;
        p.vx *= Math.pow(0.35, dt * 60);
        if (Math.abs(p.vx) < 10) p.vx = 0;
      } else {
        // Frame-rate independent ease; high catchUp = less lag behind finger/cursor
        const alpha = 1 - Math.exp(-pointerProfile.catchUp * dt);
        // Cap travel this frame so long flicks stay controllable
        const maxStep = pointerProfile.speed * dt;
        const step = Math.max(-maxStep, Math.min(maxStep, dx * Math.min(1, alpha * 1.35)));
        p.x += step;
        p.vx = (p.x - prevX) / Math.max(dt, 1 / 240);
        p.vx = Math.max(-pointerProfile.speed, Math.min(pointerProfile.speed, p.vx));
      }
    } else {
      p.vx *= Math.pow(KEY.friction, dt * 60);
      if (Math.abs(p.vx) < 14) p.vx = 0;
      p.x += p.vx * dt;
    }

    p.x = Math.max(p.w / 2, Math.min(w - p.w / 2, p.x));
    if (p.x <= p.w / 2 + 0.1 || p.x >= w - p.w / 2 - 0.1) p.vx = 0;

    const faceTarget = Math.max(-1, Math.min(1, p.vx / (p.speed * 0.5 || 1)));
    p.facing += (faceTarget - p.facing) * Math.min(1, dt * 18);

    if (
      quality.particleMul >= 0.55 &&
      state.particles.length < quality.maxParticles &&
      Math.abs(p.vx) > 40 &&
      Math.random() < dt * 22
    ) {
      const dir = Math.sign(p.vx) || 1;
      state.particles.push({
        x: p.x - dir * 10,
        y: p.y + 18,
        vx: -dir * 28 + (Math.random() - 0.5) * 24,
        vy: -10 + Math.random() * 10,
        life: 0.22,
        max: 0.22,
        color: "rgba(200,245,74,0.45)",
        size: 2 + Math.random() * 2,
      });
    }

    state.magnetT = Math.max(0, state.magnetT - dt);
    state.slowT = Math.max(0, state.slowT - dt);
    state.doubleT = Math.max(0, state.doubleT - dt);

    state.timeLeft -= dt;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      updateHud();
      advanceLevel();
      return;
    }

    const ceil = Math.ceil(state.timeLeft);
    if (ceil <= 10 && ceil !== lastTickSecond) {
      lastTickSecond = ceil;
      audio.tick();
      state.flash = 0.08;
      state.flashColor = "rgba(255, 77, 109, 0.18)";
    }

    const surging = state.timeLeft <= 12;
    let spawnRate = Math.max(0.26, lvl.spawn - (lvl.duration - state.timeLeft) * 0.006);
    if (surging) spawnRate = Math.max(0.18, spawnRate * 0.62);
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnDrop();
      const doubleChance =
        state.levelIndex >= 2 ? (surging ? 0.4 : 0.22) : 0;
      if (Math.random() < doubleChance) spawnDrop();
      spawnTimer = spawnRate * (0.65 + Math.random() * 0.45);
    }

    nearMissCooldown = Math.max(0, nearMissCooldown - dt);
    const fallMul = (state.slowT > 0 ? 0.45 : 1) * (surging ? 1.18 : 1);

    for (let i = state.drops.length - 1; i >= 0; i--) {
      const drop = state.drops[i];
      drop.wobble += dt * 4;

      if (state.magnetT > 0 && (drop.points || drop.power === "life")) {
        const dx = p.x - drop.x;
        const dy = p.y - drop.y;
        const dist = Math.hypot(dx, dy) || 1;
        // Full-field suction: pull every treat/heart on screen in fast
        if (dist < Math.max(w, h) + 80) {
          const nx = dx / dist;
          const ny = dy / dist;
          const near = 1 - Math.min(1, dist / 420);
          const accel = 980 + near * 720;
          drop.vx += nx * accel * dt;
          drop.vy += ny * accel * dt;
          // Blend toward a high approach speed so they don't drift past
          const targetSpeed = 520 + near * 380;
          const blend = Math.min(1, 10 * dt);
          drop.vx += (nx * targetSpeed - drop.vx) * blend;
          drop.vy += (ny * targetSpeed - drop.vy) * blend;
        }
      }

      drop.x += (drop.vx + Math.sin(drop.wobble) * 16) * dt * fallMul;
      drop.y += drop.vy * dt * fallMul;
      drop.rot += drop.spin * dt;
      drop.x = Math.max(drop.r, Math.min(w - drop.r, drop.x));

      if (hitPlayer(drop)) {
        if (drop.power) {
          applyPower(drop);
          state.drops.splice(i, 1);
          continue;
        }

        if (drop.points) {
          state.combo += 1;
          state.maxCombo = Math.max(state.maxCombo, state.combo);
          const mult =
            (1 + Math.floor((state.combo - 1) / 3) * 0.5) *
            (state.doubleT > 0 ? 2 : 1);
          const gained = Math.round(drop.points * mult);
          state.score += gained;
          burst(drop.x, drop.y, drop.color, drop.rare ? 28 : 10);
          addFloater(drop.x, drop.y - 10, `+${gained}`, drop.color);
          if (state.combo >= 3) {
            addFloater(drop.x + 18, drop.y + 8, `x${state.combo}`, "#c8f54a");
          }
          if (state.combo === 8) {
            addFloater(drop.x, drop.y - 28, "HOT x8", "#ff7a1a");
            burst(drop.x, drop.y, "#ff7a1a", 22);
          }
          if (
            state.combo === 5 ||
            state.combo === 10 ||
            state.combo === 15
          ) {
            state.flash = 0.24;
            state.flashColor = "rgba(200, 245, 74, 0.42)";
            state.shake = Math.max(state.shake, 0.22);
            burst(drop.x, drop.y, "#c8f54a", 20);
          }
          // Combo milestone: every 10 catches awards a bonus life
          if (state.combo > 0 && state.combo % 10 === 0) {
            grantLife(drop.x, drop.y - 22, `COMBO +1♥`);
          }
          if (drop.rare) {
            state.flash = 0.28;
            state.flashColor = "rgba(200, 245, 74, 0.45)";
            state.shake = Math.max(state.shake, 0.3);
            state.comboPulse = 0.5;
            audio.star();
          } else if (state.flash < 0.2) {
            state.flash = 0.1;
            state.flashColor = "rgba(255, 209, 102, 0.28)";
            state.comboPulse = 0.35;
          } else {
            state.comboPulse = Math.max(state.comboPulse, 0.35);
          }
          audio.catch(drop.points, state.combo);
        } else {
          if (state.shield) {
            state.shield = false;
            burst(drop.x, drop.y, "#a78bfa", 12);
            addFloater(drop.x, drop.y - 8, "BLOCKED", "#a78bfa");
            state.flash = 0.12;
            state.flashColor = "rgba(167, 139, 250, 0.3)";
            audio.power();
          } else {
            state.combo = 0;
            state.hurtThisLevel = true;
            state.lives -= drop.damage;
            burst(drop.x, drop.y, "#ff4d6d", 14);
            addFloater(drop.x, drop.y - 8, "OUCH", "#ff4d6d");
            state.shake = 0.32;
            state.flash = 0.16;
            state.flashColor = "rgba(255, 77, 109, 0.28)";
            audio.curse();
            if (state.lives <= 0) {
              state.drops.splice(i, 1);
              updateHud();
              endGame(false);
              return;
            }
          }
        }
        state.drops.splice(i, 1);
        continue;
      }

      // Curse near-miss: close pass without a hit
      if (
        !drop.points &&
        !drop.power &&
        nearMissCooldown <= 0 &&
        drop.damage
      ) {
        const dx = Math.abs(drop.x - p.x);
        const verticalNear =
          drop.y + drop.r > p.y - 10 && drop.y - drop.r < p.y + p.h;
        const gap = dx - (p.w / 2 - 6 + drop.r);
        if (verticalNear && gap > 0 && gap < 28) {
          nearMissCooldown = 1;
          addFloater(drop.x, drop.y - 6, "CLOSE!", "#ff8fab");
          audio.nearMiss();
        }
      }

      if (drop.y - drop.r > h + 20) {
        if (drop.points) state.combo = 0;
        state.drops.splice(i, 1);
      }
    }

    for (let i = state.particles.length - 1; i >= 0; i--) {
      const part = state.particles[i];
      part.life -= dt;
      part.x += part.vx * dt;
      part.y += part.vy * dt;
      part.vy += 240 * dt;
      if (part.life <= 0) state.particles.splice(i, 1);
    }

    for (let i = state.floaters.length - 1; i >= 0; i--) {
      const f = state.floaters[i];
      f.life -= dt;
      f.y += f.vy * dt;
      f.vy *= 0.98;
      if (f.life <= 0) state.floaters.splice(i, 1);
    }

    state.shake = Math.max(0, state.shake - dt);
    state.flash = Math.max(0, state.flash - dt);
    state.comboPulse = Math.max(0, state.comboPulse - dt);
    updateHud();
  }

  function paintSky(g, w, h, stops) {
    const sky = g.createLinearGradient(0, 0, 0, h);
    for (const [t, c] of stops) sky.addColorStop(t, c);
    g.fillStyle = sky;
    g.fillRect(0, 0, w, h);
  }

  function paintStars(g, w, h, count, seed = 1) {
    for (let i = 0; i < count; i++) {
      const x = ((i * 97 * seed) % w);
      const y = ((i * 53 * seed) % (h * 0.55));
      const r = 0.6 + ((i * 13) % 3) * 0.5;
      g.fillStyle = i % 5 === 0 ? "rgba(200,245,74,0.55)" : "rgba(255,255,255,0.45)";
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
    }
  }

  function paintGroundBand(g, w, h, colors, lip) {
    const groundY = h - 28;
    const grad = g.createLinearGradient(0, groundY - 30, 0, h);
    colors.forEach(([t, c]) => grad.addColorStop(t, c));
    g.fillStyle = grad;
    g.fillRect(0, groundY - 30, w, h - groundY + 30);
    g.strokeStyle = lip;
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(0, groundY);
    for (let x = 0; x <= w; x += 16) {
      g.lineTo(x, groundY + Math.sin(x * 0.09) * 2);
    }
    g.stroke();
  }

  function buildLevelBackground(theme, w, h) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d");
    const groundY = h - 28;

    if (theme === "candy") {
      // Spooky haunted-house lane — deep violet night + pumpkin moon
      paintSky(g, w, h, [
        [0, "#070510"],
        [0.35, "#1a0a2e"],
        [0.62, "#3a1848"],
        [0.82, "#5a2030"],
        [1, "#120810"],
      ]);
      paintStars(g, w, h, 42, 2);

      // Harvest moon
      const moonGlow = g.createRadialGradient(w * 0.78, 52, 6, w * 0.78, 52, 70);
      moonGlow.addColorStop(0, "rgba(255, 200, 90, 0.55)");
      moonGlow.addColorStop(0.45, "rgba(255, 122, 26, 0.2)");
      moonGlow.addColorStop(1, "rgba(255, 80, 20, 0)");
      g.fillStyle = moonGlow;
      g.beginPath();
      g.arc(w * 0.78, 52, 70, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#ffd48a";
      g.beginPath();
      g.arc(w * 0.78, 52, 26, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "rgba(180, 100, 40, 0.22)";
      g.beginPath();
      g.arc(w * 0.76, 48, 7, 0, Math.PI * 2);
      g.arc(w * 0.81, 58, 5, 0, Math.PI * 2);
      g.fill();

      // Distant tree line
      g.fillStyle = "#0c0814";
      g.beginPath();
      g.moveTo(0, groundY);
      for (let x = 0; x <= w; x += 18) {
        const th = 28 + ((x * 13) % 40);
        g.lineTo(x, groundY - th);
      }
      g.lineTo(w, groundY);
      g.closePath();
      g.fill();

      // Haunted manor silhouette (center-right)
      const hx = w * 0.42;
      const hw = Math.min(w * 0.42, 220);
      const hh = Math.min(h * 0.42, 180);
      const hy = groundY - hh;
      g.fillStyle = "#0a0612";
      // Main body
      g.fillRect(hx, hy + hh * 0.22, hw, hh * 0.78);
      // Left wing
      g.fillRect(hx - hw * 0.18, hy + hh * 0.38, hw * 0.22, hh * 0.62);
      // Right tower
      g.fillRect(hx + hw * 0.72, hy, hw * 0.28, hh);
      // Roofs
      g.beginPath();
      g.moveTo(hx - 4, hy + hh * 0.22);
      g.lineTo(hx + hw * 0.5, hy - 8);
      g.lineTo(hx + hw + 4, hy + hh * 0.22);
      g.closePath();
      g.fill();
      g.beginPath();
      g.moveTo(hx + hw * 0.7, hy);
      g.lineTo(hx + hw * 0.86, hy - 28);
      g.lineTo(hx + hw + 6, hy);
      g.closePath();
      g.fill();
      // Spire
      g.fillRect(hx + hw * 0.84, hy - 42, 4, 20);
      g.beginPath();
      g.moveTo(hx + hw * 0.84 - 4, hy - 42);
      g.lineTo(hx + hw * 0.86, hy - 56);
      g.lineTo(hx + hw * 0.84 + 8, hy - 42);
      g.closePath();
      g.fill();

      // Glowing windows
      for (const [wx, wy, ww, wh] of [
        [hx + hw * 0.18, hy + hh * 0.38, 14, 18],
        [hx + hw * 0.42, hy + hh * 0.38, 14, 18],
        [hx + hw * 0.28, hy + hh * 0.62, 16, 22],
        [hx + hw * 0.52, hy + hh * 0.62, 16, 22],
        [hx + hw * 0.8, hy + hh * 0.28, 12, 16],
        [hx + hw * 0.8, hy + hh * 0.52, 12, 16],
        [hx - hw * 0.1, hy + hh * 0.55, 10, 14],
      ]) {
        const glow = g.createRadialGradient(
          wx + ww / 2,
          wy + wh / 2,
          1,
          wx + ww / 2,
          wy + wh / 2,
          28
        );
        glow.addColorStop(0, "rgba(255, 180, 60, 0.55)");
        glow.addColorStop(1, "rgba(255, 100, 20, 0)");
        g.fillStyle = glow;
        g.fillRect(wx - 10, wy - 8, ww + 20, wh + 16);
        g.fillStyle = "#ffb84a";
        g.globalAlpha = 0.7;
        g.fillRect(wx, wy, ww, wh);
        g.globalAlpha = 1;
        g.strokeStyle = "#1a1020";
        g.lineWidth = 1;
        g.strokeRect(wx, wy, ww, wh);
        g.beginPath();
        g.moveTo(wx + ww / 2, wy);
        g.lineTo(wx + ww / 2, wy + wh);
        g.moveTo(wx, wy + wh / 2);
        g.lineTo(wx + ww, wy + wh / 2);
        g.stroke();
      }

      // Door
      g.fillStyle = "#120818";
      g.fillRect(hx + hw * 0.4, groundY - 36, hw * 0.14, 36);
      g.fillStyle = "rgba(255, 160, 50, 0.25)";
      g.beginPath();
      g.arc(hx + hw * 0.47, groundY - 18, 2.5, 0, Math.PI * 2);
      g.fill();

      // Bare trees flanking
      for (const [tx, th] of [
        [w * 0.1, 95],
        [w * 0.22, 70],
        [w * 0.92, 88],
      ]) {
        g.strokeStyle = "#140c1c";
        g.lineWidth = 4;
        g.lineCap = "round";
        g.beginPath();
        g.moveTo(tx, groundY);
        g.lineTo(tx, groundY - th);
        g.stroke();
        g.lineWidth = 2.5;
        g.beginPath();
        g.moveTo(tx, groundY - th * 0.55);
        g.lineTo(tx - 18, groundY - th * 0.85);
        g.moveTo(tx, groundY - th * 0.45);
        g.lineTo(tx + 16, groundY - th * 0.75);
        g.moveTo(tx, groundY - th * 0.72);
        g.lineTo(tx - 10, groundY - th * 0.95);
        g.moveTo(tx, groundY - th * 0.68);
        g.lineTo(tx + 12, groundY - th * 0.92);
        g.stroke();
      }

      // Crooked picket fence
      g.strokeStyle = "#2a1c30";
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(0, groundY - 22);
      g.lineTo(w * 0.38, groundY - 26);
      g.stroke();
      g.beginPath();
      g.moveTo(w * 0.78, groundY - 24);
      g.lineTo(w, groundY - 20);
      g.stroke();
      for (let x = 8; x < w * 0.38; x += 16) {
        g.fillStyle = "#241828";
        g.beginPath();
        g.moveTo(x - 3, groundY - 8);
        g.lineTo(x, groundY - 34 - (x % 7));
        g.lineTo(x + 3, groundY - 8);
        g.closePath();
        g.fill();
      }
      for (let x = w * 0.8; x < w - 6; x += 16) {
        g.fillStyle = "#241828";
        g.beginPath();
        g.moveTo(x - 3, groundY - 8);
        g.lineTo(x, groundY - 32 - (x % 5));
        g.lineTo(x + 3, groundY - 8);
        g.closePath();
        g.fill();
      }

      // Ground fog wash
      const fog = g.createLinearGradient(0, groundY - 50, 0, groundY);
      fog.addColorStop(0, "rgba(120, 90, 160, 0)");
      fog.addColorStop(1, "rgba(80, 50, 110, 0.28)");
      g.fillStyle = fog;
      g.fillRect(0, groundY - 50, w, 50);

      paintGroundBand(
        g,
        w,
        h,
        [
          [0, "rgba(255, 122, 26, 0)"],
          [0.35, "rgba(40, 16, 48, 0.65)"],
          [1, "rgba(8, 4, 12, 0.96)"],
        ],
        "rgba(255, 140, 60, 0.35)"
      );
    } else if (theme === "pumpkin") {
      // Jack-o'-lantern patch at Halloween dusk
      paintSky(g, w, h, [
        [0, "#0a0614"],
        [0.28, "#1c0c28"],
        [0.55, "#4a1828"],
        [0.78, "#c45a18"],
        [1, "#1a0c08"],
      ]);
      paintStars(g, w, h, 22, 5);

      // Low harvest sun on the horizon
      const sun = g.createRadialGradient(w * 0.5, groundY + 8, 10, w * 0.5, groundY + 8, 110);
      sun.addColorStop(0, "#ffe08a");
      sun.addColorStop(0.35, "#ff7a1a");
      sun.addColorStop(0.7, "rgba(180, 40, 20, 0.35)");
      sun.addColorStop(1, "rgba(80, 20, 40, 0)");
      g.fillStyle = sun;
      g.beginPath();
      g.arc(w * 0.5, groundY + 10, 100, Math.PI, 0);
      g.fill();

      // Distant hill ridge
      g.fillStyle = "#120818";
      g.beginPath();
      g.moveTo(0, groundY - 20);
      g.quadraticCurveTo(w * 0.25, groundY - 55, w * 0.5, groundY - 30);
      g.quadraticCurveTo(w * 0.75, groundY - 60, w, groundY - 24);
      g.lineTo(w, groundY);
      g.lineTo(0, groundY);
      g.closePath();
      g.fill();

      // Corn maze edges (left / right)
      const drawCorn = (baseX, count, lean) => {
        for (let i = 0; i < count; i++) {
          const x = baseX + i * 11;
          const tall = 55 + ((i * 17) % 35);
          g.strokeStyle = i % 2 ? "#4a6a22" : "#3a5818";
          g.lineWidth = 2.2;
          g.beginPath();
          g.moveTo(x, groundY);
          g.quadraticCurveTo(x + lean * 10, groundY - tall * 0.5, x + lean * 4, groundY - tall);
          g.stroke();
          g.strokeStyle = "#6b8f2a";
          g.lineWidth = 1.4;
          g.beginPath();
          g.moveTo(x + lean * 2, groundY - tall * 0.55);
          g.lineTo(x + lean * 14, groundY - tall * 0.7);
          g.moveTo(x + lean * 2, groundY - tall * 0.4);
          g.lineTo(x - lean * 10, groundY - tall * 0.58);
          g.stroke();
        }
      };
      drawCorn(6, 7, 1);
      drawCorn(w - 82, 7, -1);

      // Scarecrow silhouette
      const sx = w * 0.18;
      const sy = groundY - 95;
      g.strokeStyle = "#1a100c";
      g.fillStyle = "#1a100c";
      g.lineWidth = 4;
      g.lineCap = "round";
      g.beginPath();
      g.moveTo(sx, groundY);
      g.lineTo(sx, sy + 20);
      g.stroke();
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(sx - 28, sy + 38);
      g.lineTo(sx + 30, sy + 32);
      g.stroke();
      g.beginPath();
      g.ellipse(sx, sy + 12, 11, 13, 0, 0, Math.PI * 2);
      g.fill();
      // Hat
      g.fillRect(sx - 14, sy + 2, 28, 5);
      g.beginPath();
      g.moveTo(sx - 9, sy + 2);
      g.lineTo(sx - 7, sy - 14);
      g.lineTo(sx + 9, sy - 12);
      g.lineTo(sx + 11, sy + 2);
      g.closePath();
      g.fill();
      // Floppy coat
      g.beginPath();
      g.moveTo(sx - 16, sy + 28);
      g.lineTo(sx - 22, sy + 70);
      g.lineTo(sx + 20, sy + 70);
      g.lineTo(sx + 14, sy + 26);
      g.closePath();
      g.fill();

      // Crooked fence behind the field
      g.strokeStyle = "#2a1a10";
      g.lineWidth = 2.5;
      g.beginPath();
      g.moveTo(w * 0.32, groundY - 40);
      g.lineTo(w * 0.95, groundY - 34);
      g.stroke();
      for (let x = w * 0.34; x < w * 0.95; x += 26) {
        g.fillStyle = "#2e1c12";
        g.fillRect(x, groundY - 56, 5, 38);
        g.beginPath();
        g.moveTo(x - 1, groundY - 56);
        g.lineTo(x + 2.5, groundY - 66);
        g.lineTo(x + 6, groundY - 56);
        g.fill();
      }

      // Helper: draw a pumpkin (plain or carved)
      const paintPumpkin = (x, y, r, carved = false, shade = "#e8650e") => {
        g.fillStyle = shade;
        g.beginPath();
        g.ellipse(x, y, r, r * 0.78, 0, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = "rgba(0,0,0,0.12)";
        g.beginPath();
        g.ellipse(x - r * 0.35, y, r * 0.28, r * 0.7, 0, 0, Math.PI * 2);
        g.ellipse(x + r * 0.35, y, r * 0.28, r * 0.7, 0, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = "#3f8a2c";
        g.fillRect(x - 2, y - r * 0.9, 4, r * 0.35);
        if (carved) {
          const glow = g.createRadialGradient(x, y, 2, x, y, r * 1.4);
          glow.addColorStop(0, "rgba(255, 200, 80, 0.55)");
          glow.addColorStop(1, "rgba(255, 100, 20, 0)");
          g.fillStyle = glow;
          g.beginPath();
          g.arc(x, y, r * 1.15, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = "#ffd166";
          g.beginPath();
          g.moveTo(x - r * 0.35, y - r * 0.15);
          g.lineTo(x - r * 0.15, y + r * 0.05);
          g.lineTo(x - r * 0.45, y + r * 0.05);
          g.closePath();
          g.moveTo(x + r * 0.35, y - r * 0.15);
          g.lineTo(x + r * 0.15, y + r * 0.05);
          g.lineTo(x + r * 0.45, y + r * 0.05);
          g.closePath();
          g.fill();
          g.beginPath();
          g.moveTo(x - r * 0.35, y + r * 0.25);
          g.quadraticCurveTo(x, y + r * 0.55, x + r * 0.35, y + r * 0.25);
          g.quadraticCurveTo(x, y + r * 0.38, x - r * 0.35, y + r * 0.25);
          g.fill();
        }
      };

      // Field pumpkins (layered)
      paintPumpkin(w * 0.08, groundY - 6, 11, false, "#c45a12");
      paintPumpkin(w * 0.28, groundY - 5, 13, false, "#e8650e");
      paintPumpkin(w * 0.72, groundY - 6, 12, true);
      paintPumpkin(w * 0.88, groundY - 5, 15, false, "#d4550c");
      paintPumpkin(w * 0.58, groundY - 4, 10, false, "#b84810");

      // Hero jack-o'-lantern (midground)
      const jx = w * 0.5;
      const jy = groundY - 22;
      const jr = Math.min(48, w * 0.11);
      const jackGlow = g.createRadialGradient(jx, jy, 4, jx, jy, jr * 2.2);
      jackGlow.addColorStop(0, "rgba(255, 200, 80, 0.65)");
      jackGlow.addColorStop(0.5, "rgba(255, 122, 26, 0.28)");
      jackGlow.addColorStop(1, "rgba(255, 80, 20, 0)");
      g.fillStyle = jackGlow;
      g.beginPath();
      g.arc(jx, jy, jr * 2.1, 0, Math.PI * 2);
      g.fill();
      paintPumpkin(jx, jy, jr, true, "#ff7a1a");
      // Extra bold face on hero
      g.fillStyle = "#ffe08a";
      g.beginPath();
      g.moveTo(jx - jr * 0.4, jy - jr * 0.2);
      g.lineTo(jx - jr * 0.12, jy + jr * 0.08);
      g.lineTo(jx - jr * 0.52, jy + jr * 0.08);
      g.closePath();
      g.moveTo(jx + jr * 0.4, jy - jr * 0.2);
      g.lineTo(jx + jr * 0.12, jy + jr * 0.08);
      g.lineTo(jx + jr * 0.52, jy + jr * 0.08);
      g.closePath();
      g.fill();
      g.beginPath();
      g.moveTo(jx - jr * 0.42, jy + jr * 0.28);
      g.lineTo(jx - jr * 0.2, jy + jr * 0.48);
      g.lineTo(jx, jy + jr * 0.32);
      g.lineTo(jx + jr * 0.2, jy + jr * 0.48);
      g.lineTo(jx + jr * 0.42, jy + jr * 0.28);
      g.quadraticCurveTo(jx, jy + jr * 0.42, jx - jr * 0.42, jy + jr * 0.28);
      g.fill();

      // Ground haze
      const haze = g.createLinearGradient(0, groundY - 40, 0, groundY);
      haze.addColorStop(0, "rgba(255, 140, 40, 0)");
      haze.addColorStop(1, "rgba(80, 30, 10, 0.35)");
      g.fillStyle = haze;
      g.fillRect(0, groundY - 40, w, 40);

      paintGroundBand(
        g,
        w,
        h,
        [
          [0, "rgba(255, 122, 26, 0)"],
          [0.3, "rgba(60, 24, 10, 0.55)"],
          [1, "rgba(10, 6, 4, 0.97)"],
        ],
        "rgba(255, 140, 40, 0.45)"
      );
    } else if (theme === "alley") {
      // Gothic bat alley — narrow street between haunted tenements
      paintSky(g, w, h, [
        [0, "#05040c"],
        [0.4, "#120c24"],
        [0.75, "#2a1440"],
        [1, "#0a0814"],
      ]);
      paintStars(g, w, h, 34, 3);

      // Sliver of orange moon between rooftops
      const moon = g.createRadialGradient(w * 0.5, 36, 4, w * 0.5, 36, 40);
      moon.addColorStop(0, "rgba(255, 200, 120, 0.7)");
      moon.addColorStop(1, "rgba(255, 100, 40, 0)");
      g.fillStyle = moon;
      g.beginPath();
      g.arc(w * 0.5, 36, 38, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#ffd4a0";
      g.beginPath();
      g.arc(w * 0.5, 36, 14, 0, Math.PI * 2);
      g.fill();

      const wallW = Math.min(88, w * 0.2);
      // Layered building silhouettes (back)
      g.fillStyle = "#100c1a";
      g.fillRect(0, 20, wallW + 18, groundY - 20);
      g.fillRect(w - wallW - 18, 30, wallW + 18, groundY - 30);
      // Front walls
      g.fillStyle = "#1a1428";
      g.fillRect(0, 0, wallW, groundY);
      g.fillRect(w - wallW, 0, wallW, groundY);
      // Roofline teeth
      g.fillStyle = "#0e0a16";
      for (let i = 0; i < 5; i++) {
        const rx = 4 + i * (wallW / 5);
        g.beginPath();
        g.moveTo(rx, 8);
        g.lineTo(rx + wallW / 10, -6);
        g.lineTo(rx + wallW / 5, 8);
        g.fill();
        const rx2 = w - wallW + rx;
        g.beginPath();
        g.moveTo(rx2, 12);
        g.lineTo(rx2 + wallW / 10, -2);
        g.lineTo(rx2 + wallW / 5, 12);
        g.fill();
      }
      // Brick hints
      g.fillStyle = "rgba(255, 90, 70, 0.07)";
      for (let y = 24; y < groundY - 16; y += 14) {
        for (let x = 6; x < wallW - 8; x += 16) {
          g.fillRect(x + ((y / 14) % 2) * 6, y, 12, 9);
          g.fillRect(w - wallW + x + ((y / 14) % 2) * 6, y + 6, 12, 9);
        }
      }

      // Glowing windows (pumpkin orange + violet + pink)
      const windows = [
        [wallW * 0.28, h * 0.18, "#ffb84a", "rgba(255,180,60,0.45)"],
        [wallW * 0.55, h * 0.18, "#c4a0ff", "rgba(180,140,255,0.4)"],
        [wallW * 0.28, h * 0.36, "#ff8fab", "rgba(255,140,180,0.4)"],
        [wallW * 0.55, h * 0.36, "#ffb84a", "rgba(255,180,60,0.45)"],
        [wallW * 0.4, h * 0.54, "#ff7a1a", "rgba(255,120,30,0.4)"],
        [w - wallW * 0.72, h * 0.2, "#ffb84a", "rgba(255,180,60,0.45)"],
        [w - wallW * 0.45, h * 0.2, "#a78bfa", "rgba(180,140,255,0.4)"],
        [w - wallW * 0.72, h * 0.38, "#ffb84a", "rgba(255,180,60,0.45)"],
        [w - wallW * 0.45, h * 0.52, "#ff8fab", "rgba(255,140,180,0.4)"],
      ];
      for (const [x, y, col, rgba] of windows) {
        const rg = g.createRadialGradient(x + 8, y + 10, 1, x + 8, y + 10, 26);
        rg.addColorStop(0, rgba);
        rg.addColorStop(1, "rgba(0,0,0,0)");
        g.fillStyle = rg;
        g.fillRect(x - 8, y - 6, 32, 36);
        g.fillStyle = col;
        g.globalAlpha = 0.65;
        g.fillRect(x, y, 15, 20);
        g.globalAlpha = 1;
        g.strokeStyle = "#2a2038";
        g.strokeRect(x, y, 15, 20);
      }

      // Hanging lanterns
      for (const lx of [wallW + 10, w - wallW - 10]) {
        g.strokeStyle = "rgba(200,180,140,0.35)";
        g.lineWidth = 1.5;
        g.beginPath();
        g.moveTo(lx, 48);
        g.lineTo(lx, 72);
        g.stroke();
        const lg = g.createRadialGradient(lx, 82, 2, lx, 82, 28);
        lg.addColorStop(0, "rgba(255, 180, 60, 0.55)");
        lg.addColorStop(1, "rgba(255, 100, 20, 0)");
        g.fillStyle = lg;
        g.beginPath();
        g.arc(lx, 82, 28, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = "#ffb84a";
        g.beginPath();
        g.moveTo(lx - 6, 76);
        g.lineTo(lx + 6, 76);
        g.lineTo(lx + 5, 88);
        g.lineTo(lx - 5, 88);
        g.closePath();
        g.fill();
      }

      // Clothesline + hanging sheets
      g.strokeStyle = "rgba(180,180,210,0.4)";
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(wallW, h * 0.3);
      g.quadraticCurveTo(w / 2, h * 0.24, w - wallW, h * 0.32);
      g.stroke();
      g.fillStyle = "rgba(160, 150, 190, 0.18)";
      g.fillRect(w * 0.38, h * 0.26, 18, 28);
      g.fillRect(w * 0.55, h * 0.25, 14, 24);

      // Cobble hint in alley floor
      g.fillStyle = "rgba(80, 70, 110, 0.2)";
      for (let x = wallW + 8; x < w - wallW - 8; x += 14) {
        g.beginPath();
        g.ellipse(x, groundY - 8, 6, 3, 0, 0, Math.PI * 2);
        g.fill();
      }

      // Cat silhouette on left sill
      g.fillStyle = "#0a0812";
      g.beginPath();
      g.ellipse(wallW - 18, h * 0.48, 8, 5, 0, 0, Math.PI * 2);
      g.fill();
      g.beginPath();
      g.moveTo(wallW - 24, h * 0.46);
      g.lineTo(wallW - 26, h * 0.4);
      g.lineTo(wallW - 20, h * 0.45);
      g.moveTo(wallW - 14, h * 0.46);
      g.lineTo(wallW - 12, h * 0.39);
      g.lineTo(wallW - 18, h * 0.45);
      g.fill();

      // Static bat flock
      g.fillStyle = "rgba(90, 100, 140, 0.55)";
      for (const [bx, by, s] of [
        [w * 0.35, 44, 1],
        [w * 0.42, 58, 1.2],
        [w * 0.5, 40, 0.9],
        [w * 0.58, 62, 1.1],
        [w * 0.65, 48, 1],
      ]) {
        g.beginPath();
        g.moveTo(bx, by);
        g.quadraticCurveTo(bx - 12 * s, by - 8 * s, bx - 14 * s, by);
        g.quadraticCurveTo(bx - 6 * s, by - 2 * s, bx, by + 3 * s);
        g.quadraticCurveTo(bx + 6 * s, by - 2 * s, bx + 14 * s, by);
        g.quadraticCurveTo(bx + 12 * s, by - 8 * s, bx, by);
        g.fill();
      }

      paintGroundBand(
        g,
        w,
        h,
        [
          [0, "rgba(140, 100, 220, 0)"],
          [0.35, "rgba(24, 14, 40, 0.7)"],
          [1, "rgba(6, 4, 12, 0.97)"],
        ],
        "rgba(180, 120, 255, 0.28)"
      );
    } else if (theme === "grave") {
      // Moonlit cemetery — iron gates, crypt, restless mist
      paintSky(g, w, h, [
        [0, "#060a0c"],
        [0.35, "#0e1c18"],
        [0.65, "#1a3028"],
        [0.85, "#243828"],
        [1, "#080c0a"],
      ]);
      paintStars(g, w, h, 40, 7);

      // Pale green moon with soft clouds
      const moon = g.createRadialGradient(w * 0.8, 48, 6, w * 0.8, 48, 55);
      moon.addColorStop(0, "#eef8e4");
      moon.addColorStop(0.4, "rgba(200, 230, 180, 0.55)");
      moon.addColorStop(1, "rgba(140, 180, 140, 0)");
      g.fillStyle = moon;
      g.beginPath();
      g.arc(w * 0.8, 48, 50, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#e8f0dc";
      g.beginPath();
      g.arc(w * 0.8, 48, 28, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "rgba(40, 60, 45, 0.2)";
      g.beginPath();
      g.arc(w * 0.77, 42, 6, 0, Math.PI * 2);
      g.arc(w * 0.84, 54, 5, 0, Math.PI * 2);
      g.fill();
      // Cloud wisps across moon
      g.fillStyle = "rgba(20, 36, 28, 0.35)";
      g.beginPath();
      g.ellipse(w * 0.72, 56, 28, 7, 0, 0, Math.PI * 2);
      g.ellipse(w * 0.88, 40, 22, 6, 0, 0, Math.PI * 2);
      g.fill();

      // Dead tree left
      g.strokeStyle = "#1a2820";
      g.lineWidth = 4;
      g.lineCap = "round";
      g.beginPath();
      g.moveTo(w * 0.1, groundY);
      g.lineTo(w * 0.12, groundY - 100);
      g.stroke();
      g.lineWidth = 2.5;
      for (const [ax, ay, bx, by] of [
        [w * 0.12, groundY - 60, w * 0.02, groundY - 90],
        [w * 0.12, groundY - 75, w * 0.22, groundY - 105],
        [w * 0.12, groundY - 45, w * 0.2, groundY - 70],
      ]) {
        g.beginPath();
        g.moveTo(ax, ay);
        g.quadraticCurveTo((ax + bx) / 2, (ay + by) / 2 - 8, bx, by);
        g.stroke();
      }

      // Crypt / mausoleum right
      const cx = w * 0.78;
      const cy = groundY - 78;
      g.fillStyle = "#243028";
      g.fillRect(cx, cy + 18, 70, 60);
      g.beginPath();
      g.moveTo(cx - 4, cy + 18);
      g.lineTo(cx + 35, cy);
      g.lineTo(cx + 74, cy + 18);
      g.closePath();
      g.fill();
      g.fillStyle = "#0c100e";
      g.fillRect(cx + 24, groundY - 36, 22, 36);
      g.fillStyle = "rgba(200, 245, 74, 0.15)";
      g.fillRect(cx + 12, cy + 28, 12, 14);
      g.fillRect(cx + 46, cy + 28, 12, 14);

      // Wrought iron gate arch (center)
      g.strokeStyle = "#2e3c34";
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(w * 0.28, groundY);
      g.lineTo(w * 0.28, groundY - 72);
      g.quadraticCurveTo(w * 0.5, groundY - 110, w * 0.72, groundY - 72);
      g.lineTo(w * 0.72, groundY);
      g.stroke();
      g.lineWidth = 2;
      for (let x = w * 0.3; x < w * 0.7; x += 12) {
        const top = groundY - 72 - Math.sin(((x - w * 0.28) / (w * 0.44)) * Math.PI) * 28;
        g.beginPath();
        g.moveTo(x, groundY);
        g.lineTo(x, top);
        g.stroke();
        g.beginPath();
        g.moveTo(x - 2, top);
        g.lineTo(x + 2, top - 8);
        g.lineTo(x + 6, top);
        g.stroke();
      }
      // Gate crossbar
      g.beginPath();
      g.moveTo(w * 0.3, groundY - 40);
      g.lineTo(w * 0.7, groundY - 40);
      g.stroke();

      // Tombstones (varied)
      const stones = [
        [w * 0.14, 38, 26, "arch"],
        [w * 0.36, 30, 20, "cross"],
        [w * 0.52, 42, 24, "arch"],
        [w * 0.66, 28, 18, "slab"],
        [w * 0.9, 34, 22, "arch"],
      ];
      for (const [x, hh, ww, shape] of stones) {
        g.fillStyle = "#3a4540";
        if (shape === "cross") {
          g.fillRect(x - 3, groundY - hh, 6, hh);
          g.fillRect(x - 10, groundY - hh + 8, 20, 5);
        } else if (shape === "slab") {
          g.fillRect(x - ww / 2, groundY - hh, ww, hh);
        } else {
          g.beginPath();
          g.moveTo(x - ww / 2, groundY);
          g.lineTo(x - ww / 2, groundY - hh + 10);
          g.quadraticCurveTo(x, groundY - hh - 8, x + ww / 2, groundY - hh + 10);
          g.lineTo(x + ww / 2, groundY);
          g.closePath();
          g.fill();
        }
        g.fillStyle = "rgba(200,245,74,0.14)";
        g.fillRect(x - 5, groundY - hh * 0.5, 10, 3);
        g.fillRect(x - 1.5, groundY - hh * 0.65, 3, 12);
      }

      // Owl on gate
      g.fillStyle = "#1a2420";
      g.beginPath();
      g.ellipse(w * 0.5, groundY - 98, 7, 9, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "rgba(200,245,74,0.35)";
      g.beginPath();
      g.arc(w * 0.48, groundY - 100, 1.5, 0, Math.PI * 2);
      g.arc(w * 0.52, groundY - 100, 1.5, 0, Math.PI * 2);
      g.fill();

      // Mist banks
      g.fillStyle = "rgba(160, 200, 170, 0.1)";
      g.beginPath();
      g.ellipse(w * 0.3, groundY - 18, w * 0.28, 16, 0, 0, Math.PI * 2);
      g.ellipse(w * 0.7, groundY - 12, w * 0.32, 14, 0, 0, Math.PI * 2);
      g.fill();

      paintGroundBand(
        g,
        w,
        h,
        [
          [0, "rgba(120, 180, 130, 0)"],
          [0.35, "rgba(14, 28, 18, 0.72)"],
          [1, "rgba(4, 10, 8, 0.97)"],
        ],
        "rgba(150, 210, 160, 0.3)"
      );
    } else {
      // Midnight Haunt — final night: ruined chapel under a cracked green moon
      paintSky(g, w, h, [
        [0, "#010204"],
        [0.3, "#06140e"],
        [0.55, "#0c2418"],
        [0.8, "#143020"],
        [1, "#040806"],
      ]);
      paintStars(g, w, h, 58, 11);

      // Massive cracked haunt moon
      const moon = g.createRadialGradient(w * 0.68, 64, 12, w * 0.68, 64, 95);
      moon.addColorStop(0, "#f5ffe8");
      moon.addColorStop(0.3, "#d4f0a0");
      moon.addColorStop(0.65, "rgba(200, 245, 74, 0.35)");
      moon.addColorStop(1, "rgba(200, 245, 74, 0)");
      g.fillStyle = moon;
      g.beginPath();
      g.arc(w * 0.68, 64, 88, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#eaf8c8";
      g.beginPath();
      g.arc(w * 0.68, 64, 52, 0, Math.PI * 2);
      g.fill();
      // Craters + cracks
      g.fillStyle = "rgba(20, 40, 24, 0.28)";
      g.beginPath();
      g.arc(w * 0.62, 52, 10, 0, Math.PI * 2);
      g.arc(w * 0.74, 78, 8, 0, Math.PI * 2);
      g.arc(w * 0.7, 48, 5, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "rgba(40, 70, 40, 0.4)";
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(w * 0.6, 40);
      g.lineTo(w * 0.66, 70);
      g.lineTo(w * 0.72, 55);
      g.moveTo(w * 0.7, 90);
      g.lineTo(w * 0.76, 60);
      g.stroke();

      // Ruined chapel silhouette (center)
      const chx = w * 0.38;
      const chw = Math.min(w * 0.32, 160);
      const chh = Math.min(h * 0.38, 150);
      g.fillStyle = "#0c1610";
      g.fillRect(chx, groundY - chh * 0.7, chw, chh * 0.7);
      // Broken roof
      g.beginPath();
      g.moveTo(chx - 6, groundY - chh * 0.7);
      g.lineTo(chx + chw * 0.35, groundY - chh);
      g.lineTo(chx + chw * 0.55, groundY - chh * 0.78);
      g.lineTo(chx + chw * 0.7, groundY - chh * 0.95);
      g.lineTo(chx + chw + 6, groundY - chh * 0.65);
      g.lineTo(chx + chw, groundY - chh * 0.7);
      g.closePath();
      g.fill();
      // Bell tower stub
      g.fillRect(chx + chw * 0.7, groundY - chh * 1.05, chw * 0.22, chh * 0.4);
      g.beginPath();
      g.moveTo(chx + chw * 0.68, groundY - chh * 1.05);
      g.lineTo(chx + chw * 0.81, groundY - chh * 1.22);
      g.lineTo(chx + chw * 0.94, groundY - chh * 1.05);
      g.closePath();
      g.fill();
      // Glowing doorway (haunt portal)
      const portal = g.createRadialGradient(
        chx + chw * 0.45,
        groundY - 28,
        4,
        chx + chw * 0.45,
        groundY - 28,
        50
      );
      portal.addColorStop(0, "rgba(200, 245, 74, 0.55)");
      portal.addColorStop(0.5, "rgba(200, 245, 74, 0.18)");
      portal.addColorStop(1, "rgba(200, 245, 74, 0)");
      g.fillStyle = portal;
      g.beginPath();
      g.arc(chx + chw * 0.45, groundY - 28, 48, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#c8f54a";
      g.globalAlpha = 0.55;
      g.beginPath();
      g.moveTo(chx + chw * 0.32, groundY);
      g.lineTo(chx + chw * 0.32, groundY - 48);
      g.quadraticCurveTo(chx + chw * 0.45, groundY - 62, chx + chw * 0.58, groundY - 48);
      g.lineTo(chx + chw * 0.58, groundY);
      g.closePath();
      g.fill();
      g.globalAlpha = 1;
      // Window glow in chapel
      g.fillStyle = "rgba(200, 245, 74, 0.35)";
      g.fillRect(chx + chw * 0.15, groundY - chh * 0.5, 14, 18);
      g.fillRect(chx + chw * 0.65, groundY - chh * 0.48, 12, 16);

      // Dead trees flanking
      const drawHauntTree = (tx, th, lean) => {
        g.strokeStyle = "#15261a";
        g.lineWidth = 5;
        g.lineCap = "round";
        g.beginPath();
        g.moveTo(tx, groundY);
        g.lineTo(tx + lean * 8, groundY - th);
        g.stroke();
        g.lineWidth = 2.8;
        g.beginPath();
        g.moveTo(tx + lean * 4, groundY - th * 0.55);
        g.lineTo(tx + lean * 28, groundY - th * 0.85);
        g.moveTo(tx + lean * 3, groundY - th * 0.4);
        g.lineTo(tx - lean * 20, groundY - th * 0.7);
        g.moveTo(tx + lean * 6, groundY - th * 0.7);
        g.lineTo(tx + lean * 18, groundY - th * 0.95);
        g.stroke();
      };
      drawHauntTree(w * 0.1, 115, 1);
      drawHauntTree(w * 0.9, 100, -1);

      // Ruined pillars right
      g.fillStyle = "#1e2e24";
      g.fillRect(w * 0.82, groundY - 88, 14, 88);
      g.fillRect(w * 0.92, groundY - 64, 12, 64);
      g.fillStyle = "#2a3c30";
      g.fillRect(w * 0.8, groundY - 94, 20, 9);
      g.fillRect(w * 0.9, groundY - 70, 18, 8);

      // Scattered rubble / bones hint
      g.fillStyle = "#243428";
      g.fillRect(w * 0.22, groundY - 10, 18, 6);
      g.fillRect(w * 0.7, groundY - 8, 14, 5);
      g.strokeStyle = "rgba(220, 230, 200, 0.2)";
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(w * 0.3, groundY - 4);
      g.lineTo(w * 0.34, groundY - 14);
      g.moveTo(w * 0.74, groundY - 3);
      g.lineTo(w * 0.78, groundY - 12);
      g.stroke();

      // Thick green haunt fog
      const fog = g.createRadialGradient(w * 0.5, groundY, 20, w * 0.5, groundY, w * 0.6);
      fog.addColorStop(0, "rgba(200, 245, 74, 0.16)");
      fog.addColorStop(1, "rgba(200, 245, 74, 0)");
      g.fillStyle = fog;
      g.fillRect(0, groundY - 70, w, 70);

      paintGroundBand(
        g,
        w,
        h,
        [
          [0, "rgba(200, 245, 74, 0)"],
          [0.3, "rgba(10, 28, 14, 0.7)"],
          [1, "rgba(2, 8, 4, 0.98)"],
        ],
        "rgba(200, 245, 74, 0.45)"
      );
    }

    return c;
  }

  function getBackground(theme, w, h) {
    const key = `${theme}:${w}x${h}`;
    if (!bgCache.has(key)) {
      bgCache.set(key, buildLevelBackground(theme, w, h));
    }
    return bgCache.get(key);
  }

  function drawBackground(w, h) {
    const lvl = currentLevel();
    const theme = lvl.theme || "candy";
    ctx.drawImage(getBackground(theme, w, h), 0, 0);

    if (!quality.bgMotion) return;

    // Light animated accents per theme (cheap overlays)
    const t = performance.now() * 0.001;
    const groundY = h - 28;

    if (theme === "candy") {
      // Flickering window glow + moon pulse
      ctx.globalAlpha = 0.12 + Math.sin(t * 3.2) * 0.06;
      ctx.fillStyle = "#ffb84a";
      ctx.beginPath();
      ctx.arc(w * 0.62, h * 0.42, 36 + Math.sin(t * 2) * 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.1 + Math.sin(t * 1.4) * 0.04;
      ctx.fillStyle = "#ff7a1a";
      ctx.beginPath();
      ctx.arc(w * 0.78, 52, 34 + Math.sin(t) * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      // Drifting fog wisps
      ctx.fillStyle = `rgba(140, 110, 180, ${0.06 + Math.sin(t * 0.7) * 0.03})`;
      ctx.beginPath();
      ctx.ellipse(
        w * 0.25 + Math.sin(t * 0.4) * 24,
        groundY - 16,
        w * 0.22,
        12,
        0,
        0,
        Math.PI * 2
      );
      ctx.ellipse(
        w * 0.7 + Math.cos(t * 0.35) * 18,
        groundY - 12,
        w * 0.18,
        10,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    } else if (theme === "pumpkin") {
      // Jack-o'-lantern flicker + ground heat shimmer
      const pulse = 0.14 + Math.sin(t * 4.5) * 0.08;
      ctx.globalAlpha = pulse;
      ctx.fillStyle = "#ffb84a";
      ctx.beginPath();
      ctx.arc(w * 0.5, groundY - 22, 55 + Math.sin(t * 3) * 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = pulse * 0.7;
      ctx.beginPath();
      ctx.arc(w * 0.72, groundY - 6, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = `rgba(255, 180, 60, ${0.12 + Math.sin(t * 2) * 0.05})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      for (let x = 0; x <= w; x += 18) {
        ctx.lineTo(x, groundY + Math.sin(x * 0.08 + t * 2) * 2.2);
      }
      ctx.stroke();
      // Drifting embers
      ctx.fillStyle = `rgba(255, 200, 100, ${0.25 + Math.sin(t * 3) * 0.15})`;
      for (let i = 0; i < 5; i++) {
        const ex = w * (0.2 + i * 0.15) + Math.sin(t * 1.2 + i) * 12;
        const ey = groundY - 50 - i * 18 + Math.cos(t * 1.6 + i) * 10;
        ctx.beginPath();
        ctx.arc(ex, ey, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (theme === "alley") {
      // Flying bats + lantern pulse
      ctx.fillStyle = "rgba(100, 110, 150, 0.55)";
      for (let i = 0; i < 5; i++) {
        const bx = w * (0.28 + i * 0.1) + Math.sin(t * 1.6 + i) * 22;
        const by = 36 + i * 12 + Math.cos(t * 2.1 + i) * 8;
        const s = 0.85 + (i % 3) * 0.15;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.quadraticCurveTo(bx - 12 * s, by - 8 * s, bx - 14 * s, by);
        ctx.quadraticCurveTo(bx - 6 * s, by - 2 * s, bx, by + 3 * s);
        ctx.quadraticCurveTo(bx + 6 * s, by - 2 * s, bx + 14 * s, by);
        ctx.quadraticCurveTo(bx + 12 * s, by - 8 * s, bx, by);
        ctx.fill();
      }
      const wallW = Math.min(88, w * 0.2);
      ctx.globalAlpha = 0.15 + Math.sin(t * 3.5) * 0.08;
      ctx.fillStyle = "#ffb84a";
      ctx.beginPath();
      ctx.arc(wallW + 10, 82, 22, 0, Math.PI * 2);
      ctx.arc(w - wallW - 10, 82, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    } else if (theme === "grave") {
      // Drifting cemetery mist + owl eye blink
      ctx.fillStyle = `rgba(160, 200, 170, ${0.07 + Math.sin(t * 0.8) * 0.035})`;
      ctx.beginPath();
      ctx.ellipse(
        w * 0.35 + Math.sin(t * 0.45) * 24,
        groundY - 18,
        w * 0.3,
        15,
        0,
        0,
        Math.PI * 2
      );
      ctx.ellipse(
        w * 0.72 + Math.cos(t * 0.35) * 20,
        groundY - 12,
        w * 0.26,
        13,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.fillStyle = `rgba(200,245,74,${0.2 + Math.sin(t * 2.2) * 0.15})`;
      ctx.beginPath();
      ctx.arc(w * 0.48, groundY - 100, 1.6, 0, Math.PI * 2);
      ctx.arc(w * 0.52, groundY - 100, 1.6, 0, Math.PI * 2);
      ctx.fill();
      // Will-o'-wisps
      ctx.fillStyle = `rgba(180, 230, 160, ${0.2 + Math.sin(t * 2) * 0.12})`;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(
          w * (0.25 + i * 0.2) + Math.sin(t + i) * 16,
          groundY - 40 - i * 12 + Math.cos(t * 1.3 + i) * 8,
          2,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    } else if (theme === "haunt") {
      // Portal pulse + ground fog + moon twinkles
      const pulse = 0.08 + Math.sin(t * 2.8) * 0.05;
      ctx.globalAlpha = pulse;
      ctx.fillStyle = "#c8f54a";
      ctx.beginPath();
      ctx.arc(w * 0.52, groundY - 28, 42 + Math.sin(t * 2) * 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = `rgba(200, 245, 74, ${0.06 + Math.sin(t) * 0.03})`;
      ctx.beginPath();
      ctx.ellipse(w * 0.5, groundY - 12, w * 0.42, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255,255,220,${0.35 + Math.sin(t * 5) * 0.25})`;
      ctx.beginPath();
      ctx.arc(w * 0.55, 36, 1.6, 0, Math.PI * 2);
      ctx.arc(w * 0.4, 70, 1.3, 0, Math.PI * 2);
      ctx.arc(w * 0.78, 90, 1.2, 0, Math.PI * 2);
      ctx.fill();
      // Floating haunt wisps
      ctx.fillStyle = `rgba(200, 245, 74, ${0.22 + Math.sin(t * 2.4) * 0.12})`;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(
          w * (0.2 + i * 0.18) + Math.sin(t * 0.9 + i * 1.3) * 20,
          groundY - 55 - i * 16 + Math.cos(t * 1.1 + i) * 12,
          2.2,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
  }

  function drawWhale(look) {
    const vigil = look === "vigil";
    const knight = look === "knight";
    const body = vigil ? "#f4f0e6" : "#8d9198";
    const belly = vigil ? "#fffaf3" : "#d5d7dc";

    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(-22, 6);
    ctx.quadraticCurveTo(-48, -8, -56, -18);
    ctx.quadraticCurveTo(-38, 0, -50, 24);
    ctx.quadraticCurveTo(-34, 12, -18, 16);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(8, 10, 34, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = belly;
    ctx.beginPath();
    ctx.ellipse(10, 16, 20, 9, 0, 0.15, Math.PI - 0.15);
    ctx.fill();

    if (look === "lane") {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(2, 14, 24, 15, 0, 0, Math.PI * 2);
      ctx.clip();
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = i % 2 ? "#1f6b3a" : "#9d2b2b";
        ctx.fillRect(-28, -2 + i * 6, 58, 6);
      }
      ctx.restore();
      ctx.fillStyle = "#6e4628";
      ctx.beginPath();
      ctx.ellipse(18, -10, 20, 4.5, -0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#5c3a22";
      ctx.beginPath();
      ctx.moveTo(6, -10);
      ctx.quadraticCurveTo(16, -28, 30, -8);
      ctx.lineTo(8, -8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#1a1612";
      ctx.fillRect(8, -12, 20, 2.2);
      ctx.fillStyle = "#e07a22";
      ctx.beginPath();
      ctx.ellipse(36, 24, 8, 6.5, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#3d2414";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(30, 20);
      ctx.quadraticCurveTo(36, 12, 42, 20);
      ctx.stroke();
    } else if (vigil) {
      ctx.fillStyle = "#6e2433";
      ctx.beginPath();
      ctx.moveTo(-16, 18);
      ctx.quadraticCurveTo(6, 2, 28, 16);
      ctx.lineTo(24, 38);
      ctx.quadraticCurveTo(4, 30, -12, 36);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(2, 2);
      ctx.quadraticCurveTo(14, -34, 32, 4);
      ctx.quadraticCurveTo(20, -6, 8, 6);
      ctx.closePath();
      ctx.fill();
    } else if (knight) {
      ctx.fillStyle = "#3d245c";
      ctx.beginPath();
      ctx.moveTo(-4, -2);
      ctx.quadraticCurveTo(-34, 16, -16, 42);
      ctx.lineTo(10, 26);
      ctx.quadraticCurveTo(2, 8, 12, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#2a2e36";
      ctx.beginPath();
      ctx.ellipse(8, 12, 26, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#c4a574";
      ctx.lineWidth = 1.6;
      ctx.stroke();
      const glow = ctx.createRadialGradient(8, 12, 1, 8, 12, 16);
      glow.addColorStop(0, "rgba(255, 148, 48, 0.95)");
      glow.addColorStop(1, "rgba(255, 122, 26, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(8, 12, 16, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = vigil ? "#f7f4ee" : body;
    ctx.beginPath();
    ctx.ellipse(24, 2, 16, 13, 0.15, 0, Math.PI * 2);
    ctx.fill();
    if (vigil) {
      ctx.fillStyle = "#6e2433";
      ctx.beginPath();
      ctx.ellipse(22, -6, 14, 7, -0.2, Math.PI, 0);
      ctx.fill();
    }
    ctx.fillStyle = "#161412";
    ctx.beginPath();
    ctx.ellipse(30, 0, 2.4, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f6f1e8";
    ctx.beginPath();
    ctx.arc(30.8, -0.8, 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawPlayer() {
    const p = state.player;
    const speedFactor = Math.min(1, Math.abs(p.vx) / p.speed);
    const bob =
      Math.sin(performance.now() * (0.01 + speedFactor * 0.008)) *
      (2.2 - speedFactor * 0.6);
    const lean = p.facing * 0.18;
    const t = performance.now() * 0.001;

    ctx.save();
    ctx.translate(p.x, p.y + bob);
    ctx.rotate(lean);

    // Shadow under sandals
    ctx.fillStyle = "rgba(0,0,0,0.38)";
    ctx.beginPath();
    ctx.ellipse(0, p.h - 4, p.w * 0.34, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shield aura
    if (state.shield) {
      ctx.strokeStyle = `rgba(167,139,250,${0.45 + Math.sin(t * 6) * 0.15})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 4, 42, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (state.magnetT > 0) {
      ctx.strokeStyle = `rgba(56,189,248,${0.3 + Math.sin(t * 8) * 0.12})`;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.arc(0, 4, 58 + Math.sin(t * 6) * 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 0.2 + Math.sin(t * 5) * 0.08;
      ctx.beginPath();
      ctx.arc(0, 4, 76, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.setLineDash([]);
    }

    const flip = p.facing < -0.08 ? -1 : 1;
    ctx.save();
    ctx.scale(flip, 1);
    const painted =
      getCharacter().id === "vigil"
        ? vigilSpriteReady
          ? vigilSprite
          : null
        : getCharacter().id === "lane" && playerSpriteReady
          ? playerSprite
          : null;
    if (painted && painted.naturalWidth > 0) {
      const drawH = 196;
      const drawW = drawH * (painted.naturalWidth / painted.naturalHeight);
      const foot = p.h - 2;
      const anchor = painted === vigilSprite ? 0.5 : 0.48;
      ctx.drawImage(painted, -drawW * anchor, foot - drawH, drawW, drawH);
    } else {
      ctx.translate(0, -18);
      ctx.scale(2.15, 2.15);
      drawWhale(getCharacter().id);
    }
    ctx.restore();

    if (state.combo >= 5) {
      ctx.strokeStyle = `rgba(200,245,74,${0.35 + state.comboPulse})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 4, 40 + state.comboPulse * 10, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawDrops() {
    for (const drop of state.drops) {
      ctx.save();
      ctx.translate(drop.x, drop.y);
      ctx.rotate(drop.rot * 0.22);

      if (quality.shadows) {
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.beginPath();
        if (typeof ctx.ellipse === "function") {
          ctx.ellipse(0, drop.r + 4, drop.r * 0.7, 3, 0, 0, Math.PI * 2);
        } else {
          ctx.arc(0, drop.r + 4, drop.r * 0.55, 0, Math.PI * 2);
        }
        ctx.fill();
      }

      drawDropSprite(drop.kind, drop.r);

      if ((drop.rare || drop.power) && quality.glow) {
        ctx.strokeStyle = drop.color;
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, drop.r + 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      ctx.restore();
    }
  }

  function drawParticles() {
    for (const part of state.particles) {
      const a = Math.max(0, part.life / part.max);
      ctx.globalAlpha = a;
      ctx.fillStyle = part.color;
      ctx.fillRect(part.x, part.y, part.size, part.size);
    }
    ctx.globalAlpha = 1;
  }

  function drawFloaters() {
    for (const f of state.floaters) {
      const a = Math.max(0, f.life / f.max);
      const size = f.size || 16;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = f.color;
      ctx.font = `800 ${size}px Outfit, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(f.text, f.x, f.y);
      ctx.restore();
    }
  }

  function drawComboBanner(w) {
    if (state.combo < 3) return;
    const pulse = 1 + state.comboPulse * 0.15;
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = state.combo >= 8 ? "#ff7a1a" : "#c8f54a";
    ctx.font = `800 ${Math.round(18 * pulse)}px Outfit, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(
      state.combo >= 8 ? `HAUL x${state.combo}` : `COMBO x${state.combo}`,
      w / 2,
      78
    );
    ctx.restore();
  }

  function drawLevelBanner(w, h) {
    if (state.levelBanner <= 0) return;
    const lvl = currentLevel();
    const fade = Math.min(1, state.levelBanner * 2.8);
    ctx.save();
    ctx.globalAlpha = 0.55 * fade;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = fade;
    ctx.fillStyle = "#c4a574";
    ctx.font = "500 15px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`NIGHT ${lvl.id}`, w / 2, h * 0.42);
    ctx.fillStyle = "#f6f1e8";
    ctx.font = "560 28px Fraunces, Georgia, serif";
    ctx.fillText(lvl.name, w / 2, h * 0.42 + 32);
    ctx.fillStyle = "#b7b1a6";
    ctx.font = "500 14px Outfit, sans-serif";
    ctx.fillText(lvl.blurb, w / 2, h * 0.42 + 56);
    ctx.restore();
  }

  function drawScene() {
    const { w, h } = logicalSize();
    ctx.clearRect(0, 0, w, h);

    ctx.save();
    if (state.shake > 0) {
      const shakeScale =
        quality.tier === "low" ? 2.5 : isCoarse ? 4 : 12;
      const mag = state.shake * shakeScale;
      ctx.translate(
        Math.round((Math.random() - 0.5) * mag),
        Math.round((Math.random() - 0.5) * mag)
      );
    }

    drawBackground(w, h);
    drawDrops();
    drawPlayer();
    drawParticles();
    drawFloaters();
    drawComboBanner(w);
    drawLevelBanner(w, h);

    if (state.flash > 0) {
      const alphaMatch = state.flashColor.match(/[\d.]+\)$/);
      const base = state.flashColor.replace(/[\d.]+\)$/, `${state.flash * 0.9})`);
      ctx.fillStyle = alphaMatch ? base : state.flashColor;
      ctx.fillRect(0, 0, w, h);
    }

    ctx.restore();
  }

  function loop(ts) {
    if (!running || paused) return;
    if (!lastTs) lastTs = ts;
    // Clamp dt for stable feel on 60/90/120Hz phones and low-end Android
    const dt = Math.min(0.028, Math.max(0.006, (ts - lastTs) / 1000));
    lastTs = ts;
    update(dt);
    if (!running) {
      drawScene();
      return;
    }
    drawScene();
    rafId = requestAnimationFrame(loop);
  }

  function pointerToGameX(clientX) {
    const rect = canvas.getBoundingClientRect();
    return clientX - rect.left;
  }

  function scheduleResize() {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resizeTimer = 0;
      if (resizeCanvas()) drawScene();
    }, 120);
  }

  btnStart?.addEventListener("click", startGame);
  btnAgain?.addEventListener("click", startGame);
  btnResume?.addEventListener("click", togglePause);
  btnPause?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (running && !paused) togglePause();
  });
  btnPauseQuit?.addEventListener("click", (e) => {
    e.preventDefault();
    quitToStart();
  });
  btnMute?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    audio.unlock();
    audio.setMuted(!audio.isMuted());
    syncMuteButton();
  });
  btnMusic?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    audio.unlock();
    audio.setMusic(!audio.isMusicOn());
    syncMusicButton();
  });

  btnQuality?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    cycleQualityMode();
  });

  window.addEventListener("keydown", (e) => {
    const gameKeys = ["ArrowLeft", "ArrowRight", "a", "A", "d", "D", " ", "Spacebar", "Escape"];
    if (!gameKeys.includes(e.key)) return;

    if (running) {
      if (["ArrowLeft", "ArrowRight", " ", "Spacebar"].includes(e.key)) e.preventDefault();
      keys.add(e.key);
      if (!e.repeat && (e.key === " " || e.key === "Spacebar" || e.key === "Escape")) {
        togglePause();
      }
    }
  });

  window.addEventListener("keyup", (e) => {
    keys.delete(e.key);
  });

  canvas.addEventListener("pointerdown", (e) => {
    if (!running || paused) return;
    e.preventDefault();
    pointerKind = e.pointerType || "mouse";
    pointerActive = true;
    aimX = pointerToGameX(e.clientX);
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!running || paused) return;
    pointerKind = e.pointerType || pointerKind;

    // Desktop/laptop: follow cursor while over the game (no click required)
    // Phones: only steer while finger is down
    const isMouse = pointerKind === "mouse" || pointerKind === "pen";
    if (!pointerActive && !isMouse) return;
    if (!pointerActive && isMouse && e.buttons === 0) {
      // hover follow on desktop
      aimX = pointerToGameX(e.clientX);
      return;
    }
    if (pointerActive) e.preventDefault();
    aimX = pointerToGameX(e.clientX);
  });

  canvas.addEventListener("pointerup", (e) => {
    pointerActive = false;
    // Keep aim on mouse for hover; clear on touch so release doesn't drag forever
    if ((e.pointerType || pointerKind) === "touch") aimX = null;
  });

  canvas.addEventListener("pointercancel", () => {
    pointerActive = false;
    aimX = null;
  });

  canvas.addEventListener("pointerleave", () => {
    if (!pointerActive && (pointerKind === "mouse" || pointerKind === "pen")) {
      aimX = null;
    }
  });

  canvas.addEventListener(
    "touchmove",
    (e) => {
      if (running && !paused) e.preventDefault();
    },
    { passive: false }
  );

  window.addEventListener("resize", scheduleResize);
  window.visualViewport?.addEventListener("resize", scheduleResize);
  window.addEventListener("orientationchange", () => {
    setTimeout(() => {
      resizeCanvas(true);
      drawScene();
    }, 250);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && running && !paused) togglePause();
  });

  syncMuteButton();
  syncMusicButton();
  syncQualityButton();
  buildCharacterPicker();
  setCharacter("lane");
  if (bestScoreEl) bestScoreEl.textContent = String(getBest());
  resizeCanvas(true);
  prewarmAssets();
  drawScene();
  setScreen("start");
}
