import { Game, BetLine, SportType } from '@/types/betting';
import { GAMES, BET_LINES } from '@/lib/api';

// Longer interval for updates to reduce API calls
const UPDATE_INTERVAL = 30000; // 30 seconds instead of 15

type UpdateListener = (type: 'odds' | 'scores' | 'status', data: any) => void;
type GameListener = (gameId: string, data: Game) => void;
type LineListener = (gameId: string, lines: BetLine[]) => void;

class LiveUpdateService {
  private listeners: UpdateListener[] = [];
  private gameListeners: GameListener[] = [];
  private lineListeners: LineListener[] = [];
  private updateInterval: NodeJS.Timeout | null = null;
  private activeGames: Map<string, Game> = new Map();
  private activeLines: Map<string, BetLine[]> = new Map();
  private isActive: boolean = false;

  constructor() {
    // Initialize with current data after a short delay to allow GAMES to be populated
    setTimeout(() => {
      // Only initialize if we have games data
      if (GAMES && GAMES.length > 0) {
        GAMES.forEach(game => {
          if (game.status === 'live' || game.status === 'scheduled') {
            this.activeGames.set(game.id, { ...game });
          }
        });

        // Group bet lines by game if we have them
        if (BET_LINES && BET_LINES.length > 0) {
          const linesByGame = BET_LINES.reduce((acc, line) => {
            if (!acc[line.gameId]) {
              acc[line.gameId] = [];
            }
            acc[line.gameId].push({ ...line });
            return acc;
          }, {} as Record<string, BetLine[]>);

          // Set active lines
          Object.entries(linesByGame).forEach(([gameId, lines]) => {
            this.activeLines.set(gameId, lines);
          });
        }
      }
    }, 1000);
  }

  public startUpdates(): void {
    // Only start if not already active
    if (this.updateInterval || this.isActive) return;
    
    this.isActive = true;
    this.updateInterval = setInterval(() => {
      // Only simulate updates if we have subscribers to avoid unnecessary work
      if (this.hasSubscribers()) {
        this.simulateUpdates();
      }
    }, UPDATE_INTERVAL);

    console.log('Live update service started');
  }

  private hasSubscribers(): boolean {
    return this.listeners.length > 0 || 
           this.gameListeners.length > 0 || 
           this.lineListeners.length > 0;
  }

  public stopUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      this.isActive = false;
      console.log('Live update service stopped');
    }
  }

  public subscribe(listener: UpdateListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
      // Stop the service if no more subscribers
      if (!this.hasSubscribers()) {
        this.stopUpdates();
      }
    };
  }

  public subscribeToGame(gameId: string, listener: GameListener): () => void {
    const wrappedListener = (id: string, data: Game) => {
      if (id === gameId) {
        listener(id, data);
      }
    };
    
    this.gameListeners.push(wrappedListener);
    
    return () => {
      this.gameListeners = this.gameListeners.filter(l => l !== wrappedListener);
      // Stop the service if no more subscribers
      if (!this.hasSubscribers()) {
        this.stopUpdates();
      }
    };
  }

  public subscribeToLines(gameId: string, listener: LineListener): () => void {
    const wrappedListener = (id: string, data: BetLine[]) => {
      if (id === gameId) {
        listener(id, data);
      }
    };
    
    this.lineListeners.push(wrappedListener);
    
    return () => {
      this.lineListeners = this.lineListeners.filter(l => l !== wrappedListener);
      // Stop the service if no more subscribers
      if (!this.hasSubscribers()) {
        this.stopUpdates();
      }
    };
  }

  private simulateUpdates(): void {
    // Update a smaller random subset of active games (20% instead of 30%)
    const gameUpdates: Game[] = [];
    const lineUpdates: { gameId: string, lines: BetLine[] }[] = [];

    this.activeGames.forEach((game, gameId) => {
      // 20% chance of updating a game's data instead of 30%
      if (Math.random() < 0.2) {
        const updatedGame = this.simulateGameUpdate(game);
        this.activeGames.set(gameId, updatedGame);
        gameUpdates.push(updatedGame);

        // Also update associated lines (30% chance instead of 50%)
        if (Math.random() < 0.3 && this.activeLines.has(gameId)) {
          const updatedLines = this.simulateLineUpdates(this.activeLines.get(gameId) || []);
          this.activeLines.set(gameId, updatedLines);
          lineUpdates.push({ gameId, lines: updatedLines });
        }
      }
    });

    // Only notify listeners if there are actual updates
    if (gameUpdates.length > 0) {
      // Batch updates for each listener to reduce callbacks
      this.gameListeners.forEach(listener => {
        gameUpdates.forEach(game => listener(game.id, game));
      });
      
      this.listeners.forEach(listener => {
        listener('scores', { games: gameUpdates });
      });
    }

    if (lineUpdates.length > 0) {
      // Batch updates for each listener to reduce callbacks
      this.lineListeners.forEach(listener => {
        lineUpdates.forEach(update => listener(update.gameId, update.lines));
      });
      
      this.listeners.forEach(listener => {
        listener('odds', { updates: lineUpdates });
      });
    }

    if (gameUpdates.length > 0 || lineUpdates.length > 0) {
      console.log(`Updated ${gameUpdates.length} games and ${lineUpdates.length} line sets`);
    }
  }

  private simulateGameUpdate(game: Game): Game {
    const updatedGame = { ...game };

    // If game is live, update scores
    if (game.status === 'live') {
      // Initialize score if not exists
      if (!updatedGame.score) {
        updatedGame.score = { home: 0, away: 0 };
      }

      // 40% chance to update home score
      if (Math.random() < 0.4) {
        updatedGame.score.home += 1;
      }

      // 40% chance to update away score
      if (Math.random() < 0.4) {
        updatedGame.score.away += 1;
      }

      // Update quarter/period/time
      if (updatedGame.quarter !== undefined) {
        // 10% chance to advance quarter
        if (Math.random() < 0.1 && updatedGame.quarter < 4) {
          updatedGame.quarter += 1;
        }
      } else {
        updatedGame.quarter = 1;
      }

      // Update time remaining
      const minutes = Math.floor(Math.random() * 15);
      const seconds = Math.floor(Math.random() * 60);
      updatedGame.timeRemaining = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    // If game is scheduled and about to start
    else if (game.status === 'scheduled') {
      const startTime = new Date(game.startTime);
      const now = new Date();
      
      // If start time is within 5 minutes of now, 20% chance to make it live
      if (Math.abs(startTime.getTime() - now.getTime()) < 5 * 60 * 1000 && Math.random() < 0.2) {
        updatedGame.status = 'live';
        updatedGame.score = { home: 0, away: 0 };
        updatedGame.quarter = 1;
        updatedGame.timeRemaining = '15:00';
      }
    }

    return updatedGame;
  }

  private simulateLineUpdates(lines: BetLine[]): BetLine[] {
    return lines.map(line => {
      const updatedLine = { ...line };
      
      // Update odds based on bet type
      switch (line.type) {
        case 'moneyline':
          // 50% chance to adjust moneyline odds
          if (Math.random() < 0.5 && updatedLine.homeOdds !== undefined) {
            updatedLine.homeOdds = this.adjustOdds(updatedLine.homeOdds);
          }
          if (Math.random() < 0.5 && updatedLine.awayOdds !== undefined) {
            updatedLine.awayOdds = this.adjustOdds(updatedLine.awayOdds);
          }
          break;
        
        case 'spreads':
          // 40% chance to adjust spread odds
          if (Math.random() < 0.4 && updatedLine.homeSpreadOdds !== undefined) {
            updatedLine.homeSpreadOdds = this.adjustOdds(updatedLine.homeSpreadOdds);
          }
          if (Math.random() < 0.4 && updatedLine.awaySpreadOdds !== undefined) {
            updatedLine.awaySpreadOdds = this.adjustOdds(updatedLine.awaySpreadOdds);
          }
          // 20% chance to adjust the spread value
          if (Math.random() < 0.2 && updatedLine.homeSpread !== undefined) {
            const adjustment = Math.random() < 0.5 ? 0.5 : -0.5;
            updatedLine.homeSpread += adjustment;
            if (updatedLine.awaySpread !== undefined) {
              updatedLine.awaySpread = -updatedLine.homeSpread;
            }
          }
          break;
        
        case 'totals':
          // 40% chance to adjust total odds
          if (Math.random() < 0.4 && updatedLine.overOdds !== undefined) {
            updatedLine.overOdds = this.adjustOdds(updatedLine.overOdds);
          }
          if (Math.random() < 0.4 && updatedLine.underOdds !== undefined) {
            updatedLine.underOdds = this.adjustOdds(updatedLine.underOdds);
          }
          // 15% chance to adjust the total value
          if (Math.random() < 0.15 && updatedLine.total !== undefined) {
            const adjustment = Math.random() < 0.5 ? 0.5 : -0.5;
            updatedLine.total += adjustment;
          }
          break;
      }
      
      updatedLine.updatedAt = new Date().toISOString();
      return updatedLine;
    });
  }

  private adjustOdds(currentOdds: number): number {
    // Get a random adjustment between -10 and +10
    const adjustment = Math.floor(Math.random() * 21) - 10;
    return currentOdds + adjustment;
  }

  // Methods to get current data
  public getActiveGames(): Game[] {
    return Array.from(this.activeGames.values());
  }

  public getGameById(gameId: string): Game | undefined {
    return this.activeGames.get(gameId);
  }

  public getLinesForGame(gameId: string): BetLine[] {
    return this.activeLines.get(gameId) || [];
  }
}

// Create singleton instance
export const liveUpdateService = new LiveUpdateService();
