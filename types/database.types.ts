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
      eventWorkout: {
        Row: {
          created_at: string
          groupEventId: string
          id: string
          profileId: string
          workoutData: Json | null
        }
        Insert: {
          created_at?: string
          groupEventId?: string
          id?: string
          profileId: string
          workoutData?: Json | null
        }
        Update: {
          created_at?: string
          groupEventId?: string
          id?: string
          profileId?: string
          workoutData?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "eventWorkout_groupEventId_fkey"
            columns: ["groupEventId"]
            isOneToOne: false
            referencedRelation: "groupEvent"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventWorkout_profileId_fkey"
            columns: ["profileId"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise: {
        Row: {
          created_at: string
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      followingRel: {
        Row: {
          id: string
          sourceId: string
          targetId: string
        }
        Insert: {
          id?: string
          sourceId: string
          targetId: string
        }
        Update: {
          id?: string
          sourceId?: string
          targetId?: string
        }
        Relationships: [
          {
            foreignKeyName: "followingRel_sourceId_fkey"
            columns: ["sourceId"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["userId"]
          },
          {
            foreignKeyName: "followingRel_targetId_fkey"
            columns: ["targetId"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["userId"]
          },
        ]
      }
      group: {
        Row: {
          banner: string | null
          created_at: string
          description: string | null
          goal: string | null
          icon: string | null
          id: string
          title: string | null
        }
        Insert: {
          banner?: string | null
          created_at?: string
          description?: string | null
          goal?: string | null
          icon?: string | null
          id?: string
          title?: string | null
        }
        Update: {
          banner?: string | null
          created_at?: string
          description?: string | null
          goal?: string | null
          icon?: string | null
          id?: string
          title?: string | null
        }
        Relationships: []
      }
      groupEvent: {
        Row: {
          end_date: string | null
          exercise_points: Json | null
          goal: number | null
          groupId: string
          id: string
          rep_multiplier: number | null
          start_date: string
          title: string | null
          type: string | null
          weight_multiplier: number | null
        }
        Insert: {
          end_date?: string | null
          exercise_points?: Json | null
          goal?: number | null
          groupId: string
          id?: string
          rep_multiplier?: number | null
          start_date?: string
          title?: string | null
          type?: string | null
          weight_multiplier?: number | null
        }
        Update: {
          end_date?: string | null
          exercise_points?: Json | null
          goal?: number | null
          groupId?: string
          id?: string
          rep_multiplier?: number | null
          start_date?: string
          title?: string | null
          type?: string | null
          weight_multiplier?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "groupEvent_groupId_fkey"
            columns: ["groupId"]
            isOneToOne: false
            referencedRelation: "group"
            referencedColumns: ["id"]
          },
        ]
      }
      groupRel: {
        Row: {
          created_at: string
          groupId: string
          id: string
          profileId: string
          role: string | null
        }
        Insert: {
          created_at?: string
          groupId: string
          id?: string
          profileId: string
          role?: string | null
        }
        Update: {
          created_at?: string
          groupId?: string
          id?: string
          profileId?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "groupRel_groupId_fkey"
            columns: ["groupId"]
            isOneToOne: false
            referencedRelation: "group"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "groupRel_profileId_fkey"
            columns: ["profileId"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      likeRel: {
        Row: {
          id: string
          post_id: string
          user_id: string | null
        }
        Insert: {
          id?: string
          post_id: string
          user_id?: string | null
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "likeRel_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "post"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likeRel_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["userId"]
          },
        ]
      }
      post: {
        Row: {
          createdAt: string | null
          description: string | null
          id: string
          imageUrl: string | null
          isPublic: boolean | null
          location: string | null
          profileId: string
          taggedFriends: string[] | null
          title: string
          updatedAt: string | null
          workoutData: Json | null
        }
        Insert: {
          createdAt?: string | null
          description?: string | null
          id?: string
          imageUrl?: string | null
          isPublic?: boolean | null
          location?: string | null
          profileId: string
          taggedFriends?: string[] | null
          title: string
          updatedAt?: string | null
          workoutData?: Json | null
        }
        Update: {
          createdAt?: string | null
          description?: string | null
          id?: string
          imageUrl?: string | null
          isPublic?: boolean | null
          location?: string | null
          profileId?: string
          taggedFriends?: string[] | null
          title?: string
          updatedAt?: string | null
          workoutData?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "post_profileid_fkey"
            columns: ["profileId"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      profile: {
        Row: {
          achievement: string | null
          age: number | null
          avatar: string | null
          bio: string | null
          created_at: string
          followers: number
          following: number
          friends: number
          gender: string | null
          goal: string | null
          id: string
          location: string | null
          name: string
          private: Database["public"]["Enums"]["PRIVACY_TYPE"]
          userId: string
          username: string
        }
        Insert: {
          achievement?: string | null
          age?: number | null
          avatar?: string | null
          bio?: string | null
          created_at?: string
          followers?: number
          following?: number
          friends?: number
          gender?: string | null
          goal?: string | null
          id?: string
          location?: string | null
          name: string
          private?: Database["public"]["Enums"]["PRIVACY_TYPE"]
          userId: string
          username: string
        }
        Update: {
          achievement?: string | null
          age?: number | null
          avatar?: string | null
          bio?: string | null
          created_at?: string
          followers?: number
          following?: number
          friends?: number
          gender?: string | null
          goal?: string | null
          id?: string
          location?: string | null
          name?: string
          private?: Database["public"]["Enums"]["PRIVACY_TYPE"]
          userId?: string
          username?: string
        }
        Relationships: []
      }
      weight_entries: {
        Row: {
          id: string
          user_id: string
          weight: number
          unit: string
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          weight: number
          unit: string
          date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          weight?: number
          unit?: string
          date?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "weight_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["userId"]
          }
        ]
      }
      relTag: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          tag_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "RelTag_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercise"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "RelTag_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tag"
            referencedColumns: ["id"]
          },
        ]
      }
      tag: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      template: {
        Row: {
          created_at: string
          creatorProfileId: string
          data: Json | null
          id: string
          name: string | null
          profileId: string
        }
        Insert: {
          created_at?: string
          creatorProfileId: string
          data?: Json | null
          id?: string
          name?: string | null
          profileId: string
        }
        Update: {
          created_at?: string
          creatorProfileId?: string
          data?: Json | null
          id?: string
          name?: string | null
          profileId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Template_creatorUserId_fkey"
            columns: ["creatorProfileId"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Template_profileId_fkey"
            columns: ["profileId"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      weightEntries: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_followers: {
        Args: {
          user_id: string
        }
        Returns: undefined
      }
      decrement_following: {
        Args: {
          user_id: string
        }
        Returns: undefined
      }
      decrement_friends: {
        Args: {
          user_id: string
        }
        Returns: undefined
      }
      increment_followers: {
        Args: {
          user_id: string
        }
        Returns: undefined
      }
      increment_following: {
        Args: {
          user_id: string
        }
        Returns: undefined
      }
      increment_friends: {
        Args: {
          user_id: string
        }
        Returns: undefined
      }
      verify_user_password: {
        Args: {
          password: string
        }
        Returns: boolean
      }
    }
    Enums: {
      PRIVACY_TYPE: "PRIVATE" | "PUBLIC" | "FRIENDS"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
