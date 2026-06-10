import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import * as THREE from "three";

function Knot({ pointer }: { pointer: React.MutableRefObject<{ x: number; y: number }> }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.15;
    const tx = pointer.current.x * 0.6;
    const ty = -pointer.current.y * 0.6;
    ref.current.rotation.x += (ty - ref.current.rotation.x) * 0.06;
    ref.current.rotation.z += (tx * 0.4 - ref.current.rotation.z) * 0.06;
  });
  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={1.2}>
      <mesh ref={ref} scale={1.6}>
        <torusKnotGeometry args={[1, 0.32, 220, 32]} />
        <MeshDistortMaterial
          color="#b061ff"
          roughness={0.18}
          metalness={0.85}
          distort={0.32}
          speed={1.6}
          emissive="#3a0d6a"
          emissiveIntensity={0.6}
        />
      </mesh>
    </Float>
  );
}

/** Interactive particle field that subtly chases the pointer. */
function ParticleField({ pointer }: { pointer: React.MutableRefObject<{ x: number; y: number }> }) {
  const ref = useRef<THREE.Points>(null);
  const count = 1400;
  const { positions, originals } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 4 + Math.random() * 6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi) - 2;
    }
    return { positions: pos, originals: pos.slice() };
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    const mx = pointer.current.x * 4;
    const my = -pointer.current.y * 4;
    for (let i = 0; i < count; i++) {
      const ox = originals[i * 3];
      const oy = originals[i * 3 + 1];
      const dx = ox - mx;
      const dy = oy - my;
      const d = Math.sqrt(dx * dx + dy * dy) + 0.001;
      const push = Math.min(0.6, 1.2 / d);
      arr[i * 3] = ox + (dx / d) * push + Math.sin(t + i) * 0.02;
      arr[i * 3 + 1] = oy + (dy / d) * push + Math.cos(t + i) * 0.02;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    ref.current.rotation.y = t * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.025} color="#c084fc" transparent opacity={0.85} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

function Rig({ pointer }: { pointer: React.MutableRefObject<{ x: number; y: number }> }) {
  useFrame((state) => {
    state.camera.position.x += (pointer.current.x * 1.5 - state.camera.position.x) * 0.04;
    state.camera.position.y += (-pointer.current.y * 1.0 - state.camera.position.y) * 0.04;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

function ResizeFix() {
  const { gl, size } = useThree();
  useEffect(() => {
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }, [gl, size]);
  return null;
}

export function Hero3D() {
  const ref = useRef<HTMLElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const canvasScale = useTransform(scrollYProgress, [0, 1], [1, 1.6]);
  const canvasOpacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 0.7, 0]);

  const onMove = (e: React.MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    pointer.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.current.y = ((e.clientY - r.top) / r.height) * 2 - 1;
  };

  // Gyroscope (mobile) — drives the same pointer ref.
  useEffect(() => {
    const handler = (e: DeviceOrientationEvent) => {
      const gx = (e.gamma ?? 0) / 45; // -1..1
      const gy = (e.beta ?? 0) / 45;
      pointer.current.x = Math.max(-1, Math.min(1, gx));
      pointer.current.y = Math.max(-1, Math.min(1, gy - 0.6));
    };
    window.addEventListener("deviceorientation", handler);
    return () => window.removeEventListener("deviceorientation", handler);
  }, []);

  return (
    <section
      ref={ref}
      id="top"
      onMouseMove={onMove}
      className="relative flex h-screen min-h-[700px] items-center justify-center overflow-hidden"
    >
      <motion.div
        style={{ scale: canvasScale, opacity: canvasOpacity }}
        className="absolute inset-0"
      >
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 6], fov: 45 }} gl={{ antialias: true, alpha: false }}>
          <Suspense fallback={null}>
            <color attach="background" args={["#0a0a0a"]} />
            <fog attach="fog" args={["#0a0a0a", 6, 16]} />
            <ambientLight intensity={0.35} />
            <directionalLight position={[5, 5, 5]} intensity={1.4} color="#c084fc" />
            <pointLight position={[-5, -3, -2]} intensity={2.2} color="#7c3aed" />
            <pointLight position={[3, -2, 4]} intensity={1.4} color="#ff5fb5" />
            <Knot pointer={pointer} />
            <ParticleField pointer={pointer} />
            <Sparkles count={60} scale={[10, 6, 6]} size={2} speed={0.4} color="#b061ff" />
            <Rig pointer={pointer} />
            <ResizeFix />
            <EffectComposer multisampling={0}>
              <Bloom intensity={0.9} luminanceThreshold={0.18} luminanceSmoothing={0.2} mipmapBlur />
              <ChromaticAberration
                offset={new THREE.Vector2(0.0012, 0.0012)}
                radialModulation={false}
                modulationOffset={0}
                blendFunction={BlendFunction.NORMAL}
              />
              <Noise opacity={0.06} premultiply blendFunction={BlendFunction.SOFT_LIGHT} />
              <Vignette eskil={false} offset={0.2} darkness={0.85} />
            </EffectComposer>
          </Suspense>
        </Canvas>
      </motion.div>

      {/* status pill */}
      <motion.div
        initial={{ opacity: 0, x: -20, filter: "blur(8px)" }}
        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, delay: 2.0, ease: [0.16, 1, 0.3, 1] }}
        className="absolute left-6 top-24 z-10 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:left-10 md:top-28"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
        </span>
        Available for collaboration
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, delay: 2.1, ease: [0.16, 1, 0.3, 1] }}
        className="absolute right-6 top-24 z-10 hidden text-right text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:block md:right-10 md:top-28"
      >
        <div>N 37.41° / E 127.51°</div>
        <div className="text-foreground/80">Songdo, Incheon, KR</div>
      </motion.div>

      <motion.div
        style={{ y, opacity }}
        className="pointer-events-none relative z-10 px-6 text-center mix-blend-difference"
      >
        <motion.p
          initial={{ opacity: 0, scaleX: 0, filter: "blur(6px)" }}
          animate={{ opacity: 1, scaleX: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.9, delay: 2.25, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 inline-block origin-center font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground md:text-xs"
        >
          ⟢ Portfolio · MMXXVI ⟢
        </motion.p>
        <h1 className="font-display text-[18vw] font-extrabold uppercase leading-[0.85] tracking-tighter md:text-[14vw]">
          <motion.span
            initial={{ opacity: 0, y: 80, filter: "blur(20px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.1, delay: 2.45, ease: [0.16, 1, 0.3, 1] }}
            className="block text-white"
          >
            Jiyul
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 80, filter: "blur(20px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.1, delay: 2.65, ease: [0.16, 1, 0.3, 1] }}
            className="text-outline block"
          >
            Ahn
          </motion.span>
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, delay: 2.95, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-8 max-w-md text-sm uppercase tracking-[0.35em] text-white/80 md:text-base"
        >
          Systems Developer<span className="text-accent"> · </span>Founder
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 3.2 }}
        className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Scroll</span>
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.8, delay: 3.3, ease: [0.16, 1, 0.3, 1] }}
            className="h-16 w-px origin-top overflow-hidden bg-border"
          >
            <motion.div
              animate={{ y: [-64, 64] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 4.1 }}
              className="h-16 w-px bg-accent"
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
