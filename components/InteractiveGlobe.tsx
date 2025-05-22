'use client';

import { useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import * as THREE from 'three';

const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

export default function InteractiveGlobe() {
  const globeRef = useRef<any>();

  useEffect(() => {
    if (!globeRef.current) return;
    const globe = globeRef.current;

    // Set background
    globe.scene().background = new THREE.Color(0x000000);
    const starGeometry = new THREE.SphereGeometry(1000, 64, 64);
    const starMaterial = new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load('//unpkg.com/three-globe/example/img/night-sky.png'),
      side: THREE.BackSide,
    });
    const starfield = new THREE.Mesh(starGeometry, starMaterial);
    globe.scene().add(starfield);

    // Auto-rotation
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.3;
  }, []);

  return (
    <div className="w-full h-[600px]">
      <Globe
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        backgroundImageUrl={null}
        polygonsData={[]}
        onGlobeClick={(e) => console.log('Globe clicked:', e)}
      />
    </div>
  );
}
