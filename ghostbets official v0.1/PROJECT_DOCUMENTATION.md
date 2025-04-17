
# Complete Project Documentation

## Project Overview
This is a sports betting application that allows users to view sports games, place bets, track their betting history, and interact with live games. The application uses React for the frontend and Supabase for the backend services including authentication, database, and edge functions.

## Project Structure

### Core Files

#### src/main.tsx
The entry point of the application that renders the App component to the DOM.

#### src/App.tsx
The main App component that sets up routing, authentication context, and global providers.

#### src/index.css
Global styles for the application using Tailwind CSS.

### Components Structure

#### UI Components (src/components/ui/*)
Reusable UI components based on Shadcn/UI library for consistent design.

#### Layout Components (src/components/layout/*)
Components that handle the overall layout of the application including navigation, sidebars, and footers.

#### Sportsbook Components (src/components/sportsbook/*)
Components specifically for the sportsbook functionality including game cards, bet slips, and live updates.

### Pages
Page-level components that represent different routes in the application.

### Hooks
Custom React hooks for shared logic across components.

### Context
React context providers for state management across the application including authentication, betting, and notifications.

### Lib
Utility functions, API clients, and service modules.

### Types
TypeScript type definitions for the application.

### Integrations
Integration with external services like Supabase.

### Supabase
Edge functions and configuration for Supabase.

## Detailed File Breakdown

### src/components/sportsbook/GameCard.tsx
This component displays information about a sports game including the teams, odds, and betting options.

- **Imports**: Imports necessary components, icons, and types
- **Interface**: Defines the props for the component
- **Component Implementation**: 
  - Formats game date and time
  - Fetches betting lines for the game
  - Extracts betting data (spreads, moneyline, totals)
  - Formats odds and spreads for display
  - Handles bet clicks by creating a bet object and adding it to the bet slip
  - Calculates potential winnings based on odds and stake
  - Renders the card with game information, betting options, and game details

### src/components/sportsbook/LiveGameCard.tsx
Similar to GameCard but specifically for live games with additional real-time updates.

- **Imports**: Imports necessary components, hooks, and types
- **Interface**: Defines the props for the component
- **Component Implementation**:
  - Uses the useLiveGame hook to get real-time game data
  - Fetches betting lines for the game
  - Formats game date, odds, and spreads
  - Handles bet clicks
  - Renders a card with live game information, scores, betting options, and team details
  - Includes visual indicators for live games

### src/components/sportsbook/LiveGamesSection.tsx
A section component that displays all currently live games.

- **Uses useLiveGames hook** to fetch and display live games
- **Renders LiveGameCard components** for each live game
- **Provides fallback UI** when no live games are available

### src/components/sportsbook/SportsNavigation.tsx
Navigation component for selecting different sports.

- **Maps sports to icons and display names**
- **Provides tab navigation** for switching between sports
- **Exports sportLabels and sportEmojis** for use in other components

### src/components/sportsbook/SportsbookLeagues.tsx
Component for displaying leagues for a selected sport.

- **Fetches leagues for the selected sport**
- **Renders an accordion of leagues**
- **Displays games for each league** when expanded
- **Shows alerts about betting restrictions**

### src/lib/betting/games.ts
Functions for fetching and managing game data.

- **Helper functions** for generating random dates and times
- **Functions to map data** from the database to the application's types
- **fetchGamesByLeague function** to get games for a specific league
- **API integration** with external sports data providers

### src/lib/betting/leagues.ts
Functions for fetching and managing league data.

- **fetchAllLeagues function** to get all available leagues
- **fetchLeaguesBySport function** to get leagues for a specific sport
- **Sample league data** for when API data is unavailable
- **Helper function** to determine sport type from league ID

### src/lib/betting/user-bets.ts
Functions for managing user bets.

- **getUserBalance function** to get the user's current balance
- **ensureUserProfileExists function** to create a profile if needed
- **fetchUserBets function** to get a user's betting history
- **placeBet function** to place a new bet and update the user's balance

### src/lib/rewards/reward-transactions.ts
Functions for managing user rewards.

- **logRewardTransaction function** to record reward transactions
- **claimDailyReward function** to handle daily rewards and streak bonuses
- **Balance calculation and updates**

### src/lib/supabase.ts
Configuration for the Supabase client.

- **Creates and exports the Supabase client**
- **Configures authentication options**

### src/lib/utils.ts
Utility functions used throughout the application.

- **cn function** for conditional class names with Tailwind
- **formatOdds function** for consistent odds formatting
- **formatCurrency function** for monetary values
- **formatTimeRemaining function** for displaying time

### src/lib/api.ts
Functions for interacting with various APIs.

- **fetchGamesByLeague function** to get games for a specific league
- **fetchFeaturedLeagues function** to get featured leagues
- **fetchLiveGames function** to get currently live games
- **fetchGamesBySport function** to get games for a specific sport
- **fetchLeaguesBySport function** to get leagues for a specific sport
- **fetchAllLeagues function** to get all leagues
- **fetchBettingLines function** to get betting odds
- **fetchUserBets function** to get a user's betting history
- **placeBet function** to place a new bet
- **getUserBalance function** to get the user's current balance
- **Data caching for performance**

### src/lib/odds-api/client.ts
Client for interacting with the odds API.

- **Validation functions** for API responses
- **fetchOddsData function** to get odds data from the API
- **Fallback sample data** for when the API is unavailable
- **preloadOddsData and refreshOddsData functions** for caching

### src/lib/espn-api/client.ts
Client for interacting with the ESPN API.

- **Interface definitions** for API requests
- **Mappings for supported sports and leagues**
- **getESPNData function** for making API requests
- **getESPNLeagues function** to get leagues from ESPN
- **getESPNGames function** to get games from ESPN
- **generateESPNBetLines function** to generate betting lines

### src/pages/EnhancedSportsbookPage.tsx
The main page for the sportsbook functionality.

- **Uses context providers** for betting functionality
- **Manages state** for current sport, drawer visibility, and active tab
- **Renders sports navigation, game listings, and live games**
- **Includes bet slip drawer** for viewing and managing bets

### src/integrations/supabase/client.ts
Supabase client configuration for the application.

- **Creates and exports the Supabase client**
- **Sets up authentication configuration**

### src/context/EnhancedBettingContext.tsx
Context provider for enhanced betting functionality.

- **Manages state** for bet slip and betting history
- **Provides functions** for adding to bet slip, removing from bet slip, clearing bet slip
- **Handles bet placement** and updates user balance

### src/context/AuthContext.tsx
Context provider for authentication functionality.

- **Manages user state** and authentication status
- **Provides login, logout, and signup functions**
- **Handles session persistence**

### src/hooks/useLiveUpdates.ts
Hook for managing real-time updates for live games.

- **Subscribes to live game updates**
- **Manages state for live games and updates**
- **Provides functions for getting live game data**

## Database Schema

### profiles
User profile information including balance and streak data.

### bets
Records of user bets including game, type, odds, stake, and result.

### games
Information about sports games including teams, start time, and status.

### leagues
Information about sports leagues including name, sport type, and status.

### bet_lines
Betting odds and lines for games.

## Edge Functions

### refresh-odds-data
Refreshes odds data from external APIs and caches it in the database.

### fetch-espn-api
Fetches data from the ESPN API and caches it in the database.
