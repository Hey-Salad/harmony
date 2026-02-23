/**
 * Gemini Image Generation Service
 * Uses Google's Imagen via Gemini API to generate realistic office images
 */

const GEMINI_API_KEY = 'AIzaSyAyBbzR-NbPeXfFNVcfVLjlFnvuT3s3KJk';
const IMAGEN_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict';

export interface OfficeLocation {
  id: string;
  name: string;
  city: string;
  country: string;
  coordinates: { lat: number; lng: number };
}

interface ImageGenerationResponse {
  predictions: Array<{
    bytesBase64Encoded: string;
    mimeType: string;
  }>;
}

// Cache for generated images (avoid regenerating on every render)
const imageCache: Map<string, string> = new Map();

/**
 * Generate a realistic office interior image for a location
 */
export async function generateOfficeImage(location: OfficeLocation): Promise<string> {
  // Check cache first
  const cacheKey = `office_${location.id}`;
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  try {
    const prompt = `Realistic modern tech office interior in ${location.city}, ${location.country}.
      Clean minimalist workspace with multiple desks and computers, bright natural lighting through large windows,
      contemporary furniture, open floor plan, professional atmosphere, architectural photography style,
      wide angle view, high quality, 4K resolution. Modern tech startup aesthetic.`;

    const response = await fetch(IMAGEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        instances: [
          {
            prompt: prompt,
          },
        ],
        parameters: {
          sampleCount: 1,
          aspectRatio: '16:9',
          negativePrompt: 'blurry, low quality, distorted, cluttered, messy, dark',
        },
      }),
    });

    if (!response.ok) {
      console.error('Imagen API error:', await response.text());
      // Return fallback gradient
      return getFallbackImage(location);
    }

    const data: ImageGenerationResponse = await response.json();

    if (data.predictions && data.predictions.length > 0) {
      const imageData = data.predictions[0].bytesBase64Encoded;
      const imageUrl = `data:${data.predictions[0].mimeType};base64,${imageData}`;

      // Cache the result
      imageCache.set(cacheKey, imageUrl);

      return imageUrl;
    }

    return getFallbackImage(location);
  } catch (error) {
    console.error('Error generating office image:', error);
    return getFallbackImage(location);
  }
}

/**
 * Fallback gradient image if generation fails
 */
function getFallbackImage(location: OfficeLocation): string {
  // Create a canvas with gradient background
  const canvas = document.createElement('canvas');
  canvas.width = 1920;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Gradient background based on location
    const gradients = {
      'London': ['#1a1a2e', '#16213e', '#0f3460'],
      'Berlin': ['#2d4059', '#ea5455', '#f07b3f'],
      'New York': ['#121212', '#1e1e1e', '#2a2a2a'],
      'default': ['#0a0a0a', '#1a1a1a', '#2a2a2a'],
    };

    const colors = gradients[location.city as keyof typeof gradients] || gradients.default;
    const gradient = ctx.createLinearGradient(0, 0, 1920, 1080);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(0.5, colors[1]);
    gradient.addColorStop(1, colors[2]);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1920, 1080);

    // Add location text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.font = 'bold 120px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(location.city, 960, 540);
  }

  return canvas.toDataURL('image/png');
}

/**
 * Preload images for all office locations
 */
export async function preloadOfficeImages(locations: OfficeLocation[]): Promise<void> {
  const promises = locations.map(location => generateOfficeImage(location));
  await Promise.all(promises);
}

/**
 * Clear the image cache
 */
export function clearImageCache(): void {
  imageCache.clear();
}
