import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { feature } from "topojson-client";
import { geoPath, geoEquirectangular } from "d3-geo";
import type { FeatureCollection, Geometry } from "geojson";

// Client-only guard for SSR compatibility
function useIsClient() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);
  return isClient;
}

// Major trade ports (lat, lon)
const PORTS = [
  { name: "Mumbai", lat: 19.07, lon: 72.87, india: true },
  { name: "Chennai", lat: 13.08, lon: 80.27, india: true },
  { name: "Kolkata", lat: 22.57, lon: 88.36, india: true },
  { name: "Dubai", lat: 25.27, lon: 55.3 },
  { name: "Singapore", lat: 1.29, lon: 103.85 },
  { name: "Hamburg", lat: 53.55, lon: 9.99 },
  { name: "New York", lat: 40.71, lon: -74.0 },
  { name: "Shanghai", lat: 31.23, lon: 121.47 },
  { name: "Rotterdam", lat: 51.92, lon: 4.48 },
  { name: "Los Angeles", lat: 33.74, lon: -118.27 },
  { name: "Santos", lat: -23.96, lon: -46.33 },
  { name: "Cape Town", lat: -33.92, lon: 18.42 },
  { name: "Sydney", lat: -33.87, lon: 151.21 },
];

const ROUTES: [number, number][] = [
  [0, 3], [0, 4], [0, 5], [0, 6], [0, 7],
  [1, 4], [1, 7], [1, 11],
  [2, 4], [2, 7],
  [3, 5], [3, 6],
  [4, 7], [4, 12],
  [5, 6], [5, 8], [6, 9], [9, 12], [10, 6], [11, 5],
];

const RADIUS = 1;

function latLonToVec3(lat: number, lon: number, r = RADIUS) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

// Build a high-quality earth texture from real GeoJSON country borders
function useEarthTexture() {
  const [tex, setTex] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch(
        "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json",
      );
      const topo = await res.json();
      const geo = feature(
        topo,
        topo.objects.countries,
      ) as unknown as FeatureCollection<Geometry>;

      const W = 4096;
      const H = 2048;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d")!;

      // Ocean gradient
      const ocean = ctx.createLinearGradient(0, 0, 0, H);
      ocean.addColorStop(0, "#04140d");
      ocean.addColorStop(0.5, "#03110b");
      ocean.addColorStop(1, "#04140d");
      ctx.fillStyle = ocean;
      ctx.fillRect(0, 0, W, H);

      // Faint lat/lon graticule
      ctx.strokeStyle = "rgba(40, 180, 120, 0.06)";
      ctx.lineWidth = 1;
      for (let lon = -180; lon <= 180; lon += 15) {
        const x = ((lon + 180) / 360) * W;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let lat = -75; lat <= 75; lat += 15) {
        const y = ((90 - lat) / 180) * H;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      const projection = geoEquirectangular()
        .scale(W / (2 * Math.PI))
        .translate([W / 2, H / 2]);
      const path = geoPath(projection, ctx);

      // Land fill
      ctx.beginPath();
      path(geo);
      ctx.fillStyle = "rgba(20, 110, 70, 0.55)";
      ctx.fill();

      // Country borders
      ctx.beginPath();
      path(geo);
      ctx.strokeStyle = "rgba(125, 255, 182, 0.55)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Outer glow pass
      ctx.shadowColor = "rgba(31, 226, 138, 0.6)";
      ctx.shadowBlur = 4;
      ctx.beginPath();
      path(geo);
      ctx.strokeStyle = "rgba(155, 255, 207, 0.35)";
      ctx.lineWidth = 0.6;
      ctx.stroke();
      ctx.shadowBlur = 0;

      const t = new THREE.CanvasTexture(canvas);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      t.needsUpdate = true;
      if (!cancelled) setTex(t);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return tex;
}

function GlobeMesh() {
  const group = useRef<THREE.Group>(null!);
  const earth = useEarthTexture();

  useFrame((_, dt) => {
    group.current.rotation.y += dt * 0.06;
  });

  const portPositions = useMemo(
    () =>
      PORTS.map((p) => ({
        ...p,
        pos: latLonToVec3(p.lat, p.lon, RADIUS * 1.005),
      })),
    [],
  );

  const routeCurves = useMemo(() => {
    return ROUTES.map(([a, b]) => {
      const start = portPositions[a].pos;
      const end = portPositions[b].pos;
      const mid = start.clone().add(end).multiplyScalar(0.5);
      const dist = start.distanceTo(end);
      mid.normalize().multiplyScalar(RADIUS + dist * 0.45);
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const pts = curve.getPoints(60);
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      return { geom, curve };
    });
  }, [portPositions]);

  return (
    <group ref={group} rotation={[0.35, 0, 0.1]}>
      {/* Core sphere */}
      <mesh>
        <sphereGeometry args={[RADIUS * 0.995, 96, 96]} />
        <meshBasicMaterial color={"#03110b"} />
      </mesh>

      {/* Real earth map */}
      {earth && (
        <mesh>
          <sphereGeometry args={[RADIUS, 128, 128]} />
          <meshBasicMaterial map={earth} transparent opacity={1} />
        </mesh>
      )}

      {/* Atmosphere rim */}
      <mesh scale={1.06}>
        <sphereGeometry args={[RADIUS, 64, 64]} />
        <shaderMaterial
          transparent
          side={THREE.BackSide}
          depthWrite={false}
          uniforms={{ uColor: { value: new THREE.Color("#22d990") } }}
          vertexShader={`
            varying vec3 vNormal;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying vec3 vNormal;
            uniform vec3 uColor;
            void main() {
              float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
              gl_FragColor = vec4(uColor, 1.0) * intensity;
            }
          `}
        />
      </mesh>

      {/* Routes */}
      {routeCurves.map(({ geom }, i) => (
        <line key={`r-${i}`}>
          <primitive object={geom} attach="geometry" />
          <lineBasicMaterial color={"#1fe28a"} transparent opacity={0.45} />
        </line>
      ))}

      {/* Animated pulses along routes */}
      {routeCurves.map(({ curve }, i) => (
        <Pulse key={`p-${i}`} curve={curve} offset={(i * 0.13) % 1} />
      ))}

      {/* Port markers */}
      {portPositions.map((p, i) => (
        <group key={`port-${i}`} position={p.pos}>
          <mesh>
            <sphereGeometry args={[p.india ? 0.022 : 0.012, 16, 16]} />
            <meshBasicMaterial color={p.india ? "#7dffb6" : "#1fe28a"} />
          </mesh>
          {p.india && <RingPulse />}
        </group>
      ))}
    </group>
  );
}

function Pulse({
  curve,
  offset,
}: {
  curve: THREE.QuadraticBezierCurve3;
  offset: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    const t = ((clock.getElapsedTime() * 0.18 + offset) % 1);
    const p = curve.getPoint(t);
    ref.current.position.copy(p);
    const s = 0.6 + Math.sin(t * Math.PI) * 0.6;
    ref.current.scale.setScalar(s);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.012, 12, 12]} />
      <meshBasicMaterial color={"#9bffcf"} />
    </mesh>
  );
}

function RingPulse() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    const t = (clock.getElapsedTime() % 2.4) / 2.4;
    ref.current.scale.setScalar(0.025 + t * 0.08);
    (ref.current.material as THREE.MeshBasicMaterial).opacity = 1 - t;
  });
  return (
    <mesh ref={ref}>
      <ringGeometry args={[1, 1.25, 32]} />
      <meshBasicMaterial
        color={"#7dffb6"}
        transparent
        opacity={0.8}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

const Globe = () => {
  const isClient = useIsClient();
  if (!isClient) return null;

  return (
    <Canvas
      camera={{ position: [0, 0, 2.8], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.6} />
      <GlobeMesh />
    </Canvas>
  );
};

export default Globe;
