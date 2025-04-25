import { Heading } from "@/components/ui/heading";
import { Pressable } from "@/components/ui/pressable";
import { Text as GText } from "@/components/ui/text";
import {
  addUserLike,
  doesUserLike,
  getLikes,
  getNumOfLikes,
  removeUserLike,
} from "@/services/likeServices";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { Avatar, AvatarFallbackText, AvatarImage } from "./ui/avatar";
import { HStack } from "./ui/hstack";
import { Spinner } from "./ui/spinner";
import { Image } from "./ui/image";
import { ScrollView } from "./ui/scroll-view";

export type Exercise = {
  name: string;
  reps?: number;
  sets?: number;
  distance?: string;
  time?: string;
  weight?: string;
  cooldowns?: string;
};

export type TaggedFriend = {
  userId: string;
  name: string;
  avatar?: string;
};

type WorkoutPostProps = {
  id: string;
  username: string;
  name: string;
  avatar: string;
  date: string;
  title: string;
  description: string;
  exercises: Exercise[];
  userId: string;
  comments: number;
  imageUrls?: string[];
  workoutDuration?: string;
  pauseTime?: string;
  workoutCalories?: string;
  isOwnPost?: boolean;
  postId?: string;
  taggedFriends?: TaggedFriend[];
  weighIn?: number;
  templateId?: string;
  onUpdatePost?: (
    postId: string,
    title: string,
    description: string
  ) => Promise<any>;
};

export const WorkoutPost = ({
  id,
  username,
  name,
  avatar,
  date,
  title,
  description,
  exercises,
  comments,
  imageUrls,
  workoutDuration,
  pauseTime,
  workoutCalories,
  isOwnPost = false,
  postId,
  userId,
  taggedFriends = [],
  weighIn,
  templateId,
  onUpdatePost,
}: WorkoutPostProps) => {
  const [expanded, setExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedDescription, setEditedDescription] = useState(description);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [userHasLiked, changeUserLike] = useState(false);
  const [knowUserLikeStatus, changeKnowledgeStatus] = useState(false);

  const { data: likes, isLoading } = useQuery({
    queryKey: ["likeRel", { id: postId }],
    queryFn: async () => {
      let items = getLikes(postId!);
      return items;
    },
  });

  if (!isLoading && !knowUserLikeStatus) {
    changeKnowledgeStatus(true);
    changeUserLike(doesUserLike(userId, likes!));
  }

  const router = useRouter();

  const toggleExpand = () => {
    const toValue = expanded ? 0 : 1;
    setExpanded(!expanded);
    Animated.spring(animation, {
      toValue,
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();
  };

  const expandedHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const handleEdit = () => {
    setEditedTitle(title);
    setEditedDescription(description);
    setEditModalVisible(true);
  };

  const queryClient = useQueryClient();

  const { isPending: isChanging, mutate: changeLikeStatus } = useMutation({
    mutationFn: async () => {
      console.log("Seeing if it is changing: " + isChanging);
      if (!isChanging) {
        if (userHasLiked) {
          await removeUserLike(postId!, userId);
        } else {
          await addUserLike(postId!, userId);
        }
        changeUserLike(!userHasLiked);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["likeRel", { id: postId }] });
    },
  });


  const handleSaveEdit = async () => {
    if (!postId || !onUpdatePost) return;

    setIsSubmitting(true);
    try {
      await onUpdatePost(postId, editedTitle, editedDescription);
      setEditModalVisible(false);
    } catch (error) {
      console.error("Error updating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <View style={workoutPostStyles.container}>
        {/* Header */}
        <View style={workoutPostStyles.header}>
          <TouchableOpacity
            onPress={() => {
              router.replace(`/profiles/${id}`);
            }}
          >
            <View style={workoutPostStyles.userInfo}>
              <View style={workoutPostStyles.avatar}>
                <Avatar className="bg-indigo-600">
                  {avatar ? (
                    <AvatarImage source={{ uri: avatar }}></AvatarImage>
                  ) : (
                    <AvatarFallbackText className="text-white">
                      {name}
                    </AvatarFallbackText>
                  )}
                </Avatar>
              </View>
              <View>
                <HStack space="sm">
                  <Heading>{name}</Heading>
                  <GText size="sm" className="mt-1">
                    (@{username})
                  </GText>
                </HStack>
                <Text style={workoutPostStyles.date}>{date}</Text>
              </View>
            </View>
          </TouchableOpacity>
          <View style={workoutPostStyles.headerActions}>
            {isOwnPost && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  handleEdit();
                }}
                style={workoutPostStyles.editButton}
              >
                <Ionicons name="pencil" size={18} color="#007AFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {/* Content */}
        <View style={workoutPostStyles.content}>
          <Pressable onPress = {() => {router.replace(`/posts/${postId}`)}}>
            <Text style={workoutPostStyles.title}>{title}</Text>
            {description.length > 0 ? (
              <Text
                style={[
                  workoutPostStyles.description,
                  expanded
                    ? workoutPostStyles.expandedDescription
                    : workoutPostStyles.collapsedDescription,
                ]}
                numberOfLines={expanded ? undefined : 2}
              >
                {description}
              </Text>
            ) : (<></>)}
            {/* Exercise Tags */}
            <View style={workoutPostStyles.exerciseTags}>
              {exercises.map((exercise, index) => (
                <View key={index} style={workoutPostStyles.tag}>
                  <Text style={workoutPostStyles.tagText}>{exercise.name}</Text>
                </View>
              ))}
            </View>
          </Pressable>
          {/* Workout Image */}
          {imageUrls && imageUrls.length > 0 ? (
            <ScrollView horizontal style={{ marginBottom: 12 }}>
              <HStack space = "md">
                {imageUrls.map((url, index) => (
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

          {/* Tagged Friends */}
          {taggedFriends.length > 0 && (
            <View style={workoutPostStyles.taggedFriendsContainer}>
              <HStack className = "flex-wrap">
                <GText>With </GText>
                {taggedFriends.map((friend, index) => (
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
                      <GText className="font-bold text-blue-500">
                        {friend.name}
                        {index < taggedFriends.length - 1 ? ", " : ""}
                      </GText>
                    </HStack>
                  </Pressable>
                ))}
              </HStack>
            </View>
          )}

          {/* Expanded Details */}
          <Animated.View
            style={[workoutPostStyles.expandedDetails, { maxHeight: expandedHeight }]}
          >
            {/* Workout Summary */}
            {(workoutDuration || workoutCalories) && (
              <View style={workoutPostStyles.detailsSection}>
                <Text style={workoutPostStyles.sectionTitle}>Workout Summary</Text>
                <View style={workoutPostStyles.summaryContainer}>
                  {workoutDuration && (
                    <View style={workoutPostStyles.summaryItem}>
                      <View>
                        <Ionicons
                          name="time-outline"
                          size={18}
                          color="#007AFF"
                        />
                      </View>
                      <Text style={workoutPostStyles.summaryText}>{workoutDuration}</Text>
                    </View>
                  )}
                  {pauseTime && (
                    <View style={workoutPostStyles.summaryItem}>
                      <Text style={workoutPostStyles.summaryText}>{pauseTime}</Text>
                    </View>
                  )}
                  {workoutCalories && (
                    <View style={workoutPostStyles.summaryItem}>
                      <View>
                        <Ionicons
                          name="flame-outline"
                          size={18}
                          color="#FF9500"
                        />
                      </View>
                      <Text style={workoutPostStyles.summaryText}>{workoutCalories}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Tagged Friends Details (in expanded view) */}
            {taggedFriends.length > 0 && (
              <View style={workoutPostStyles.detailsSection}>
                <Text style={workoutPostStyles.sectionTitle}>Workout Partners</Text>
                <View style={workoutPostStyles.taggedFriendsDetails}>
                  {taggedFriends.map((friend) => (
                    <Pressable
                      key={friend.userId}
                      onPress={() => {
                        router.replace(`/profiles/${friend.userId}`);
                      }}
                    >
                      <View style={workoutPostStyles.taggedFriendDetail}>
                        <Avatar size="sm" className="mr-2">
                          {friend.avatar ? (
                            <AvatarImage
                              source={{ uri: friend.avatar }}
                            ></AvatarImage>
                          ) : (
                            <AvatarFallbackText className="text-white">
                              {friend.name}
                            </AvatarFallbackText>
                          )}
                        </Avatar>
                        <GText className="font-bold">{friend.name}</GText>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Exercise Details */}
            {exercises.length > 0 && (
              <View style={workoutPostStyles.detailsSection}>
                <Text style={workoutPostStyles.sectionTitle}>Exercise Details</Text>
                {exercises.map((exercise, index) => (
                  <View key={index} style={workoutPostStyles.exerciseDetail}>
                    <Text style={workoutPostStyles.exerciseName}>{exercise.name}</Text>
                    <View style={workoutPostStyles.exerciseStats}>
                      {exercise.sets !== undefined && (
                        <Text style={workoutPostStyles.exerciseStat}>
                          <Text style={workoutPostStyles.statLabel}>Sets: </Text>
                          <Text>{String(exercise.sets)}</Text>
                        </Text>
                      )}
                      {exercise.reps !== undefined && (
                        <Text style={workoutPostStyles.exerciseStat}>
                          <Text style={workoutPostStyles.statLabel}>Reps: </Text>
                          <Text>{String(exercise.reps)}</Text>
                        </Text>
                      )}
                      {exercise.weight && (
                        <Text style={workoutPostStyles.exerciseStat}>
                          <Text style={workoutPostStyles.statLabel}>Weight: </Text>
                          <Text>{exercise.weight}</Text>
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </Animated.View>

          {/* Engagement */}
          <View style={workoutPostStyles.engagement}>
            <TouchableOpacity
              style={workoutPostStyles.engagementItem}
              onPress={(event) => {
                changeLikeStatus();
              }}
            >
              {isLoading ? (
                <Spinner />
              ) : (
                <Text>
                  {userHasLiked ? "❤️" : "♡"}{" "}
                  {getNumOfLikes(likes!, userId, userHasLiked)}
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={workoutPostStyles.engagementItem}>
              <Text>
                💬 <Text>{comments}</Text>
              </Text>
            </TouchableOpacity>
            {likes?.length && likes.length > 0 ? (
              <Text>
                Liked By:{" "}
                {likes
                  ?.slice(0, 2)
                  ?.map(
                    (like, i) =>
                      `${like.name}${i != likes.length - 1 ? "," : ""} `
                  )}
              </Text>
            ) : (
              <></>
            )}
          </View>
        </View>
      </View>

      {/* Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={workoutPostStyles.modalOverlay}>
          <View style={workoutPostStyles.modalContent}>
            <Text style={workoutPostStyles.modalTitle}>Edit Post</Text>

            <Text style={workoutPostStyles.inputLabel}>Title</Text>
            <TextInput
              style={workoutPostStyles.input}
              value={editedTitle}
              onChangeText={setEditedTitle}
              placeholder="Enter post title"
            />

            <Text style={workoutPostStyles.inputLabel}>Description</Text>
            <TextInput
              style={[workoutPostStyles.input, workoutPostStyles.textArea]}
              value={editedDescription}
              onChangeText={setEditedDescription}
              placeholder="Enter post description"
              multiline
              numberOfLines={4}
            />

            <View style={workoutPostStyles.modalButtons}>
              <TouchableOpacity
                style={[workoutPostStyles.modalButton, workoutPostStyles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={workoutPostStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  workoutPostStyles.modalButton,
                  workoutPostStyles.saveButton,
                  isSubmitting && workoutPostStyles.disabledButton,
                ]}
                onPress={handleSaveEdit}
                disabled={isSubmitting}
              >
                <Text style={workoutPostStyles.saveButtonText}>
                  {isSubmitting ? "Saving..." : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export const workoutPostStyles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6FA8DC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  username: {
    fontWeight: "bold",
    fontSize: 16,
  },
  date: {
    color: "#666",
    fontSize: 12,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButton: {
    marginRight: 16,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#333",
    marginBottom: 12,
  },
  collapsedDescription: {
    lineHeight: 20,
  },
  expandedDescription: {
    lineHeight: 20,
  },
  taggedFriendsContainer: {
    marginBottom: 12,
  },
  taggedWithText: {
    fontSize: 14,
    color: "#555",
  },
  taggedFriendName: {
    fontWeight: "bold",
    color: "#007AFF",
  },
  exerciseTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  tag: {
    backgroundColor: "#f0f0f0",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: "#333",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  expandedImage: {
    height: 250,
  },
  expandedDetails: {
    overflow: "hidden",
  },
  detailsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  summaryContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  summaryText: {
    marginLeft: 6,
    fontSize: 14,
  },
  taggedFriendsDetails: {
    marginTop: 8,
  },
  taggedFriendDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  friendAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#6FA8DC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  friendAvatarText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  friendName: {
    fontSize: 14,
    color: "#333",
  },
  exerciseDetail: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 4,
  },
  exerciseStats: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  exerciseStat: {
    marginRight: 12,
    fontSize: 14,
  },
  statLabel: {
    color: "#666",
  },
  engagement: {
    flexDirection: "row",
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  engagementItem: {
    marginRight: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    marginLeft: 8,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.6,
  },
});
