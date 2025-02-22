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

export default function TabLayout() {
  const colorScheme = useColorScheme();

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
    <></>
  ) : !workout ? (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
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
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />
      {/* icon on the bottom bar for workout page */}
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
        name="new-template"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profiles/[id]"
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
    </Tabs>
  ) : (
    <Redirect href="/live-workout" />
  );
}
