'use client';

import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { Graph } from '@/components/knowledge-graph/Graph';
import { LocationMap } from '@/components/map/Map';
import { Button } from '@/components/ui/button';
import buildingsData from '@/data/buildings/buildings.json';
import type { TCOLocation } from '@/types/tco';
import { geocodeAddress } from '@/utils/geocoding';
import { MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ReactFlowProvider } from 'reactflow';

interface Building {
  has_number: string;
  has_address: string | null;
  has_city: string;
  co_count: number;
  violation_count: number;
}

export default function ProjectPage() {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [locations, setLocations] = useState<TCOLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    async function loadLocations() {
      const buildings = buildingsData as Building[];
      const geocodedLocations = await Promise.all(
        buildings
          .filter(
            (building): building is Building & { has_address: string } =>
              building.has_address !== null,
          )
          .map(async (building) => {
            const coords = await geocodeAddress(building.has_address);
            return {
              address: building.has_address,
              tcoCount: building.co_count,
              lat: coords?.lat || 0,
              lng: coords?.lng || 0,
              bin: building.has_number,
            };
          }),
      );
      setLocations(geocodedLocations);
      setIsLoading(false);
    }

    loadLocations();
  }, []);

  if (isLoading) {
    return (
      <div className="relative h-[calc(100vh-5rem)] w-full flex items-center justify-center">
        <div className="text-lg">Loading locations...</div>
      </div>
    );
  }

  const toggleChat = () => setIsChatOpen((prev) => !prev);

  return (
    <div className="relative h-[calc(100vh-5rem)] w-full">
      <div className="h-full w-full rounded-xl border bg-background/50 backdrop-blur-sm">
        {selectedLocation ? (
          <ReactFlowProvider>
            <div className="relative h-full">
              <button
                type="button"
                onClick={() => {
                  setSelectedLocation(null);
                  setSelectedBuilding(null);
                }}
                className="absolute top-4 left-4 z-10 px-4 py-2 bg-background/80 rounded-md hover:bg-background/90 transition-colors"
              >
                ← Back to Map
              </button>
              <Graph />
            </div>
          </ReactFlowProvider>
        ) : (
          <LocationMap
            locations={locations}
            onLocationSelect={(address, bin) => {
              setSelectedLocation(address);
              setSelectedBuilding(bin);
            }}
          />
        )}
      </div>

      {selectedLocation && selectedBuilding && (
        <>
          {!isChatOpen && (
            <Button
              className="fixed bottom-4 right-4 z-50 rounded-full size-12 p-0"
              onClick={toggleChat}
              title="Open chat (Ctrl + Space)"
            >
              <MessageSquare className="size-5" />
            </Button>
          )}

          <ChatSidebar
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            onToggle={toggleChat}
            buildingNumber={selectedBuilding}
          />
        </>
      )}
    </div>
  );
}

async function addNewLocation(address: string) {
  const coordinates = await geocodeAddress(address);
  if (coordinates) {
    const newLocation: TCOLocation = {
      address,
      lat: coordinates.lat,
      lng: coordinates.lng,
      tcoCount: 1,
      bin: '',
    };
    // Add to your locations array/state
  }
}
