(function () {
  var canvas = document.createElement("canvas");
  canvas.className = "fall";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);

  var ctx = canvas.getContext("2d", { alpha: false });
  var kinds = ["candy", "pumpkin", "skull"];
  var sprites = {};
  var pieces = [];
  var width = 0;
  var height = 0;
  var dpr = 1;
  var sky = null;
  var raf = 0;
  var last = 0;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function roundRect(g, x, y, w, h, r) {
    var rr = Math.min(r, w / 2, h / 2);
    g.beginPath();
    g.moveTo(x + rr, y);
    g.arcTo(x + w, y, x + w, y + h, rr);
    g.arcTo(x + w, y + h, x, y + h, rr);
    g.arcTo(x, y + h, x, y, rr);
    g.arcTo(x, y, x + w, y, rr);
    g.closePath();
  }

  function paint(g, kind) {
    var s = 1.85;
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
    } else if (kind === "pumpkin") {
      g.fillStyle = "#ff7a1a";
      g.beginPath();
      g.ellipse(0, 2 * s, 14 * s, 12 * s, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#e8650e";
      g.beginPath();
      g.ellipse(-6 * s, 2 * s, 5 * s, 11 * s, 0, 0, Math.PI * 2);
      g.ellipse(6 * s, 2 * s, 5 * s, 11 * s, 0, 0, Math.PI * 2);
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
    } else {
      g.fillStyle = "#efe6d8";
      g.beginPath();
      g.ellipse(0, -2 * s, 11 * s, 12 * s, 0, 0, Math.PI * 2);
      g.fill();
      g.fillRect(-7 * s, 6 * s, 14 * s, 6 * s);
      g.fillStyle = "#1a120c";
      g.beginPath();
      g.ellipse(-4.5 * s, -1 * s, 3.2 * s, 3.6 * s, 0, 0, Math.PI * 2);
      g.ellipse(4.5 * s, -1 * s, 3.2 * s, 3.6 * s, 0, 0, Math.PI * 2);
      g.fill();
      g.fillRect(-1.2 * s, 4 * s, 2.4 * s, 3 * s);
      g.fillRect(-5 * s, 10 * s, 2.2 * s, 3 * s);
      g.fillRect(-1.1 * s, 10 * s, 2.2 * s, 3 * s);
      g.fillRect(2.8 * s, 10 * s, 2.2 * s, 3 * s);
    }
  }

  function bake() {
    kinds.forEach(function (kind) {
      var c = document.createElement("canvas");
      c.width = 128;
      c.height = 128;
      var g = c.getContext("2d");
      g.translate(64, 64);
      paint(g, kind);
      sprites[kind] = c;
    });
  }

  function makePiece(scatter) {
    return {
      kind: kinds[(Math.random() * kinds.length) | 0],
      x: Math.random() * width,
      y: scatter ? Math.random() * height : -40 - Math.random() * height * 0.45,
      speed: 28 + Math.random() * 46,
      spin: (Math.random() - 0.5) * 0.8,
      rot: Math.random() * Math.PI * 2,
      scale: 0.72 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      sway: 0.6 + Math.random() * 0.8
    };
  }

  function fill() {
    var next = Math.round(Math.min(26, Math.max(9, width / 72)));
    while (pieces.length < next) pieces.push(makePiece(true));
    if (pieces.length > next) pieces.length = next;
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sky = ctx.createRadialGradient(width * 0.8, 0, 0, width * 0.8, 0, Math.min(width, 900));
    sky.addColorStop(0, "rgba(196, 165, 116, 0.09)");
    sky.addColorStop(0.55, "rgba(196, 165, 116, 0)");
    fill();
    draw(0);
  }

  function draw() {
    ctx.fillStyle = "#0c0b0a";
    ctx.fillRect(0, 0, width, height);
    if (sky) {
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);
    }
    for (var i = 0; i < pieces.length; i++) {
      var p = pieces[i];
      var sprite = sprites[p.kind];
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(p.scale, p.scale);
      ctx.drawImage(sprite, -64, -64);
      ctx.restore();
    }
  }

  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    for (var i = 0; i < pieces.length; i++) {
      var p = pieces[i];
      p.y += p.speed * dt;
      p.x += Math.sin(now * 0.001 * p.sway + p.phase) * 18 * dt;
      p.rot += p.spin * dt;
      if (p.y > height + 70) {
        p.y = -50 - Math.random() * 80;
        p.x = Math.random() * width;
      }
      if (p.x < -60) p.x = width + 40;
      if (p.x > width + 60) p.x = -40;
    }
    draw();
    raf = requestAnimationFrame(frame);
  }

  bake();
  resize();
  window.addEventListener("resize", resize);
  if (!reduced) {
    last = performance.now();
    raf = requestAnimationFrame(frame);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
  }
})();
