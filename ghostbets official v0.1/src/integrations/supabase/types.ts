export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      api_cache: {
        Row: {
          cached_at: string
          data: Json
          key: string
        }
        Insert: {
          cached_at?: string
          data: Json
          key: string
        }
        Update: {
          cached_at?: string
          data?: Json
          key?: string
        }
        Relationships: []
      }
      bet_lines: {
        Row: {
          alternate_option: boolean | null
          away_odds: number | null
          boost: boolean | null
          boost_multiplier: number | null
          description: string | null
          draw_odds: number | null
          game_id: string
          home_odds: number | null
          id: string
          over_odds: number | null
          spread: number | null
          total: number | null
          type: string
          under_odds: number | null
          updated_at: string
        }
        Insert: {
          alternate_option?: boolean | null
          away_odds?: number | null
          boost?: boolean | null
          boost_multiplier?: number | null
          description?: string | null
          draw_odds?: number | null
          game_id: string
          home_odds?: number | null
          id: string
          over_odds?: number | null
          spread?: number | null
          total?: number | null
          type: string
          under_odds?: number | null
          updated_at?: string
        }
        Update: {
          alternate_option?: boolean | null
          away_odds?: number | null
          boost?: boolean | null
          boost_multiplier?: number | null
          description?: string | null
          draw_odds?: number | null
          game_id?: string
          home_odds?: number | null
          id?: string
          over_odds?: number | null
          spread?: number | null
          total?: number | null
          type?: string
          under_odds?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bet_lines_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      bets: {
        Row: {
          bet_type: string
          cashout_available: boolean | null
          cashout_value: number | null
          game_id: string
          id: string
          is_parlay: boolean | null
          odds: number
          parlay_id: string | null
          placed_at: string
          potential_winnings: number
          result: string | null
          score: Json | null
          selection: string
          settled_at: string | null
          stake: number
          status: string
          teams: Json | null
          user_id: string
        }
        Insert: {
          bet_type: string
          cashout_available?: boolean | null
          cashout_value?: number | null
          game_id: string
          id?: string
          is_parlay?: boolean | null
          odds: number
          parlay_id?: string | null
          placed_at?: string
          potential_winnings: number
          result?: string | null
          score?: Json | null
          selection: string
          settled_at?: string | null
          stake: number
          status?: string
          teams?: Json | null
          user_id: string
        }
        Update: {
          bet_type?: string
          cashout_available?: boolean | null
          cashout_value?: number | null
          game_id?: string
          id?: string
          is_parlay?: boolean | null
          odds?: number
          parlay_id?: string | null
          placed_at?: string
          potential_winnings?: number
          result?: string | null
          score?: Json | null
          selection?: string
          settled_at?: string | null
          stake?: number
          status?: string
          teams?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          attendance: number | null
          away_team: string
          broadcasters: string[] | null
          home_team: string
          id: string
          league_id: string
          location: string | null
          quarter: number | null
          score: Json | null
          start_time: string
          status: string
          time_remaining: string | null
          weather: Json | null
        }
        Insert: {
          attendance?: number | null
          away_team: string
          broadcasters?: string[] | null
          home_team: string
          id: string
          league_id: string
          location?: string | null
          quarter?: number | null
          score?: Json | null
          start_time: string
          status?: string
          time_remaining?: string | null
          weather?: Json | null
        }
        Update: {
          attendance?: number | null
          away_team?: string
          broadcasters?: string[] | null
          home_team?: string
          id?: string
          league_id?: string
          location?: string | null
          quarter?: number | null
          score?: Json | null
          start_time?: string
          status?: string
          time_remaining?: string | null
          weather?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "games_away_team_fkey"
            columns: ["away_team"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_home_team_fkey"
            columns: ["home_team"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      leagues: {
        Row: {
          active: boolean | null
          country: string | null
          featured: boolean | null
          icon: string | null
          id: string
          logo: string | null
          name: string
          sport_type: string
        }
        Insert: {
          active?: boolean | null
          country?: string | null
          featured?: boolean | null
          icon?: string | null
          id: string
          logo?: string | null
          name: string
          sport_type: string
        }
        Update: {
          active?: boolean | null
          country?: string | null
          featured?: boolean | null
          icon?: string | null
          id?: string
          logo?: string | null
          name?: string
          sport_type?: string
        }
        Relationships: []
      }
      parlay_bets: {
        Row: {
          id: string
          placed_at: string
          potential_winnings: number
          result: string | null
          settled_at: string | null
          stake: number
          status: string
          total_odds: number
          user_id: string
        }
        Insert: {
          id?: string
          placed_at?: string
          potential_winnings: number
          result?: string | null
          settled_at?: string | null
          stake: number
          status?: string
          total_odds: number
          user_id: string
        }
        Update: {
          id?: string
          placed_at?: string
          potential_winnings?: number
          result?: string | null
          settled_at?: string | null
          stake?: number
          status?: string
          total_odds?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parlay_bets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          balance: number
          created_at: string
          id: string
          last_reward_claim: string | null
          streak_days: number | null
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          balance?: number
          created_at?: string
          id: string
          last_reward_claim?: string | null
          streak_days?: number | null
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          balance?: number
          created_at?: string
          id?: string
          last_reward_claim?: string | null
          streak_days?: number | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          abbreviation: string
          color_main: string | null
          color_secondary: string | null
          id: string
          league_id: string
          location: string | null
          logo: string | null
          mascot: string | null
          name: string
          record: string | null
          stats: Json | null
        }
        Insert: {
          abbreviation: string
          color_main?: string | null
          color_secondary?: string | null
          id: string
          league_id: string
          location?: string | null
          logo?: string | null
          mascot?: string | null
          name: string
          record?: string | null
          stats?: Json | null
        }
        Update: {
          abbreviation?: string
          color_main?: string | null
          color_secondary?: string | null
          id?: string
          league_id?: string
          location?: string | null
          logo?: string | null
          mascot?: string | null
          name?: string
          record?: string | null
          stats?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string | null
          email_notifications: boolean | null
          id: string
          push_notifications: boolean | null
          sms_notifications: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
