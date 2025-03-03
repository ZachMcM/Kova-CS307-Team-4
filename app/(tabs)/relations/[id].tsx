import StaticContainer from "@/components/StaticContainer";
import { Text } from "@/components/ui/text";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Pressable } from "@/components/ui/pressable";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Icon, ChevronLeftIcon } from "@/components/ui/icon";
import { Heading } from "@/components/ui/heading";
import { Button, ButtonText } from "@/components/ui/button";
import { ScrollView } from "@/components/ui/scroll-view";
import { useQuery } from "@tanstack/react-query";
import { getFollowers, getFriends, getFollowing } from "@/services/profileServices";
import { Avatar, AvatarImage, AvatarFallbackText } from "@/components/ui/avatar";

export default function RelationsView() {
  const { id, type } = useLocalSearchParams();
  const router = useRouter();

  const selectedTab:string = type as string;

  const { data: relations, isLoading } = useQuery({
    queryKey: ["relations", id, selectedTab],
    queryFn: async () => {
      if (selectedTab === "friends") {
        return await getFriends(id as string);
      } else if (selectedTab === "followers") {
        return await getFollowers(id as string);
      } else if (selectedTab === "following") {
        return await getFollowing(id as string);
      }
    },
    enabled: !!id && !!selectedTab,
  });

  return (
    <StaticContainer className = "flex px-6 py-16">
      <VStack>
        <Pressable onPress={() => router.replace(`/profiles/${id}`)}>
          <HStack className = "mb-4">
            <Icon as={ChevronLeftIcon} className = "h-10 w-10"></Icon>
            <Heading size="xl" className = "mt-1">Profile</Heading>
          </HStack>
        </Pressable>
        <HStack space = "md" className = "pb-2 mb-2 border-b border-gray-300">
          <Button className={`flex-auto ${selectedTab === 'friends' ? 'bg-[#6FA8DC]' : 'bg-gray-200'}`} onPress={() => router.replace(`/relations/${id}?type=friends`)}>
            <ButtonText className={selectedTab === 'friends' ? 'text-white' : 'text-black'}>Friends</ButtonText>
          </Button>
          <Button className={`flex-auto ${selectedTab === 'followers' ? 'bg-[#6FA8DC]' : 'bg-gray-200'}`} onPress={() => router.replace(`/relations/${id}?type=followers`)}>
            <ButtonText className={selectedTab === 'followers' ? 'text-white' : 'text-black'}>Followers</ButtonText>
          </Button>
          <Button className={`flex-auto ${selectedTab === 'following' ? 'bg-[#6FA8DC]' : 'bg-gray-200'}`} onPress={() => router.replace(`/relations/${id}?type=following`)}>
            <ButtonText className={selectedTab === 'following' ? 'text-white' : 'text-black'}>Following</ButtonText>
          </Button>
        </HStack>
        <ScrollView className = "h-[80vh]">
        <VStack space="md">
            {isLoading ? (
              <Text>Loading...</Text>
            ) : (
              relations?.map((relation: any) => (
                <Pressable key={relation.userId} onPress={() => router.replace(`/profiles/${relation.userId}`)}>
                  <HStack space="md" className="p-2 border-b border-gray-300">
                    <Avatar className="bg-indigo-600" size="md">
                      {relation.avatar ? (
                        <AvatarImage source={{ uri: relation.avatar }} />
                      ) : (
                        <AvatarFallbackText className="text-white">{relation.name[0]}</AvatarFallbackText>
                      )}
                    </Avatar>
                    <Text className="self-center">{relation.name}</Text>
                  </HStack>
                </Pressable>
              ))
            )}
          </VStack>
        </ScrollView>
      </VStack>
    </StaticContainer>
  );
}