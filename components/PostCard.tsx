import { Card } from "./ui/card";
import { Heading } from "./ui/heading";
import { Text } from "./ui/text";
import { Link } from "./ui/link";
import { Select, SelectTrigger, SelectInput, SelectIcon, SelectPortal, SelectContent, SelectItem } from "./ui/select";
import { Icon, ChevronDownIcon, ChevronRightIcon } from "./ui/icon";
import { View } from "./ui/view"
import { Pressable } from "./ui/pressable"
import { useRouter } from "expo-router";
import Container from "./Container";
import { VStack } from "./ui/vstack";
import { HStack } from "./ui/hstack";
import { Avatar, AvatarImage, AvatarFallbackText } from "./ui/avatar";

export default function PostCard({ post, profile }: {post: any, profile:any}) {
  return (
    <Container>
      <VStack>
        <HStack>
          <Avatar>
            {profile.avatar ? (
              <AvatarImage source={{ uri: profile.avatar }} />
            ) : (
              <AvatarFallbackText className="text-white">{profile.name}</AvatarFallbackText>
            )}
          </Avatar>
          <Text>{profile.name} </Text>
        </HStack>
      </VStack>
    </Container>
  );
}
