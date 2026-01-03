import type { StateCreator } from 'zustand';
import type { DefensiveStructure } from '@/modules/game/types/game';
import { GAME_CONFIG, getRandomQuote } from '@/modules/game/constants/game';

export interface ResourceSlice {
  // Resource state
  collected: number;
  totalCollected: number;
  nextDeployAt: number;
  
  // Structures
  structures: DefensiveStructure[];
  
  // Actions
  collectResource: () => void;
  deployStructure: (canvasWidth: number, canvasHeight: number, onDeploy?: (structure: DefensiveStructure) => void) => void;
  resetResources: () => void;
}

export const createResourceSlice: StateCreator<ResourceSlice> = (set, get) => ({
  // Initial state
  collected: 0,
  totalCollected: 0,
  nextDeployAt: GAME_CONFIG.RESOURCE.DEPLOY_THRESHOLD,
  structures: [],
  
  // Actions
  collectResource: () => set((state) => ({
    collected: state.collected + 1,
    totalCollected: state.totalCollected + 1,
  })),
  
  deployStructure: (canvasWidth, canvasHeight, onDeploy) => {
    const { structures } = get();
    
    // Determine structure type based on deploy count
    const totalStructures = structures.length;
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

    set({
      collected: 0,
      nextDeployAt: GAME_CONFIG.RESOURCE.DEPLOY_THRESHOLD,
      structures: [...structures, newStructure],
    });
  },
  
  resetResources: () => set({
    collected: 0,
    totalCollected: 0,
    nextDeployAt: GAME_CONFIG.RESOURCE.DEPLOY_THRESHOLD,
    structures: [],
  }),
});
