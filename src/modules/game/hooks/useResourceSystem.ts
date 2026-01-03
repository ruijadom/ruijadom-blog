import { useState, useCallback } from 'react';
import type { ResourceState, DefensiveStructure } from '@/modules/game/types/game';
import { GAME_CONFIG, getRandomQuote } from '@/modules/game/constants/game';

/**
 * Hook for managing resource collection and deploy system
 * Handles resource counting and defensive structure deployment
 */
export function useResourceSystem(onDeploy?: (structure: DefensiveStructure) => void) {
  const [resources, setResources] = useState<ResourceState>({
    collected: 0,
    totalCollected: 0,
    nextDeployAt: GAME_CONFIG.RESOURCE.DEPLOY_THRESHOLD,
    satellites: [],
    stations: [],
  });

  const collectResource = useCallback(() => {
    setResources((prev) => ({
      ...prev,
      collected: prev.collected + 1,
      totalCollected: prev.totalCollected + 1,
    }));
  }, []);

  const deployStructure = useCallback(
    (canvasWidth: number, canvasHeight: number) => {
      setResources((prev) => {
        // Determine structure type based on deploy count
        const totalStructures = prev.satellites.length + prev.stations.length;
        const structureType: 'satellite' | 'station' =
          totalStructures === 0 
            ? 'satellite' 
            : totalStructures === 1 
            ? 'station' 
            : totalStructures % 2 === 0 
            ? 'satellite' 
            : 'station';

        // Random position across screen width (with margins)
        const margin = 100;
        const xPosition = margin + Math.random() * (canvasWidth - margin * 2);
        const yPosition = 100 + Math.random() * (canvasHeight * 0.4);

        const config = structureType === 'satellite' 
          ? GAME_CONFIG.STRUCTURE.SATELLITE 
          : GAME_CONFIG.STRUCTURE.STATION;

        const newStructure: DefensiveStructure = {
          id: `${structureType}-${Date.now()}`,
          x: xPosition,
          y: yPosition,
          type: structureType,
          range: config.RANGE,
          fireRate: config.FIRE_RATE,
          lastShot: 0,
          quote: getRandomQuote(structureType),
        };

        // Call the onDeploy callback if provided
        if (onDeploy) {
          onDeploy(newStructure);
        }

        return {
          ...prev,
          collected: 0,
          nextDeployAt: GAME_CONFIG.RESOURCE.DEPLOY_THRESHOLD,
          satellites: structureType === 'satellite' 
            ? [...prev.satellites, newStructure] 
            : prev.satellites,
          stations: structureType === 'station' 
            ? [...prev.stations, newStructure] 
            : prev.stations,
        };
      });
    },
    [onDeploy]
  );

  const resetResources = useCallback(() => {
    setResources({
      collected: 0,
      totalCollected: 0,
      nextDeployAt: GAME_CONFIG.RESOURCE.DEPLOY_THRESHOLD,
      satellites: [],
      stations: [],
    });
  }, []);

  return {
    resources,
    collectResource,
    deployStructure,
    resetResources,
  };
}
