"use client";

import type { PointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Zap,
  Shield,
  Crosshair,
  Satellite,
  Check,
  HelpCircle,
} from "lucide-react";
import {
  createMission,
  DURATION,
  hotfix,
  isAutoFiring,
  Input,
  loadMission,
  Mission,
  PHASES,
  resizeMission,
  saveMission,
  step,
  upgrade,
  Upgrade,
} from "../mission/engine";
import { render } from "../mission/render";
import styles from "../mission/mission.module.css";

const emptyInput = (): Input => ({
  left: false,
  right: false,
  fire: false,
  target: null,
});
const choices: {
  id: Upgrade;
  title: string;
  subtitle: string;
  text: string;
  icon: typeof Shield;
}[] = [
  {
    id: "tests",
    title: "Test satellite",
    subtitle: "AUTOMATE",
    text: "Add a satellite that automatically targets bugs. More coverage, less firefighting.",
    icon: Satellite,
  },
  {
    id: "shield",
    title: "Resilience layer",
    subtitle: "PROTECT",
    text: "Add 1 maximum integrity and restore 2 points. Give your softphone room to recover.",
    icon: Shield,
  },
  {
    id: "weapon",
    title: "Developer tooling",
    subtitle: "ACCELERATE",
    text: "Unlock automatic firing and a faster fire rate. A second investment adds a dual shot.",
    icon: Crosshair,
  },
];
export function GameCanvas() {
  const mission = useRef(createMission());
  const input = useRef(emptyInput());
  const canvas = useRef<HTMLCanvasElement>(null);
  const board = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<Mission>(() => createMission());
  const [saved, setSaved] = useState<Mission | null>(null);
  const [best, setBest] = useState(0);
  const [help, setHelp] = useState(false);
  const [muted, setMuted] = useState(true);
  const auto = isAutoFiring(view);
  const automationAvailable = view.weapon > 0 || view.assisted;
  const soundEnabled = useRef(false);
  const audio = useRef<AudioContext | null>(null);
  const bestRef = useRef(0);
  const sync = useCallback(() => setView({ ...mission.current }), []);
  const tone = useCallback((frequency: number) => {
    if (!soundEnabled.current) return;
    try {
      const ctx = audio.current || (audio.current = new AudioContext());
      ctx.resume().catch(() => {});
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        frequency * 0.5,
        ctx.currentTime + 0.1,
      );
      gain.gain.setValueAtTime(0.035, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.13);
      osc.start();
      osc.stop(ctx.currentTime + 0.14);
    } catch {
      /* Sound is optional. */
    }
  }, []);
  const pause = useCallback(() => {
    if (mission.current.mode !== "playing") return;
    mission.current.mode = "paused";
    input.current = emptyInput();
    saveMission(mission.current);
    sync();
  }, [sync]);
  const start = useCallback(() => {
    mission.current = {
      ...createMission(mission.current.width),
      assisted: mission.current.assisted,
      autoFire: mission.current.assisted,
      mode: "playing",
    };
    setSaved(null);
    setHelp(false);
    input.current = emptyInput();
    saveMission(mission.current);
    mission.current.notice = mission.current.assisted
      ? "Simplified controls · auto-fire on"
      : "Hold Space or the Fire button to shoot · E for a hotfix";
    mission.current.noticeTime = 6;
    tone(660);
    sync();
    board.current?.focus();
  }, [sync, tone]);
  const resume = useCallback(() => {
    if (mission.current.mode === "paused") {
      mission.current.mode = "playing";
      setHelp(false);
      sync();
      board.current?.focus();
    }
  }, [sync]);
  const pulse = useCallback(() => {
    if (hotfix(mission.current)) {
      tone(170);
      sync();
    }
  }, [sync, tone]);
  const choose = (choice: Upgrade) => {
    upgrade(mission.current, choice);
    input.current = emptyInput();
    saveMission(mission.current);
    tone(800);
    sync();
    board.current?.focus();
  };
  const continueGame = () => {
    if (!saved) return;
    const width = mission.current.width;
    mission.current = saved;
    resizeMission(mission.current, width);
    if (mission.current.mode === "paused") mission.current.mode = "playing";
    setSaved(null);
    input.current = emptyInput();
    sync();
    board.current?.focus();
  };
  useEffect(() => {
    document.body.classList.add("game-active");
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const restored = loadMission();
    setSaved(restored);
    if (restored) {
      mission.current.assisted = restored.assisted;
      setView({ ...mission.current });
    }
    try {
      const value = Number(localStorage.getItem("dev-space-best-v2"));
      bestRef.current = Number.isFinite(value) && value > 0 ? value : 0;
      setBest(bestRef.current);
    } catch {
      /* Optional persistence. */
    }
    return () => {
      saveMission(mission.current);
      document.body.classList.remove("game-active");
      document.body.style.overflow = overflow;
      audio.current?.close().catch(() => {});
    };
  }, []);
  useEffect(() => {
    const element = canvas.current;
    const container = board.current;
    if (!element || !container) return;
    const ctx = element.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let previous = 0;
    let hud = 0;
    let saveTime = 0;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const resize = () => {
      const box = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      element.width = Math.round(box.width * dpr);
      element.height = Math.round(box.height * dpr);
      resizeMission(
        mission.current,
        Math.max(
          320,
          Math.min(1800, (box.width / Math.max(1, box.height)) * 700),
        ),
      );
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();
    const loop = (now: number) => {
      const m = mission.current;
      const oldMode = m.mode;
      const oldHealth = m.health;
      const oldBugs = m.bugs;
      step(m, input.current, previous ? (now - previous) / 1000 : 0);
      previous = now;
      if (oldHealth !== m.health) tone(110);
      else if (oldBugs !== m.bugs) tone(440);
      ctx.setTransform(
        element.width / m.width,
        0,
        0,
        element.height / 700,
        0,
        0,
      );
      render(ctx, m, media.matches);
      if (now - hud > 100 || oldMode !== m.mode) {
        sync();
        hud = now;
      }
      if (oldMode !== m.mode) {
        saveMission(m);
        if (m.mode === "won" || m.mode === "lost") {
          bestRef.current = Math.max(bestRef.current, m.score);
          setBest(bestRef.current);
          try {
            localStorage.setItem("dev-space-best-v2", String(bestRef.current));
          } catch {
            /* Optional persistence. */
          }
        }
      }
      if (now - saveTime > 5000) {
        saveMission(m);
        saveTime = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [sync, tone]);
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "escape" && !e.repeat) {
        e.preventDefault();
        if (help) {
          setHelp(false);
          if (mission.current.mode === "paused") resume();
        } else if (mission.current.mode === "playing") pause();
        else if (mission.current.mode === "paused") resume();
        return;
      }
      if (
        e.target instanceof HTMLElement &&
        e.target.closest("button, a, input, select, textarea")
      )
        return;
      if (["arrowleft", "arrowright", " ", "escape"].includes(key))
        e.preventDefault();
      if (key === "p") {
        if (e.repeat) return;
        if (mission.current.mode === "playing") pause();
        else if (mission.current.mode === "paused") resume();
      }
      if (key === " " && mission.current.mode === "welcome" && !e.repeat) {
        start();
        return;
      }
      if (mission.current.mode !== "playing") return;
      if (key === "arrowleft" || key === "a") {
        input.current.left = true;
        input.current.target = null;
      }
      if (key === "arrowright" || key === "d") {
        input.current.right = true;
        input.current.target = null;
      }
      if (key === " ") input.current.fire = true;
      if (key === "e" && !e.repeat) pulse();
    };
    const up = (e: KeyboardEvent) => {
      if (["arrowleft", "a"].includes(e.key.toLowerCase()))
        input.current.left = false;
      if (["arrowright", "d"].includes(e.key.toLowerCase()))
        input.current.right = false;
      if (e.key === " ") input.current.fire = false;
    };
    const hidden = () => {
      if (document.hidden) pause();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", pause);
    document.addEventListener("visibilitychange", hidden);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", pause);
      document.removeEventListener("visibilitychange", hidden);
    };
  }, [pause, resume, start, pulse, help]);
  // Modal focus management: one overlay at a time, trapped focus and a named dialog.
  useEffect(() => {
    if (view.mode === "playing") return;
    const root = dialog.current;
    root?.querySelector<HTMLElement>("button, a")?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !root) return;
      const items = Array.from(
        root.querySelectorAll<HTMLElement>(
          "button:not(:disabled), a[href], input:not(:disabled)",
        ),
      );
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => document.removeEventListener("keydown", trap);
  }, [view.mode, help]);
  const phase = PHASES[view.phase];
  const overlay = view.mode !== "playing";
  const pointer = (e: PointerEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    input.current.target =
      ((e.clientX - box.left) / box.width) * mission.current.width;
  };
  return (
    <div className={styles.shell}>
      <div className={styles.topbar}>
        <Link href="/" className={styles.back} aria-label="Back to blog">
          <ArrowLeft size={17} />
          <span>Back to blog</span>
        </Link>
        <div className={styles.brand}>
          <span className={styles.brandMark}>✳</span> DEV SPACE{" "}
          <small>SOFTPHONE ODYSSEY</small>
        </div>
        <div className={styles.tools}>
          <button
            aria-label={muted ? "Enable sound" : "Mute sound"}
            aria-pressed={!muted}
            onClick={() => {
              soundEnabled.current = muted;
              setMuted(!muted);
              if (muted) tone(660);
            }}
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <button
            aria-label="How to play"
            onClick={() => {
              pause();
              setHelp(true);
            }}
          >
            {<HelpCircle size={18} />}
          </button>
          <button
            aria-label={
              view.mode === "paused" ? "Resume mission" : "Pause mission"
            }
            disabled={!["playing", "paused"].includes(view.mode)}
            onClick={() => (view.mode === "paused" ? resume() : pause())}
          >
            {view.mode === "paused" ? <Play size={18} /> : <Pause size={18} />}
          </button>
        </div>
      </div>
      <div className={styles.workspace}>
        <div className={styles.main}>
          <div className={styles.hud}>
            <div>
              <span>MISSION SCORE</span>
              <strong>{String(view.score).padStart(5, "0")}</strong>
            </div>
            <div className={styles.integrity}>
              <span>
                INTEGRITY {view.health}/{view.maxHealth}
              </span>
              <div>
                {Array.from({ length: view.maxHealth }, (_, i) => (
                  <i
                    key={i}
                    className={i < view.health ? styles.healthy : ""}
                  />
                ))}
              </div>
            </div>
            <div className={styles.combo}>
              <span>{view.combo >= 5 ? "FIX STREAK" : "PERSONAL BEST"}</span>
              <strong>
                {view.combo >= 5
                  ? `×${1 + Math.floor(view.combo / 5)}`
                  : best.toLocaleString()}
              </strong>
            </div>
          </div>
          <div
            className={styles.board}
            ref={board}
            tabIndex={0}
            role="region"
            aria-label="Mission playfield. Move with arrow keys or A and D. E deploys a hotfix. Escape pauses."
            onPointerDown={(e) => {
              if (mission.current.mode !== "playing") return;
              e.currentTarget.setPointerCapture(e.pointerId);
              pointer(e);
            }}
            onPointerMove={(e) => {
              if (e.currentTarget.hasPointerCapture(e.pointerId)) pointer(e);
            }}
            onPointerUp={(e) => {
              input.current.target = null;
              if (e.currentTarget.hasPointerCapture(e.pointerId))
                e.currentTarget.releasePointerCapture(e.pointerId);
            }}
            onPointerCancel={() => {
              input.current.target = null;
            }}
            onLostPointerCapture={() => {
              input.current.target = null;
            }}
          >
            <canvas ref={canvas} aria-hidden="true" />
            <div className={styles.sector}>
              <span className={styles.liveDot} /> SECTOR{" "}
              {String(view.phase + 1).padStart(2, "0")}{" "}
              <span>/ {phase.name.toUpperCase()}</span>
            </div>
            <div className={styles.timer}>
              {Math.max(0, Math.ceil(DURATION - view.phaseTime))}
              <small>SEC TO CHECKPOINT</small>
            </div>
            {view.noticeTime > 0 && !overlay && (
              <div className={styles.toast} role="status">
                {view.notice}
              </div>
            )}
            {overlay && (
              <div className={styles.scrim}>
                <div
                  className={`${styles.dialog} ${view.mode === "welcome" ? styles.welcome : ""}`}
                  ref={dialog}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="mission-title"
                >
                  {(view.mode === "welcome" || view.mode === "paused") && (
                    <label className={styles.assist}>
                      <input
                        type="checkbox"
                        checked={view.assisted}
                        onChange={(e) => {
                          const enabled = e.target.checked;
                          mission.current.assisted = enabled;
                          if (enabled) mission.current.autoFire = true;
                          else if (!mission.current.weapon)
                            mission.current.autoFire = false;
                          setSaved((previous) =>
                            previous
                              ? {
                                  ...previous,
                                  assisted: enabled,
                                  autoFire:
                                    enabled ||
                                    (previous.weapon > 0 && previous.autoFire),
                                }
                              : null,
                          );
                          saveMission(mission.current);
                          sync();
                        }}
                      />
                      <span>
                        Simplified controls
                        <small>
                          Automatic firing from the start. Optional, especially
                          for touch.
                        </small>
                      </span>
                    </label>
                  )}
                  {help ? (
                    <>
                      <span className={styles.eyebrow}>FLIGHT MANUAL</span>
                      <h1 id="mission-title">Build. Defend. Deploy.</h1>
                      <p>
                        Survive four 30-second stages. Bugs that hit your ship
                        or cross the bottom boundary cost integrity.
                      </p>
                      <div className={styles.manual}>
                        <p>
                          <b>01 · Harvest</b> Shoot or collect teal shards for
                          points. Fix bugs in quick succession to build a score
                          multiplier.
                        </p>
                        <p>
                          <b>02 · Invest</b> At each checkpoint, choose one free
                          upgrade. Test satellites target bugs; resilience
                          repairs you; developer tooling unlocks automatic
                          firing and improves your fire rate.
                        </p>
                        <p>
                          <b>03 · Recover</b> Press E or Hotfix to clear active
                          bugs. It recharges in 12 seconds. Gold-ringed
                          regressions take two hits.
                        </p>
                      </div>
                      <p className={styles.keys}>
                        ← → / A D move · Space fire · E hotfix · Esc pause
                        <br />
                        Touch: drag the ship or use the on-screen arrows.
                      </p>
                      <button
                        className={styles.primary}
                        onClick={() => {
                          setHelp(false);
                          if (view.mode === "paused") resume();
                        }}
                      >
                        <Check size={17} /> Got it
                      </button>
                    </>
                  ) : view.mode === "welcome" ? (
                    <>
                      <span className={styles.eyebrow}>
                        <span className={styles.liveDot} /> AN INTERACTIVE
                        DEVELOPMENT JOURNEY
                      </span>
                      <h1 id="mission-title">
                        Great software.
                        <br />
                        <em>Built under pressure.</em>
                      </h1>
                      <p>
                        Pilot your softphone from first prototype to production.
                        Collect features, eliminate bugs, and build the systems
                        that have your back.
                      </p>
                      <div className={styles.legend}>
                        <span>
                          <i className={styles.shard} /> Harvest features
                        </span>
                        <span>
                          <i className={styles.bug} /> Fix bugs
                        </span>
                        <span>
                          <Satellite size={16} /> Automate defence
                        </span>
                      </div>
                      <div className={styles.actions}>
                        {saved && (
                          <button
                            className={styles.primary}
                            onClick={continueGame}
                          >
                            <Play size={17} /> Continue mission
                          </button>
                        )}
                        <button
                          className={saved ? styles.secondary : styles.primary}
                          onClick={start}
                        >
                          <Play size={17} />{" "}
                          {saved ? "New mission" : "Launch mission"}
                          <ArrowRight size={17} />
                        </button>
                        <button
                          className={styles.secondary}
                          onClick={() => setHelp(true)}
                        >
                          How to play
                        </button>
                      </div>
                      <div className={styles.micro}>
                        4 STAGES <i /> 2 MINUTES OF FLIGHT <i />{" "}
                        {view.assisted
                          ? "SIMPLIFIED CONTROLS"
                          : "START MANUAL · EARN AUTOMATION"}
                      </div>
                    </>
                  ) : view.mode === "paused" ? (
                    <>
                      <span className={styles.eyebrow}>CHECKPOINT SAVED</span>
                      <h1 id="mission-title">Take a breath.</h1>
                      <p>
                        Your mission is paused. Come back when you’re ready.
                      </p>
                      <div className={styles.actions}>
                        <button className={styles.primary} onClick={resume}>
                          <Play size={17} /> Resume mission
                        </button>
                        <button className={styles.secondary} onClick={start}>
                          <RotateCcw size={16} /> Restart
                        </button>
                      </div>
                      <Link href="/" className={styles.exit}>
                        Save & return to blog <ArrowRight size={14} />
                      </Link>
                    </>
                  ) : view.mode === "upgrade" ? (
                    <>
                      <span className={styles.eyebrow}>
                        STAGE {view.phase + 1} COMPLETE · +{view.health * 100}{" "}
                        INTEGRITY BONUS
                      </span>
                      <h1 id="mission-title">Invest in what’s next.</h1>
                      <p>{phase.lesson}</p>
                      <div className={styles.upgrades}>
                        {choices.map((choice) => (
                          <button
                            key={choice.id}
                            onClick={() => choose(choice.id)}
                          >
                            <choice.icon size={27} />
                            <small>{choice.subtitle}</small>
                            <h2>{choice.title}</h2>
                            <p>{choice.text}</p>
                            <span>
                              Deploy upgrade <ArrowRight size={15} />
                            </span>
                          </button>
                        ))}
                      </div>
                      <div className={styles.micro}>
                        CHOOSE ONE · FREE CHECKPOINT UPGRADE
                      </div>
                    </>
                  ) : (
                    <>
                      <span className={styles.eyebrow}>
                        {view.mode === "won"
                          ? "RELEASE v1.0 · SUCCESS"
                          : "INCIDENT REPORT"}
                      </span>
                      <h1 id="mission-title">
                        {view.mode === "won"
                          ? "You’re live."
                          : "Every failure is feedback."}
                      </h1>
                      <p>
                        {view.mode === "won"
                          ? "From prototype to production. Your softphone made it through."
                          : "Integrity reached zero. Try automated tests or a resilience upgrade on your next run."}
                      </p>
                      <div className={styles.results}>
                        <div>
                          <strong>{view.score.toLocaleString()}</strong>
                          <span>FINAL SCORE</span>
                        </div>
                        <div>
                          <strong>{view.bugs}</strong>
                          <span>BUGS FIXED</span>
                        </div>
                        <div>
                          <strong>{view.shards}</strong>
                          <span>FEATURES</span>
                        </div>
                      </div>
                      <div className={styles.actions}>
                        <button className={styles.primary} onClick={start}>
                          <RotateCcw size={17} /> Fly again
                        </button>
                        <Link href="/" className={styles.secondary}>
                          Back to blog <ArrowRight size={17} />
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className={styles.controls}>
            <div className={styles.keyboard}>
              <kbd>←</kbd>
              <kbd>→</kbd>
              <span>Move</span>
              <kbd>E</kbd>
              <span>Hotfix</span>
              <kbd>Esc</kbd>
              <span>Pause</span>
            </div>
            <div className={styles.touch}>
              {(["left", "right"] as const).map((dir) => (
                <button
                  key={dir}
                  aria-label={`Move ${dir}`}
                  disabled={overlay}
                  onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    input.current[dir] = true;
                    input.current.target = null;
                  }}
                  onPointerUp={() => {
                    input.current[dir] = false;
                  }}
                  onPointerCancel={() => {
                    input.current[dir] = false;
                  }}
                  onLostPointerCapture={() => {
                    input.current[dir] = false;
                  }}
                >
                  {dir === "left" ? (
                    <ArrowLeft size={20} />
                  ) : (
                    <ArrowRight size={20} />
                  )}
                </button>
              ))}
            </div>
            <button
              className={styles.auto}
              aria-pressed={auto}
              disabled={!automationAvailable || overlay}
              title={
                automationAvailable
                  ? "Toggle automatic firing"
                  : "Choose Developer tooling at a checkpoint to unlock auto-fire"
              }
              onClick={() => {
                mission.current.autoFire = !auto;
                saveMission(mission.current);
                sync();
              }}
            >
              <span className={auto ? styles.liveDot : styles.offDot} />
              {automationAvailable
                ? `Auto-fire ${auto ? "on" : "off"}`
                : "Manual fire"}
            </button>
            {!auto && (
              <button
                className={styles.fire}
                disabled={overlay}
                aria-label="Fire"
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  input.current.fire = true;
                }}
                onPointerUp={() => {
                  input.current.fire = false;
                }}
                onPointerCancel={() => {
                  input.current.fire = false;
                }}
                onLostPointerCapture={() => {
                  input.current.fire = false;
                }}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter")
                    input.current.fire = true;
                }}
                onKeyUp={() => {
                  input.current.fire = false;
                }}
                onBlur={() => {
                  input.current.fire = false;
                }}
              >
                <Crosshair size={18} />
                <span>Fire</span>
              </button>
            )}
            <button
              className={styles.hotfix}
              disabled={overlay || view.cooldown > 0}
              onClick={pulse}
            >
              <Zap size={16} /> Hotfix{" "}
              <span>
                {view.cooldown > 0 ? `${Math.ceil(view.cooldown)}s` : "READY"}
              </span>
            </button>
          </div>
        </div>
        <div className={styles.sidebar}>
          <span className={styles.eyebrow}>MISSION CONTROL</span>
          <h2>
            The path to
            <br />
            production.
          </h2>
          <p>
            Good code gets you started.
            <br />
            Good systems keep you going.
          </p>
          <div className={styles.phases}>
            {PHASES.map((p, i) => (
              <div
                key={p.name}
                className={`${styles.phase} ${i === view.phase ? styles.current : ""} ${i < view.phase || view.mode === "won" ? styles.complete : ""}`}
              >
                <span>
                  {i < view.phase || view.mode === "won" ? (
                    <Check size={16} />
                  ) : (
                    String(i + 1).padStart(2, "0")
                  )}
                </span>
                <div>
                  <strong>{p.name}</strong>
                  <small>
                    {
                      [
                        "Find the signal",
                        "Connect the pieces",
                        "Design for failure",
                        "Deliver with confidence",
                      ][i]
                    }
                  </small>
                  {i === view.phase && (
                    <div className={styles.progress}>
                      <i
                        style={{
                          width: `${(view.phaseTime / DURATION) * 100}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.objective}>
            <span className={styles.eyebrow}>CURRENT OBJECTIVE</span>
            <h3>{phase.title}</h3>
            <p>{phase.detail}</p>
          </div>
          <div className={styles.systems}>
            <span className={styles.eyebrow}>YOUR SYSTEMS</span>
            <div>
              <Satellite size={16} /> Test satellites <b>{view.tests}</b>
            </div>
            <div>
              <Shield size={16} /> Resilience <b>{view.maxHealth - 4}</b>
            </div>
            <div>
              <Crosshair size={16} /> Developer tooling <b>{view.weapon}</b>
            </div>
          </div>
          <div className={styles.signature}>
            A little game about a bigger idea.
            <br />
            <b>By Rui Domingues ↗</b>
          </div>
        </div>
      </div>
    </div>
  );
}
