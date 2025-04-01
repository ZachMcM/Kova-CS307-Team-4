import Container from "@/components/Container";
import { useSession } from "@/components/SessionContext";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { WorkoutPost } from "@/components/WorkoutPost";
import { supabase } from "@/lib/supabase";
import { showErrorToast, showSuccessToast } from "@/services/toastServices";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { getFollowing, getFriends } from "@/services/profileServices";
import { Heading } from "./ui/heading";
import { Card } from "./ui/card";
import { formatDate, formatDuration, formatTime, Post } from "@/app/(tabs)/feed";
import { DetailedWorkoutData, SummaryWorkoutData, WorkoutHeader } from "./WorkoutData";
import { useNavigation } from "@react-navigation/native";

type ProfileActivitiesProps = {
    posts: Post[];
    isLoading: boolean;
    updatePostFunc: (postId: string, title: string, description: string) => Promise<any[]>;
}

export const ProfileActivities = ({
    posts,
    isLoading,
    updatePostFunc,
}: ProfileActivitiesProps) => {

    const { session } = useSession();
    const navigation = useNavigation();

    const [postViewCount, setPostViewCount] = useState(4); //Initially only view 4 posts
    const [visiblePosts, setVisiblePosts] = useState(posts.length > 4 ? posts.slice(0, 4) : posts.slice());
    const [hasMorePosts, setHasMorePosts] = useState(posts.length > 0 ? true : false);

    const [visibleWorkouts, setVisibleWorkouts] = useState<Post[]>([]);
    const [hasMoreWorkouts, setHasMoreWorkouts] = useState(posts.length > 0 ? true : false);
    const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);

    const addMorePostsToView = () => {
        if (posts.length <= postViewCount + 10) {
            setPostViewCount(posts.length);
            setVisiblePosts(posts);
            setHasMorePosts(false);
            return;
        }
        setPostViewCount(postViewCount + 10);
        setVisiblePosts(posts.slice(0, postViewCount));
        setHasMorePosts(true);
    }

    const updateWorkoutList = (length: number) => {
        let newWorkouts: Post[] = [];
        let indexCount: number = 0;
        while (newWorkouts.length < length) {
            if (indexCount >= posts.length) {
                setHasMoreWorkouts(false);
                setVisibleWorkouts(newWorkouts);
                return;
            } else if (posts[indexCount].workoutData && posts[indexCount].workoutData?.exercises.length !== 0) {
                newWorkouts.push(posts[indexCount]);
            }
            indexCount++;
        }
        setHasMoreWorkouts(true);
        setVisibleWorkouts(newWorkouts);
    }

    //This useEffect is for resetting the histories if the user leaves and then comes back
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
          {
            setPostViewCount(4);
            setVisiblePosts(posts.length > 4 ? posts.slice(0, 4) : posts.slice());
            setHasMorePosts(posts.length > 0 ? true : false);
            setVisibleWorkouts([]);
            setHasMoreWorkouts(posts.length > 0 ? true : false);
            setSelectedWorkout(null)
          }
        });
    
        return unsubscribe;
      }, [navigation]);     

    useEffect(() => {
        setVisiblePosts(posts.slice(0, postViewCount));
        setHasMorePosts(true);
        updateWorkoutList(visibleWorkouts.length > 4 ? visibleWorkouts.length : 4);
    }, [posts])

    useEffect(() => {
        updateWorkoutList(4);
        if (posts.length === visiblePosts.length) setHasMorePosts(false);
    }, [])

    return (
        <View>
            <VStack space="2xl">
              <VStack>
                <Heading size="2xl">Profile Summary</Heading>
                <Card variant="outline"></Card>
              </VStack>
              <VStack>
                <Heading size="2xl">Workout History</Heading>
                <Card variant="outline">
                    {isLoading && (
                        <Text>Loading Workouts...</Text>
                    )}

                    {visibleWorkouts && posts.length === 0 && !isLoading && (
                        <Text>No Workouts found. Finish a workout to see some here!</Text>
                    )}

                    {visibleWorkouts && visibleWorkouts.map((post) => (
                        post.workoutData && (
                            <TouchableOpacity
                                key={post.id}
                                onPress={() => {
                                    if (selectedWorkout !== post.id) {
                                        setSelectedWorkout(post.id);
                                    } else {
                                        setSelectedWorkout(null);
                                    }
                                }}
                            >
                                {selectedWorkout === post.id ? (
                                    <SummaryWorkoutData workoutData={post.workoutData} date={formatTime(post.createdAt)}></SummaryWorkoutData>
                                ) : (
                                    <WorkoutHeader dateTime={formatDate(post.createdAt)} duration={formatDuration(post.workoutData.duration!)}></WorkoutHeader>
                                )}
                            </TouchableOpacity>
                        )
                    ))}
                </Card>
                {posts && posts.length > 0 && hasMoreWorkouts && (
                    <Button
                        onPress={() => { updateWorkoutList(visibleWorkouts.length + 10) }}
                    >
                        <ButtonText>{'Render more workouts'}</ButtonText>
                    </Button>
                )}
              </VStack>
                <Heading size="2xl">Post History</Heading>
                <Card variant="outline">
                    {isLoading && (
                        <Text>Loading posts...</Text>
                    )}

                    {visiblePosts && posts.length === 0 && !isLoading && (
                        <Text>No posts found. Post a workout to see some here!</Text>
                    )}

                    {visiblePosts && visiblePosts.map((post) => (
                        <WorkoutPost
                            id={post.profile?.userId || ""}
                            key={post.id}
                            postId={post.id}
                            username={post.profile?.username || "Unknown user"}
                            name={post.profile?.name || "Unkown user"}
                            avatar={post.profile?.avatar || ""}
                            date={formatDate(post.createdAt)}
                            title={post.title || ""}
                            description={post.description || ""}
                            exercises={
                                post.workoutData?.exercises ?
                                    post.workoutData.exercises.map(exercise => {
                                        if ('info' in exercise && exercise.info && exercise.info.name) {
                                            return {
                                                name: exercise.info.name,
                                                ...(exercise.sets && exercise.sets.length > 0 ? {
                                                    sets: exercise.sets.length,
                                                    reps: exercise.sets[0]?.reps,
                                                    weight: exercise.sets[0]?.weight ? String(exercise.sets[0].weight) : undefined
                                                } : {})
                                            };
                                        }
                                        else if ('name' in exercise) {
                                            return {
                                                name: exercise.name,
                                                sets: exercise.sets,
                                                reps: exercise.reps,
                                                weight: exercise.weight ? String(exercise.weight) : undefined
                                            };
                                        }
                                        return { name: 'Unknown exercise' };
                                    })
                                    : []
                            }
                            workoutDuration={post.workoutData?.duration || undefined}
                            workoutCalories={post.workoutData?.calories || undefined}
                            userId={session?.user.id!}
                            comments={post.comments}
                            imageUrls={post.images || undefined}
                            weighIn={post.weighIn}
                            isOwnPost={true}
                            taggedFriends={post.taggedFriendsData}
                            onUpdatePost={updatePostFunc}
                        />
                    ))}
                </Card>
                {posts && posts.length > 0 && hasMorePosts && (
                    <Button
                        onPress={addMorePostsToView}
                    >
                        <ButtonText>{'Render more posts'}</ButtonText>
                    </Button>
                )}
            </VStack>
        </View>
    );
}