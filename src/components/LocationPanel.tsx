'use client';

// ============================================================
// Alisha Local - Location Panel Component
// ============================================================
import React, { useState, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import {
  LOCATION_PROVIDERS,
  getGPSLocation,
  reverseGeocodeOSM,
  geocodeOSM,
  getIPLocation,
  getProviderDisplayName,
} from '@/lib/location/providers';

export default function LocationPanel() {
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const currentLocation = useAppStore((s) => s.currentLocation);
  const setCurrentLocation = useAppStore((s) => s.setCurrentLocation);

  const [searchQuery, setSearchQuery] = useState('');
  const [address, setAddress] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ lat: number; lon: number; display: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedProvider = LOCATION_PROVIDERS.find((p) => p.id === settings.selectedLocationProvider);

  const handleGetLocation = useCallback(async () => {
    setLoading(true);
    setError('');
    setAddress('');

    try {
      const providerId = settings.selectedLocationProvider;

      if (providerId === 'gps') {
        const loc = await getGPSLocation();
        setCurrentLocation(loc);
        const addr = await reverseGeocodeOSM(loc.latitude, loc.longitude);
        setAddress(addr);
      } else if (providerId === 'osm') {
        // OSM is for geocoding, not positioning - use GPS first
        const loc = await getGPSLocation();
        setCurrentLocation(loc);
        const addr = await reverseGeocodeOSM(loc.latitude, loc.longitude);
        setAddress(addr);
      } else if (providerId === 'ipstack') {
        const apiKey = prompt('أدخل مفتاح ipstack API:');
        if (apiKey) {
          const loc = await getIPLocation(apiKey, 'ipstack');
          setCurrentLocation(loc);
          const addr = await reverseGeocodeOSM(loc.latitude, loc.longitude);
          setAddress(addr);
        }
      } else if (providerId === 'ipinfo') {
        const apiKey = prompt('أدخل مفتاح IPinfo API:');
        if (apiKey) {
          const loc = await getIPLocation(apiKey, 'ipinfo');
          setCurrentLocation(loc);
          const addr = await reverseGeocodeOSM(loc.latitude, loc.longitude);
          setAddress(addr);
        }
      } else {
        // For API-key providers, show a message
        setError(`مزود ${getProviderDisplayName(providerId)} يحتاج مفتاح API. استخدم GPS أو أدخل المفتاح في الإعدادات.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في تحديد الموقع');
    } finally {
      setLoading(false);
    }
  }, [settings.selectedLocationProvider, setCurrentLocation]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');

    try {
      const results = await geocodeOSM(searchQuery);
      setSearchResults(results);
      if (results.length === 0) {
        setError('لم يتم العثور على نتائج');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في البحث');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4" dir="rtl">
      <h3 className="text-lg font-bold text-white">📍 خدمات الموقع</h3>

      {/* Current Provider */}
      <div className="bg-slate-700/50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{selectedProvider?.icon}</span>
          <div>
            <p className="font-semibold text-sm">{selectedProvider?.nameAr}</p>
            <p className="text-xs text-slate-400">{selectedProvider?.descriptionAr}</p>
          </div>
        </div>
        <button
          onClick={handleGetLocation}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg py-2.5 text-sm font-medium transition-colors"
        >
          {loading ? 'جارٍ التحديد...' : 'تحديد موقعي الحالي'}
        </button>
      </div>

      {/* Current Location */}
      {currentLocation && (
        <div className="bg-slate-700/50 rounded-xl p-4">
          <p className="text-sm font-semibold mb-2">الموقع الحالي</p>
          <div className="space-y-1 text-xs text-slate-300">
            <p>خط العرض: {currentLocation.latitude.toFixed(6)}</p>
            <p>خط الطول: {currentLocation.longitude.toFixed(6)}</p>
            <p>الدقة: {currentLocation.accuracy.toFixed(0)} متر</p>
            <p>المزود: {getProviderDisplayName(currentLocation.provider)}</p>
          </div>
          {address && (
            <div className="mt-2 p-2 bg-slate-600 rounded-lg">
              <p className="text-xs text-slate-200">{address}</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3">
          <p className="text-xs text-red-300">{error}</p>
        </div>
      )}

      {/* Search Location */}
      <div className="bg-slate-700/50 rounded-xl p-4">
        <p className="text-sm font-semibold mb-2">بحث عن موقع</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="اسم المكان..."
            className="flex-1 bg-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            dir="auto"
          />
          <button
            onClick={handleSearch}
            disabled={loading || !searchQuery.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg px-4 py-2 text-sm transition-colors"
          >
            بحث
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="mt-3 space-y-2">
            {searchResults.map((result, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentLocation({
                    latitude: result.lat,
                    longitude: result.lon,
                    accuracy: 0,
                    provider: 'osm',
                    timestamp: Date.now(),
                  });
                  setAddress(result.display);
                }}
                className="w-full text-left p-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors"
              >
                <p className="text-xs text-slate-200">{result.display}</p>
                <p className="text-[10px] text-slate-400">
                  {result.lat.toFixed(4)}, {result.lon.toFixed(4)}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* All Providers List */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-white">جميع مزودي الموقع</p>
        {LOCATION_PROVIDERS.map((provider) => (
          <div
            key={provider.id}
            onClick={() => updateSettings({ selectedLocationProvider: provider.id })}
            className={`p-3 rounded-xl cursor-pointer transition-all ${
              settings.selectedLocationProvider === provider.id
                ? 'bg-blue-600/20 border border-blue-500/50'
                : 'bg-slate-700/30 hover:bg-slate-700/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{provider.icon}</span>
              <div className="flex-1">
                <p className="text-xs font-semibold">{provider.nameAr}</p>
                <p className="text-[10px] text-slate-400">{provider.name}</p>
              </div>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  provider.accuracy === 'high'
                    ? 'bg-green-500/20 text-green-400'
                    : provider.accuracy === 'medium'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {provider.accuracy === 'high' ? 'عالية' : provider.accuracy === 'medium' ? 'متوسطة' : 'منخفضة'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
