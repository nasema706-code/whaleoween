(function () {
  var layer = document.createElement("div");
  layer.className = "fall";
  layer.setAttribute("aria-hidden", "true");
  document.body.prepend(layer);

  var style = document.createElement("style");
  style.textContent =
    ".fall{overflow:hidden}" +
    ".fall-piece{position:absolute;top:-18vh;height:auto;max-width:none;object-fit:contain;background:transparent;animation-name:fall-drop;animation-timing-function:linear;animation-iteration-count:infinite;pointer-events:none}" +
    "@keyframes fall-drop{from{transform:translate3d(0,-10vh,0) rotate(0deg)}to{transform:translate3d(var(--drift),120vh,0) rotate(var(--spin))}}" +
    "@media (prefers-reduced-motion:reduce){.fall-piece{animation:none}}";
  document.head.appendChild(style);

  var kinds = ["lantern", "jelly", "eel"];
  var urls = {};
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mode = "";

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
    var s = 1.7;
    g.lineCap = "round";
    g.lineJoin = "round";
    if (kind === "lantern") {
      var warm = g.createRadialGradient(0, 2 * s, 2 * s, 0, 2 * s, 30 * s);
      warm.addColorStop(0, "rgba(255, 186, 72, 0.7)");
      warm.addColorStop(1, "rgba(255, 138, 30, 0)");
      g.fillStyle = warm;
      g.beginPath();
      g.arc(0, 2 * s, 30 * s, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "#e7c27a";
      g.lineWidth = 1.7 * s;
      g.beginPath();
      g.arc(0, -22 * s, 3.4 * s, 0, Math.PI * 2);
      g.stroke();
      g.fillStyle = "#3a2818";
      g.beginPath();
      g.moveTo(-8 * s, -16 * s);
      g.lineTo(0, -20 * s);
      g.lineTo(8 * s, -16 * s);
      g.lineTo(6 * s, -12 * s);
      g.lineTo(-6 * s, -12 * s);
      g.closePath();
      g.fill();
      g.fillStyle = "#ff9a2e";
      roundRect(g, -11 * s, -11 * s, 22 * s, 26 * s, 3 * s);
      g.fill();
      g.fillStyle = "#ffe7a8";
      roundRect(g, -6 * s, -7 * s, 5 * s, 18 * s, 1.4 * s);
      g.fill();
      g.strokeStyle = "#24160e";
      g.lineWidth = 1.8 * s;
      roundRect(g, -11 * s, -11 * s, 22 * s, 26 * s, 3 * s);
      g.stroke();
      g.beginPath();
      g.moveTo(0, -11 * s);
      g.lineTo(0, 15 * s);
      g.moveTo(-11 * s, 2 * s);
      g.lineTo(11 * s, 2 * s);
      g.stroke();
      g.fillStyle = "#3a2818";
      g.fillRect(-12 * s, 14 * s, 24 * s, 3.6 * s);
    } else if (kind === "jelly") {
      var tide = g.createRadialGradient(0, -2 * s, 2 * s, 0, 0, 28 * s);
      tide.addColorStop(0, "rgba(122, 246, 255, 0.55)");
      tide.addColorStop(1, "rgba(94, 240, 228, 0)");
      g.fillStyle = tide;
      g.beginPath();
      g.arc(0, -2 * s, 28 * s, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "rgba(72, 214, 224, 0.92)";
      g.beginPath();
      g.ellipse(0, -4 * s, 16 * s, 13 * s, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "rgba(226, 255, 252, 0.62)";
      g.beginPath();
      g.ellipse(-4 * s, -8 * s, 6 * s, 4.5 * s, -0.5, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "#f4fffe";
      g.lineWidth = 1.5 * s;
      g.beginPath();
      g.ellipse(0, 6 * s, 14 * s, 3.6 * s, 0, 0, Math.PI);
      g.stroke();
      g.strokeStyle = "rgba(186, 255, 250, 0.95)";
      g.lineWidth = 1.6 * s;
      [-10, -3, 4, 11].forEach(function (x, i) {
        g.beginPath();
        g.moveTo(x * s, 8 * s);
        g.quadraticCurveTo((x + (i % 2 ? 5 : -5)) * s, 16 * s, x * s, 26 * s);
        g.stroke();
      });
    } else {
      g.beginPath();
      g.moveTo(-28 * s, 8 * s);
      g.quadraticCurveTo(-14 * s, -18 * s, 0, 2 * s);
      g.quadraticCurveTo(14 * s, 20 * s, 28 * s, -6 * s);
      g.lineWidth = 8 * s;
      g.strokeStyle = "#0e2438";
      g.stroke();
      g.lineWidth = 3.4 * s;
      g.strokeStyle = "#1c7f9a";
      g.stroke();
      g.beginPath();
      g.moveTo(-20 * s, -2 * s);
      g.lineTo(-10 * s, 6 * s);
      g.lineTo(-2 * s, -8 * s);
      g.lineTo(8 * s, 10 * s);
      g.lineTo(18 * s, -2 * s);
      g.strokeStyle = "#7af6ff";
      g.lineWidth = 1.8 * s;
      g.stroke();
      g.strokeStyle = "#ffffff";
      g.lineWidth = 0.7 * s;
      g.stroke();
      g.fillStyle = "#d9fbff";
      g.beginPath();
      g.arc(24 * s, -7 * s, 1.8 * s, 0, Math.PI * 2);
      g.fill();
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
      urls[kind] = c.toDataURL("image/png");
    });
  }

  function countFor(w) {
    return w <= 800 ? 5 : 10;
  }

  function build() {
    var w = window.innerWidth;
    var n = countFor(w);
    var frag = document.createDocumentFragment();
    for (var i = 0; i < n; i++) {
      var img = document.createElement("img");
      img.className = "fall-piece";
      img.alt = "";
      img.decoding = "async";
      img.src = urls[kinds[i % kinds.length]];
      var size = Math.round(128 * (0.72 + Math.random() * 0.5) * 0.7);
      img.style.width = size + "px";
      img.style.left = Math.random() * 92 + "%";
      img.style.setProperty("--drift", Math.round((Math.random() - 0.5) * 36) + "px");
      img.style.setProperty("--spin", Math.round((Math.random() - 0.5) * 70) + "deg");
      if (reduced) {
        img.style.top = Math.random() * 80 + "vh";
      } else {
        img.style.animationDuration = 16 + Math.random() * 10 + "s";
        img.style.animationDelay = -Math.random() * 26 + "s";
      }
      frag.appendChild(img);
    }
    layer.replaceChildren(frag);
    mode = w <= 800 ? "m" : "d";
  }

  bake();
  build();
  window.addEventListener("resize", function () {
    var next = window.innerWidth <= 800 ? "m" : "d";
    if (next !== mode) build();
  });
})();
