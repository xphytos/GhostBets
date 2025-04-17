
import { useEffect, useState } from 'react';
import { Game, BetLine } from '@/types/betting';
import { liveUpdateService } from '@/services/liveUpdateService';

interface UseLiveGameProps {
  gameId: string;
}

export function useLiveGame({ gameId }: UseLiveGameProps) {
  const [game, setGame] = useState<Game | undefined>(
    liveUpdateService.getGameById(gameId)
  );
  const [isLive, setIsLive] = useState<boolean>(
    game?.status === 'live'
  );

  useEffect(() => {
    // Start the update service only if needed
    if (!gameId) return;
    
    liveUpdateService.startUpdates();

    // Subscribe to updates for this specific game only
    const unsubscribe = liveUpdateService.subscribeToGame(gameId, (id, updatedGame) => {
      setGame(updatedGame);
      setIsLive(updatedGame.status === 'live');
    });

    // Cleanup subscription when component unmounts
    return () => {
      unsubscribe();
    };
  }, [gameId]);

  return { game, isLive };
}

interface UseLiveLinesProps {
  gameId: string;
}

export function useLiveLines({ gameId }: UseLiveLinesProps) {
  const [lines, setLines] = useState<BetLine[]>(
    liveUpdateService.getLinesForGame(gameId)
  );
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  useEffect(() => {
    // Start the update service only if needed
    if (!gameId) return;
    
    liveUpdateService.startUpdates();

    // Subscribe to line updates for this game
    const unsubscribe = liveUpdateService.subscribeToLines(gameId, (id, updatedLines) => {
      setLines(updatedLines);
      setLastUpdate(new Date().toISOString());
    });

    // Cleanup subscription
    return () => {
      unsubscribe();
    };
  }, [gameId]);

  return { lines, lastUpdate };
}

// Hook to watch all live games - only use when really needed
export function useLiveGames() {
  const [liveGames, setLiveGames] = useState<Game[]>(
    liveUpdateService.getActiveGames().filter(game => game.status === 'live')
  );

  useEffect(() => {
    // Start the update service
    liveUpdateService.startUpdates();

    // Subscribe to all updates
    const unsubscribe = liveUpdateService.subscribe((type, data) => {
      if (type === 'scores' || type === 'status') {
        // When any game is updated, refresh the list of live games
        setLiveGames(liveUpdateService.getActiveGames().filter(game => game.status === 'live'));
      }
    });

    // Cleanup subscription
    return () => {
      unsubscribe();
    };
  }, []);

  return { liveGames };
}

// Cleanup function to stop updates when app unmounts
export function stopLiveUpdates() {
  liveUpdateService.stopUpdates();
}
