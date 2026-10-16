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
      world: "The Harbor",
      name: "The Watch",
      blurb: "Ships under a teal moon.",
      theme: "harbor",
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
      world: "The Harbor",
      name: "The Breach",
      blurb: "The great whale clears the water.",
      theme: "breach",
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
      world: "The Fleet",
      name: "The Rise",
      blurb: "A tail against the harvest moon.",
      theme: "fleet",
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
      world: "The Cloak",
      name: "The Light",
      blurb: "The hood, the lighthouse, the bats.",
      theme: "cloak",
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
      world: "The Deep",
      name: "The Wreck",
      blurb: "Pumpkins glow on the seabed.",
      theme: "deep",
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
    bonus: null,
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
    let songGain = null;
    let songGen = 0;
    let songSources = [];
    // Original night-hunt loop in D minor. Layers come in as the worlds get deeper.
    const MELODY = [
      [0, 0, 0, 2], [0, 2, 3, 1], [0, 3, 7, 1], [0, 4, 3, 2], [0, 6, 2, 1], [0, 7, 0, 1],
      [1, 0, 7, 2], [1, 2, 5, 1], [1, 3, 3, 1], [1, 4, 2, 2], [1, 6, 0, 2],
      [2, 0, 8, 2], [2, 2, 7, 1], [2, 3, 5, 1], [2, 4, 3, 2], [2, 6, 7, 2],
      [3, 0, 5, 1], [3, 1, 3, 1], [3, 2, 2, 2], [3, 4, 0, 2], [3, 6, -2, 1], [3, 7, 0, 1],
      [4, 0, 12, 2], [4, 2, 10, 1], [4, 3, 8, 1], [4, 4, 7, 2], [4, 6, 5, 2],
      [5, 0, 3, 2], [5, 2, 5, 1], [5, 3, 7, 1], [5, 4, 8, 2], [5, 6, 7, 2],
      [6, 0, 10, 2], [6, 2, 8, 1], [6, 3, 7, 1], [6, 4, 5, 2], [6, 6, 3, 2],
      [7, 0, 2, 1], [7, 1, 3, 1], [7, 2, 2, 1], [7, 3, 0, 1], [7, 4, -2, 2], [7, 6, 0, 2],
    ];
    const BASS = [73.42, 73.42, 116.54, 87.31, 98.0, 116.54, 130.81, 110.0];
    const CHAINS = [
      [146.83, 174.61, 220],
      [146.83, 174.61, 220],
      [233.08, 293.66, 349.23],
      [174.61, 220, 261.63],
      [196, 233.08, 293.66],
      [233.08, 293.66, 349.23],
      [261.63, 329.63, 392],
      [220, 261.63, 329.63],
    ];

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
        const gen = songGen;
        const level = Math.max(0, Math.min(state.levelIndex, 4));

        const arm = async () => {
          const ac = await resumeCtx();
          if (!ac || gen !== songGen || !musicOn || !running || paused) return;

          if (!songGain) {
            songGain = ac.createGain();
            songGain.gain.value = 0.0001;
            songGain.connect(master);
          }
          const now = ac.currentTime;
          songGain.gain.cancelScheduledValues(now);
          songGain.gain.setValueAtTime(Math.max(0.0001, songGain.gain.value), now);
          songGain.gain.linearRampToValueAtTime(1, now + 0.45);

          const tempo = [92, 96, 104, 100, 86][level];
          const eighth = 60 / tempo / 2;
          const bar = eighth * 8;
          const loop = bar * 8;
          const deep = level >= 4;
          const note = (semi) => 293.66 * Math.pow(2, semi / 12);

          const voice = (freq, dur, type, gain, when, opts = {}) => {
            if (gen !== songGen || !songGain || freq <= 0) return;
            const osc = ac.createOscillator();
            const filter = ac.createBiquadFilter();
            const g = ac.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, when);
            if (opts.slide) {
              osc.frequency.exponentialRampToValueAtTime(Math.max(30, opts.slide), when + dur);
            }
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(opts.cut || (deep ? 900 : 2200), when);
            g.gain.setValueAtTime(0.0001, when);
            g.gain.exponentialRampToValueAtTime(Math.max(0.0001, gain), when + (opts.attack || 0.02));
            g.gain.exponentialRampToValueAtTime(0.0001, when + Math.max(0.06, dur));
            osc.connect(filter);
            filter.connect(g);
            g.connect(songGain);
            osc.start(when);
            osc.stop(when + dur + 0.05);
            osc.onended = () => {
              songSources = songSources.filter((item) => item !== osc);
            };
            songSources.push(osc);
          };

          const hat = (when) => {
            if (gen !== songGen || !songGain) return;
            const dur = 0.035;
            const len = Math.max(1, Math.floor(ac.sampleRate * dur));
            const buffer = ac.createBuffer(1, len, ac.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
            const src = ac.createBufferSource();
            const filter = ac.createBiquadFilter();
            const g = ac.createGain();
            filter.type = "highpass";
            filter.frequency.value = 6000;
            g.gain.setValueAtTime(0.045, when);
            g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
            src.buffer = buffer;
            src.connect(filter);
            filter.connect(g);
            g.connect(songGain);
            src.start(when);
            src.stop(when + dur + 0.02);
            songSources.push(src);
          };

          const playLoop = (origin) => {
            for (let i = 0; i < 8; i++) {
              const t = origin + i * bar;
              voice(BASS[i], bar * 0.92, "triangle", deep ? 0.2 : 0.15, t, {
                cut: 240,
                attack: 0.03,
                slide: BASS[i] * 0.97,
              });
              for (const freq of CHAINS[i]) {
                voice(freq, bar * 0.96, "sine", 0.035, t, { cut: deep ? 700 : 1400, attack: 0.18 });
              }
              if (level >= 1 && (i % 2 === 0 || !deep)) {
                voice(148, 0.11, "sine", 0.2, t, { slide: 46, cut: 360, attack: 0.004 });
                if (!deep) voice(148, 0.09, "sine", 0.12, t + eighth * 4, { slide: 50, cut: 320, attack: 0.004 });
              }
              if (level >= 2 && !deep) {
                hat(t + eighth * 2);
                hat(t + eighth * 6);
              }
            }
            for (const [b, step, semi, steps] of MELODY) {
              const t = origin + b * bar + step * eighth;
              const dur = steps * eighth * 0.9;
              const freq = note(semi);
              voice(freq, dur, "sine", 0.1, t, { cut: deep ? 1100 : 2800, attack: 0.012 });
              voice(freq * 2, dur * 0.55, "triangle", 0.028, t, { cut: 3200, attack: 0.008 });
              if (level >= 3) {
                voice(freq * 2, dur * 0.4, "sine", 0.02, t + 0.03, { cut: 2400, attack: 0.01 });
              }
            }
          };

          let origin = now + 0.06;
          const schedule = () => {
            if (gen !== songGen || !musicOn || !running || paused) return;
            while (origin < ac.currentTime + 0.7) {
              playLoop(origin);
              origin += loop;
            }
          };

          schedule();
          if (musicTimer) clearInterval(musicTimer);
          musicTimer = setInterval(schedule, 180);
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
        getBackground(lvl.theme || "harbor", w, h);
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
    const time = String(Math.ceil(state.bonus ? state.bonus.time : state.timeLeft));
    const comboSource = state.bonus ? state.bonus.chain : state.combo;
    const combo = comboSource > 1 ? `x${comboSource}` : "—";
    const hot = comboSource >= 3;
    const urgent = state.bonus ? state.bonus.time <= 4 : state.timeLeft <= 10;
    const level = state.bonus ? "BONUS" : `${state.levelIndex + 1}/${LEVELS.length}`;
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
    state.bonus = null;
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
    const big = /CLEAR|PERFECT|HOT|ONSLAUGHT|EPIC|SLASH|LEGEND|BONUS/.test(text);
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

  function setTouchHint() {
    if (!touchHint) return;
    touchHint.textContent = state.bonus
      ? "Drag through the haul. Avoid skulls and spiders."
      : "Slide to steer. The whale follows your finger.";
  }

  function beginBonus() {
    const cleared = currentLevel();
    state.score += cleared.clearBonus;
    state.levelsCleared += 1;
    addFloater(viewW / 2, viewH * 0.35, `+${cleared.clearBonus} CLEAR`, "#c8f54a");
    if (!state.hurtThisLevel) {
      grantLife(viewW / 2, viewH * 0.42, "PERFECT +1♥");
    }
    state.drops = [];
    state.flash = 0.42;
    state.flashColor = "rgba(232, 132, 58, 0.5)";
    state.shake = 0.4;
    state.bonus = {
      time: 14,
      banner: 1.45,
      spawn: 0.05,
      ending: 0,
      targets: [],
      halves: [],
      trail: [],
      stroking: false,
      strokeHits: 0,
      strokePoints: 0,
      chain: 0,
      chainT: 0,
      scored: 0,
      epic: "",
      epicT: 0,
    };
    audio.levelUp();
    setTouchHint();
    updateHud();
  }

  function finishBonus() {
    if (!state.bonus) return;
    const scored = state.bonus.scored;
    state.bonus = null;
    setTouchHint();
    if (scored > 0) addFloater(viewW / 2, viewH * 0.32, `+${scored} BONUS`, "#ff7a1a");
    state.drops = [];
    state.flash = 0.28;
    state.flashColor = "rgba(127, 212, 203, 0.35)";
    if (state.levelIndex >= LEVELS.length - 1) {
      endGame(true);
      return;
    }
    state.levelIndex += 1;
    state.timeLeft = currentLevel().duration;
    state.hurtThisLevel = false;
    state.levelBanner = 2.4;
    spawnTimer = 0.55;
    lastTickSecond = -1;
    nearMissCooldown = 0;
    audio.levelUp();
    if (audio.isMusicOn()) audio.startMusic(true);
    updateHud();
  }

  function launchBonusPiece(w, h, x, vxBias) {
    const bonus = state.bonus;
    if (!bonus || bonus.targets.length >= 8) return;
    const badChance = Math.min(0.42, 0.16 + state.levelIndex * 0.055);
    const roll = Math.random();
    let kind = "candy";
    let points = 40;
    let bad = false;
    let rare = false;
    let color = "#ff6b9d";
    let r = 40 + Math.random() * 10;
    if (roll < badChance) {
      bad = true;
      points = 0;
      if (Math.random() < 0.5) {
        kind = "skull";
        color = "#efe6d8";
        r = 40 + Math.random() * 10;
      } else {
        kind = "spider";
        color = "#ff4d6d";
        r = 36 + Math.random() * 8;
      }
    } else if (Math.random() < 0.1) {
      kind = "pumpkin";
      points = 180;
      rare = true;
      color = "#ffe08a";
      r = 62 + Math.random() * 10;
    } else if (Math.random() < 0.62) {
      kind = "pumpkin";
      points = 80;
      color = "#ff7a1a";
      r = 52 + Math.random() * 16;
    } else if (Math.random() < 0.5) {
      kind = "lolli";
      points = 55;
      color = "#ff8fab";
      r = 38 + Math.random() * 8;
    }
    const rise = h * (0.58 + Math.random() * 0.24);
    const gravity = 1080;
    bonus.targets.push({
      kind,
      points,
      bad,
      rare,
      color,
      r,
      x: Math.max(r + 8, Math.min(w - r - 8, x)),
      y: h + r * 0.4,
      vx: vxBias + (Math.random() - 0.5) * 80,
      vy: -Math.sqrt(2 * gravity * rise),
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 3.2,
      hit: false,
    });
  }

  function spawnBonusWave(w, h) {
    const volley = Math.random() < 0.42 + state.levelIndex * 0.07;
    const n = volley ? 2 + (Math.random() < 0.35 ? 1 : 0) : 1;
    const base = w * (0.22 + Math.random() * 0.56);
    for (let i = 0; i < n; i++) {
      const spread = (i - (n - 1) / 2);
      launchBonusPiece(w, h, base + spread * 74, spread * 150);
    }
  }

  function distToSegment(px, py, ax, ay, bx, by) {
    const abx = bx - ax;
    const aby = by - ay;
    const len2 = abx * abx + aby * aby || 1;
    const t = Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / len2));
    const x = ax + abx * t;
    const y = ay + aby * t;
    return Math.hypot(px - x, py - y);
  }

  function slashSegment(ax, ay, bx, by) {
    const bonus = state.bonus;
    if (!bonus) return;
    for (const target of bonus.targets) {
      if (target.hit) continue;
      if (distToSegment(target.x, target.y, ax, ay, bx, by) > target.r) continue;
      target.hit = true;
      splitBonusTarget(target, bx - ax, by - ay);
    }
  }

  function splitBonusTarget(target, dx, dy) {
    const bonus = state.bonus;
    const len = Math.hypot(dx, dy) || 1;
    const nx = dx / len;
    const ny = dy / len;
    const kick = 160;
    for (const side of [-1, 1]) {
      bonus.halves.push({
        kind: target.kind,
        r: target.r,
        side,
        x: target.x,
        y: target.y,
        vx: target.vx * 0.3 + nx * kick * side,
        vy: target.vy * 0.25 - 80 + ny * 40,
        rot: target.rot,
        spin: side * 6,
        life: 0.7,
        max: 0.7,
      });
    }
    if (target.bad) {
      bonus.chain = 0;
      bonus.chainT = 0;
      bonus.strokeHits = 0;
      bonus.strokePoints = 0;
      state.combo = 0;
      state.hurtThisLevel = true;
      state.lives -= 1;
      state.shake = 0.55;
      state.flash = 0.28;
      state.flashColor = "rgba(255, 77, 109, 0.55)";
      burst(target.x, target.y, "#ff4d6d", 26);
      addFloater(target.x, target.y - 16, "CURSE", "#ff4d6d");
      audio.curse();
      updateHud();
      if (state.lives <= 0) endGame(false);
      return;
    }
    bonus.chain += 1;
    bonus.chainT = 0.85;
    bonus.strokeHits += 1;
    bonus.strokePoints += target.points;
    state.score += target.points;
    bonus.scored += target.points;
    state.maxCombo = Math.max(state.maxCombo, bonus.chain);
    burst(target.x, target.y, target.color, target.rare ? 32 : 18);
    addFloater(target.x, target.y - 18, `+${target.points}`, target.color);
    state.shake = Math.max(state.shake, target.rare ? 0.28 : 0.12);
    if (target.rare) {
      state.flash = 0.2;
      state.flashColor = "rgba(255, 224, 138, 0.45)";
      audio.star();
    } else {
      audio.catch(target.points, bonus.chain);
    }
    updateHud();
  }

  function beginSlash(point) {
    const bonus = state.bonus;
    if (!bonus) return;
    bonus.stroking = true;
    bonus.strokeHits = 0;
    bonus.strokePoints = 0;
    bonus.trail = [{ x: point.x, y: point.y, life: 0.22 }];
  }

  function extendSlash(point) {
    const bonus = state.bonus;
    if (!bonus || !bonus.stroking) return;
    const trail = bonus.trail;
    const last = trail[trail.length - 1];
    if (!last) {
      trail.push({ x: point.x, y: point.y, life: 0.22 });
      return;
    }
    if (Math.hypot(point.x - last.x, point.y - last.y) < 9) return;
    slashSegment(last.x, last.y, point.x, point.y);
    trail.push({ x: point.x, y: point.y, life: 0.22 });
    if (trail.length > 18) trail.shift();
  }

  function endSlash() {
    const bonus = state.bonus;
    if (!bonus || !bonus.stroking) return;
    bonus.stroking = false;
    const hits = bonus.strokeHits;
    if (hits >= 3 && bonus.strokePoints > 0) {
      const extraMul = hits >= 5 ? 3 : hits >= 4 ? 2 : 1;
      const extra = bonus.strokePoints * extraMul;
      state.score += extra;
      bonus.scored += extra;
      const label = hits >= 5 ? "LEGEND" : hits >= 4 ? "EPIC" : "SLASH";
      bonus.epic = label;
      bonus.epicT = 0.9;
      addFloater(viewW / 2, viewH * 0.4, `${label} +${extra}`, "#ffe08a");
      state.flash = 0.34;
      state.flashColor = "rgba(255, 180, 70, 0.5)";
      state.shake = Math.max(state.shake, 0.45);
      audio.star();
      updateHud();
    }
    bonus.strokeHits = 0;
    bonus.strokePoints = 0;
  }

  function updateBonus(dt) {
    const bonus = state.bonus;
    if (!bonus) return;
    const { w, h } = logicalSize();
    const gravity = 1080;

    if (bonus.banner > 0) bonus.banner = Math.max(0, bonus.banner - dt);
    bonus.chainT = Math.max(0, bonus.chainT - dt);
    if (bonus.chainT <= 0) bonus.chain = 0;
    bonus.epicT = Math.max(0, bonus.epicT - dt);

    if (bonus.time <= 0) {
      bonus.ending += dt;
      if (bonus.ending >= 0.9) {
        finishBonus();
        return;
      }
    } else if (bonus.banner <= 0) {
      bonus.time = Math.max(0, bonus.time - dt);
      if (bonus.time <= 4 && Math.ceil(bonus.time) !== lastTickSecond) {
        lastTickSecond = Math.ceil(bonus.time);
        audio.tick();
      }
      bonus.spawn -= dt;
      if (bonus.spawn <= 0) {
        spawnBonusWave(w, h);
        const rush = bonus.time < 4;
        bonus.spawn = (rush ? 0.28 : 0.52) * (0.72 + Math.random() * 0.45);
      }
    }

    for (let i = bonus.targets.length - 1; i >= 0; i--) {
      const target = bonus.targets[i];
      target.vy += gravity * dt;
      target.x += target.vx * dt;
      target.y += target.vy * dt;
      target.rot += target.spin * dt;
      if (target.hit || (target.y > h + target.r + 40 && target.vy > 0)) {
        bonus.targets.splice(i, 1);
      }
    }
    for (let i = bonus.halves.length - 1; i >= 0; i--) {
      const piece = bonus.halves[i];
      piece.life -= dt;
      piece.vy += gravity * dt;
      piece.x += piece.vx * dt;
      piece.y += piece.vy * dt;
      piece.rot += piece.spin * dt;
      if (piece.life <= 0) bonus.halves.splice(i, 1);
    }
    for (let i = bonus.trail.length - 1; i >= 0; i--) {
      bonus.trail[i].life -= dt;
      if (bonus.trail[i].life <= 0) bonus.trail.splice(i, 1);
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
      overBlurb.textContent = `Reached ${currentLevel().world}. Max combo x${state.maxCombo}.`;
      audio.lose();
    } else if (won || state.levelsCleared >= LEVELS.length) {
      overTitle.textContent = "The vigil is kept";
      overBlurb.textContent = `All four worlds cleared. Max combo x${state.maxCombo}.`;
      audio.win();
    } else if (state.score >= 800 || state.maxCombo >= 14) {
      overTitle.textContent = "A legendary haul";
      overBlurb.textContent = `${currentLevel().name} · combo x${state.maxCombo}.`;
      audio.win();
    } else if (state.score >= 350) {
      overTitle.textContent = "The moon remembers";
      overBlurb.textContent = `Cleared ${state.levelsCleared} levels. Combo x${state.maxCombo}.`;
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
    state.bonus = null;
    cancelAnimationFrame(rafId);
    audio.stopMusic();
    aimX = null;
    pointerActive = false;
    keys.clear();
    setScreen("start");
    drawScene();
  }

  function update(dt) {
    if (state.bonus) {
      updateBonus(dt);
      return;
    }
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
      beginBonus();
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

  function paintMoon(g, x, y, r, core, glow) {
    const halo = g.createRadialGradient(x, y, r * 0.2, x, y, r * 2.6);
    halo.addColorStop(0, glow);
    halo.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = halo;
    g.beginPath();
    g.arc(x, y, r * 2.6, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = core;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "rgba(8, 30, 28, 0.1)";
    g.beginPath();
    g.arc(x - r * 0.12, y + r * 0.04, r * 0.42, 0, Math.PI * 2);
    g.fill();
  }

  function paintGalleon(g, x, y, s, flip) {
    g.save();
    g.translate(x, y);
    g.scale((flip ? -1 : 1) * s, s);
    g.fillStyle = "#071018";
    g.beginPath();
    g.moveTo(-52, 4);
    g.quadraticCurveTo(-48, 28, 4, 30);
    g.quadraticCurveTo(56, 24, 60, 2);
    g.lineTo(42, -4);
    g.lineTo(-40, -4);
    g.closePath();
    g.fill();
    g.fillRect(-24, -82, 3, 78);
    g.fillRect(8, -102, 3, 98);
    g.fillRect(34, -60, 2.5, 56);
    g.fillStyle = "#121c24";
    g.beginPath();
    g.moveTo(-21, -76);
    g.lineTo(4, -66);
    g.lineTo(4, -18);
    g.lineTo(-21, -12);
    g.fill();
    g.beginPath();
    g.moveTo(11, -96);
    g.lineTo(38, -82);
    g.lineTo(38, -26);
    g.lineTo(11, -18);
    g.fill();
    g.fillStyle = "#e8843a";
    for (let i = 0; i < 4; i++) g.fillRect(-30 + i * 16, 8, 4, 3.2);
    g.restore();
  }

  function paintCastle(g, x, base, s) {
    g.save();
    g.translate(x, base);
    g.scale(s, s);
    g.fillStyle = "#070d14";
    g.fillRect(-30, -78, 60, 78);
    g.beginPath();
    g.moveTo(-10, -78);
    g.lineTo(0, -138);
    g.lineTo(12, -78);
    g.fill();
    g.fillRect(-56, -52, 24, 52);
    g.fillRect(36, -64, 20, 64);
    g.beginPath();
    g.moveTo(-56, -52);
    g.lineTo(-44, -86);
    g.lineTo(-32, -52);
    g.fill();
    g.beginPath();
    g.moveTo(36, -64);
    g.lineTo(46, -104);
    g.lineTo(56, -64);
    g.fill();
    g.fillStyle = "#e8843a";
    const windows = [[-46, -32], [-8, -52], [10, -30], [42, -40], [0, -96], [-4, -18]];
    for (const [wx, wy] of windows) g.fillRect(wx, wy, 4, 7);
    g.restore();
  }

  function paintJack(g, x, y, s) {
    g.save();
    g.translate(x, y);
    g.scale(s, s);
    const glow = g.createRadialGradient(0, 0, 2, 0, 0, 22);
    glow.addColorStop(0, "rgba(255, 150, 40, 0.55)");
    glow.addColorStop(1, "rgba(255, 120, 20, 0)");
    g.fillStyle = glow;
    g.beginPath();
    g.arc(0, 0, 22, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#c45a12";
    g.beginPath();
    g.ellipse(0, 2, 11, 9, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#e8843a";
    g.beginPath();
    g.ellipse(0, 0, 10, 8, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#2a1408";
    g.beginPath();
    g.moveTo(-5, -1);
    g.lineTo(-2.2, 2);
    g.lineTo(-7, 2);
    g.moveTo(5, -1);
    g.lineTo(2.2, 2);
    g.lineTo(7, 2);
    g.fill();
    g.fillRect(-3.5, 3.2, 7, 1.8);
    g.fillStyle = "#143028";
    g.beginPath();
    g.moveTo(-2, -8);
    g.quadraticCurveTo(0, -14, 3, -7);
    g.fill();
    g.restore();
  }

  function paintRocks(g, w, y) {
    g.fillStyle = "#070c10";
    g.beginPath();
    g.moveTo(0, y + 30);
    g.lineTo(0, y - 6);
    g.quadraticCurveTo(w * 0.05, y - 36, w * 0.13, y - 4);
    g.quadraticCurveTo(w * 0.18, y + 10, w * 0.24, y + 22);
    g.closePath();
    g.fill();
    g.beginPath();
    g.moveTo(w, y + 30);
    g.lineTo(w, y - 2);
    g.quadraticCurveTo(w * 0.92, y - 42, w * 0.82, y - 6);
    g.quadraticCurveTo(w * 0.76, y + 12, w * 0.68, y + 22);
    g.closePath();
    g.fill();
  }

  function paintSea(g, w, h, y, crest, deep) {
    const sea = g.createLinearGradient(0, y - 18, 0, h);
    sea.addColorStop(0, crest);
    sea.addColorStop(1, deep);
    g.fillStyle = sea;
    g.beginPath();
    g.moveTo(0, y);
    for (let x = 0; x <= w; x += 18) {
      g.lineTo(x, y - 7 + Math.sin(x * 0.035) * 6);
    }
    g.lineTo(w, h);
    g.lineTo(0, h);
    g.closePath();
    g.fill();
    g.strokeStyle = "rgba(190, 245, 236, 0.32)";
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(0, y);
    for (let x = 0; x <= w; x += 18) {
      g.lineTo(x, y - 7 + Math.sin(x * 0.035) * 6);
    }
    g.stroke();
  }

  function paintBreach(g, x, y, s) {
    g.save();
    g.translate(x, y);
    g.scale(s, s);
    g.fillStyle = "#163e48";
    g.beginPath();
    g.moveTo(-36, 58);
    g.quadraticCurveTo(16, 8, 78, -24);
    g.quadraticCurveTo(140, -62, 176, -16);
    g.quadraticCurveTo(156, 12, 108, 18);
    g.quadraticCurveTo(64, 30, 16, 60);
    g.closePath();
    g.fill();
    g.fillStyle = "rgba(168, 230, 220, 0.32)";
    g.beginPath();
    g.moveTo(48, -6);
    g.quadraticCurveTo(110, -34, 158, -8);
    g.quadraticCurveTo(112, 8, 62, 8);
    g.closePath();
    g.fill();
    g.fillStyle = "#061014";
    g.beginPath();
    g.ellipse(138, -16, 4.2, 3, 0.3, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "rgba(210, 250, 244, 0.4)";
    g.lineWidth = 1.3;
    for (let i = 0; i < 6; i++) {
      g.beginPath();
      g.moveTo(24 + i * 9, 16);
      g.lineTo(10 + i * 11, -16 - i * 7);
      g.stroke();
    }
    g.restore();
  }

  function paintTail(g, x, y, s) {
    g.save();
    g.translate(x, y);
    g.scale(s, s);
    g.fillStyle = "#0c2832";
    g.beginPath();
    g.moveTo(0, 90);
    g.quadraticCurveTo(-16, 8, -86, -78);
    g.quadraticCurveTo(-36, -18, -6, -4);
    g.quadraticCurveTo(0, 24, 0, 90);
    g.fill();
    g.beginPath();
    g.moveTo(0, 90);
    g.quadraticCurveTo(18, 6, 90, -68);
    g.quadraticCurveTo(38, -14, 8, -2);
    g.quadraticCurveTo(0, 24, 0, 90);
    g.fill();
    g.strokeStyle = "rgba(170, 236, 226, 0.4)";
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(-78, -66);
    g.quadraticCurveTo(-18, 4, 0, 78);
    g.quadraticCurveTo(22, 2, 80, -56);
    g.stroke();
    g.strokeStyle = "rgba(210, 250, 246, 0.28)";
    g.lineWidth = 1.2;
    for (let i = 0; i < 5; i++) {
      g.beginPath();
      g.moveTo(-8 + i * 4, 10);
      g.lineTo(-16 + i * 6, 46 + i * 4);
      g.stroke();
    }
    g.restore();
  }

  function paintVignette(g, w, h) {
    const v = g.createRadialGradient(w * 0.5, h * 0.46, w * 0.18, w * 0.5, h * 0.5, w * 0.75);
    v.addColorStop(0, "rgba(0,0,0,0)");
    v.addColorStop(1, "rgba(0,0,0,0.32)");
    g.fillStyle = v;
    g.fillRect(0, 0, w, h);
  }

  function paintHarbor(g, w, h, breach) {
    const waterY = h * 0.66;
    const s = Math.max(1.55, Math.min(2.25, w / 420));
    paintSky(g, w, h, [
      [0, "#021016"],
      [0.42, "#083038"],
      [0.72, "#0e4c48"],
      [1, "#062028"],
    ]);
    paintStars(g, w, h, 26, 3);
    paintMoon(g, w * 0.6, h * 0.2, Math.min(h * 0.2, 128), "#c8fff2", "rgba(70, 190, 170, 0.55)");
    paintCastle(g, w * 0.82, waterY + 6, s);
    paintGalleon(g, w * 0.13, waterY - 6, s * 0.92, false);
    paintBreach(g, w * (breach ? 0.32 : 0.48), waterY - h * (breach ? 0.16 : 0.1), breach ? s * 1.15 : s * 0.9);
    paintSea(g, w, h, waterY, "rgba(12, 78, 86, 0.96)", "#03141a");
    paintRocks(g, w, waterY + 16);
    paintJack(g, w * 0.06, waterY + 10, 2);
    paintJack(g, w * 0.14, waterY + 22, 1.25);
    paintJack(g, w * 0.94, waterY + 12, 1.8);
    paintGroundBand(
      g, w, h,
      [[0, "rgba(8, 24, 28, 0)"], [0.35, "rgba(6, 16, 20, 0.75)"], [1, "#041014"]],
      "rgba(127, 212, 203, 0.35)"
    );
    paintVignette(g, w, h);
  }

  function paintFleet(g, w, h) {
    const waterY = h * 0.66;
    const s = Math.max(1.45, Math.min(2.1, w / 440));
    paintSky(g, w, h, [
      [0, "#120804"],
      [0.22, "#5c1c08"],
      [0.48, "#e8843a"],
      [0.72, "#163444"],
      [1, "#07141c"],
    ]);
    paintMoon(g, w * 0.5, h * 0.22, Math.min(h * 0.24, 150), "#ffd2a0", "rgba(255, 140, 40, 0.6)");
    g.fillStyle = "rgba(40, 16, 10, 0.28)";
    g.beginPath();
    g.ellipse(w * 0.22, h * 0.16, w * 0.18, 18, 0, 0, Math.PI * 2);
    g.ellipse(w * 0.74, h * 0.12, w * 0.16, 14, 0, 0, Math.PI * 2);
    g.fill();
    paintCastle(g, w * 0.14, waterY + 4, s * 0.72);
    paintCastle(g, w * 0.86, waterY + 2, s * 0.85);
    paintGalleon(g, w * 0.08, waterY - 4, s * 0.78, false);
    paintGalleon(g, w * 0.92, waterY - 2, s * 0.74, true);
    paintTail(g, w * 0.5, waterY + 8, s * 1.15);
    paintSea(g, w, h, waterY, "rgba(16, 58, 72, 0.94)", "#04121a");
    paintRocks(g, w, waterY + 16);
    paintJack(g, w * 0.05, waterY + 12, 2.1);
    paintJack(g, w * 0.95, waterY + 14, 1.9);
    paintJack(g, w * 0.18, waterY + 24, 1.15);
    paintGroundBand(
      g, w, h,
      [[0, "rgba(20, 10, 6, 0)"], [0.4, "rgba(12, 18, 22, 0.8)"], [1, "#071014"]],
      "rgba(232, 132, 58, 0.4)"
    );
    paintVignette(g, w, h);
  }

  function paintCloak(g, w, h) {
    const waterY = h * 0.66;
    const s = Math.max(1.6, Math.min(2.3, w / 400));
    paintSky(g, w, h, [
      [0, "#100806"],
      [0.3, "#4a180c"],
      [0.55, "#c45a12"],
      [0.78, "#143038"],
      [1, "#07141c"],
    ]);
    paintMoon(g, w * 0.66, h * 0.22, Math.min(h * 0.26, 156), "#ffc98a", "rgba(255, 130, 30, 0.55)");
    paintCastle(g, w * 0.68, waterY + 4, s * 1.05);
    g.save();
    g.globalAlpha = 0.22;
    g.fillStyle = "#ffd9a0";
    g.beginPath();
    g.moveTo(w * 0.68, waterY + 4 - 138 * s * 1.05);
    g.lineTo(w * 0.68 - 90, waterY - 10);
    g.lineTo(w * 0.68 + 36, waterY - 10);
    g.fill();
    g.restore();
    paintGalleon(g, w * 0.9, waterY - 4, s * 0.62, true);
    g.fillStyle = "rgba(8, 12, 18, 0.82)";
    const bats = [[0.16, 0.14], [0.26, 0.2], [0.38, 0.1], [0.46, 0.18], [0.22, 0.08]];
    for (const [bx, by] of bats) {
      const x = w * bx;
      const y = h * by;
      g.beginPath();
      g.moveTo(x, y);
      g.quadraticCurveTo(x - 14, y - 9, x - 16, y);
      g.quadraticCurveTo(x - 6, y - 2, x, y + 3);
      g.quadraticCurveTo(x + 6, y - 2, x + 16, y);
      g.quadraticCurveTo(x + 14, y - 9, x, y);
      g.fill();
    }
    paintSea(g, w, h, waterY, "rgba(12, 42, 52, 0.95)", "#041018");
    paintRocks(g, w, waterY + 16);
    paintJack(g, w * 0.06, waterY + 12, 2);
    paintJack(g, w * 0.16, waterY + 24, 1.2);
    paintJack(g, w * 0.95, waterY + 14, 1.7);
    paintGroundBand(
      g, w, h,
      [[0, "rgba(20, 8, 4, 0)"], [0.4, "rgba(10, 16, 20, 0.8)"], [1, "#071014"]],
      "rgba(232, 132, 58, 0.38)"
    );
    paintVignette(g, w, h);
  }

  function paintDeep(g, w, h) {
    const groundY = h - 28;
    paintSky(g, w, h, [
      [0, "#b7fff4"],
      [0.1, "#2a8a86"],
      [0.34, "#0c3c44"],
      [0.7, "#062028"],
      [1, "#031014"],
    ]);
    g.save();
    g.globalAlpha = 0.14;
    g.fillStyle = "#e7fff8";
    for (let i = 0; i < 5; i++) {
      g.beginPath();
      g.moveTo(w * (0.12 + i * 0.17), 0);
      g.lineTo(w * (0.2 + i * 0.17), h);
      g.lineTo(w * (0.05 + i * 0.17), h);
      g.fill();
    }
    g.restore();
    g.fillStyle = "rgba(220, 255, 250, 0.4)";
    for (let i = 0; i < 16; i++) {
      g.beginPath();
      g.arc((i * 97) % w, (i * 53) % (h * 0.72), 1.4 + (i % 3), 0, Math.PI * 2);
      g.fill();
    }
    const s = Math.max(1.5, Math.min(2.15, w / 440));
    g.save();
    g.translate(w * 0.72, groundY - 90);
    g.rotate(-0.42);
    paintGalleon(g, 0, 0, s * 0.85, false);
    g.restore();
    paintBreach(g, w * 0.02, h * 0.28, s * 0.55);
    paintRocks(g, w, groundY + 4);
    paintJack(g, w * 0.08, groundY - 2, 2.15);
    paintJack(g, w * 0.2, groundY + 8, 1.3);
    paintJack(g, w * 0.9, groundY, 1.9);
    paintJack(g, w * 0.76, groundY + 10, 1.15);
    paintGroundBand(
      g, w, h,
      [[0, "rgba(4, 16, 20, 0)"], [0.3, "rgba(4, 18, 22, 0.82)"], [1, "#021014"]],
      "rgba(127, 212, 203, 0.28)"
    );
    paintVignette(g, w, h);
  }

  function buildLevelBackground(theme, w, h) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d");
    if (theme === "fleet") paintFleet(g, w, h);
    else if (theme === "cloak") paintCloak(g, w, h);
    else if (theme === "deep") paintDeep(g, w, h);
    else paintHarbor(g, w, h, theme === "breach");
    return c;
  }

  function paintWorldMotion(theme, w, h) {
    const t = performance.now() * 0.001;
    const groundY = h - 28;
    if (theme === "fleet") {
      ctx.globalAlpha = 0.12 + Math.sin(t * 1.6) * 0.05;
      ctx.fillStyle = "#ffb06a";
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.2, 70, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = `rgba(210, 250, 246, ${0.18 + Math.sin(t * 2) * 0.08})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.66);
      for (let x = 0; x <= w; x += 18) {
        ctx.lineTo(x, h * 0.66 + Math.sin(x * 0.04 + t * 1.4) * 3);
      }
      ctx.stroke();
    } else if (theme === "cloak") {
      ctx.fillStyle = "rgba(10, 14, 20, 0.72)";
      for (let i = 0; i < 4; i++) {
        const x = w * (0.2 + i * 0.12) + Math.sin(t * 1.5 + i) * 18;
        const y = h * 0.16 + i * 10 + Math.cos(t * 2 + i) * 6;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x - 11, y - 7, x - 13, y);
        ctx.quadraticCurveTo(x - 5, y - 2, x, y + 2);
        ctx.quadraticCurveTo(x + 5, y - 2, x + 13, y);
        ctx.quadraticCurveTo(x + 11, y - 7, x, y);
        ctx.fill();
      }
      ctx.globalAlpha = 0.16 + Math.sin(t * 3) * 0.08;
      ctx.fillStyle = "#ffd9a0";
      ctx.beginPath();
      ctx.arc(w * 0.7, groundY - 90, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    } else if (theme === "deep") {
      ctx.fillStyle = "rgba(220, 255, 250, 0.45)";
      for (let i = 0; i < 7; i++) {
        const y = ((h * 0.85 - ((t * 28 + i * 70) % (h * 0.9))));
        ctx.beginPath();
        ctx.arc((i * 127) % w, y, 1.6 + (i % 3) * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
      const pulse = 0.18 + Math.sin(t * 3.2) * 0.1;
      ctx.globalAlpha = pulse;
      ctx.fillStyle = "#ffb04a";
      ctx.beginPath();
      ctx.arc(w * 0.1, groundY - 4, 16, 0, Math.PI * 2);
      ctx.arc(w * 0.86, groundY - 2, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    } else {
      ctx.globalAlpha = 0.1 + Math.sin(t * 1.3) * 0.04;
      ctx.fillStyle = "#9fe8df";
      ctx.beginPath();
      ctx.arc(w * 0.58, h * 0.16, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = `rgba(190, 245, 236, ${0.16 + Math.sin(t * 1.8) * 0.06})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.66);
      for (let x = 0; x <= w; x += 18) {
        ctx.lineTo(x, h * 0.66 + Math.sin(x * 0.045 + t) * 3);
      }
      ctx.stroke();
      ctx.fillStyle = `rgba(180, 230, 224, ${0.06 + Math.sin(t * 0.6) * 0.03})`;
      ctx.beginPath();
      ctx.ellipse(w * 0.4 + Math.sin(t * 0.35) * 16, h * 0.66 + 6, w * 0.22, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    }
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
    const theme = lvl.theme || "harbor";
    ctx.drawImage(getBackground(theme, w, h), 0, 0);

    if (!quality.bgMotion) return;
    paintWorldMotion(theme, w, h);
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
    ctx.ellipse(0, p.h - 4, p.w * 0.17, 3.5, 0, 0, Math.PI * 2);
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
      const drawH = 98;
      const drawW = drawH * (painted.naturalWidth / painted.naturalHeight);
      const foot = p.h - 2;
      const anchor = painted === vigilSprite ? 0.5 : 0.48;
      ctx.drawImage(painted, -drawW * anchor, foot - drawH, drawW, drawH);
    } else {
      ctx.translate(0, -18);
      ctx.scale(1.075, 1.075);
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
    ctx.fillStyle = "#7fd4cb";
    ctx.font = "500 15px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText((lvl.world || "WORLD").toUpperCase(), w / 2, h * 0.42);
    ctx.fillStyle = "#e7f6f4";
    ctx.font = "560 28px Fraunces, Georgia, serif";
    ctx.fillText(lvl.name, w / 2, h * 0.42 + 32);
    ctx.fillStyle = "#8fadb3";
    ctx.font = "500 14px Outfit, sans-serif";
    ctx.fillText(lvl.blurb, w / 2, h * 0.42 + 56);
    ctx.restore();
  }

  function drawBonusPieces() {
    const bonus = state.bonus;
    if (!bonus) return;
    for (const piece of bonus.halves) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, piece.life / piece.max);
      ctx.translate(piece.x, piece.y);
      ctx.rotate(piece.rot);
      ctx.beginPath();
      ctx.rect(piece.side < 0 ? -120 : 0, -120, 120, 240);
      ctx.clip();
      drawDropSprite(piece.kind, piece.r);
      ctx.restore();
    }
    for (const target of bonus.targets) {
      if (target.hit) continue;
      ctx.save();
      ctx.translate(target.x, target.y);
      ctx.rotate(target.rot * 0.35);
      if (target.bad) {
        ctx.strokeStyle = "rgba(255, 77, 109, 0.9)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, target.r + 7, 0, Math.PI * 2);
        ctx.stroke();
      } else if (target.rare && quality.glow) {
        ctx.fillStyle = "rgba(255, 224, 138, 0.28)";
        ctx.beginPath();
        ctx.arc(0, 0, target.r + 16, 0, Math.PI * 2);
        ctx.fill();
      }
      drawDropSprite(target.kind, target.r);
      ctx.restore();
    }
  }

  function drawBlade() {
    const trail = state.bonus && state.bonus.trail;
    if (!trail || trail.length < 2) return;
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    trail.forEach((point, i) => (i ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)));
    ctx.strokeStyle = "rgba(232, 132, 58, 0.45)";
    ctx.lineWidth = 18;
    if (quality.glow) {
      ctx.shadowColor = "#e8843a";
      ctx.shadowBlur = 16;
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#f4fffd";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }

  function drawBonusFrame(w, h) {
    const bonus = state.bonus;
    if (!bonus) return;
    const rush = bonus.time <= 4 && bonus.banner <= 0;
    const pulse = 0.35 + Math.sin(performance.now() * (rush ? 0.012 : 0.005)) * 0.15;
    ctx.save();
    ctx.strokeStyle = rush ? `rgba(255, 77, 109, ${pulse})` : `rgba(232, 132, 58, ${pulse})`;
    ctx.lineWidth = rush ? 8 : 5;
    ctx.strokeRect(6, 6, w - 12, h - 12);
    ctx.restore();
    if (bonus.banner > 0) {
      const fade = Math.min(1, bonus.banner * 2.2);
      ctx.save();
      ctx.globalAlpha = 0.45 * fade;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = fade;
      ctx.fillStyle = "#e8843a";
      ctx.font = "700 16px Outfit, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("BONUS", w / 2, h * 0.38);
      ctx.fillStyle = "#e7f6f4";
      ctx.font = "560 34px Fraunces, Georgia, serif";
      ctx.fillText("Slash the haul", w / 2, h * 0.38 + 40);
      ctx.fillStyle = "#8fadb3";
      ctx.font = "500 15px Outfit, sans-serif";
      ctx.fillText("Pumpkins and candy. Not the skulls.", w / 2, h * 0.38 + 68);
      ctx.restore();
    } else if (bonus.scored === 0 && bonus.time > 10) {
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = "#e7f6f4";
      ctx.font = "700 14px Outfit, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("DRAG TO SLASH", w / 2, h * 0.22);
      ctx.restore();
    }
    if (bonus.epicT > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, bonus.epicT * 2);
      ctx.fillStyle = "#ffe08a";
      ctx.font = "800 42px Outfit, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(bonus.epic, w / 2, h * 0.28);
      ctx.restore();
    }
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
    if (state.bonus) {
      ctx.save();
      ctx.globalAlpha = 0.4;
      drawPlayer();
      ctx.restore();
      drawBonusPieces();
    } else {
      drawDrops();
      drawPlayer();
    }
    drawParticles();
    drawFloaters();
    if (state.bonus) {
      drawBlade();
      drawBonusFrame(w, h);
    } else {
      drawComboBanner(w);
      drawLevelBanner(w, h);
    }

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

  function pointerToGame(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
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
    if (state.bonus) beginSlash(pointerToGame(e));
    else aimX = pointerToGameX(e.clientX);
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!running || paused) return;
    pointerKind = e.pointerType || pointerKind;
    if (state.bonus) {
      if (!pointerActive) return;
      e.preventDefault();
      extendSlash(pointerToGame(e));
      return;
    }

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
    if (state.bonus) endSlash();
    pointerActive = false;
    // Keep aim on mouse for hover; clear on touch so release doesn't drag forever
    if ((e.pointerType || pointerKind) === "touch") aimX = null;
  });

  canvas.addEventListener("pointercancel", () => {
    if (state.bonus) endSlash();
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
