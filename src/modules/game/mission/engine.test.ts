import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createMission,
  hotfix,
  loadMission,
  saveMission,
  step,
  upgrade,
} from "./engine";
import type { Input } from "./engine";
const idle: Input = {
  left: false,
  right: false,
  fire: false,
  target: null,
};
const random = () => 0.9;

test("simulation time and movement are independent of refresh rate", () => {
  const at = (fps: number) => {
    const m = createMission(1800);
    m.mode = "playing";
    for (let i = 0; i < fps; i++)
      step(m, { ...idle, right: true }, 1 / fps, random);
    return m;
  };
  const a = at(30);
  const b = at(144);
  assert.ok(Math.abs(a.x - b.x) < 0.001);
  assert.ok(Math.abs(a.time - b.time) < 0.001);
});
test("paused missions freeze cooldowns, enemies and progression", () => {
  const m = createMission();
  m.mode = "paused";
  m.cooldown = 10;
  const before = JSON.stringify(m);
  step(m, { ...idle, fire: true }, 0.05);
  assert.equal(JSON.stringify(m), before);
});
test("one projectile cannot destroy two overlapping bugs", () => {
  const m = createMission();
  m.mode = "playing";
  m.entities = Array.from({ length: 2 }, () => ({
    x: 100,
    y: 100,
    r: 20,
    speed: 0,
    type: "bug" as const,
    hp: 1,
    angle: 0,
  }));
  m.shots = [{ x: 100, y: 100, vx: 0, vy: 0, auto: false }];
  step(m, idle, 0, random);
  assert.equal(m.bugs, 1);
  assert.equal(m.entities.length, 1);
});
test("escaped bugs cost integrity, with a recovery window against consecutive hits", () => {
  const m = createMission();
  m.mode = "playing";
  m.entities = Array.from({ length: 3 }, () => ({
    x: 20,
    y: 690,
    r: 18,
    speed: 0,
    type: "bug" as const,
    hp: 1,
    angle: 0,
  }));
  step(m, idle, 0.01, random);
  assert.equal(m.health, 3);
  assert.equal(m.entities.length, 0);
});
test("hotfix clears bugs, preserves features and cannot bypass its cooldown", () => {
  const m = createMission();
  m.mode = "playing";
  m.entities = [
    { x: 100, y: 100, r: 20, speed: 0, type: "bug", hp: 2, angle: 0 },
    { x: 200, y: 100, r: 20, speed: 0, type: "shard", hp: 1, angle: 0 },
  ];
  assert.equal(hotfix(m, random), true);
  assert.equal(m.entities.length, 1);
  assert.equal(m.entities[0].type, "shard");
  assert.equal(hotfix(m, random), false);
});
test("checkpoint waits for one upgrade before advancing", () => {
  const m = createMission();
  m.mode = "playing";
  m.phaseTime = 29.99;
  step(m, idle, 0.02, random);
  assert.equal(m.mode, "upgrade");
  upgrade(m, "tests");
  assert.equal(m.mode, "playing");
  assert.equal(m.phase, 1);
  assert.equal(m.tests, 1);
  upgrade(m, "tests");
  assert.equal(m.tests, 1);
});
test("resilience repairs health without exceeding its new maximum", () => {
  const m = createMission();
  m.mode = "upgrade";
  m.health = 4;
  upgrade(m, "shield");
  assert.equal(m.maxHealth, 5);
  assert.equal(m.health, 5);
});
test("last stage wins and loss takes precedence over a simultaneous checkpoint", () => {
  const m = createMission();
  m.mode = "playing";
  m.phase = 3;
  m.phaseTime = 29.99;
  step(m, idle, 0.02, random);
  assert.equal(m.mode, "won");
  const n = createMission();
  n.mode = "playing";
  n.phaseTime = 29.99;
  n.health = 1;
  n.entities = [
    { x: n.x, y: 620, r: 20, speed: 0, type: "bug", hp: 1, angle: 0 },
  ];
  step(n, idle, 0.02, random);
  assert.equal(n.mode, "lost");
});
test("checkpoint persistence restores actual state and rejects corrupted saves", () => {
  const data = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => data.set(key, value),
      removeItem: (key: string) => data.delete(key),
    },
  });
  const m = createMission();
  m.mode = "playing";
  m.health = 2;
  m.tests = 2;
  m.cooldown = 6;
  saveMission(m);
  const restored = loadMission();
  assert.equal(restored?.mode, "paused");
  assert.equal(restored?.health, 2);
  assert.equal(restored?.tests, 2);
  assert.equal(restored?.cooldown, 6);
  data.set("dev-space-mission-v2", "{invalid");
  assert.equal(loadMission(), null);
  saveMission(m);
  m.mode = "won";
  saveMission(m);
  assert.equal(loadMission(), null);
});

test("new missions require manual fire and stop when the button is released", () => {
  const m = createMission();
  m.mode = "playing";
  step(m, idle, 0.05, random);
  assert.equal(m.shots.length, 0);
  step(m, { ...idle, fire: true }, 0.05, random);
  assert.equal(m.shots.length, 1);
  m.shots = [];
  m.shot = 0;
  step(m, idle, 0.05, random);
  assert.equal(m.shots.length, 0);
});
test("tooling unlocks automatic fire; other upgrades do not", () => {
  for (const choice of ["tests", "shield", "weapon"] as const) {
    const m = createMission();
    m.mode = "upgrade";
    upgrade(m, choice);
    step(m, idle, 0.05, random);
    assert.equal(m.shots.length, choice === "weapon" ? 1 : 0);
    if (choice === "weapon") {
      m.autoFire = false;
      m.shots = [];
      m.shot = 0;
      step(m, idle, 0.05, random);
      assert.equal(m.shots.length, 0);
    }
  }
});
test("simplified controls allow early automation but a locked auto flag does not", () => {
  const m = createMission();
  m.mode = "playing";
  m.autoFire = true;
  step(m, idle, 0.05, random);
  assert.equal(m.shots.length, 0);
  m.assisted = true;
  step(m, idle, 0.05, random);
  assert.equal(m.shots.length, 1);
  saveMission(m);
  assert.equal(loadMission()?.assisted, true);
  assert.equal(loadMission()?.autoFire, true);
});
test("older saves restore earned automation without granting it to prototypes", () => {
  for (const weapon of [0, 1]) {
    const m = createMission();
    m.mode = "playing";
    m.weapon = weapon;
    const legacy = JSON.parse(JSON.stringify(m));
    delete legacy.autoFire;
    delete legacy.assisted;
    localStorage.setItem(
      "dev-space-mission-v2",
      JSON.stringify({ version: 2, mission: legacy }),
    );
    assert.equal(loadMission()?.autoFire, weapon > 0);
    assert.equal(loadMission()?.assisted, false);
  }
});
