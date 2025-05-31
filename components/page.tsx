"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import countriesData from "./countries.json";
import { useRouter } from "next/navigation";

// Dynamically import the Globe component with no SSR
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

// Define types for our country data
interface CountryFeature {
  type: string;
  properties: {
    name: string;
    iso_a3: string;
  };
  geometry: {
    type: string;
    coordinates: any[];
  };
}

interface CountryData {
  id: string;
  name: string;
  color: string;
  polygon: any;
}

export default function MapPage() {
  const router = useRouter();
  const globeRef = useRef<any>(null);
  const [countries, setCountries] = useState<any[]>([]);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    // Set isClient to true once component is mounted
    setIsClient(true);
    
    // Set dimensions based on window size
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    // Initial dimensions
    updateDimensions();
    
    // Add event listener for window resize
    window.addEventListener('resize', updateDimensions);
    
    // Generate random color for each country
    const processedCountries = (countriesData.features as unknown as CountryFeature[]).map((feature) => {
      const color = `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`;
      return {
        id: feature.properties.iso_a3,
        name: feature.properties.name,
        color,
        // This is the critical part - maintain the proper GeoJSON structure
        coordinates: feature.geometry.coordinates,
        geometry: feature.geometry
      };
    });
    
    setCountries(processedCountries);

    // Auto-rotate the globe after a short delay to ensure it's loaded
    const timer = setTimeout(() => {
      if (globeRef.current) {
        const controls = globeRef.current.controls();
        if (controls) {
          controls.autoRotate = true;
          controls.autoRotateSpeed = 0.5;
        }
      }
    }, 1000);
    
    // Cleanup
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  const handleCountryClick = (country: any) => {
    router.push(`/explore?country=${country.name}`);
    // console.log("Selected country:", polygon.name);
  };

  return (
    <div className="w-full h-screen bg-black">
      {isClient && (
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          polygonsData={countries}
          polygonCapColor={(d: any) => 
            d.id === hoveredCountry ? 'rgba(255, 255, 0, 0.7)' : d.color
          }
          polygonSideColor={() => 'rgba(0, 100, 200, 0.3)'}
          polygonStrokeColor={() => '#111'}
          polygonLabel={({ name }: any) => `<b>${name}</b>`}
          onPolygonClick={(polygon: any) => handleCountryClick(polygon)}
          onPolygonHover={(polygon: any) => {
            setHoveredCountry(polygon ? polygon.id : null);
          }}
          polygonsTransitionDuration={300}
          atmosphereColor="#3a228a"
          atmosphereAltitude={0.25}
        />
      )}
    </div>
  );
}