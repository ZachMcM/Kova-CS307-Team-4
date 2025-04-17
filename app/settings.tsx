import { VStack } from '@/components/ui/vstack';
import { ScrollView } from 'react-native';
import StaticContainer from "@/components/StaticContainer";
import SettingsCard from "@/components/SettingsCard";
import { HStack } from '@/components/ui/hstack';
import { Button, ButtonText } from "@/components/ui/button";
import { useRouter } from "expo-router";
import { Icon, ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/icon';
import { Heading } from "@/components/ui/heading";
import { useState, useEffect } from "react";
import { supabase } from '@/lib/supabase';
import { useToast } from "@/components/ui/toast";
import { showErrorToast } from "@/services/toastServices";
import { useSession } from "@/components/SessionContext";

export default function SettingsScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  const toast = useToast();

  const { signOutUser, sessionLoading, setSessionLoading, session } = useSession();

  const settingsData = [
    {
      attribute: "Account",
      type: "banner"
    },
    {
      attribute: "Change email",
      type: "redirect",
      content: "/change-email"
    },
    {
      attribute: "Change password",
      type: "redirect",
      content: "/change-password"
    },
    {
      attribute: "Change username",
      type: "redirect",
      content: "/change-username"
    },
    {
      attribute: "Delete Account",
      type: "redirect",
      content: "/delete-account"
    },
    {
      attribute: "Debug: Unit Testing",
      type: "banner"
    },
    {
      attribute: "Unit testing page",
      type: "redirect",
      content: "/unit-tests"
    },
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

  const handleLogout = () => {
    setSessionLoading(true);
    signOutUser()
      .then(() => {
        router.replace("/login");
        setSessionLoading(false)
      })
      .catch((error) => {
        console.log(error);
        setSessionLoading(false)
        showErrorToast(toast, error.message);
      });
  };

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
        <ScrollView className = "h-screen">
          <VStack>
          <Button onPress={handleLogout} className = "mt-6 mb-3" action="kova">
            <ButtonText className="text-white" size = "xl">Logout</ButtonText>
            <Icon as={ChevronRightIcon} className = "m-0" color='white' size='xl'></Icon>
          </Button>
            {settingsData.map((setting) => (
              <SettingsCard key={setting.attribute} setting={setting}></SettingsCard>
            ))}
          <Button onPress={() => {router.replace("/delete-account")}} className = "mt-6 mb-3 bg-red-500">
            <ButtonText className="text-white" size = "xl">Delete Account</ButtonText>
          </Button>
          </VStack>
        </ScrollView>
      </VStack>
    </StaticContainer>
  );
}

