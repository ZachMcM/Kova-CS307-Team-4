import { VStack } from '@/components/ui/vstack';
import { ScrollView } from 'react-native';
import StaticContainer from "@/components/StaticContainer";
import SettingsCard from "@/components/SettingsCard";
import { HStack } from '@/components/ui/hstack';
import { Button, ButtonText } from "@/components/ui/button";
import { useRouter } from "expo-router";
import { Icon, ChevronLeftIcon } from '@/components/ui/icon';
import { Heading } from "@/components/ui/heading";

export default function SettingsScreen() {
  const router = useRouter();

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
      attribute: "Social profile",
      type: "banner"
    },
    {
      attribute: "Display age",
      type: "privacy-tri",
      content: "false"
    },
    {
      attribute: "Display weight",
      type: "privacy-tri",
      content: "false"
    },
    {
      attribute: "Display bio",
      type: "privacy-tri",
      content: "false"
    },
  ];

  return (
    <StaticContainer className = "flex px-6 py-16">
      <VStack>
        <HStack space = "xl" className = "pb-4 mb-2 border-b">
          <Button
            variant = "outline"
            size = "lg"
            action = "primary"
            onPress={() => router.replace("/(tabs)/profile")}
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

