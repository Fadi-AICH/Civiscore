
// app/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import countriesData from "../public/countries.json";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ParticleBackground from "@/components/particle-background";
import StatsCounter from "@/components/stats-counter";
import Logo from "@/components/logo";
import { COUNTRIES_DATA, TOP_RATED_COUNTRIES, BEST_HEALTHCARE_COUNTRIES } from "@/lib/countries-data";
import { useTheme } from "next-themes";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, ChevronRight, Sparkles, Menu, User, Info } from "lucide-react";
import { motion } from "framer-motion";

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

// NOTE: This component is named 'Home' to align with Next.js conventions for the root page.
export default function Home() {
  const router = useRouter();
  const { theme } = useTheme();
  const globeRef = useRef<any>(null);
  const globeContainerRef = useRef<HTMLDivElement>(null);

  const [countries, setCountries] = useState<any[]>([]);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isClient, setIsClient] = useState(false);

  // --- CORRECTED: Move search and filter state declarations here, before their useEffects ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [highlightedCountries, setHighlightedCountries] = useState<any[]>([]);
  // --- END CORRECTED ---

  // --- START NEW GLOBE INTEGRATION LOGIC ---
  useEffect(() => {
    // Set isClient to true once component is mounted
    setIsClient(true);

    // Set dimensions based on globe container size
    const updateDimensions = () => {
      if (globeContainerRef.current) {
        setDimensions({
          width: globeContainerRef.current.clientWidth,
          height: globeContainerRef.current.clientHeight
        });
      }
    };

    // Initial dimensions
    updateDimensions();

    // Add ResizeObserver for responsiveness
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (globeContainerRef.current) {
      resizeObserver.observe(globeContainerRef.current);
    }

    // Load countries data and assign colors
    if (countriesData && Array.isArray(countriesData.features)) {
      const processedCountries = (countriesData.features as unknown as CountryFeature[]).map((feature) => {
        const color = `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`;
        return {
          id: feature.properties.iso_a3,
          name: feature.properties.name,
          color,
          // Maintain the proper GeoJSON structure for polygonsData
          coordinates: feature.geometry.coordinates,
          geometry: feature.geometry
        };
      });
      setCountries(processedCountries);
    }

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
      if (globeContainerRef.current) {
        resizeObserver.unobserve(globeContainerRef.current);
      }
    };
  }, []); // Empty dependency array means this effect runs once on mount
  // --- END NEW GLOBE INTEGRATION LOGIC ---

  // Handle country click (for globe interaction)
  const handleCountryClick = (country: any) => {
    // FIX: Encode the country name to handle spaces and special characters
    const encodedCountryName = encodeURIComponent(country.name);
    router.push(`/explore?country=${encodedCountryName}`);
  };


  // --- Existing search/filter logic from your original `Home` component ---
  // Handle search functionality
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    const query = searchQuery.toLowerCase()

    const countryResults = COUNTRIES_DATA.filter((country) => country.name.toLowerCase().includes(query)).map(
      (country) => ({
        type: "country",
        name: country.name,
        rating: country.rating,
        url: `/country/${country.name.toLowerCase().replace(/\s+/g, "-")}`,
      }),
    )

    const serviceTypes = ["Healthcare", "Education", "Transportation", "Utilities", "Government"]
    const serviceResults = serviceTypes
      .filter((service) => service.toLowerCase().includes(query))
      .map((service) => ({
        type: "service",
        name: service + " System",
        rating: (Math.random() * 2 + 3).toFixed(1),
        url: `/explore?service=${service.toLowerCase()}`,
      }))

    setSearchResults([...countryResults, ...serviceResults].slice(0, 5))
    setShowResults(searchResults.length > 0)
  }, [searchQuery, searchResults.length]) // Added searchResults.length to dependency array to ensure `showResults` updates correctly

  // Hide search results when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowResults(false)
    }
    document.addEventListener("click", handleClickOutside)
    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [])

  // Set highlighted countries based on top ratings
  const showTopRatedCountries = () => {
    setHighlightedCountries(TOP_RATED_COUNTRIES)
    setActiveRegion(null)
  }

  // Set highlighted countries based on healthcare
  const showBestHealthcareCountries = () => {
    setHighlightedCountries(BEST_HEALTHCARE_COUNTRIES)
    setActiveRegion(null)
  }

  // Filter by region
  const filterByRegion = (region: string) => {
    setActiveRegion(region)
    setHighlightedCountries([])
  }

  // Reset filters
  const resetFilters = () => {
    setActiveRegion(null)
    setHighlightedCountries([])
  }
  // --- End of existing search/filter logic ---

  return (
    // Main wrapper for the entire page layout
    // flex-col for mobile, flex-row for desktop
    // min-h-screen ensures it takes full viewport height
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-black via-slate-900 to-slate-800 text-white">
      <div className="flex-grow pb-16">
        {/* HEADER SECTION (Always on Top) */}
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative z-30 w-full p-2 md:px-6 md:py-3 flex justify-between items-center backdrop-blur-md bg-black/30 border-b border-white/10"
        >
          <Logo size="medium" animated={true} /> {/* Civiscore Logo */}

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-4 items-center">
            <Link href="/about"><Button variant="ghost" className="text-white hover:text-white hover:bg-white/10">About</Button></Link>
            <Link href="/how-it-works"><Button variant="ghost" className="text-white hover:text-white hover:bg-white/10">How it works</Button></Link>
            <Link href="/login"><Button variant="ghost" className="text-white hover:text-white hover:bg-white/10">Login</Button></Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-slate-900 text-white border-slate-700">
                <SheetHeader><SheetTitle className="text-white">Menu</SheetTitle></SheetHeader>
                <div className="flex flex-col gap-4 mt-6">
                  <Link href="/about"><Button variant="ghost" className="w-full justify-start">About</Button></Link>
                  <Link href="/how-it-works"><Button variant="ghost" className="w-full justify-start">How it works</Button></Link>
                  <Link href="/login"><Button variant="ghost" className="w-full justify-start">Login</Button></Link>
                  <Link href="/explore"><Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500">Explore Services</Button></Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </motion.header>

        {/* MAIN CONTENT AREA: Globe (Left) and Text/Filters (Right) */}
        <div className="flex flex-grow flex-col md:flex-row relative z-10">

          {/* LEFT SECTION: Interactive Globe with Particle Background */}
          <div ref={globeContainerRef} className="relative w-full md:w-1/2 flex-1 flex items-center justify-center overflow-hidden">
            <ParticleBackground />
            {isClient && dimensions.width > 0 && dimensions.height > 0 && (
              <Globe
                ref={globeRef}
                width={dimensions.width}
                height={dimensions.height}
                backgroundColor="rgba(0,0,0,0)" // Transparent background
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
            {isClient && (dimensions.width === 0 || dimensions.height === 0) && (
              <div className="text-white text-xl">Loading Globe...</div>
            )}
            {/* Hovered Country Info for Globe */}
            
          </div>

          {/* RIGHT SECTION: Text Content, Filters, Search, and CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="w-full md:w-1/2 flex-1 flex flex-col justify-center items-center p-4 md:p-8 text-center md:text-left overflow-y-auto"

          >
            {/* Main Title and Description */}
            <h1 className="w-full text-center text-3xl md:text-5xl font-bold text-white dark:text-white leading-tight mb-2">
              Rate{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                public services
              </span>{" "}
              around the world
            </h1>
            <p className="w-full text-center text-base md:text-lg text-gray-300 dark:text-gray-300 mb-4 max-w-2xl px-2">
              Civiscore is a global platform where citizens can rate, review, and improve public services across countries
              and sectors.
            </p>

            {/* Filter Buttons */}
            <div className="flex flex-wrap justify-center gap-2 mb-4 px-4 w-full max-w-lg">
              {/* Main filters */}
              {[
                { label: "All Countries", query: "", tooltip: "Show all countries" },
                { label: "Top Rated", query: "?sort=top", tooltip: "Show top rated countries", icon: <Sparkles className="h-4 w-4 mr-1" /> },
                { label: "Best Healthcare", query: "?service=healthcare&sort=top", tooltip: "Show countries with best healthcare" },
              ].map((filter, index) => (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/explore${filter.query}`)}
                        className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
                      >
                        {filter.icon}
                        {filter.label}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{filter.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}

              {/* Region filters */}
              <div className="w-full flex flex-wrap justify-center gap-2 mt-2">
                {[
                  { label: "Europe", query: "?region=Europe" },
                  { label: "Asia", query: "?region=Asia" },
                  { label: "Africa", query: "?region=Africa" },
                  { label: "North America", query: "?region=North%20America" },
                  { label: "South America", query: "?region=South%20America" },
                  { label: "Oceania", query: "?region=Oceania" }
                ].map((region) => (
                  <Button
                    key={region.label}
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/explore${region.query}`)}
                    className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
                  >
                    {region.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Search Bar with Results */}
            <div className="relative w-full max-w-md mt-4 px-4" onClick={(e) => e.stopPropagation()}>
              <div className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search for a country or service..."
                className="pl-12 pr-4 py-6 w-full bg-black/30 backdrop-blur-md border border-white/10 text-white dark:bg-black/30 dark:border-white/10 dark:text-white rounded-full focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  if (e.target.value.length >= 2) {
                    setShowResults(true)
                  }
                }}
                onFocus={() => {
                  if (searchResults.length > 0) {
                    setShowResults(true)
                  }
                }}
              />
              {showResults && searchResults.length > 0 && (
                <div className="absolute mt-2 w-full bg-black/80 backdrop-blur-md border border-white/10 rounded-lg shadow-lg z-50 overflow-hidden">
                  <ul>
                    {searchResults.map((result, index) => (
                      <li key={index}>
                        <Link href={result.url}>
                          <div className="px-4 py-3 hover:bg-white/10 dark:hover:bg-white/10 flex justify-between items-center">
                            <div>
                              <p className="text-white dark:text-white">{result.name}</p>
                              <p className="text-xs text-gray-400 dark:text-gray-400">{result.type}</p>
                            </div>
                            <div className="flex items-center">
                              <span className="text-yellow-400 mr-1">★</span>
                              <span className="text-white dark:text-white">{result.rating}</span>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Enter Civiscore Button */}
            <Link href="/explore" className="mt-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105">
                Enter Civiscore
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* FOOTER SECTION (Always at Bottom) */}
        <motion.footer
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="relative z-30 w-full px-4 md:px-6 py-3 flex justify-center items-center backdrop-blur-md bg-black/30 border-t border-white/10"
        >
          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 px-2">
            <Card className="bg-black/30 backdrop-blur-md border border-white/10 dark:bg-black/30 dark:border-white/10 p-2">
              <div className="text-center">
                <p className="text-gray-400 dark:text-gray-400 text-sm">Total Reviews</p>
                <StatsCounter end={1245632} className="text-xl font-bold text-white dark:text-white" />
              </div>
            </Card>
            <Card className="bg-black/30 backdrop-blur-md border border-white/10 dark:bg-black/30 dark:border-white/10 p-4">
              <div className="text-center">
                <p className="text-gray-400 dark:text-gray-400 text-sm">Countries</p>
                <StatsCounter end={COUNTRIES_DATA.length} className="text-2xl font-bold text-white dark:text-white" />
              </div>
            </Card>
            <Card className="bg-black/30 backdrop-blur-md border border-white/10 dark:bg-black/30 dark:border-white/10 p-4">
              <div className="text-center">
                <p className="text-gray-400 dark:text-gray-400 text-sm">Services</p>
                <StatsCounter end={5842} className="text-2xl font-bold text-white dark:text-white" />
              </div>
            </Card>
            <Card className="bg-black/30 backdrop-blur-md border border-white/10 dark:bg-black/30 dark:border-white/10 p-4">
              <div className="text-center">
                <p className="text-gray-400 dark:text-gray-400 text-sm">Top Country</p>
                <p className="text-2xl font-bold text-white dark:text-white">Finland</p>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30">
                  4.8/5
                </Badge>
              </div>
            </Card>
          </div>
        </motion.footer>

        {/* Fixed bottom navigation bar for mobile - if you still need it, adjust its position */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/70 backdrop-blur-md border-t border-white/10 z-50">
          <div className="flex justify-around py-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-white flex flex-col items-center">
                <Search className="h-5 w-5 mb-1" />
                <span className="text-xs">Home</span>
              </Button>
            </Link>
            <Link href="/explore">
              <Button variant="ghost" size="sm" className="text-white flex flex-col items-center">
                <Search className="h-5 w-5 mb-1" />
                <span className="text-xs">Explore</span>
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="ghost" size="sm" className="text-white flex flex-col items-center">
                <Info className="h-5 w-5 mb-1" />
                <span className="text-xs">About</span>
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-white flex flex-col items-center">
                <User className="h-5 w-5 mb-1" />
                <span className="text-xs">Login</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}