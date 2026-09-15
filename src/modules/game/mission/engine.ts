/** Deterministic simulation: all durations and movement use seconds, never frames. */
export const PHASES = [
  {
    name: "Prototype",
    tag: "01 / DISCOVER",
    title: "Make the first connection.",
    detail:
      "Harvest feature shards. Fix bugs before they reach your softphone.",
    lesson:
      "A working prototype is a beginning. Invest in the tools that keep it working.",
    bug: "SIP timeout",
    color: "#64dfd1",
  },
  {
    name: "Integration",
    tag: "02 / CONNECT",
    title: "Keep the media flowing.",
    detail:
      "ICE failures are faster. Your test satellites automatically target bugs.",
    lesson:
      "Automated tests protect existing behaviour while new integrations add complexity.",
    bug: "ICE failure",
    color: "#8bb8ff",
  },
  {
    name: "Hardening",
    tag: "03 / STABILISE",
    title: "Handle the unexpected.",
    detail:
      "Regressions take two hits. Use a hotfix pulse when things get crowded.",
    lesson:
      "Resilience comes from testing failure paths, not just the happy path.",
    bug: "Regression",
    color: "#c0a0ff",
  },
  {
    name: "Production",
    tag: "04 / RELEASE",
    title: "Ship. Observe. Improve.",
    detail: "Survive the final traffic spike to release your softphone.",
    lesson:
      "Shipping is a milestone. Observability and automation keep production healthy.",
    bug: "Packet loss",
    color: "#ffc980",
  },
] as const;
export type Mode =
  | "welcome"
  | "playing"
  | "paused"
  | "upgrade"
  | "won"
  | "lost";
export type Upgrade = "tests" | "shield" | "weapon";
export type Entity = {
  x: number;
  y: number;
  r: number;
  speed: number;
  type: "shard" | "bug";
  hp: number;
  angle: number;
};
export type Shot = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  auto: boolean;
};
export type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
};
export type Input = {
  left: boolean;
  right: boolean;
  fire: boolean;
  target: number | null;
};
export type Mission = {
  mode: Mode;
  width: number;
  x: number;
  time: number;
  phase: number;
  phaseTime: number;
  health: number;
  maxHealth: number;
  score: number;
  shards: number;
  bugs: number;
  tests: number;
  weapon: number;
  autoFire: boolean;
  assisted: boolean;
  combo: number;
  comboTime: number;
  invulnerable: number;
  cooldown: number;
  pulse: number;
  spawn: number;
  shot: number;
  satelliteShot: number;
  entities: Entity[];
  shots: Shot[];
  sparks: Spark[];
  notice: string;
  noticeTime: number;
};
export const DURATION = 30;
export function createMission(width = 1000): Mission {
  return {
    mode: "welcome",
    width,
    x: width / 2,
    time: 0,
    phase: 0,
    phaseTime: 0,
    health: 4,
    maxHealth: 4,
    score: 0,
    shards: 0,
    bugs: 0,
    tests: 0,
    weapon: 0,
    autoFire: false,
    assisted: false,
    combo: 0,
    comboTime: 0,
    invulnerable: 0,
    cooldown: 0,
    pulse: 0,
    spawn: 0.7,
    shot: 0,
    satelliteShot: 0,
    entities: [],
    shots: [],
    sparks: [],
    notice: "",
    noticeTime: 0,
  };
}
export function resizeMission(m: Mission, width: number) {
  const ratio = width / m.width;
  m.x *= ratio;
  for (const a of [...m.entities, ...m.shots, ...m.sparks]) a.x *= ratio;
  m.width = width;
}
function burst(
  m: Mission,
  x: number,
  y: number,
  color: string,
  random: () => number,
) {
  for (let i = 0; i < 12; i++) {
    const angle = random() * Math.PI * 2;
    const speed = 30 + random() * 110;
    m.sparks.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.6,
      color,
    });
  }
}
function reward(m: Mission, e: Entity, random: () => number) {
  m.combo = Math.min(20, m.combo + 1);
  m.comboTime = 2.8;
  m.score += (e.type === "shard" ? 10 : 25) * (1 + Math.floor(m.combo / 5));
  if (e.type === "shard") m.shards++;
  else m.bugs++;
  burst(m, e.x, e.y, e.type === "shard" ? "#64dfd1" : "#ff7e9d", random);
}
export function hotfix(m: Mission, random = Math.random) {
  if (m.mode !== "playing" || m.cooldown > 0) return false;
  m.cooldown = 12;
  m.pulse = 0.65;
  m.entities = m.entities.filter((e) => {
    if (e.type !== "bug") return true;
    reward(m, e, random);
    return false;
  });
  m.notice = "Hotfix deployed · active bugs cleared";
  m.noticeTime = 2;
  return true;
}
export function upgrade(m: Mission, choice: Upgrade) {
  if (m.mode !== "upgrade") return;
  if (choice === "tests") m.tests++;
  if (choice === "shield") {
    m.maxHealth++;
    m.health = Math.min(m.maxHealth, m.health + 2);
  }
  if (choice === "weapon") {
    m.weapon++;
    if (m.weapon === 1) m.autoFire = true;
  }
  m.phase++;
  m.phaseTime = 0;
  m.mode = "playing";
  m.spawn = 1;
  m.invulnerable = 1.5;
  m.notice =
    choice === "weapon" && m.weapon === 1
      ? "Automation unlocked · your tools now handle firing"
      : PHASES[m.phase].title;
  m.noticeTime = 3;
}
export function isAutoFiring(m: Mission): boolean {
  return m.autoFire && (m.weapon > 0 || m.assisted);
}
export function step(
  m: Mission,
  input: Input,
  elapsed: number,
  random = Math.random,
) {
  if (m.mode !== "playing") return;
  const dt = Math.min(Math.max(elapsed, 0), 0.05);
  m.time += dt;
  m.phaseTime += dt;
  for (const key of [
    "cooldown",
    "pulse",
    "invulnerable",
    "comboTime",
    "noticeTime",
  ] as const)
    m[key] = Math.max(0, m[key] - dt);
  if (!m.comboTime) m.combo = 0;
  if (input.target !== null)
    m.x += Math.max(-430 * dt, Math.min(430 * dt, input.target - m.x));
  else m.x += ((input.right ? 1 : 0) - (input.left ? 1 : 0)) * 430 * dt;
  m.x = Math.max(26, Math.min(m.width - 26, m.x));
  m.shot = Math.max(0, m.shot - dt);
  m.satelliteShot = Math.max(0, m.satelliteShot - dt);
  m.spawn = Math.max(0, m.spawn - dt);
  if ((isAutoFiring(m) || input.fire) && m.shot <= 0) {
    m.shot = Math.max(0.12, 0.27 - m.weapon * 0.05);
    const offsets = m.weapon > 1 ? [-9, 9] : [0];
    for (const dx of offsets)
      m.shots.push({ x: m.x + dx, y: 591, vx: dx * 2, vy: -610, auto: false });
  }
  if (m.tests && m.satelliteShot <= 0) {
    m.satelliteShot = 0.75;
    const bugs = m.entities.filter((e) => e.type === "bug");
    for (let i = 0; i < m.tests; i++) {
      const enemy = bugs[i % bugs.length];
      if (!enemy) break;
      const x = m.x + (i - (m.tests - 1) / 2) * 58;
      const y = 552;
      const d = Math.max(1, Math.hypot(enemy.x - x, enemy.y - y));
      m.shots.push({
        x,
        y,
        vx: ((enemy.x - x) / d) * 470,
        vy: ((enemy.y - y) / d) * 470,
        auto: true,
      });
    }
  }
  if (m.spawn <= 0) {
    m.spawn = Math.max(0.32, 0.75 - m.phase * 0.11);
    const bug = random() < 0.48 + m.phase * 0.06;
    m.entities.push({
      x: 26 + random() * (m.width - 52),
      y: -30,
      r: bug ? 18 : 20,
      speed: bug ? 75 + m.phase * 20 : 90,
      type: bug ? "bug" : "shard",
      hp: bug && m.phase >= 2 ? 2 : 1,
      angle: random() * 6.28,
    });
  }
  for (const e of m.entities) {
    e.y += e.speed * dt;
    e.angle += dt * 0.8;
    if (e.type === "bug") e.x += Math.sign(m.x - e.x) * (13 + m.phase * 4) * dt;
  }
  for (const b of m.shots) {
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    const hit = m.entities.find(
      (e) => e.hp > 0 && Math.hypot(b.x - e.x, b.y - e.y) < e.r + 5,
    );
    if (hit) {
      hit.hp--;
      b.y = -1000;
      if (hit.hp === 0) reward(m, hit, random);
    }
  }
  m.shots = m.shots.filter(
    (b) => b.y > -40 && b.y < 740 && b.x > -30 && b.x < m.width + 30,
  );
  m.entities = m.entities.filter((e) => {
    if (e.hp <= 0) return false;
    const collision = Math.hypot(e.x - m.x, e.y - 620) < e.r + 21;
    if (e.type === "shard" && collision) {
      reward(m, e, random);
      return false;
    }
    if (e.type === "bug" && (collision || e.y > 680)) {
      if (m.invulnerable <= 0) {
        m.health--;
        m.combo = 0;
        m.invulnerable = 1.4;
        m.notice = collision
          ? "Bug impact · integrity −1"
          : "Escaped bug · production integrity −1";
        m.noticeTime = 2;
        burst(m, m.x, 620, "#ff7e9d", random);
        if (m.health <= 0) m.mode = "lost";
      }
      return false;
    }
    return e.y < 740;
  });
  for (const p of m.sparks) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
  }
  m.sparks = m.sparks.filter((p) => p.life > 0).slice(-240);
  if (m.phaseTime >= DURATION && m.mode === "playing") {
    m.phaseTime = DURATION;
    m.entities = [];
    m.shots = [];
    m.combo = 0;
    m.score += 100 * m.health;
    m.mode = m.phase === 3 ? "won" : "upgrade";
  }
}
const SAVE_KEY = "dev-space-mission-v2";
export function saveMission(m: Mission) {
  try {
    if (["playing", "paused", "upgrade"].includes(m.mode))
      localStorage.setItem(
        SAVE_KEY,
        JSON.stringify({ version: 2, mission: { ...m, sparks: [] } }),
      );
    else if (m.mode === "won" || m.mode === "lost")
      localStorage.removeItem(SAVE_KEY);
  } catch {
    /* Storage can be unavailable in privacy mode. Gameplay remains available. */
  }
}
export function loadMission(): Mission | null {
  try {
    const data = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
    if (data?.version !== 2 || !data.mission) return null;
    const m = data.mission;
    const base = createMission();
    // Older v2 saves have no control settings; preserve earned automation.
    if (m.assisted === undefined) m.assisted = false;
    if (m.autoFire === undefined) m.autoFire = m.weapon > 0;
    if (typeof m.assisted !== "boolean" || typeof m.autoFire !== "boolean")
      return null;
    for (const [key, value] of Object.entries(base)) {
      if (typeof value !== "number") continue;
      if (!Number.isFinite(m[key])) return null;
      // Legacy countdowns could become negative while waiting for player input.
      if (["shot", "satelliteShot", "spawn"].includes(key))
        m[key] = Math.max(0, m[key]);
      else if (m[key] < 0) return null;
    }
    if (
      !["playing", "paused", "upgrade"].includes(m.mode) ||
      !Number.isInteger(m.phase) ||
      m.phase > 3 ||
      m.width < 200 ||
      m.width > 5000 ||
      m.health < 1 ||
      m.health > m.maxHealth ||
      m.maxHealth > 7 ||
      m.tests > 3 ||
      m.weapon > 3 ||
      m.phaseTime > DURATION
    )
      return null;
    if (
      !Array.isArray(m.entities) ||
      !Array.isArray(m.shots) ||
      m.entities.length > 200 ||
      m.shots.length > 200
    )
      return null;
    if (
      m.entities.some(
        (e: Entity) =>
          !["shard", "bug"].includes(e.type) ||
          !["x", "y", "r", "speed", "hp", "angle"].every((k) =>
            Number.isFinite(e[k as keyof Entity]),
          ),
      )
    )
      return null;
    if (
      m.shots.some(
        (b: Shot) =>
          !["x", "y", "vx", "vy"].every((k) =>
            Number.isFinite(b[k as keyof Shot]),
          ),
      )
    )
      return null;
    return {
      ...m,
      sparks: [],
      notice: "Mission restored",
      noticeTime: 2,
      mode: m.mode === "upgrade" ? "upgrade" : "paused",
    };
  } catch {
    return null;
  }
}
