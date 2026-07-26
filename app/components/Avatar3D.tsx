"use client";

import { useEffect, useRef, useState } from "react";
import BlockIcon from "./BlockIcon";

/**
 * The avatar grass block as a real 3D object: the intro's HD procedural
 * textures on a rounded cube, softly lit, idling on a slow turntable.
 * Falls back to the flat SVG when WebGL isn't available.
 */
export default function Avatar3D({ className }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let raf = 0;
    let cleanup: (() => void) | null = null;

    Promise.all([
      import("three"),
      import("three/examples/jsm/geometries/RoundedBoxGeometry.js"),
      import("@/app/intro/textures"),
    ]).then(([THREE, { RoundedBoxGeometry }, tex]) => {
      if (disposed || !mountRef.current) return;
      const probe = document.createElement("canvas");
      if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) {
        setFallback(true);
        return;
      }

      const size = mount.clientWidth || 144;
      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(size, size);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      mount.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 10);
      camera.position.set(2.1, 1.7, 2.6);
      camera.lookAt(0, -0.04, 0);

      scene.add(new THREE.HemisphereLight(0xbcd4ff, 0x4a3d30, 0.6));
      scene.add(new THREE.AmbientLight(0xffffff, 0.35));
      const sun = new THREE.DirectionalLight(0xfff2e0, 2.0);
      sun.position.set(3, 5, 4);
      scene.add(sun);
      const rim = new THREE.DirectionalLight(0xd8e8ff, 0.6);
      rim.position.set(-3, 2, -3);
      scene.add(rim);

      const top = tex.grassTopTexture();
      const side = tex.grassSideTexture();
      const bottom = tex.dirtTexture();
      const sideMat = new THREE.MeshStandardMaterial({
        map: side,
        roughness: 0.9,
      });
      const mats = [
        sideMat,
        sideMat,
        new THREE.MeshStandardMaterial({ map: top, roughness: 0.85 }),
        new THREE.MeshStandardMaterial({ map: bottom, roughness: 0.95 }),
        sideMat,
        sideMat,
      ];
      const block = new THREE.Mesh(
        new RoundedBoxGeometry(1, 1, 1, 4, 0.06),
        mats
      );
      scene.add(block);

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const clock = new THREE.Clock();

      const renderOnce = () => renderer.render(scene, camera);
      if (reduced) {
        block.rotation.y = 0.65;
        renderOnce();
      } else {
        const tick = () => {
          raf = requestAnimationFrame(tick);
          const t = clock.getElapsedTime();
          block.rotation.y = t * 0.45; // slow turntable
          block.position.y = Math.sin(t * 1.6) * 0.025; // faint bob
          renderOnce();
        };
        tick();
      }

      const onResize = () => {
        const s = mount.clientWidth || 144;
        renderer.setSize(s, s);
      };
      window.addEventListener("resize", onResize);

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", onResize);
        block.geometry.dispose();
        mats.forEach((m) => m.dispose());
        [top, side, bottom].forEach((t2) => t2.dispose());
        renderer.dispose();
        renderer.domElement.remove();
      };
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  if (fallback) {
    return <BlockIcon variant="grass" className={className} />;
  }
  return (
    <div
      ref={mountRef}
      className={className}
      style={{ filter: "drop-shadow(0 22px 26px rgba(0,0,0,0.4))" }}
    />
  );
}
