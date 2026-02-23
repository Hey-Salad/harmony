/**
 * HeySalad Universe - 3D Command Center Dashboard
 * Main entry point for the immersive 3D worker visualization
 */

import { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ArrowLeft, Maximize2, Settings } from 'lucide-react';
import Globe3D from './components/Globe3D';
import Office3D from './components/Office3D';
import WorkerPopup from './components/WorkerPopup';

export interface Worker {
  id: string;
  name: string;
  type: 'human' | 'ai';
  status: 'active' | 'idle' | 'offline';
  role: string;
  location: string;
  position: [number, number, number]; // 3D position in office
  // Human fields
  hours_today?: number;
  // AI fields
  runtime_today?: number;
  tokens_used?: number;
  cost_today?: number;
}

export interface OfficeLocation {
  id: string;
  name: string;
  city: string;
  country: string;
  coordinates: { lat: number; lng: number };
  workers: Worker[];
}

type ViewMode = 'globe' | 'office';

const UniverseDashboard = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('globe');
  const [selectedOffice, setSelectedOffice] = useState<OfficeLocation | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [officeLocations, setOfficeLocations] = useState<OfficeLocation[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data - will be replaced with API call
  useEffect(() => {
    // Simulate loading office data
    setTimeout(() => {
      setOfficeLocations([
        {
          id: 'london',
          name: 'London Office',
          city: 'London',
          country: 'UK',
          coordinates: { lat: 51.5074, lng: -0.1278 },
          workers: [
            {
              id: 'h1',
              name: 'Sarah Chen',
              type: 'human',
              status: 'active',
              role: 'HR Manager',
              location: 'london',
              position: [-2, 0, -1],
              hours_today: 6.4,
            },
            {
              id: 'h2',
              name: 'John Smith',
              type: 'human',
              status: 'idle',
              role: 'Warehouse Staff',
              location: 'london',
              position: [2, 0, -2],
              hours_today: 4.2,
            },
            {
              id: 'a1',
              name: 'Shop-Agent-1',
              type: 'ai',
              status: 'active',
              role: 'Shopping',
              location: 'london',
              position: [-3, 0, 2],
              runtime_today: 3.4,
              tokens_used: 2400000,
              cost_today: 45.2,
            },
            {
              id: 'a2',
              name: 'Delivery-Bot-01',
              type: 'ai',
              status: 'active',
              role: 'Delivery',
              location: 'london',
              position: [3, 0, 2],
              runtime_today: 2.8,
              tokens_used: 1800000,
              cost_today: 32.5,
            },
          ],
        },
        {
          id: 'berlin',
          name: 'Berlin Office',
          city: 'Berlin',
          country: 'Germany',
          coordinates: { lat: 52.52, lng: 13.405 },
          workers: [
            {
              id: 'h3',
              name: 'Maria Garcia',
              type: 'human',
              status: 'active',
              role: 'Operations Manager',
              location: 'berlin',
              position: [0, 0, -1],
              hours_today: 5.5,
            },
            {
              id: 'a3',
              name: 'Support-Bot',
              type: 'ai',
              status: 'offline',
              role: 'Support',
              location: 'berlin',
              position: [2, 0, 1],
              runtime_today: 0,
              tokens_used: 0,
              cost_today: 0,
            },
          ],
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleOfficeClick = (office: OfficeLocation) => {
    setSelectedOffice(office);
    setViewMode('office');
  };

  const handleBackToGlobe = () => {
    setViewMode('globe');
    setSelectedOffice(null);
    setSelectedWorker(null);
  };

  const handleWorkerClick = (worker: Worker) => {
    setSelectedWorker(worker);
  };

  const totalWorkers = officeLocations.reduce((sum, office) => sum + office.workers.length, 0);
  const activeWorkers = officeLocations.reduce(
    (sum, office) => sum + office.workers.filter(w => w.status === 'active').length,
    0
  );
  const totalHumans = officeLocations.reduce(
    (sum, office) => sum + office.workers.filter(w => w.type === 'human').length,
    0
  );
  const totalAgents = officeLocations.reduce(
    (sum, office) => sum + office.workers.filter(w => w.type === 'ai').length,
    0
  );

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#E01D1D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading HeySalad Universe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#0a0a0a] relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-[#1a1a1a]/95 to-transparent p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {viewMode === 'office' && (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={handleBackToGlobe}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Globe
              </motion.button>
            )}
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Globe className="w-8 h-8 text-[#E01D1D]" />
                HeySalad Universe
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                {viewMode === 'globe'
                  ? 'Global workforce overview'
                  : `${selectedOffice?.name} - ${selectedOffice?.city}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Stats Cards */}
            <div className="flex gap-3">
              <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-lg px-4 py-2">
                <p className="text-xs text-zinc-500">Total Workers</p>
                <p className="text-xl font-bold text-white">
                  {totalWorkers}
                  <span className="text-sm text-zinc-400 ml-2">
                    👥 {totalHumans} 🤖 {totalAgents}
                  </span>
                </p>
              </div>
              <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-lg px-4 py-2">
                <p className="text-xs text-zinc-500">Active Now</p>
                <p className="text-xl font-bold text-green-400">{activeWorkers}</p>
              </div>
            </div>

            <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
              <Maximize2 className="w-5 h-5 text-zinc-400" />
            </button>
            <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas
        shadows
        className="w-full h-full"
        gl={{ antialias: true, alpha: true }}
      >
        <PerspectiveCamera makeDefault position={[0, 5, 10]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <pointLight position={[-10, 10, -10]} intensity={0.5} color="#E01D1D" />

        <Suspense fallback={null}>
          {viewMode === 'globe' ? (
            <Globe3D offices={officeLocations} onOfficeClick={handleOfficeClick} />
          ) : (
            selectedOffice && (
              <Office3D office={selectedOffice} onWorkerClick={handleWorkerClick} />
            )
          )}
        </Suspense>

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={50}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>

      {/* Worker Popup */}
      <AnimatePresence>
        {selectedWorker && (
          <WorkerPopup
            worker={selectedWorker}
            onClose={() => setSelectedWorker(null)}
          />
        )}
      </AnimatePresence>

      {/* Help Text */}
      {viewMode === 'globe' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-zinc-900/90 backdrop-blur-sm border border-zinc-800 rounded-lg px-6 py-3"
        >
          <p className="text-sm text-zinc-400">
            💡 <span className="text-white font-semibold">Click on an office</span> to zoom in and
            see workers
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default UniverseDashboard;
