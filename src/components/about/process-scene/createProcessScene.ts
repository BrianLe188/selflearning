/* =====================================================================
   Process scene 3D — only the model. No header, HUD, footer or floor grid.

     const scene = createProcessScene(containerElement, options);

   A typed port of the standalone `process-scene-3d.html` prototype. The API
   shape, option names and behavior are identical; the only substantive
   changes are the ones three.js forced (see "three.js notes" below) and the
   CSS variable names, which now point at this project's design tokens.

   Throws Error('WEBGL_UNAVAILABLE') so the host can fall back to the 2D
   diagram. Always call destroy() on unmount.

   three.js notes (prototype targeted r128, this targets the current stable)
     - `renderer.outputEncoding = sRGBEncoding` -> `outputColorSpace`.
     - `Color.set()` is colour-managed now, so every `convertSRGBToLinear()`
       call is gone. `hsl(h,s%,l%)` string parsing still works.
     - Lights use physically based intensities; a legacy intensity is the
       same brightness at `intensity * PI` (see LEGACY_LIGHT_SCALE).
     - `THREE.Clock` is deprecated, so the render loop takes
       `performance.now()` deltas directly.
   ===================================================================== */

import * as THREE from "three";

export interface ProcessSceneItem {
  text: string;
  num?: string;
  description?: string;
  check?: boolean;
}

export interface ProcessScenePhase {
  name: string;
  top?: string | null;
  description?: string;
  items: ProcessSceneItem[];
}

export type ProcessSceneNodeKind = "phase" | "step" | "check" | "terminal";

export interface ProcessSceneColors {
  surface300?: string;
  ink?: string;
  dot?: string;
  brand?: string;
  success?: string;
}

export interface ProcessSceneStatus {
  title: string;
  message: string;
  kind: ProcessSceneNodeKind;
}

export interface ProcessSceneProgress {
  passed: number;
  total: number;
}

export interface ProcessScenePlayState {
  playing: boolean;
}

export interface ProcessSceneOptions {
  /** defaults to DEFAULT_PHASES below (5 phases x 3 items) */
  phases?: ProcessScenePhase[];
  /** index of the phase whose arrow to the next phase is the two-way
   *  iteration loop (default 2 = Development <-> Testing & QA); -1 = none */
  loopAfter?: number;
  /** [arrivalMsg, fixMsg, backMsg] shown during the loop detour */
  loopMessages?: string[];
  /** start the travelling marker automatically (default true; ignored when
   *  prefers-reduced-motion is set) */
  autoplay?: boolean;
  /** gentle idle camera sway (default true; off for reduced motion) */
  sway?: boolean;
  /** hover tooltips (default true) */
  tooltips?: boolean;
  /** 'ctrl' (default: only Ctrl/Cmd + wheel zooms, so page scroll is never
   *  hijacked) | 'always' | 'off' */
  wheelZoom?: "ctrl" | "always" | "off";
  /** CSS touch-action on the canvas (default 'pan-y': vertical swipes scroll
   *  the page, horizontal drags rotate) */
  touchAction?: string;
  /** CSS color strings; when omitted they are read from the CSS variables
   *  listed in readColors() */
  colors?: ProcessSceneColors | null;
  /** called when the active node changes */
  onStatus?: ((status: ProcessSceneStatus) => void) | null;
  /** called when a checkpoint is passed / reset */
  onProgress?: ((progress: ProcessSceneProgress) => void) | null;
  /** called when play/pause state changes */
  onPlayState?: ((state: ProcessScenePlayState) => void) | null;
}

export interface ProcessSceneApi {
  play(): void;
  pause(): void;
  resume(): void;
  togglePlay(): void;
  replay(): void;
  resetView(): void;
  zoomBy(factor: number): void;
  setSway(on: boolean): void;
  refreshTheme(): void;
  destroy(): void;
}

export const DEFAULT_PHASES: ProcessScenePhase[] = [
  {
    name: "Discovery",
    top: null,
    description: "Understand the problem before proposing a solution.",
    items: [
      {
        num: "1.1",
        text: "Intro call",
        description:
          "Understand goals, users and constraints before anything else.",
      },
      {
        num: "1.2",
        text: "Define scope",
        description:
          "Turn the brief into user stories and a clear, agreed scope.",
      },
      {
        check: true,
        text: "Scope sign-off",
        description: "Nothing gets built until the scope is agreed in writing.",
      },
    ],
  },
  {
    name: "Design",
    top: '"FIGMA HANDOFF"',
    description: "Architecture and UX, settled before the first sprint.",
    items: [
      {
        num: "2.1",
        text: "System architecture",
        description:
          "System design and database schema, chosen for the product’s real needs.",
      },
      {
        num: "2.2",
        text: "UX review",
        description: "Wireframes and Figma handoff reviewed with the client.",
      },
      {
        num: "2.3",
        text: "Repo setup",
        description:
          "Repository, environments and CI ready before development starts.",
      },
    ],
  },
  {
    name: "Development",
    top: '"GIT / CI PIPELINE"',
    description: "Short sprints with weekly visibility for the client.",
    items: [
      {
        num: "3.1",
        text: "Sprint builds",
        description:
          "Frontend and backend built in parallel, in short sprints.",
      },
      {
        num: "3.2",
        text: "Weekly demo",
        description:
          "The client sees real progress every week, not just at the end.",
      },
      {
        num: "3.3",
        text: "Code review",
        description:
          "Every pull request is reviewed and checked in CI before it merges.",
      },
    ],
  },
  {
    name: "Testing & QA",
    top: null,
    description:
      "Verify with tests, then with the client. Loops back to Development when needed.",
    items: [
      {
        num: "4.1",
        text: "QA testing",
        description:
          "Unit and integration tests, plus manual passes on the key flows.",
      },
      {
        num: "4.2",
        text: "Client UAT",
        description: "The client tests real flows before launch.",
      },
      {
        check: true,
        text: "Client sign-off",
        description:
          "Nothing ships without the client’s explicit sign-off.",
      },
    ],
  },
  {
    name: "Deploy & Handoff",
    top: '"PRODUCTION RELEASE"',
    description: "Ship safely, then hand over cleanly.",
    items: [
      {
        num: "5.1",
        text: "Staging check",
        description: "Final verification on a production-like environment.",
      },
      {
        check: true,
        text: "Rollback ready",
        description: "A rollback plan is ready before go-live.",
      },
      {
        num: "5.2",
        text: "Docs & handoff",
        description: "Documentation, a walkthrough and support terms.",
      },
    ],
  },
];

export const DEFAULT_LOOP_MESSAGES: string[] = [
  "QA starts — and finds an issue. It goes back to Development.",
  "Fix, review, re-test. The loop can run as many times as the product needs.",
  "Fixed and reviewed — back in QA to re-test.",
];

/** r128 used legacy light units. Modern three.js is physically based, where
 *  a legacy ambient/directional intensity matches at `intensity * PI`. */
const LEGACY_LIGHT_SCALE = Math.PI;

interface SceneNode {
  kind: ProcessSceneNodeKind;
  phase?: number;
  num?: string;
  title: string;
  desc: string;
  mesh: THREE.Mesh;
  mat: THREE.MeshStandardMaterial;
  pos: THREE.Vector3;
  base: THREE.Vector3;
  label?: HTMLDivElement;
  active?: boolean;
  visited?: boolean;
  /* checkpoints only */
  ring?: THREE.Mesh;
  ringMat?: THREE.MeshBasicMaterial;
  ping?: number;
  passed?: boolean;
}

interface SeqItem {
  pos: THREE.Vector3;
  node?: SceneNode;
  hold?: number;
  msg?: string;
  arc?: boolean;
  flash?: boolean;
  dur?: number;
}

interface Tween {
  t: number;
  dur: number;
  fn: (p: number) => void;
  res: () => void;
  run?: number;
  ignorePause: boolean;
  manual: boolean;
}

interface ProjectedLabel {
  el: HTMLDivElement;
  pos: THREE.Vector3;
  ox: string;
  oy: string;
}

export function createProcessScene(
  container: HTMLElement,
  options?: ProcessSceneOptions,
): ProcessSceneApi {
  const opts = {
    phases: DEFAULT_PHASES,
    loopAfter: 2,
    loopMessages: DEFAULT_LOOP_MESSAGES,
    autoplay: true,
    sway: true,
    tooltips: true,
    wheelZoom: "ctrl" as const,
    touchAction: "pan-y",
    colors: null as ProcessSceneColors | null,
    onStatus: null as ((s: ProcessSceneStatus) => void) | null,
    onProgress: null as ((p: ProcessSceneProgress) => void) | null,
    onPlayState: null as ((s: ProcessScenePlayState) => void) | null,
    ...(options ?? {}),
  };

  const PHASES = opts.phases,
    N = PHASES.length;
  const reduceMotion = !!(
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const clamp = (v: number, a: number, b: number) =>
    Math.min(b, Math.max(a, v));
  const ease = (p: number) =>
    p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

  let destroyed = false;
  const cleanups: Array<() => void> = [];
  function listen(
    target: EventTarget,
    type: string,
    fn: EventListener,
    o?: AddEventListenerOptions,
  ) {
    target.addEventListener(type, fn, o);
    cleanups.push(function () {
      target.removeEventListener(type, fn, o);
    });
  }

  /* ---------------- DOM ---------------- */
  container.classList.add("ps-stage");
  const canvas = document.createElement("canvas");
  canvas.className = "ps-canvas";
  canvas.style.touchAction = opts.touchAction;
  canvas.setAttribute("aria-hidden", "true");
  const labelsEl = document.createElement("div");
  labelsEl.className = "ps-labels";
  const tipEl = document.createElement("div");
  tipEl.className = "ps-tip";
  container.appendChild(canvas);
  container.appendChild(labelsEl);
  container.appendChild(tipEl);

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
    });
  } catch {
    container.removeChild(canvas);
    container.removeChild(labelsEl);
    container.removeChild(tipEl);
    container.classList.remove("ps-stage");
    throw new Error("WEBGL_UNAVAILABLE");
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 200);
  scene.add(new THREE.AmbientLight(0xffffff, 0.62 * LEGACY_LIGHT_SCALE));
  const keyLight = new THREE.DirectionalLight(
    0xffffff,
    0.5 * LEGACY_LIGHT_SCALE,
  );
  keyLight.position.set(5, 10, 8);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(
    0xffffff,
    0.25 * LEGACY_LIGHT_SCALE,
  );
  fillLight.position.set(-6, 3, 4);
  scene.add(fillLight);

  /* ---------------- Theme colors ---------------- */
  const C: Required<ProcessSceneColors> = {
    surface300: "",
    ink: "",
    dot: "",
    brand: "",
    success: "",
  };
  function token(name: string, fallback: string) {
    let v = getComputedStyle(container).getPropertyValue(name).trim();
    if (!v) return fallback;
    // shadcn-style bare HSL triplet ("12 70% 50%") -> a CSS color string three.js can parse
    if (/^[\d.]+(deg)?\s+[\d.]+%\s+[\d.]+%$/.test(v))
      v = "hsl(" + v.replace("deg", "").trim().split(/\s+/).join(",") + ")";
    return v;
  }
  function setCol(target: THREE.Color, css: string) {
    target.set(css);
    return target;
  }
  /* The prototype's own token names mapped onto this project's tokens:
       --surface-300 -> --muted        --ink     -> --foreground
       --line-dot    -> --line-dot     --brand   -> --primary
       --success     -> --success
     Reading the live variables (rather than passing `colors`) is what keeps
     refreshTheme() and the dark-mode observers below meaningful. */
  function readColors() {
    const o = opts.colors ?? {};
    C.surface300 = o.surface300 || token("--muted", "#f0efe9");
    C.ink = o.ink || token("--foreground", "#1b1b18");
    C.dot = o.dot || token("--line-dot", "#c9c7bd");
    C.brand = o.brand || token("--primary", "#d94f30");
    C.success = o.success || token("--success", "#15803d");
  }

  const lineMat = new THREE.MeshStandardMaterial({ roughness: 0.9 });
  const loopMat = new THREE.MeshStandardMaterial({ roughness: 0.7 });
  const tokenMat = new THREE.MeshStandardMaterial({
    roughness: 0.5,
    emissiveIntensity: 0.3,
  });

  /* ---------------- Geometry helpers ---------------- */
  const Y = new THREE.Vector3(0, 1, 0);

  function roundedRectShape(w: number, h: number, r: number) {
    const s = new THREE.Shape();
    const x = -w / 2,
      y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
    s.lineTo(x + w, y + h - r);
    s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
    s.lineTo(x + r, y + h);
    s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
    s.lineTo(x, y + r);
    s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
    return s;
  }

  const PILL_W = 3.0,
    PILL_H = 0.95;
  const pillGeo = new THREE.ExtrudeGeometry(
    roundedRectShape(PILL_W, PILL_H, PILL_H / 2),
    {
      depth: 0.3,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.06,
      bevelSegments: 4,
      curveSegments: 24,
    },
  );
  pillGeo.translate(0, 0, -0.15);

  function makeLine(
    a: THREE.Vector3,
    b: THREE.Vector3,
    radius: number,
    mat: THREE.Material,
  ) {
    const dir = b.clone().sub(a);
    const len = dir.length();
    const m = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, len, 8),
      mat,
    );
    m.position.copy(a).addScaledVector(dir, 0.5);
    m.quaternion.setFromUnitVectors(Y, dir.clone().normalize());
    return m;
  }

  // Arrow as a group centred on its midpoint, so it can be pulsed in place.
  function makeArrow(
    a: THREE.Vector3,
    b: THREE.Vector3,
    mat: THREE.Material,
    double: boolean,
  ) {
    const g = new THREE.Group();
    const c = a.clone().add(b).multiplyScalar(0.5);
    g.position.copy(c);
    const pa = a.clone().sub(c),
      pb = b.clone().sub(c);
    const d = pb.clone().sub(pa).normalize();
    const headL = 0.32,
      headR = 0.13;
    const s0 = double ? pa.clone().addScaledVector(d, headL) : pa.clone();
    const s1 = pb.clone().addScaledVector(d, -headL);
    g.add(makeLine(s0, s1, 0.03, mat));
    const cone = function (pos: THREE.Vector3, dv: THREE.Vector3) {
      const m = new THREE.Mesh(new THREE.ConeGeometry(headR, headL, 16), mat);
      m.position.copy(pos);
      m.quaternion.setFromUnitVectors(Y, dv);
      g.add(m);
    };
    cone(pb.clone().addScaledVector(d, -headL / 2), d);
    if (double) cone(pa.clone().addScaledVector(d, headL / 2), d.clone().negate());
    scene.add(g);
    return g;
  }

  /* ---------------- Labels (HTML overlay, projected each frame) ---------------- */
  const labels: ProjectedLabel[] = [];
  function addLabel(
    html: string,
    cls: string,
    pos: THREE.Vector3,
    ox?: string,
    oy?: string,
  ) {
    const el = document.createElement("div");
    el.className = "ps-lbl " + cls;
    el.innerHTML = html;
    labelsEl.appendChild(el);
    labels.push({ el: el, pos: pos, ox: ox || "-50%", oy: oy || "-50%" });
    return el;
  }

  /* ---------------- Layout ---------------- */
  const SPACING = 4.7,
    PILL_Y = 2.3,
    STEP_Y0 = 0.85,
    STEP_DY = -1.3,
    TERM_GAP = 3.1;
  const CENTER = (N - 1) / 2;
  const px = (i: number) => (i - CENTER) * SPACING;
  const pz = (i: number) => -Math.pow(i - CENTER, 2) * 0.5;
  let maxItems = 1,
    zSum = 0;
  PHASES.forEach(function (ph, i) {
    maxItems = Math.max(maxItems, ph.items.length);
    zSum += pz(i);
  });
  const sceneTop = PILL_Y + 1.3;
  const sceneBottom = STEP_Y0 + (maxItems - 1) * STEP_DY - 0.6;
  const fitWidth = (N - 1) * SPACING + PILL_W + 2 * TERM_GAP + 1.6;
  const fitHeight = sceneTop - sceneBottom + 3.5;

  const nodes: SceneNode[] = [],
    pickables: THREE.Mesh[] = [],
    cps: SceneNode[] = [],
    phaseNodes: SceneNode[] = [],
    itemNodes: SceneNode[][] = [];

  function registerPick(mesh: THREE.Mesh, node: SceneNode) {
    mesh.userData.node = node;
    pickables.push(mesh);
  }
  function makeProxy(pos: THREE.Vector3, node: SceneNode) {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 8, 8),
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    m.position.copy(pos);
    scene.add(m);
    registerPick(m, node);
  }

  function makeTerminal(
    x: number,
    z: number,
    title: string,
    description: string,
    labelText: string,
  ) {
    const pos = new THREE.Vector3(x, PILL_Y, z + 0.45);
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.7 });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 20), mat);
    mesh.position.set(x, PILL_Y, z + 0.1);
    scene.add(mesh);
    const node: SceneNode = {
      kind: "terminal",
      title: title,
      desc: description,
      mesh: mesh,
      mat: mat,
      pos: pos,
      base: new THREE.Vector3(1, 1, 1),
    };
    registerPick(mesh, node);
    nodes.push(node);
    node.label = addLabel(
      labelText,
      "ps-term",
      new THREE.Vector3(x, PILL_Y + 0.7, z + 0.1),
    );
    return node;
  }
  const startNode = makeTerminal(
    px(0) - TERM_GAP,
    pz(0),
    "Client brief",
    "A project starts the moment a brief lands.",
    '"CLIENT BRIEF"',
  );
  const endNode = makeTerminal(
    px(N - 1) + TERM_GAP,
    pz(N - 1),
    "Delivered",
    "Handed over with docs, a walkthrough and support terms.",
    '"DELIVERED"',
  );

  PHASES.forEach(function (ph, i) {
    const x = px(i),
      z = pz(i);

    const pillMat = new THREE.MeshStandardMaterial({ roughness: 0.75 });
    const pill = new THREE.Mesh(pillGeo, pillMat);
    pill.position.set(x, PILL_Y, z);
    scene.add(pill);
    const pillNode: SceneNode = {
      kind: "phase",
      phase: i,
      title: ph.name,
      desc: ph.description || "",
      mesh: pill,
      mat: pillMat,
      pos: new THREE.Vector3(x, PILL_Y, z + 0.45),
      base: new THREE.Vector3(1, 1, 1),
    };
    registerPick(pill, pillNode);
    nodes.push(pillNode);
    phaseNodes.push(pillNode);
    pillNode.label = addLabel(
      ph.name,
      "ps-pill",
      new THREE.Vector3(x, PILL_Y, z + 0.27),
    );
    if (ph.top)
      addLabel(ph.top, "ps-top", new THREE.Vector3(x, PILL_Y + 0.95, z));

    const lastY = STEP_Y0 + (ph.items.length - 1) * STEP_DY;
    scene.add(
      makeLine(
        new THREE.Vector3(x, PILL_Y - 0.62, z),
        new THREE.Vector3(x, lastY, z),
        0.018,
        lineMat,
      ),
    );

    const list: SceneNode[] = [];
    itemNodes.push(list);
    let stepCounter = 0;
    ph.items.forEach(function (it, k) {
      const y = STEP_Y0 + k * STEP_DY;
      const pos = new THREE.Vector3(x, y, z + 0.3);
      const lp = new THREE.Vector3(x, y, z);
      if (it.check) {
        const mat = new THREE.MeshStandardMaterial({ roughness: 0.55 });
        const mesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.3), mat);
        mesh.scale.set(1, 1.15, 0.6);
        mesh.position.set(x, y, z);
        scene.add(mesh);
        const ringMat = new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 0,
          depthWrite: false,
        });
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.5, 0.025, 8, 48),
          ringMat,
        );
        ring.position.set(x, y, z);
        scene.add(ring);
        const n: SceneNode = {
          kind: "check",
          phase: i,
          title: it.text,
          desc: it.description || "",
          mesh: mesh,
          mat: mat,
          ring: ring,
          ringMat: ringMat,
          ping: -1,
          pos: pos,
          base: new THREE.Vector3(1, 1.15, 0.6),
          passed: false,
        };
        registerPick(mesh, n);
        makeProxy(lp, n);
        nodes.push(n);
        cps.push(n);
        list.push(n);
        n.label = addLabel(
          '<span class="ps-tag">Fail-safe</span><span class="ps-txt">' +
            it.text +
            "</span>",
          "ps-check",
          lp,
          "24px",
          "-50%",
        );
      } else {
        stepCounter++;
        const num = it.num || i + 1 + "." + stepCounter;
        const mat = new THREE.MeshStandardMaterial({ roughness: 0.6 });
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.15, 20, 20), mat);
        mesh.position.set(x, y, z);
        scene.add(mesh);
        const n: SceneNode = {
          kind: "step",
          phase: i,
          num: num,
          title: it.text,
          desc: it.description || "",
          mesh: mesh,
          mat: mat,
          pos: pos,
          base: new THREE.Vector3(1, 1, 1),
        };
        registerPick(mesh, n);
        makeProxy(lp, n);
        nodes.push(n);
        list.push(n);
        n.label = addLabel(
          '<span class="ps-num">' +
            num +
            '</span><span class="ps-txt">' +
            it.text +
            "</span>",
          "ps-step",
          lp,
          "22px",
          "-50%",
        );
      }
    });
  });

  /* Arrows between phases (+ start/end connectors) */
  let loopGroup: THREE.Group | null = null;
  for (let i = 0; i < N - 1; i++) {
    const a = new THREE.Vector3(px(i) + PILL_W / 2 + 0.2, PILL_Y, pz(i));
    const b = new THREE.Vector3(px(i + 1) - PILL_W / 2 - 0.2, PILL_Y, pz(i + 1));
    if (i === opts.loopAfter) loopGroup = makeArrow(a, b, loopMat, true);
    else makeArrow(a, b, lineMat, false);
  }
  makeArrow(
    new THREE.Vector3(px(0) - TERM_GAP + 0.4, PILL_Y, pz(0)),
    new THREE.Vector3(px(0) - PILL_W / 2 - 0.2, PILL_Y, pz(0)),
    lineMat,
    false,
  );
  makeArrow(
    new THREE.Vector3(px(N - 1) + PILL_W / 2 + 0.2, PILL_Y, pz(N - 1)),
    new THREE.Vector3(px(N - 1) + TERM_GAP - 0.4, PILL_Y, pz(N - 1)),
    lineMat,
    false,
  );
  if (loopGroup) loopGroup.userData.p = -1;

  /* Token: the marker travelling the flow */
  const token3d = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 24), tokenMat);
  token3d.position.copy(startNode.pos);
  scene.add(token3d);

  /* ---------------- Painting / state ---------------- */
  function paint(n: SceneNode) {
    if (n.kind === "phase")
      setCol(n.mat.color, n.active ? C.brand : C.surface300);
    else if (n.kind === "step")
      setCol(n.mat.color, n.active ? C.brand : n.visited ? C.ink : C.dot);
    else if (n.kind === "check")
      setCol(n.mat.color, n.passed ? C.success : C.brand);
    else setCol(n.mat.color, n.visited ? C.success : C.dot);
    if (n.kind === "check" && n.ringMat)
      setCol(n.ringMat.color, n.passed ? C.success : C.brand);
  }
  function labelState(n: SceneNode) {
    if (!n.label) return;
    const cl = n.label.classList;
    cl.toggle("ps-active", !!n.active);
    if (n.kind === "phase") cl.toggle("ps-on", !!n.active);
    else if (n.kind === "check") cl.toggle("ps-done", !!n.passed);
    else cl.toggle("ps-done", !!n.visited && !n.active);
  }
  function applyTheme() {
    if (destroyed) return;
    readColors();
    setCol(lineMat.color, C.dot);
    setCol(loopMat.color, C.brand);
    setCol(tokenMat.color, C.brand);
    setCol(tokenMat.emissive, C.brand);
    nodes.forEach(paint);
  }
  if (window.matchMedia) {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    if (typeof mq.addEventListener === "function")
      listen(mq, "change", applyTheme);
  }
  // Theme toggles that flip a class / data-theme on <html> (e.g. next-themes)
  let themeObserver: MutationObserver | null = null;
  if (window.MutationObserver) {
    themeObserver = new MutationObserver(applyTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
  }

  /* ---------------- Callbacks ---------------- */
  // Host callbacks are isolated: an error thrown inside one never breaks the scene.
  function safeCall<P>(fn: ((p: P) => void) | null, payload: P) {
    if (typeof fn !== "function") return;
    try {
      fn(payload);
    } catch (err) {
      if (window.console && typeof window.console.error === "function")
        window.console.error(err);
    }
  }
  function emitStatus(
    title: string,
    message: string,
    kind: ProcessSceneNodeKind,
  ) {
    safeCall(opts.onStatus, { title: title, message: message, kind: kind });
  }
  function emitProgress() {
    let passed = 0;
    cps.forEach(function (n) {
      if (n.passed) passed++;
    });
    safeCall(opts.onProgress, { passed: passed, total: cps.length });
  }
  function emitPlay() {
    safeCall(opts.onPlayState, { playing: seqAlive && !paused });
  }

  let active: SceneNode | null = null;
  function activate(n: SceneNode, msg?: string) {
    if (active && active !== n) {
      active.active = false;
      paint(active);
      labelState(active);
    }
    active = n;
    n.active = true;
    n.visited = true;
    if (n.kind === "check" && !n.passed) {
      n.passed = true;
      n.ping = 0;
      emitProgress();
    }
    paint(n);
    labelState(n);
    let title = n.title;
    if (n.kind === "step") title = n.num + " · " + n.title;
    if (n.kind === "check") title = "Fail-safe · " + n.title;
    emitStatus(title, msg || n.desc, n.kind);
  }
  function resetProgress() {
    nodes.forEach(function (n) {
      n.active = false;
      n.visited = false;
      n.passed = false;
      if (n.kind === "check") n.ping = -1;
    });
    active = null;
    startNode.visited = true;
    nodes.forEach(function (n) {
      paint(n);
      labelState(n);
    });
    cps.forEach(function (n) {
      if (n.ringMat) n.ringMat.opacity = 0;
    });
    emitProgress();
    emitStatus(
      "Client brief",
      "A project starts the moment a brief lands. Follow the marker through each phase — and the sign-offs that protect the client.",
      "terminal",
    );
  }

  /* ---------------- Tween engine + sequence ---------------- */
  let run = 0,
    paused = false,
    seqAlive = false,
    manualId = 0;
  const tweens: Tween[] = [];
  function tween(
    dur: number,
    fn: (p: number) => void,
    myRun?: number,
    o?: { ignorePause?: boolean; manual?: boolean },
  ) {
    return new Promise<void>(function (res) {
      tweens.push({
        t: 0,
        dur: Math.max(dur, 0.0001),
        fn: fn,
        res: res,
        run: myRun,
        ignorePause: !!(o && o.ignorePause),
        manual: !!(o && o.manual),
      });
    });
  }
  const wait = (s: number, my?: number) => tween(s, function () {}, my);

  function moveTo(item: SeqItem, my: number) {
    const from = token3d.position.clone(),
      to = item.pos.clone();
    const dist = from.distanceTo(to);
    const dur = item.dur || clamp(dist * 0.14, 0.45, 1.25);
    let curve: THREE.QuadraticBezierCurve3 | null = null;
    if (item.arc) {
      const mid = from.clone().add(to).multiplyScalar(0.5);
      mid.y += 1.7;
      curve = new THREE.QuadraticBezierCurve3(from, mid, to);
    }
    if (item.flash && loopGroup) loopGroup.userData.p = 0;
    return tween(
      dur,
      function (p) {
        const e = ease(p);
        if (curve) token3d.position.copy(curve.getPoint(e));
        else token3d.position.lerpVectors(from, to, e);
      },
      my,
    );
  }

  const SEQ: SeqItem[] = [];
  const hasLoop = !!loopGroup && opts.loopAfter + 1 < N;
  phaseNodes.forEach(function (pn, i) {
    const loopArrival = hasLoop && i === opts.loopAfter + 1;
    SEQ.push({
      pos: pn.pos,
      node: pn,
      hold: 0.9,
      msg: loopArrival ? opts.loopMessages[0] : undefined,
    });
    if (loopArrival) {
      SEQ.push({
        pos: phaseNodes[opts.loopAfter].pos,
        arc: true,
        flash: true,
        node: phaseNodes[opts.loopAfter],
        hold: 0.8,
        msg: opts.loopMessages[1],
      });
      SEQ.push({
        pos: pn.pos,
        arc: true,
        flash: true,
        node: pn,
        hold: 0.7,
        msg: opts.loopMessages[2],
      });
    }
    itemNodes[i].forEach(function (n) {
      SEQ.push({ pos: n.pos, node: n, hold: n.kind === "check" ? 1.9 : 0.8 });
    });
    if (i < N - 1) SEQ.push({ pos: pn.pos, dur: 0.7, hold: 0 });
  });
  SEQ.push({ pos: endNode.pos, node: endNode, hold: 1.8 });

  async function play() {
    if (destroyed) return;
    const my = ++run;
    seqAlive = true;
    paused = false;
    emitPlay();
    resetProgress();
    token3d.position.copy(startNode.pos);
    await wait(0.5, my);
    for (let k = 0; k < SEQ.length; k++) {
      if (my !== run) return;
      const item = SEQ[k];
      await moveTo(item, my);
      if (my !== run) return;
      if (item.node) activate(item.node, item.msg);
      await wait(item.hold || 0, my);
    }
    if (my !== run) return;
    await wait(2.4, my);
    if (my === run) void play();
  }

  function gotoNode(n: SceneNode) {
    run++;
    seqAlive = false;
    paused = true;
    emitPlay();
    const id = ++manualId;
    for (let i = tweens.length - 1; i >= 0; i--) {
      if (tweens[i].manual) {
        tweens[i].res();
        tweens.splice(i, 1);
      }
    }
    const from = token3d.position.clone(),
      to = n.pos.clone();
    void tween(
      0.7,
      function (p) {
        token3d.position.lerpVectors(from, to, ease(p));
      },
      undefined,
      { ignorePause: true, manual: true },
    ).then(function () {
      if (id === manualId && !destroyed) activate(n);
    });
  }

  /* ---------------- Camera / orbit ---------------- */
  const DEFAULT_ORBIT = { theta: 0.32, phi: 1.3 };
  const orbit = {
    theta: DEFAULT_ORBIT.theta,
    phi: DEFAULT_ORBIT.phi,
    radius: 30,
  };
  const target = new THREE.Vector3(
    0,
    (sceneTop + sceneBottom) / 2 - 0.2,
    zSum / N,
  );
  let W = 1,
    H = 1;
  const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  let userZoomed = false,
    autoSway = opts.sway && !reduceMotion,
    idle = 10,
    swayK = 0,
    time = 0;

  function fitRadius() {
    const dW = fitWidth / (2 * tanHalf * camera.aspect);
    const dH = fitHeight / (2 * tanHalf);
    return clamp(Math.max(dW, dH), 14, 90);
  }
  function resize() {
    if (destroyed) return;
    W = container.clientWidth;
    H = container.clientHeight;
    if (!W || !H) return;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    if (!userZoomed) orbit.radius = fitRadius();
  }
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    cleanups.push(function () {
      ro.disconnect();
    });
  }
  listen(window, "resize", resize);
  resize();

  function updateCamera() {
    const th = orbit.theta + Math.sin(time * 0.35) * 0.2 * swayK;
    const sp = Math.sin(orbit.phi);
    camera.position.set(
      target.x + orbit.radius * sp * Math.sin(th),
      target.y + orbit.radius * Math.cos(orbit.phi),
      target.z + orbit.radius * sp * Math.cos(th),
    );
    camera.lookAt(target);
    camera.updateMatrixWorld();
  }

  /* ---------------- Pointer interaction ---------------- */
  const ptrs = new Map<number, { x: number; y: number }>();
  let dragMoved = 0,
    lastPinch = 0,
    hovered: SceneNode | null = null;
  const ray = new THREE.Raycaster(),
    ndc = new THREE.Vector2();

  function pinchDist() {
    const p = Array.from(ptrs.values());
    return Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
  }
  function zoom(f: number) {
    orbit.radius = clamp(orbit.radius * f, 9, 100);
    userZoomed = true;
  }
  function pick(e: { clientX: number; clientY: number }): SceneNode | null {
    const r = canvas.getBoundingClientRect();
    ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(pickables, false)[0];
    return hit ? (hit.object.userData.node as SceneNode) : null;
  }
  function setHover(n: SceneNode, on: boolean) {
    n.mesh.scale.copy(n.base).multiplyScalar(on ? 1.2 : 1);
  }
  function hideTip() {
    tipEl.style.opacity = "0";
  }
  function showTip(n: SceneNode, e: { clientX: number; clientY: number }) {
    if (!opts.tooltips) return;
    let title = n.title;
    if (n.kind === "step") title = n.num + " · " + n.title;
    if (n.kind === "check") title = "Fail-safe · " + n.title;
    tipEl.innerHTML = "<b>" + title + "</b>" + n.desc;
    const r = container.getBoundingClientRect();
    let x = e.clientX - r.left + 16,
      y = e.clientY - r.top + 16;
    const w = tipEl.offsetWidth,
      h = tipEl.offsetHeight;
    if (x + w > W - 8) x = e.clientX - r.left - w - 16;
    if (y + h > H - 8) y = e.clientY - r.top - h - 16;
    tipEl.style.transform =
      "translate(" + Math.max(8, x) + "px," + Math.max(8, y) + "px)";
    tipEl.style.opacity = "1";
  }
  function hover(e: PointerEvent) {
    const n = pick(e);
    if (n !== hovered) {
      if (hovered) setHover(hovered, false);
      hovered = n;
      if (n) setHover(n, true);
      canvas.style.cursor = n ? "pointer" : "grab";
    }
    if (n) showTip(n, e);
    else hideTip();
  }
  function clearHover() {
    if (hovered) {
      setHover(hovered, false);
      hovered = null;
    }
    hideTip();
    canvas.style.cursor = "grab";
  }

  listen(canvas, "pointerdown", function (ev) {
    const e = ev as PointerEvent;
    canvas.setPointerCapture(e.pointerId);
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.size === 1) dragMoved = 0;
    if (ptrs.size === 2) lastPinch = pinchDist();
    idle = 0;
    hideTip();
  });
  listen(canvas, "pointermove", function (ev) {
    const e = ev as PointerEvent;
    const p = ptrs.get(e.pointerId);
    if (p) {
      const dx = e.clientX - p.x,
        dy = e.clientY - p.y;
      p.x = e.clientX;
      p.y = e.clientY;
      if (ptrs.size === 1) {
        orbit.theta = clamp(orbit.theta - dx * 0.0055, -1.1, 1.1);
        orbit.phi = clamp(orbit.phi - dy * 0.005, 0.85, 1.65);
        dragMoved += Math.abs(dx) + Math.abs(dy);
        canvas.style.cursor = "grabbing";
      } else if (ptrs.size === 2) {
        const d = pinchDist();
        if (lastPinch && d) zoom(lastPinch / d);
        lastPinch = d;
        dragMoved += 10;
      }
      idle = 0;
      hideTip();
    } else if (e.pointerType === "mouse") {
      hover(e);
    }
  });
  function endPointer(ev: Event) {
    const e = ev as PointerEvent;
    const wasSingle = ptrs.size === 1;
    ptrs.delete(e.pointerId);
    lastPinch = 0;
    if (e.type === "pointerup" && wasSingle && dragMoved < 6) {
      const n = pick(e);
      if (n) gotoNode(n);
    }
    canvas.style.cursor = "grab";
  }
  listen(canvas, "pointerup", endPointer);
  listen(canvas, "pointercancel", endPointer);
  listen(canvas, "pointerleave", function () {
    if (!ptrs.size) clearHover();
  });
  listen(
    canvas,
    "wheel",
    function (ev) {
      const e = ev as WheelEvent;
      if (opts.wheelZoom === "off") return;
      if (opts.wheelZoom === "ctrl" && !(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      zoom(Math.exp(e.deltaY * 0.0012));
      idle = 0;
    },
    { passive: false },
  );

  /* ---------------- Render loop ---------------- */
  const v3 = new THREE.Vector3();
  let raf = 0,
    running = false,
    lastFrame = 0;

  function frame() {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const now = performance.now();
    const dt = Math.min((now - lastFrame) / 1000, 0.05);
    lastFrame = now;
    time += dt;
    idle += dt;

    for (let i = tweens.length - 1; i >= 0; i--) {
      const tw = tweens[i];
      if (tw.run !== undefined && tw.run !== run) {
        tweens.splice(i, 1);
        tw.res();
        continue;
      }
      if (paused && !tw.ignorePause) continue;
      tw.t += dt;
      const p = Math.min(tw.t / tw.dur, 1);
      tw.fn(p);
      if (p >= 1) {
        tweens.splice(i, 1);
        tw.res();
      }
    }

    for (let i = 0; i < cps.length; i++) {
      const n = cps[i];
      if (!reduceMotion) n.mesh.rotation.y += dt * 0.9;
      if (n.ping !== undefined && n.ping >= 0 && n.ring && n.ringMat) {
        n.ping += dt;
        const p = Math.min(n.ping / 1.0, 1);
        n.ring.scale.setScalar(1 + p * 1.6);
        n.ringMat.opacity = 0.85 * (1 - p);
        if (p >= 1) n.ping = -1;
      }
    }
    if (loopGroup && loopGroup.userData.p >= 0) {
      loopGroup.userData.p += dt / 0.9;
      const p = Math.min(loopGroup.userData.p as number, 1);
      loopGroup.scale.setScalar(1 + 0.45 * Math.sin(Math.PI * p));
      if (p >= 1) {
        loopGroup.userData.p = -1;
        loopGroup.scale.setScalar(1);
      }
    }
    token3d.scale.setScalar(1 + 0.07 * Math.sin(time * 5));

    swayK += ((autoSway && idle > 2.5 ? 1 : 0) - swayK) * Math.min(1, dt * 2);
    updateCamera();

    for (let i = 0; i < labels.length; i++) {
      const l = labels[i];
      v3.copy(l.pos).project(camera);
      if (v3.z > 1) {
        l.el.style.display = "none";
        continue;
      }
      l.el.style.display = "";
      const x = (v3.x * 0.5 + 0.5) * W,
        y = (-v3.y * 0.5 + 0.5) * H;
      const dist = camera.position.distanceTo(l.pos);
      const ppu = H / (2 * dist * tanHalf);
      const s = clamp(ppu / 56, 0.5, 1.9);
      l.el.style.transform =
        "translate(" +
        x +
        "px," +
        y +
        "px) scale(" +
        s +
        ") translate(" +
        l.ox +
        "," +
        l.oy +
        ")";
    }

    renderer.render(scene, camera);
  }
  function start() {
    if (running || destroyed) return;
    running = true;
    lastFrame = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  // Only render while the container is on screen
  if (window.IntersectionObserver) {
    const io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) start();
      else stop();
    });
    io.observe(container);
    cleanups.push(function () {
      io.disconnect();
    });
  }

  /* ---------------- Public API ---------------- */
  let autoplayTimer = 0;
  const api: ProcessSceneApi = {
    play: function () {
      void play();
    },
    pause: function () {
      if (seqAlive && !paused) {
        paused = true;
        emitPlay();
      }
    },
    resume: function () {
      if (seqAlive) {
        paused = false;
        emitPlay();
      } else void play();
    },
    togglePlay: function () {
      if (seqAlive) {
        paused = !paused;
        emitPlay();
      } else void play();
    },
    replay: function () {
      void play();
    },
    resetView: function () {
      orbit.theta = DEFAULT_ORBIT.theta;
      orbit.phi = DEFAULT_ORBIT.phi;
      userZoomed = false;
      orbit.radius = fitRadius();
      idle = 0;
    },
    zoomBy: function (factor: number) {
      zoom(factor);
    },
    setSway: function (on: boolean) {
      autoSway = !!on && !reduceMotion;
    },
    refreshTheme: applyTheme,
    destroy: function () {
      if (destroyed) return;
      destroyed = true;
      run++;
      stop();
      clearTimeout(autoplayTimer);
      if (themeObserver) themeObserver.disconnect();
      cleanups.forEach(function (fn) {
        fn();
      });
      tweens.splice(0).forEach(function (tw) {
        tw.res();
      });
      scene.traverse(function (o) {
        const mesh = o as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach(
            function (m) {
              m.dispose();
            },
          );
        }
      });
      renderer.dispose();
      if (typeof renderer.forceContextLoss === "function")
        renderer.forceContextLoss();
      [canvas, labelsEl, tipEl].forEach(function (el) {
        if (el.parentNode === container) container.removeChild(el);
      });
      container.classList.remove("ps-stage");
    },
  };

  /* ---------------- Boot ---------------- */
  applyTheme();
  resetProgress();
  start();
  emitPlay();
  if (opts.autoplay && !reduceMotion)
    autoplayTimer = window.setTimeout(play, 700);

  return api;
}
