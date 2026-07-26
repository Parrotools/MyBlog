import * as THREE from "three";
import * as CANNON from "cannon-es";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import {
  dirtTexture,
  flashTexture,
  grassSideTexture,
  grassTopTexture,
  skyTexture,
  smokeTexture,
  stoneTexture,
  tntSideTexture,
  tntTopTexture,
} from "./textures";

export type IntroPhase = "loading" | "tnt" | "exploding" | "entering" | "done";

export interface IntroSceneCallbacks {
  /** Fired at the exact moment of detonation (drive a DOM white flash). */
  onExplode?: () => void;
  /** 0..1 while the camera crosses the hole — drive the reveal overlay. */
  onEnterFade?: (alpha: number) => void;
  /** Flythrough finished; the intro can be torn down. */
  onDone?: () => void;
}

const CAM_Z = 14;
const FOV = 55;
const G = 9.81;

interface LoaderBlockState {
  y: number; // vertical offset above the slot
  v: number; // vertical velocity
  settled: boolean;
}

interface Debris {
  index: number;
  body: CANNON.Body;
  t: number;
  life: number;
}

interface Smoke {
  sprite: THREE.Sprite;
  vel: THREE.Vector3;
  t: number;
  delay: number;
  life: number;
  scale0: number;
  maxOpacity: number;
}

export class IntroScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private clock = new THREE.Clock();
  private raf = 0;
  private disposed = false;

  private phase: IntroPhase = "loading";
  private phaseT = 0;

  // physics
  private world: CANNON.World;
  private debrisShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
  private pedestal: CANNON.Body | null = null;

  // wall
  private wall!: THREE.InstancedMesh;
  private homes: THREE.Vector3[] = [];
  private debris: Debris[] = [];
  private dummy = new THREE.Object3D();

  // grass loader
  private loaderGroup = new THREE.Group();
  private loaderBlocks: THREE.Mesh[] = [];
  private loaderStates: LoaderBlockState[] = [];
  private loaderCycleT = 0;
  private loaderHideT = -1;

  // tnt
  private tnt!: THREE.Mesh;
  private tntBody!: CANNON.Body;
  private tntMaterials!: THREE.Material[];
  private tntFlashMaterial!: THREE.Material;
  private tntAirborneT = 0;
  private fuseT = -1;

  // explosion effects
  private smokes: Smoke[] = [];
  private flashSprite!: THREE.Sprite;
  private blastLight!: THREE.PointLight;
  private flashT = -1;
  private shakeT = -1;
  private dust!: THREE.Points;
  private dustVel: Float32Array | null = null;
  private dustT = -1;
  private explodeT = -1;

  private textures: THREE.Texture[] = [];

  constructor(
    canvas: HTMLCanvasElement,
    private cb: IntroSceneCallbacks = {}
  ) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.camera = new THREE.PerspectiveCamera(
      FOV,
      window.innerWidth / window.innerHeight,
      0.1,
      240
    );
    this.camera.position.set(0, 0, CAM_Z);
    this.camera.lookAt(0, 0, -20);

    this.world = new CANNON.World({ gravity: new CANNON.Vec3(0, -G, 0) });
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    this.world.allowSleep = true;

    this.scene.background = new THREE.Color("#0b0c10");
    this.buildLights();
    this.buildSky();
    this.buildWall();
    this.buildLoader();
    this.buildTnt();
    this.buildFlash();

    window.addEventListener("resize", this.onResize);
    this.tick();
  }

  // ---------------------------------------------------------------- build

  private track<T extends THREE.Texture>(t: T): T {
    this.textures.push(t);
    return t;
  }

  private buildLights() {
    this.scene.add(new THREE.HemisphereLight(0xbcd4ff, 0x4a3d30, 0.55));
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.32));

    const sun = new THREE.DirectionalLight(0xfff2e0, 2.2);
    sun.position.set(9, 14, 16);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -22;
    sun.shadow.camera.right = 22;
    sun.shadow.camera.top = 18;
    sun.shadow.camera.bottom = -18;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 60;
    sun.shadow.bias = -0.0004;
    this.scene.add(sun);

    // bright flash light for the detonation, off until then
    this.blastLight = new THREE.PointLight(0xffd9a0, 0, 40, 1.6);
    this.blastLight.position.set(0, 0.5, 4);
    this.scene.add(this.blastLight);
  }

  private buildSky() {
    const sky = new THREE.Mesh(
      new THREE.PlaneGeometry(190, 120),
      new THREE.MeshBasicMaterial({ map: this.track(skyTexture()) })
    );
    sky.position.set(0, 8, -48);
    this.scene.add(sky);
  }

  private buildWall() {
    const visH = 2 * (CAM_Z - 0.5) * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const aspect = Math.max(window.innerWidth / window.innerHeight, 1.2);
    let cols = Math.ceil(visH * aspect) + 10;
    let rows = Math.ceil(visH) + 6;
    cols = Math.min(cols % 2 ? cols : cols + 1, 61);
    rows = Math.min(rows % 2 ? rows : rows + 1, 33);

    const stone = this.track(stoneTexture());
    const material = new THREE.MeshStandardMaterial({
      map: stone,
      bumpMap: stone,
      bumpScale: 0.35,
      roughness: 0.95,
      metalness: 0,
    });
    const layers = 2;
    this.wall = new THREE.InstancedMesh(
      new RoundedBoxGeometry(1, 1, 1, 2, 0.05),
      material,
      cols * rows * layers
    );
    this.wall.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.wall.castShadow = true;
    this.wall.receiveShadow = true;

    const color = new THREE.Color();
    let i = 0;
    for (let layer = 0; layer < layers; layer++) {
      for (let ry = 0; ry < rows; ry++) {
        for (let rx = 0; rx < cols; rx++) {
          const pos = new THREE.Vector3(
            rx - (cols - 1) / 2,
            ry - (rows - 1) / 2,
            -layer
          );
          this.homes.push(pos);
          this.dummy.position.copy(pos);
          this.dummy.rotation.set(0, 0, 0);
          this.dummy.scale.set(1, 1, 1);
          this.dummy.updateMatrix();
          this.wall.setMatrixAt(i, this.dummy.matrix);
          const v =
            layer === 0 ? 0.88 + Math.random() * 0.18 : 0.4 + Math.random() * 0.12;
          this.wall.setColorAt(i, color.setScalar(v));
          i++;
        }
      }
    }
    this.scene.add(this.wall);
  }

  private buildLoader() {
    const top = this.track(grassTopTexture());
    const side = this.track(grassSideTexture());
    const bottom = this.track(dirtTexture());
    const sideMat = new THREE.MeshStandardMaterial({
      map: side,
      roughness: 0.9,
      metalness: 0,
    });
    const mats = [
      sideMat,
      sideMat,
      new THREE.MeshStandardMaterial({ map: top, roughness: 0.85, metalness: 0 }),
      new THREE.MeshStandardMaterial({ map: bottom, roughness: 0.95, metalness: 0 }),
      sideMat,
      sideMat,
    ];
    const geo = new RoundedBoxGeometry(1, 1, 1, 3, 0.06);
    // reading order: top-left -> bottom-right, like filling a crafting grid
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const block = new THREE.Mesh(geo, mats);
        block.castShadow = true;
        block.receiveShadow = true;
        block.position.set((col - 1) * 1.42, (1 - row) * 1.42, 0);
        block.visible = false;
        this.loaderBlocks.push(block);
        this.loaderStates.push({ y: 0, v: 0, settled: false });
        this.loaderGroup.add(block);
      }
    }
    this.loaderGroup.position.set(0, 0.55, 4.4);
    this.loaderGroup.rotation.x = 0.24; // tip the grass tops toward the viewer
    this.scene.add(this.loaderGroup);
  }

  private buildTnt() {
    const side = new THREE.MeshStandardMaterial({
      map: this.track(tntSideTexture()),
      roughness: 0.8,
      metalness: 0,
    });
    const cap = new THREE.MeshStandardMaterial({
      map: this.track(tntTopTexture()),
      roughness: 0.85,
      metalness: 0,
    });
    this.tntMaterials = [side, side, cap, cap, side, side];
    this.tntFlashMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.tnt = new THREE.Mesh(
      new RoundedBoxGeometry(1.2, 1.2, 1.2, 3, 0.06),
      this.tntMaterials
    );
    this.tnt.castShadow = true;
    this.tnt.visible = false;
    this.scene.add(this.tnt);

    // rigid body + invisible pedestal it lands on mid-screen
    this.tntBody = new CANNON.Body({
      mass: 5,
      shape: new CANNON.Box(new CANNON.Vec3(0.6, 0.6, 0.6)),
      material: new CANNON.Material("tnt"),
    });
    this.pedestal = new CANNON.Body({
      type: CANNON.Body.STATIC,
      // deep box so a ~14 m/s impact cannot tunnel through in one 1/60 step
      shape: new CANNON.Box(new CANNON.Vec3(4.0, 2.0, 4.0)),
      position: new CANNON.Vec3(0, -2.6, 2.5),
      material: new CANNON.Material("pedestal"),
    });
    this.world.addContactMaterial(
      new CANNON.ContactMaterial(
        this.tntBody.material as CANNON.Material,
        this.pedestal.material as CANNON.Material,
        { restitution: 0.28, friction: 0.8 }
      )
    );
    // inelastic landing: kill tumble on impact so the block bounces
    // straight up and comes to rest instead of rolling off
    this.tntBody.addEventListener("collide", () => {
      this.tntBody.angularVelocity.scale(0.15, this.tntBody.angularVelocity);
      this.tntBody.velocity.x *= 0.2;
      this.tntBody.velocity.z *= 0.2;
    });
  }

  private buildFlash() {
    this.flashSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: this.track(flashTexture()),
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0,
      })
    );
    this.flashSprite.position.set(0, 0, 3);
    this.flashSprite.visible = false;
    this.scene.add(this.flashSprite);
  }

  // ---------------------------------------------------------------- phases

  /** Loading finished — drop the TNT. */
  startTnt() {
    if (this.phase !== "loading") return;
    this.phase = "tnt";
    this.phaseT = 0;
    this.loaderHideT = 0;

    this.tnt.visible = true;
    this.tntBody.position.set(0, 9.5, 2.5);
    this.tntBody.velocity.set(0, 0, 0);
    // a touch of spin so the fall reads as physical, not staged
    this.tntBody.angularVelocity.set(
      (Math.random() - 0.5) * 0.4,
      (Math.random() - 0.5) * 0.3,
      (Math.random() - 0.5) * 0.4
    );
    this.world.addBody(this.tntBody);
    if (this.pedestal) this.world.addBody(this.pedestal);
    this.tntAirborneT = 0;
    this.fuseT = -1;
  }

  private explode() {
    this.phase = "exploding";
    this.phaseT = 0;
    this.explodeT = 0;
    this.tnt.visible = false;
    this.world.removeBody(this.tntBody);
    if (this.pedestal) {
      this.world.removeBody(this.pedestal);
      this.pedestal = null;
    }
    this.cb.onExplode?.();

    this.flashSprite.visible = true;
    this.flashT = 0;
    this.blastLight.intensity = 260;

    this.carveHole();
    this.spawnSmoke();
    this.spawnDust();
    this.shakeT = 0;
  }

  private carveHole() {
    const blast = new CANNON.Vec3(0, 0, 2);
    const layerRadius = [3.6, 2.7]; // front hole wider than back -> visible rim
    for (let i = 0; i < this.homes.length; i++) {
      const home = this.homes[i];
      const layer = home.z < -0.5 ? 1 : 0;
      const d = Math.hypot(home.x, home.y);
      const jitter = 0.8 + Math.random() * 0.4;
      if (d >= layerRadius[layer] * jitter) continue;

      const body = new CANNON.Body({
        mass: 2.4,
        shape: this.debrisShape,
        position: new CANNON.Vec3(home.x, home.y, home.z),
        angularDamping: 0.05,
        linearDamping: 0.01,
      });
      // impulse away from the blast point, stronger for closer blocks
      const dir = body.position.vsub(blast);
      const dist = Math.max(dir.length(), 0.8);
      dir.normalize();
      const power = (10 + Math.random() * 9) * (2.2 / dist + 0.55);
      body.velocity.set(
        dir.x * power,
        dir.y * power + 1.5 + Math.random() * 2.5,
        dir.z * power * 0.4 + 3.5 + Math.random() * 5 // bias toward the camera
      );
      body.angularVelocity.set(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 12
      );
      this.world.addBody(body);
      this.debris.push({
        index: i,
        body,
        t: 0,
        life: 1.6 + Math.random() * 0.6,
      });
    }
  }

  private spawnSmoke() {
    const tex = this.track(smokeTexture());
    for (let i = 0; i < 90; i++) {
      const grey = 0.5 + Math.random() * 0.45;
      const dusty = Math.random() < 0.35;
      const color = dusty
        ? new THREE.Color(grey * 0.85, grey * 0.72, grey * 0.55)
        : new THREE.Color(grey, grey, grey);
      const mat = new THREE.SpriteMaterial({
        map: tex,
        color,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(mat);
      const ang = Math.random() * Math.PI * 2;
      const r = Math.random() * 3.2;
      sprite.position.set(
        Math.cos(ang) * r,
        Math.sin(ang) * r * 0.8,
        1 + Math.random() * 2.5
      );
      const out = sprite.position
        .clone()
        .setZ(0)
        .normalize()
        .multiplyScalar(0.4 + Math.random() * 1.6);
      out.y += 0.4 + Math.random() * 1.1;
      out.z = (Math.random() - 0.5) * 0.8;
      const scale0 = 1.2 + Math.random() * 1.8;
      sprite.scale.setScalar(scale0);
      this.scene.add(sprite);
      this.smokes.push({
        sprite,
        vel: out,
        t: 0,
        delay: Math.random() * 0.45,
        life: 1.6 + Math.random() * 1.4,
        scale0,
        maxOpacity: 0.45 + Math.random() * 0.35,
      });
    }
  }

  private spawnDust() {
    const count = 420;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    this.dustVel = new Float32Array(count * 3);
    const palette = [
      new THREE.Color("#9a9a9a"),
      new THREE.Color("#6f6f6f"),
      new THREE.Color("#b0b0b0"),
      new THREE.Color("#8a5a3b"),
    ];
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1.5;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
      positions[i * 3 + 2] = 1.8;
      const dir = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() * 0.5
      ).normalize();
      const speed = 5 + Math.random() * 16;
      this.dustVel[i * 3] = dir.x * speed;
      this.dustVel[i * 3 + 1] = dir.y * speed;
      this.dustVel[i * 3 + 2] = dir.z * speed;
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    this.dust = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        size: 0.14,
        vertexColors: true,
        transparent: true,
        opacity: 1,
        depthWrite: false,
      })
    );
    this.scene.add(this.dust);
    this.dustT = 0;
  }

  // ---------------------------------------------------------------- update

  private tick = () => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.tick);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = this.clock.elapsedTime;
    this.phaseT += dt;

    if (this.phase === "tnt" || this.phase === "exploding" || this.phase === "entering") {
      this.world.step(1 / 60, dt, 4);
    }

    switch (this.phase) {
      case "loading":
        this.updateLoader(t, dt);
        break;
      case "tnt":
        this.hideLoader(dt);
        this.updateTnt(dt);
        break;
      case "exploding":
        this.updateExplosion(dt);
        this.explodeT += dt;
        if (this.explodeT > 1.35) {
          this.phase = "entering";
          this.phaseT = 0;
        }
        break;
      case "entering":
        this.updateExplosion(dt);
        this.updateEnter();
        break;
      case "done":
        break;
    }

    this.renderer.render(this.scene, this.camera);
  };

  private updateLoader(t: number, dt: number) {
    // gentle sway so the grid reads as real 3D blocks
    this.loaderGroup.rotation.y = Math.sin(t * 0.55) * 0.22;

    const PLACE = 0.24; // seconds between block drops
    const HOLD = 0.55; // full grid on screen
    const CLEAR = 0.3; // shrink away
    const cycle = 9 * PLACE + HOLD + CLEAR;
    const prev = this.loaderCycleT;
    this.loaderCycleT = this.phaseT % cycle;
    if (this.loaderCycleT < prev) {
      // new cycle -> reset every block
      for (let i = 0; i < 9; i++) {
        this.loaderStates[i] = { y: 0, v: 0, settled: false };
        this.loaderBlocks[i].visible = false;
        this.loaderBlocks[i].scale.setScalar(1);
      }
    }
    const ct = this.loaderCycleT;

    for (let i = 0; i < 9; i++) {
      const block = this.loaderBlocks[i];
      const state = this.loaderStates[i];
      const placedAt = i * PLACE;
      if (ct < placedAt) continue;

      if (ct < 9 * PLACE + HOLD) {
        if (!block.visible) {
          block.visible = true;
          state.y = 2.2; // dropped in from above
          state.v = 0;
          state.settled = false;
        }
        if (!state.settled) {
          // real free-fall with a small bounce on landing
          state.v -= G * 2.2 * dt;
          state.y += state.v * dt;
          if (state.y <= 0) {
            state.y = 0;
            if (Math.abs(state.v) > 2.2) {
              state.v = -state.v * 0.3;
            } else {
              state.v = 0;
              state.settled = true;
            }
          }
        }
        block.position.y = (1 - Math.floor(i / 3)) * 1.42 + state.y;
        block.scale.setScalar(1);
      } else {
        const k = Math.min((ct - 9 * PLACE - HOLD) / 0.3, 1);
        block.scale.setScalar(Math.max(1 - k, 0.0001));
      }
    }
  }

  private hideLoader(dt: number) {
    if (this.loaderHideT < 0 || !this.loaderGroup.visible) return;
    this.loaderHideT += dt;
    const k = 1 - this.loaderHideT / 0.25;
    if (k <= 0) {
      this.loaderGroup.visible = false;
      return;
    }
    this.loaderGroup.scale.setScalar(Math.max(k, 0.0001));
  }

  private updateTnt(dt: number) {
    if (this.fuseT < 0) {
      this.tntAirborneT += dt;
      this.tnt.position.copy(this.tntBody.position as unknown as THREE.Vector3);
      this.tnt.quaternion.copy(
        this.tntBody.quaternion as unknown as THREE.Quaternion
      );
      // safety net: if it somehow ricochets off the pedestal, drop it again
      if (this.tntBody.position.y < -7) {
        this.tntBody.position.set(0, 7, 2.5);
        this.tntBody.velocity.setZero();
        this.tntBody.angularVelocity.setZero();
        this.tntBody.quaternion.set(0, 0, 0, 1);
      }
      const settled =
        this.tntAirborneT > 0.8 &&
        this.tntBody.velocity.length() < 1.0 &&
        this.tntBody.angularVelocity.length() < 1.2 &&
        this.tntBody.position.y < 0.4;
      if (settled) {
        this.fuseT = 0;
        this.tntBody.type = CANNON.Body.STATIC;
        this.tntBody.velocity.setZero();
        this.tntBody.angularVelocity.setZero();
      }
    } else {
      // primed: flash white like ignited TNT, swelling before the blast
      this.fuseT += dt;
      const flashOn = Math.floor(this.fuseT / 0.12) % 2 === 0;
      this.tnt.material = flashOn ? this.tntFlashMaterial : this.tntMaterials;
      this.tnt.scale.setScalar(1 + (this.fuseT / 1.2) * 0.16);
      if (this.fuseT >= 1.2) this.explode();
    }
  }

  private updateExplosion(dt: number) {
    // rigid-body wall debris — synced from the physics world
    if (this.debris.length > 0) {
      for (const b of this.debris) {
        b.t += dt;
        const shrinkStart = b.life - 0.45;
        const s =
          b.t < shrinkStart
            ? 1
            : Math.max(1 - (b.t - shrinkStart) / 0.45, 0.0001);
        this.dummy.position.copy(b.body.position as unknown as THREE.Vector3);
        this.dummy.quaternion.copy(
          b.body.quaternion as unknown as THREE.Quaternion
        );
        this.dummy.scale.setScalar(s);
        this.dummy.updateMatrix();
        this.wall.setMatrixAt(b.index, this.dummy.matrix);
        if (b.t >= b.life) this.world.removeBody(b.body);
      }
      this.wall.instanceMatrix.needsUpdate = true;
      this.debris = this.debris.filter((b) => b.t < b.life);
    }

    // smoke sprites
    for (const s of this.smokes) {
      if (s.delay > 0) {
        s.delay -= dt;
        continue;
      }
      s.t += dt;
      const k = s.t / s.life;
      if (k >= 1) {
        s.sprite.visible = false;
        continue;
      }
      s.sprite.position.addScaledVector(s.vel, dt);
      s.vel.multiplyScalar(1 - 0.8 * dt); // drag
      s.sprite.scale.setScalar(s.scale0 * (1 + k * 2.6));
      const mat = s.sprite.material as THREE.SpriteMaterial;
      const fadeIn = Math.min(s.t / 0.15, 1);
      mat.opacity = s.maxOpacity * fadeIn * (1 - Math.pow(k, 1.6));
    }

    // dust particles (ballistic)
    if (this.dustT >= 0 && this.dustVel) {
      this.dustT += dt;
      const pos = this.dust.geometry.getAttribute(
        "position"
      ) as THREE.BufferAttribute;
      const arr = pos.array as Float32Array;
      for (let i = 0; i < arr.length; i += 3) {
        this.dustVel[i + 1] -= G * 1.2 * dt;
        arr[i] += this.dustVel[i] * dt;
        arr[i + 1] += this.dustVel[i + 1] * dt;
        arr[i + 2] += this.dustVel[i + 2] * dt;
      }
      pos.needsUpdate = true;
      const mat = this.dust.material as THREE.PointsMaterial;
      mat.opacity = Math.max(1 - this.dustT / 1.2, 0);
      if (this.dustT > 1.2) {
        this.dust.visible = false;
        this.dustT = -1;
      }
    }

    // detonation flash sprite + light
    if (this.flashT >= 0) {
      this.flashT += dt;
      const k = this.flashT / 0.35;
      if (k >= 1) {
        this.flashSprite.visible = false;
        this.flashT = -1;
      } else {
        this.flashSprite.scale.setScalar(2 + k * 16);
        (this.flashSprite.material as THREE.SpriteMaterial).opacity = 1 - k;
      }
    }
    if (this.blastLight.intensity > 0) {
      this.blastLight.intensity = Math.max(this.blastLight.intensity - 500 * dt, 0);
    }

    // camera shake, decaying
    if (this.shakeT >= 0) {
      this.shakeT += dt;
      const a = Math.max(1 - this.shakeT / 0.7, 0) * 0.45;
      if (a <= 0) {
        this.shakeT = -1;
        this.camera.position.x = 0;
        this.camera.position.y = 0;
      } else {
        this.camera.position.x = Math.sin(this.shakeT * 51) * a;
        this.camera.position.y = Math.cos(this.shakeT * 43) * a * 0.8;
      }
    }
  }

  private updateEnter() {
    const DURATION = 2.5;
    const k = Math.min(this.phaseT / DURATION, 1);
    const ease = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    this.camera.position.z = CAM_Z - (9 + CAM_Z) * ease; // 14 -> -9
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.lookAt(0, 0, -30);

    // white-out as the camera crosses the wall plane
    const fade = THREE.MathUtils.clamp(
      (3.5 - this.camera.position.z) / 5.5,
      0,
      1
    );
    this.cb.onEnterFade?.(fade);

    if (k >= 1 && this.phase !== "done") {
      this.phase = "done";
      this.cb.onDone?.();
    }
  }

  // ---------------------------------------------------------------- misc

  private onResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
  };

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.onResize);
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
        obj.geometry.dispose();
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m) => m.dispose());
      }
      if (obj instanceof THREE.Sprite) obj.material.dispose();
    });
    this.tntFlashMaterial.dispose();
    this.textures.forEach((t) => t.dispose());
    this.renderer.dispose();
  }
}
