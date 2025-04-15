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
import { useRouter } from "expo-router";
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
import { ReactNode, useEffect, useState } from "react";
import { useToast } from "@/components/ui/toast";
import {
  showErrorToast,
  showSuccessToast,
  showFollowToast,
} from "@/services/toastServices";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import * as ImagePicker from "expo-image-picker";
import { Badge, BadgeText, BadgeIcon } from "@/components/ui/badge";
import { View, StyleSheet, Dimensions } from "react-native";
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
import { Popover, PopoverArrow, PopoverBackdrop, PopoverBody, PopoverContent } from "@/components/ui/popover";
import { Modal, ModalBackdrop, ModalCloseButton, ModalContent, ModalHeader, ModalBody } from "@/components/ui/modal";
import ExerciseCard from "@/components/forms/workout-template/ExerciseCard";
import Tag, { TagString } from "@/components/Tag";
import { Tables } from "@/types/database.types";
import { Ionicons } from "@expo/vector-icons";
import { LineChart, BarChart } from 'react-native-chart-kit';
import { WorkoutPost } from "@/components/WorkoutPost";
import { TutorialWorkoutPost } from "@/components/tutorial/TutorialWorkoutPost";
import { WorkoutHeader } from "@/components/WorkoutData";

export default function TutorialProfileScreen1() {

  const demoProfile = {  //Every empty string is an unused element for this tutorial page
    id: "",
    user_id: "",
    username: "jkova",
    name: "John Kova",
    avatar: "",
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
    icon: "",
    goal: "Jesse, we need to lift. I am the one who benches.",
    title: "Breaking Benches",
  }] as GroupOverview[];

  const favoriteExercises = [{ //TODO get 4 of these
    created_at: "",
    details: null,
    id: "",
    name: "Pull ups",
    tags: ["Back", "Biceps", "Lats", "Forearms", "Grip"],
    favorited: true
  },
  {
    created_at: "",
    details: null,
    id: "",
    name: "Front Squat",
    tags: ["Legs", "Core", "Glutes", "Quadriceps"],
    favorited: true
  }]

  const popularExercises = [{
    name: "pull ups",
    weight: 15,
    unit: "lbs",
    count: 134,
    tags: ["Back", "Biceps", "Lats", "Forearms", "Grip"],
  }];

  const visiblePosts = [{
    id: "p1",
    username: "jkova",
    name: "John Kova",
    avatar: "",
    date: "Apr 11, 2025",
    title: "Crazy Ford Protein Hamburger",
    description: "Be sure to try out the new CRAZY protein hamburger from Ford Dining Court.",
    exercises: [],
    images: [],
    isOwnPost: true,
    taggedFriends: []
  }]

  const visibleWorkouts = [{
    id: "w1",
    date: "Apr 11th 2025",
    duration: "56 Min"
  }]

  const mySteps: TourStep[] = [
    {
      // Configuration for first step
      floatingProps: {
        middleware: [offset(10), shift(), flip()],
        placement: "bottom",
      },
      render: ({ next, previous }) => (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>This is your profile page</Text>
            <View style={styles.buttonContainer}>
            <Button onPress={previous} action='kova'>
              <ButtonText size='lg'>Previous</ButtonText>
            </Button>
            <View style={styles.buttonSpacer} />
            <Button onPress={next} action='kova'>
              <ButtonText size='lg'>Next</ButtonText>
            </Button>
          </View>
        </View>
      )
    },
    {
      // Configuration for second step
      render: ({previous, next}) => {
        // Using the hook inside the step component
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
              <Button onPress={() => {next(); setScrollPosition(2)}} action='kova'>
                <ButtonText size='lg'>Stop</ButtonText>
              </Button>
            </View>
          </View>
        );
      }
    }
  ];

  const [renderPopover, setRenderPopover] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  const router = useRouter();

  useEffect(() => {
    // Short timeout to ensure component is fully mounted
    const timer = setTimeout(() => {
      setScrollPosition(0);
      setRenderPopover(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

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
        <Container className="flex px-6 py-16">
          {scrollPosition == 0 && (
            <Modal
              isOpen={renderPopover}
              onClose={() => setRenderPopover(false)}
              size="md"
              closeOnOverlayClick
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
              </ModalBody>
            </ModalContent>
          </Modal>)}

              <VStack space="3xl">
              {scrollPosition == 0 ? (
                <Box className="border-b border-gray-300 pb-2">
                <VStack space="lg">
                  <AttachStep index={0}>
                  <HStack space="md">
                    <Avatar className="bg-indigo-600 mt-1" size="xl">
                      <AvatarFallbackText className="text-white">
                        {demoProfile.name}
                      </AvatarFallbackText>
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
                      <Icon
                        as={MenuIcon}
                        size="xl"
                        className="mt-8 ml-8 w-8 h-8"
                      ></Icon>
                    </Button>
                  </HStack>
                  </AttachStep>
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
                          <Heading size="md">{demoProfile.weight}</Heading>
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
              </Box>) : (<></>)}

              {(scrollPosition == 0 || scrollPosition == 1) && (<VStack space="sm">
                <Heading>Your Groups</Heading>
                <VStack space="md">
                  {groups.map((group) => (    //inlining group component for the tutorial
                    <Card key={group.title} variant="outline">
                      <HStack space="2xl">
                        <Avatar className="bg-indigo-600" size="md">
                          <AvatarFallbackText className="text-white">{group.title[0]}</AvatarFallbackText>
                        </Avatar>
                        <VStack>
                          <Heading size="md">{group.title}</Heading>
                          <Text>{group.goal}</Text>
                        </VStack>
                      </HStack>
                    </Card>
                  ))}
                </VStack>
              </VStack>)}


            {scrollPosition == 1 && /* Inline a lot of components */(
              <VStack space="md">
                <HStack className="items-center justify-between">
                  <Heading size="2xl">Favorite Exercises</Heading>
                  <Button variant="link">
                    <ButtonText>View All</ButtonText>
                    <ButtonIcon as={ArrowRightIcon} />
                  </Button>
                </HStack>
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
              </VStack>
            )}

            {scrollPosition == 2 && (
                      <View className="mb-10">
                      <VStack space="2xl">
                        <VStack space="sm">
                          <Heading size="2xl">Profile Summary</Heading>
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
                            {
                              <LineChart
                              data={{
                                labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                                datasets: [{
                                  data: [1, 1, 0, 1, 1, 1, 2],
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
                                  data: [45, 50, 0, 77, 49, 56, 101],
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
                          </Card>
                        </VStack>
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
                          <Heading size="2xl">Post History</Heading>
                          <Card variant="outline">
                              {visiblePosts && visiblePosts.map((post) => (
                                  <TutorialWorkoutPost
                                      key={post.id}
                                      username={post.username || "Unknown user"}
                                      name={post.name || "Unkown user"}
                                      avatar={post.avatar}
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
                              <Button>
                                  <ButtonText>{'Render more posts'}</ButtonText>
                              </Button>
                      </VStack>
                  </View>
            )}


            </VStack>
            <AttachStep index={1}>
              <Card className="py-24">
              <Text>Bottom Bar</Text>
              </Card>
            </AttachStep>
          </Container>
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
