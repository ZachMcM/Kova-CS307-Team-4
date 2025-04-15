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
import React, { useEffect, useState } from "react";
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { Avatar, AvatarFallbackText, AvatarImage } from "../ui/avatar";
import { HStack } from "../ui/hstack";
import { Spinner } from "../ui/spinner";
import { Image } from "../ui/image";
import { ScrollView } from "../ui/scroll-view";
import { supabase } from "@/lib/supabase";

type TutorialWorkoutPostProps = {
  username: string;
  name: string;
  avatar: string;
  date: string;
  title: string;
  description: string;
  exercises: string[];
  imageUrls?: string[];
  isOwnPost?: boolean;
  taggedFriends?: string[];
  onUpdatePost?: (
    postId: string,
    title: string,
    description: string
  ) => Promise<any>;
};

export const TutorialWorkoutPost = ({
  username,
  name,
  avatar,
  date,
  title,
  description,
  exercises,
  imageUrls,
  isOwnPost = false,
  taggedFriends = [],
}: TutorialWorkoutPostProps) => {
  const [expanded, setExpanded] = useState(false);

  const router = useRouter();

  return (
    <>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
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
                <Text style={styles.date}>{date}</Text>
              </View>
            </View>
          <View style={styles.headerActions}>
            {isOwnPost && (
              <TouchableOpacity
                style={styles.editButton}
              >
                <Ionicons name="pencil" size={18} color="#007AFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {/* Content */}
        <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            {description.length > 0 ? (
              <Text
                style={[
                  styles.description,
                  expanded
                    ? styles.expandedDescription
                    : styles.collapsedDescription,
                ]}
                numberOfLines={expanded ? undefined : 2}
              >
                {description}
              </Text>
            ) : (<></>)}
            {/* Exercise Tags */}
            <View style={styles.exerciseTags}>
              {exercises.map((exercise, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{exercise}</Text>
                </View>
              ))}
            </View>
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
            <View style={styles.taggedFriendsContainer}>
              <HStack className = "flex-wrap">
                <GText>With </GText>
                {taggedFriends.map((friend, index) => (
                  <Pressable
                    key={friend}>
                    <HStack space = "xs">
                      <Avatar size = "xs" className="bg-indigo-600">
                          <AvatarFallbackText className="text-white">{friend}</AvatarFallbackText>
                      </Avatar>
                      <GText className="font-bold text-blue-500">
                        {friend}
                        {index < taggedFriends.length - 1 ? ", " : ""}
                      </GText>
                    </HStack>
                  </Pressable>
                ))}
              </HStack>
            </View>
          )}

          {/* Engagement */}
          <View style={styles.engagement}>
                <Text>
                  {"♡ 0   "}
                </Text>
              <Text>
                💬 0
              </Text>
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
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
