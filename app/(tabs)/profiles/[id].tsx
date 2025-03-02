import Container from "@/components/Container";
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
import { Profile, PublicProfile, PrivateProfile, isPublicProfile } from "@/types/profile-types";

export default function ProfileScreen() {

  const { id } = useLocalSearchParams();
  const router = useRouter();

  const { data: profile, isPending } = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      const profile = (await getProfile(id as string) || null);
      console.log(JSON.stringify(profile));
      return profile;
    },
  });

  const getProfilePrivacy = (profile: any) => {
    return profile.privacy;
  }

  return (
   <Container className = "flex px-6 py-16">
      <VStack space = "md">
        <Box>
          {isPending ? (
            <Spinner />
          )
          : profile && (
          <VStack space = "lg">
            <HStack space = "md">
              <Avatar className="bg-indigo-600 mt-1" size = "xl">
                <AvatarFallbackText className="text-white">{profile.username}</AvatarFallbackText>
              </Avatar>
              <VStack space = "xs">
                <VStack>
                  <Heading size="xl" className = "mb-0 h-8 w-56">{profile.username}</Heading>
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
              <Button onPress={() => router.replace("/(tabs)/settings")} className = "w-0 h-0">
                <Icon as = {MenuIcon} size = "xl" className = "mt-8 ml-8 w-8 h-8"></Icon>
              </Button>
            </HStack>
            <Button size = "lg" variant = "outline" action = "primary" className = "border-[#6FA8DC]">
              <ButtonText className = "text-[#6FA8DC]">Edit Profile</ButtonText>
            </Button>
          </VStack>
          )}
        </Box>
        { isPending ? (
          <Box className = "border border-gray-300 rounded p-2" />
        )
        : profile && isPublicProfile(profile) && (
          <Box className = "border border-gray-300 rounded p-2">
            <VStack>
              <Heading size = "md">Next Goal: {profile.goal}</Heading>
              <Text>{profile.bio}</Text>
            </VStack>
          </Box>
        )}
      </VStack>
   </Container>
  );
}
