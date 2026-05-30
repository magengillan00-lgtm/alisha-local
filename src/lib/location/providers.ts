// ============================================================
// Alisha Local - Location Providers (10 Well-Known Providers)
// ============================================================
import type { LocationProvider, LocationData } from '@/types';

export const LOCATION_PROVIDERS: LocationProvider[] = [
  {
    id: 'gps',
    name: 'GPS (Built-in)',
    nameAr: 'GPS (مدمج)',
    description: 'Device GPS sensor via Capacitor Geolocation plugin. Best accuracy outdoors.',
    descriptionAr: 'مستشعر GPS المدمج عبر إضافة Capacitor. أفضل دقة في الخارج.',
    icon: '📡',
    accuracy: 'high',
    requiresApiKey: false,
    website: 'https://capacitorjs.com/docs/apis/geolocation',
    enabled: true,
  },
  {
    id: 'google',
    name: 'Google Geolocation API',
    nameAr: 'واجهة تحديد الموقع من Google',
    description: 'Google Maps Geolocation API using Wi-Fi and cell tower data. Works indoors.',
    descriptionAr: 'واجهة تحديد الموقع من خرائط Google باستخدام بيانات Wi-Fi وأبراج الاتصال. تعمل في الداخل.',
    icon: '🗺️',
    accuracy: 'high',
    requiresApiKey: true,
    apiKeyName: 'GOOGLE_MAPS_API_KEY',
    website: 'https://developers.google.com/maps/documentation/geolocation',
    enabled: true,
  },
  {
    id: 'osm',
    name: 'OpenStreetMap Nominatim',
    nameAr: 'خريطة الشوارع المفتوحة (Nominatim)',
    description: 'Free geocoding and reverse geocoding service by OpenStreetMap.',
    descriptionAr: 'خدمة ترميز جغرافي مجانية من خريطة الشوارع المفتوحة.',
    icon: '🌍',
    accuracy: 'medium',
    requiresApiKey: false,
    website: 'https://nominatim.openstreetmap.org/',
    enabled: true,
  },
  {
    id: 'here',
    name: 'HERE Technologies',
    nameAr: 'تقنيات HERE',
    description: 'Professional location services with positioning, geocoding and routing.',
    descriptionAr: 'خدمات موقع احترافية مع تحديد المواقع والترميز الجغرافي والتوجيه.',
    icon: '📍',
    accuracy: 'high',
    requiresApiKey: true,
    apiKeyName: 'HERE_API_KEY',
    website: 'https://developer.here.com/',
    enabled: true,
  },
  {
    id: 'mapbox',
    name: 'Mapbox',
    nameAr: 'Mapbox',
    description: 'Modern mapping platform with geocoding, directions and tile services.',
    descriptionAr: 'منصة خرائط حديثة مع ترميز جغرافي واتجاهات وخدمات البلاط.',
    icon: '🔲',
    accuracy: 'high',
    requiresApiKey: true,
    apiKeyName: 'MAPBOX_ACCESS_TOKEN',
    website: 'https://www.mapbox.com/',
    enabled: true,
  },
  {
    id: 'ipstack',
    name: 'ipstack',
    nameAr: 'ipstack',
    description: 'IP-based geolocation service. Lower accuracy but works without GPS.',
    descriptionAr: 'خدمة تحديد الموقع عبر عنوان IP. دقة أقل لكنها تعمل بدون GPS.',
    icon: '🌐',
    accuracy: 'low',
    requiresApiKey: true,
    apiKeyName: 'IPSTACK_API_KEY',
    website: 'https://ipstack.com/',
    enabled: true,
  },
  {
    id: 'ipinfo',
    name: 'IPinfo',
    nameAr: 'IPinfo',
    description: 'IP geolocation and ASN data provider with detailed location info.',
    descriptionAr: 'مزود بيانات تحديد الموقع عبر IP و ASN مع معلومات موقع مفصلة.',
    icon: '🔍',
    accuracy: 'low',
    requiresApiKey: true,
    apiKeyName: 'IPINFO_API_KEY',
    website: 'https://ipinfo.io/',
    enabled: true,
  },
  {
    id: 'opencage',
    name: 'OpenCage',
    nameAr: 'OpenCage',
    description: 'Geocoding API aggregating OpenStreetMap and other open data sources.',
    descriptionAr: 'واجهة ترميز جغرافي تجمع بين خريطة الشوارع المفتوحة ومصادر بيانات مفتوحة أخرى.',
    icon: '🏡',
    accuracy: 'medium',
    requiresApiKey: true,
    apiKeyName: 'OPENCAGE_API_KEY',
    website: 'https://opencagedata.com/',
    enabled: true,
  },
  {
    id: 'tomtom',
    name: 'TomTom',
    nameAr: 'TomTom',
    description: 'Professional navigation and location services with high-quality maps.',
    descriptionAr: 'خدمات ملاحة وموقع احترافية مع خرائط عالية الجودة.',
    icon: '🧭',
    accuracy: 'high',
    requiresApiKey: true,
    apiKeyName: 'TOMTOM_API_KEY',
    website: 'https://developer.tomtom.com/',
    enabled: true,
  },
  {
    id: 'positionstack',
    name: 'Positionstack',
    nameAr: 'Positionstack',
    description: 'Free geocoding API for forward and reverse location lookups.',
    descriptionAr: 'واجهة ترميز جغرافي مجانية للبحث عن المواقع الأمامية والعكسية.',
    icon: '📌',
    accuracy: 'medium',
    requiresApiKey: true,
    apiKeyName: 'POSITIONSTACK_API_KEY',
    website: 'https://positionstack.com/',
    enabled: true,
  },
];

// --- Location fetching functions ---

export async function getGPSLocation(): Promise<LocationData> {
  const { Geolocation } = await import('@capacitor/geolocation');
  
  const position = await Geolocation.getCurrentPosition({
    enableHighAccuracy: true,
    timeout: 15000,
  });

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy,
    altitude: position.coords.altitude ?? undefined,
    speed: position.coords.speed ?? undefined,
    heading: position.coords.heading ?? undefined,
    provider: 'gps',
    timestamp: position.timestamp,
  };
}

export async function reverseGeocodeOSM(lat: number, lon: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ar`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'AlishaLocal/1.0' },
  });
  
  if (!response.ok) throw new Error('فشل في ترميز الموقع');
  
  const data = await response.json();
  return data.display_name || 'غير معروف';
}

export async function geocodeOSM(query: string): Promise<Array<{ lat: number; lon: number; display: string }>> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&accept-language=ar&limit=5`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'AlishaLocal/1.0' },
  });

  if (!response.ok) throw new Error('فشل في البحث عن الموقع');
  
  const data = await response.json();
  return data.map((item: { lat: string; lon: string; display_name: string }) => ({
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
    display: item.display_name,
  }));
}

export async function getIPLocation(apiKey: string, service: 'ipstack' | 'ipinfo'): Promise<LocationData> {
  let url: string;
  
  if (service === 'ipstack') {
    url = `http://api.ipstack.com/check?access_key=${apiKey}`;
  } else {
    url = `https://ipinfo.io/json?token=${apiKey}`;
  }

  const response = await fetch(url);
  if (!response.ok) throw new Error('فشل في تحديد الموقع عبر IP');

  const data = await response.json();
  
  if (service === 'ipstack') {
    return {
      latitude: data.latitude,
      longitude: data.longitude,
      accuracy: 1000, // IP-based is low accuracy
      provider: 'ipstack',
      timestamp: Date.now(),
    };
  } else {
    const [lat, lon] = (data.loc as string).split(',').map(Number);
    return {
      latitude: lat,
      longitude: lon,
      accuracy: 1000,
      provider: 'ipinfo',
      timestamp: Date.now(),
    };
  }
}

export function getProviderById(id: string): LocationProvider | undefined {
  return LOCATION_PROVIDERS.find((p) => p.id === id);
}

export function getProviderDisplayName(id: string, lang: 'ar' | 'en' = 'ar'): string {
  const provider = getProviderById(id);
  if (!provider) return id;
  return lang === 'ar' ? provider.nameAr : provider.name;
}
