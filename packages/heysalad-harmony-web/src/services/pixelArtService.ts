/**
 * Pixel Art Worker Sprite Generator
 * Creates 8-bit/16-bit style avatars for workers
 */

export type WorkerType = 'human' | 'ai';
export type WorkerStatus = 'active' | 'idle' | 'offline';

interface PixelArtConfig {
  size: number;
  type: WorkerType;
  status: WorkerStatus;
  color?: string;
}

// Pixel patterns for humans (8x8 simplified humanoid)
const HUMAN_PATTERN = [
  [0, 0, 1, 1, 1, 1, 0, 0], // Head
  [0, 1, 2, 2, 2, 2, 1, 0],
  [0, 1, 2, 3, 3, 2, 1, 0],
  [0, 0, 1, 2, 2, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 0], // Body
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 1, 0, 1, 1, 0, 1, 0], // Legs
  [0, 1, 0, 1, 1, 0, 1, 0],
];

// Pixel pattern for AI agents (8x8 robot)
const AI_PATTERN = [
  [0, 1, 1, 1, 1, 1, 1, 0], // Head/monitor
  [1, 2, 3, 2, 2, 3, 2, 1],
  [1, 2, 2, 2, 2, 2, 2, 1],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 0, 0], // Body
  [0, 1, 1, 1, 1, 1, 1, 0],
  [1, 0, 1, 0, 0, 1, 0, 1], // Legs/base
  [1, 1, 1, 0, 0, 1, 1, 1],
];

/**
 * Generate a pixel art sprite for a worker
 */
export function generatePixelSprite(config: PixelArtConfig): string {
  const { size, type, status, color } = config;
  const pattern = type === 'human' ? HUMAN_PATTERN : AI_PATTERN;

  const canvas = document.createElement('canvas');
  const pixelSize = Math.floor(size / 8);
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  // Clear background
  ctx.clearRect(0, 0, size, size);

  // Color palette based on worker type and status
  const colors = getColorPalette(type, status, color);

  // Draw pixel pattern
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const colorIndex = pattern[y][x];
      if (colorIndex > 0) {
        ctx.fillStyle = colors[colorIndex];
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }
  }

  // Add status glow effect
  if (status === 'active') {
    ctx.shadowBlur = 15;
    ctx.shadowColor = colors[3];
    ctx.strokeStyle = colors[3];
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, size - 4, size - 4);
  }

  return canvas.toDataURL('image/png');
}

/**
 * Get color palette based on worker type and status
 */
function getColorPalette(type: WorkerType, status: WorkerStatus, customColor?: string): string[] {
  const baseColors = {
    human: {
      active: ['transparent', '#8B4513', '#D2691E', '#FFE4C4'],   // Brown tones (active)
      idle: ['transparent', '#696969', '#A9A9A9', '#D3D3D3'],     // Gray (idle)
      offline: ['transparent', '#2F4F4F', '#556B2F', '#696969'],  // Dark gray (offline)
    },
    ai: {
      active: ['transparent', '#00CED1', '#00FFFF', '#00FF00'],   // Cyan/green (active)
      idle: ['transparent', '#FFD700', '#FFA500', '#FFFF00'],     // Yellow (idle)
      offline: ['transparent', '#DC143C', '#8B0000', '#FF4500'],  // Red (offline)
    },
  };

  if (customColor) {
    return ['transparent', customColor, lighten(customColor, 20), lighten(customColor, 40)];
  }

  return baseColors[type][status];
}

/**
 * Lighten a hex color by a percentage
 */
function lighten(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, ((num >> 16) & 0xff) + amt);
  const G = Math.min(255, ((num >> 8) & 0xff) + amt);
  const B = Math.min(255, (num & 0xff) + amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

/**
 * Generate animated pixel sprite (multiple frames)
 */
export function generateAnimatedSprite(config: PixelArtConfig): string[] {
  const frames: string[] = [];

  // Generate 4 frames with slight variations for idle animation
  for (let i = 0; i < 4; i++) {
    frames.push(generatePixelSprite(config));
  }

  return frames;
}

/**
 * Cache for generated sprites
 */
const spriteCache: Map<string, string> = new Map();

/**
 * Get or generate a cached sprite
 */
export function getCachedSprite(config: PixelArtConfig): string {
  const cacheKey = `${config.type}_${config.status}_${config.size}_${config.color || 'default'}`;

  if (spriteCache.has(cacheKey)) {
    return spriteCache.get(cacheKey)!;
  }

  const sprite = generatePixelSprite(config);
  spriteCache.set(cacheKey, sprite);
  return sprite;
}

/**
 * Preload all common sprite variations
 */
export function preloadSprites(size: number): void {
  const types: WorkerType[] = ['human', 'ai'];
  const statuses: WorkerStatus[] = ['active', 'idle', 'offline'];

  types.forEach(type => {
    statuses.forEach(status => {
      getCachedSprite({ size, type, status });
    });
  });
}
