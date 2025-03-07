import StaticContainer from "@/components/StaticContainer";
import { Text } from "@/components/ui/text";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Pressable } from "@/components/ui/pressable";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Icon, ChevronLeftIcon, CheckCircleIcon } from "@/components/ui/icon";
import { Heading } from "@/components/ui/heading";
import { Button, ButtonText } from "@/components/ui/button";
import { ScrollView } from "@/components/ui/scroll-view";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getFollowers, getFriends, getFollowing, followUser, unfollowUser } from "@/services/profileServices";
import { Avatar, AvatarImage, AvatarFallbackText } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { showErrorToast, showSuccessToast, showFollowToast } from "@/services/toastServices";
import { useToast } from "@/components/ui/toast";
import { Badge, BadgeText, BadgeIcon } from "@/components/ui/badge";
import { Input, InputField } from "@/components/ui/input";

export default function RelationsView() {
  const { id, type } = useLocalSearchParams();
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [visible, setVisible] = useState(true);

  const selectedTab:string = type as string;

  const [profileQuery, setProfileQuery] = useState("");

  const { data: friends, isPending } = useQuery({
    queryKey: ["friends", id],
    queryFn: async () => {
      return await getFriends(id as string);
    },
    enabled: !!id,
  });

  const { data: followers, isFetching } = useQuery({
    queryKey: ["followers", id],
    queryFn: async () => {
      return await getFollowers(id as string);
    },
    enabled: !!id,
  });

  const { data: following, isLoading } = useQuery({
    queryKey: ["following", id],
    queryFn: async () => {
      return await getFollowing(id as string);
    },
    enabled: !!id,
  });

  const { data: userFriends } = useQuery({
    queryKey: ["friends", userId],
    queryFn: async () => {
      return await getFriends(userId as string);
    },
    enabled: !!userId,
  });

  const handleFollowBack = async (relation: any) => {
    try {
      setVisible(false);
      await followUser(id as string, relation.userId);
      router.replace(`/relations/${id}?type=followers`);
      showFollowToast(toast, relation.name, true);
      queryClient.invalidateQueries({ queryKey: ["following", id as string] });
      queryClient.invalidateQueries({ queryKey: ["friends", id as string] });
      queryClient.invalidateQueries({ queryKey: ["profile", id as string] });
      setVisible(true);
    } catch (error) {
      console.error("Failed to follow back:", error);
      showErrorToast(toast, "Failed to follow user");
      setVisible(true);
    }
  };

  const handleUnfollow = async (relation: any) => {
    try {
      setVisible(false);
      await unfollowUser(id as string, relation.userId);
      router.replace(`/relations/${id}?type=following`);
      showFollowToast(toast, relation.name, false);
      queryClient.invalidateQueries({ queryKey: ["following", id as string] });
      queryClient.invalidateQueries({ queryKey: ["friends", id as string] });
      queryClient.invalidateQueries({ queryKey: ["profile", id as string] });
      setVisible(true);
    } catch (error) {
      console.error("Failed to unfollow:", error);
      showErrorToast(toast, "Failed to unfollow user");
      setVisible(true);
    }
  };

  useEffect(() => {
    const fetchUserId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
      }
    };

    fetchUserId();
  }, []);

  const userFriendIds = userFriends?.map((friend: any) => friend.userId);

  //const friendIds = friends?.map((friend: any) => friend.userId);
  const followingIds = following?.map((following: any) => following.userId);
  const relations = selectedTab === "friends" ? friends : selectedTab === "followers" ? followers : following;

  return (
    <StaticContainer className = "flex px-6 py-16">
      <VStack>
        <Pressable onPress={() => router.replace(`/profiles/${id}`)}>
          <HStack className = "mb-4">
            <Icon as={ChevronLeftIcon} className = "h-10 w-10"></Icon>
            <Heading size="xl" className = "mt-1">Profile</Heading>
          </HStack>
        </Pressable>
        <HStack space = "md" className = "pb-2 border-b border-gray-300">
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
        <Input className = "mt-2">
          <InputField onChangeText = {setProfileQuery} value = {profileQuery} placeholder="Search for a user"/>
        </Input>
        <ScrollView className = "h-full">
          <VStack>
            {isLoading ? (
              <Text>Loading...</Text>
            ) : (relations?.filter((relation) => (relation.name.toLowerCase().includes(profileQuery?.toLowerCase()))).map((relation: any) => (
                <Pressable key={relation.userId} onPress={() => router.replace(`/profiles/${relation.userId}`)}>
                  <HStack space="md" className="p-2 border-b border-gray-300 mb-0">
                    <Avatar className="bg-indigo-600" size="md">
                      {relation.avatar ? (
                        <AvatarImage source={{ uri: relation.avatar }} />
                      ) : (
                        <AvatarFallbackText className="text-white">{relation.name[0]}</AvatarFallbackText>
                      )}
                    </Avatar>
                    <HStack className="relative flex-auto">
                      <Text className="self-center">{relation.name}</Text>
                      {((selectedTab === "friends" && userId === id) || userFriendIds?.includes(relation.userId)) && relation.userId !== userId && (
                        <Badge size="md" variant="solid" action="muted" className = "bg-none text-none m-2 rounded-2xl">
                          <BadgeIcon as={CheckCircleIcon} className = "text-[#4d7599]"></BadgeIcon>
                          <Text className = "ml-1 text-[#4d7599] text-sm">Friend</Text>
                        </Badge>
                      )}
                      {selectedTab === "followers" && !followingIds?.includes(relation.userId) && userId === id && visible && (
                        <Button
                          className="absolute mt-1 right-0"
                          onPress={() => handleFollowBack(relation)}
                        >
                          <ButtonText>Follow Back</ButtonText>
                        </Button>
                      )}
                      {(followingIds?.includes(relation.userId) && userId === id) && visible && (
                        <Button className="absolute mt-1 right-0" onPress={() => handleUnfollow(relation)} variant = "outline" action = "secondary">
                          <ButtonText>Unfollow</ButtonText>
                        </Button>
                      )}
                    </HStack>
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