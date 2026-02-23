/**
 * PixelWorker Component
 * Displays a single worker as a pixel art sprite in 3D space
 */

import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { Worker } from '../UniverseDashboard';
import { getCachedSprite } from '../../../services/pixelArtService';

interface PixelWorkerProps {
  worker: Worker;
  onClick: () => void;
}

const PixelWorker = ({ worker, onClick }: PixelWorkerProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [spriteTexture, setSpriteTexture] = useState<THREE.Texture | null>(null);

  // Generate pixel sprite
  useEffect(() => {
    const spriteDataUrl = getCachedSprite({
      size: 64,
      type: worker.type,
      status: worker.status,
    });

    const loader = new THREE.TextureLoader();
    loader.load(spriteDataUrl, (texture) => {
      texture.minFilter = THREE.NearestFilter;
      texture.magFilter = THREE.NearestFilter;
      setSpriteTexture(texture);
    });
  }, [worker.type, worker.status]);

  // Gentle floating animation
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = worker.position[1] + Math.sin(clock.getElapsedTime() * 2) * 0.1;

      // Rotate to face camera
      meshRef.current.rotation.y = 0;
    }
  });

  // Status glow color
  const glowColor = {
    active: '#00FF00',
    idle: '#FFD700',
    offline: '#DC143C',
  }[worker.status];

  return (
    <group position={worker.position}>
      {/* Pixel Sprite */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        castShadow
      >
        <planeGeometry args={[1, 1]} />
        {spriteTexture ? (
          <meshBasicMaterial
            map={spriteTexture}
            transparent
            alphaTest={0.5}
            side={THREE.DoubleSide}
          />
        ) : (
          <meshBasicMaterial color={worker.type === 'human' ? '#8B4513' : '#00CED1'} />
        )}
      </mesh>

      {/* Status Glow Ring */}
      {worker.status === 'active' && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[0.4, 0.6, 32]} />
          <meshBasicMaterial
            color={glowColor}
            transparent
            opacity={hovered ? 0.8 : 0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Hover Label */}
      {hovered && (
        <Html position={[0, 1.5, 0]} center>
          <div className="bg-[#1a1a1a] border border-zinc-700 rounded-lg px-3 py-2 shadow-xl backdrop-blur-sm pointer-events-none">
            <p className="text-white font-semibold text-sm whitespace-nowrap">
              {worker.type === 'human' ? '👥' : '🤖'} {worker.name}
            </p>
            <p className="text-xs text-zinc-400">{worker.role}</p>
            {worker.type === 'human' && worker.hours_today !== undefined && (
              <p className="text-xs text-green-400 mt-1">
                ⏱️ {worker.hours_today.toFixed(1)}h today
              </p>
            )}
            {worker.type === 'ai' && worker.runtime_today !== undefined && (
              <p className="text-xs text-cyan-400 mt-1">
                ⚡ {worker.runtime_today.toFixed(1)}h runtime
              </p>
            )}
          </div>
        </Html>
      )}

      {/* Name Label (always visible) */}
      <Html position={[0, -0.6, 0]} center>
        <div className="text-center pointer-events-none">
          <p className="text-xs text-zinc-300 font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {worker.name}
          </p>
        </div>
      </Html>
    </group>
  );
};

export default PixelWorker;
