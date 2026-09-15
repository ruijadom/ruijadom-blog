import { Mission } from "./engine";
const TAU = Math.PI * 2;
function polygon(c: CanvasRenderingContext2D, points: number[][]) {
  c.beginPath();
  points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.closePath();
}
export function render(
  c: CanvasRenderingContext2D,
  m: Mission,
  reducedMotion: boolean,
) {
  const w = m.width;
  const t = reducedMotion ? 0 : m.time;
  c.clearRect(0, 0, w, 700);
  const sky = c.createLinearGradient(0, 0, w, 700);
  sky.addColorStop(0, "#081323");
  sky.addColorStop(0.55, "#080e1d");
  sky.addColorStop(1, "#10172a");
  c.fillStyle = sky;
  c.fillRect(0, 0, w, 700);
  const nebula = c.createRadialGradient(
    w * 0.72,
    170,
    0,
    w * 0.72,
    170,
    w * 0.65,
  );
  nebula.addColorStop(0, "#283d5e66");
  nebula.addColorStop(0.5, "#28315122");
  nebula.addColorStop(1, "#11182700");
  c.fillStyle = nebula;
  c.fillRect(0, 0, w, 700);
  // Seeded positions avoid random flicker and keep the backdrop quiet.
  for (let i = 0; i < 110; i++) {
    const x = ((((Math.sin(i * 127.1 + 4) * 43758.5) % 1) + 1) % 1) * w;
    const y = (((i * 197.37) % 700) + t * ((i % 3) + 1) * 2) % 700;
    c.fillStyle = i % 6 === 0 ? "#bfd5ed99" : "#8fadd944";
    c.beginPath();
    c.arc(x, y, i % 6 === 0 ? 1.2 : 0.7, 0, TAU);
    c.fill();
  }
  c.save();
  c.translate(w * 0.77, 175);
  c.rotate(-0.36);
  c.strokeStyle = "#7b9bc71c";
  c.lineWidth = 1;
  for (const size of [140, 180, 224]) {
    c.beginPath();
    c.ellipse(0, 0, size, size * 0.37, 0, 0, TAU);
    c.stroke();
  }
  const planet = c.createRadialGradient(-32, -35, 4, 0, 0, 83);
  planet.addColorStop(0, "#46677b");
  planet.addColorStop(0.5, "#263e56");
  planet.addColorStop(1, "#0c1627");
  c.fillStyle = planet;
  c.beginPath();
  c.arc(0, 0, 82, 0, TAU);
  c.fill();
  c.strokeStyle = "#9ec8d32b";
  c.beginPath();
  c.arc(0, 0, 83, 3.3, 5.9);
  c.stroke();
  c.restore();
  // A subtle perspective grid gives the playfield depth and a clear lower boundary.
  c.strokeStyle = "#6eaec00d";
  for (let x = -w; x < w * 2; x += 85) {
    c.beginPath();
    c.moveTo(w / 2 + (x - w / 2) * 0.25, 350);
    c.lineTo(x, 700);
    c.stroke();
  }
  for (let y = 390; y < 700; y += (y - 320) * 0.26) {
    c.beginPath();
    c.moveTo(0, y);
    c.lineTo(w, y);
    c.stroke();
  }
  c.setLineDash([4, 8]);
  c.strokeStyle = "#ff7e9d30";
  c.beginPath();
  c.moveTo(0, 681);
  c.lineTo(w, 681);
  c.stroke();
  c.setLineDash([]);
  c.font = "9px monospace";
  c.fillStyle = "#a2adc16b";
  c.fillText("PRODUCTION BOUNDARY", 14, 694);
  for (const e of m.entities) {
    c.save();
    c.translate(e.x, e.y);
    c.shadowBlur = reducedMotion ? 0 : 16;
    c.shadowColor = e.type === "shard" ? "#64dfd1" : "#ff537e";
    if (e.type === "shard") {
      c.rotate(e.angle);
      polygon(c, [
        [0, -21],
        [16, -9],
        [17, 11],
        [0, 22],
        [-17, 10],
        [-16, -10],
      ]);
      c.fillStyle = "#133e47";
      c.fill();
      c.strokeStyle = "#6de1d6";
      c.lineWidth = 1.5;
      c.stroke();
      c.shadowBlur = 0;
      c.beginPath();
      c.moveTo(0, -21);
      c.lineTo(5, 0);
      c.lineTo(0, 22);
      c.moveTo(-16, -10);
      c.lineTo(5, 0);
      c.lineTo(17, 11);
      c.strokeStyle = "#69ddc977";
      c.stroke();
    } else {
      for (let i = -1; i <= 1; i++) {
        c.beginPath();
        c.moveTo(-11, i * 7);
        c.lineTo(-22, i * 11 - 4);
        c.lineTo(-25, i * 11 + 3);
        c.moveTo(11, i * 7);
        c.lineTo(22, i * 11 - 4);
        c.lineTo(25, i * 11 + 3);
        c.strokeStyle = "#f7809f";
        c.lineWidth = 2;
        c.stroke();
      }
      polygon(c, [
        [0, -20],
        [13, -9],
        [12, 11],
        [0, 20],
        [-12, 11],
        [-13, -9],
      ]);
      c.fillStyle = "#501e3c";
      c.fill();
      c.strokeStyle = "#ff7e9d";
      c.stroke();
      c.fillStyle = "#ffcada";
      c.fillRect(-6, -7, 4, 5);
      c.fillRect(3, -7, 4, 5);
      c.shadowBlur = 0;
      if (e.hp > 1) {
        c.strokeStyle = "#ffd18c";
        c.beginPath();
        c.arc(0, 0, 28, 0, TAU);
        c.stroke();
      }
    }
    c.restore();
  }
  for (const b of m.shots) {
    c.save();
    c.strokeStyle = b.auto ? "#b89dff" : "#9ef8e7";
    c.lineWidth = b.auto ? 3 : 2.5;
    c.shadowColor = c.strokeStyle;
    c.shadowBlur = reducedMotion ? 0 : 12;
    c.beginPath();
    c.moveTo(b.x, b.y);
    c.lineTo(b.x - b.vx * 0.022, b.y - b.vy * 0.022);
    c.stroke();
    c.restore();
  }
  for (let i = 0; i < m.tests; i++) {
    const x = m.x + (i - (m.tests - 1) / 2) * 58;
    c.save();
    c.translate(x, 552 + (reducedMotion ? 0 : Math.sin(t * 2 + i) * 4));
    c.fillStyle = "#282845";
    c.strokeStyle = "#b49cf2";
    c.lineWidth = 1;
    c.fillRect(-25, -7, 16, 14);
    c.strokeRect(-25, -7, 16, 14);
    c.fillRect(9, -7, 16, 14);
    c.strokeRect(9, -7, 16, 14);
    polygon(c, [
      [0, -14],
      [9, 0],
      [0, 14],
      [-9, 0],
    ]);
    c.fillStyle = "#bda7f4";
    c.fill();
    c.restore();
  }
  c.save();
  c.translate(m.x, 620);
  if (m.invulnerable > 0) {
    c.strokeStyle = "#9ff8e8";
    c.lineWidth = 2;
    c.beginPath();
    c.arc(0, 0, 38, 0, TAU);
    c.stroke();
  }
  const flame = 23 + (reducedMotion ? 0 : Math.sin(t * 45) * 7);
  const exhaust = c.createLinearGradient(0, 18, 0, 25 + flame);
  exhaust.addColorStop(0, "#a7fff3");
  exhaust.addColorStop(0.4, "#47c8f0aa");
  exhaust.addColorStop(1, "#419bdd00");
  c.fillStyle = exhaust;
  polygon(c, [
    [-9, 18],
    [0, 25 + flame],
    [9, 18],
  ]);
  c.fill();
  polygon(c, [
    [0, -32],
    [13, -9],
    [29, 21],
    [12, 15],
    [8, 25],
    [-8, 25],
    [-12, 15],
    [-29, 21],
    [-13, -9],
  ]);
  const body = c.createLinearGradient(-28, 0, 28, 0);
  body.addColorStop(0, "#45617c");
  body.addColorStop(0.48, "#e4effa");
  body.addColorStop(0.52, "#a3bdd5");
  body.addColorStop(1, "#334a66");
  c.fillStyle = body;
  c.fill();
  c.strokeStyle = "#d7e9f9";
  c.lineWidth = 1;
  c.stroke();
  polygon(c, [
    [0, -19],
    [6, -4],
    [0, 5],
    [-6, -4],
  ]);
  c.fillStyle = "#64dfd1";
  c.shadowColor = "#64dfd1";
  c.shadowBlur = reducedMotion ? 0 : 12;
  c.fill();
  c.shadowBlur = 0;
  c.fillStyle = "#64dfd1";
  c.fillRect(-20, 14, 5, 3);
  c.fillRect(15, 14, 5, 3);
  c.restore();
  if (!reducedMotion)
    for (const p of m.sparks) {
      c.globalAlpha = Math.max(0, p.life / 0.6);
      c.fillStyle = p.color;
      c.fillRect(p.x, p.y, 3, 3);
    }
  c.globalAlpha = 1;
  if (m.pulse > 0) {
    c.strokeStyle = "#9dfcea";
    c.lineWidth = 3;
    c.globalAlpha = m.pulse / 0.65;
    c.beginPath();
    c.arc(m.x, 620, reducedMotion ? 45 : (1 - m.pulse / 0.65) * 1300, 0, TAU);
    c.stroke();
    c.globalAlpha = 1;
  }
}
