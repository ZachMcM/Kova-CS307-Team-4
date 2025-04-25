import { Heading } from "@/components/ui/heading";
import { Pressable } from "@/components/ui/pressable";
import { Text as GText } from "@/components/ui/text";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Avatar, AvatarFallbackText, AvatarImage } from "../ui/avatar";
import { HStack } from "../ui/hstack";
import { Image } from "../ui/image";
import { ScrollView } from "../ui/scroll-view";
import { TaggedFriend, workoutPostStyles } from "../WorkoutPost";

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
  taggedFriends?: TaggedFriend[];
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

  const router = useRouter();

  return (
    <>
      <View style={workoutPostStyles.container}>
        {/* Header */}
        <View style={workoutPostStyles.header}>
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
          <View style={workoutPostStyles.headerActions}>
            {isOwnPost && (
              <TouchableOpacity
                style={workoutPostStyles.editButton}
              >
                <Ionicons name="pencil" size={18} color="#007AFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {/* Content */}
        <View style={workoutPostStyles.content}>
            <Text style={workoutPostStyles.title}>{title}</Text>
            {description.length > 0 ? (
              <Text
                style={[
                  workoutPostStyles.description,
                  false
                    ? workoutPostStyles.expandedDescription
                    : workoutPostStyles.collapsedDescription,
                ]}
                numberOfLines={false ? undefined : 2}
              >
                {description}
              </Text>
            ) : (<></>)}
            {/* Exercise Tags */}
            <View style={workoutPostStyles.exerciseTags}>
              {exercises.map((exercise, index) => (
                <View key={index} style={workoutPostStyles.tag}>
                  <Text style={workoutPostStyles.tagText}>{exercise}</Text>
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
            <View style={workoutPostStyles.taggedFriendsContainer}>
              <HStack className = "flex-wrap">
                <GText>With </GText>
                {taggedFriends.map((friend, index) => (
                  <Pressable
                    key={friend.name}>
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

          {/* Engagement */}
          <View style={workoutPostStyles.engagement}>
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