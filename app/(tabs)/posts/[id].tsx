import React, { useEffect, useState } from "react";
import { ScrollView, Pressable, Alert } from "react-native";
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
import { ChevronLeftIcon, ClockIcon, Icon, CopyIcon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Spinner } from "@/components/ui/spinner";
import { Heading } from "@/components/ui/heading";
import { Image } from "@/components/ui/image";
import { Box } from "@/components/ui/box";
import { Ionicons } from "@expo/vector-icons";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import CommentCard from "@/components/CommentCard";
import { DetailedWorkoutData } from "@/components/WorkoutData";
import { LogBox } from 'react-native';
import { Comment, getComments, pushComment } from "@/services/commentServices";

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
  const [isCurrentUserPost, setIsCurrentUserPost] = useState(false);
  const [isCopyingTemplate, setIsCopyingTemplate] = useState(false);
  const [displayComments, setDisplayComments] = useState(0);
  const [fetchedComments, setFetchedComments] = useState(0);
  const [writtenComments, setWrittenComments] = useState(0);
  const [fetchingComments, setFetchingComments] = useState(false);

  useEffect(() => {
    console.log("User profile updated");
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

  useEffect(() => {
    if (post && userId) {
      setIsCurrentUserPost(post.profile?.userId === userId);
    }
  }, [post, userId]);

  const fetchPostDetails = async () => {
    try {
      setComments([]);
      setWrittenComments(0);
      setIsLoading(true);
      
      const { data } = await supabase
        .from("post")
        .select(`*, profile:profileId ( username, userId, name, avatar )`)
        .eq("id", postId)
        .single();

      // If post has a template_id, check if it's a copy
      if (data.template_id) {
        const { data: templateCheck } = await supabase
          .from('template')
          .select('originalTemplateId')
          .eq('id', data.template_id)
          .single();

        if (templateCheck?.originalTemplateId) {
          // If it's a copy, use the original template id
          data.workoutData.originalTemplateId = templateCheck.originalTemplateId;
        } else {
          // If it's an original template, use its own id
          data.workoutData.originalTemplateId = data.template_id;
        }
      }

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
              exercises: data.workoutData.exercises as Exercise[],
              originalTemplateId: data.workoutData.originalTemplateId
            }
          : null,
        template_id: data.template_id || null,
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
    if (!fetchingComments && !Array.isArray(postId)) {
      setFetchingComments(true);
      const pageStart = (PAGE_SIZE * page) + writtenComments;
      const pageEnd = (PAGE_SIZE * (page + 1)) + writtenComments - 1;

      getComments(postId, pageStart, pageEnd).then((commentData => {
        const newComments = commentData as Comment[];

        for (let i = 0; i < newComments.length; i++) {
          comments?.push(newComments[i]);
        }

        setPage(prevPage => prevPage + 1);
        setFetchedComments(prevFetchedComments => prevFetchedComments + PAGE_SIZE);
        setFetchingComments(false);
      }));
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

    if (post) {
      const {data, success} = await pushComment(post?.id, comment);

      if (!success) {
        showErrorToast(toast, "Error: Failed to post comment!");
      }
      else {
        if (userProfile) {
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
  }

  const copyTemplate = async () => {
    if (!post || !post.template_id || !userId) {
      showErrorToast(toast, "Cannot copy template: Missing required information");
      return;
    }

    try {
      setIsCopyingTemplate(true);

      const { data: templateData, error: templateError } = await supabase
        .from('template')
        .select('*')
        .eq('id', post.template_id)
        .single();

      if (templateError) {
        throw new Error(`Failed to fetch template: ${templateError.message}`);
      }

      if (!templateData) {
        throw new Error('Template not found');
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profile")
        .select("id")
        .eq("userId", userId)
        .single();

      if (profileError) {
        throw new Error(`Failed to get profile: ${profileError.message}`);
      }

      const newTemplate = {
        name: `Copy of ${templateData.name}`,
        description: templateData.description,
        data: templateData.data,
        profileId: profileData.id,
        creatorProfileId: profileData.id,
        originalTemplateId: templateData.id,
        created_at: new Date().toISOString(),
      };

      const { data: newTemplateData, error: insertError } = await supabase
        .from('template')
        .insert(newTemplate)
        .select();

      if (insertError) {
        throw new Error(`Failed to create template copy: ${insertError.message}`);
      }

      showSuccessToast(toast, "Template copied successfully!");
      
      Alert.alert(
        "Template Copied",
        "The template has been copied to your templates. Would you like to view it now?",
        [
          {
            text: "No",
            style: "cancel"
          },
          {
            text: "Yes",
            onPress: () => {
              router.replace(`/templates/${newTemplateData[0].id}`);
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Error copying template:', error);
      showErrorToast(toast, `Error copying template: ${error.message}`);
    } finally {
      setIsCopyingTemplate(false);
    }
  };

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

              {/* Template information - show only if this is a template post and not the current user's post */}
              {post.template_id && !isCurrentUserPost && (
                <Button 
                  className="mt-4 mb-2" 
                  variant="solid" 
                  action="primary"
                  onPress={copyTemplate}
                  isDisabled={isCopyingTemplate}
                >
                  <ButtonIcon as={CopyIcon} className="mr-1" />
                  <ButtonText>{isCopyingTemplate ? "Copying..." : "Copy This Template"}</ButtonText>
                </Button>
              )}

              {/* If template is a copy, show the original */}
              {post && post.workoutData && post.workoutData.originalTemplateId && (
                <Pressable 
                  className="mt-2 mb-4" 
                  onPress={() => {
                    if (post && post.workoutData && post.workoutData.originalTemplateId) {
                      router.push(`/templates/${post.workoutData.originalTemplateId}`);
                    }
                  }}
                >
                  <Text className="text-blue-500 italic">
                    Based on another template - View original
                  </Text>
                </Pressable>
              )}

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
                <VStack>
                  <Text size="lg" bold>
                    Exercise Details
                  </Text>
                  <HStack space = "xs" className = "h-16 w-full mb-2 mt-2 border border-gray-300 rounded">
                    {post.workoutData?.duration && (
                      <Box className="flex-1 h-full justify-center items-center">
                        <Text size="md">Duration</Text>
                        <HStack space = "xs">
                          <Text size = "lg" bold>{post.workoutData.duration}</Text>
                        </HStack>
                      </Box>
                    )}
                    {post.workoutData?.pauseTime && (
                      <Box className="flex-1 h-full justify-center items-center">
                        <Text size="md">Rest Time</Text>
                        <HStack>
                          <Text size = "lg" bold>{post.workoutData.pauseTime}</Text>
                        </HStack>
                      </Box>
                    )}
                    {post.workoutData?.calories && (
                      <Box className="flex-1 h-full justify-center items-center">
                        <Text size="md">Calories</Text>
                        <HStack>
                          <Text size = "lg" bold>{post.workoutData.calories}</Text>
                          <Ionicons name="flame-outline" size={22} color="#FF9500"/>
                        </HStack>
                      </Box>
                    )}
                    {post.weighIn ? (
                      <Box className="flex-1 h-full justify-center items-center">
                        <Text size="md">Weigh-In</Text>
                        <HStack>
                          <Text size="lg" bold>{post.weighIn} lbs</Text>
                        </HStack>
                      </Box>
                    ) : (
                      <></>
                    )}
                  </HStack>
                  {post.workoutData.exercises.reduce((rows: Exercise[][], exercise: any, index: number) => {
                    // Convert exercise to Exercise type first
                    let normalizedExercise: Exercise;
                    console.log("Exercise: ", exercise);
                    
                    if ('info' in exercise) {
                      if (exercise.info.type === "WEIGHTS") {
                        normalizedExercise = {
                          name: exercise.info?.name || 'Unknown Exercise',
                          sets: exercise.sets?.length || 0,
                          reps: exercise.sets?.reduce((acc: number, set: any) => acc + (set.reps || 0), 0) || 0,
                          weight: exercise.sets?.length > 0 && exercise.sets[exercise.sets.length - 1].weight 
                            ? `${exercise.sets[exercise.sets.length - 1].weight} lbs` 
                            : undefined
                        };
                      }
                      else {
                        normalizedExercise = {
                          name: exercise.info?.name || 'Unknown Exercise',
                          sets: exercise.sets?.length || 0,
                          distance: exercise.distance,
                          time: exercise.time,
                        };
                      }
                    } else {
                      normalizedExercise = exercise as Exercise;
                    }
                    
                    console.log("Normalized exercise: ", normalizedExercise);

                    // Now use the normalized exercise
                    if (index % 2 === 0) {
                      rows.push([normalizedExercise]);
                    } else {
                      rows[rows.length - 1].push(normalizedExercise);
                    }
                    return rows;
                  }, [] as Exercise[][]).map((row, rowIndex) => (
                    <HStack key={rowIndex} space="xs" className="w-full mb-2">
                      {row.map((exercise, index) => (
                        <Box key={index} className="flex-1 rounded border border-gray-300 p-2">
                          <Text className="font-bold">{exercise.name}</Text>
                          <View>
                            {exercise.sets !== undefined && (
                              <Text>
                                <Text>Sets: </Text>
                                <Text>{String(exercise.sets)}</Text>
                              </Text>
                            )}
                            {exercise.reps !== undefined && (
                              <Text>
                                <Text>Reps: </Text>
                                <Text>{String(exercise.reps)}</Text>
                              </Text>
                            )}
                            {exercise.weight && (
                              <Text>
                                <Text>Weight: </Text>
                                <Text>{exercise.weight}</Text>
                              </Text>
                            )}
                            {exercise.distance && (
                              <Text>
                                <Text>Distance: </Text>
                                <Text>{exercise.distance}</Text>
                              </Text>
                            )}
                            {exercise.time && (
                              <Text>
                                <Text>Time: </Text>
                                <Text>{exercise.time}</Text>
                              </Text>
                            )}
                            {exercise.cooldowns !== undefined && (
                              <Text>
                                <Text>Cooldown: </Text>
                                <Text>{exercise.cooldowns}</Text>
                              </Text>
                            )}
                          </View>
                        </Box>
                      ))}
                      {/* Add an empty box if there is only one exercise in the row */}
                      {row.length === 1 && <Box className="flex-1 p-2" />}
                    </HStack>
                  ))}
                </VStack>
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
