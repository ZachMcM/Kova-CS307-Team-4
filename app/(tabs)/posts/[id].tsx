import React, { useEffect, useState } from "react";
import { ScrollView, Pressable } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";
import { View, TextInput } from "react-native";
import { Avatar, AvatarFallbackText, AvatarImage } from "@/components/ui/avatar";
import { Post, formatDate } from "@/app/(tabs)/feed";
import { Exercise } from "@/components/WorkoutPost";
import { showErrorToast, showSuccessToast } from "@/services/toastServices";
import { useToast } from "@/components/ui/toast";
import Container from "@/components/Container";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { ChevronLeftIcon, ClockIcon, Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Spinner } from "@/components/ui/spinner";
import { Heading } from "@/components/ui/heading";
import { Image } from "@/components/ui/image";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import CommentCard from "@/components/CommentCard";
import { DetailedWorkoutData } from "@/components/WorkoutData";
import { LogBox } from 'react-native';

LogBox.ignoreLogs(['Warning: Text strings must be rendered within a <Text> component']);

export type Comment = {
  id: string;
  created_at: string;
  profile: {
    userId: string;
    name: string;
    username: string;
    avatar: string;
  };
  postId: string;
  content: string;
}

type ReducedProfile = {
  username: string;
  name: string;
  avatar: string;
}

const PAGE_SIZE = 3;

export default function PostDetails() {
  const router = useRouter();
  const toast = useToast();
  const { id: postId } = useLocalSearchParams();
  const [post, setPost] = useState<Post>();
  const [isLoading, setIsLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>();
  const [commentValue, setCommentValue] = useState("");
  const [isSubmitPending, setIsSubmitPending] = useState(false);
  const [userId, setUserId] = useState("");
  const [userProfile, setUserProfile] = useState<ReducedProfile>();
  const [page, setPage] = useState(1);
  const [displayComments, setDisplayComments] = useState(0);
  const [fetchedComments, setFetchedComments] = useState(0);
  const [writtenComments, setWrittenComments] = useState(0);
  const [fetchingComments, setFetchingComments] = useState(false);

  useEffect(() => {
    console.log("User profile updated: " + userProfile);
  }, [userProfile])

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (session) {
          setUserId(session.user.id);
          return session.user.id;
        }
        return null;
      })
      .then((id) => {
        if (id) {
          return supabase
            .from("profile")
            .select(`username, name, avatar`)
            .eq("userId", id)
            .single();
        }
      })
      .then((response) => {
        if (response && response.data) {
          setUserProfile(response.data as ReducedProfile);
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }, []);

  const fetchPostDetails = async () => {
    try {
      setComments([]);
      setIsLoading(true);
      
      const { data } = await supabase
        .from("post")
        .select(`*, profile:profileId ( username, userId, name, avatar )`)
        .eq("id", postId)
        .single();

      const fetchedPost: Post = {
        id: data.id,
        profileId: data.profileId,
        title: data.title,
        description: data.description,
        location: data.location,
        privacy: data.privacy,
        images: data.images || [],
        weighIn: data.weighIn,
        workoutData: data.workoutData
          ? {
              ...data.workoutData,
              exercises: data.workoutData.exercises as Exercise[], // Cast to Exercise[]
            }
          : null,
        taggedFriends: data.taggedFriends || [],
        taggedFriendsData: data.taggedFriendsData || [],
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        profile: data.profile || null,
        comments: data.comments
      };

      const postWithTaggedFriends = async (post: Post) => {
        if (post.taggedFriends && post.taggedFriends.length > 0) {
          const { data: friendsData, error: friendsError } = await supabase
            .from('profile')
            .select('userId, name, avatar')
            .in('userId', post.taggedFriends);
            
          if (!friendsError && friendsData) {
            post.taggedFriendsData = friendsData;
          }
        }
        setPost(post);
        setDisplayComments(post.comments);
      };

      postWithTaggedFriends(fetchedPost);

      const { data: commentData } = await supabase
        .from('comment')
        .select('*, profile:userId ( userId, username, name, avatar )')
        .eq("postId", postId)
        .order("created_at", { ascending: false })
        .range(0, PAGE_SIZE - 1);

      setComments(commentData as Comment[]);
      setFetchedComments(PAGE_SIZE);
      setPage(1);
    } catch (err) {
      showErrorToast(toast, "Error: Could not fetch post!")
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchPostDetails();
    }
  }, [postId]);

  const fetchMoreComments = async () => {
    if (!fetchingComments) {
      setFetchingComments(true);
      const pageStart = (PAGE_SIZE * page) + writtenComments;
      const pageEnd = (PAGE_SIZE * (page + 1)) + writtenComments;

      console.log("Page " + page + ": " + pageStart + " - " + (pageEnd - 1));


      const { data: commentData } = await supabase
        .from('comment')
        .select('*, profile:userId ( userId, username, name, avatar )')
        .eq("postId", postId)
        .order("created_at", { ascending: false })
        .range(pageStart, pageEnd - 1);

      const newComments = commentData as Comment[];

      for (let i = 0; i < newComments.length; i++) {
        console.log("ADDING " + newComments[i])
        comments?.push(newComments[i]);
      }

      setPage(prevPage => prevPage + 1);
      setFetchedComments(prevFetchedComments => prevFetchedComments + PAGE_SIZE);
      setFetchingComments(false);
    }
  }

  const handleCommentSubmit = async () => {
    setIsSubmitPending(true);

    const comment = {
      userId: userId,
      postId: post?.id,
      content: commentValue,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("comment")
      .insert(comment)
      .select();
    
    if (error) {
      showErrorToast(toast, "Error: Failed to post comment!")
    }
    else {
      const {data: incData, error: incError } = await supabase.rpc('increment_comments', {post_id: post?.id});

      console.log("PROFILE: " + userProfile)

      if (userProfile) {
        console.log("ADDING COMMENT TO UI")
        const facadeComment: Comment = {
          id: "",
          created_at: comment.created_at,
          profile: {
            userId: userId,
            name: userProfile.name,
            username: userProfile.username,
            avatar: userProfile.avatar
          },
          postId: comment.content,
          content: comment.content
        };
        comments?.unshift(facadeComment);
      }

      showSuccessToast(toast, "Posted comment!")
      setCommentValue("");
      setWrittenComments(prevWrittenComments => prevWrittenComments + 1);
      setDisplayComments(prevDisplayComments => prevDisplayComments + 1);
    }

    setIsSubmitPending(false);
  }

  return (
    <Container className = "flex">
      <Box className = "flex px-6 pt-16 mb-2">
        <VStack>
          <Pressable onPress = {() => router.replace("/feed")} className = "pb-2 border-b border-gray-300 mb-4">
            <HStack>
              <Icon as = {ChevronLeftIcon} className = "h-8 w-8"></Icon>
              <Text size = "2xl">Feed</Text>
            </HStack>
          </Pressable>
          {isLoading && !post ? (
            <Spinner />
          ) : !isLoading && !post ? (
            <Text className = "text-red-600">Oops... There was an error fetching the post!</Text>
          ) : post && post.profile && (
            <VStack>
              <HStack className = "mb-2">
                <Pressable onPress = {() => {post.profile && router.replace(`/profiles/${post.profile.userId}`)}}>
                  <Avatar>
                    {post.profile.avatar ? (
                      <AvatarImage source = {{uri: post.profile.avatar}}></AvatarImage>
                    ) : (
                      <AvatarFallbackText className = "text-white">{post.profile.name}</AvatarFallbackText>
                    )}
                  </Avatar>
                </Pressable>
                <VStack className = "ml-2">
                  <HStack space="sm">
                    <Heading>{post.profile.name}</Heading>
                    <Text size="sm" className="mt-1">
                      (@{post.profile.username})
                    </Text>
                  </HStack>
                  <Text size = "sm">{formatDate(post.createdAt)}</Text>
                </VStack>
              </HStack>
              {/* Title, Tagged Friends, and Description */}
              <Text className = "font-bold text-wrap text-2xl mb-1">{post.title}</Text>
              {post.taggedFriends && post.taggedFriends.length > 0 && (
                <HStack>
                  <Text>With </Text>
                  {post.taggedFriendsData?.map((friend, index) => (
                    <Pressable
                      key={friend.userId}
                      onPress={() => {
                        router.replace(`/profiles/${friend.userId}`);
                      }}
                    >
                      <HStack space = "xs">
                        <Avatar size = "xs" className="bg-indigo-600">
                          {friend.avatar ? (
                            <AvatarImage source={{ uri: friend.avatar }}></AvatarImage>
                          ) : ( 
                            <AvatarFallbackText className="text-white">{friend.name}</AvatarFallbackText>
                          )}
                        </Avatar>
                        <Text className="font-bold text-blue-500">
                          {friend.name}
                          {post.taggedFriends && index < post.taggedFriends.length - 1 ? ", " : ""}
                        </Text>
                      </HStack>
                    </Pressable>
                  ))}
                </HStack>
              )}
              {post.location && (
                <Text size = "md" className = "mt-1" bold>📍 {post.location}</Text>
              )}
              {post.description.length > 0 ? (
                <Text size = "md" className = "text-wrap mt-2">{post.description}</Text>
              ) : (<></>)}
              {/* Images */}
              {post.images && post.images.length > 0 ? (
                <ScrollView horizontal className = "mb-4 mt-4">
                  <HStack space = "md">
                    {post.images.map((url, index) => (
                      <Image
                        key={index}
                        size = "2xl"
                        source={{ uri: url }}
                        className = "rounded-2xl"
                        alt = "false"
                      />
                    ))}
                  </HStack>
                </ScrollView>
              ) : (
                <></>
              )}
              {/* Exercise Details */}
              {post.workoutData?.exercises && post.workoutData?.exercises?.length > 0 && (
                <DetailedWorkoutData post={post}></DetailedWorkoutData>
              )}
            </VStack>
          )}
        </VStack>
      </Box>
      <Box className = "mb-12 pb-16 px-6 pt-2 bg-[#f7f7f7] border-t border-gray-300">
        <VStack className = "pb-3 border-b border-gray-300">
          <Text size="lg" className = "mb-2" bold>Comments ({displayComments})</Text>
          <Box className="rounded p-2 border border-[#6FA8DC]">
            <VStack>
              <TextInput maxLength={500} 
                  placeholder="Add comment..." 
                  className="p-0 m-0 ml-1 text-lg"
                  value={commentValue}
                  onChangeText={setCommentValue}
                  style={{ minHeight: 40, maxHeight: 200, overflow: 'hidden' }}
                  multiline
                  numberOfLines={4}>
              </TextInput>
              <HStack space = "sm">
                <Box className = "border rounded-3xl mt-4 p-1 border-gray-300">
                  <Text size = "sm" className="flex-row text-gray-400">
                    {commentValue.length}/500
                  </Text>
                </Box>
                <Box className = "flex-1"></Box>
                {!isSubmitPending ? (
                  <Button onPress = {handleCommentSubmit} className="bg-[#6FA8DC] mt-2 rounded-3xl">
                    <ButtonText className="text-white font-bold">Submit</ButtonText>
                  </Button>
                ) : (
                  <Spinner/>
                )}
              </HStack>
            </VStack>
          </Box>
        </VStack>
        <VStack className = "mt-2">
          {comments && comments.map((comment: Comment) => (
            <CommentCard key = {comment.created_at} comment = {comment}></CommentCard>
          ))}
          {post && post.comments > fetchedComments + writtenComments ? (
            <Button onPress = {fetchMoreComments}>
              <ButtonText>Load more</ButtonText>
            </Button>
          ) : isLoading || fetchingComments && (
            <Spinner></Spinner>
          )}
        </VStack>
      </Box>
    </Container>
  );
}
