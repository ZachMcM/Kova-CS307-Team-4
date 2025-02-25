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

export default function ProfileScreen() {
  
  const sampleProfile = {
    username: "johndoe123",
    display: "John Doe",
    friends: 15,
    following: 46,
    followers: 21,
    goal: "Benching 225",
    bio: "This is my description about my account, it is very interesting and very long to demonstrate the limits of using a textbox to bound the description."
  };

  // router from expo-router
  const router = useRouter();

  return (
   <Container className = "flex px-6 py-16">
      <VStack space = "md">
        <Box>
          <VStack space = "lg">
            <HStack space = "md">
              <Avatar className="bg-indigo-600 mt-1" size = "xl">
                <AvatarFallbackText className="text-white">{sampleProfile.display}</AvatarFallbackText>
              </Avatar>
              <VStack space = "xs">
                <VStack>
                  <Heading size="xl" className = "mb-0 h-8 w-56">{sampleProfile.display}</Heading>
                  <Text size="sm">@{sampleProfile.username}</Text>
                </VStack>
                <HStack space = "2xl">
                  <VStack>
                    <Heading size = "lg" className = "text-center">{sampleProfile.friends}</Heading>
                    <Text size = "sm" className = "text-center">friends</Text>
                  </VStack>
                  <VStack>
                    <Heading size = "lg" className = "text-center">{sampleProfile.followers}</Heading>
                    <Text size = "sm" className = "text-center">followers</Text>
                  </VStack>
                  <VStack>
                    <Heading size = "lg" className = "text-center">{sampleProfile.following}</Heading>
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
        </Box>
        <Box className = "border border-gray-300 rounded p-2">
          <VStack>
            <Heading size = "md">Next Goal: {sampleProfile.goal}</Heading>
            <Text>{sampleProfile.bio}</Text>
          </VStack>
        </Box>
      </VStack>
   </Container>
  );
}
