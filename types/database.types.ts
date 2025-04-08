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
      comment: {
        Row: {
          content: string | null
          created_at: string
          id: string
          postId: string
          userId: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          postId: string
          userId: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          postId?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_postId_fkey"
            columns: ["postId"]
            isOneToOne: false
            referencedRelation: "post"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["userId"]
          },
        ]
      }
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
      favoriteRel: {
        Row: {
          created_at: string
          exerciseId: string
          id: string
          profileId: string
        }
        Insert: {
          created_at?: string
          exerciseId: string
          id?: string
          profileId: string
        }
        Update: {
          created_at?: string
          exerciseId?: string
          id?: string
          profileId?: string
        }
        Relationships: [
          {
            foreignKeyName: "favoriteRel_exerciseId_fkey"
            columns: ["exerciseId"]
            isOneToOne: true
            referencedRelation: "exercise"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favoriteRel_profileId_fkey"
            columns: ["profileId"]
            isOneToOne: true
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
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
          comments: number
          createdAt: string | null
          description: string | null
          id: string
          images: string[] | null
          imageUrl: string | null
          location: string | null
          privacy: Database["public"]["Enums"]["POST_PRIVACY_TYPE"]
          profileId: string
          taggedFriends: string[] | null
          template_id: string | null
          title: string
          updatedAt: string | null
          weighIn: number | null
          workoutData: Json | null
        }
        Insert: {
          comments?: number
          createdAt?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          imageUrl?: string | null
          location?: string | null
          privacy?: Database["public"]["Enums"]["POST_PRIVACY_TYPE"]
          profileId: string
          taggedFriends?: string[] | null
          template_id?: string | null
          title: string
          updatedAt?: string | null
          weighIn?: number | null
          workoutData?: Json | null
        }
        Update: {
          comments?: number
          createdAt?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          imageUrl?: string | null
          location?: string | null
          privacy?: Database["public"]["Enums"]["POST_PRIVACY_TYPE"]
          profileId?: string
          taggedFriends?: string[] | null
          template_id?: string | null
          title?: string
          updatedAt?: string | null
          weighIn?: number | null
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
          {
            foreignKeyName: "post_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "template"
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
          privacy_settings: Json
          private: Database["public"]["Enums"]["PRIVACY_TYPE"]
          userId: string
          username: string
          weight: number | null
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
          privacy_settings?: Json
          private?: Database["public"]["Enums"]["PRIVACY_TYPE"]
          userId: string
          username: string
          weight?: number | null
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
          privacy_settings?: Json
          private?: Database["public"]["Enums"]["PRIVACY_TYPE"]
          userId?: string
          username?: string
          weight?: number | null
        }
        Relationships: []
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
          originalTemplateId: string | null
          profileId: string
        }
        Insert: {
          created_at?: string
          creatorProfileId: string
          data?: Json | null
          id?: string
          name?: string | null
          originalTemplateId?: string | null
          profileId: string
        }
        Update: {
          created_at?: string
          creatorProfileId?: string
          data?: Json | null
          id?: string
          name?: string | null
          originalTemplateId?: string | null
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
            foreignKeyName: "template_originalTemplateId_fkey"
            columns: ["originalTemplateId"]
            isOneToOne: false
            referencedRelation: "template"
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
      weight_entries: {
        Row: {
          created_at: string
          date: string
          id: string
          unit: string
          updated_at: string
          user_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          unit: string
          updated_at?: string
          user_id: string
          weight: number
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          unit?: string
          updated_at?: string
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_followers: {
        Args: { user_id: string }
        Returns: undefined
      }
      decrement_following: {
        Args: { user_id: string }
        Returns: undefined
      }
      decrement_friends: {
        Args: { user_id: string }
        Returns: undefined
      }
      follow_user: {
        Args: { source_id: string; target_id: string }
        Returns: undefined
      }
      increment: {
        Args: { x: number; postid: string }
        Returns: number
      }
      increment_comments: {
        Args: { post_id: string }
        Returns: undefined
      }
      increment_followers: {
        Args: { user_id: string }
        Returns: undefined
      }
      increment_following: {
        Args: { user_id: string }
        Returns: undefined
      }
      increment_friends: {
        Args: { user_id: string }
        Returns: undefined
      }
      unfollow_user: {
        Args: { source_id: string; target_id: string }
        Returns: undefined
      }
      verify_user_password: {
        Args: { password: string }
        Returns: boolean
      }
    }
    Enums: {
      POST_PRIVACY_TYPE: "PRIVATE" | "PUBLIC" | "FRIENDS" | "FOLLOWERS"
      PRIVACY_TYPE: "PRIVATE" | "PUBLIC" | "FRIENDS"
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
    Enums: {
      POST_PRIVACY_TYPE: ["PRIVATE", "PUBLIC", "FRIENDS", "FOLLOWERS"],
      PRIVACY_TYPE: ["PRIVATE", "PUBLIC", "FRIENDS"],
    },
  },
} as const
