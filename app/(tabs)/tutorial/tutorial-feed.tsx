import { Text } from "@/components/ui/text";
import { Text as GText } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Pressable } from "@/components/ui/pressable";
import { Button, ButtonText } from "@/components/ui/button";
import {
  Icon,
  ChevronLeftIcon,
  HelpCircleIcon,
} from "@/components/ui/icon";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";

import { View, StyleSheet, ScrollView } from "react-native";
import { useSession } from "@/components/SessionContext";
import { feedStyles } from "../feed";
import { useNavigation } from "@react-navigation/native";
import Container from "@/components/Container";
import { Card } from "@/components/ui/card";
import {
  AttachStep,
  SpotlightTourProvider,
  TourStep,
  flip,
  offset,
  shift,
} from "react-native-spotlight-tour";
import { TaggedFriend, workoutPostStyles } from "@/components/WorkoutPost";
import { TutorialWorkoutPost } from "@/components/tutorial/TutorialWorkoutPost";
import { Profile } from "@/types/profile-types";
import { Modal, ModalBackdrop, ModalContent, ModalHeader, ModalBody } from "@/components/ui/modal";
import { Heading } from "@/components/ui/heading";
import { Avatar, AvatarFallbackText, AvatarImage } from "@/components/ui/avatar";
import { Image } from "@/components/ui/image";


export default function TutorialFeedScreen() {


  const exercisePost = {
    id: "p1",
    username: "janekova",
    name: "Jane Kova",
    avatar: "",
    date: "Apr 12, 2025",
    title: "Leg Day Merchant",
    description: "Destroyed leg day today. Coming for that new PB!",
    exercises: ["Front Squat", "Back Squat", "Single-Leg Calf Raises", "Deadlifts", "Cable Leg Extensions", "Dumbbell Snatch"],
    images: [],
    isOwnPost: true,
    taggedFriends: []
  }

  const imageExercisePost = {
    id: "p2",
    username: "lebronjames",
    name: "Lebron James",
    avatar: "https://spntxjldrghjrhyhhncu.supabase.co/storage/v1/object/public/post-images/7d57b4ea-5be5-46cb-a6b8-f2b38893a65b/EF9FA306-5D76-4464-B0BA-6EE807269BAC.jpg",
    date: "Apr 11, 2025",
    title: "Training for Next Season",
    description: "Got a great pump today hitting arms. Feeling good. (Me in the image below).",
    exercises: ["Bench Press", "Dumbbell V-ups", "Skull Crushers", "Superman"],
    images: ["https://spntxjldrghjrhyhhncu.supabase.co/storage/v1/object/public/post-images/bb0cdd1f-4319-4896-8a23-826282bbf873/822391E4-9822-4639-B831-5D773B0DE03F.jpg"],
    isOwnPost: true,
    taggedFriends: []
  }

  const imageThree = {
    id: "p3",
    username: "jkovafan1029",
    name: "John Kova Fan 1029",
    avatar: "https://spntxjldrghjrhyhhncu.supabase.co/storage/v1/object/public/post-images/tutorial/CM.jpeg",
    date: "Apr 7, 2025",
    title: "John Kova Is King",
    description: "Just a reminder that John Kova is the king of lifting.",
    exercises: [],
    images: ["https://spntxjldrghjrhyhhncu.supabase.co/storage/v1/object/public/post-images/tutorial/John%20Kova.jpeg"],
    isOwnPost: true,
    taggedFriends: [] as TaggedFriend[]
  }

  const imageFour = {
    id: "p4",
    username: "oldgeezer",
    name: "Centennial Sigma",
    avatar: "https://spntxjldrghjrhyhhncu.supabase.co/storage/v1/object/public/post-images/tutorial/OldMan.jpeg",
    date: "Mar 30th, 2025",
    title: "80 lbs bench today",
    description: "Still got it.",
    exercises: ["Bench Press", "Side Plank", "T-Bar Row"],
    images: ["https://spntxjldrghjrhyhhncu.supabase.co/storage/v1/object/public/post-images/tutorial/OldMan.jpeg"],
    isOwnPost: true,
    taggedFriends: [
      {
        userId: "",
        name: "Purdue Pete",
        avatar: "https://spntxjldrghjrhyhhncu.supabase.co/storage/v1/object/public/profile-images/7d57b4ea-5be5-46cb-a6b8-f2b38893a65b/E0A9554D-3BAD-4756-BC01-6169A955E323.jpg"
      }
    ]
  }

  const mySteps: TourStep[] = [
    {
      render: ({next, stop}) => {
        return (
          <View style={styles.stepContainer}>
            <VStack>
            <Text style={styles.stepTitle}>Individual Post</Text>
            <Text className="text-wrap mb-4">You can see a summary of the post here. You can also tap on it to enlarge it to see a detailed view of the post, copy a workout template, and leave a comment</Text>
            </VStack>
              <Button onPress={() => {next(); scrollMore(450); }} action='kova'>
                <ButtonText size='lg'>Next</ButtonText>
              </Button>
            <Pressable onPress = {() => {stop(); router.replace(`/profiles/${session?.user.id}`); leaveTutorial();}} className = "pb-2 border-b border-gray-300 mt-4">
              <Text size="lg"><Icon as = {ChevronLeftIcon} className = "h-3.5 w-4"></Icon>Leave Tutorial</Text>
            </Pressable>
          </View>
        );
      }
    },
    {
      floatingProps: {
        middleware: [offset(-100), shift(), flip()],
      },
      render: ({previous, next, stop}) => {
        return (
          <View style={styles.stepContainer}>
            <VStack>
            <Text style={styles.stepTitle}>Additional Post Summary Details</Text>
            <Text className="text-wrap mb-4">The post summary also will let you scroll through images attached to the post and view which exercises the person performed if their post is a workout</Text>
            </VStack>
            <View style={styles.buttonContainer}>
              <Button onPress={() => {previous(); scrollMore(-450);}} action='kova'>
                <ButtonText size='lg'>Previous</ButtonText>
              </Button>
              <View style={styles.buttonSpacer} />
              <Button onPress={() => {next(); scrollMore(450);}} action='kova'>
                <ButtonText size='lg'>Next</ButtonText>
              </Button>
            </View>
            <Pressable onPress = {() => {stop(); router.replace(`/profiles/${session?.user.id}`); leaveTutorial();}} className = "pb-2 border-b border-gray-300 mt-4">
              <Text size="lg"><Icon as = {ChevronLeftIcon} className = "h-3.5 w-4"></Icon>Leave Tutorial</Text>
            </Pressable>
          </View>
        );
      }
    },
    {
      floatingProps: {
        middleware: [offset(0), shift(), flip()],
      },
      render: ({previous, next, stop}) => {
        return (
          <View style={styles.stepContainer}>
            <VStack>
            <Text style={styles.stepTitle}>Actions with posts</Text>
            <Text className="text-wrap mb-4">Additionally, you are able to like a post by clicking the heart icon and visit the posters profile by clicking their avatar.</Text>
            </VStack>
            <View style={styles.buttonContainer}>
              <Button onPress={() => {previous(); scrollMore(-450);}} action='kova'>
                <ButtonText size='lg'>Previous</ButtonText>
              </Button>
              <View style={styles.buttonSpacer} />
              <Button onPress={() => {next(); scrollMore(450);}} action='kova'>
                <ButtonText size='lg'>Next</ButtonText>
              </Button>
            </View>
            <Pressable onPress = {() => {stop(); router.replace(`/profiles/${session?.user.id}`); leaveTutorial();}} className = "pb-2 border-b border-gray-300 mt-4">
              <Text size="lg"><Icon as = {ChevronLeftIcon} className = "h-3.5 w-4"></Icon>Leave Tutorial</Text>
            </Pressable>
          </View>
        );
      }
    },
    {
      render: ({previous, next, stop}) => {
        return (
          <View style={styles.stepContainer}>
            <VStack>
            <Text style={styles.stepTitle}>Render More Posts</Text>
            <Text className="text-wrap mb-4">You can scroll for as many posts as you like. Clicking this button will render more for you to view</Text>
            </VStack>
            <View style={styles.buttonContainer}>
              <Button onPress={() => {previous(); scrollMore(-450);}} action='kova'>
                <ButtonText size='lg'>Previous</ButtonText>
              </Button>
              <View style={styles.buttonSpacer} />
              <Button onPress={() => {next(); scrollMore(-1350);}} action='kova'>
                <ButtonText size='lg'>Next</ButtonText>
              </Button>
            </View>
            <Pressable onPress = {() => {stop(); router.replace(`/profiles/${session?.user.id}`); leaveTutorial();}} className = "pb-2 border-b border-gray-300 mt-4">
              <Text size="lg"><Icon as = {ChevronLeftIcon} className = "h-3.5 w-4"></Icon>Leave Tutorial</Text>
            </Pressable>
          </View>
        );
      }
    },
    {
      render: ({previous, stop}) => {
        return (
          <View style={styles.stepContainer}>
            <VStack>
            <Text style={styles.stepTitle}>View this Tutorial Again</Text>
            <Text className="text-wrap mb-4">In case you ever need to review the tutorial, just tap this icon on your feed to view this tutorial again.</Text>
            </VStack>
            <View style={styles.buttonContainer}>
              <Button onPress={() => {previous(); scrollMore(1350);}} action='kova'>
                <ButtonText size='lg'>Previous</ButtonText>
              </Button>
              <View style={styles.buttonSpacer} />
              <Button onPress={() => {stop(); router.replace(`/profiles/${session?.user.id}`); leaveTutorial();}} action='kova'>
                <ButtonText size='lg'>End Tutorial</ButtonText>
              </Button>
            </View>
            <Pressable onPress = {() => {stop(); router.replace(`/profiles/${session?.user.id}`); leaveTutorial();}} className = "pb-2 border-b border-gray-300 mt-4">
              <Text size="lg"><Icon as = {ChevronLeftIcon} className = "h-3.5 w-4"></Icon>Leave Tutorial</Text>
            </Pressable>
          </View>
        );
      }
    },
  ];

  const [renderPopover, setRenderPopover] = useState(false);
  const scrollRef = useRef<ScrollView>(null)
  const [scrolly, setScrolly] = useState(0);

  const scrollMore = (y: number) => {
    scrollRef.current?.scrollTo({y: scrolly + y, animated: true})
    setScrolly(y + scrolly)
  }

  const router = useRouter();
  const navigation = useNavigation();
  const { session, showTutorial, updateShowTutorial} = useSession();

  const leaveTutorial = () => {
    updateShowTutorial(false);
    router.replace(`/profiles/${session?.user.id}`);
    setRenderPopover(false);
  }

  useEffect(() => {
    setScrolly(0);
    scrollMore(0);
    const timer = setTimeout(() => {
      setRenderPopover(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
      const unsubscribe = navigation.addListener('focus', () => {
        {
          setScrolly(0);
          scrollMore(0);
          const timer = setTimeout(() => {
            setRenderPopover(true);
          }, 100);
          
          return () => clearTimeout(timer);
        }
      });
  
      return unsubscribe;
    }, [navigation]);     

  return (

    <SpotlightTourProvider
      steps={mySteps}
      overlayColor="gray"
      overlayOpacity={0.7}
      floatingProps={{
        middleware: [offset(5), shift(), flip()],
        placement: "bottom",
      }}
    >
      {({ start }) => (
      <ScrollView keyboardShouldPersistTaps="handled" style={feedStyles.scrollView} ref={scrollRef}>
        <Container>

            <Modal
              isOpen={renderPopover}
              onClose={() => setRenderPopover(false)} //TODO remove this later so users can't back out of tutorial
              size="md"
            >
            <ModalBackdrop />
            <ModalContent>
              <ModalHeader className="justify-center">
                <Heading size="xl" className="mb-3">This is your feed page</Heading>
              </ModalHeader>
              <ModalBody>
                <Button onPress={() => { start(); setRenderPopover(false); }} action='kova'>
                  <ButtonText size='lg'>Next</ButtonText>
                </Button>
                <Pressable onPress = {leaveTutorial} className = "pb-2 border-b border-gray-300 mt-4">
                  <Text size="lg"><Icon as = {ChevronLeftIcon} className = "h-3.5 w-4"></Icon>Leave Tutorial</Text>
                </Pressable>
              </ModalBody>
            </ModalContent>
          </Modal>

          <View style={feedStyles.header}>
            <HStack className="justify-between">
            <Text style={feedStyles.headerTitle} size="xl" bold>
              Workout Feed
            </Text>
              <Button className="w-0 h-0">
                <AttachStep index={4}>
                <Icon
                  as={HelpCircleIcon}
                  size="xl"
                  className="mt-8 ml-8 w-8 h-8"
                ></Icon>
                </AttachStep>
              </Button>
            </HStack>
          </View>

          <Card variant="outline">
            <AttachStep index={0}>
              <TutorialWorkoutPost
                  username={exercisePost.username || "Unknown user"}
                  name={exercisePost.name || "Unkown user"}
                  avatar={exercisePost.avatar}
                  date={exercisePost.date}
                  title={exercisePost.title || ""}
                  description={exercisePost.description || ""}
                  exercises={exercisePost.exercises}
                  imageUrls={exercisePost.images || undefined}
                  isOwnPost={false}
                  taggedFriends={exercisePost.taggedFriends}
              />
            </AttachStep>
            <AttachStep index={1} fill={true}>
              <TutorialWorkoutPost
                  username={imageExercisePost.username || "Unknown user"}
                  name={imageExercisePost.name || "Unkown user"}
                  avatar={imageExercisePost.avatar}
                  date={imageExercisePost.date}
                  title={imageExercisePost.title || ""}
                  description={imageExercisePost.description || ""}
                  exercises={imageExercisePost.exercises}
                  imageUrls={imageExercisePost.images || undefined}
                  isOwnPost={false}
                  taggedFriends={imageExercisePost.taggedFriends}
              />
            </AttachStep>

                    <View style={workoutPostStyles.container}>
                      {/* Header */}
                      <View style={workoutPostStyles.header}>
                          <View style={workoutPostStyles.userInfo}>
                            <View style={workoutPostStyles.avatar}>
                              <Avatar className="bg-indigo-600">
                                {imageThree.avatar ? (
                                  <AvatarImage source={{ uri: imageThree.avatar }}></AvatarImage>
                                ) : (
                                  <AvatarFallbackText className="text-white">
                                    {imageThree.name}
                                  </AvatarFallbackText>
                                )}
                              </Avatar>
                            </View>
                            <View>
                              <HStack space="sm">
                                <Heading>{imageThree.name}</Heading>
                                <GText size="sm" className="mt-1">
                                  (@{imageThree.username})
                                </GText>
                              </HStack>
                              <Text style={workoutPostStyles.date}>{imageThree.date}</Text>
                            </View>
                          </View>
                        <View style={workoutPostStyles.headerActions}>
                        </View>
                      </View>
                      {/* Content */}
                      <View style={workoutPostStyles.content}>
                          <Text style={workoutPostStyles.title}>{imageThree.title}</Text>
                          {imageThree.description.length > 0 ? (
                            <Text
                              style={[
                                workoutPostStyles.description,
                                false
                                  ? workoutPostStyles.expandedDescription
                                  : workoutPostStyles.collapsedDescription,
                              ]}
                              numberOfLines={false ? undefined : 2}
                            >
                              {imageThree.description}
                            </Text>
                          ) : (<></>)}
                          {/* Exercise Tags */}
                          <View style={workoutPostStyles.exerciseTags}>
                            {imageThree.exercises.map((exercise, index) => (
                              <View key={index} style={workoutPostStyles.tag}>
                                <Text style={workoutPostStyles.tagText}>{exercise}</Text>
                              </View>
                            ))}
                          </View>
                        {/* Workout Image */}
                        {imageThree.images && imageThree.images.length > 0 ? (
                          <ScrollView horizontal style={{ marginBottom: 12 }}>
                            <HStack space = "md">
                              {imageThree.images.map((url, index) => (
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
                        {imageThree.taggedFriends.length > 0 && (
                          <View style={workoutPostStyles.taggedFriendsContainer}>
                            <HStack className = "flex-wrap">
                              <GText>With </GText>
                              {imageThree.taggedFriends.map((friend, index) => (
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
                                      {index < imageThree.taggedFriends.length - 1 ? ", " : ""}
                                    </GText>
                                  </HStack>
                                </Pressable>
                              ))}
                            </HStack>
                          </View>
                        )}

                        {/* Engagement */}
                        <AttachStep index={2} fill={true}>
                        <View style={workoutPostStyles.engagement} className="w-1/3">
                              <Text>
                                {"♡ 0   "}
                              </Text>
                            <Text>
                              💬 0
                            </Text>
                        </View>
                        </AttachStep>
                      </View>
                    </View>
              
            <TutorialWorkoutPost
                  username={imageFour.username || "Unknown user"}
                  name={imageFour.name || "Unkown user"}
                  avatar={imageFour.avatar}
                  date={imageFour.date}
                  title={imageFour.title || ""}
                  description={imageFour.description || ""}
                  exercises={imageFour.exercises}
                  imageUrls={imageFour.images || undefined}
                  isOwnPost={false}
                  taggedFriends={imageFour.taggedFriends}
              />
          </Card>
          <AttachStep index={3}>
          <Button>
              <ButtonText>{'Render more posts'}</ButtonText>
          </Button>
          </AttachStep>

        </Container>
      </ScrollView>
      )}
    </SpotlightTourProvider>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    maxWidth: 300,
    borderColor: "black",
    borderWidth: 1
  },
  section: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonSpacer: {
    width: 10,
  },
});
