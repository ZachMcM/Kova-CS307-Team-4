import { VStack } from '@/components/ui/vstack';
import { ScrollView } from 'react-native';
import StaticContainer from "@/components/StaticContainer";
import SettingsCard from "@/components/SettingsCard";
import { HStack } from '@/components/ui/hstack';
import { Button, ButtonText } from "@/components/ui/button";
import { useRouter } from "expo-router";
import { Icon, ChevronLeftIcon } from '@/components/ui/icon';
import { Heading } from "@/components/ui/heading";
import { useState, useEffect } from "react";
import { supabase } from '@/lib/supabase';
import ExerciseSearchView from '@/components/search-views/ExerciseSearchView';

export default function SettingsScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  const settingsData = [
    {
      attribute: "Account",
      type: "banner"
    },
    {
      attribute: "Change email",
      type: "redirect",
      content: "/profile"
    },
    {
      attribute: "Change password",
      type: "redirect",
      content: "/profile"
    },
    {
      attribute: "Change username",
      type: "redirect",
      content: "/app/(tabs)/profile"
    },
    {
      attribute: "Debug: Unit Testing",
      type: "banner"
    },
    {
      attribute: "Unit testing page",
      type: "redirect",
      content: "/app/unit-tests"
    }
  ];

  useEffect(() => {
      const fetchUserId = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUserId(session.user.id);
        }
      };
  
      fetchUserId();
    }, []);

  return (
    <StaticContainer className = "flex px-6 py-16">
      <VStack>
        <HStack space = "xl" className = "pb-4 mb-2 border-b">
          <Button
            variant = "outline"
            size = "lg"
            action = "primary"
            onPress={() => router.replace(`/(tabs)/profiles/${userId}`)}
            // onPress={() => router.replace({
            //   pathname: "/(tabs)/profiles/[id]",
            //   params: { id: userId! }
            // })}
            className = "p-3"
          >
            <Icon as={ChevronLeftIcon} className = "m-0"></Icon>
          </Button>
          <Heading size = "2xl" className = "mt-1 ml-16 pl-2">Settings</Heading>
        </HStack>
        <ScrollView>
          <VStack>
            {settingsData.map((setting) => (
              <SettingsCard key={setting.attribute} setting={setting}></SettingsCard>
            ))}
          </VStack>
        </ScrollView>
      </VStack>
    </StaticContainer>
  );
}

