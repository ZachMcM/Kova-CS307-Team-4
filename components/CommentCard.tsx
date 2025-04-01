import { Box } from "./ui/box";
import { VStack } from "./ui/vstack";
import { HStack } from "./ui/hstack";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Avatar, AvatarFallbackText, AvatarImage } from "./ui/avatar";
import { Heading } from "./ui/heading";
import { Text } from "./ui/text";
import { Comment } from "@/app/(tabs)/posts/[id]";

function formatDate(date: string) {
  const now = new Date();
  const inputDate = new Date(date);

  // Get time string
  const timeString = inputDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Calculate date differences
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (inputDate >= today) {
      return `Today at ${timeString}`;
  } else if (inputDate >= yesterday) {
      return `Yesterday at ${timeString}`;
  } else {
      return inputDate.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
 
export default function CommentCard({ comment }: {comment: Comment}) {
  const router = useRouter();

  return (
    <Box className = "bg-white p-2 mb-2 rounded border-gray-300 border">
      <VStack>
        <HStack className = "mb-2">
          <Pressable onPress = {() => {router.replace(`/profiles/${comment.profile.userId}`)}}>
            <Avatar size = "sm" className = "mt-0.5">
              {comment.profile.avatar ? (
                <AvatarImage source = {{uri: comment.profile.avatar}}></AvatarImage>
              ) : (
                <AvatarFallbackText className = "text-white">{comment.profile.name}</AvatarFallbackText>
              )}
            </Avatar>
          </Pressable>
          <VStack className = "ml-2">
            <HStack space="xs">
              <Text size = "sm" bold>{comment.profile.name}</Text>
              <Text size="sm">
                (@{comment.profile.username})
              </Text>
            </HStack>
            <Text size = "xs">{formatDate(comment.created_at)}</Text>
          </VStack>
        </HStack>
        <Text>{comment.content}</Text>
      </VStack>
    </Box>
  );
}
