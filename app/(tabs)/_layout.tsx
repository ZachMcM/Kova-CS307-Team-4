import { Redirect, Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

// barbell icon
import { getWorkout } from "@/services/asyncStorageServices";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useSession } from "@/components/SessionContext";
import { Spinner } from "@/components/ui/spinner";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const { session } = useSession()

  // TODO @IanBruch do a very similar thing but with session, the session ternary should wrap the live workout ternary
  const { data: workout, isPending } = useQuery({
    queryFn: async () => {
      const workout = await getWorkout();
      return workout;
    },
    queryKey: ["live-workout"],
  });

  return isPending ? (
    // TODO need to figure out what loading state to show
    <Spinner/>
  ) : !workout ? (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        sceneStyle: {
          backgroundColor: Colors[colorScheme ?? "light"].background,
        },
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="groups"
        options={{
          title: 'Groups',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.3.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: "Feed",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: 'Post',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="plus" color={color} />,
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: "Workout",
          tabBarIcon: ({ color }) => (
            <Ionicons name="barbell" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profiles/[id]"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
          href: session?.user.id ? `/profiles/${session?.user.id}` : undefined,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null, // Hide from navigation
        }}
      />
      <Tabs.Screen
        name="new-template"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="templates/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="relations/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  ) : (
    <Redirect href="/live-workout" />
  );
}
