import StaticContainer from "@/components/StaticContainer";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Box } from "@/components/ui/box";
import { Pressable } from "@/components/ui/pressable";
import { Input, InputField, InputSlot, InputIcon } from "@/components/ui/input";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import {
  Icon,
  MenuIcon,
  TrashIcon,
  CheckCircleIcon,
  CircleIcon,
  AlertCircleIcon,
  EditIcon,
  CloseIcon,
  SearchIcon,
  ArrowRightIcon,
  InfoIcon,
  ChevronLeftIcon,
} from "@/components/ui/icon";
import { usePathname, useRouter, useSegments } from "expo-router";
import {
  getProfile,
  updateProfile,
  isProfileFollowed,
  isProfileFollowing,
  followUser,
  unfollowUser,
  uploadProfilePicture,
  privacies,
  getProfilePrivacies,
} from "@/services/profileServices";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { Spinner } from "@/components/ui/spinner";
import { getProfileAccess, Profile } from "@/types/profile-types";
import { supabase } from "@/lib/supabase";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ui/toast";
import {
  showErrorToast,
  showSuccessToast,
  showFollowToast,
} from "@/services/toastServices";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import * as ImagePicker from "expo-image-picker";
import { Badge, BadgeText, BadgeIcon } from "@/components/ui/badge";
import { View, StyleSheet, Dimensions, ScrollView } from "react-native";
import {
  RadioGroup,
  Radio,
  RadioIndicator,
  RadioIcon,
  RadioLabel,
} from "@/components/ui/radio";
import { useSession } from "@/components/SessionContext";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ProfileActivities } from "@/components/ProfileActivities";
import { Post } from "../feed";
import { useNavigation } from "@react-navigation/native";
import { getWeightEntries } from "@/services/weightServices";
import Container from "@/components/Container";
import { getAllGroups, getUserGroups } from "@/services/groupServices";
import GroupCard from "@/components/GroupCard";
import FavoriteExercises from "@/components/FavoriteExercises";
import { GroupOverview } from "@/types/extended-types";
import { Card } from "@/components/ui/card";
import {
  AttachStep,
  SpotlightTourProvider,
  TourStep,
  flip,
  offset,
  shift,
  useSpotlightTour,
} from "react-native-spotlight-tour";
import { Modal, ModalBackdrop, ModalCloseButton, ModalContent, ModalHeader, ModalBody } from "@/components/ui/modal";
import ExerciseCard from "@/components/forms/workout-template/ExerciseCard";
import Tag, { TagString } from "@/components/Tag";
import { Tables } from "@/types/database.types";
import { Ionicons } from "@expo/vector-icons";
import { LineChart, BarChart } from 'react-native-chart-kit';
import { TaggedFriend, WorkoutPost } from "@/components/WorkoutPost";
import { TutorialWorkoutPost } from "@/components/tutorial/TutorialWorkoutPost";
import { WorkoutHeader } from "@/components/WorkoutData";

export default function TutorialProfileScreen1() {

  const demoProfile = {  //Every empty string is an unused element for this tutorial page
    id: "",
    user_id: "",
    username: "jkova",
    name: "John Kova",
    avatar: "https://spntxjldrghjrhyhhncu.supabase.co/storage/v1/object/public/post-images/tutorial/John%20Kova.jpeg",
    private: "",
    friends: 13,
    following: 25,
    followers: 1000,
    age: 21,
    gender: "Male",
    weight: 280,
    location: "Purdue University, West Lafayette",
    goal: "Becoming the strongest man on the block",
    bio: "The entire world shall know the name John Kova. Tremble from my almighty power.",
    achievement: "Benching 350 lbs",
    privacy_settings: "",
  } as Profile;

  const groups = [{
    groupId: "",
    icon: "",
    goal: "Achieve a fraction of his majesty's power",
    title: "John Kova Cult",
  },
  {
    groupId: "",
    icon: "https://spntxjldrghjrhyhhncu.supabase.co/storage/v1/object/public/post-images/tutorial/Waltuh.jpeg",
    goal: "Jesse, we need to lift. I am the one who benches.",
    title: "Breaking Benches",
  },
  {
    groupId: "",
    icon: "",
    goal: "Getting huge together.",
    title: "Bar Brothers"
  }] as GroupOverview[];

  const favoriteExercises = [{
    created_at: "",
    details: null,
    id: "1",
    name: "Pull ups",
    tags: ["Back", "Biceps", "Lats", "Forearms", "Grip"],
    favorited: true
  },
  {
    created_at: "",
    details: null,
    id: "2",
    name: "Front Squats",
    tags: ["Legs", "Core", "Glutes", "Quadriceps"],
    favorited: true
  },
  {
    created_at: "",
    details: null,
    id: "3",
    name: "Deadlifts",
    tags: ["Back", "Legs", "Core", "Glutes", "Hamstrings", "Traps", "Forearms", "Grip"],
    favorited: true
  },
  {
    created_at: "",
    details: null,
    id: "4",
    name: "Dumbbell Shoulder Press",
    tags: ["Shoulders", "Triceps", "Deltoids"],
    favorited: true
  },]

  const popularExercises = [{
    name: "Pull ups",
    weight: 15,
    unit: "lbs",
    count: 134,
    tags: ["Back", "Biceps", "Lats", "Forearms", "Grip"],
  },
  {
    name: "Deadlifts",
    weight: 275,
    unit: "lbs",
    count: 117,
    tags: ["Back", "Legs", "Core", "Glutes", "Hamstrings", "Traps", "Forearms", "Grip"],
  },
  {
    name: "Single-Leg Calf Raises",
    weight: 35,
    unit: "lbs",
    count: 99,
    tags: ["Legs", "Calves", "Stability"],
  },
  {
    name: "Russian Twists",
    weight: 25,
    unit: "lbs",
    count: 88,
    tags: ["Core", "Abs", "Obliques"],
  },];

  const visiblePosts = [{
    id: "p1",
    username: "jkova",
    name: "John Kova",
    avatar: "",
    date: "Apr 12, 2025",
    title: "Saturday Grind Day",
    description: "Hit a great pump today. Finishing out the week strong. Won't be posting so much next week. I've got to go and save some orphans from Detroit and volunteer at the soup kitchen next week.",
    exercises: ["Front Squat", "Medicine Ball Slams", "Single-Leg Calf Raises", "Deadlifts"],
    images: [],
    isOwnPost: true,
    taggedFriends: []
  },
  {
    id: "p2",
    username: "jkova",
    name: "John Kova",
    avatar: "",
    date: "Apr 12, 2025",
    title: "Crazy Ford Protein Hamburger",
    description: "Be sure to try out the new CRAZY protein hamburger from Ford Dining Court.",
    exercises: [],
    images: ["https://spntxjldrghjrhyhhncu.supabase.co/storage/v1/object/public/post-images/tutorial/Crazy_Protein.jpeg"],
    isOwnPost: true,
    taggedFriends: []
  },
  {
    id: "p3",
    username: "jkova",
    name: "John Kova",
    avatar: "",
    date: "Apr 11, 2025",
    title: "Call me the Pumper",
    description: "Just another Friday for the OG. Shoutout to my boy Purdue Pete for his spotting today.",
    exercises: ["Front Squat", "Dumbbell Shoulder Press", "Russian Twists"],
    images: [],
    isOwnPost: true,
    taggedFriends: [
      {
        userId: "",
        name: "Purdue Pete",
        avatar: "https://spntxjldrghjrhyhhncu.supabase.co/storage/v1/object/public/profile-images/7d57b4ea-5be5-46cb-a6b8-f2b38893a65b/E0A9554D-3BAD-4756-BC01-6169A955E323.jpg"
      }
    ] as TaggedFriend[]
  },
  {
    id: "p4",
    username: "jkova",
    name: "John Kova",
    avatar: "",
    date: "Apr 11, 2025",
    title: "I... Am Steve.",
    description: "Minecraft movie was the experience of a lifetime. Make sure you hit the minecraft movie after you hit the gym today.",
    exercises: [],
    images: [],
    isOwnPost: true,
    taggedFriends: []
  },]

  const visibleWorkouts = [{
    id: "w1",
    date: "Apr 12, 2025",
    duration: "50 Min"
  }, 
  {
    id: "w2",
    date: "Apr 11, 2025",
    duration: "56 Min"
  },
  {
    id: "w3",
    date: "Apr 10, 2025",
    duration: "49 Min"
  },
  {
    id: "w4",
    date: "Apr 9, 2025",
    duration: "77 Min"
  },]

  const mySteps: TourStep[] = [
    {
      render: ({ next, stop }) => (
        <View style={styles.stepContainer}>
          <HStack>
          <Text style={styles.stepTitle}>This is your profile page</Text>
          </HStack>
          <Text className="text-wrap mb-4">You can see a breakdown of your profile, edit your profile, and access your friends and followers by tapping on the friends, followers, or following numbers</Text>
            <Button onPress={next} action='kova'>
              <ButtonText size='lg'>Next</ButtonText>
            </Button>
            <Pressable onPress = {() => {router.replace(`/profiles/${session?.user.id}`); stop();}} className = "pb-2 border-b border-gray-300 mt-4">
              <Text size="lg"><Icon as = {ChevronLeftIcon} className = "h-3.5 w-4"></Icon>Leave Tutorial</Text>
            </Pressable>
        </View>
      )
    },
    {
      render: ({previous, next, stop}) => {
        return (
          <View style={styles.stepContainer}>
            <VStack>
            <Text style={styles.stepTitle}>This is the bottom bar</Text>
            <Text className="text-wrap mb-4">Here, you can navigate between your profile, group page, feed, create a new post, or start a workout</Text>
            </VStack>
            <View style={styles.buttonContainer}>
              <Button onPress={previous} action='kova'>
                <ButtonText size='lg'>Previous</ButtonText>
              </Button>
              <View style={styles.buttonSpacer} />
              <Button onPress={() => {next()}} action='kova'>
                <ButtonText size='lg'>Next</ButtonText>
              </Button>
            </View>
            <Pressable onPress = {() => {stop(); router.replace(`/profiles/${session?.user.id}`);}} className = "pb-2 border-b border-gray-300 mt-4">
              <Text size="lg"><Icon as = {ChevronLeftIcon} className = "h-3.5 w-4"></Icon>Leave Tutorial</Text>
            </Pressable>
          </View>
        );
      }
    },
    {
      render: ({ next, previous, stop }) => (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Access the settings page</Text>
          <Text className="text-wrap mb-4">You can log out and modify your account through this menu</Text>
            <View style={styles.buttonContainer}>
            <Button onPress={previous} action='kova'>
              <ButtonText size='lg'>Previous</ButtonText>
            </Button>
            <View style={styles.buttonSpacer} />
            <Button onPress={() => {next(); scrollMore(100);}} action='kova'>
              <ButtonText size='lg'>Next</ButtonText>
            </Button>
          </View>
          <Pressable onPress = {() => {router.replace(`/profiles/${session?.user.id}`); stop();}} className = "pb-2 border-b border-gray-300 mt-4">
            <Text size="lg"><Icon as = {ChevronLeftIcon} className = "h-3.5 w-4"></Icon>Leave Tutorial</Text>
          </Pressable>
        </View>
      )
    },
    {
      render: ({ next, previous, stop }) => (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>View your groups</Text>
          <Text className="text-wrap mb-4">You can see a brief description of them here, and access them by tapping them or going through the groups tab</Text>
            <View style={styles.buttonContainer}>
            <Button onPress={() => {previous(); scrollMore(-100);}} action='kova'>
              <ButtonText size='lg'>Previous</ButtonText>
            </Button>
            <View style={styles.buttonSpacer} />
            <Button onPress={() => {next(); scrollMore(600);}} action='kova'>
              <ButtonText size='lg'>Next</ButtonText>
            </Button>
          </View>
          <Pressable onPress = {() => {router.replace(`/profiles/${session?.user.id}`); stop();}} className = "pb-2 border-b border-gray-300 mt-4">
            <Text size="lg"><Icon as = {ChevronLeftIcon} className = "h-3.5 w-4"></Icon>Leave Tutorial</Text>
          </Pressable>
        </View>
      )
    },
    {
      floatingProps:{
        middleware: [offset(-150), shift(), flip()],
      },
      render: ({ next, previous, stop }) => (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Breakdown of exercises you've favorited</Text>
          <Text className="text-wrap mb-4">Exercises can be favorited by tapping on the blue ribbon here, or when creating a template</Text>
            <View style={styles.buttonContainer}>
            <Button onPress={() => {previous(); scrollMore(-600);}} action='kova'>
              <ButtonText size='lg'>Previous</ButtonText>
            </Button>
            <View style={styles.buttonSpacer} />
            <Button onPress={() => {next(); scrollMore(600);}} action='kova'>
              <ButtonText size='lg'>Next</ButtonText>
            </Button>
          </View>
          <Pressable onPress = {() => {router.replace(`/profiles/${session?.user.id}`); stop();}} className = "pb-2 border-b border-gray-300 mt-4">
            <Text size="lg"><Icon as = {ChevronLeftIcon} className = "h-3.5 w-4"></Icon>Leave Tutorial</Text>
          </Pressable>
        </View>
      )
    },
    {
      render: ({ next, previous, stop }) => (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Summary of your profile</Text>
          <Text className="text-wrap mb-4">The summary includes workout statistics, most popular exercises, workout history, and post history.</Text>
            <View style={styles.buttonContainer}>
            <Button onPress={() => {previous(); scrollMore(-600);}} action='kova'>
              <ButtonText size='lg'>Previous</ButtonText>
            </Button>
            <View style={styles.buttonSpacer} />
            <Button onPress={() => {next();}} action='kova'>
              <ButtonText size='lg'>Next</ButtonText>
            </Button>
          </View>
          <Pressable onPress = {() => {router.replace(`/profiles/${session?.user.id}`); stop();}} className = "pb-2 border-b border-gray-300 mt-4">
            <Text size="lg"><Icon as = {ChevronLeftIcon} className = "h-3.5 w-4"></Icon>Leave Tutorial</Text>
          </Pressable>
        </View>
      )
    },
    {
      floatingProps:{
        middleware: [offset(-150), shift(), flip()],
      },
      render: ({ next, previous, stop }) => (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>View workout data over different time periods</Text>
          <Text className="text-wrap mb-4">Change what timeframe this graph data is displayed from by tapping the above icons</Text>
            <View style={styles.buttonContainer}>
            <Button onPress={previous} action='kova'>
              <ButtonText size='lg'>Previous</ButtonText>
            </Button>
            <View style={styles.buttonSpacer} />
            <Button onPress={() => {next(); scrollMore(600);}} action='kova'>
              <ButtonText size='lg'>Next</ButtonText>
            </Button>
          </View>
          <Pressable onPress = {() => {router.replace(`/profiles/${session?.user.id}`); stop();}} className = "pb-2 border-b border-gray-300 mt-4">
            <Text size="lg"><Icon as = {ChevronLeftIcon} className = "h-3.5 w-4"></Icon>Leave Tutorial</Text>
          </Pressable>
        </View>
      )
    },
    {
      floatingProps:{
        middleware: [offset(-300), shift(), flip()],
      },
      render: ({ next, previous, stop }) => (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>View most popular exercises</Text>
          <Text className="text-wrap mb-4">These exercises are the ones which you've performed the most sets on</Text>
            <View style={styles.buttonContainer}>
            <Button onPress={() => {previous(); scrollMore(-600);}} action='kova'>
              <ButtonText size='lg'>Previous</ButtonText>
            </Button>
            <View style={styles.buttonSpacer} />
            <Button onPress={() => {next(); scrollMore(600);}} action='kova'>
              <ButtonText size='lg'>Next</ButtonText>
            </Button>
          </View>
          <Pressable onPress = {() => {router.replace(`/profiles/${session?.user.id}`); stop();}} className = "pb-2 border-b border-gray-300 mt-4">
            <Text size="lg"><Icon as = {ChevronLeftIcon} className = "h-3.5 w-4"></Icon>Leave Tutorial</Text>
          </Pressable>
        </View>
      )
    },
    {
      floatingProps:{
        middleware: [offset(-300), shift(), flip()],
      },
      render: ({ next, previous, stop }) => (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>View workout history</Text>
          <Text className="text-wrap mb-4">See all of your workouts that you've ever done! You can tap on one of the cards to see more details in your profile tab</Text>
            <View style={styles.buttonContainer}>
            <Button onPress={() => {previous(); scrollMore(-600);}} action='kova'>
              <ButtonText size='lg'>Previous</ButtonText>
            </Button>
            <View style={styles.buttonSpacer} />
            <Button onPress={() => {next(); scrollMore(600);}} action='kova'>
              <ButtonText size='lg'>Next</ButtonText>
            </Button>
          </View>
          <Pressable onPress = {() => {router.replace(`/profiles/${session?.user.id}`); stop();}} className = "pb-2 border-b border-gray-300 mt-4">
            <Text size="lg"><Icon as = {ChevronLeftIcon} className = "h-3.5 w-4"></Icon>Leave Tutorial</Text>
          </Pressable>
        </View>
      )
    },
    {
      floatingProps:{
        middleware: [offset(-300), shift(), flip()],
      },
      render: ({ next, previous, stop }) => (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>View post history</Text>
          <Text className="text-wrap mb-4">See all of your posts that you've ever made! You can enlarge the post in your profile view by tapping on it</Text>
            <View style={styles.buttonContainer}>
            <Button onPress={() => {previous(); scrollMore(-600);}} action='kova'>
              <ButtonText size='lg'>Previous</ButtonText>
            </Button>
            <View style={styles.buttonSpacer} />
            <Button onPress={() => {next(); scrollMore(1000);}} action='kova'>
              <ButtonText size='lg'>Next</ButtonText>
            </Button>
          </View>
          <Pressable onPress = {() => {router.replace(`/profiles/${session?.user.id}`); stop();}} className = "pb-2 border-b border-gray-300 mt-4">
            <Text size="lg"><Icon as = {ChevronLeftIcon} className = "h-3.5 w-4"></Icon>Leave Tutorial</Text>
          </Pressable>
        </View>
      )
    },
    {
      render: ({ next, previous, stop }) => (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>View First Four</Text>
          <Text className="text-wrap mb-4">For posts, workouts, and most popular exercises. The first 4 will always be listed when you enter the profile view, and you render more by pressing the render more button</Text>
            <View style={styles.buttonContainer}>
            <Button onPress={() => {previous(); scrollMore(-1000);}} action='kova'>
              <ButtonText size='lg'>Previous</ButtonText>
            </Button>
            <View style={styles.buttonSpacer} />
            <Button onPress={() => {next();}} action='kova'>
              <ButtonText size='lg'>Next</ButtonText>
            </Button>
          </View>
          <Pressable onPress = {() => {router.replace(`/profiles/${session?.user.id}`); stop();}} className = "pb-2 border-b border-gray-300 mt-4">
            <Text size="lg"><Icon as = {ChevronLeftIcon} className = "h-3.5 w-4"></Icon>Leave Tutorial</Text>
          </Pressable>
        </View>
      )
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
  const { session, showTutorial, updateShowTutorial } = useSession();

  useEffect(() => {
    // Short timeout to ensure component is fully mounted
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
      <ScrollView keyboardShouldPersistTaps="handled" ref={scrollRef}>
        <View className={"flex px-6 py-24 mb-12"}>

            <Modal
              isOpen={renderPopover}
              onClose={() => setRenderPopover(false)} //TODO remove this later so users can't back out of tutorial
              size="md"
            >
            <ModalBackdrop />
            <ModalContent>
              <ModalHeader className="justify-center">
                <Heading size="xl">Welcome to the Kova Tutorial</Heading>
              </ModalHeader>
              <ModalBody>
                <Button action="kova" onPress={() => {start(); setRenderPopover(false);}}>
                  <ButtonText size="md">
                    Start Kova Tutorial!
                  </ButtonText>
                </Button>
                <Button className="bg-blue-700 mt-5" onPress={async () => {
                  if (showTutorial) {
                    await updateShowTutorial(false);
                  }
                  router.replace(`/profiles/${session?.user.id}`);
                  setRenderPopover(false);}}>
                  <ButtonText size="md">
                    I know what I'm doing!
                  </ButtonText>
                </Button>
              </ModalBody>
            </ModalContent>
          </Modal>

              <VStack space="3xl">

                <AttachStep index={0}>
                <Box className="border-b border-gray-300 pb-2">
                <VStack space="lg">
                  <HStack space="md">
                  <Avatar className="bg-indigo-600 mt-1" size="xl">
                      {demoProfile.avatar ? (
                        <AvatarImage source={{ uri: demoProfile.avatar }} />
                      ) : (
                        <AvatarFallbackText className="text-white">
                          {demoProfile.name}
                        </AvatarFallbackText>
                      )}
                    </Avatar>
                    <VStack space="xs">
                      <VStack>
                        <HStack className="text-wrap">
                          <Heading size="xl" className="mb-0 h-8 w-56">
                            {demoProfile.name}
                          </Heading>
                        </HStack>
                        <Text size="sm">@{demoProfile.username}</Text>
                      </VStack>
                      <HStack space="2xl">
                        <VStack>
                          <Heading size="lg" className="text-center">
                            {demoProfile.friends}
                          </Heading>
                          <Text size="sm" className="text-center">
                            friends
                          </Text>
                        </VStack>
                        <VStack>
                          <Heading size="lg" className="text-center">
                            {demoProfile.followers}
                          </Heading>
                          <Text size="sm" className="text-center">
                            followers
                          </Text>
                        </VStack>
                        <VStack>
                          <Heading size="lg" className="text-center">
                            {demoProfile.following}
                          </Heading>
                          <Text size="sm" className="text-center">
                            following
                          </Text>
                        </VStack>
                      </HStack>
                    </VStack>
                    <Button
                      className="w-0 h-0"
                    >
                      <AttachStep index={2}>
                      <Icon
                        as={MenuIcon}
                        size="xl"
                        className="mt-8 ml-8 w-8 h-8"
                      ></Icon>
                      </AttachStep>
                    </Button>
                  </HStack>
                  <VStack>
                    <Box className="border border-gray-300 rounded p-2 mt-2">
                      <HStack className="text-wrap">
                        <Heading size="md" className="mr-1">
                          🎂:
                        </Heading>
                        <View className="w-11/12">
                          <Heading size="md">{demoProfile.age}</Heading>
                        </View>
                      </HStack>
                      <HStack className="text-wrap">
                        <Heading size="md" className="mr-1">
                          🚻:
                        </Heading>
                        <View className="w-11/12">
                          <Heading size="md">{demoProfile.gender}</Heading>
                        </View>
                      </HStack>
                      <HStack className="text-wrap">
                        <Heading size="md" className="mr-1">
                          ⚖️:
                        </Heading>
                        <View className="w-11/12">
                          <Heading size="md">{demoProfile.weight} lbs</Heading>
                        </View>
                      </HStack>
                      <HStack className="text-wrap">
                        <Heading size="md" className="mr-1">
                          📍:
                        </Heading>
                        <View className="w-11/12">
                          <Heading size="md">{demoProfile.location}</Heading>
                        </View>
                      </HStack>
                      <HStack className="text-wrap">
                        <Heading size="md" className="mr-1">
                          🏆:
                        </Heading>
                        <View className="w-11/12">
                          <Heading size="md">{demoProfile.achievement}</Heading>
                        </View>
                      </HStack>
                      <HStack className="text-wrap">
                        <Heading size="md" className="mr-1">
                          🎯:
                        </Heading>
                        <View className="w-11/12">
                          <Heading size="md">{demoProfile.goal}</Heading>
                        </View>
                      </HStack>
                      <Text className="mt-2">{demoProfile.bio}</Text>
                    </Box>
                  </VStack>
                  <VStack space="md">
                    <Button
                      size="lg"
                      variant="outline"
                      action="primary"
                      className="border-[#6FA8DC]"
                    >
                      <ButtonText className="text-[#6FA8DC]">
                        Edit Profile
                      </ButtonText>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      action="primary"
                      className="border-[#6FA8DC]"
                    >
                      <ButtonText className="text-[#6FA8DC]">
                        Weight Tracking
                      </ButtonText>
                    </Button>
                  </VStack>
                </VStack>
              </Box>
              </AttachStep>

              <AttachStep index={3}>
              <VStack space="sm">
                <Heading>Your Groups</Heading>
                <VStack space="md">
                  {groups.map((group) => (    //inlining group component for the tutorial TODO fix text-wrapping issue
                    <Card key={group.title} variant="outline">
                      <HStack space="2xl">
                      <Avatar className="bg-indigo-600" size="md">
                        {group?.icon ? (
                          <AvatarImage source={{ uri: group.icon }} />
                        ) : (
                          <AvatarFallbackText className="text-white">{group?.title![0]}</AvatarFallbackText>
                        )}
                      </Avatar>
                        <VStack>
                          <Heading size="md">{group.title}</Heading>
                          <Text>{group.goal}</Text>
                        </VStack>
                      </HStack>
                    </Card>
                  ))}
                </VStack>
              </VStack>
              </AttachStep>

              <VStack space="md">
                <AttachStep index={1}>
                <HStack className="items-center justify-between">
                  <Heading size="2xl">Favorite Exercises</Heading>
                  <Button variant="link">
                    <ButtonText>View All</ButtonText>
                    <ButtonIcon as={ArrowRightIcon} />
                  </Button>
                </HStack>
                </AttachStep>
                <AttachStep index={4}>
                  <VStack space="md">
                    <Input size="md">
                      <InputField
                        placeholder="Search for your favorite exercises"
                        value={""}
                      />
                      <InputSlot className="p-3">
                        <InputIcon as={SearchIcon} />
                      </InputSlot>
                    </Input>
                    {favoriteExercises
                      .filter(
                        (exercise) =>
                          exercise.name
                            ?.toLowerCase() ||
                          exercise.tags.filter((tag) =>
                            tag.toLowerCase()
                          ).length > 0
                      )
                      .map((exercise) => (
                        <Card key={exercise.name} variant="outline">
                        <VStack space="md">
                          <HStack className="items-center justify-between">
                            <Heading size="md">{exercise.name}</Heading>
                            <HStack space="md" className="justify-center">
                              {exercise.favorited != undefined && (
                                  <Ionicons
                                  color="#6fa8dc"
                                  name={exercise.favorited ? "bookmark" : "bookmark-outline"}
                                  size={24}
                                />
                                )
                              }
                              <Icon as={InfoIcon} size="xl" />
                            </HStack>
                          </HStack>
                          <Box className="flex flex-row flex-wrap gap-2">
                            {exercise.tags.map((tag: string) => (
                              <TagString key={tag} tag={tag} />
                            ))}
                          </Box>
                        </VStack>
                        </Card>
                      ))}
                  </VStack>
                  </AttachStep>
              </VStack>

                      <View className="mb-10">
                      <VStack space="2xl">
                        <VStack space="sm">
                          <AttachStep index={5}>
                          <Heading size="2xl">Profile Summary</Heading>
                          </AttachStep>
                          <Card variant="outline">
                            <HStack className="justify-between mb-4">
                              <RadioGroup value={"week"}>
                                <HStack space="xl">
                                  <Radio value="week" isInvalid={false} isDisabled={false}>
                                    <RadioIndicator>
                                      <RadioIcon as={ChevronLeftIcon}></RadioIcon>
                                    </RadioIndicator>
                                    <RadioLabel>Week</RadioLabel>
                                  </Radio>
                                  <Radio value="month" isInvalid={false} isDisabled={false}>
                                    <RadioIndicator>
                                      <RadioIcon as={ChevronLeftIcon}></RadioIcon>
                                    </RadioIndicator>
                                    <RadioLabel>Month</RadioLabel>
                                  </Radio>
                                  <Radio value="year" isInvalid={false} isDisabled={false}>
                                    <RadioIndicator>
                                      <RadioIcon as={ChevronLeftIcon}></RadioIcon>
                                    </RadioIndicator>
                                    <RadioLabel>Year</RadioLabel>
                                  </Radio>
                                  <Radio value="all" isInvalid={false} isDisabled={false}>
                                    <RadioIndicator>
                                      <RadioIcon as={ChevronLeftIcon}></RadioIcon>
                                    </RadioIndicator>
                                    <RadioLabel>All</RadioLabel>
                                  </Radio>
                                </HStack>
                              </RadioGroup>
                            </HStack>
                            <Heading size="xl">Workout Count: Week</Heading>
                            <AttachStep index={6}>
                            <VStack>
                            {
                              <LineChart
                              data={{
                                labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                                datasets: [{
                                  data: [1, 2, 0, 1, 1, 1, 1],
                                }],
                              }}
                              width={Dimensions.get('window').width - 85}
                              height={220}
                              yAxisLabel=""
                              yAxisSuffix=""
                              fromZero
                              chartConfig={{
                                backgroundColor: '#ffffff',
                                backgroundGradientFrom: '#ffffff',
                                backgroundGradientTo: '#ffffff',
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(111, 168, 220, ${opacity})`,
                                barPercentage: 0.95,
                                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                propsForLabels: {
                                  fontSize: 12,
                                },
                              }}
                              style={{
                                marginVertical: 8,
                              }}
                            />}
                            <Heading size="xl">Workout Minutes: Week</Heading>
                            {
                              <LineChart
                              data={{
                                labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                                datasets: [{
                                  data: [45, 101, 0, 77, 49, 56, 50],
                                }],
                              }}
                              width={Dimensions.get('window').width - 85}
                              height={220}
                              yAxisLabel=""
                              yAxisSuffix=""
                              fromZero
                              chartConfig={{
                                backgroundColor: '#ffffff',
                                backgroundGradientFrom: '#ffffff',
                                backgroundGradientTo: '#ffffff',
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(111, 168, 220, ${opacity})`,
                                barPercentage: 0.95,
                                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                propsForLabels: {
                                  fontSize: 12,
                                },
                              }}
                              style={{
                                marginVertical: 8,
                              }}
                            />}
                            </VStack>
                            </AttachStep>
                            <AttachStep index={7}>
                            <Card variant="outline">
                              <Heading className="mb-5" size="xl">Most Popular Exercises ⭐</Heading>
          
                              {popularExercises && popularExercises.slice(0, 4).map((favorite) => (
                                <Card className="mb-3" variant="filled" key={favorite.name}>
                                  <HStack space="md" className="justify-between">
                                    <Heading size="lg">{favorite.name}</Heading>
                                      <Icon as={InfoIcon} size="xl" />
                                  </HStack>
                                  <Heading size="md">Personal Best: {favorite.weight} {favorite.unit}</Heading>
                                  <Text size="md">You have done {favorite.count} sets of this exercise!</Text>
                                  <Box className="flex flex-row flex-wrap gap-2">
                                    {favorite.tags && favorite.tags.map((tag: string) => (
                                      <TagString key={tag} tag={tag} />
                                    ))}
                                  </Box>
                                </Card>
                              ))}
                                <Button>
                                  <ButtonText>Render more Exercises</ButtonText>
                                </Button>
                            </Card>
                            </AttachStep>
                          </Card>
                        </VStack>
                        <AttachStep index={8}>
                        <VStack>
                          <Heading size="2xl">Workout History</Heading>
                          <Card className="my-3" variant="outline">
          
                              {visibleWorkouts && visibleWorkouts.map((post) => (
                                    <WorkoutHeader key={post.id} dateTime={post.date} duration={post.duration}></WorkoutHeader>
                              ))}
                          </Card>
                            <Button>
                              <ButtonText>{'Render more workouts'}</ButtonText>
                            </Button>
                        </VStack>
                        </AttachStep>
                          <Heading size="2xl">Post History</Heading>
                          <AttachStep index={9}>
                          <Card variant="outline">
                              {visiblePosts && visiblePosts.map((post) => (
                                  <TutorialWorkoutPost
                                      key={post.id}
                                      username={post.username || "Unknown user"}
                                      name={post.name || "Unkown user"}
                                      avatar={demoProfile.avatar}
                                      date={post.date}
                                      title={post.title || ""}
                                      description={post.description || ""}
                                      exercises={post.exercises}
                                      imageUrls={post.images || undefined}
                                      isOwnPost={true}
                                      taggedFriends={post.taggedFriends}
                                  />
                              ))}
                          </Card>
                          </AttachStep>
                          <AttachStep index={10}>
                              <Button>
                                  <ButtonText>{'Render more posts'}</ButtonText>
                              </Button>
                          </AttachStep>
                      </VStack>
                  </View>


            </VStack>
            </View>
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
  }
});
