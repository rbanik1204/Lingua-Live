import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function parseCssColor(value: string | null): THREE.Color {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return new THREE.Color('#000000');

  // oklch(...) isn't directly supported by three's Color parser.
  // Prefer hex/rgb; fall back to a neutral.
  if (trimmed.startsWith('oklch(')) return new THREE.Color('#0a0a0a');

  try {
    return new THREE.Color(trimmed);
  } catch {
    return new THREE.Color('#0a0a0a');
  }
}

function getThemeColor(varName: string, fallback: string): THREE.Color {
  if (typeof window === 'undefined') return new THREE.Color(fallback);
  const root = document.documentElement;
  const cssValue = getComputedStyle(root).getPropertyValue(varName);
  const color = parseCssColor(cssValue);
  if (!cssValue || cssValue.trim().startsWith('oklch(')) {
    // If the token is OKLCH (common in this project), use a safe fallback.
    return new THREE.Color(fallback);
  }
  return color;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
}

type ThreeHeroBackgroundProps = {
  mode?: 'hero' | 'page';
};

export function ThreeHeroBackground({ mode = 'hero' }: ThreeHeroBackgroundProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // Respect reduced-motion: render a static frame only.
    const reduceMotion = prefersReducedMotion();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);

    // Ensure canvas fills host.
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';

    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 0, 12);

    const primary = getThemeColor('--primary', '#0b4f6c');
    const primarySoft = primary.clone().lerp(new THREE.Color('#ffffff'), 0.55);
    const primaryGlow = primary.clone().lerp(new THREE.Color('#ffffff'), 0.25);

    // Particles
    const particleCount = mode === 'page' ? 1400 : 850;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // A shallow box behind content
      positions[i3 + 0] = (Math.random() - 0.5) * 20;
      positions[i3 + 1] = (Math.random() - 0.5) * 12;
      positions[i3 + 2] = (Math.random() - 0.5) * 10;
      sizes[i] = 0.6 + Math.random() * 1.8;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      color: primarySoft,
      size: 0.06,
      sizeAttenuation: true,
      transparent: true,
      opacity: mode === 'page' ? 0.12 : 0.16,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Soft moving orbs (subtle, premium)
    const orbGeo = new THREE.SphereGeometry(1.7, 28, 28);
    const orbMat = new THREE.MeshBasicMaterial({
      color: primaryGlow,
      transparent: true,
      opacity: 0.06,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const orb1 = new THREE.Mesh(orbGeo, orbMat);
    const orb2 = new THREE.Mesh(orbGeo, orbMat);
    const orb3 = new THREE.Mesh(orbGeo, orbMat);

    orb1.position.set(-7.5, 2.0, -7.0);
    orb2.position.set(6.0, -2.2, -7.5);
    orb3.position.set(1.5, 3.6, -8.0);

    orb1.scale.setScalar(1.15);
    orb2.scale.setScalar(0.95);
    orb3.scale.setScalar(0.75);

    scene.add(orb1, orb2, orb3);

    // Very subtle vignette plane
    const vignetteGeo = new THREE.PlaneGeometry(48, 30);
    const vignetteMat = new THREE.MeshBasicMaterial({
      color: primary,
      transparent: true,
      opacity: 0.02,
      depthWrite: false,
    });
    const vignette = new THREE.Mesh(vignetteGeo, vignetteMat);
    vignette.position.z = -9;
    scene.add(vignette);

    let frameId: number | null = null;
    let disposed = false;

    const resize = () => {
      if (!host) return;
      const { width, height } = host.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const ro = new ResizeObserver(() => resize());
    ro.observe(host);
    resize();

    const clock = new THREE.Clock();

    // Pointer parallax (very subtle)
    const pointer = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    const onPointerMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      target.x = x;
      target.y = y;
    };
    if (!reduceMotion) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
    }

    const renderOnce = () => {
      renderer.render(scene, camera);
    };

    const animate = () => {
      if (disposed) return;
      const t = clock.getElapsedTime();
      // Smooth pointer easing
      pointer.x += (target.x - pointer.x) * 0.04;
      pointer.y += (target.y - pointer.y) * 0.04;

      camera.position.x = pointer.x * 0.45;
      camera.position.y = pointer.y * -0.25;
      camera.lookAt(0, 0, 0);

      points.rotation.y = t * 0.04;
      points.rotation.x = t * 0.02;
      points.position.y = Math.sin(t * 0.55) * 0.12;

      // Orbs drift
      orb1.position.x = -7.5 + Math.sin(t * 0.25) * 0.9;
      orb1.position.y = 2.0 + Math.cos(t * 0.22) * 0.6;
      orb2.position.x = 6.0 + Math.cos(t * 0.2) * 0.8;
      orb2.position.y = -2.2 + Math.sin(t * 0.24) * 0.55;
      orb3.position.x = 1.5 + Math.sin(t * 0.18) * 0.7;
      orb3.position.y = 3.6 + Math.cos(t * 0.19) * 0.45;

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    // If WebGL context is lost, stop animating.
    const onContextLost = (e: Event) => {
      e.preventDefault();
      if (frameId) cancelAnimationFrame(frameId);
      frameId = null;
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost as EventListener);

    if (reduceMotion) {
      renderOnce();
    } else {
      animate();
    }

    return () => {
      disposed = true;
      try {
        ro.disconnect();
      } catch {
        // ignore
      }

      if (!reduceMotion) {
        window.removeEventListener('pointermove', onPointerMove);
      }

      renderer.domElement.removeEventListener('webglcontextlost', onContextLost as EventListener);

      if (frameId) cancelAnimationFrame(frameId);

      geometry.dispose();
      material.dispose();
      orbGeo.dispose();
      orbMat.dispose();
      vignetteGeo.dispose();
      vignetteMat.dispose();

      renderer.dispose();

      try {
        host.removeChild(renderer.domElement);
      } catch {
        // ignore
      }
    };
  }, []);

  const hostClassName =
    mode === 'page'
      ? 'pointer-events-none fixed inset-0 z-0'
      : 'pointer-events-none absolute inset-0 -z-10';

  return <div ref={hostRef} className={hostClassName} aria-hidden="true" />;
}
