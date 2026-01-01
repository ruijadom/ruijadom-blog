# Implementation Plan: Space Dev Metaphor Game

## Overview

Transform the existing `rocket-ship.tsx` component into a complete educational game that demonstrates software development concepts through space metaphors. The implementation will build incrementally on the existing codebase, adding resource collection, defensive structures, level progression, and educational messaging.

## Tasks

- [x] 1. Set up game state management and core types
  - Create TypeScript interfaces for all game entities (GameState, ResourceState, LevelState, DefensiveStructure)
  - Implement useGameState hook for managing game lifecycle (play, pause, game over, reset)
  - Implement useResourceSystem hook for tracking resources and deploys
  - Implement useLevelSystem hook for difficulty progression
  - _Requirements: 1.1, 2.1, 3.1, 5.1, 10.1_

- [ ]* 1.1 Write property test for game state initialization
  - **Property: Initial State Values**
  - **Validates: Requirements 5.1**

- [x] 2. Implement resource collection system
  - [x] 2.1 Modify asteroid collision to increment resource counter
    - Update collision detection to track asteroid type
    - Increment resource counter when asteroid (not bug) is destroyed
    - _Requirements: 2.3_

  - [ ]* 2.2 Write property test for resource collection
    - **Property 3: Resource Collection Increments Counter**
    - **Validates: Requirements 2.3**

  - [x] 2.3 Add resource display to HUD
    - Create HUD component overlay on canvas
    - Display current resources in top-left corner
    - Display progress to next deploy (X/20 format)
    - _Requirements: 6.1, 6.6_

  - [ ]* 2.4 Write property test for HUD counter accuracy
    - **Property 17: HUD Counters Match Game State**
    - **Validates: Requirements 6.4, 6.5, 6.6**

- [x] 3. Checkpoint - Verify resource collection works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement deploy system for defensive structures
  - [x] 4.1 Create defensive structure types and rendering
    - Define Satellite and Space_Station interfaces
    - Implement drawSatellite function (blue, circular, antenna)
    - Implement drawSpaceStation function (larger, green, multiple modules)
    - _Requirements: 4.1, 4.2_

  - [x] 4.2 Implement deploy logic at resource thresholds
    - Check resource counter for multiples of 20
    - Deploy Satellite at 20 resources (first deploy)
    - Deploy Space_Station at 40 resources (second deploy)
    - Alternate between satellites and stations for subsequent deploys
    - Reset resource counter to 0 after deploy
    - Position structures strategically (spread across screen width)
    - _Requirements: 2.6, 4.1, 4.2, 4.8_

  - [ ]* 4.3 Write property test for deploy triggers
    - **Property 5: Deploy Triggers at Resource Threshold**
    - **Validates: Requirements 2.6, 4.1, 4.2, 4.8**

  - [x] 4.4 Add educational quotes to deploys
    - Create SATELLITE_QUOTES array with 10+ quotes about automation and tools
    - Create STATION_QUOTES array with 10+ quotes about infrastructure and architecture
    - Randomly select quote on deploy and associate with structure
    - Display quote notification on HUD when structure is deployed
    - _Requirements: 8.2, 8.3, 8.8, 8.10_

  - [ ]* 4.5 Write property test for quote selection
    - **Property 15: Deploy Quote Selection**
    - **Validates: Requirements 8.2, 8.3, 8.8**

  - [x] 4.6 Implement click-to-show-quote functionality
    - Add click detection on canvas for structure positions
    - Display quote tooltip/modal when structure is clicked
    - _Requirements: 8.4, 8.5_

  - [ ]* 4.7 Write property test for quote display on click
    - **Property 16: Click on Structure Shows Quote**
    - **Validates: Requirements 8.4, 8.5**

- [x] 5. Checkpoint - Verify deploy system works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement automatic targeting and firing for defensive structures
  - [x] 6.1 Add range detection for structures
    - Implement distance calculation between structure and bugs
    - Check if bug is within structure's range (200px for satellite, 300px for station)
    - _Requirements: 4.5, 4.6_

  - [x] 6.2 Implement automatic firing logic
    - Add fire rate cooldown tracking per structure
    - Fire bullet toward nearest bug in range when cooldown elapsed
    - Satellite fires every 1000ms, Station fires every 500ms
    - Create bullets with 'satellite' or 'station' owner tag
    - _Requirements: 4.3, 4.4_

  - [ ]* 6.3 Write property test for auto-targeting
    - **Property 10: Defensive Structures Auto-Target Bugs**
    - **Validates: Requirements 4.3, 4.4**

  - [x] 6.4 Update collision detection for structure bullets
    - Extend collision system to handle structure-owned bullets
    - Remove bug and bullet on collision
    - _Requirements: 7.5_

  - [ ]* 6.5 Write property test for structure bullet collisions
    - **Property 7: Collision Removes Both Objects**
    - **Validates: Requirements 7.5**

- [x] 7. Implement level progression system
  - [x] 7.1 Add level tracking and display
    - Track current level in game state
    - Track total asteroids collected across all levels
    - Display level in top-right corner of HUD
    - _Requirements: 5.1, 5.6, 6.2_

  - [x] 7.2 Implement level-up logic
    - Check if total asteroids collected reaches level threshold (50 per level)
    - Increment level when threshold reached
    - Display level-up notification on HUD
    - _Requirements: 5.2, 5.5_

  - [x] 7.3 Scale difficulty with level
    - Decrease asteroid spawn rate by 10% per level (min 800ms)
    - Decrease bug spawn rate by 15% per level (min 2000ms)
    - Increase bug speed by 10% per level (max 5 pixels/frame)
    - _Requirements: 3.6, 5.3, 5.4_

  - [ ]* 7.4 Write property test for difficulty scaling
    - **Property 11: Level Progression Increases Difficulty**
    - **Validates: Requirements 5.3, 5.4, 5.6**

- [ ] 8. Checkpoint - Verify level progression works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement lives and damage system
  - [x] 9.1 Add lives tracking and display
    - Add lives property to rocket state (start with 3)
    - Display lives as hearts in top-center of HUD
    - _Requirements: 6.3_

  - [x] 9.2 Implement damage on bug collision
    - Detect collision between rocket and bugs
    - Decrease lives by 1 on collision
    - Remove bug on collision
    - Add visual feedback (screen shake, flash)
    - _Requirements: 3.4, 7.4_

  - [ ]* 9.3 Write property test for damage application
    - **Property 9: Lives Decrease on Bug Collision**
    - **Validates: Requirements 3.4, 7.4**

  - [x] 9.4 Implement game over condition
    - Check if lives reach 0
    - Transition to game over state
    - Stop all game updates (spawns, movement, collisions)
    - Display game over screen with final score
    - Display educational message about balancing features and bugs
    - _Requirements: 10.3, 8.6_

  - [ ]* 9.5 Write property test for game over trigger
    - **Property 12: Game Over When Lives Reach Zero**
    - **Validates: Requirements 10.3**

- [x] 10. Implement pause and reset functionality
  - [x] 10.1 Add pause controls
    - Listen for ESC key press
    - Toggle isPaused state
    - Display pause menu with continue/restart options
    - Stop game updates when paused
    - _Requirements: 10.1, 10.2_

  - [ ]* 10.2 Write property test for pause behavior
    - **Property 13: Pause Stops Game Updates**
    - **Validates: Requirements 10.1, 10.2**

  - [x] 10.3 Implement reset functionality
    - Reset all counters (resources, level, lives, score)
    - Clear all arrays (bullets, asteroids, bugs, structures)
    - Reset rocket position
    - Restore initial game state
    - _Requirements: 10.6_

  - [ ]* 10.4 Write property test for reset
    - **Property 20: Reset Restores Initial State**
    - **Validates: Requirements 10.6**

- [x] 11. Implement high score persistence
  - [x] 11.1 Add score tracking
    - Increment score for each asteroid destroyed
    - Increment score for each bug destroyed
    - Display current score in HUD
    - _Requirements: 6.2_

  - [x] 11.2 Implement localStorage persistence
    - Load high score from localStorage on mount
    - Display high score in HUD
    - Save new high score to localStorage on game over if score is higher
    - _Requirements: 10.4, 10.5_

  - [ ]* 11.3 Write property test for high score persistence
    - **Property 14: High Score Persists**
    - **Validates: Requirements 10.4, 10.5**

- [x] 12. Checkpoint - Verify game lifecycle works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Polish collision detection and physics
  - [x] 13.1 Refine collision detection
    - Ensure collision detection is symmetric
    - Add collision detection for all entity pairs
    - Optimize with spatial partitioning if needed
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ]* 13.2 Write property test for collision symmetry
    - **Property 6: Collision Detection is Symmetric**
    - **Validates: Requirements 7.1**

  - [x] 13.3 Implement bug movement toward rocket
    - Calculate vector from bug to rocket
    - Normalize and apply to bug velocity
    - Update bug position each frame
    - _Requirements: 3.2_

  - [ ]* 13.4 Write property test for bug movement
    - **Property 8: Bug Movement Toward Rocket**
    - **Validates: Requirements 3.2**

  - [x] 13.5 Add boundary constraints
    - Ensure rocket stays within canvas bounds
    - Remove entities that move off-screen
    - _Requirements: 1.4, 2.4, 9.4_

  - [ ]* 13.6 Write property test for boundary constraints
    - **Property 1: Rocket Movement Respects Boundaries**
    - **Validates: Requirements 1.1, 1.4**

  - [ ]* 13.7 Write property test for out-of-bounds cleanup
    - **Property 18: Out-of-Bounds Cleanup**
    - **Validates: Requirements 2.4, 9.4**

- [x] 14. Add responsive canvas and controls
  - [x] 14.1 Implement canvas resize handling
    - Listen for window resize events
    - Update canvas dimensions
    - Reposition rocket and HUD elements
    - _Requirements: 9.3_

  - [ ]* 14.2 Write property test for canvas resize
    - **Property 19: Canvas Resize Updates Dimensions**
    - **Validates: Requirements 9.3**

  - [x] 14.2 Ensure touch controls work properly
    - Verify existing touch controls still function
    - Adjust positioning if needed for new HUD elements
    - _Requirements: 1.3_

- [x] 15. Add welcome screen and tutorial
  - [x] 15.1 Create welcome screen
    - Display game title and metaphor explanation
    - Show controls (keyboard and touch)
    - Add "Start Game" button
    - _Requirements: 8.1_

  - [x] 15.2 Add in-game help
    - Add "?" button to show controls and metaphor explanation
    - Make it accessible during gameplay
    - _Requirements: 8.7_

- [x] 16. Final polish and testing
  - [x] 16.1 Add visual effects
    - Explosion particles on asteroid/bug destruction
    - Deploy animation for structures
    - Level-up animation
    - Damage flash effect
    - _Requirements: 9.1, 9.2, 9.5, 9.6_

  - [x] 16.2 Add notification system
    - Queue notifications for deploys, level-ups, damage
    - Display notifications with fade-in/fade-out
    - Auto-dismiss after duration
    - _Requirements: 4.7, 5.5, 6.7_

  - [ ]* 16.3 Write integration tests
    - Test complete game loop from start to game over
    - Test deploy system with actual resource collection
    - Test level progression with actual gameplay
    - _Requirements: All_

- [x] 17. Final checkpoint - Complete game verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The implementation builds incrementally on the existing rocket-ship.tsx component
- TypeScript is used throughout for type safety
- fast-check library will be used for property-based testing
