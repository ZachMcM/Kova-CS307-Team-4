import { Text } from "./ui/text";
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
