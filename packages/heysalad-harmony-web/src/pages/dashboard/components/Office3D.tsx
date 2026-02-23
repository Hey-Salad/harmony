/**
 * Office3D Component
 * Shows a 3D office interior with pixel art workers
 */

import { useEffect, useState } from 'react';
import * as THREE from 'three';
import type { OfficeLocation, Worker } from '../UniverseDashboard';
import PixelWorker from './PixelWorker';
import { generateOfficeImage } from '../../../services/geminiImageService';

interface Office3DProps {
  office: OfficeLocation;
  onWorkerClick: (worker: Worker) => void;
}

const Office3D = ({ office, onWorkerClick }: Office3DProps) => {
  const [officeTexture, setOfficeTexture] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Generate office background image
  useEffect(() => {
    const loadOfficeImage = async () => {
      setLoading(true);
      const imageUrl = await generateOfficeImage({
        id: office.id,
        name: office.name,
        city: office.city,
        country: office.country,
        coordinates: office.coordinates,
      });
      setOfficeTexture(imageUrl);
      setLoading(false);
    };

    loadOfficeImage();
  }, [office]);

  if (loading) {
    return null;
  }

  return (
    <group>
      {/* Office Background Plane */}
      {officeTexture && (
        <mesh position={[0, 2, -5]} rotation={[0, 0, 0]}>
          <planeGeometry args={[16, 9]} />
          <meshBasicMaterial>
            <primitive attach="map" object={new THREE.TextureLoader().load(officeTexture)} />
          </meshBasicMaterial>
        </mesh>
      )}

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial
          color="#1a1a1a"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Grid on floor */}
      <gridHelper args={[20, 20, '#333333', '#0a0a0a']} position={[0, 0.01, 0]} />

      {/* Workers */}
      {office.workers.map((worker) => (
        <PixelWorker
          key={worker.id}
          worker={worker}
          onClick={() => onWorkerClick(worker)}
        />
      ))}

      {/* Lighting */}
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#ffffff" />
      <pointLight position={[-5, 3, -3]} intensity={0.3} color="#E01D1D" />
      <pointLight position={[5, 3, -3]} intensity={0.3} color="#00CED1" />
    </group>
  );
};

export default Office3D;
