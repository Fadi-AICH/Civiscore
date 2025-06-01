import { useRef, useEffect, useState } from 'react';

// Add type definitions for Google Maps
declare global {
  interface Window {
    google: {
      maps: {
        Map: new (element: HTMLElement, options: any) => any;
        Marker: new (options: any) => any;
        InfoWindow: new (options: any) => any;
        MapTypeId: {
          ROADMAP: string;
        };
        Animation: {
          DROP: number;
        };
      };
    };
  }
}

interface ServiceMapProps {
  latitude: number;
  longitude: number;
  name: string;
}

const ServiceMap: React.FC<ServiceMapProps> = ({ latitude, longitude, name }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  useEffect(() => {
    // Skip if no coordinates or map already loaded
    if (!latitude || !longitude || !mapRef.current || mapLoaded) return;
    
    // Load Google Maps script if not already loaded
    if (!window.google) {
      const googleMapsScript = document.createElement('script');
      googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      googleMapsScript.async = true;
      googleMapsScript.defer = true;
      googleMapsScript.onload = initMap;
      document.head.appendChild(googleMapsScript);
    } else {
      initMap();
    }
    
    function initMap() {
      if (!mapRef.current) return;
      
      const mapOptions = {
        center: { lat: latitude, lng: longitude },
        zoom: 15,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        fullscreenControl: true,
        streetViewControl: false,
        zoomControl: true,
        styles: [
          {
            featureType: 'all',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#ffffff' }]
          },
          {
            featureType: 'all',
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#000000' }, { lightness: 13 }]
          },
          {
            featureType: 'administrative',
            elementType: 'geometry.fill',
            stylers: [{ color: '#000000' }]
          },
          {
            featureType: 'administrative',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#144b53' }, { lightness: 14 }, { weight: 1.4 }]
          },
          {
            featureType: 'landscape',
            elementType: 'all',
            stylers: [{ color: '#08304b' }]
          },
          {
            featureType: 'poi',
            elementType: 'geometry',
            stylers: [{ color: '#0c4152' }, { lightness: 5 }]
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry.fill',
            stylers: [{ color: '#000000' }]
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#0b434f' }, { lightness: 25 }]
          },
          {
            featureType: 'road.arterial',
            elementType: 'geometry.fill',
            stylers: [{ color: '#000000' }]
          },
          {
            featureType: 'road.arterial',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#0b3d51' }, { lightness: 16 }]
          },
          {
            featureType: 'road.local',
            elementType: 'geometry',
            stylers: [{ color: '#000000' }]
          },
          {
            featureType: 'transit',
            elementType: 'all',
            stylers: [{ color: '#146474' }]
          },
          {
            featureType: 'water',
            elementType: 'all',
            stylers: [{ color: '#021019' }]
          }
        ]
      };
      
      const map = new window.google.maps.Map(mapRef.current, mapOptions);
      
      // Add marker for the service
      const marker = new window.google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: map,
        title: name,
        animation: window.google.maps.Animation.DROP
      });
      
      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div style="color: #000; padding: 5px;"><strong>${name}</strong></div>`
      });
      
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
      
      setMapLoaded(true);
    }
    
    return () => {
      // Cleanup function if needed
    };
  }, [latitude, longitude, name, mapLoaded]);
  
  return (
    <div 
      ref={mapRef} 
      className="w-full h-full min-h-[400px] rounded-lg overflow-hidden"
      style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}
    />
  );
};

export default ServiceMap;
