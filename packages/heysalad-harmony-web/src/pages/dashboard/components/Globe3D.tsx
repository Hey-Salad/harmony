/**
 * Globe3D Component
 * Shows a 3D globe with office location markers
 */

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { OfficeLocation } from '../UniverseDashboard';

interface Globe3DProps {
  offices: OfficeLocation[];
  onOfficeClick: (office: OfficeLocation) => void;
}

const Globe3D = ({ offices, onOfficeClick }: Globe3DProps) => {
  const globeRef = useRef<THREE.Mesh>(null);
  const [hoveredOffice, setHoveredOffice] = useState<string | null>(null);

  // Slow rotation of the globe
  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.001;
    }
  });

  /**
   * Convert lat/lng to 3D coordinates on sphere
   */
  const latLngToVector3 = (lat: number, lng: number, radius: number): [number, number, number] => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    return [x, y, z];
  };

  return (
    <group>
      {/* Main Globe */}
      <Sphere ref={globeRef} args={[5, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#0a0a0a"
          wireframe={true}
          wireframeLinewidth={1}
          emissive="#1a1a1a"
          emissiveIntensity={0.3}
        />
      </Sphere>

      {/* Inner glow sphere */}
      <Sphere args={[4.9, 64, 64]} position={[0, 0, 0]}>
        <meshBasicMaterial
          color="#E01D1D"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Office Markers */}
      {offices.map((office) => {
        const position = latLngToVector3(
          office.coordinates.lat,
          office.coordinates.lng,
          5.2
        );

        const activeCount = office.workers.filter(w => w.status === 'active').length;
        const humanCount = office.workers.filter(w => w.type === 'human').length;
        const agentCount = office.workers.filter(w => w.type === 'ai').length;

        const isHovered = hoveredOffice === office.id;

        return (
          <group key={office.id} position={position}>
            {/* Marker Pin */}
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                onOfficeClick(office);
              }}
              onPointerEnter={() => setHoveredOffice(office.id)}
              onPointerLeave={() => setHoveredOffice(null)}
            >
              <cylinderGeometry args={[0.1, 0.2, 0.5, 8]} />
              <meshStandardMaterial
                color={isHovered ? '#FFFFFF' : '#E01D1D'}
                emissive={isHovered ? '#E01D1D' : '#000000'}
                emissiveIntensity={isHovered ? 0.8 : 0}
              />
            </mesh>

            {/* Pulsing ring for active offices */}
            {activeCount > 0 && (
              <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
                <ringGeometry args={[0.3, 0.4, 32]} />
                <meshBasicMaterial
                  color="#00FF00"
                  transparent
                  opacity={0.5}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}

            {/* Office Info Card (HTML overlay) */}
            {isHovered && (
              <Html position={[0, 0.8, 0]} center>
                <div className="bg-[#1a1a1a] border-2 border-[#E01D1D] rounded-lg p-4 min-w-[220px] shadow-2xl pointer-events-none backdrop-blur-sm">
                  <h3 className="text-white font-bold text-lg mb-2">{office.name}</h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-zinc-400">
                      📍 {office.city}, {office.country}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        <span className="text-green-400 font-semibold">{activeCount}</span>
                        <span className="text-zinc-500 text-xs">Active</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>👥</span>
                        <span className="text-white font-semibold">{humanCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>🤖</span>
                        <span className="text-white font-semibold">{agentCount}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 mt-3 text-center">Click to zoom in</p>
                </div>
              </Html>
            )}
          </group>
        );
      })}

      {/* Grid Helper */}
      <gridHelper args={[20, 20, '#333333', '#1a1a1a']} position={[0, -6, 0]} />
    </group>
  );
};

export default Globe3D;
