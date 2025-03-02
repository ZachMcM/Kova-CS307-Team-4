import StaticContainer from "@/components/StaticContainer";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from '@/components/ui/vstack';
import { HStack } from "@/components/ui/hstack";
import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Icon, MenuIcon } from "@/components/ui/icon";
import { useRouter } from "expo-router";
import { getProfile } from "@/services/profileServices";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { Spinner } from "@/components/ui/spinner";
import { isPublicProfile } from "@/types/profile-types";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function ProfileScreen() {

  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  console.log("profiles/[id].tsx: Fetching profile with id: " + id);

  const { data: profile, isPending } = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      const profile = (await getProfile(id as string) || null);
      console.log(JSON.stringify(profile));
      return profile;
    },
  });
  
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
      <VStack space = "md">
        <Box className = "border-b border-gray-300 pb-2">
          {isPending ? (
            <Spinner />
          )
          : profile && (
          <VStack space = "lg">
            <HStack space = "md">
              <Avatar className="bg-indigo-600 mt-1" size = "xl">
                <AvatarFallbackText className="text-white">{profile.name}</AvatarFallbackText>
              </Avatar>
              <VStack space = "xs">
                <VStack>
                  <Heading size="xl" className = "mb-0 h-8 w-56">{profile.name}</Heading>
                  <Text size="sm">@{profile.username}</Text>
                </VStack>
                <HStack space = "2xl">
                  <VStack>
                    <Heading size = "lg" className = "text-center">{profile.friends}</Heading>
                    <Text size = "sm" className = "text-center">friends</Text>
                  </VStack>
                  <VStack>
                    <Heading size = "lg" className = "text-center">{profile.followers}</Heading>
                    <Text size = "sm" className = "text-center">followers</Text>
                  </VStack>
                  <VStack>
                    <Heading size = "lg" className = "text-center">{profile.following}</Heading>
                    <Text size = "sm" className = "text-center">following</Text>
                  </VStack>
                </HStack>
              </VStack>
              <Button onPress={() => router.replace("/profiles/b0d0be17-f0dd-41e5-bc61-049c384b2374")} className = "w-0 h-0">
                <Icon as = {MenuIcon} size = "xl" className = "mt-8 ml-8 w-8 h-8"></Icon>
              </Button>
            </HStack>
            <VStack>
              { isPublicProfile(profile) && (profile.location || profile.goal || profile.bio) && (
                <Box className = "border border-gray-300 rounded p-2 mt-2">
                  { profile.location && (
                    <Heading size = "md">📍 {profile.location}</Heading>
                  )}
                  { profile.goal && (
                    <Heading size = "md">🎯 {profile.goal}</Heading>
                  )}
                  { profile.bio && (
                    <Text className = "mt-2">{profile.bio}</Text>
                  )}
                </Box>
              )}
            </VStack>
            { userId === profile.user_id ? (
              <Button size = "lg" variant = "outline" action = "primary" className = "border-[#6FA8DC]">
                <ButtonText className = "text-[#6FA8DC]">Edit Profile</ButtonText>
              </Button>
            ) : (
              <Button size = "lg" variant = "solid" action = "primary" className = "bg-[#6FA8DC]">
                <ButtonText className = "text-white">Follow</ButtonText>
              </Button>
            )}
          </VStack>
          )}
        </Box>

      </VStack>
   </StaticContainer>
  );
}
