import Container from "@/components/Container";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from '@/components/ui/vstack';
import { HStack } from "@/components/ui/hstack";
import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";

export default function ProfileScreen() {
  
  const sampleProfile = {
    username: "johndoe123",
    display: "John Doe",
    friends: 15,
    following: 46,
    followers: 21
  };

  return (
   <Container>
      <VStack space = "md">
        <Box>
          <VStack space = "lg">
            <HStack space = "md">
              <Avatar className="bg-indigo-600 mt-1" size = "xl">
                <AvatarFallbackText className="text-white">
                  John Doe
                </AvatarFallbackText>
              </Avatar>
              <VStack space = "xs">
                <VStack>
                  <Heading size="xl" className = "mb-0">{sampleProfile.display}</Heading>
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
            </HStack>
            <Button size = "lg" variant = "outline" action = "primary">
              <ButtonText>Edit Profile</ButtonText>
            </Button>
          </VStack>
        </Box>
      </VStack>
   </Container>
  );
}
