interface GeocodingCache {
  [address: string]: {
    lat: number;
    lng: number;
    timestamp: number;
  };
}

const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours
const geocodingCache: GeocodingCache = {};

function formatAddress(address: string): string {
  // Standardize street abbreviations
  let formatted = address
    .replace(/\bST\b/i, 'Street')
    .replace(/\bAVE\b/i, 'Avenue')
    .replace(/\bPL\b/i, 'Place')
    .replace(/\bRD\b/i, 'Road');

  // Add USA to improve geocoding accuracy
  if (!formatted.toLowerCase().includes('usa')) {
    formatted = `${formatted}, USA`;
  }

  // Ensure proper spacing after commas
  formatted = formatted.replace(/,(?!\s)/g, ', ');

  return formatted;
}

export async function geocodeAddress(address: string) {
  const formattedAddress = formatAddress(address);

  // Check cache first
  const cached = geocodingCache[formattedAddress];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return { lat: cached.lat, lng: cached.lng };
  }

  const MAPBOX_API = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const encodedAddress = encodeURIComponent(formattedAddress);
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${MAPBOX_API}&country=US&types=address`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }

    const data = await response.json();
    if (!data.features?.length) {
      throw new Error(`Address not found: ${formattedAddress}`);
    }

    const [lng, lat] = data.features[0].center;

    // Cache the result
    geocodingCache[formattedAddress] = {
      lat,
      lng,
      timestamp: Date.now(),
    };

    return { lat, lng };
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
}
