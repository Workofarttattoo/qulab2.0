import * as THREE from "https://unpkg.com/three@0.164.1/build/three.module.js";

const canvas = document.getElementById("jimminy-canvas");
const statusEl = document.getElementById("connection-status");
const feedEl = document.getElementById("whisper-feed");

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b1024);

const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2.4, 6.5);

const ambient = new THREE.AmbientLight(0x9fbff7, 0.45);
scene.add(ambient);

const rim = new THREE.DirectionalLight(0x93c6ff, 0.85);
rim.position.set(-4, 6, 5);
rim.castShadow = true;
scene.add(rim);

const warm = new THREE.SpotLight(0xffb87d, 0.6, 18, Math.PI / 6, 0.25, 2);
warm.position.set(3.5, 5, 2.5);
scene.add(warm);

const jimminy = new THREE.Group();
scene.add(jimminy);

const palette = {
  carapace: 0x1f5131,
  coat: 0x322836,
  trim: 0xf4d37b,
  hat: 0x3d2a5c,
  eyes: 0xfaf5f0,
  shoe: 0x1b1b1f,
  cane: 0xc1864f,
  flask: 0x7fc7ff,
};

const materials = {
  carapace: new THREE.MeshStandardMaterial({ color: palette.carapace, roughness: 0.35, metalness: 0.1 }),
  coat: new THREE.MeshStandardMaterial({ color: palette.coat, roughness: 0.65, metalness: 0.05 }),
  trim: new THREE.MeshStandardMaterial({ color: palette.trim, roughness: 0.4, metalness: 0.2 }),
  hat: new THREE.MeshStandardMaterial({ color: palette.hat, roughness: 0.55, metalness: 0.1 }),
  eyes: new THREE.MeshStandardMaterial({ color: palette.eyes, emissive: 0x1b5678, emissiveIntensity: 0.15 }),
  shoe: new THREE.MeshStandardMaterial({ color: palette.shoe, roughness: 0.8, metalness: 0.05 }),
  cane: new THREE.MeshStandardMaterial({ color: palette.cane, roughness: 0.45, metalness: 0.3 }),
  flaskGlass: new THREE.MeshPhysicalMaterial({
    color: palette.flask,
    roughness: 0.1,
    transmission: 0.65,
    thickness: 0.25,
    transparent: true,
  }),
  flaskLiquid: new THREE.MeshStandardMaterial({ color: 0x9bd0ff, roughness: 0.2 }),
  antenna: new THREE.MeshStandardMaterial({ color: 0x623b2c, roughness: 0.5 }),
};

function makeSphere(radius, material, segments = 20) {
  return new THREE.Mesh(new THREE.SphereGeometry(radius, segments, segments), material);
}

function makeCylinder(top, bottom, height, material, segments = 20, open = false) {
  return new THREE.Mesh(new THREE.CylinderGeometry(top, bottom, height, segments, 1, open), material);
}

function makeBox(width, height, depth, material) {
  return new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
}

function buildJimminy() {
  const root = new THREE.Group();
  root.position.y = 0.7;

  // Torso
  const thorax = makeSphere(0.85, materials.carapace);
  thorax.scale.y = 1.4;
  root.add(thorax);

  // Belly overlay (coat)
  const coat = makeCylinder(0.9, 0.95, 1.7, materials.coat, 32, true);
  coat.scale.set(1, 0.9, 1);
  coat.position.y = -0.05;
  root.add(coat);

  const lapelLeft = makeBox(0.32, 1, 0.02, materials.trim);
  lapelLeft.position.set(-0.28, 0.25, 0.6);
  lapelLeft.rotation.z = 0.28;
  root.add(lapelLeft);

  const lapelRight = lapelLeft.clone();
  lapelRight.position.x *= -1;
  lapelRight.rotation.z *= -1;
  root.add(lapelRight);

  // Coat tails
  const tailLeft = makeBox(0.35, 0.75, 0.1, materials.coat);
  tailLeft.position.set(-0.35, -1.05, 0.4);
  tailLeft.rotation.z = 0.18;
  root.add(tailLeft);

  const tailRight = tailLeft.clone();
  tailRight.position.x *= -1;
  tailRight.rotation.z *= -1;
  root.add(tailRight);

  // Head
  const head = makeSphere(0.55, materials.carapace);
  head.position.set(0, 1.32, 0.25);
  root.add(head);

  const eyeLeft = makeSphere(0.15, materials.eyes, 18);
  eyeLeft.position.set(-0.23, 1.42, 0.5);
  root.add(eyeLeft);

  const eyeRight = eyeLeft.clone();
  eyeRight.position.x *= -1;
  root.add(eyeRight);

  const nose = makeSphere(0.08, materials.trim, 14);
  nose.position.set(0, 1.25, 0.62);
  root.add(nose);

  // Antennae
  function buildAntenna(sign) {
    const antenna = new THREE.Group();
    const base = makeCylinder(0.03, 0.04, 0.6, materials.antenna, 14);
    base.position.set(sign * 0.18, 1.75, 0.15);
    base.rotation.z = -sign * 0.4;
    antenna.add(base);
    const tip = makeSphere(0.06, materials.trim, 12);
    tip.position.set(sign * 0.55, 2.05, 0.0);
    antenna.add(tip);
    return antenna;
  }

  root.add(buildAntenna(-1));
  root.add(buildAntenna(1));

  // Hat
  const hat = new THREE.Group();
  const brim = makeCylinder(0.82, 0.82, 0.07, materials.hat, 32);
  brim.position.set(0, 1.95, 0.2);
  hat.add(brim);
  const crown = makeCylinder(0.55, 0.7, 0.65, materials.hat, 32);
  crown.position.set(0, 2.2, 0.2);
  hat.add(crown);
  const band = makeCylinder(0.56, 0.68, 0.18, materials.trim, 32);
  band.position.set(0, 2.03, 0.2);
  hat.add(band);
  hat.name = "hat";
  root.add(hat);

  // Legs and shoes
  function buildLeg(sign) {
    const group = new THREE.Group();
    const thigh = makeCylinder(0.13, 0.09, 0.9, materials.carapace, 20);
    thigh.position.set(sign * 0.35, -0.55, 0);
    thigh.rotation.z = sign * 0.35;
    group.add(thigh);
    const shin = makeCylinder(0.09, 0.08, 0.9, materials.carapace, 20);
    shin.position.set(sign * 0.7, -1.1, 0.1);
    shin.rotation.z = -sign * 0.6;
    group.add(shin);
    const shoe = makeBox(0.35, 0.2, 0.5, materials.shoe);
    shoe.position.set(sign * 1.0, -1.55, 0.3);
    shoe.rotation.y = -sign * 0.25;
    shoe.name = sign > 0 ? "shoe-right" : "shoe-left";
    group.add(shoe);
    return group;
  }

  const legLeft = buildLeg(-1);
  legLeft.name = "leg-left";
  root.add(legLeft);
  const legRight = buildLeg(1);
  legRight.name = "leg-right";
  root.add(legRight);

  // Arms
  function buildArm(sign) {
    const arm = new THREE.Group();
    const upper = makeCylinder(0.1, 0.08, 0.9, materials.carapace, 16);
    upper.position.set(sign * 0.9, 0.35, 0);
    upper.rotation.z = sign * 0.9;
    arm.add(upper);
    const fore = makeCylinder(0.08, 0.07, 0.8, materials.carapace, 16);
    fore.position.set(sign * 1.2, -0.15, 0.2);
    fore.rotation.z = -sign * 0.7;
    arm.add(fore);
    const glove = makeSphere(0.15, materials.trim, 18);
    glove.position.set(sign * 1.35, -0.45, 0.35);
    arm.add(glove);
    arm.name = sign > 0 ? "arm-right" : "arm-left";
    return arm;
  }

  const armLeft = buildArm(-1);
  root.add(armLeft);
  const armRight = buildArm(1);
  root.add(armRight);

  // Cane & flask
  const cane = makeCylinder(0.08, 0.08, 1.9, materials.cane, 16);
  cane.position.set(1.7, -0.35, 0.4);
  cane.rotation.y = Math.PI / 9;
  cane.name = "cane";
  root.add(cane);

  const flask = new THREE.Group();
  const glass = makeCylinder(0.22, 0.2, 0.5, materials.flaskGlass, 22);
  glass.position.set(-1.35, -0.55, 0.4);
  flask.add(glass);
  const liquid = makeCylinder(0.21, 0.19, 0.3, materials.flaskLiquid, 22);
  liquid.position.set(-1.35, -0.6, 0.4);
  flask.add(liquid);
  flask.name = "flask";
  root.add(flask);

  // Crate to sit/lean on
  const crate = makeBox(2.2, 0.6, 1.5, new THREE.MeshStandardMaterial({ color: 0x3b2c20, roughness: 0.7 }));
  crate.position.set(0.2, -1.8, 0.0);
  crate.castShadow = true;
  crate.receiveShadow = true;
  root.add(crate);

  // Floor
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(6, 64),
    new THREE.MeshStandardMaterial({ color: 0x1a223b, roughness: 0.8 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  root.add(floor);

  root.traverse((node) => {
    if (node instanceof THREE.Mesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });

  root.name = "jimminy";
  jimminy.add(root);
}

buildJimminy();

const clock = new THREE.Clock();
let mode = "idle";
let celebrationTimer = 0;

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  const root = jimminy.getObjectByName("jimminy");
  const hat = jimminy.getObjectByName("jimminy")?.getObjectByName?.("hat");
  const legLeft = jimminy.getObjectByName("leg-left");
  const legRight = jimminy.getObjectByName("leg-right");
  const armLeft = jimminy.getObjectByName("arm-left");
  const armRight = jimminy.getObjectByName("arm-right");
  const cane = jimminy.getObjectByName("cane");
  const flask = jimminy.getObjectByName("flask");

  const baseSway = Math.sin(t * 1.4) * 0.07;
  const drunkSway = Math.sin(t * 0.8) * 0.12;
  const danceAmp = mode === "celebrate" ? 1.2 : mode === "concern" ? 0.5 : 0.8;

  if (root) {
    root.rotation.z = baseSway + drunkSway * 0.5 * danceAmp;
    root.position.y = 0.65 + Math.sin(t * 2.1) * 0.05 * danceAmp;
  }

  const stepSpeed = mode === "celebrate" ? 6 : 3.2;
  const swing = mode === "celebrate" ? 0.9 : 0.45;
  const armSwing = mode === "celebrate" ? 0.85 : 0.4;

  if (legLeft && legRight) {
    legLeft.rotation.z = Math.sin(t * stepSpeed) * swing - 0.2;
    legRight.rotation.z = Math.sin((t * stepSpeed) + Math.PI) * swing + 0.2;
  }

  if (armLeft && armRight) {
    armLeft.rotation.z = Math.sin((t * stepSpeed) + Math.PI / 2) * armSwing - 0.4;
    armRight.rotation.z = Math.sin((t * stepSpeed) + (3 * Math.PI) / 2) * armSwing + 0.4;
  }

  if (cane) {
    cane.rotation.y = Math.sin(t * (mode === "celebrate" ? 5 : 2.5)) * 0.25 + Math.PI / 9;
    cane.rotation.z = Math.sin(t * 3) * 0.15;
  }

  if (hat) {
    hat.rotation.z = Math.sin(t * 1.5) * 0.12 + (mode === "concern" ? 0.05 : 0);
    if (mode === "celebrate") {
      hat.position.y = 2.05 + Math.abs(Math.sin(t * 5)) * 0.08;
    }
  }

  if (flask) {
    flask.rotation.z = Math.sin(t * 2.3) * 0.35;
  }

  if (mode === "celebrate") {
    celebrationTimer += clock.getDelta();
    if (celebrationTimer > 6) {
      mode = "idle";
      celebrationTimer = 0;
    }
  }

  renderer.render(scene, camera);
}

animate();

function setMode(nextMode) {
  if (nextMode === "celebrate") {
    celebrationTimer = 0;
  }
  mode = nextMode;
}

function appendWhisper(entry) {
  const container = document.createElement("section");
  container.className = "whisper";
  const time = document.createElement("time");
  time.textContent = new Date(entry.timestamp ?? Date.now()).toLocaleTimeString();
  container.appendChild(time);
  const p = document.createElement("p");
  p.textContent = entry.message ?? "Jimminy is thinking...";
  if (entry.mood === "celebrate") {
    p.classList.add("mood-celebrate");
  } else if (entry.mood === "concern") {
    p.classList.add("mood-concern");
  }
  container.appendChild(p);

  if (entry.recommendations?.length) {
    const ul = document.createElement("ul");
    entry.recommendations.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      ul.appendChild(li);
    });
    container.appendChild(ul);
  }

  feedEl.prepend(container);
  while (feedEl.children.length > 20) {
    feedEl.removeChild(feedEl.lastChild);
  }
}

function setStatus(state, label) {
  statusEl.textContent = label;
  statusEl.className = `status ${state}`;
}

function openSocket() {
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const endpoint = `${protocol}://${window.location.host}/jimminy`;
  const socket = new WebSocket(endpoint);

  socket.addEventListener("open", () => {
    setStatus("connected", "connected");
  });

  socket.addEventListener("message", (event) => {
    try {
      const payload = JSON.parse(event.data);
      if (payload.type === "whisper") {
        appendWhisper(payload);
        setMode(payload.mood ?? "idle");
        if (payload.mood === "celebrate") {
          setStatus("connected", "celebrating insight");
        } else if (payload.mood === "concern") {
          setStatus("warning", "caution flagged");
        } else {
          setStatus("connected", "connected");
        }
      }
    } catch (error) {
      console.error("[jimminy] Failed to parse message", error);
    }
  });

  socket.addEventListener("close", () => {
    setStatus("warning", "reconnecting...");
    setTimeout(openSocket, 1500);
  });

  socket.addEventListener("error", () => {
    setStatus("danger", "connection error");
    socket.close();
  });
}

openSocket();

window.addEventListener("resize", () => {
  const width = canvas.clientWidth || window.innerWidth;
  const height = canvas.clientHeight || window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});
