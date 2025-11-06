'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface LocationPickerProps {
  onLocationSelect: (location: {
    lat: number;
    lng: number;
    address: string;
    city?: string;
    state?: string;
    pincode?: string;
  }) => void;
  initialLocation?: {
    lat: number;
    lng: number;
  };
  height?: string;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export function LocationPicker({ onLocationSelect, initialLocation, height = '400px' }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(
    initialLocation || null
  );

  // Load Google Maps script
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.error('Google Maps API key not found. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env');
      setIsLoading(false);
      toast.error('Google Maps API key not configured');
      return;
    }

    // Check if script already loaded
    if (window.google && window.google.maps) {
      setIsMapLoaded(true);
      setIsLoading(false);
      return;
    }

    // Check if script is already in DOM
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        setIsMapLoaded(true);
        setIsLoading(false);
      });
      return;
    }

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geocoding`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsMapLoaded(true);
      setIsLoading(false);
    };
    script.onerror = () => {
      setIsLoading(false);
      toast.error('Failed to load Google Maps');
    };
    document.head.appendChild(script);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || !window.google) return;

    const defaultLocation = initialLocation || { lat: 28.6139, lng: 77.2090 }; // Default to Delhi, India

    // Initialize map
    const map = new window.google.maps.Map(mapRef.current, {
      center: defaultLocation,
      zoom: 15,
      mapTypeControl: true,
      fullscreenControl: true,
      streetViewControl: true,
      zoomControl: true,
    });

    mapInstanceRef.current = map;

    // Initialize geocoder
    geocoderRef.current = new window.google.maps.Geocoder();

    // Create marker
    const marker = new window.google.maps.Marker({
      position: defaultLocation,
      map: map,
      draggable: true,
      animation: window.google.maps.Animation.DROP,
      title: 'Drag to set location',
    });

    markerRef.current = marker;

    // Get address when marker is placed
    const updateLocation = (position: { lat: () => number; lng: () => number }) => {
      const lat = position.lat();
      const lng = position.lng();

      geocoderRef.current.geocode(
        { location: { lat, lng } },
        (results: any[], status: string) => {
          if (status === 'OK' && results[0]) {
            const address = results[0].formatted_address;
            const addressComponents = results[0].address_components;

            // Extract city, state, pincode from address components
            let city = '';
            let state = '';
            let pincode = '';

            addressComponents.forEach((component: any) => {
              const types = component.types;
              if (types.includes('locality') || types.includes('sublocality')) {
                city = component.long_name;
              }
              if (types.includes('administrative_area_level_1')) {
                state = component.long_name;
              }
              if (types.includes('postal_code')) {
                pincode = component.long_name;
              }
            });

            onLocationSelect({
              lat,
              lng,
              address,
              city,
              state,
              pincode,
            });

            setCurrentLocation({ lat, lng });
          } else {
            toast.error('Could not get address for this location');
          }
        }
      );
    };

    // Update location when marker is dragged
    marker.addListener('dragend', () => {
      updateLocation(marker.getPosition());
    });

    // Update location when map is clicked
    map.addListener('click', (e: any) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      marker.setPosition({ lat, lng });
      updateLocation({ lat: () => lat, lng: () => lng });
    });

    // Initial geocoding
    updateLocation({ lat: () => defaultLocation.lat, lng: () => defaultLocation.lng });

    // Cleanup
    return () => {
      if (marker) {
        window.google.maps.event.clearInstanceListeners(marker);
      }
      if (map) {
        window.google.maps.event.clearInstanceListeners(map);
      }
    };
  }, [isMapLoaded, initialLocation, onLocationSelect]);

  // Get current location using browser geolocation
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        if (mapInstanceRef.current && markerRef.current) {
          const location = { lat, lng };
          mapInstanceRef.current.setCenter(location);
          mapInstanceRef.current.setZoom(15);
          markerRef.current.setPosition(location);

          // Trigger geocoding
          if (geocoderRef.current) {
            geocoderRef.current.geocode(
              { location },
              (results: any[], status: string) => {
                if (status === 'OK' && results[0]) {
                  const address = results[0].formatted_address;
                  const addressComponents = results[0].address_components;

                  let city = '';
                  let state = '';
                  let pincode = '';

                  addressComponents.forEach((component: any) => {
                    const types = component.types;
                    if (types.includes('locality') || types.includes('sublocality')) {
                      city = component.long_name;
                    }
                    if (types.includes('administrative_area_level_1')) {
                      state = component.long_name;
                    }
                    if (types.includes('postal_code')) {
                      pincode = component.long_name;
                    }
                  });

                  onLocationSelect({
                    lat,
                    lng,
                    address,
                    city,
                    state,
                    pincode,
                  });

                  setCurrentLocation({ lat, lng });
                  toast.success('Location set to your current position');
                }
              }
            );
          }
        }

        setIsGettingLocation(false);
      },
      (error) => {
        setIsGettingLocation(false);
        let errorMessage = 'Could not get your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [onLocationSelect]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center border rounded-lg" style={{ height }}>
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-2 text-sm text-gray-500">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium">Select Location on Map</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={getCurrentLocation}
          disabled={isGettingLocation || !isMapLoaded}
        >
          {isGettingLocation ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Getting Location...
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4 mr-2" />
              Use My Location
            </>
          )}
        </Button>
      </div>
      <div
        ref={mapRef}
        className="w-full border rounded-lg overflow-hidden"
        style={{ height }}
      />
      <p className="text-xs text-gray-500">
        Click on the map or drag the marker to set your delivery location
      </p>
    </div>
  );
}

