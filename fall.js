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

  var kinds = ["candy", "pumpkin", "skull"];
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
